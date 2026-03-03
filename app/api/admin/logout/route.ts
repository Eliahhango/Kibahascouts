import { NextResponse } from "next/server"
import { assertAdminMutationRequest, toApiErrorResponse } from "../_utils"
import { revokeTrackedAdminSession } from "@/lib/auth/admin-session-store"
import { readCookieFromHeader } from "@/lib/auth/require-admin"
import { getAdminSessionCookieName } from "@/lib/auth/session-cookie"
import { logAuthEvent } from "@/lib/security/audit-log"
import { getRequestIp, getRequestPath, getRequestUserAgent } from "@/lib/security/request-context"

export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    const admin = await assertAdminMutationRequest(request, "dashboard:view")
    const sessionCookieName = getAdminSessionCookieName()
    const sessionCookie = readCookieFromHeader(request.headers.get("cookie"), sessionCookieName)

    if (sessionCookie) {
      await revokeTrackedAdminSession(sessionCookie, "logout")
    }

    await logAuthEvent({
      outcome: "success",
      email: admin.email,
      uid: admin.uid,
      ip: getRequestIp(request),
      userAgent: getRequestUserAgent(request),
      method: request.method,
      path: getRequestPath(request),
      status: 200,
      reason: "logout",
    })

    const response = NextResponse.json({ ok: true })
    response.cookies.set({
      name: sessionCookieName,
      value: "",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    })
    return response
  } catch (error) {
    return toApiErrorResponse(error, "Failed to log out admin session")
  }
}
