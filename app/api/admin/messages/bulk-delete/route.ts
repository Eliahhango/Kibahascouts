import { NextResponse } from "next/server"
import { z } from "zod"
import { assertAdminMutationRequest, toApiErrorResponse } from "../../_utils"

export const runtime = "nodejs"

const bulkDeleteSchema = z.object({
  ids: z.array(z.string().trim().min(1)).min(1, "Select at least one message.").max(100, "You can delete up to 100 messages at once."),
})

export async function POST(request: Request) {
  try {
    await assertAdminMutationRequest(request, "messages:write")
    const rawBody = await request.json().catch(() => null)
    const parsedBody = bulkDeleteSchema.safeParse(rawBody)

    if (!parsedBody.success) {
      const message = parsedBody.error.issues[0]?.message || "Invalid delete payload."
      return NextResponse.json({ ok: false, error: message }, { status: 400 })
    }

    const uniqueIds = Array.from(new Set(parsedBody.data.ids.map((id) => id.trim()).filter(Boolean)))
    if (uniqueIds.length === 0) {
      return NextResponse.json({ ok: false, error: "Select at least one message." }, { status: 400 })
    }

    const { getAdminDb } = await import("@/lib/firebase/admin")
    const db = getAdminDb()
    const writer = db.batch()

    for (const id of uniqueIds) {
      writer.delete(db.collection("contactMessages").doc(id))
    }

    await writer.commit()

    return NextResponse.json({
      ok: true,
      data: {
        deletedCount: uniqueIds.length,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ ok: false, error: error.issues[0]?.message || "Invalid delete payload." }, { status: 400 })
    }

    return toApiErrorResponse(error, "Failed to bulk delete messages")
  }
}
