import { NextResponse } from "next/server"
import { z } from "zod"
import { assertAdminMutationRequest, toApiErrorResponse } from "../../_utils"

export const runtime = "nodejs"

type Params = {
  params: Promise<{ id: string }>
}

const membershipStatusSchema = z.object({
  status: z.enum(["approved", "rejected"]),
})

export async function PATCH(request: Request, { params }: Params) {
  try {
    await assertAdminMutationRequest(request, "messages:write")
    const { id } = await params
    const rawBody = await request.json().catch(() => null)
    const parsed = membershipStatusSchema.safeParse(rawBody)

    if (!parsed.success) {
      const issue = parsed.error.issues[0]?.message || "Invalid status."
      return NextResponse.json({ ok: false, error: issue }, { status: 400 })
    }

    const { getAdminDb } = await import("@/lib/firebase/admin")
    const db = getAdminDb()
    const docRef = db.collection("membershipApplications").doc(id)
    const existing = await docRef.get()

    if (!existing.exists) {
      return NextResponse.json({ ok: false, error: "Application not found." }, { status: 404 })
    }

    await docRef.update({
      status: parsed.data.status,
      updatedAt: new Date().toISOString(),
    })

    const updated = await docRef.get()
    return NextResponse.json({ ok: true, data: { id: updated.id, ...(updated.data() || {}) } })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ ok: false, error: error.issues[0]?.message || "Invalid status." }, { status: 400 })
    }
    return toApiErrorResponse(error, "Failed to update membership application status")
  }
}
