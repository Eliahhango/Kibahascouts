import "server-only"

import { Timestamp } from "firebase-admin/firestore"
import { z } from "zod"
import { getAdminDb } from "@/lib/firebase/admin"
import { buildOpenStreetMapPlaceUrl, hasValidCoordinates, normalizeCoordinate, normalizeMapZoom } from "@/lib/maps"
import { hasMeaningfulText, normalizePublicText } from "@/lib/public-text"
import type { LeaderProfile, MediaItem, NewsArticle, Resource, ScoutEvent, ScoutUnit } from "@/lib/types"

const newsDocSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  summary: z.string().min(1),
  body: z.string().min(1),
  author: z.string().optional(),
  tags: z.array(z.string()).optional(),
  category: z.string().optional(),
  image: z.string().optional(),
  date: z.string().min(1),
  featured: z.boolean().optional(),
  published: z.boolean().optional(),
  createdAt: z.unknown().optional(),
  updatedAt: z.unknown().optional(),
})

const eventDocSchema = z.object({
  title: z.string().optional(),
  slug: z.string().optional(),
  description: z.string().optional(),
  date: z.string().optional(),
  time: z.string().optional(),
  location: z.string().optional(),
  latitude: z.unknown().optional(),
  longitude: z.unknown().optional(),
  mapZoom: z.unknown().optional(),
  mapUrl: z.unknown().optional(),
  image: z.string().optional(),
  registrationOpen: z.boolean().optional(),
  registrationUrl: z.string().optional(),
  category: z.string().optional(),
  published: z.boolean().optional(),
  createdAt: z.unknown().optional(),
  updatedAt: z.unknown().optional(),
}).passthrough()

const resourceDocSchema = z.object({
  title: z.string().min(1),
  slug: z.string().optional(),
  description: z.string().min(1),
  category: z.string().optional(),
  fileType: z.string().optional(),
  fileSize: z.string().optional(),
  downloadUrl: z.string().optional(),
  publishDate: z.string().min(1),
  published: z.boolean().optional(),
  createdAt: z.unknown().optional(),
  updatedAt: z.unknown().optional(),
})

const unitDocSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  type: z.enum(["Pack", "Troop", "Crew"]),
  section: z.enum(["Cub Scouts", "Scouts", "Rovers"]),
  ward: z.string().min(1),
  meetingDay: z.string().min(1),
  meetingTime: z.string().min(1),
  meetingLocation: z.string().min(1),
  leaders: z.array(z.object({ name: z.string().min(1), role: z.string().min(1) })),
  memberCount: z.number().int().nonnegative(),
  established: z.string().min(1),
  contactEmail: z.string().min(1),
  image: z.string().optional(),
  published: z.boolean().optional(),
})

const leaderDocSchema = z.object({
  name: z.string().min(1),
  role: z.string().min(1),
  image: z.string().optional(),
  bio: z.string().min(1),
  since: z.string().min(1),
  published: z.boolean().optional(),
})

const mediaDocSchema = z.object({
  title: z.string().min(1),
  kind: z.enum(["video", "gallery"]),
  thumbnail: z.string().optional(),
  href: z.string().optional(),
  embedUrl: z.string().optional(),
  sourceProvider: z.string().optional(),
  description: z.string().optional(),
  displayOrder: z.number().int().optional(),
  published: z.boolean().optional(),
  createdAt: z.unknown().optional(),
  updatedAt: z.unknown().optional(),
})

type ParsedDoc<T> = { id: string; data: T }

function isPublishedValue(value: unknown) {
  return value === true || value === "true" || value === 1
}

function toIsoString(value: unknown) {
  if (!value) return undefined
  if (value instanceof Timestamp) return value.toDate().toISOString()
  if (typeof value === "string" && value.trim().length > 0) return value

  if (typeof value === "object" && value !== null && "toDate" in value) {
    const maybeWithToDate = value as { toDate?: () => Date }
    if (typeof maybeWithToDate.toDate === "function") {
      return maybeWithToDate.toDate().toISOString()
    }
  }

  return undefined
}

function toTimestamp(value: string | undefined) {
  if (!value) {
    return 0
  }

  const parsed = Date.parse(value)
  return Number.isNaN(parsed) ? 0 : parsed
}

function estimateReadingTime(text: string) {
  const words = text.trim().split(/\s+/).filter(Boolean).length
  const minutes = Math.max(1, Math.ceil(words / 180))
  return `${minutes} min read`
}

function normalizeSlug(value: string | null | undefined, fallback: string) {
  const raw = (value || "").trim().toLowerCase()
  const normalized = raw
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")

  return normalized || fallback
}

function normalizeDateOnly(value: unknown, fallback: string) {
  const raw = (typeof value === "string" ? value : toIsoString(value) || "").trim()
  if (!raw) {
    return fallback
  }

  const parsed = new Date(raw)
  if (Number.isNaN(parsed.getTime())) {
    return fallback
  }

  return parsed.toISOString().slice(0, 10)
}

