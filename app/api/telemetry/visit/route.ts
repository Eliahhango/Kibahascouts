import { NextResponse } from "next/server"
import { z } from "zod"
import { getRequestIp, getRequestUserAgent } from "@/lib/security/request-context"

export const runtime = "nodejs"

const payloadSchema = z.object({
  path: z.string().trim().min(1).max(300),
  search: z.string().trim().max(600).optional().default(""),
  referrer: z.string().trim().max(1000).optional().default(""),
  visitorId: z.string().trim().max(120).optional().default(""),
})

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
  } catch {
    return NextResponse.json({ ok: true })
  }
}
