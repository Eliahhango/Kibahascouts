import { NextResponse } from "next/server"
import { z } from "zod"
import { getRequestIp, getRequestUserAgent } from "@/lib/security/request-context"

export const runtime = "nodejs"

const telemetryRateLimits = new Map<string, { count: number; resetAt: number }>()
const TELEMETRY_RATE_LIMIT_MAX = 10
const TELEMETRY_RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000

const payloadSchema = z.object({
  path: z.string().trim().min(1).max(300),
  search: z.string().trim().max(600).optional().default(""),
  referrer: z.string().trim().max(1000).optional().default(""),
  visitorId: z.string().trim().max(120).optional().default(""),
})

function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for")
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown"
  }

  return request.headers.get("x-real-ip") || "unknown"
}

function isRateLimited(ip: string) {
  const now = Date.now()
  const current = telemetryRateLimits.get(ip)

  if (!current || current.resetAt <= now) {
    telemetryRateLimits.set(ip, {
      count: 1,
      resetAt: now + TELEMETRY_RATE_LIMIT_WINDOW_MS,
    })
    return false
  }

  if (current.count >= TELEMETRY_RATE_LIMIT_MAX) {
    return true
  }

  current.count += 1
  telemetryRateLimits.set(ip, current)
  return false
}

function shouldIgnorePath(path: string) {
  return (
    path.startsWith("/api") ||
    path.startsWith("/admin") ||
    path.startsWith("/_next") ||
    path.startsWith("/favicon") ||
    path.startsWith("/icon")
  )
}

export async function POST(request: Request) {
  const ip = getClientIp(request)
  if (isRateLimited(ip)) {
    return NextResponse.json({ ok: false, error: "Too many requests." }, { status: 429 })
  }

  try {
    const rawBody = await request.json().catch(() => null)
    const parsedBody = payloadSchema.safeParse(rawBody)

    if (!parsedBody.success) {
      return NextResponse.json({ ok: false, error: "Invalid visitor payload." }, { status: 400 })
    }

    if (shouldIgnorePath(parsedBody.data.path)) {
      return NextResponse.json({ ok: true, ignored: true })
    }

    const { getAdminDb } = await import("@/lib/firebase/admin")
    await getAdminDb().collection("siteVisitorLogs").add({
      path: parsedBody.data.path,
      search: parsedBody.data.search,
      referrer: parsedBody.data.referrer,
      visitorId: parsedBody.data.visitorId,
      ip: getRequestIp(request),
      userAgent: getRequestUserAgent(request),
      createdAt: new Date().toISOString(),
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("[telemetry/visit] Write failed:", error)
    return NextResponse.json({ ok: false, error: "Internal error." }, { status: 500 })
  }
}