function isHttpUrl(value: string) {
  try {
    const parsed = new URL(value)
    return parsed.protocol === "http:" || parsed.protocol === "https:"
  } catch {
    return false
  }
}

function normalizeAssetSrc(value: string | undefined, fallback: string) {
  const raw = (value || "").trim()
  if (!raw) {
    return fallback
  }

  if (raw.startsWith("/")) {
    return raw
  }

  return isHttpUrl(raw) ? raw : fallback
}

function normalizePublicUrl(value: string | undefined) {
  const raw = (value || "").trim()
  if (!raw) {
    return ""
  }

  if (raw.startsWith("/")) {
    return raw
  }

  return isHttpUrl(raw) ? raw : ""
}

function normalizeNewsCategory(value: string | undefined): NewsArticle["category"] {
  if (value === "Announcements") return "Announcements"
  if (value === "Training") return "Training"
  if (value === "Community Service") return "Community Service"
  if (value === "Awards") return "Awards"
  return "General"
}

function normalizeResourceCategory(value: string | undefined): Resource["category"] {
  if (value === "Forms") return "Forms"
  if (value === "Training") return "Training"
  if (value === "Policies") return "Policies"
  if (value === "Badges") return "Badges"
  if (value === "Reports") return "Reports"
  return "General"
}

function normalizeFileType(value: string | undefined): Resource["fileType"] {
  if (value === "PDF") return "PDF"
  if (value === "DOCX") return "DOCX"
  if (value === "XLSX") return "XLSX"
  if (value === "ZIP") return "ZIP"
  return "UNKNOWN"
}

function normalizeTagList(value: string[] | undefined) {
  if (!value || value.length === 0) {
    return []
  }

  return value
    .map((tag) => normalizePublicText(tag, ""))
    .filter((tag) => hasMeaningfulText(tag))
}

async function readPublishedCollection<T>(collectionName: string, schema: z.ZodType<T>): Promise<ParsedDoc<T>[]> {
  const snapshot = await getAdminDb().collection(collectionName).get()

  const docs: ParsedDoc<T>[] = []
  snapshot.forEach((doc) => {
    const data = doc.data()
    if (!isPublishedValue(data?.published)) {
      return
    }

    const parsed = schema.safeParse(data)
    if (parsed.success) {
      docs.push({ id: doc.id, data: parsed.data })
      return
    }

    // Keep rendering resilient even when a stored document shape is incomplete.
    console.warn(`Skipping invalid published ${collectionName} document: ${doc.id}`)
  })

  return docs
}

export async function getPublishedNewsFromFirestore(): Promise<NewsArticle[]> {
  const docs = await readPublishedCollection("news", newsDocSchema)

  return docs
    .map(({ id, data }) => {
      const nowIso = new Date().toISOString()
      const createdAtIso = toIsoString(data.createdAt) ?? nowIso
      const fallbackDate = createdAtIso.slice(0, 10)
      const date = normalizeDateOnly(data.date, fallbackDate)
      const createdAt = createdAtIso
      const updatedAt = toIsoString(data.updatedAt) ?? createdAtIso

      return {
        id,
        slug: normalizeSlug(data.slug, `news-${id}`),
        title: normalizePublicText(data.title, "News update"),
        summary: normalizePublicText(data.summary),
        content: normalizePublicText(data.body),
        category: normalizeNewsCategory(data.category),
        image: normalizeAssetSrc(data.image, "/images/news/placeholder.jpg"),
        author: normalizePublicText(data.author, "Kibaha Scouts Communications"),
        date,
        readingTime: estimateReadingTime(data.body),
        tags: normalizeTagList(data.tags),
        featured: Boolean(data.featured),
        published: true,
        createdAt,
        updatedAt,
      }
    })
    .sort((a, b) => toTimestamp(b.date) - toTimestamp(a.date))
}

