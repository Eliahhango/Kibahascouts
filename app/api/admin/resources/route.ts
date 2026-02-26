import { NextResponse } from "next/server"
import { z } from "zod"
import { assertAdminRequest, toApiErrorResponse } from "../_utils"
import { resourceInputSchema } from "@/lib/validation/admin-content"

export const runtime = "nodejs"

function normalizeResourceDoc(id: string, data: Record<string, unknown>) {
  return {
    id,
    title: String(data.title || ""),
    slug: String(data.slug || ""),
    description: String(data.description || ""),
    category: String(data.category || "General"),
    fileType: String(data.fileType || "UNKNOWN"),
    fileSize: String(data.fileSize || ""),
    publishDate: String(data.publishDate || ""),
    downloadUrl: String(data.downloadUrl || ""),
    published: Boolean(data.published),
    createdAt: String(data.createdAt || ""),
    updatedAt: String(data.updatedAt || ""),
  }
}

export async function GET(request: Request) {
  try {
    await assertAdminRequest(request)
    const { getAdminDb } = await import("@/lib/firebase/admin")
    const snapshot = await getAdminDb().collection("resources").get()

    const data = snapshot.docs
      .map((doc) => normalizeResourceDoc(doc.id, doc.data() as Record<string, unknown>))
      .sort((a, b) => +new Date(b.publishDate || 0) - +new Date(a.publishDate || 0))

    return NextResponse.json({ ok: true, data })
  } catch (error) {
    return toApiErrorResponse(error, "Failed to list resources")
  }
}

export async function POST(request: Request) {
  try {
    await assertAdminRequest(request)
    const rawBody = await request.json().catch(() => null)
    const parsedBody = resourceInputSchema.safeParse(rawBody)

    if (!parsedBody.success) {
      const message = parsedBody.error.issues[0]?.message || "Invalid payload."
      return NextResponse.json({ ok: false, error: message }, { status: 400 })
    }

    const { getAdminDb } = await import("@/lib/firebase/admin")
    const db = getAdminDb()
    const existingSlug = await db.collection("resources").where("slug", "==", parsedBody.data.slug).limit(1).get()
    if (!existingSlug.empty) {
      return NextResponse.json({ ok: false, error: "Slug is already in use." }, { status: 409 })
    }

    const now = new Date().toISOString()
    const payload = {
      ...parsedBody.data,
      createdAt: now,
      updatedAt: now,
    }
    const docRef = await db.collection("resources").add(payload)

    return NextResponse.json(
      {
        ok: true,
        data: normalizeResourceDoc(docRef.id, payload as unknown as Record<string, unknown>),
      },
      { status: 201 },
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ ok: false, error: error.issues[0]?.message || "Invalid payload." }, { status: 400 })
    }
    return toApiErrorResponse(error, "Failed to create resource")
  }
}
