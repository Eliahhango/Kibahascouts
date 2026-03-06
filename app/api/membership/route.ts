import { NextRequest, NextResponse } from "next/server"
import { getAdminDb } from "@/lib/firebase/admin"

export const runtime = "nodejs"

const membershipRateLimits = new Map<string, { count: number; resetAt: number }>()
const MEMBERSHIP_RATE_LIMIT_MAX = 5
const MEMBERSHIP_RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000

function getClientIp(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for")
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown"
  }

  return request.headers.get("x-real-ip") || "unknown"
}

function isRateLimited(ip: string) {
  const now = Date.now()
  const current = membershipRateLimits.get(ip)

  if (!current || current.resetAt <= now) {
    membershipRateLimits.set(ip, {
      count: 1,
      resetAt: now + MEMBERSHIP_RATE_LIMIT_WINDOW_MS,
    })
    return false
  }

  if (current.count >= MEMBERSHIP_RATE_LIMIT_MAX) {
    return true
  }

  current.count += 1
  membershipRateLimits.set(ip, current)
  return false
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request)
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { ok: false, error: "Too many requests. Please try again later." },
      { status: 429 },
    )
  }

  try {
    const body = await request.json()
    const { fullName, age, parentName, parentPhone, parentEmail, ward, unitType, role, message, honeypot } = body || {}

    if (typeof honeypot === "string" && honeypot.trim()) {
      return NextResponse.json({ ok: false, error: "Rejected." }, { status: 400 })
    }

    const fullNameValue = String(fullName || "").trim()
    const parentPhoneValue = String(parentPhone || "").trim()
    const wardValue = String(ward || "").trim()

    if (!fullNameValue || !parentPhoneValue || !wardValue) {
      return NextResponse.json({ ok: false, error: "Please fill in all required fields." }, { status: 400 })
    }

    await getAdminDb().collection("membershipApplications").add({
      fullName: fullNameValue,
      age: String(age || "").trim(),
      parentName: String(parentName || "").trim(),
      parentPhone: parentPhoneValue,
      parentEmail: String(parentEmail || "").trim(),
      ward: wardValue,
      unitType: String(unitType || "").trim(),
      role: role === "volunteer" ? "volunteer" : "youth",
      message: String(message || "").trim(),
      status: "pending",
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })

    return NextResponse.json({ ok: true, message: "Application received! We will contact you soon." })
  } catch {
    return NextResponse.json(
      { ok: false, error: "Could not submit application. Please try again." },
      { status: 500 },
    )
  }
}
