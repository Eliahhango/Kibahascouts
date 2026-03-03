"use client"

import { getCsrfTokenFromCookie } from "@/lib/auth/csrf-client"
import { getOrCreateAdminDeviceId } from "@/lib/auth/device-id"

export async function adminFetch(input: RequestInfo | URL, init?: RequestInit) {
  const headers = new Headers(init?.headers || {})
  const csrfToken = getCsrfTokenFromCookie()
  const deviceId = getOrCreateAdminDeviceId()

  if (csrfToken) {
    headers.set("x-csrf-token", csrfToken)
  }

  if (deviceId) {
    headers.set("x-admin-device-id", deviceId)
  }

  return fetch(input, {
    ...init,
    headers,
  })
}
