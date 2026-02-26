import "server-only"

type DashboardCounts = {
  publishedNews: number
  publishedEvents: number
  publishedResources: number
  unreadMessages: number
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

export async function getAdminDashboardCounts(): Promise<DashboardCounts> {
  const [publishedNews, publishedEvents, publishedResources, unreadMessages] = await Promise.all([
    getQueryCount("news", "published", true),
    getQueryCount("events", "published", true),
    getQueryCount("resources", "published", true),
    getQueryCount("contactMessages", "status", "unread"),
  ])

  return {
    publishedNews,
    publishedEvents,
    publishedResources,
    unreadMessages,
  }
}
