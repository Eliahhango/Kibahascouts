import "server-only"

import { serverEnv } from "@/lib/env/server"
import { createSecurityAlert } from "@/lib/security/audit-log"

type AttemptState = {
  count: number
  resetAt: number
}

const ATTEMPT_STORE = new Map<string, AttemptState>()

function buildAttemptKey(email: string, ip: string) {
  return `${email}|${ip}`
}

function pruneExpiredAttempts() {
  const now = Date.now()
  for (const [key, state] of ATTEMPT_STORE.entries()) {
    if (state.resetAt <= now) {
      ATTEMPT_STORE.delete(key)
    }
  }
}

function getWindowMs() {
  return serverEnv.ADMIN_LOGIN_WINDOW_MINUTES * 60 * 1000
}

function getMaxAttempts() {
  return serverEnv.ADMIN_LOGIN_MAX_ATTEMPTS
}

export function checkLoginAttemptLimit(email: string, ip: string) {
  pruneExpiredAttempts()

  const key = buildAttemptKey(email, ip)
  const state = ATTEMPT_STORE.get(key)
  if (!state) {
    return {
      allowed: true,
      attemptsRemaining: getMaxAttempts(),
      retryAfterSeconds: 0,
    }
  }

  if (state.count >= getMaxAttempts()) {
    const now = Date.now()
    return {
      allowed: false,
      attemptsRemaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((state.resetAt - now) / 1000)),
    }
  }

  return {
    allowed: true,
    attemptsRemaining: Math.max(0, getMaxAttempts() - state.count),
    retryAfterSeconds: 0,
  }
}

export async function recordFailedLoginAttempt(email: string, ip: string, reason: string) {
  pruneExpiredAttempts()

  const key = buildAttemptKey(email, ip)
  const existing = ATTEMPT_STORE.get(key)
  const now = Date.now()

  const next: AttemptState = existing && existing.resetAt > now
    ? { ...existing, count: existing.count + 1 }
    : { count: 1, resetAt: now + getWindowMs() }

  ATTEMPT_STORE.set(key, next)

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
    retryAfterSeconds: Math.max(1, Math.ceil((next.resetAt - now) / 1000)),
  }
}

export function clearLoginAttempts(email: string, ip: string) {
  ATTEMPT_STORE.delete(buildAttemptKey(email, ip))
}
