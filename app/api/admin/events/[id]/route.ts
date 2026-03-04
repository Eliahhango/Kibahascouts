import { NextResponse } from "next/server"
import { z } from "zod"
import { assertAdminMutationRequest, toApiErrorResponse } from "../../_utils"
import { richTextToPlainText, sanitizeRichTextHtml } from "@/lib/rich-text"
import { eventUpdateSchema } from "@/lib/validation/admin-content"
import { buildOpenStreetMapPlaceUrl, hasValidCoordinates, normalizeCoordinate, normalizeMapZoom } from "@/lib/maps"

export const runtime = "nodejs"

type Params = {
  params: Promise<{ id: string }>
}

function normalizeEventDoc(id: string, data: Record<string, unknown>) {
  const latitude = normalizeCoordinate(data.latitude)
  const longitude = normalizeCoordinate(data.longitude)
  const hasCoordinates = hasValidCoordinates(latitude, longitude)
  const mapZoom = normalizeMapZoom(data.mapZoom)
  const mapUrl = hasCoordinates
    ? buildOpenStreetMapPlaceUrl(latitude as number, longitude as number, mapZoom)
    : String(data.mapUrl || "")

  return {
    id,
    title: String(data.title || ""),
    slug: String(data.slug || ""),
    description: String(data.description || ""),
    date: String(data.date || ""),
    time: String(data.time || ""),
    location: String(data.location || ""),
    latitude: hasCoordinates ? (latitude as number) : null,
    longitude: hasCoordinates ? (longitude as number) : null,
    mapZoom,
    mapUrl,
    image: String(data.image || ""),
    category: String(data.category || "General"),
    registrationOpen: Boolean(data.registrationOpen),
    registrationUrl: String(data.registrationUrl || ""),
    published: Boolean(data.published),
    createdAt: String(data.createdAt || ""),
    updatedAt: String(data.updatedAt || ""),
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    await assertAdminMutationRequest(request, "content:write")
    const { id } = await params
    const rawBody = await request.json().catch(() => null)
    const parsedBody = eventUpdateSchema.safeParse(rawBody)

    if (!parsedBody.success) {
      const message = parsedBody.error.issues[0]?.message || "Invalid payload."
      return NextResponse.json({ ok: false, error: message }, { status: 400 })
    }

    const { getAdminDb } = await import("@/lib/firebase/admin")
    const db = getAdminDb()
    const docRef = db.collection("events").doc(id)
    const existingDoc = await docRef.get()

    if (!existingDoc.exists) {
      return NextResponse.json({ ok: false, error: "Event not found." }, { status: 404 })
    }

    if (parsedBody.data.slug) {
      const duplicateSlug = await db.collection("events").where("slug", "==", parsedBody.data.slug).limit(1).get()
      const duplicate = duplicateSlug.docs.find((doc) => doc.id !== id)
      if (duplicate) {
        return NextResponse.json({ ok: false, error: "Slug is already in use." }, { status: 409 })
      }
    }

    const payload = {
      ...parsedBody.data,
      updatedAt: new Date().toISOString(),
    }

    if (typeof parsedBody.data.description === "string") {
      const sanitizedDescription = sanitizeRichTextHtml(parsedBody.data.description)
      const descriptionPlain = richTextToPlainText(sanitizedDescription)
      if (descriptionPlain.length < 10) {
        return NextResponse.json({ ok: false, error: "Description must be at least 10 characters." }, { status: 400 })
      }

      payload.description = sanitizedDescription
    }

    await docRef.update(payload)
    const updated = await docRef.get()
    return NextResponse.json({
      ok: true,
      data: normalizeEventDoc(updated.id, (updated.data() || {}) as Record<string, unknown>),
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ ok: false, error: error.issues[0]?.message || "Invalid payload." }, { status: 400 })
    }
    return toApiErrorResponse(error, "Failed to update event")
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    await assertAdminMutationRequest(request, "content:write")
    const { id } = await params
    const { getAdminDb } = await import("@/lib/firebase/admin")
    const docRef = getAdminDb().collection("events").doc(id)
    const existingDoc = await docRef.get()
    if (!existingDoc.exists) {
      return NextResponse.json({ ok: false, error: "Event not found." }, { status: 404 })
    }

    await docRef.delete()
    return NextResponse.json({ ok: true })
  } catch (error) {
    return toApiErrorResponse(error, "Failed to delete event")
  }
}
