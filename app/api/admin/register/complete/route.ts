import { NextResponse } from "next/server"
import { z } from "zod"
import { markAdminInviteAccepted } from "@/lib/auth/admin-invites"
import { getAdminUserByEmail, updateAdminUser } from "@/lib/auth/admin-users"
import { CsrfValidationError, verifyCsrfRequest } from "@/lib/auth/csrf"
import { resolveBlockingRule } from "@/lib/security/admin-blocks"
import { logAuthEvent } from "@/lib/security/audit-log"
import { getRequestIp, getRequestPath, getRequestUserAgent } from "@/lib/security/request-context"

export const runtime = "nodejs"

const CompleteRegistrationSchema = z.object({
  idToken: z.string().min(1, "ID token is required."),
  inviteId: z.string().trim().min(12, "Invite ID is required."),
})

class RegistrationCompletionError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = "RegistrationCompletionError"
    this.status = status
  }
}

export async function POST(request: Request) {
  const ip = getRequestIp(request)
  const userAgent = getRequestUserAgent(request)
  const path = getRequestPath(request)
  let attemptedEmail = ""
  let attemptedUid = ""

  try {
    verifyCsrfRequest(request)
    const rawBody = await request.json().catch(() => null)
    const parsedBody = CompleteRegistrationSchema.safeParse(rawBody)

    if (!parsedBody.success) {
      return NextResponse.json(
        {
          ok: false,
          error: parsedBody.error.issues[0]?.message || "Invalid registration completion payload.",
        },
        { status: 400 },
      )
    }

    const { getAdminAuth } = await import("@/lib/firebase/admin")
    const adminAuth = getAdminAuth()
    const decodedToken = await adminAuth.verifyIdToken(parsedBody.data.idToken)
    const email = decodedToken.email?.trim().toLowerCase()
    const uid = decodedToken.uid
    attemptedEmail = email || ""
    attemptedUid = uid || ""

    if (!email || !uid) {
      throw new RegistrationCompletionError("Unable to validate account identity.", 400)
    }

    const actorBlock = await resolveBlockingRule({ email, ip, scope: "admin_auth" })
    if (actorBlock) {
      throw new RegistrationCompletionError("This registration attempt is blocked by security policy.", 403)
    }

    const adminUser = await getAdminUserByEmail(email)
    if (!adminUser) {
      throw new RegistrationCompletionError("Email not found in admin allowlist.", 403)
    }

    if (adminUser.onboardingStatus === "revoked" || adminUser.onboardingStatus === "deleted") {
      throw new RegistrationCompletionError("Registration is not available for this account.", 403)
    }

    try {
      await markAdminInviteAccepted({
        inviteId: parsedBody.data.inviteId,
        email,
        acceptedByUid: uid,
      })
    } catch (inviteError) {
      const inviteMessage = inviteError instanceof Error ? inviteError.message : "Invite is not valid."
      if (
        inviteMessage.includes("Invite not found") ||
        inviteMessage.includes("no longer valid") ||
        inviteMessage.includes("expired") ||
        inviteMessage.includes("does not match")
      ) {
        throw new RegistrationCompletionError("Invite is invalid or expired. Request a new invitation.", 403)
      }

      throw inviteError
    }

    await updateAdminUser(
      email,
      {
        onboardingStatus: "pending",
        active: false,
        uid,
        inviteId: parsedBody.data.inviteId,
        inviteAcceptedAt: new Date().toISOString(),
      },
      email,
    )

    await adminAuth.setCustomUserClaims(uid, null).catch(() => null)
    await adminAuth.revokeRefreshTokens(uid).catch(() => null)

    await logAuthEvent({
      outcome: "success",
      email,
      uid,
      ip,
      userAgent,
      method: request.method,
      path,
      status: 200,
      reason: "admin_registration_completed_pending_approval",
      metadata: { inviteId: parsedBody.data.inviteId },
    })

    return NextResponse.json({
      ok: true,
      data: {
        email,
        onboardingStatus: "pending",
      },
    })
  } catch (error) {
    const status =
      error instanceof RegistrationCompletionError
        ? error.status
        : error instanceof CsrfValidationError
          ? error.status
          : 500
    const message =
      error instanceof RegistrationCompletionError
        ? error.message
        : error instanceof CsrfValidationError
          ? error.message
          : "Unable to complete admin registration."

    await logAuthEvent({
      outcome: "failure",
      email: attemptedEmail || undefined,
      uid: attemptedUid || undefined,
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
