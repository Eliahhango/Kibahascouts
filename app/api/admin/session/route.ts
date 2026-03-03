import { NextResponse } from "next/server"
import { z } from "zod"
import { createTrackedAdminSession, getTrackedAdminSession } from "@/lib/auth/admin-session-store"
import { getAdminUserByEmail, markAdminLogin } from "@/lib/auth/admin-users"
import { CsrfValidationError, verifyCsrfRequest } from "@/lib/auth/csrf"
import { AdminAuthError, readCookieFromHeader, requireAdminFromRequest } from "@/lib/auth/require-admin"
import { getAdminSessionCookieName, getAdminSessionExpiresInMs, getAdminSessionMaxAgeSeconds } from "@/lib/auth/session-cookie"
import { serverEnv } from "@/lib/env/server"
import { logAuthEvent } from "@/lib/security/audit-log"
import { checkLoginAttemptLimit, clearLoginAttempts, recordFailedLoginAttempt } from "@/lib/security/login-attempts"
import { getRequestIp, getRequestPath, getRequestUserAgent } from "@/lib/security/request-context"

export const runtime = "nodejs"

const SessionRequestSchema = z.object({
  idToken: z.string().min(1, "ID token is required"),
  mode: z.enum(["login", "refresh"]).optional().default("login"),
})

function toMinutes(seconds: number) {
  return Math.max(1, Math.ceil(seconds / 60))
}

function buildSessionResponse(params: { email: string; role: string; expiresAt: string }) {
  return {
    ok: true,
    data: {
      email: params.email,
      role: params.role,
      expiresAt: params.expiresAt,
      refreshBeforeMinutes: serverEnv.ADMIN_SESSION_REFRESH_BEFORE_MINUTES,
    },
  }
}

export async function GET(request: Request) {
  try {
    const admin = await requireAdminFromRequest(request, "dashboard:view")
    const sessionCookieName = getAdminSessionCookieName()
    const sessionCookie = readCookieFromHeader(request.headers.get("cookie"), sessionCookieName)
    const trackedSession = sessionCookie ? await getTrackedAdminSession(sessionCookie) : null
    const expiresAt = trackedSession?.expiresAt || new Date(admin.token.exp * 1000).toISOString()
    const minutesRemaining = Math.max(0, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 60_000))

    return NextResponse.json({
      ok: true,
      data: {
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions,
        expiresAt,
        minutesRemaining,
        refreshBeforeMinutes: serverEnv.ADMIN_SESSION_REFRESH_BEFORE_MINUTES,
      },
    })
  } catch (error) {
    const status = error instanceof AdminAuthError ? error.status : error instanceof CsrfValidationError ? error.status : 500
    const message = error instanceof AdminAuthError ? error.message : "Unable to read admin session."
    return NextResponse.json({ ok: false, error: message }, { status })
  }
}

export async function POST(request: Request) {
  const ip = getRequestIp(request)
  const userAgent = getRequestUserAgent(request)
  const path = getRequestPath(request)
  let attemptedEmail = ""
  let mode: "login" | "refresh" = "login"

  try {
    verifyCsrfRequest(request)
    const rawBody = await request.json().catch(() => null)
    const parsedBody = SessionRequestSchema.safeParse(rawBody)

    if (!parsedBody.success) {
      return NextResponse.json(
        {
          ok: false,
          error: "Invalid login payload.",
        },
        { status: 400 },
      )
    }

    mode = parsedBody.data.mode
    const sessionCookieName = getAdminSessionCookieName()
    const previousSessionCookie = readCookieFromHeader(request.headers.get("cookie"), sessionCookieName)

    if (mode === "refresh") {
      await requireAdminFromRequest(request, "dashboard:view")
    }

    const { getAdminAuth } = await import("@/lib/firebase/admin")
    const adminAuth = getAdminAuth()
    const decodedToken = await adminAuth.verifyIdToken(parsedBody.data.idToken)
    const email = decodedToken.email?.toLowerCase()
    attemptedEmail = email || ""

    if (!email) {
      await logAuthEvent({
        outcome: "failure",
        ip,
        userAgent,
        method: request.method,
        path,
        status: 400,
        reason: "missing_email_claim",
      })
      return NextResponse.json({ ok: false, error: "Unable to determine account email." }, { status: 400 })
    }

    if (mode === "login") {
      const limitResult = await checkLoginAttemptLimit(email, ip)
      if (!limitResult.allowed) {
        const retryMinutes = toMinutes(limitResult.retryAfterSeconds)
        await logAuthEvent({
          outcome: "failure",
          email,
          uid: decodedToken.uid,
          ip,
          userAgent,
          method: request.method,
          path,
          status: 429,
          reason: "too_many_login_attempts",
          metadata: { retryAfterSeconds: limitResult.retryAfterSeconds },
        })

        return NextResponse.json(
          {
            ok: false,
            error: `Too many login attempts - try again in ${retryMinutes} minute${retryMinutes === 1 ? "" : "s"}.`,
            retryAfterSeconds: limitResult.retryAfterSeconds,
          },
          {
            status: 429,
            headers: {
              "Retry-After": String(limitResult.retryAfterSeconds),
            },
          },
        )
      }
    }

    const adminUser = await getAdminUserByEmail(email)
    if (!adminUser || !adminUser.active) {
      const failureState = await recordFailedLoginAttempt(email, ip, "email_not_allowlisted")
      await logAuthEvent({
        outcome: "failure",
        email,
        uid: decodedToken.uid,
        ip,
        userAgent,
        method: request.method,
        path,
        status: 403,
        reason: "email_not_allowlisted",
        metadata: { retryAfterSeconds: failureState.retryAfterSeconds },
      })

      return NextResponse.json(
        {
          ok: false,
          error: "Email not found in admin allowlist.",
        },
        { status: 403 },
      )
    }

    const expiresIn = getAdminSessionExpiresInMs()
    const sessionCookie = await adminAuth.createSessionCookie(parsedBody.data.idToken, { expiresIn })
    const expiresAt = new Date(Date.now() + expiresIn).toISOString()

    await createTrackedAdminSession({
      sessionCookie,
      uid: decodedToken.uid,
      email: adminUser.email,
      role: adminUser.role,
      expiresAt,
      request,
      previousSessionCookie,
    })

    await markAdminLogin(adminUser.email, ip)
    await clearLoginAttempts(adminUser.email, ip)

    await logAuthEvent({
      outcome: "success",
      email: adminUser.email,
      uid: decodedToken.uid,
      ip,
      userAgent,
      method: request.method,
      path,
      status: 200,
      reason: mode === "refresh" ? "session_refreshed" : "session_created",
      metadata: { role: adminUser.role },
    })

    const response = NextResponse.json(buildSessionResponse({ email: adminUser.email, role: adminUser.role, expiresAt }))
    response.cookies.set({
      name: sessionCookieName,
      value: sessionCookie,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: getAdminSessionMaxAgeSeconds(),
    })

    return response
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to sign in. Please try again."
    const status = error instanceof AdminAuthError ? error.status : 500

    if (attemptedEmail && mode === "login") {
      await recordFailedLoginAttempt(attemptedEmail, ip, message)
    }

    await logAuthEvent({
      outcome: "failure",
      email: attemptedEmail || undefined,
      ip,
      userAgent,
      method: request.method,
      path,
      status,
      reason: mode === "refresh" ? "refresh_failed" : message,
    })

    return NextResponse.json(
      {
        ok: false,
        error: mode === "refresh" ? "Unable to refresh admin session." : "Unable to sign in. Please try again.",
      },
      { status },
    )
  }
}
