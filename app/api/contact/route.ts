import { NextRequest, NextResponse } from "next/server"
import { createHash } from "node:crypto"
import { Timestamp } from "firebase-admin/firestore"
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
type PersistPayload = ContactPayload & { ip: string; userAgent: string }

const RATE_LIMIT_WINDOW_MS = serverEnv.CONTACT_FORM_RATE_LIMIT_WINDOW_MS
const RATE_LIMIT_MAX = serverEnv.CONTACT_FORM_RATE_LIMIT_MAX

function getClientIp(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for")
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() ?? "unknown"
  }

  return request.headers.get("x-real-ip") ?? "unknown"
}

function getRateLimitDocId(ip: string) {
  return createHash("sha256").update(ip).digest("hex")
}

async function checkRateLimit(ip: string) {
  const { getAdminDb } = await import("@/lib/firebase/admin")
  const db = getAdminDb()
  const nowMs = Date.now()
  const nextResetAt = Timestamp.fromMillis(nowMs + RATE_LIMIT_WINDOW_MS)
  const docRef = db.collection("contactRateLimits").doc(getRateLimitDocId(ip))

  return db.runTransaction(async (transaction) => {
    const doc = await transaction.get(docRef)
    const data = (doc.data() || {}) as {
      count?: number
      resetAt?: Timestamp | number | Date
    }

    const resetAtMs =
      data.resetAt instanceof Timestamp
        ? data.resetAt.toMillis()
        : typeof data.resetAt === "number"
          ? data.resetAt
          : data.resetAt instanceof Date
            ? data.resetAt.getTime()
            : 0

    const currentCount = typeof data.count === "number" ? data.count : 0

    if (!doc.exists || resetAtMs <= nowMs) {
      transaction.set(
        docRef,
        {
          count: 1,
          resetAt: nextResetAt,
          updatedAt: Timestamp.now(),
        },
        { merge: true },
      )
      return { allowed: true, retryAfterSeconds: 0 }
    }

    if (currentCount >= RATE_LIMIT_MAX) {
      return {
        allowed: false,
        retryAfterSeconds: Math.max(1, Math.ceil((resetAtMs - nowMs) / 1000)),
      }
    }

    transaction.set(
      docRef,
      {
        count: currentCount + 1,
        resetAt: data.resetAt instanceof Timestamp ? data.resetAt : nextResetAt,
        updatedAt: Timestamp.now(),
      },
      { merge: true },
    )

    return { allowed: true, retryAfterSeconds: 0 }
  })
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
  let limitResult: { allowed: boolean; retryAfterSeconds: number }
  try {
    limitResult = await checkRateLimit(ip)
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: "Message could not be processed at this time. Please try again later.",
      },
      { status: 503 },
    )
  }

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
