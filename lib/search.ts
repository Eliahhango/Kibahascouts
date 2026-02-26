import { newsArticles, resources, scoutEvents, scoutUnits } from "@/lib/data"
import type { SearchFilter, SearchResult } from "@/lib/types"

export function buildSearchIndex(): SearchResult[] {
  const results: SearchResult[] = []

  newsArticles.forEach((news) => {
    results.push({
      type: "news",
      title: news.title,
      url: `/newsroom/${news.slug}`,
      description: news.summary,
    })
  })

  scoutEvents.forEach((event) => {
    results.push({
      type: "event",
      title: event.title,
      url: `/events/${event.slug}`,
      description: `${event.date} - ${event.location}`,
    })
  })

  resources.forEach((resource) => {
    results.push({
      type: "resource",
      title: resource.title,
      url: `/resources?category=${encodeURIComponent(resource.category)}`,
      description: `${resource.category} - ${resource.fileType} ${resource.fileSize}`,
    })
  })

  scoutUnits.forEach((unit) => {
    results.push({
      type: "unit",
      title: unit.name,
      url: `/units/${unit.slug}`,
      description: `${unit.ward} - ${unit.meetingDay}`,
    })
  })

  return results
}

export function searchIndex(
  index: SearchResult[],
  query: string,
  filter: SearchFilter,
  limit = 8,
): SearchResult[] {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return []

  return index
    .filter((entry) => {
      if (filter !== "all" && entry.type !== filter) {
        return false
      }

      return (
        entry.title.toLowerCase().includes(normalized) ||
        entry.description.toLowerCase().includes(normalized)
      )
    })
    .slice(0, limit)
}
