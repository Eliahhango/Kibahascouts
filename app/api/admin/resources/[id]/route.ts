import { NextResponse } from "next/server"
import { z } from "zod"
import { assertAdminMutationRequest, toApiErrorResponse } from "../../_utils"
import { resourceUpdateSchema } from "@/lib/validation/admin-content"

export const runtime = "nodejs"

type Params = {
  params: Promise<{ id: string }>
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    await assertAdminMutationRequest(request, "content:write")
    const { id } = await params
    const rawBody = await request.json().catch(() => null)
    const parsedBody = resourceUpdateSchema.safeParse(rawBody)

    if (!parsedBody.success) {
      const message = parsedBody.error.issues[0]?.message || "Invalid payload."
      return NextResponse.json({ ok: false, error: message }, { status: 400 })
    }

    const { getAdminDb } = await import("@/lib/firebase/admin")
    const db = getAdminDb()
    const docRef = db.collection("resources").doc(id)
    const existingDoc = await docRef.get()

    if (!existingDoc.exists) {
      return NextResponse.json({ ok: false, error: "Resource not found." }, { status: 404 })
    }

    if (parsedBody.data.slug) {
      const duplicateSlug = await db.collection("resources").where("slug", "==", parsedBody.data.slug).limit(1).get()
      const duplicate = duplicateSlug.docs.find((doc) => doc.id !== id)
      if (duplicate) {
        return NextResponse.json({ ok: false, error: "Slug is already in use." }, { status: 409 })
      }
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
    return toApiErrorResponse(error, "Failed to update resource")
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    await assertAdminMutationRequest(request, "content:write")
    const { id } = await params
    const { getAdminDb } = await import("@/lib/firebase/admin")
    const docRef = getAdminDb().collection("resources").doc(id)
    const existingDoc = await docRef.get()
    if (!existingDoc.exists) {
      return NextResponse.json({ ok: false, error: "Resource not found." }, { status: 404 })
    }

    await docRef.delete()
    return NextResponse.json({ ok: true })
  } catch (error) {
    return toApiErrorResponse(error, "Failed to delete resource")
  }
}
