import { NextResponse } from "next/server"
import { z } from "zod"
import { assertAdminMutationRequest, assertAdminRequest, toApiErrorResponse } from "../_utils"
import { createAdminInvite } from "@/lib/auth/admin-invites"
import { ADMIN_ROLE_VALUES, type AdminRole, getAdminUserByEmail, getPrimarySuperAdminEmail, listAdminUsers, upsertAdminUser } from "@/lib/auth/admin-users"
import { buildAdminInvitationEmail } from "@/lib/email/admin-email-templates"
import { isTransactionalEmailConfigured, sendTransactionalEmail } from "@/lib/email/mailer"
import { getSiteUrl } from "@/lib/site-url"

export const runtime = "nodejs"

const createAdminSchema = z.object({
  email: z.string().trim().email("Please provide a valid admin email."),
  role: z.enum(ADMIN_ROLE_VALUES),
})

const roleLabels: Record<AdminRole, string> = {
  super_admin: "Super Admin",
  content_admin: "Content Admin",
  viewer: "Viewer",
}

type InvitationEmailResult = {
  invitationEmailSent: boolean
  invitationEmailSkipped: boolean
  invitationEmailError?: string
  inviteId?: string
}

function toInvitationUrls(email: string, inviteId: string) {
  const baseUrl = getSiteUrl()
  const encodedNext = encodeURIComponent("/admin")
  const encodedEmail = encodeURIComponent(email)
  const encodedInvite = encodeURIComponent(inviteId)
  return {
    registerUrl: `${baseUrl}/admin/register?next=${encodedNext}&email=${encodedEmail}&invite=${encodedInvite}`,
    loginUrl: `${baseUrl}/admin/login?next=${encodedNext}&email=${encodedEmail}`,
  }
}

function toErrorCode(error: unknown) {
  if (typeof error === "object" && error && "code" in error) {
    return String((error as { code?: string }).code || "")
  }
  return ""
}

async function sendInvitationEmail(params: {
  email: string
  role: AdminRole
  invitedByEmail: string
  inviteId: string
}): Promise<InvitationEmailResult> {
  const { getAdminAuth } = await import("@/lib/firebase/admin")
  const adminAuth = getAdminAuth()

  try {
    const existingAuthUser = await adminAuth.getUserByEmail(params.email)
    if (existingAuthUser.disabled) {
      return {
        invitationEmailSent: false,
        invitationEmailSkipped: false,
        invitationEmailError:
          "Invitation email was not sent because the Firebase account for this email is disabled. Re-enable the account first.",
        inviteId: params.inviteId,
      }
    }

    return {
      invitationEmailSent: false,
      invitationEmailSkipped: true,
      invitationEmailError:
        "Invitation email skipped because this email already has an authentication account. Remove the old account first if you want a fresh onboarding.",
      inviteId: params.inviteId,
    }
  } catch (error) {
    if (toErrorCode(error) !== "auth/user-not-found") {
      throw error
    }
  }

  if (!isTransactionalEmailConfigured()) {
    return {
      invitationEmailSent: false,
      invitationEmailSkipped: false,
      invitationEmailError: "Invitation email service is not configured (missing RESEND_API_KEY or RESEND_FROM_EMAIL).",
      inviteId: params.inviteId,
    }
  }

  const { registerUrl, loginUrl } = toInvitationUrls(params.email, params.inviteId)
  const template = buildAdminInvitationEmail({
    recipientEmail: params.email,
    roleLabel: roleLabels[params.role],
    invitedByEmail: params.invitedByEmail,
    registerUrl,
    loginUrl,
  })
  const sent = await sendTransactionalEmail({
    to: params.email,
    subject: template.subject,
    html: template.html,
    text: template.text,
  })

  if (!sent.ok) {
    return {
      invitationEmailSent: false,
      invitationEmailSkipped: false,
      invitationEmailError: sent.error,
      inviteId: params.inviteId,
    }
  }

  return {
    invitationEmailSent: true,
    invitationEmailSkipped: false,
    inviteId: params.inviteId,
  }
}

export async function GET(request: Request) {
  try {
    await assertAdminRequest(request, "admins:manage")
    const users = await listAdminUsers()
    const primarySuperAdminEmail = await getPrimarySuperAdminEmail()
    const { getAdminAuth } = await import("@/lib/firebase/admin")
    const adminAuth = getAdminAuth()

    const usersWithInviteStatus = await Promise.all(
      users.map(async (user) => {
        let invitationAccepted = false
        let invitationAcceptedAt = ""

        try {
          const authUser = await adminAuth.getUserByEmail(user.email)
          invitationAccepted = true
          const createdAt = authUser.metadata.creationTime
          if (createdAt) {
            const parsedCreatedAt = Date.parse(createdAt)
            invitationAcceptedAt = Number.isNaN(parsedCreatedAt) ? createdAt : new Date(parsedCreatedAt).toISOString()
          }
        } catch (error) {
          const code = typeof error === "object" && error && "code" in error ? String(error.code) : ""
          if (code !== "auth/user-not-found") {
            throw error
          }
        }

        return {
          ...user,
          isPrimarySuperAdmin: user.email === primarySuperAdminEmail,
          invitationAccepted,
          invitationAcceptedAt,
        }
      }),
    )

    return NextResponse.json({ ok: true, data: usersWithInviteStatus })
  } catch (error) {
    return toApiErrorResponse(error, "Failed to list admin users")
  }
}

export async function POST(request: Request) {
  try {
    const admin = await assertAdminMutationRequest(request, "admins:manage")
    const rawBody = await request.json().catch(() => null)
    const parsedBody = createAdminSchema.safeParse(rawBody)

    if (!parsedBody.success) {
      return NextResponse.json(
        {
          ok: false,
          error: parsedBody.error.issues[0]?.message || "Invalid admin user payload.",
        },
        { status: 400 },
      )
    }

    const email = parsedBody.data.email.trim().toLowerCase()
    const existingAdmin = await getAdminUserByEmail(email)

    if (existingAdmin && existingAdmin.onboardingStatus === "approved" && existingAdmin.active) {
      await upsertAdminUser({
        email,
        role: parsedBody.data.role,
        active: true,
        onboardingStatus: "approved",
        actorEmail: admin.email,
      })

      return NextResponse.json(
        {
          ok: true,
          data: {
            invitationEmailSent: false,
            invitationEmailSkipped: true,
            invitationEmailError: "Admin account is already approved. Role updated without new onboarding.",
          },
        },
        { status: 200 },
      )
    }

    const invite = await createAdminInvite({
      email,
      role: parsedBody.data.role,
      invitedByEmail: admin.email,
    })

    await upsertAdminUser({
      email,
      role: parsedBody.data.role,
      active: false,
      onboardingStatus: "invited",
      inviteId: invite.id,
      invitedAt: invite.invitedAt,
      actorEmail: admin.email,
    })

    const invitationEmail = await sendInvitationEmail({
      email,
      role: parsedBody.data.role,
      invitedByEmail: admin.email,
      inviteId: invite.id,
    })

    return NextResponse.json(
      {
        ok: true,
        data: invitationEmail,
      },
      { status: 201 },
    )
  } catch (error) {
    return toApiErrorResponse(error, "Failed to create admin user")
  }
}
