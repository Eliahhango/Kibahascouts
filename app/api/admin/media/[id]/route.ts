import { NextResponse } from "next/server"
import { z } from "zod"
import { assertAdminMutationRequest, toApiErrorResponse } from "../../_utils"
import { mediaUpdateSchema } from "@/lib/validation/admin-content"

export const runtime = "nodejs"

type Params = {
  params: Promise<{ id: string }>
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    await assertAdminMutationRequest(request, "content:write")
    const { id } = await params
    const rawBody = await request.json().catch(() => null)
    const parsedBody = mediaUpdateSchema.safeParse(rawBody)

    if (!parsedBody.success) {
      const message = parsedBody.error.issues[0]?.message || "Invalid payload."
      return NextResponse.json({ ok: false, error: message }, { status: 400 })
    }

    const { getAdminDb } = await import("@/lib/firebase/admin")
    const db = getAdminDb()
    const docRef = db.collection("mediaItems").doc(id)
    const existingDoc = await docRef.get()

    if (!existingDoc.exists) {
      return NextResponse.json({ ok: false, error: "Media item not found." }, { status: 404 })
    }

    const payload = {
      ...parsedBody.data,
      updatedAt: new Date().toISOString(),
    }

    await docRef.update(payload)
    const updated = await docRef.get()
    return NextResponse.json({ ok: true, data: { id: updated.id, ...(updated.data() || {}) } })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ ok: false, error: error.issues[0]?.message || "Invalid payload." }, { status: 400 })
    }
    return toApiErrorResponse(error, "Failed to update media item")
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    await assertAdminMutationRequest(request, "content:write")
    const { id } = await params
    const { getAdminDb } = await import("@/lib/firebase/admin")
    const docRef = getAdminDb().collection("mediaItems").doc(id)
    const existingDoc = await docRef.get()
    if (!existingDoc.exists) {
      return NextResponse.json({ ok: false, error: "Media item not found." }, { status: 404 })
    }

    await docRef.delete()
    return NextResponse.json({ ok: true })
  } catch (error) {
    return toApiErrorResponse(error, "Failed to delete media item")
  }
}
