import { NextResponse } from "next/server"
import { assertAdminRequest } from "@/app/api/admin/_utils"
import { purgeExpiredAdminSessions } from "@/lib/auth/admin-session-store"

export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    await assertAdminRequest(request, "admins:manage")
    const count = await purgeExpiredAdminSessions()
    return NextResponse.json({ ok: true, purged: count })
  } catch (error) {
    return NextResponse.json({ ok: false, error: "Purge failed." }, { status: 500 })
  }
}
