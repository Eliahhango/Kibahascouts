import { NextResponse } from "next/server"
import { z } from "zod"
import { assertAdminMutationRequest, toApiErrorResponse } from "../../../_utils"

export const runtime = "nodejs"

const messageStatusSchema = z.object({
  status: z.enum(["unread", "read", "replied"]),
})

type Params = {
  params: Promise<{ id: string }>
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    await assertAdminMutationRequest(request, "messages:write")
    const { id } = await params
    const rawBody = await request.json().catch(() => null)
    const parsedBody = messageStatusSchema.safeParse(rawBody)

    if (!parsedBody.success) {
      const message = parsedBody.error.issues[0]?.message || "Invalid status."
      return NextResponse.json({ ok: false, error: message }, { status: 400 })
    }

    const { getAdminDb } = await import("@/lib/firebase/admin")
    const db = getAdminDb()
    const docRef = db.collection("contactMessages").doc(id)
    const existingDoc = await docRef.get()

    if (!existingDoc.exists) {
      return NextResponse.json({ ok: false, error: "Message not found." }, { status: 404 })
    }

    await docRef.update({
      status: parsedBody.data.status,
      updatedAt: new Date().toISOString(),
    })

    const updated = await docRef.get()
    return NextResponse.json({ ok: true, data: { id: updated.id, ...(updated.data() || {}) } })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ ok: false, error: error.issues[0]?.message || "Invalid status." }, { status: 400 })
    }
    return toApiErrorResponse(error, "Failed to update message status")
  }
}
