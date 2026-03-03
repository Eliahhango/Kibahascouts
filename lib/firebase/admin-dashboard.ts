import "server-only"

import { logAdminDashboardFetch } from "@/lib/security/audit-log"

export type DashboardCountItem = {
  value: number
  error: string | null
}

export type DashboardCounts = {
  publishedNews: DashboardCountItem
  publishedEvents: DashboardCountItem
  publishedResources: DashboardCountItem
  unreadMessages: DashboardCountItem
}

type CountQueryConfig = {
  key: keyof DashboardCounts
  collectionName: string
  field: string
  value: unknown
}

const countQueries: CountQueryConfig[] = [
  { key: "publishedNews", collectionName: "news", field: "published", value: true },
  { key: "publishedEvents", collectionName: "events", field: "published", value: true },
  { key: "publishedResources", collectionName: "resources", field: "published", value: true },
  { key: "unreadMessages", collectionName: "contactMessages", field: "status", value: "unread" },
]

const defaultDashboardCounts: DashboardCounts = {
  publishedNews: { value: 0, error: null },
  publishedEvents: { value: 0, error: null },
  publishedResources: { value: 0, error: null },
  unreadMessages: { value: 0, error: null },
}

async function getQueryCount(collectionName: string, field: string, value: unknown) {
  const { getAdminDb } = await import("@/lib/firebase/admin")
  const db = getAdminDb()
  const query = db.collection(collectionName).where(field, "==", value)

  try {
    const aggregateResult = await query.count().get()
    return Number(aggregateResult.data().count || 0)
  } catch {
    const snapshot = await query.get()
    return snapshot.size
  }
}

export async function getAdminDashboardCounts(adminEmail: string): Promise<DashboardCounts> {
  const counts = { ...defaultDashboardCounts }
  const settledResults = await Promise.allSettled(
    countQueries.map((config) => getQueryCount(config.collectionName, config.field, config.value)),
  )

  const errorKeys: string[] = []

  settledResults.forEach((result, index) => {
    const config = countQueries[index]
    if (result.status === "fulfilled") {
      counts[config.key] = { value: result.value, error: null }
      return
    }

    const message = result.reason instanceof Error ? result.reason.message : "Count unavailable."
    counts[config.key] = { value: 0, error: message }
    errorKeys.push(config.key)
  })

  const outcome = errorKeys.length === 0 ? "success" : errorKeys.length === countQueries.length ? "failure" : "partial_failure"
  await logAdminDashboardFetch({
    email: adminEmail,
    outcome,
    errorKeys,
  })

  return counts
}
