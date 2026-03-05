"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { LogIn, ShieldOff } from "lucide-react"
import { getFirebaseClientAuth } from "@/lib/firebase/client"
import { adminFetch } from "@/lib/auth/admin-fetch"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"

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

const SESSION_REDIRECT_COUNTDOWN_SECONDS = 10
const TIMER_RADIUS = 38
const TIMER_CIRCUMFERENCE = 2 * Math.PI * TIMER_RADIUS

export function AdminSessionMonitor() {
  const router = useRouter()
  const pathname = usePathname()
  const isAuthRoute = pathname === "/admin/login" || pathname === "/admin/register"
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [status, setStatus] = useState<SessionStatus | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isExpired, setIsExpired] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(SESSION_REDIRECT_COUNTDOWN_SECONDS)
  const lastRefreshAttemptRef = useRef(0)
  const hasRedirectedRef = useRef(false)

  const redirectToLogin = useCallback(() => {
    if (hasRedirectedRef.current) {
      return
    }

    hasRedirectedRef.current = true
    const nextPath = pathname || "/admin"
    router.replace(`/admin/login?next=${encodeURIComponent(nextPath)}`)
  }, [pathname, router])

  const triggerExpiredState = useCallback(() => {
    setIsExpired(true)
    setError(null)
    setSecondsLeft(SESSION_REDIRECT_COUNTDOWN_SECONDS)
  }, [])

  const loadStatus = useCallback(async () => {
    if (isExpired || isAuthRoute) {
      return
    }

    try {
      const response = await fetch("/api/admin/session", { method: "GET", cache: "no-store" })
      if (response.status === 401) {
        setStatus(null)
        triggerExpiredState()
        return
      }

      const payload = (await response.json().catch(() => null)) as SessionStatusResponse | null

      if (!response.ok || !payload?.ok || !payload.data) {
        throw new Error(payload?.error || "Unable to verify admin session.")
      }

      if (payload.data.minutesRemaining <= 0) {
        setStatus(payload.data)
        triggerExpiredState()
        return
      }

      setStatus(payload.data)
      setError(null)
    } catch (statusError) {
      setError(statusError instanceof Error ? statusError.message : "Unable to verify admin session.")
      setStatus(null)
    }
  }, [isAuthRoute, isExpired, triggerExpiredState])

  const refreshSession = useCallback(async () => {
    if (isRefreshing || isExpired || isAuthRoute) {
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

      if (response.status === 401) {
        triggerExpiredState()
        return
      }

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
  }, [isAuthRoute, isExpired, isRefreshing, loadStatus, triggerExpiredState])

  useEffect(() => {
    if (!isAuthRoute) {
      return
    }

    setIsExpired(false)
    setError(null)
    setStatus(null)
    setSecondsLeft(SESSION_REDIRECT_COUNTDOWN_SECONDS)
    hasRedirectedRef.current = false
  }, [isAuthRoute])

  useEffect(() => {
    if (isAuthRoute) {
      return
    }

    void loadStatus()

    const interval = window.setInterval(() => {
      void loadStatus()
    }, 60_000)

    return () => window.clearInterval(interval)
  }, [isAuthRoute, loadStatus])

  useEffect(() => {
    if (!isExpired || isAuthRoute) {
      return
    }

    const interval = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          window.clearInterval(interval)
          redirectToLogin()
          return 0
        }

        return current - 1
      })
    }, 1000)

    return () => window.clearInterval(interval)
  }, [isAuthRoute, isExpired, redirectToLogin])

  useEffect(() => {
    if (!status || isAuthRoute) {
      return
    }

    if (isExpired) {
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
  }, [isAuthRoute, isExpired, refreshSession, status])

  const warningText = useMemo(() => {
    if (!status) {
      return null
    }

    if (isExpired || status.minutesRemaining <= 0) {
      return null
    }

    if (status.minutesRemaining > 10) {
      return null
    }

    return `Session expires in ${status.minutesRemaining} minute${status.minutesRemaining === 1 ? "" : "s"}.`
  }, [isExpired, status])

  if (isAuthRoute) {
    return null
  }

  const progress = secondsLeft / SESSION_REDIRECT_COUNTDOWN_SECONDS
  const strokeDashoffset = TIMER_CIRCUMFERENCE * (1 - progress)

  return (
    <>
      {warningText ? (
        <div className="border-b border-amber-300 bg-amber-100/70 px-4 py-2">
          <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-2 text-xs text-amber-900">
            <p>{warningText}</p>
            <Button type="button" size="sm" variant="outline" onClick={() => void refreshSession()} disabled={isRefreshing}>
              {isRefreshing ? (
                <>
                  <Spinner size="sm" className="mr-1.5" />
                  Refreshing your session...
                </>
              ) : (
                "Refresh Session"
              )}
            </Button>
          </div>
        </div>
      ) : null}

      {error ? (
        <div className="border-b border-destructive/40 bg-destructive/10 px-4 py-2 text-center text-xs font-medium text-destructive">
          {error}
        </div>
      ) : null}

      {isExpired ? (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm">
          <div className="flex min-h-screen items-center justify-center px-4 py-8">
            <section className="w-full max-w-md rounded-2xl border border-destructive/25 bg-card p-6 text-center shadow-2xl">
              <span className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-destructive/15 text-destructive">
                <ShieldOff className="h-7 w-7" />
              </span>

              <h2 className="mt-4 text-2xl font-bold text-card-foreground">Session Expired</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Your admin session has ended for security reasons. Please sign in again to continue.
              </p>

              <div className="mt-6 flex flex-col items-center">
                <div className="relative h-24 w-24">
                  <svg className="h-24 w-24 -rotate-90" viewBox="0 0 96 96" aria-hidden="true">
                    <circle cx="48" cy="48" r={TIMER_RADIUS} fill="none" stroke="currentColor" strokeWidth="8" className="text-secondary" />
                    <circle
                      cx="48"
                      cy="48"
                      r={TIMER_RADIUS}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      strokeLinecap="round"
                      className="text-destructive transition-[stroke-dashoffset] duration-1000 ease-linear"
                      style={{
                        strokeDasharray: TIMER_CIRCUMFERENCE,
                        strokeDashoffset,
                      }}
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-card-foreground">{secondsLeft}</span>
                </div>

                <p className="mt-3 text-sm text-muted-foreground">Redirecting to login in {secondsLeft} seconds</p>
              </div>

              <Button type="button" className="mt-6 w-full" onClick={redirectToLogin}>
                <LogIn className="h-4 w-4" />
                Sign In Now
              </Button>
            </section>
          </div>
        </div>
      ) : null}
    </>
  )
}
