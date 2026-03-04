"use client"

import { useEffect } from "react"
import { usePathname, useSearchParams } from "next/navigation"

const VISITOR_ID_STORAGE_KEY = "kibaha_site_visitor_id"
const VISIT_STATE_STORAGE_KEY = "kibaha_site_visit_state"
const VISIT_THROTTLE_MS = 30_000

type VisitState = {
  key: string
  at: number
}

function createVisitorId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID()
  }

  return `${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`
}

function getOrCreateVisitorId() {
  try {
    const existing = window.localStorage.getItem(VISITOR_ID_STORAGE_KEY)
    if (existing) {
      return existing
    }

    const visitorId = createVisitorId()
    window.localStorage.setItem(VISITOR_ID_STORAGE_KEY, visitorId)
    return visitorId
  } catch {
    return ""
  }
}

function readVisitState() {
  try {
    const raw = window.sessionStorage.getItem(VISIT_STATE_STORAGE_KEY)
    if (!raw) {
      return null
    }
    const parsed = JSON.parse(raw) as VisitState
    if (typeof parsed.key !== "string" || typeof parsed.at !== "number") {
      return null
    }
    return parsed
  } catch {
    return null
  }
}

function writeVisitState(state: VisitState) {
  try {
    window.sessionStorage.setItem(VISIT_STATE_STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Storage may be disabled; ignore silently.
  }
}

function shouldTrackPath(pathname: string) {
  return !pathname.startsWith("/admin") && !pathname.startsWith("/api") && pathname !== ""
}

export function SiteVisitTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const search = searchParams.toString()

  useEffect(() => {
    if (!pathname || !shouldTrackPath(pathname)) {
      return
    }

    const key = `${pathname}?${search}`
    const now = Date.now()
    const previous = readVisitState()

    if (previous && previous.key === key && now - previous.at < VISIT_THROTTLE_MS) {
      return
    }

    writeVisitState({ key, at: now })

    const payload = JSON.stringify({
      path: pathname,
      search: search ? `?${search}` : "",
      referrer: document.referrer || "",
      visitorId: getOrCreateVisitorId(),
    })

    const beaconSent = typeof navigator.sendBeacon === "function"
      ? navigator.sendBeacon("/api/telemetry/visit", new Blob([payload], { type: "application/json" }))
      : false

    if (!beaconSent) {
      void fetch("/api/telemetry/visit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true,
      }).catch(() => null)
    }
  }, [pathname, search])

  return null
}
