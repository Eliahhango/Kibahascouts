import { NextResponse } from "next/server"
import { assertAdminMutationRequest, toApiErrorResponse } from "../../_utils"

export const runtime = "nodejs"

type Params = {
  params: Promise<{ id: string }>
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    await assertAdminMutationRequest(request, "messages:write")
    const { id } = await params

    const { getAdminDb } = await import("@/lib/firebase/admin")
    const db = getAdminDb()
    const docRef = db.collection("contactMessages").doc(id)
    const existingDoc = await docRef.get()

    if (!existingDoc.exists) {
      return NextResponse.json({ ok: false, error: "Message not found." }, { status: 404 })
    }

    await docRef.delete()

    return NextResponse.json({
      ok: true,
      data: {
        id,
      },
    })
  } catch (error) {
    return toApiErrorResponse(error, "Failed to delete message")
  }
}
