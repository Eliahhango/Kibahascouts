import type { MetadataRoute } from "next"
import { programmes } from "@/lib/data"
import { getEventsFromCms, getNewsFromCms, getUnitsFromCms } from "@/lib/cms"

const siteUrl = "https://tsa-kibaha.org"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [newsArticles, scoutEvents, scoutUnits] = await Promise.all([
    getNewsFromCms(),
    getEventsFromCms(),
    getUnitsFromCms(),
  ])
  const staticRoutes = [
    "",
    "/about",
    "/programmes",
    "/newsroom",
    "/events",
    "/resources",
    "/units",
    "/safety",
    "/join",
    "/contact",
  ]

  const staticEntries = staticRoutes.map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.8,
  }))

  const newsEntries = newsArticles.map((article) => ({
    url: `${siteUrl}/newsroom/${article.slug}`,
    lastModified: new Date(article.date),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }))

  const eventEntries = scoutEvents.map((event) => ({
    url: `${siteUrl}/events/${event.slug}`,
    lastModified: new Date(event.date),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }))

  const unitEntries = scoutUnits.map((unit) => ({
    url: `${siteUrl}/units/${unit.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }))

  const programmeEntries = programmes.map((programme) => ({
    url: `${siteUrl}/programmes/${programme.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }))

  return [...staticEntries, ...newsEntries, ...eventEntries, ...unitEntries, ...programmeEntries]
}
