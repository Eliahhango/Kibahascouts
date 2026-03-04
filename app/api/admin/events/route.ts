import { NextResponse } from "next/server"
import { z } from "zod"
import { assertAdminMutationRequest, assertAdminRequest, toApiErrorResponse } from "../_utils"
import { eventInputSchema } from "@/lib/validation/admin-content"
import { buildOpenStreetMapPlaceUrl, hasValidCoordinates, normalizeCoordinate, normalizeMapZoom } from "@/lib/maps"

export const runtime = "nodejs"

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

export async function GET(request: Request) {
  try {
    await assertAdminRequest(request, "content:read")
    const { getAdminDb } = await import("@/lib/firebase/admin")
    const snapshot = await getAdminDb().collection("events").get()

    const data = snapshot.docs
      .map((doc) => normalizeEventDoc(doc.id, doc.data() as Record<string, unknown>))
      .sort((a, b) => +new Date(a.date || 0) - +new Date(b.date || 0))

    return NextResponse.json({ ok: true, data })
  } catch (error) {
    return toApiErrorResponse(error, "Failed to list events")
  }
}

export async function POST(request: Request) {
  try {
    await assertAdminMutationRequest(request, "content:write")
    const rawBody = await request.json().catch(() => null)
    const parsedBody = eventInputSchema.safeParse(rawBody)

    if (!parsedBody.success) {
      const message = parsedBody.error.issues[0]?.message || "Invalid payload."
      return NextResponse.json({ ok: false, error: message }, { status: 400 })
    }

    const { getAdminDb } = await import("@/lib/firebase/admin")
    const db = getAdminDb()
    const existingSlug = await db.collection("events").where("slug", "==", parsedBody.data.slug).limit(1).get()
    if (!existingSlug.empty) {
      return NextResponse.json({ ok: false, error: "Slug is already in use." }, { status: 409 })
    }

    const now = new Date().toISOString()
    const payload = {
      ...parsedBody.data,
      createdAt: now,
      updatedAt: now,
    }
    const docRef = await db.collection("events").add(payload)

    return NextResponse.json(
      {
        ok: true,
        data: normalizeEventDoc(docRef.id, payload as unknown as Record<string, unknown>),
      },
      { status: 201 },
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ ok: false, error: error.issues[0]?.message || "Invalid payload." }, { status: 400 })
    }
    return toApiErrorResponse(error, "Failed to create event")
  }
}
