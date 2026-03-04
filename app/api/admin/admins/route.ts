import { NextResponse } from "next/server"
import { z } from "zod"
import { assertAdminMutationRequest, assertAdminRequest, toApiErrorResponse } from "../_utils"
import { ADMIN_ROLE_VALUES, getPrimarySuperAdminEmail, listAdminUsers, upsertAdminUser } from "@/lib/auth/admin-users"

export const runtime = "nodejs"

const createAdminSchema = z.object({
  email: z.string().trim().email("Please provide a valid admin email."),
  role: z.enum(ADMIN_ROLE_VALUES),
})

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

    await upsertAdminUser({
      email: parsedBody.data.email,
      role: parsedBody.data.role,
      active: true,
      actorEmail: admin.email,
    })

    return NextResponse.json({ ok: true }, { status: 201 })
  } catch (error) {
    return toApiErrorResponse(error, "Failed to create admin user")
  }
}
