import { NextResponse } from "next/server"
import { assertAdminRequest, toApiErrorResponse } from "../_utils"

export const runtime = "nodejs"

type MessageStatus = "unread" | "read" | "replied"

function normalizeStatus(value: unknown): MessageStatus {
  if (value === "read" || value === "replied") {
    return value
  }
  return "unread"
}

export async function GET(request: Request) {
  try {
    await assertAdminRequest(request)
    const { getAdminDb } = await import("@/lib/firebase/admin")
    const snapshot = await getAdminDb().collection("contactMessages").get()

    const data = snapshot.docs
      .map((doc) => {
        const raw = doc.data() as Record<string, unknown>
        return {
          id: doc.id,
          name: String(raw.name || ""),
          email: String(raw.email || ""),
          subject: String(raw.subject || ""),
          message: String(raw.message || ""),
          ip: String(raw.ip || ""),
          userAgent: String(raw.userAgent || ""),
          createdAt: String(raw.createdAt || ""),
          status: normalizeStatus(raw.status),
        }
      })
      .sort((a, b) => +new Date(b.createdAt || 0) - +new Date(a.createdAt || 0))

    return NextResponse.json({ ok: true, data })
  } catch (error) {
    return toApiErrorResponse(error, "Failed to list messages")
  }
}
