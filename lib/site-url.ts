import { publicEnv } from "@/lib/env/public"

const fallbackSiteUrl = "http://localhost:3000"

function stripTrailingSlash(value: string) {
  return value.replace(/\/$/, "")
}

function isPlaceholderUrl(value: string) {
  return value.includes("your-vercel-project") || value.includes("<") || value.includes(">")
}

export function getSiteUrl() {
  const publicUrl = publicEnv.NEXT_PUBLIC_SITE_URL
  const vercelUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined

  const preferredPublicUrl = !isPlaceholderUrl(publicUrl) ? publicUrl : ""
  return stripTrailingSlash(preferredPublicUrl || vercelUrl || fallbackSiteUrl)
}

export function getMetadataBase() {
  return new URL(getSiteUrl())
}
