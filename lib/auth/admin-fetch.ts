"use client"

import { getCsrfTokenFromCookie } from "@/lib/auth/csrf-client"
import { getOrCreateAdminDeviceId } from "@/lib/auth/device-id"

const MIN_ADMIN_FETCH_DELAY_MS = 420

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function adminFetch(input: RequestInfo | URL, init?: RequestInit) {
  const startedAt = Date.now()
  const headers = new Headers(init?.headers || {})
  const csrfToken = getCsrfTokenFromCookie()
  const deviceId = getOrCreateAdminDeviceId()

  if (csrfToken) {
    headers.set("x-csrf-token", csrfToken)
  }

  if (deviceId) {
    headers.set("x-admin-device-id", deviceId)
  }

  const response = await fetch(input, {
    ...init,
    headers,
  })

  const elapsed = Date.now() - startedAt
  const remaining = MIN_ADMIN_FETCH_DELAY_MS - elapsed
  if (remaining > 0) {
    await delay(remaining)
  }

  return response
}
