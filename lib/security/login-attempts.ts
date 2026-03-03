import "server-only"

import { createHash } from "crypto"
import { serverEnv } from "@/lib/env/server"
import { createSecurityAlert } from "@/lib/security/audit-log"

type AttemptRecord = {
  email: string
  ip: string
  count: number
  resetAt: string
  updatedAt: string
}

function buildAttemptKey(email: string, ip: string) {
  return createHash("sha256").update(`${email}|${ip}`).digest("hex")
}

function getWindowMs() {
  return serverEnv.ADMIN_LOGIN_WINDOW_MINUTES * 60 * 1000
}

function getMaxAttempts() {
  return serverEnv.ADMIN_LOGIN_MAX_ATTEMPTS
}

function nowIso() {
  return new Date().toISOString()
}

function toRetryAfterSeconds(resetAtIso: string) {
  return Math.max(1, Math.ceil((new Date(resetAtIso).getTime() - Date.now()) / 1000))
}

async function getAttemptsCollection() {
  const { getAdminDb } = await import("@/lib/firebase/admin")
  return getAdminDb().collection("adminLoginAttempts")
}

async function readAttempt(email: string, ip: string) {
  const collection = await getAttemptsCollection()
  const attemptKey = buildAttemptKey(email, ip)
  const docRef = collection.doc(attemptKey)
  const doc = await docRef.get()

  if (!doc.exists) {
    return { docRef, record: null as AttemptRecord | null }
  }

  const data = doc.data() as AttemptRecord
  return { docRef, record: data }
}

export async function checkLoginAttemptLimit(email: string, ip: string) {
  const { docRef, record } = await readAttempt(email, ip)

  if (!record) {
    return {
      allowed: true,
      attemptsRemaining: getMaxAttempts(),
      retryAfterSeconds: 0,
    }
  }

  const resetAtTime = new Date(record.resetAt).getTime()
  if (resetAtTime <= Date.now()) {
    await docRef.delete()
    return {
      allowed: true,
      attemptsRemaining: getMaxAttempts(),
      retryAfterSeconds: 0,
    }
  }

  if (record.count >= getMaxAttempts()) {
    return {
      allowed: false,
      attemptsRemaining: 0,
      retryAfterSeconds: toRetryAfterSeconds(record.resetAt),
    }
  }

  return {
    allowed: true,
    attemptsRemaining: Math.max(0, getMaxAttempts() - record.count),
    retryAfterSeconds: 0,
  }
}

export async function recordFailedLoginAttempt(email: string, ip: string, reason: string) {
  const { docRef, record } = await readAttempt(email, ip)
  const now = Date.now()
  const nowIsoValue = nowIso()

  let next: AttemptRecord
  if (!record || new Date(record.resetAt).getTime() <= now) {
    next = {
      email,
      ip,
      count: 1,
      resetAt: new Date(now + getWindowMs()).toISOString(),
      updatedAt: nowIsoValue,
    }
  } else {
    next = {
      ...record,
      count: record.count + 1,
      updatedAt: nowIsoValue,
    }
  }

  await docRef.set(next)

  if (next.count >= getMaxAttempts()) {
    await createSecurityAlert("Admin login attempts exceeded threshold", {
      email,
      ip,
      count: next.count,
      reason,
      windowMinutes: serverEnv.ADMIN_LOGIN_WINDOW_MINUTES,
    })
  }

  return {
    attemptsRemaining: Math.max(0, getMaxAttempts() - next.count),
    retryAfterSeconds: toRetryAfterSeconds(next.resetAt),
  }
}

export async function clearLoginAttempts(email: string, ip: string) {
  const collection = await getAttemptsCollection()
  const attemptKey = buildAttemptKey(email, ip)
  await collection.doc(attemptKey).delete()
}
