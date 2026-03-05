import { NextResponse } from "next/server"
import { z } from "zod"
import { assertAdminMutationRequest, toApiErrorResponse } from "../../_utils"
import { invalidateInvitesForEmail } from "@/lib/auth/admin-invites"
import {
  ADMIN_ROLE_VALUES,
  ADMIN_ONBOARDING_STATUS_VALUES,
  archiveAndDeleteAdminUser,
  getAdminUserByEmail,
  getPrimarySuperAdminEmail,
  getSuperAdminCount,
  updateAdminUser,
} from "@/lib/auth/admin-users"
import { revokeTrackedAdminSessionsByEmail, revokeTrackedAdminSessionsByUid } from "@/lib/auth/admin-session-store"

export const runtime = "nodejs"

type Params = {
  params: Promise<{ email: string }>
}

const updateAdminSchema = z
  .object({
    role: z.enum(ADMIN_ROLE_VALUES).optional(),
    active: z.boolean().optional(),
    onboardingStatus: z.enum(ADMIN_ONBOARDING_STATUS_VALUES).optional(),
  })
  .refine((value) => typeof value.role !== "undefined" || typeof value.active !== "undefined" || typeof value.onboardingStatus !== "undefined", {
    message: "At least one field (role, active, or onboardingStatus) is required.",
  })

function decodeEmailParam(value: string) {
  return decodeURIComponent(value).trim().toLowerCase()
}

function getErrorCode(error: unknown) {
  if (typeof error === "object" && error && "code" in error) {
    return String((error as { code?: string }).code || "")
  }
  return ""
}

async function syncAdminClaimsByEmail(params: {
  email: string
  role: (typeof ADMIN_ROLE_VALUES)[number]
  active: boolean
  onboardingStatus: (typeof ADMIN_ONBOARDING_STATUS_VALUES)[number]
}) {
  const { getAdminAuth } = await import("@/lib/firebase/admin")
  const adminAuth = getAdminAuth()

  try {
    const authUser = await adminAuth.getUserByEmail(params.email)
    if (params.active && params.onboardingStatus === "approved") {
      await adminAuth.setCustomUserClaims(authUser.uid, {
        tsaAdmin: true,
        tsaRole: params.role,
      })
      return
    }

    await adminAuth.setCustomUserClaims(authUser.uid, null)
    await adminAuth.revokeRefreshTokens(authUser.uid)
  } catch (error) {
    if (getErrorCode(error) !== "auth/user-not-found") {
      throw error
    }
  }
}

