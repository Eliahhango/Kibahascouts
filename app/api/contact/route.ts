import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

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

const rateLimitStore = new Map<string, RateEntry>()
const RATE_LIMIT_WINDOW_MS = Number(process.env.CONTACT_FORM_RATE_LIMIT_WINDOW_MS ?? 15 * 60 * 1000)
const RATE_LIMIT_MAX = Number(process.env.CONTACT_FORM_RATE_LIMIT_MAX ?? 5)

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

async function sendWithResend(payload: ContactPayload) {
  const apiKey = process.env.RESEND_API_KEY
  const emailFrom = process.env.CONTACT_EMAIL_FROM
  const emailTo = process.env.CONTACT_EMAIL_TO

  if (!apiKey || !emailFrom || !emailTo) {
    return {
      ok: false as const,
      code: "missing_email_config" as const,
      message: "Contact form email is not configured.",
    }
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: emailFrom,
      to: [emailTo],
      reply_to: payload.email,
      subject: `[Website Contact] ${payload.subject}`,
      text: [
        `Name: ${payload.name}`,
        `Email: ${payload.email}`,
        `Subject: ${payload.subject}`,
        "",
        payload.message,
      ].join("\n"),
    }),
  })

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "")
    return {
      ok: false as const,
      code: "email_send_failed" as const,
      message: `Failed to send email via Resend (${response.status}).`,
      detail: errorBody,
    }
  }

  return { ok: true as const }
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
    const sendResult = await sendWithResend(payload)

    if (!sendResult.ok) {
      const fallbackEmail = process.env.CONTACT_EMAIL_TO || "[CONFIRM CONTACT EMAIL]"
      return NextResponse.json(
        {
          ok: false,
          error: "Message could not be delivered at the moment.",
          fallbackEmail,
          reason: sendResult.code,
        },
        { status: 503 },
      )
    }

    return NextResponse.json({ ok: true, message: "Message sent successfully." }, { status: 200 })
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: "Unexpected server error while sending your message.",
      },
      { status: 500 },
    )
  }
}
