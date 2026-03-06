import { NextRequest, NextResponse } from "next/server"
import { getAdminDb } from "@/lib/firebase/admin"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
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
