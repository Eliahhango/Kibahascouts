import { NextResponse } from "next/server"
import { z } from "zod"
import { getAdminUserByEmail, normalizeAdminEmail } from "@/lib/auth/admin-users"
import { CsrfValidationError, verifyCsrfRequest } from "@/lib/auth/csrf"
import { resolveBlockingRule } from "@/lib/security/admin-blocks"
import { logAuthEvent } from "@/lib/security/audit-log"
import { getRequestIp, getRequestPath, getRequestUserAgent } from "@/lib/security/request-context"

export const runtime = "nodejs"

const REGISTRATION_NOT_AVAILABLE_MESSAGE = "Registration not available."

const RegisterPreflightSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address."),
})

function getErrorCode(error: unknown) {
  if (typeof error === "object" && error && "code" in error) {
    return String((error as { code?: string }).code || "")
  }
  return ""
}

export async function POST(request: Request) {
  const ip = getRequestIp(request)
  const userAgent = getRequestUserAgent(request)
  const path = getRequestPath(request)
  let attemptedEmail = ""

  try {
    verifyCsrfRequest(request)
    const rawBody = await request.json().catch(() => null)
    const parsedBody = RegisterPreflightSchema.safeParse(rawBody)

    if (!parsedBody.success) {
      return NextResponse.json(
        {
          ok: false,
          error: parsedBody.error.issues[0]?.message || "Invalid registration payload.",
        },
        { status: 400 },
      )
    }

    const email = normalizeAdminEmail(parsedBody.data.email) || ""
    attemptedEmail = email

    const actorBlock = await resolveBlockingRule({ email, ip, scope: "admin_auth" })
    if (actorBlock) {
      await logAuthEvent({
        outcome: "failure",
        email,
        ip,
        userAgent,
        method: request.method,
        path,
        status: 403,
        reason: "blocked_actor_register_preflight",
        metadata: { blockId: actorBlock.id, targetType: actorBlock.targetType, scope: actorBlock.scope },
      })
      return NextResponse.json({ ok: false, error: REGISTRATION_NOT_AVAILABLE_MESSAGE }, { status: 403 })
    }

    const adminUser = await getAdminUserByEmail(email)
    if (!adminUser || !adminUser.active) {
      await logAuthEvent({
        outcome: "failure",
        email,
        ip,
        userAgent,
        method: request.method,
        path,
        status: 403,
        reason: "email_not_allowlisted_register",
      })
      return NextResponse.json({ ok: false, error: REGISTRATION_NOT_AVAILABLE_MESSAGE }, { status: 403 })
    }

    const { getAdminAuth } = await import("@/lib/firebase/admin")
    const adminAuth = getAdminAuth()

    try {
      const user = await adminAuth.getUserByEmail(email)

      if (user.disabled) {
        await logAuthEvent({
          outcome: "failure",
          email,
          uid: user.uid,
          ip,
          userAgent,
          method: request.method,
          path,
          status: 403,
          reason: "firebase_auth_user_disabled",
        })
        return NextResponse.json(
          { ok: false, error: REGISTRATION_NOT_AVAILABLE_MESSAGE },
          { status: 403 },
        )
      }

      await logAuthEvent({
        outcome: "success",
        email,
        uid: user.uid,
        ip,
        userAgent,
        method: request.method,
        path,
        status: 200,
        reason: "register_preflight_existing_account",
        metadata: { role: adminUser.role },
      })

      return NextResponse.json({
        ok: true,
        data: {
          email: adminUser.email,
          role: adminUser.role,
          registrationRequired: false,
        },
      })
    } catch (authLookupError) {
      const code = getErrorCode(authLookupError)
      if (code !== "auth/user-not-found") {
        throw authLookupError
      }
    }

    await logAuthEvent({
      outcome: "success",
      email,
      ip,
      userAgent,
      method: request.method,
      path,
      status: 200,
      reason: "register_preflight_eligible",
      metadata: { role: adminUser.role },
    })

    return NextResponse.json({
      ok: true,
      data: {
        email: adminUser.email,
        role: adminUser.role,
        registrationRequired: true,
      },
    })
  } catch (error) {
    const status = error instanceof CsrfValidationError ? error.status : 500

    await logAuthEvent({
      outcome: "failure",
      email: attemptedEmail || undefined,
      ip,
      userAgent,
      method: request.method,
      path,
      status,
      reason: error instanceof Error ? error.message : "register_preflight_failed",
    })

    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unable to validate admin registration request.",
      },
      { status },
    )
  }
}
