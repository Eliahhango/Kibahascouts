import { NextResponse } from "next/server"
import { z } from "zod"
import { assertAdminMutationRequest, assertAdminRequest, toApiErrorResponse } from "../_utils"
import { mediaInputSchema } from "@/lib/validation/admin-content"

export const runtime = "nodejs"

function normalizeMediaDoc(id: string, data: Record<string, unknown>) {
  return {
    id,
    title: String(data.title || ""),
    kind: data.kind === "gallery" ? "gallery" : "video",
    thumbnail: String(data.thumbnail || ""),
    href: String(data.href || ""),
    description: String(data.description || ""),
    displayOrder: Number.isFinite(Number(data.displayOrder)) ? Number(data.displayOrder) : 0,
    published: Boolean(data.published),
    createdAt: String(data.createdAt || ""),
    updatedAt: String(data.updatedAt || ""),
  }
}

export async function GET(request: Request) {
  try {
    await assertAdminRequest(request, "content:read")
    const { getAdminDb } = await import("@/lib/firebase/admin")
    const snapshot = await getAdminDb().collection("mediaItems").get()

    const data = snapshot.docs
      .map((doc) => normalizeMediaDoc(doc.id, doc.data() as Record<string, unknown>))
      .sort((a, b) => a.displayOrder - b.displayOrder || +new Date(b.updatedAt || 0) - +new Date(a.updatedAt || 0))

    return NextResponse.json({ ok: true, data })
  } catch (error) {
    return toApiErrorResponse(error, "Failed to list media items")
  }
}

export async function POST(request: Request) {
  try {
    await assertAdminMutationRequest(request, "content:write")
    const rawBody = await request.json().catch(() => null)
    const parsedBody = mediaInputSchema.safeParse(rawBody)

    if (!parsedBody.success) {
      const message = parsedBody.error.issues[0]?.message || "Invalid payload."
      return NextResponse.json({ ok: false, error: message }, { status: 400 })
    }

    const { getAdminDb } = await import("@/lib/firebase/admin")
    const db = getAdminDb()

    const now = new Date().toISOString()
    const payload = {
      ...parsedBody.data,
      createdAt: now,
      updatedAt: now,
    }
    const docRef = await db.collection("mediaItems").add(payload)

    return NextResponse.json(
      {
        ok: true,
        data: normalizeMediaDoc(docRef.id, payload as unknown as Record<string, unknown>),
      },
      { status: 201 },
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ ok: false, error: error.issues[0]?.message || "Invalid payload." }, { status: 400 })
    }
    return toApiErrorResponse(error, "Failed to create media item")
  }
}
