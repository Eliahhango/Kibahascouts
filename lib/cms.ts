import { leadershipProfiles, newsArticles, resources, scoutEvents, scoutUnits } from "@/lib/data"
import type { LeaderProfile, NewsArticle, Resource, ScoutEvent, ScoutUnit } from "@/lib/types"

const sampleModeEnabled = process.env.SAMPLE_MODE === "true"

async function withSampleFallback<T>(readFirestore: () => Promise<T[]>, fallback: T[]): Promise<T[]> {
  if (sampleModeEnabled) {
    return fallback
  }

  try {
    return await readFirestore()
  } catch {
    return []
  }
}

export async function getNewsFromCms(): Promise<NewsArticle[]> {
  return withSampleFallback(async () => {
    const { getPublishedNewsFromFirestore } = await import("@/lib/firebase/content")
    return getPublishedNewsFromFirestore()
  }, newsArticles)
}

export async function getEventsFromCms(): Promise<ScoutEvent[]> {
  return withSampleFallback(async () => {
    const { getPublishedEventsFromFirestore } = await import("@/lib/firebase/content")
    return getPublishedEventsFromFirestore()
  }, scoutEvents)
}

export async function getResourcesFromCms(): Promise<Resource[]> {
  return withSampleFallback(async () => {
    const { getPublishedResourcesFromFirestore } = await import("@/lib/firebase/content")
    return getPublishedResourcesFromFirestore()
  }, resources)
}

export async function getUnitsFromCms(): Promise<ScoutUnit[]> {
  return withSampleFallback(async () => {
    const { getPublishedUnitsFromFirestore } = await import("@/lib/firebase/content")
    return getPublishedUnitsFromFirestore()
  }, scoutUnits)
}

export async function getLeadersFromCms(): Promise<LeaderProfile[]> {
  return withSampleFallback(async () => {
    const { getPublishedLeadersFromFirestore } = await import("@/lib/firebase/content")
    return getPublishedLeadersFromFirestore()
  }, leadershipProfiles)
}
