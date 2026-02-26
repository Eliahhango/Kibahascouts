import { leadershipProfiles, newsArticles, resources, scoutEvents, scoutUnits } from "@/lib/data"
import type { LeaderProfile, NewsArticle, Resource, ScoutEvent, ScoutUnit } from "@/lib/types"

const cmsBaseUrl = process.env.CMS_BASE_URL
const cmsApiToken = process.env.CMS_API_TOKEN

type CmsCollection = "news" | "events" | "resources" | "units" | "leaders"

async function fetchCollection<T>(collection: CmsCollection, fallback: T[]): Promise<T[]> {
  if (!cmsBaseUrl) {
    return fallback
  }

  try {
    const response = await fetch(`${cmsBaseUrl.replace(/\/$/, "")}/api/${collection}`, {
      headers: {
        "Content-Type": "application/json",
        ...(cmsApiToken ? { Authorization: `Bearer ${cmsApiToken}` } : {}),
      },
      next: { revalidate: 60 },
    })

    if (!response.ok) {
      return fallback
    }

    const payload = (await response.json()) as { data?: T[] }
    return payload.data && payload.data.length > 0 ? payload.data : fallback
  } catch {
    return fallback
  }
}

export async function getNewsFromCms(): Promise<NewsArticle[]> {
  return fetchCollection("news", newsArticles)
}

export async function getEventsFromCms(): Promise<ScoutEvent[]> {
  return fetchCollection("events", scoutEvents)
}

export async function getResourcesFromCms(): Promise<Resource[]> {
  return fetchCollection("resources", resources)
}

export async function getUnitsFromCms(): Promise<ScoutUnit[]> {
  return fetchCollection("units", scoutUnits)
}

export async function getLeadersFromCms(): Promise<LeaderProfile[]> {
  return fetchCollection("leaders", leadershipProfiles)
}
