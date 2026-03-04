import { NextResponse } from "next/server"
import { z } from "zod"
import { assertAdminRequest, toApiErrorResponse } from "../../_utils"
import { resolveMediaLinkPreview } from "@/lib/media-embed"

export const runtime = "nodejs"

const previewQuerySchema = z.object({
  url: z.string().trim().min(1, "Video URL is required."),
})

export async function GET(request: Request) {
  try {
    await assertAdminRequest(request, "content:write")

    const requestUrl = new URL(request.url)
    const parsedQuery = previewQuerySchema.safeParse({
      url: requestUrl.searchParams.get("url") || "",
    })

    if (!parsedQuery.success) {
      return NextResponse.json({ ok: false, error: parsedQuery.error.issues[0]?.message || "Invalid URL." }, { status: 400 })
    }

    const preview = await resolveMediaLinkPreview(parsedQuery.data.url)
    if (!preview) {
      return NextResponse.json(
        {
          ok: false,
          error: "Could not fetch video metadata from this URL.",
        },
        { status: 422 },
      )
    }

    return NextResponse.json({ ok: true, data: preview })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ ok: false, error: error.issues[0]?.message || "Invalid URL." }, { status: 400 })
    }
    return toApiErrorResponse(error, "Failed to resolve media preview")
  }
}
