import { unstable_noStore as noStore } from "next/cache"
import { leadershipProfiles, mediaItems, newsArticles, resources, scoutEvents, scoutUnits } from "@/lib/data"
import type { HomepageSettings, LeaderProfile, MediaItem, NewsArticle, Resource, ScoutEvent, ScoutUnit } from "@/lib/types"
import { getDefaultHomepageSettings } from "@/lib/firebase/homepage-settings"

const sampleModeEnabled = process.env.SAMPLE_MODE === "true"

async function withSampleFallback<T>(readFirestore: () => Promise<T[]>, fallback: T[]): Promise<T[]> {
  noStore()

  if (sampleModeEnabled) {
    return fallback
  }

  try {
    return await readFirestore()
  } catch {
    return []
  }
}

async function withSampleFallbackItem<T>(readFirestore: () => Promise<T>, fallback: T): Promise<T> {
  noStore()

  if (sampleModeEnabled) {
    return fallback
  }

  try {
    return await readFirestore()
  } catch {
    return fallback
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

export async function getMediaItemsFromCms(): Promise<MediaItem[]> {
  return withSampleFallback(async () => {
    const { getPublishedMediaItemsFromFirestore } = await import("@/lib/firebase/content")
    return getPublishedMediaItemsFromFirestore()
  }, mediaItems)
}

export async function getHomepageSettingsFromCms(): Promise<HomepageSettings> {
  return withSampleFallbackItem(async () => {
    const { getHomepageSettingsFromFirestore } = await import("@/lib/firebase/homepage-settings")
    return getHomepageSettingsFromFirestore()
  }, getDefaultHomepageSettings())
}
