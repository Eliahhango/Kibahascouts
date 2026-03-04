import { NextResponse } from "next/server"
import { z } from "zod"
import { assertAdminMutationRequest, toApiErrorResponse } from "../../_utils"
import { deriveMediaEmbedFromUrl } from "@/lib/media-embed"
import { mediaUpdateSchema } from "@/lib/validation/admin-content"

export const runtime = "nodejs"

type Params = {
  params: Promise<{ id: string }>
}

function normalizeMediaDoc(id: string, data: Record<string, unknown>) {
  return {
    id,
    title: String(data.title || ""),
    kind: data.kind === "gallery" ? "gallery" : "video",
    thumbnail: String(data.thumbnail || ""),
    href: String(data.href || ""),
    embedUrl: String(data.embedUrl || ""),
    sourceProvider: String(data.sourceProvider || ""),
    description: String(data.description || ""),
    displayOrder: Number.isFinite(Number(data.displayOrder)) ? Number(data.displayOrder) : 0,
    published: Boolean(data.published),
    createdAt: String(data.createdAt || ""),
    updatedAt: String(data.updatedAt || ""),
  }
}

function buildMediaUpdatePayload(
  rawPayload: z.infer<typeof mediaUpdateSchema>,
  existingData: Record<string, unknown>,
) {
  const payload: Record<string, unknown> = { ...rawPayload }
  const kind = (rawPayload.kind || existingData.kind || "video") === "gallery" ? "gallery" : "video"
  const href = typeof rawPayload.href === "string" ? rawPayload.href : String(existingData.href || "")

  if (kind === "video" && href) {
    const hasEmbedInUpdate = typeof rawPayload.embedUrl === "string" && rawPayload.embedUrl.trim().length > 0
    if (!hasEmbedInUpdate) {
      const derived = deriveMediaEmbedFromUrl(href)
      if (derived?.embedUrl) {
        payload.embedUrl = derived.embedUrl
      }
      if (
        (typeof rawPayload.sourceProvider !== "string" || rawPayload.sourceProvider.trim().length === 0) &&
        derived?.provider
      ) {
        payload.sourceProvider = derived.provider
      }
      if ((typeof rawPayload.thumbnail !== "string" || rawPayload.thumbnail.trim().length === 0) && derived?.thumbnail) {
        payload.thumbnail = derived.thumbnail
      }
    }
  }

  if (kind === "gallery") {
    payload.embedUrl = ""
    if (typeof rawPayload.sourceProvider !== "string") {
      payload.sourceProvider = ""
    }
  }

  return payload
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

    const existingData = (existingDoc.data() || {}) as Record<string, unknown>
    const payload = {
      ...buildMediaUpdatePayload(parsedBody.data, existingData),
      updatedAt: new Date().toISOString(),
    }

    await docRef.update(payload)
    const updated = await docRef.get()
    return NextResponse.json({ ok: true, data: normalizeMediaDoc(updated.id, (updated.data() || {}) as Record<string, unknown>) })
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
