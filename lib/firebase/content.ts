import "server-only"

import { Timestamp } from "firebase-admin/firestore"
import { z } from "zod"
import { getAdminDb } from "@/lib/firebase/admin"
import type { NewsArticle, Resource, ScoutEvent, ScoutUnit } from "@/lib/types"

const newsDocSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  summary: z.string().min(1),
  body: z.string().min(1),
  category: z.string().optional(),
  image: z.string().optional(),
  date: z.string().min(1),
  featured: z.boolean().optional(),
  published: z.boolean().optional(),
  createdAt: z.unknown().optional(),
  updatedAt: z.unknown().optional(),
})

const eventDocSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().min(1),
  date: z.string().min(1),
  time: z.string().min(1),
  location: z.string().min(1),
  image: z.string().optional(),
  registrationOpen: z.boolean().optional(),
  registrationUrl: z.string().optional(),
  category: z.string().optional(),
  published: z.boolean().optional(),
  createdAt: z.unknown().optional(),
  updatedAt: z.unknown().optional(),
})

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

type ParsedDoc<T> = { id: string; data: T }

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

function estimateReadingTime(text: string) {
  const words = text.trim().split(/\s+/).filter(Boolean).length
  const minutes = Math.max(1, Math.ceil(words / 180))
  return `${minutes} min read`
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

async function readPublishedCollection<T>(collectionName: string, schema: z.ZodType<T>): Promise<ParsedDoc<T>[]> {
  const snapshot = await getAdminDb().collection(collectionName).where("published", "==", true).get()

  const docs: ParsedDoc<T>[] = []
  snapshot.forEach((doc) => {
    const parsed = schema.safeParse(doc.data())
    if (parsed.success) {
      docs.push({ id: doc.id, data: parsed.data })
    }
  })

  return docs
}

export async function getPublishedNewsFromFirestore(): Promise<NewsArticle[]> {
  const docs = await readPublishedCollection("news", newsDocSchema)

  return docs
    .map(({ id, data }) => {
      const createdAt = toIsoString(data.createdAt) ?? data.date
      const updatedAt = toIsoString(data.updatedAt) ?? data.date

      return {
        id,
        slug: data.slug,
        title: data.title,
        summary: data.summary,
        content: data.body,
        category: normalizeNewsCategory(data.category),
        image: data.image || "/images/news/placeholder.jpg",
        author: "[CONFIRM AUTHOR]",
        date: data.date,
        readingTime: estimateReadingTime(data.body),
        tags: [],
        featured: Boolean(data.featured),
        published: true,
        createdAt,
        updatedAt,
      }
    })
    .sort((a, b) => +new Date(b.date) - +new Date(a.date))
}

export async function getPublishedEventsFromFirestore(): Promise<ScoutEvent[]> {
  const docs = await readPublishedCollection("events", eventDocSchema)

  return docs
    .map(({ id, data }) => {
      const createdAt = toIsoString(data.createdAt) ?? data.date
      const updatedAt = toIsoString(data.updatedAt) ?? data.date

      return {
        id,
        slug: data.slug,
        title: data.title,
        description: data.description,
        date: data.date,
        time: data.time,
        location: data.location,
        image: data.image || "/images/events/placeholder.jpg",
        registrationOpen: Boolean(data.registrationOpen),
        registrationUrl: data.registrationUrl || "",
        category: data.category || "General",
        published: true,
        createdAt,
        updatedAt,
      }
    })
    .sort((a, b) => +new Date(a.date) - +new Date(b.date))
}

export async function getPublishedResourcesFromFirestore(): Promise<Resource[]> {
  const docs = await readPublishedCollection("resources", resourceDocSchema)

  return docs
    .map(({ id, data }) => {
      const createdAt = toIsoString(data.createdAt) ?? data.publishDate
      const updatedAt = toIsoString(data.updatedAt) ?? data.publishDate

      return {
        id,
        slug: data.slug,
        title: data.title,
        summary: data.description,
        category: normalizeResourceCategory(data.category),
        fileType: normalizeFileType(data.fileType),
        fileSize: data.fileSize || "[CONFIRM FILE SIZE]",
        publishDate: data.publishDate,
        downloadUrl: data.downloadUrl || "",
        published: true,
        createdAt,
        updatedAt,
      }
    })
    .sort((a, b) => +new Date(b.publishDate) - +new Date(a.publishDate))
}

export async function getPublishedUnitsFromFirestore(): Promise<ScoutUnit[]> {
  const docs = await readPublishedCollection("units", unitDocSchema)

  return docs.map(({ id, data }) => ({
    id,
    slug: data.slug,
    name: data.name,
    type: data.type,
    section: data.section,
    ward: data.ward,
    meetingDay: data.meetingDay,
    meetingTime: data.meetingTime,
    meetingLocation: data.meetingLocation,
    leaders: data.leaders,
    memberCount: data.memberCount,
    established: data.established,
    contactEmail: data.contactEmail,
    image: data.image || "/images/units/placeholder.jpg",
    published: true,
  }))
}
