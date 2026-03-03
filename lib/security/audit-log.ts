import "server-only"

import { serverEnv } from "@/lib/env/server"

type AuditSeverity = "info" | "warning" | "critical"

type AuditEventInput = {
  eventType: string
  severity?: AuditSeverity
  email?: string
  uid?: string
  ip?: string
  userAgent?: string
  method?: string
  path?: string
  status?: number
  reason?: string
  metadata?: Record<string, unknown>
}

const AUTH_FAILURE_TRACKER = new Map<string, { count: number; resetAt: number }>()
const UNAUTHORIZED_TRACKER = new Map<string, { count: number; resetAt: number }>()

function nowIso() {
  return new Date().toISOString()
}

function getWindowMs() {
  return serverEnv.ADMIN_SECURITY_ALERT_WINDOW_MINUTES * 60 * 1000
}

async function writeAuditDocument(collectionName: string, payload: Record<string, unknown>) {
  try {
    const { getAdminDb } = await import("@/lib/firebase/admin")
    await getAdminDb().collection(collectionName).add(payload)
  } catch (error) {
    console.error(`Failed to write ${collectionName} audit document`, error)
  }
}

function updateTracker(map: Map<string, { count: number; resetAt: number }>, key: string) {
  const now = Date.now()
  const windowMs = getWindowMs()
  const existing = map.get(key)

  if (!existing || existing.resetAt <= now) {
    const next = { count: 1, resetAt: now + windowMs }
    map.set(key, next)
    return next
  }

  const next = { ...existing, count: existing.count + 1 }
  map.set(key, next)
  return next
}

export async function logAuditEvent(input: AuditEventInput) {
  await writeAuditDocument("adminAuditLogs", {
    eventType: input.eventType,
    severity: input.severity || "info",
    email: input.email || "",
    uid: input.uid || "",
    ip: input.ip || "",
    userAgent: input.userAgent || "",
    method: input.method || "",
    path: input.path || "",
    status: input.status || 0,
    reason: input.reason || "",
    metadata: input.metadata || {},
    createdAt: nowIso(),
  })
}

export async function createSecurityAlert(title: string, details: Record<string, unknown>) {
  await writeAuditDocument("adminSecurityAlerts", {
    title,
    details,
    createdAt: nowIso(),
    acknowledged: false,
  })
  console.warn(`[Security Alert] ${title}`, details)
}

export async function logAuthEvent(params: {
  outcome: "success" | "failure"
  email?: string
  uid?: string
  ip?: string
  userAgent?: string
  method?: string
  path?: string
  status?: number
  reason?: string
  metadata?: Record<string, unknown>
}) {
  await logAuditEvent({
    eventType: `auth.${params.outcome}`,
    severity: params.outcome === "success" ? "info" : "warning",
    email: params.email,
    uid: params.uid,
    ip: params.ip,
    userAgent: params.userAgent,
    method: params.method,
    path: params.path,
    status: params.status,
    reason: params.reason,
    metadata: params.metadata,
  })

  if (params.outcome === "failure") {
    const trackerKey = `${params.email || "unknown"}|${params.ip || "unknown"}`
    const tracker = updateTracker(AUTH_FAILURE_TRACKER, trackerKey)

    if (tracker.count >= serverEnv.ADMIN_SECURITY_ALERT_THRESHOLD) {
      await createSecurityAlert("Repeated failed admin login attempts", {
        key: trackerKey,
        count: tracker.count,
        reason: params.reason || "unknown",
        windowMinutes: serverEnv.ADMIN_SECURITY_ALERT_WINDOW_MINUTES,
      })
    }
  }
}

export async function logAdminApiAccess(params: {
  email?: string
  uid?: string
  ip?: string
  userAgent?: string
  method: string
  path: string
  status: number
  outcome: "success" | "failure"
  reason?: string
}) {
  await logAuditEvent({
    eventType: `admin.api.${params.outcome}`,
    severity: params.outcome === "success" ? "info" : "warning",
    email: params.email,
    uid: params.uid,
    ip: params.ip,
    userAgent: params.userAgent,
    method: params.method,
    path: params.path,
    status: params.status,
    reason: params.reason,
  })
}

export async function trackUnauthorizedAccess(params: { ip: string; path: string; method: string; reason: string }) {
  const trackerKey = `${params.ip}|${params.path}`
  const tracker = updateTracker(UNAUTHORIZED_TRACKER, trackerKey)

  if (tracker.count >= serverEnv.ADMIN_SECURITY_ALERT_THRESHOLD) {
    await createSecurityAlert("Potential unauthorized admin access pattern", {
      ip: params.ip,
      path: params.path,
      method: params.method,
      reason: params.reason,
      count: tracker.count,
      windowMinutes: serverEnv.ADMIN_SECURITY_ALERT_WINDOW_MINUTES,
    })
  }
}

export async function logAdminDashboardFetch(params: {
  email: string
  outcome: "success" | "partial_failure" | "failure"
  errorKeys?: string[]
  metadata?: Record<string, unknown>
}) {
  await logAuditEvent({
    eventType: "admin.dashboard.fetch",
    severity: params.outcome === "success" ? "info" : "warning",
    email: params.email,
    reason: params.outcome,
    metadata: {
      ...(params.metadata || {}),
      errorKeys: params.errorKeys || [],
    },
  })
}
