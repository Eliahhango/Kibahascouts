import { NextResponse } from "next/server"
import { assertAdminRequest, toApiErrorResponse } from "../_utils"

export const runtime = "nodejs"

type MembershipStatus = "pending" | "approved" | "rejected"
type MembershipRole = "youth" | "volunteer"

function normalizeStatus(value: unknown): MembershipStatus {
  if (value === "approved" || value === "rejected") {
    return value
  }
  return "pending"
}

function normalizeRole(value: unknown): MembershipRole {
  if (value === "volunteer") {
    return "volunteer"
  }
  return "youth"
}

export async function GET(request: Request) {
  try {
    await assertAdminRequest(request, "messages:read")
    const { getAdminDb } = await import("@/lib/firebase/admin")
    const db = getAdminDb()

    const snapshot = await db
      .collection("membershipApplications")
      .orderBy("submittedAt", "desc")
      .get()
      .catch(() => db.collection("membershipApplications").get())

    const data = snapshot.docs
      .map((doc) => {
        const raw = doc.data() as Record<string, unknown>
        return {
          id: doc.id,
          fullName: String(raw.fullName || ""),
          age: String(raw.age || ""),
          parentName: String(raw.parentName || ""),
          parentPhone: String(raw.parentPhone || ""),
          parentEmail: String(raw.parentEmail || ""),
          ward: String(raw.ward || ""),
          unitType: String(raw.unitType || ""),
          role: normalizeRole(raw.role),
          message: String(raw.message || ""),
          status: normalizeStatus(raw.status),
          submittedAt: String(raw.submittedAt || ""),
          updatedAt: String(raw.updatedAt || ""),
        }
      })
      .sort((a, b) => +new Date(b.submittedAt || 0) - +new Date(a.submittedAt || 0))

    return NextResponse.json({ ok: true, data })
  } catch (error) {
    return toApiErrorResponse(error, "Failed to list membership applications")
  }
}
