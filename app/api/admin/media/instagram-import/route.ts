import { NextResponse } from "next/server"
import { z } from "zod"
import { assertAdminMutationRequest, toApiErrorResponse } from "../../_utils"
import { serverEnv } from "@/lib/env/server"
import { deriveMediaEmbedFromUrl } from "@/lib/media-embed"

export const runtime = "nodejs"

const RequestSchema = z.object({
  url: z.string().trim().url("Please provide a valid Instagram post URL."),
})

type InstagramOEmbedResponse = {
  thumbnail_url?: string
  title?: string
  author_name?: string
}

function isInstagramHost(hostname: string) {
  const normalized = hostname.toLowerCase()
  return normalized === "instagram.com" || normalized === "www.instagram.com"
}

function normalizeInstagramUrl(rawUrl: string) {
  const parsed = new URL(rawUrl.trim())
  if (!isInstagramHost(parsed.hostname)) {
    return null
  }
  return parsed.toString()
}

function buildFallbackEmbedUrl(postUrl: string) {
  const base = postUrl.replace(/\/+$/, "")
  return `${base}/embed`
}

async function fetchJsonWithTimeout<T>(url: string, timeoutMs = 8000): Promise<T | null> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, {
      method: "GET",
      cache: "no-store",
      signal: controller.signal,
      headers: {
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      return null
    }

    return (await response.json()) as T
  } catch {
    return null
  } finally {
    clearTimeout(timeout)
  }
}

async function resolveInstagramOEmbed(postUrl: string) {
  const token = serverEnv.INSTAGRAM_ACCESS_TOKEN.trim()
  const candidates: string[] = []

  if (token) {
    const graphUrl = new URL("https://graph.facebook.com/v18.0/instagram_oembed")
    graphUrl.searchParams.set("url", postUrl)
    graphUrl.searchParams.set("fields", "thumbnail_url,title,author_name")
    graphUrl.searchParams.set("access_token", token)
    candidates.push(graphUrl.toString())
  }

  const publicUrl = new URL("https://api.instagram.com/oembed/")
  publicUrl.searchParams.set("url", postUrl)
  candidates.push(publicUrl.toString())

  for (const candidate of candidates) {
    const payload = await fetchJsonWithTimeout<InstagramOEmbedResponse>(candidate)
    if (payload?.thumbnail_url || payload?.title || payload?.author_name) {
      return payload
    }
  }

  return null
}

export async function POST(request: Request) {
  try {
    await assertAdminMutationRequest(request, "content:write")
    const rawBody = await request.json().catch(() => null)
    const parsedBody = RequestSchema.safeParse(rawBody)

    if (!parsedBody.success) {
      return NextResponse.json(
        {
          ok: false,
          error: parsedBody.error.issues[0]?.message || "Invalid request payload.",
        },
        { status: 400 },
      )
    }

    const normalizedPostUrl = normalizeInstagramUrl(parsedBody.data.url)
    if (!normalizedPostUrl) {
      return NextResponse.json(
        {
          ok: false,
          error: "Please provide a valid Instagram post URL.",
        },
        { status: 400 },
      )
    }

    const embedUrl = deriveMediaEmbedFromUrl(normalizedPostUrl)?.embedUrl || buildFallbackEmbedUrl(normalizedPostUrl)
    const oEmbed = await resolveInstagramOEmbed(normalizedPostUrl)

    if (!oEmbed) {
      return NextResponse.json(
        {
          ok: false,
          error: "Could not fetch Instagram post. Make sure the post is public.",
        },
        { status: 400 },
      )
    }

    return NextResponse.json({
      ok: true,
      data: {
        thumbnailUrl: oEmbed.thumbnail_url || "",
        title: oEmbed.title || "Instagram Post",
        authorName: oEmbed.author_name || "",
        embedUrl,
        postUrl: normalizedPostUrl,
      },
    })
  } catch (error) {
    return toApiErrorResponse(error, "Failed to import Instagram media")
  }
}