export async function getPublishedEventsFromFirestore(): Promise<ScoutEvent[]> {
  const docs = await readPublishedCollection("events", eventDocSchema)

  return docs
    .map(({ id, data }) => {
      const createdAtIso = toIsoString(data.createdAt) ?? new Date().toISOString()
      const fallbackDate = createdAtIso.slice(0, 10)
      const dateValue = normalizeDateOnly(data.date, fallbackDate)
      const createdAt = createdAtIso
      const updatedAt = toIsoString(data.updatedAt) ?? createdAtIso
      const latitude = normalizeCoordinate(data.latitude)
      const longitude = normalizeCoordinate(data.longitude)
      const hasCoordinates = hasValidCoordinates(latitude, longitude)
      const mapZoom = normalizeMapZoom(data.mapZoom)
      const mapUrl = hasCoordinates
        ? buildOpenStreetMapPlaceUrl(latitude as number, longitude as number, mapZoom)
        : normalizePublicUrl(typeof data.mapUrl === "string" ? data.mapUrl : "")
      const slugValue = normalizeSlug(hasMeaningfulText(data.slug) ? String(data.slug) : "", `event-${id}`)

      return {
        id,
        slug: slugValue,
        title: normalizePublicText(data.title, "Event update"),
        description: normalizePublicText(data.description),
        date: dateValue,
        time: normalizePublicText(data.time, "Time will be shared soon."),
        location: normalizePublicText(data.location, "Location details will be shared soon."),
        latitude: hasCoordinates ? (latitude as number) : undefined,
        longitude: hasCoordinates ? (longitude as number) : undefined,
        mapZoom: hasCoordinates ? mapZoom : undefined,
        mapUrl,
        image: normalizeAssetSrc(data.image, "/images/events/placeholder.jpg"),
        registrationOpen: Boolean(data.registrationOpen),
        registrationUrl: normalizePublicUrl(data.registrationUrl),
        category: normalizePublicText(data.category, "General"),
        published: true,
        createdAt,
        updatedAt,
      }
    })
    .sort((a, b) => toTimestamp(a.date) - toTimestamp(b.date))
}

export async function getPublishedResourcesFromFirestore(): Promise<Resource[]> {
  const docs = await readPublishedCollection("resources", resourceDocSchema)

  return docs
    .map(({ id, data }) => {
      const nowIso = new Date().toISOString()
      const createdAtIso = toIsoString(data.createdAt) ?? nowIso
      const fallbackDate = createdAtIso.slice(0, 10)
      const publishDate = normalizeDateOnly(data.publishDate, fallbackDate)
      const createdAt = createdAtIso
      const updatedAt = toIsoString(data.updatedAt) ?? createdAtIso

      return {
        id,
        slug: data.slug ? normalizeSlug(data.slug, `resource-${id}`) : undefined,
        title: normalizePublicText(data.title, "Resource update"),
        summary: normalizePublicText(data.description),
        category: normalizeResourceCategory(data.category),
        fileType: normalizeFileType(data.fileType),
        fileSize: normalizePublicText(data.fileSize, "File details will be shared soon."),
        publishDate,
        downloadUrl: normalizePublicUrl(data.downloadUrl),
        published: true,
        createdAt,
        updatedAt,
      }
    })
    .sort((a, b) => toTimestamp(b.publishDate) - toTimestamp(a.publishDate))
}

export async function getPublishedUnitsFromFirestore(): Promise<ScoutUnit[]> {
  const docs = await readPublishedCollection("units", unitDocSchema)

  return docs.map(({ id, data }) => ({
    id,
    slug: data.slug,
    name: normalizePublicText(data.name, "Scout unit"),
    type: data.type,
    section: data.section,
    ward: normalizePublicText(data.ward),
    meetingDay: normalizePublicText(data.meetingDay),
    meetingTime: normalizePublicText(data.meetingTime),
    meetingLocation: normalizePublicText(data.meetingLocation),
    leaders: data.leaders.map((leader) => ({
      name: normalizePublicText(leader.name, "Leader information coming soon"),
      role: normalizePublicText(leader.role, "Role details coming soon"),
    })),
    memberCount: data.memberCount,
    established: normalizePublicText(data.established),
    contactEmail: normalizePublicText(data.contactEmail),
    image: data.image || "/images/units/placeholder.jpg",
    published: true,
  }))
}

export async function getPublishedLeadersFromFirestore(): Promise<LeaderProfile[]> {
  const docs = await readPublishedCollection("leaders", leaderDocSchema)

  return docs.map(({ id, data }) => ({
    id,
    name: normalizePublicText(data.name, "Leader profile coming soon"),
    role: normalizePublicText(data.role),
    image: data.image || "/images/leaders/dc.jpg",
    bio: normalizePublicText(data.bio),
    since: normalizePublicText(data.since),
  }))
}

export async function getPublishedMediaItemsFromFirestore(): Promise<MediaItem[]> {
  const docs = await readPublishedCollection("mediaItems", mediaDocSchema)

  return docs
    .map(({ id, data }) => ({
      id,
      title: normalizePublicText(data.title, "District media item"),
      kind: data.kind,
      thumbnail: normalizeAssetSrc(data.thumbnail, "/images/about-hero.jpg"),
      href: normalizePublicUrl(data.href),
      embedUrl: normalizePublicUrl(data.embedUrl),
      sourceProvider: normalizePublicText(data.sourceProvider, ""),
      description: normalizePublicText(data.description, "Media details will be published soon."),
      displayOrder: Number.isInteger(data.displayOrder) ? data.displayOrder : 0,
      published: true,
      createdAt: toIsoString(data.createdAt),
      updatedAt: toIsoString(data.updatedAt),
    }))
    .sort((a, b) => a.displayOrder - b.displayOrder || toTimestamp(b.updatedAt) - toTimestamp(a.updatedAt))
}
