import { NextResponse } from "next/server"
import { z } from "zod"
import { getAdminUserByEmail, isApprovedAdmin, normalizeAdminEmail } from "@/lib/auth/admin-users"
import { CsrfValidationError, verifyCsrfRequest } from "@/lib/auth/csrf"
import { buildAdminPasswordResetEmail } from "@/lib/email/admin-email-templates"
import { isTransactionalEmailConfigured, sendTransactionalEmail } from "@/lib/email/mailer"
import { resolveBlockingRule } from "@/lib/security/admin-blocks"
import { logAuthEvent } from "@/lib/security/audit-log"
import { getRequestIp, getRequestPath, getRequestUserAgent } from "@/lib/security/request-context"

export const runtime = "nodejs"

const PasswordResetSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address."),
})

class PasswordResetRequestError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = "PasswordResetRequestError"
    this.status = status
  }
}

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
    const parsedBody = PasswordResetSchema.safeParse(rawBody)

    if (!parsedBody.success) {
      return NextResponse.json(
        {
          ok: false,
          error: parsedBody.error.issues[0]?.message || "Invalid password reset payload.",
        },
        { status: 400 },
      )
    }

    const email = normalizeAdminEmail(parsedBody.data.email) || ""
    attemptedEmail = email

    const actorBlock = await resolveBlockingRule({ email, ip, scope: "admin_auth" })
    if (actorBlock) {
      throw new PasswordResetRequestError("This request is blocked by security policy.", 403)
    }

    const adminUser = await getAdminUserByEmail(email)
    if (!adminUser) {
      throw new PasswordResetRequestError("Email not found in admin allowlist.", 403)
    }

    if (!isApprovedAdmin(adminUser)) {
      throw new PasswordResetRequestError(
        adminUser.onboardingStatus === "pending" || adminUser.onboardingStatus === "invited"
          ? "Your admin account is awaiting approval."
          : "Your admin access has been revoked.",
        403,
      )
    }

    if (!isTransactionalEmailConfigured()) {
      throw new PasswordResetRequestError(
        "Password reset email service is not configured. Set RESEND_API_KEY and RESEND_FROM_EMAIL.",
        503,
      )
    }

    const { getAdminAuth } = await import("@/lib/firebase/admin")
    const adminAuth = getAdminAuth()

    try {
      const user = await adminAuth.getUserByEmail(email)
      if (user.disabled) {
        throw new PasswordResetRequestError("This account is disabled. Contact a super admin.", 403)
      }
    } catch (error) {
      if (error instanceof PasswordResetRequestError) {
        throw error
      }

      if (getErrorCode(error) === "auth/user-not-found") {
        throw new PasswordResetRequestError(
          "No password is set for this email yet. Use \"Set your password first\" to create your account.",
          409,
        )
      }

      throw error
    }

    const resetUrl = await adminAuth.generatePasswordResetLink(email)
    const template = buildAdminPasswordResetEmail({
      recipientEmail: email,
      resetUrl,
    })

    const sent = await sendTransactionalEmail({
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    })

    if (!sent.ok) {
      throw new PasswordResetRequestError(`Unable to send password reset email: ${sent.error}`, 502)
    }

    await logAuthEvent({
      outcome: "success",
      email,
      ip,
      userAgent,
      method: request.method,
      path,
      status: 200,
      reason: "password_reset_email_sent",
      metadata: { provider: sent.provider },
    })

    return NextResponse.json({
      ok: true,
      data: {
        provider: sent.provider,
      },
    })
  } catch (error) {
    const status =
      error instanceof PasswordResetRequestError
        ? error.status
        : error instanceof CsrfValidationError
          ? error.status
          : 500
    const message =
      error instanceof PasswordResetRequestError
        ? error.message
        : error instanceof CsrfValidationError
          ? error.message
          : "Unable to process password reset request."

    await logAuthEvent({
      outcome: "failure",
      email: attemptedEmail || undefined,
      ip,
      userAgent,
      method: request.method,
      path,
      status,
      reason: message,
    })

    return NextResponse.json(
      {
        ok: false,
        error: message,
      },
      { status },
    )
  }
}