async function performFullAdminDeletion(params: {
  email: string
  actorEmail: string
}) {
  const { getAdminAuth } = await import("@/lib/firebase/admin")
  const adminAuth = getAdminAuth()
  let uid = ""

  try {
    const authUser = await adminAuth.getUserByEmail(params.email)
    uid = authUser.uid
    await adminAuth.setCustomUserClaims(authUser.uid, null).catch(() => null)
    await adminAuth.revokeRefreshTokens(authUser.uid).catch(() => null)
    await adminAuth.deleteUser(authUser.uid)
  } catch (error) {
    if (getErrorCode(error) !== "auth/user-not-found") {
      throw error
    }
  }

  await Promise.all([
    revokeTrackedAdminSessionsByEmail(params.email, "admin_deleted"),
    uid ? revokeTrackedAdminSessionsByUid(uid, "admin_deleted") : Promise.resolve(0),
    invalidateInvitesForEmail({
      email: params.email,
      status: "deleted",
      actorEmail: params.actorEmail,
      reason: "admin_deleted",
    }),
  ])

  await archiveAndDeleteAdminUser({
    email: params.email,
    actorEmail: params.actorEmail,
    reason: "admin_deleted",
  })
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const admin = await assertAdminMutationRequest(request, "admins:manage")
    const { email: emailParam } = await params
    const targetEmail = decodeEmailParam(emailParam)
    const targetUser = await getAdminUserByEmail(targetEmail)
    const primarySuperAdminEmail = await getPrimarySuperAdminEmail()

    if (!targetUser) {
      return NextResponse.json({ ok: false, error: "Admin user not found." }, { status: 404 })
    }

    if (primarySuperAdminEmail && targetEmail === primarySuperAdminEmail && admin.email !== primarySuperAdminEmail) {
      return NextResponse.json(
        {
          ok: false,
          error: "Primary super admin cannot be modified by other admins.",
        },
        { status: 403 },
      )
    }

    const rawBody = await request.json().catch(() => null)
    const parsedBody = updateAdminSchema.safeParse(rawBody)

    if (!parsedBody.success) {
      return NextResponse.json(
        {
          ok: false,
          error: parsedBody.error.issues[0]?.message || "Invalid admin update payload.",
        },
        { status: 400 },
      )
    }

    const nextRole = parsedBody.data.role ?? targetUser.role
    const requestedStatus = parsedBody.data.onboardingStatus
    const nextStatus = requestedStatus ?? targetUser.onboardingStatus
    const nextActive = typeof parsedBody.data.active === "boolean" ? parsedBody.data.active : targetUser.active

    if (targetEmail === admin.email) {
      if (nextRole !== "super_admin") {
        return NextResponse.json(
          {
            ok: false,
            error: "You cannot change your own role from super admin.",
          },
          { status: 403 },
        )
      }

      if (!nextActive) {
        return NextResponse.json(
          {
            ok: false,
            error: "You cannot disable your own super admin account.",
          },
          { status: 403 },
        )
      }

      if (nextStatus !== "approved") {
        return NextResponse.json(
          {
            ok: false,
            error: "You cannot change your own onboarding status away from approved.",
          },
          { status: 403 },
        )
      }
    }

    if (targetUser.role === "super_admin" && (!nextActive || nextRole !== "super_admin" || nextStatus !== "approved")) {
      const superAdminCount = await getSuperAdminCount()
      if (superAdminCount <= 1) {
        return NextResponse.json(
          {
            ok: false,
            error: "At least one active super admin must remain.",
          },
          { status: 409 },
        )
      }
    }

    const updates = {
      ...parsedBody.data,
      ...(parsedBody.data.onboardingStatus === "approved" && typeof parsedBody.data.active === "undefined" ? { active: true } : {}),
      ...(parsedBody.data.onboardingStatus === "revoked" && typeof parsedBody.data.active === "undefined" ? { active: false } : {}),
      ...(parsedBody.data.active === false && typeof parsedBody.data.onboardingStatus === "undefined" && targetUser.onboardingStatus === "approved"
        ? { onboardingStatus: "revoked" as const }
        : {}),
    }

    await updateAdminUser(targetEmail, updates, admin.email)

    const syncedStatus = updates.onboardingStatus ?? nextStatus
    const syncedActive = typeof updates.active === "boolean" ? updates.active : nextActive
    await syncAdminClaimsByEmail({
      email: targetEmail,
      role: nextRole,
      active: syncedActive,
      onboardingStatus: syncedStatus,
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    return toApiErrorResponse(error, "Failed to update admin user")
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    const admin = await assertAdminMutationRequest(request, "admins:manage")
    const { email: emailParam } = await params
    const targetEmail = decodeEmailParam(emailParam)
    const targetUser = await getAdminUserByEmail(targetEmail)
    const primarySuperAdminEmail = await getPrimarySuperAdminEmail()

    if (!targetUser) {
      return NextResponse.json({ ok: false, error: "Admin user not found." }, { status: 404 })
    }

    if (primarySuperAdminEmail && targetEmail === primarySuperAdminEmail && admin.email !== primarySuperAdminEmail) {
      return NextResponse.json(
        {
          ok: false,
          error: "Primary super admin cannot be removed by other admins.",
        },
        { status: 403 },
      )
    }

    if (targetEmail === admin.email) {
      return NextResponse.json(
        {
          ok: false,
          error: "You cannot delete your own super admin account.",
        },
        { status: 403 },
      )
    }

    if (targetUser.role === "super_admin") {
      const superAdminCount = await getSuperAdminCount()
      if (superAdminCount <= 1) {
        return NextResponse.json(
          {
            ok: false,
            error: "At least one active super admin must remain.",
          },
          { status: 409 },
        )
      }
    }

    await performFullAdminDeletion({
      email: targetEmail,
      actorEmail: admin.email,
    })
    return NextResponse.json({ ok: true })
  } catch (error) {
    return toApiErrorResponse(error, "Failed to delete admin user")
  }
}
