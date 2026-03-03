import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { serverEnv } from "@/lib/env/server"

export const runtime = "nodejs"

const contactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name.").max(120),
  email: z.string().trim().email("Please enter a valid email address.").max(160),
  subject: z.string().trim().min(3, "Please enter a subject.").max(140),
  message: z.string().trim().min(20, "Message must be at least 20 characters.").max(3000),
  website: z.string().trim().optional().default(""),
})

type ContactPayload = z.infer<typeof contactSchema>
type RateEntry = { count: number; resetAt: number }
type PersistPayload = ContactPayload & { ip: string; userAgent: string }

const rateLimitStore = new Map<string, RateEntry>()
const RATE_LIMIT_WINDOW_MS = serverEnv.CONTACT_FORM_RATE_LIMIT_WINDOW_MS
const RATE_LIMIT_MAX = serverEnv.CONTACT_FORM_RATE_LIMIT_MAX

function getClientIp(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for")
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() ?? "unknown"
  }

  return request.headers.get("x-real-ip") ?? "unknown"
}

function checkRateLimit(ip: string) {
  const now = Date.now()

  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetAt <= now) {
      rateLimitStore.delete(key)
    }
  }

  const current = rateLimitStore.get(ip)
  if (!current || current.resetAt <= now) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return { allowed: true, retryAfterSeconds: 0 }
  }

  if (current.count >= RATE_LIMIT_MAX) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
    }
  }

  rateLimitStore.set(ip, { ...current, count: current.count + 1 })
  return { allowed: true, retryAfterSeconds: 0 }
}

async function persistContactMessage(payload: PersistPayload) {
  const { getAdminDb } = await import("@/lib/firebase/admin")

  await getAdminDb().collection("contactMessages").add({
    name: payload.name,
    email: payload.email,
    subject: payload.subject,
    message: payload.message,
    ip: payload.ip,
    userAgent: payload.userAgent,
    status: "unread",
    createdAt: new Date().toISOString(),
  })
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request)
  const limitResult = checkRateLimit(ip)

  if (!limitResult.allowed) {
    return NextResponse.json(
      {
        ok: false,
        error: "Too many submissions. Please try again later.",
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(limitResult.retryAfterSeconds),
        },
      },
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid request payload." },
      { status: 400 },
    )
  }

  const parsed = contactSchema.safeParse(body)
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0]
    return NextResponse.json(
      {
        ok: false,
        error: firstIssue?.message ?? "Invalid form input.",
      },
      { status: 400 },
    )
  }

  const payload = parsed.data

  if (payload.website) {
    return NextResponse.json({ ok: true, message: "Submitted." }, { status: 200 })
  }

  try {
    await persistContactMessage({
      ...payload,
      ip,
      userAgent: request.headers.get("user-agent") ?? "unknown",
    })

    return NextResponse.json({ ok: true, message: "Message received. We will respond soon." }, { status: 201 })
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: "Message could not be processed at this time. Please try again later.",
      },
      { status: 503 },
    )
  }
}
