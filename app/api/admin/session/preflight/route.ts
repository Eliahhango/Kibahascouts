import { NextResponse } from "next/server"
import { z } from "zod"
import { getAdminUserByEmail, isApprovedAdmin, normalizeAdminEmail } from "@/lib/auth/admin-users"
import { CsrfValidationError, verifyCsrfRequest } from "@/lib/auth/csrf"
import { resolveBlockingRule } from "@/lib/security/admin-blocks"
import { logAuthEvent } from "@/lib/security/audit-log"
import { checkLoginAttemptLimit, clearLoginAttempts, recordFailedLoginAttempt } from "@/lib/security/login-attempts"
import { getRequestIp, getRequestPath, getRequestUserAgent } from "@/lib/security/request-context"

export const runtime = "nodejs"

const PreflightSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address."),
  action: z.enum(["check", "failure", "success"]).optional().default("check"),
  reason: z.string().trim().optional(),
})

function toMinutes(seconds: number) {
  return Math.max(1, Math.ceil(seconds / 60))
}

export async function POST(request: Request) {
  const ip = getRequestIp(request)
  const userAgent = getRequestUserAgent(request)
  const path = getRequestPath(request)

  try {
    verifyCsrfRequest(request)
    const rawBody = await request.json().catch(() => null)
    const parsedBody = PreflightSchema.safeParse(rawBody)

    if (!parsedBody.success) {
      return NextResponse.json(
        {
          ok: false,
          error: parsedBody.error.issues[0]?.message || "Invalid preflight payload.",
        },
        { status: 400 },
      )
    }

    const email = normalizeAdminEmail(parsedBody.data.email) || ""
    const action = parsedBody.data.action
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
        reason: "blocked_actor_preflight",
        metadata: { blockId: actorBlock.id, targetType: actorBlock.targetType, scope: actorBlock.scope },
      })

      return NextResponse.json({ ok: false, error: "This sign-in attempt is blocked by security policy." }, { status: 403 })
    }

    if (action === "success") {
      await clearLoginAttempts(email, ip)
      return NextResponse.json({ ok: true })
    }

    if (action === "failure") {
      const failureState = await recordFailedLoginAttempt(email, ip, parsedBody.data.reason || "invalid_credentials")
      await logAuthEvent({
        outcome: "failure",
        email,
        ip,
        userAgent,
        method: request.method,
        path,
        status: 401,
        reason: parsedBody.data.reason || "invalid_credentials",
      })

      if (failureState.attemptsRemaining <= 0) {
        const retryMinutes = toMinutes(failureState.retryAfterSeconds)
        return NextResponse.json(
          {
            ok: false,
            error: `Too many login attempts - try again in ${retryMinutes} minute${retryMinutes === 1 ? "" : "s"}.`,
            retryAfterSeconds: failureState.retryAfterSeconds,
          },
          {
            status: 429,
            headers: {
              "Retry-After": String(failureState.retryAfterSeconds),
            },
          },
        )
      }

      return NextResponse.json({
        ok: false,
        attemptsRemaining: failureState.attemptsRemaining,
      })
    }

    const limitResult = await checkLoginAttemptLimit(email, ip)
    if (!limitResult.allowed) {
      const retryMinutes = toMinutes(limitResult.retryAfterSeconds)
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

    const adminUser = await getAdminUserByEmail(email)
    if (!adminUser) {
      await logAuthEvent({
        outcome: "failure",
        email,
        ip,
        userAgent,
        method: request.method,
        path,
        status: 403,
        reason: "email_not_allowlisted",
      })
      return NextResponse.json({ ok: false, error: "Email not found in admin allowlist." }, { status: 403 })
    }

    if (!isApprovedAdmin(adminUser)) {
      const reason =
        adminUser.onboardingStatus === "pending" || adminUser.onboardingStatus === "invited"
          ? "admin_awaiting_approval_preflight"
          : "admin_access_revoked_preflight"

      await logAuthEvent({
        outcome: "failure",
        email,
        ip,
        userAgent,
        method: request.method,
        path,
        status: 403,
        reason,
        metadata: { onboardingStatus: adminUser.onboardingStatus, active: adminUser.active },
      })

      return NextResponse.json(
        {
          ok: false,
          error:
            adminUser.onboardingStatus === "pending" || adminUser.onboardingStatus === "invited"
              ? "Your admin account is awaiting approval."
              : "Your admin access has been revoked.",
        },
        { status: 403 },
      )
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    const status = error instanceof CsrfValidationError ? error.status : 500
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unable to validate login request.",
      },
      { status },
    )
  }
}
