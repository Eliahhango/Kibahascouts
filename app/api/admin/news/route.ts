import { NextResponse } from "next/server"
import { z } from "zod"
import { assertAdminMutationRequest, assertAdminRequest, toApiErrorResponse } from "../_utils"
import { richTextToPlainText, sanitizeRichTextHtml } from "@/lib/rich-text"
import { newsInputSchema } from "@/lib/validation/admin-content"

export const runtime = "nodejs"

function normalizeNewsDoc(id: string, data: Record<string, unknown>) {
  return {
    id,
    title: String(data.title || ""),
    slug: String(data.slug || ""),
    summary: String(data.summary || ""),
    body: String(data.body || ""),
    category: String(data.category || "General"),
    image: String(data.image || ""),
    date: String(data.date || ""),
    featured: Boolean(data.featured),
    published: Boolean(data.published),
    createdAt: String(data.createdAt || ""),
    updatedAt: String(data.updatedAt || ""),
  }
}

export async function GET(request: Request) {
  try {
    await assertAdminRequest(request, "content:read")
    const { getAdminDb } = await import("@/lib/firebase/admin")
    const snapshot = await getAdminDb().collection("news").get()

    const data = snapshot.docs
      .map((doc) => normalizeNewsDoc(doc.id, doc.data() as Record<string, unknown>))
      .sort((a, b) => +new Date(b.updatedAt || b.date || 0) - +new Date(a.updatedAt || a.date || 0))

    return NextResponse.json({ ok: true, data })
  } catch (error) {
    return toApiErrorResponse(error, "Failed to list news")
  }
}

export async function POST(request: Request) {
  try {
    await assertAdminMutationRequest(request, "content:write")
    const rawBody = await request.json().catch(() => null)
    const parsedBody = newsInputSchema.safeParse(rawBody)

    if (!parsedBody.success) {
      const message = parsedBody.error.issues[0]?.message || "Invalid payload."
      return NextResponse.json({ ok: false, error: message }, { status: 400 })
    }

    const sanitizedBody = sanitizeRichTextHtml(parsedBody.data.body)
    const plainBody = richTextToPlainText(sanitizedBody)
    if (plainBody.length < 20) {
      return NextResponse.json({ ok: false, error: "Body content must be at least 20 characters." }, { status: 400 })
    }

    const { getAdminDb } = await import("@/lib/firebase/admin")
    const db = getAdminDb()
    const existingSlug = await db.collection("news").where("slug", "==", parsedBody.data.slug).limit(1).get()
    if (!existingSlug.empty) {
      return NextResponse.json({ ok: false, error: "Slug is already in use." }, { status: 409 })
    }

    const now = new Date().toISOString()
    const docRef = db.collection("news").doc()
    const payload = {
      ...parsedBody.data,
      body: sanitizedBody,
      createdAt: now,
      updatedAt: now,
    }

    if (payload.featured) {
      const currentlyFeatured = await db.collection("news").where("featured", "==", true).get()
      const writer = db.batch()

      for (const doc of currentlyFeatured.docs) {
        writer.update(doc.ref, {
          featured: false,
          updatedAt: now,
        })
      }

      writer.set(docRef, payload)
      await writer.commit()
    } else {
      await docRef.set(payload)
    }

    return NextResponse.json(
      {
        ok: true,
        data: normalizeNewsDoc(docRef.id, payload as unknown as Record<string, unknown>),
      },
      { status: 201 },
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ ok: false, error: error.issues[0]?.message || "Invalid payload." }, { status: 400 })
    }

    return toApiErrorResponse(error, "Failed to create news")
  }
}
