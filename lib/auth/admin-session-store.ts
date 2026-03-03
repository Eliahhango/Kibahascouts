import "server-only"

import { createHash } from "crypto"
import { serverEnv } from "@/lib/env/server"
import { getRequestIp, getRequestUserAgent } from "@/lib/security/request-context"
import type { AdminRole } from "@/lib/auth/admin-users"

type SessionWriteParams = {
  sessionCookie: string
  uid: string
  email: string
  role: AdminRole
  expiresAt: string
  request: Request
  previousSessionCookie?: string | null
}

type TrackedSession = {
  uid: string
  email: string
  role: AdminRole
  deviceId: string
  ip: string
  userAgent: string
  createdAt: string
  updatedAt: string
  lastSeenAt: string
  expiresAt: string
  active: boolean
  revokedAt?: string
  revokedReason?: string
}

const ADMIN_SESSIONS_COLLECTION = "adminSessions"

function hashSessionCookie(sessionCookie: string) {
  return createHash("sha256").update(sessionCookie).digest("hex")
}

function normalizeDeviceId(request: Request) {
  const raw = request.headers.get("x-admin-device-id") || "unknown-device"
  return raw.slice(0, 120)
}

async function getAdminSessionsCollection() {
  const { getAdminDb } = await import("@/lib/firebase/admin")
  return getAdminDb().collection(ADMIN_SESSIONS_COLLECTION)
}

async function enforceConcurrentSessionLimit(uid: string) {
  const collection = await getAdminSessionsCollection()
  const snapshot = await collection.where("uid", "==", uid).get()
  const activeDocs = snapshot.docs.filter((doc) => Boolean(doc.data().active))

  if (activeDocs.length < serverEnv.ADMIN_MAX_CONCURRENT_SESSIONS) {
    return
  }

  const sorted = activeDocs
    .map((doc) => ({ id: doc.id, ...doc.data() }))
    .sort((a, b) => String(a.createdAt || "").localeCompare(String(b.createdAt || "")))

  const sessionsToRevoke = sorted.slice(0, activeDocs.length - serverEnv.ADMIN_MAX_CONCURRENT_SESSIONS + 1)
  const now = new Date().toISOString()
  const writer = collection.firestore.batch()

  for (const session of sessionsToRevoke) {
    const docRef = collection.doc(session.id)
    writer.update(docRef, {
      active: false,
      revokedAt: now,
      revokedReason: "max_concurrent_sessions",
      updatedAt: now,
    })
  }

  await writer.commit()
}

export async function createTrackedAdminSession(params: SessionWriteParams) {
  if (params.previousSessionCookie) {
    await revokeTrackedAdminSession(params.previousSessionCookie, "session_replaced")
  }

  await enforceConcurrentSessionLimit(params.uid)

  const now = new Date().toISOString()
  const sessionHash = hashSessionCookie(params.sessionCookie)
  const collection = await getAdminSessionsCollection()

  const payload: TrackedSession = {
    uid: params.uid,
    email: params.email,
    role: params.role,
    deviceId: normalizeDeviceId(params.request),
    ip: getRequestIp(params.request),
    userAgent: getRequestUserAgent(params.request),
    createdAt: now,
    updatedAt: now,
    lastSeenAt: now,
    expiresAt: params.expiresAt,
    active: true,
  }

  await collection.doc(sessionHash).set(payload)
}

export async function getTrackedAdminSession(sessionCookie: string) {
  const sessionHash = hashSessionCookie(sessionCookie)
  const collection = await getAdminSessionsCollection()
  const doc = await collection.doc(sessionHash).get()

  if (!doc.exists) {
    return null
  }

  const data = doc.data() as TrackedSession
  if (!data.active) {
    return null
  }

  if (new Date(data.expiresAt).getTime() <= Date.now()) {
    return null
  }

  return data
}

export async function touchTrackedAdminSession(sessionCookie: string) {
  const sessionHash = hashSessionCookie(sessionCookie)
  const collection = await getAdminSessionsCollection()
  const docRef = collection.doc(sessionHash)
  const existing = await docRef.get()
  if (!existing.exists) {
    return
  }

  const nowIso = new Date().toISOString()
  const data = existing.data() as TrackedSession
  const previousSeen = data.lastSeenAt ? new Date(data.lastSeenAt).getTime() : 0
  if (Date.now() - previousSeen < 60_000) {
    return
  }

  await docRef.update({
    lastSeenAt: nowIso,
    updatedAt: nowIso,
  })
}

export async function revokeTrackedAdminSession(sessionCookie: string, reason: string) {
  const sessionHash = hashSessionCookie(sessionCookie)
  const collection = await getAdminSessionsCollection()
  const docRef = collection.doc(sessionHash)
  const existing = await docRef.get()
  if (!existing.exists) {
    return
  }

  const now = new Date().toISOString()
  await docRef.update({
    active: false,
    revokedAt: now,
    revokedReason: reason,
    updatedAt: now,
  })
}
