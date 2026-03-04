import "server-only"

type DerivedEmbed = {
  provider: string
  embedUrl: string
  thumbnail?: string
}

export type MediaLinkPreview = {
  sourceUrl: string
  provider: string
  embedUrl: string
  title?: string
  description?: string
  thumbnail?: string
}

type NoEmbedResponse = {
  title?: string
  author_name?: string
  provider_name?: string
  thumbnail_url?: string
  html?: string
}

function toAbsoluteHttpUrl(value: string) {
  try {
    const url = new URL(value.trim())
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null
    }
    return url.toString()
  } catch {
    return null
  }
}

function parseYoutubeVideoId(url: URL) {
  const hostname = url.hostname.toLowerCase()
  if (hostname === "youtu.be") {
    const id = url.pathname.split("/").filter(Boolean)[0]
    return id || null
  }

  if (hostname.endsWith("youtube.com")) {
    if (url.pathname === "/watch") {
      return url.searchParams.get("v")
    }

    const pathParts = url.pathname.split("/").filter(Boolean)
    if (pathParts[0] === "shorts" || pathParts[0] === "embed" || pathParts[0] === "live") {
      return pathParts[1] || null
    }
  }

  return null
}

function deriveYoutubeEmbed(url: URL): DerivedEmbed | null {
  const videoId = parseYoutubeVideoId(url)
  if (!videoId) {
    return null
  }

  const normalizedVideoId = videoId.trim()
  if (!/^[A-Za-z0-9_-]{6,}$/.test(normalizedVideoId)) {
    return null
  }

  return {
    provider: "YouTube",
    embedUrl: `https://www.youtube.com/embed/${normalizedVideoId}`,
    thumbnail: `https://i.ytimg.com/vi/${normalizedVideoId}/hqdefault.jpg`,
  }
}

function deriveInstagramEmbed(url: URL): DerivedEmbed | null {
  const hostname = url.hostname.toLowerCase()
  if (!hostname.endsWith("instagram.com")) {
    return null
  }

  const match = url.pathname.match(/^\/(p|reel|tv)\/([A-Za-z0-9_-]+)/)
  if (!match) {
    return null
  }

  return {
    provider: "Instagram",
    embedUrl: `https://www.instagram.com/${match[1]}/${match[2]}/embed`,
  }
}

function deriveVimeoEmbed(url: URL): DerivedEmbed | null {
  const hostname = url.hostname.toLowerCase()
  if (!hostname.includes("vimeo.com")) {
    return null
  }

  const pathSegments = url.pathname.split("/").filter(Boolean)
  const id = pathSegments.find((segment) => /^\d+$/.test(segment))
  if (!id) {
    return null
  }

  return {
    provider: "Vimeo",
    embedUrl: `https://player.vimeo.com/video/${id}`,
  }
}

function deriveTikTokEmbed(url: URL): DerivedEmbed | null {
  const hostname = url.hostname.toLowerCase()
  if (!hostname.endsWith("tiktok.com")) {
    return null
  }

  const match = url.pathname.match(/\/video\/(\d+)/)
  if (!match) {
    return null
  }

  return {
    provider: "TikTok",
    embedUrl: `https://www.tiktok.com/embed/v2/${match[1]}`,
  }
}

export function deriveMediaEmbedFromUrl(rawUrl: string): DerivedEmbed | null {
  const absolute = toAbsoluteHttpUrl(rawUrl)
  if (!absolute) {
    return null
  }

  const url = new URL(absolute)
  return deriveYoutubeEmbed(url) || deriveInstagramEmbed(url) || deriveVimeoEmbed(url) || deriveTikTokEmbed(url)
}

function isAllowedEmbedHostname(hostname: string) {
  const normalized = hostname.toLowerCase()
  return (
    normalized === "www.youtube.com" ||
    normalized === "youtube.com" ||
    normalized === "www.youtube-nocookie.com" ||
    normalized === "youtube-nocookie.com" ||
    normalized === "player.vimeo.com" ||
    normalized === "www.instagram.com" ||
    normalized === "instagram.com" ||
    normalized === "www.tiktok.com" ||
    normalized === "tiktok.com"
  )
}

export function isSupportedMediaEmbedUrl(rawUrl: string) {
  try {
    const embedUrl = new URL(rawUrl.trim())
    return embedUrl.protocol === "https:" && isAllowedEmbedHostname(embedUrl.hostname)
  } catch {
    return false
  }
}

function normalizeEmbedUrl(value: string | null | undefined) {
  if (!value) {
    return null
  }

  try {
    const url = new URL(value.trim())
    if (url.protocol !== "https:" || !isAllowedEmbedHostname(url.hostname)) {
      return null
    }
    return url.toString()
  } catch {
    return null
  }
}

function extractEmbedSrcFromHtml(html: string | undefined) {
  if (!html) {
    return null
  }

  const match = html.match(/src=["']([^"']+)["']/i)
  return match?.[1] || null
}

async function fetchJsonWithTimeout<T>(url: string, timeoutMs = 6000): Promise<T | null> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, {
      method: "GET",
      signal: controller.signal,
      cache: "no-store",
      headers: { Accept: "application/json" },
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

async function fetchNoEmbed(sourceUrl: string) {
  const endpoint = `https://noembed.com/embed?url=${encodeURIComponent(sourceUrl)}`
  return fetchJsonWithTimeout<NoEmbedResponse>(endpoint)
}

async function fetchYoutubeOEmbed(sourceUrl: string) {
  const endpoint = `https://www.youtube.com/oembed?url=${encodeURIComponent(sourceUrl)}&format=json`
  return fetchJsonWithTimeout<NoEmbedResponse>(endpoint)
}

export async function resolveMediaLinkPreview(rawUrl: string): Promise<MediaLinkPreview | null> {
  const sourceUrl = toAbsoluteHttpUrl(rawUrl)
  if (!sourceUrl) {
    return null
  }

  const derived = deriveMediaEmbedFromUrl(sourceUrl)
  let remote = await fetchNoEmbed(sourceUrl)
  if (!remote && derived?.provider === "YouTube") {
    remote = await fetchYoutubeOEmbed(sourceUrl)
  }

  const remoteEmbedSrc = normalizeEmbedUrl(extractEmbedSrcFromHtml(remote?.html))
  const provider = remote?.provider_name || derived?.provider || "External"
  const embedUrl = derived?.embedUrl || remoteEmbedSrc || ""

  const author = remote?.author_name?.trim()
  const description = author ? `${provider} by ${author}` : undefined

  return {
    sourceUrl,
    provider,
    embedUrl,
    title: remote?.title?.trim() || undefined,
    description,
    thumbnail: remote?.thumbnail_url || derived?.thumbnail || undefined,
  }
}
