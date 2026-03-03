import { NextResponse } from "next/server"
import { z } from "zod"
import { assertAdminMutationRequest, toApiErrorResponse } from "../../_utils"
import { ADMIN_ROLE_VALUES, deleteAdminUser, getAdminUserByEmail, getSuperAdminCount, updateAdminUser } from "@/lib/auth/admin-users"

export const runtime = "nodejs"

type Params = {
  params: Promise<{ email: string }>
}

const updateAdminSchema = z
  .object({
    role: z.enum(ADMIN_ROLE_VALUES).optional(),
    active: z.boolean().optional(),
  })
  .refine((value) => typeof value.role !== "undefined" || typeof value.active !== "undefined", {
    message: "At least one field (role or active) is required.",
  })

function decodeEmailParam(value: string) {
  return decodeURIComponent(value).trim().toLowerCase()
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const admin = await assertAdminMutationRequest(request, "admins:manage")
    const { email: emailParam } = await params
    const targetEmail = decodeEmailParam(emailParam)
    const targetUser = await getAdminUserByEmail(targetEmail)

    if (!targetUser) {
      return NextResponse.json({ ok: false, error: "Admin user not found." }, { status: 404 })
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
    const nextActive = typeof parsedBody.data.active === "boolean" ? parsedBody.data.active : targetUser.active

    if (targetUser.role === "super_admin" && (!nextActive || nextRole !== "super_admin")) {
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

    await updateAdminUser(targetEmail, parsedBody.data, admin.email)
    return NextResponse.json({ ok: true })
  } catch (error) {
    return toApiErrorResponse(error, "Failed to update admin user")
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    await assertAdminMutationRequest(request, "admins:manage")
    const { email: emailParam } = await params
    const targetEmail = decodeEmailParam(emailParam)
    const targetUser = await getAdminUserByEmail(targetEmail)

    if (!targetUser) {
      return NextResponse.json({ ok: false, error: "Admin user not found." }, { status: 404 })
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

    await deleteAdminUser(targetEmail)
    return NextResponse.json({ ok: true })
  } catch (error) {
    return toApiErrorResponse(error, "Failed to delete admin user")
  }
}
