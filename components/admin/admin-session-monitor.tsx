"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { usePathname } from "next/navigation"
import { getFirebaseClientAuth } from "@/lib/firebase/client"
import { adminFetch } from "@/lib/auth/admin-fetch"
import { Button } from "@/components/ui/button"

type SessionStatus = {
  email: string
  role: string
  expiresAt: string
  minutesRemaining: number
  refreshBeforeMinutes: number
}

type SessionStatusResponse = {
  ok: boolean
  data?: SessionStatus
  error?: string
}

export function AdminSessionMonitor() {
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [status, setStatus] = useState<SessionStatus | null>(null)
  const [error, setError] = useState<string | null>(null)
  const lastRefreshAttemptRef = useRef(0)

  const loadStatus = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/session", { method: "GET", cache: "no-store" })
      const payload = (await response.json().catch(() => null)) as SessionStatusResponse | null

      if (!response.ok || !payload?.ok || !payload.data) {
        throw new Error(payload?.error || "Unable to verify admin session.")
      }

      setStatus(payload.data)
      setError(null)
    } catch (statusError) {
      setError(statusError instanceof Error ? statusError.message : "Unable to verify admin session.")
      setStatus(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const refreshSession = useCallback(async () => {
    if (isRefreshing) {
      return
    }

    setIsRefreshing(true)
    setError(null)

    try {
      const auth = getFirebaseClientAuth()
      const user = auth.currentUser

      if (!user) {
        throw new Error("Session is expiring. Please sign in again.")
      }

      const idToken = await user.getIdToken(true)
      const response = await adminFetch("/api/admin/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          idToken,
          mode: "refresh",
        }),
      })

      const payload = (await response.json().catch(() => null)) as { ok?: boolean; error?: string } | null
      if (!response.ok || !payload?.ok) {
        throw new Error(payload?.error || "Unable to refresh session.")
      }

      await loadStatus()
      lastRefreshAttemptRef.current = Date.now()
    } catch (refreshError) {
      setError(refreshError instanceof Error ? refreshError.message : "Unable to refresh session.")
    } finally {
      setIsRefreshing(false)
    }
  }, [isRefreshing, loadStatus])

  useEffect(() => {
    void loadStatus()

    const interval = window.setInterval(() => {
      void loadStatus()
    }, 60_000)

    return () => window.clearInterval(interval)
  }, [loadStatus])

  useEffect(() => {
    if (!status) {
      return
    }

    if (status.minutesRemaining > status.refreshBeforeMinutes) {
      return
    }

    if (status.minutesRemaining <= 0) {
      return
    }

    if (Date.now() - lastRefreshAttemptRef.current < 120_000) {
      return
    }

    void refreshSession()
  }, [refreshSession, status])

  const warningText = useMemo(() => {
    if (!status) {
      return null
    }

    if (status.minutesRemaining > 10) {
      return null
    }

    return `Session expires in ${status.minutesRemaining} minute${status.minutesRemaining === 1 ? "" : "s"}.`
  }, [status])

  if (pathname === "/admin/login") {
    return null
  }

  return (
    <>
      {isLoading ? (
        <div className="border-b border-border bg-secondary px-4 py-2 text-center text-xs font-medium text-muted-foreground">
          Verifying admin session...
        </div>
      ) : null}

      {warningText ? (
        <div className="border-b border-amber-300 bg-amber-100/70 px-4 py-2">
          <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-2 text-xs text-amber-900">
            <p>{warningText}</p>
            <Button type="button" size="sm" variant="outline" onClick={() => void refreshSession()} disabled={isRefreshing}>
              {isRefreshing ? "Refreshing..." : "Refresh Session"}
            </Button>
          </div>
        </div>
      ) : null}

      {error ? (
        <div className="border-b border-destructive/40 bg-destructive/10 px-4 py-2 text-center text-xs font-medium text-destructive">
          {error}
        </div>
      ) : null}
    </>
  )
}
