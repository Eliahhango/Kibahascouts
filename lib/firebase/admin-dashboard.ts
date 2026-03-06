import "server-only"

import { listAdminUsers } from "@/lib/auth/admin-users"
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

export type DashboardSummary = DashboardCounts & {
  publishedMedia: DashboardCountItem
  pageVisitsThisMonth: DashboardCountItem
  activeAdmins: DashboardCountItem
  securityAlerts: DashboardCountItem
}

export type DashboardVisitPoint = {
  isoDate: string
  label: string
  visits: number
}

export type DashboardContentBreakdownItem = {
  key: "news" | "events" | "resources" | "media"
  label: string
  value: number
  percentage: number
  color: string
}

export type DashboardActivityItem = {
  id: string
  label: string
  href: string
  type: "news" | "event" | "message" | "security" | "system"
  timestamp: string
  timeAgo: string
}

export type DashboardOverview = {
  summary: DashboardSummary
  visitsSeries: DashboardVisitPoint[]
  contentBreakdown: DashboardContentBreakdownItem[]
  recentActivity: DashboardActivityItem[]
  pendingActions: {
    inbox: number
    security: number
  }
}

export type DashboardNavSummary = {
  unreadMessages: number
  securityAlerts: number
  pendingInvites: number
  pendingMembershipApplications: number
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

const contentBreakdownColors: Record<DashboardContentBreakdownItem["key"], string> = {
  news: "#1e3a2f",
  events: "#2f6e4c",
  resources: "#c9910a",
  media: "#7f8a93",
}

function toErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback
}

function getTodayUtcDate() {
  const now = new Date()
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
}

function getMonthStartIso() {
  const now = new Date()
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString()
}

function getBestTimestamp(data: Record<string, unknown>, ...candidateKeys: string[]) {
  for (const key of candidateKeys) {
    const value = data[key]
    if (typeof value === "string" && value.trim().length > 0) {
      return value
    }
  }
  return new Date(0).toISOString()
}

function formatRelativeTime(isoTimestamp: string) {
  const parsed = Date.parse(isoTimestamp)
  if (Number.isNaN(parsed)) {
    return "Unknown time"
  }

  const diffMs = Date.now() - parsed
  const diffMinutes = Math.floor(diffMs / 60_000)
  if (diffMinutes < 1) return "Just now"
  if (diffMinutes < 60) return `${diffMinutes}m ago`

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours}h ago`

  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `${diffDays}d ago`

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(parsed))
}

function buildLastThirtyDays() {
  const formatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  })
  const todayUtc = getTodayUtcDate()

  return Array.from({ length: 30 }, (_, index) => {
    const day = new Date(todayUtc)
    day.setUTCDate(todayUtc.getUTCDate() - (29 - index))
    return {
      isoDate: day.toISOString().slice(0, 10),
      label: formatter.format(day),
    }
  })
}

async function readQueryCount(query: FirebaseFirestore.Query) {
  try {
    const aggregateResult = await query.count().get()
    return Number(aggregateResult.data().count || 0)
  } catch {
    const snapshot = await query.get()
    return snapshot.size
  }
}

async function getFieldMatchCount(collectionName: string, field: string, value: unknown) {
  const { getAdminDb } = await import("@/lib/firebase/admin")
  const db = getAdminDb()
  return readQueryCount(db.collection(collectionName).where(field, "==", value))
}

async function getVisitsThisMonthCount() {
  const { getAdminDb } = await import("@/lib/firebase/admin")
  const db = getAdminDb()
  return readQueryCount(db.collection("siteVisitorLogs").where("createdAt", ">=", getMonthStartIso()))
}

async function getUserStateCounts() {
  const users = await listAdminUsers()
  const activeAdmins = users.filter((user) => user.active && user.onboardingStatus === "approved").length
  const pendingInvites = users.filter((user) => user.onboardingStatus === "invited" || user.onboardingStatus === "pending").length
  return { activeAdmins, pendingInvites }
}

async function resolveCount(work: () => Promise<number>): Promise<DashboardCountItem> {
  try {
    const value = await work()
    return { value, error: null }
  } catch (error) {
    return {
      value: 0,
      error: toErrorMessage(error, "Count unavailable."),
    }
  }
}

async function getDailyVisitsLastThirtyDays() {
  const days = buildLastThirtyDays()
  const visitByDate = new Map<string, number>(days.map((day) => [day.isoDate, 0]))
  const firstDayIso = `${days[0]?.isoDate || getTodayUtcDate().toISOString().slice(0, 10)}T00:00:00.000Z`

  try {
    const { getAdminDb } = await import("@/lib/firebase/admin")
    const snapshot = await getAdminDb().collection("siteVisitorLogs").where("createdAt", ">=", firstDayIso).get()

    snapshot.forEach((doc) => {
      const data = doc.data() as Record<string, unknown>
      const createdAt = typeof data.createdAt === "string" ? data.createdAt : ""
      const dateKey = createdAt.slice(0, 10)
      if (!visitByDate.has(dateKey)) {
        return
      }
      visitByDate.set(dateKey, (visitByDate.get(dateKey) || 0) + 1)
    })
  } catch {
    // Leave zero-filled trend if telemetry query fails.
  }

  return days.map((day) => ({
    isoDate: day.isoDate,
    label: day.label,
    visits: visitByDate.get(day.isoDate) || 0,
  }))
}

async function readCollectionWithFallback(collectionName: string, orderField: string, limitCount: number) {
  const { getAdminDb } = await import("@/lib/firebase/admin")
  const collection = getAdminDb().collection(collectionName)

  try {
    return await collection.orderBy(orderField, "desc").limit(limitCount).get()
  } catch {
    return collection.limit(limitCount).get()
  }
}

async function getRecentActivity() {
  const events: DashboardActivityItem[] = []

  try {
    const [newsSnap, eventSnap, messageSnap, securitySnap] = await Promise.all([
      readCollectionWithFallback("news", "updatedAt", 3),
      readCollectionWithFallback("events", "updatedAt", 3),
      readCollectionWithFallback("contactMessages", "createdAt", 3),
      readCollectionWithFallback("adminSecurityAlerts", "createdAt", 2),
    ])

    newsSnap.docs.forEach((doc) => {
      const data = doc.data() as Record<string, unknown>
      const title = typeof data.title === "string" && data.title.trim() ? data.title : "Untitled article"
      const timestamp = getBestTimestamp(data, "updatedAt", "createdAt")
      events.push({
        id: `news-${doc.id}`,
        label: `News article updated: ${title}`,
        href: "/admin/news",
        type: "news",
        timestamp,
        timeAgo: formatRelativeTime(timestamp),
      })
    })

    eventSnap.docs.forEach((doc) => {
      const data = doc.data() as Record<string, unknown>
      const title = typeof data.title === "string" && data.title.trim() ? data.title : "Untitled event"
      const timestamp = getBestTimestamp(data, "updatedAt", "createdAt")
      events.push({
        id: `event-${doc.id}`,
        label: `Event updated: ${title}`,
        href: "/admin/events",
        type: "event",
        timestamp,
        timeAgo: formatRelativeTime(timestamp),
      })
    })

    messageSnap.docs.forEach((doc) => {
      const data = doc.data() as Record<string, unknown>
      const sender = typeof data.name === "string" && data.name.trim() ? data.name : "New sender"
      const timestamp = getBestTimestamp(data, "createdAt", "updatedAt")
      events.push({
        id: `message-${doc.id}`,
        label: `New contact message from ${sender}`,
        href: "/admin/messages",
        type: "message",
        timestamp,
        timeAgo: formatRelativeTime(timestamp),
      })
    })

    securitySnap.docs.forEach((doc) => {
      const data = doc.data() as Record<string, unknown>
      const title = typeof data.title === "string" && data.title.trim() ? data.title : "Security alert"
      const timestamp = getBestTimestamp(data, "createdAt", "updatedAt")
      events.push({
        id: `security-${doc.id}`,
        label: title,
        href: "/admin/security",
        type: "security",
        timestamp,
        timeAgo: formatRelativeTime(timestamp),
      })
    })
  } catch {
    // Keep fallback activity timeline.
  }

  if (events.length === 0) {
    return [
      {
        id: "default-1",
        label: "No recent admin actions recorded yet",
        href: "/admin/security",
        type: "system" as const,
        timestamp: new Date().toISOString(),
        timeAgo: "Just now",
      },
    ]
  }

  return events
    .sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp))
    .slice(0, 8)
}

function getBreakdownPercentage(value: number, total: number) {
  if (total <= 0) {
    return 0
  }
  return Math.round((value / total) * 100)
}

export async function getAdminDashboardSummary() {
  const [
    publishedNews,
    publishedEvents,
    publishedResources,
    publishedMedia,
    unreadMessages,
    pageVisitsThisMonth,
    securityAlerts,
    pendingMembershipApplications,
    userState,
  ] = await Promise.all([
    resolveCount(() => getFieldMatchCount("news", "published", true)),
    resolveCount(() => getFieldMatchCount("events", "published", true)),
    resolveCount(() => getFieldMatchCount("resources", "published", true)),
    resolveCount(() => getFieldMatchCount("mediaItems", "published", true)),
    resolveCount(() => getFieldMatchCount("contactMessages", "status", "unread")),
    resolveCount(() => getVisitsThisMonthCount()),
    resolveCount(() => getFieldMatchCount("adminSecurityAlerts", "acknowledged", false)),
    resolveCount(() => getFieldMatchCount("membershipApplications", "status", "pending")),
    getUserStateCounts().catch(() => ({ activeAdmins: 0, pendingInvites: 0 })),
  ])

  const activeAdmins: DashboardCountItem = { value: userState.activeAdmins, error: null }

  return {
    summary: {
      publishedNews,
      publishedEvents,
      publishedResources,
      publishedMedia,
      unreadMessages,
      pageVisitsThisMonth,
      activeAdmins,
      securityAlerts,
    } satisfies DashboardSummary,
    navSummary: {
      unreadMessages: unreadMessages.value,
      securityAlerts: securityAlerts.value,
      pendingInvites: userState.pendingInvites,
      pendingMembershipApplications: pendingMembershipApplications.value,
    } satisfies DashboardNavSummary,
  }
}

export async function getAdminDashboardCounts(adminEmail: string): Promise<DashboardCounts> {
  const counts = { ...defaultDashboardCounts }
  const settledResults = await Promise.allSettled(
    countQueries.map((config) => getFieldMatchCount(config.collectionName, config.field, config.value)),
  )

  const errorKeys: string[] = []

  settledResults.forEach((result, index) => {
    const config = countQueries[index]
    if (result.status === "fulfilled") {
      counts[config.key] = { value: result.value, error: null }
      return
    }

    counts[config.key] = { value: 0, error: toErrorMessage(result.reason, "Count unavailable.") }
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

export async function getAdminDashboardOverview(adminEmail: string): Promise<DashboardOverview> {
  const [summaryPayload, visitsSeries, recentActivity] = await Promise.all([
    getAdminDashboardSummary(),
    getDailyVisitsLastThirtyDays(),
    getRecentActivity(),
  ])

  const summary = summaryPayload.summary
  const breakdownTotal =
    summary.publishedNews.value +
    summary.publishedEvents.value +
    summary.publishedResources.value +
    summary.publishedMedia.value

  const contentBreakdown: DashboardContentBreakdownItem[] = [
    {
      key: "news",
      label: "News",
      value: summary.publishedNews.value,
      percentage: getBreakdownPercentage(summary.publishedNews.value, breakdownTotal),
      color: contentBreakdownColors.news,
    },
    {
      key: "events",
      label: "Events",
      value: summary.publishedEvents.value,
      percentage: getBreakdownPercentage(summary.publishedEvents.value, breakdownTotal),
      color: contentBreakdownColors.events,
    },
    {
      key: "resources",
      label: "Resources",
      value: summary.publishedResources.value,
      percentage: getBreakdownPercentage(summary.publishedResources.value, breakdownTotal),
      color: contentBreakdownColors.resources,
    },
    {
      key: "media",
      label: "Media",
      value: summary.publishedMedia.value,
      percentage: getBreakdownPercentage(summary.publishedMedia.value, breakdownTotal),
      color: contentBreakdownColors.media,
    },
  ]

  const errorKeys = Object.entries(summary)
    .filter(([, item]) => Boolean(item.error))
    .map(([key]) => key)

  const outcome = errorKeys.length === 0 ? "success" : errorKeys.length === Object.keys(summary).length ? "failure" : "partial_failure"
  await logAdminDashboardFetch({
    email: adminEmail,
    outcome,
    errorKeys,
  })

  return {
    summary,
    visitsSeries,
    contentBreakdown,
    recentActivity,
    pendingActions: {
      inbox: summary.unreadMessages.value,
      security: summary.securityAlerts.value,
    },
  }
}
