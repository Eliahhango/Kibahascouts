"use client"

import { useEffect, useState } from "react"
import { adminFetch } from "@/lib/auth/admin-fetch"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"

type AdminBlockRecord = {
  id: string
  targetType: "email" | "ip"
  targetValue: string
  scope: "admin_auth" | "admin_api" | "all"
  reason: string
  active: boolean
  expiresAt: string
  updatedAt: string
}

type AuditLog = {
  id: string
  eventType: string
  email: string
  ip: string
  path: string
  status: number
  reason: string
  createdAt: string
}

type SecurityAlert = {
  id: string
  title: string
  acknowledged: boolean
  createdAt: string
}

type LoginAttempt = {
  id: string
  email: string
  ip: string
  count: number
  resetAt: string
  updatedAt: string
  active: boolean
}

type VisitorLog = {
  id: string
  path: string
  search: string
  referrer: string
  ip: string
  visitorId: string
  createdAt: string
}

type SecurityPayload = {
  auditLogs: AuditLog[]
  securityAlerts: SecurityAlert[]
  loginAttempts: LoginAttempt[]
  visitorLogs: VisitorLog[]
  blockedActors: AdminBlockRecord[]
}

type ApiResponse<T> = {
  ok: boolean
  data?: T
  error?: string
}

function formatDateTime(value: string) {
  if (!value) {
    return "-"
  }

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return value
  }

  return parsed.toLocaleString("en-GB")
}

function shorten(value: string, max = 90) {
  if (value.length <= max) {
    return value
  }

  return `${value.slice(0, max - 3)}...`
}

export function SecurityLogsBrowser() {
  const [data, setData] = useState<SecurityPayload>({
    auditLogs: [],
    securityAlerts: [],
    loginAttempts: [],
    visitorLogs: [],
    blockedActors: [],
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void load()
  }, [])

  async function load() {
    setIsLoading(true)
    setError(null)

    try {
      const response = await adminFetch("/api/admin/security/logs?limit=200", { method: "GET", cache: "no-store" })
      const payload = (await response.json()) as ApiResponse<SecurityPayload>
      if (!response.ok || !payload.ok || !payload.data) {
        throw new Error(payload.error || "Unable to load security logs.")
      }

      setData(payload.data)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load security logs.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-xl font-semibold text-card-foreground">All Security Logs (Max 200 each)</h2>
          <Button type="button" variant="outline" size="sm" onClick={() => void load()} disabled={isLoading}>
            {isLoading ? (
              <>
                <Spinner size="sm" className="mr-1.5" />
                Refreshing security logs...
              </>
            ) : (
              "Refresh"
            )}
          </Button>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Full records for visitors, login attempts, alerts, audit logs, and blocked actors.
        </p>
      </div>

      {error ? <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p> : null}

      <div id="visitors" className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-card-foreground">Visitor Logs</h3>
        {data.visitorLogs.length === 0 ? <p className="mt-3 text-sm text-muted-foreground">No visitor logs.</p> : null}
        {data.visitorLogs.length > 0 ? (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full divide-y divide-border text-sm">
              <thead>
                <tr className="text-left text-muted-foreground">
                  <th className="py-2 pr-3 font-medium">Path</th>
                  <th className="py-2 pr-3 font-medium">IP</th>
                  <th className="py-2 pr-3 font-medium">Referrer</th>
                  <th className="py-2 pr-3 font-medium">Visitor ID</th>
                  <th className="py-2 font-medium">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.visitorLogs.map((visitor) => (
                  <tr key={visitor.id}>
                    <td className="py-2 pr-3 text-card-foreground">{`${visitor.path}${visitor.search}`}</td>
                    <td className="py-2 pr-3 text-card-foreground">{visitor.ip || "-"}</td>
                    <td className="py-2 pr-3 text-card-foreground">{shorten(visitor.referrer || "-", 70)}</td>
                    <td className="py-2 pr-3 text-card-foreground">{shorten(visitor.visitorId || "-", 30)}</td>
                    <td className="py-2 text-card-foreground">{formatDateTime(visitor.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>

      <div id="login-attempts" className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-card-foreground">Login Attempts</h3>
        {data.loginAttempts.length === 0 ? <p className="mt-3 text-sm text-muted-foreground">No login attempts.</p> : null}
        {data.loginAttempts.length > 0 ? (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full divide-y divide-border text-sm">
              <thead>
                <tr className="text-left text-muted-foreground">
                  <th className="py-2 pr-3 font-medium">Email</th>
                  <th className="py-2 pr-3 font-medium">IP</th>
                  <th className="py-2 pr-3 font-medium">Count</th>
                  <th className="py-2 pr-3 font-medium">Active</th>
                  <th className="py-2 pr-3 font-medium">Reset At</th>
                  <th className="py-2 font-medium">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.loginAttempts.map((attempt) => (
                  <tr key={attempt.id}>
                    <td className="py-2 pr-3 text-card-foreground">{attempt.email || "-"}</td>
                    <td className="py-2 pr-3 text-card-foreground">{attempt.ip || "-"}</td>
                    <td className="py-2 pr-3 text-card-foreground">{attempt.count}</td>
                    <td className="py-2 pr-3 text-card-foreground">{attempt.active ? "Yes" : "No"}</td>
                    <td className="py-2 pr-3 text-card-foreground">{formatDateTime(attempt.resetAt)}</td>
                    <td className="py-2 text-card-foreground">{formatDateTime(attempt.updatedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>

      <div id="alerts" className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-card-foreground">Security Alerts</h3>
        {data.securityAlerts.length === 0 ? <p className="mt-3 text-sm text-muted-foreground">No security alerts.</p> : null}
        {data.securityAlerts.length > 0 ? (
          <ul className="mt-3 space-y-2">
            {data.securityAlerts.map((alert) => (
              <li key={alert.id} className="rounded-md border border-border bg-background px-3 py-2 text-sm">
                <p className="font-medium text-card-foreground">{alert.title}</p>
                <p className="text-xs text-muted-foreground">{formatDateTime(alert.createdAt)}</p>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div id="audit" className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-card-foreground">Audit Logs</h3>
        {data.auditLogs.length === 0 ? <p className="mt-3 text-sm text-muted-foreground">No audit logs.</p> : null}
        {data.auditLogs.length > 0 ? (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full divide-y divide-border text-sm">
              <thead>
                <tr className="text-left text-muted-foreground">
                  <th className="py-2 pr-3 font-medium">Event</th>
                  <th className="py-2 pr-3 font-medium">Actor</th>
                  <th className="py-2 pr-3 font-medium">Path</th>
                  <th className="py-2 pr-3 font-medium">Status</th>
                  <th className="py-2 pr-3 font-medium">Reason</th>
                  <th className="py-2 font-medium">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.auditLogs.map((log) => (
                  <tr key={log.id}>
                    <td className="py-2 pr-3 text-card-foreground">{log.eventType}</td>
                    <td className="py-2 pr-3 text-card-foreground">{log.email || log.ip || "-"}</td>
                    <td className="py-2 pr-3 text-card-foreground">{shorten(log.path || "-", 45)}</td>
                    <td className="py-2 pr-3 text-card-foreground">{log.status || "-"}</td>
                    <td className="py-2 pr-3 text-card-foreground">{shorten(log.reason || "-", 60)}</td>
                    <td className="py-2 text-card-foreground">{formatDateTime(log.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>

      <div id="blocks" className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-card-foreground">Blocked Actors</h3>
        {data.blockedActors.length === 0 ? <p className="mt-3 text-sm text-muted-foreground">No blocked actors.</p> : null}
        {data.blockedActors.length > 0 ? (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full divide-y divide-border text-sm">
              <thead>
                <tr className="text-left text-muted-foreground">
                  <th className="py-2 pr-3 font-medium">Target</th>
                  <th className="py-2 pr-3 font-medium">Scope</th>
                  <th className="py-2 pr-3 font-medium">Reason</th>
                  <th className="py-2 pr-3 font-medium">Expires</th>
                  <th className="py-2 font-medium">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.blockedActors.map((block) => (
                  <tr key={block.id}>
                    <td className="py-2 pr-3 text-card-foreground">{`${block.targetType}: ${block.targetValue}`}</td>
                    <td className="py-2 pr-3 text-card-foreground">{block.scope}</td>
                    <td className="py-2 pr-3 text-card-foreground">{shorten(block.reason, 70)}</td>
                    <td className="py-2 pr-3 text-card-foreground">{formatDateTime(block.expiresAt)}</td>
                    <td className="py-2 text-card-foreground">{formatDateTime(block.updatedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </section>
  )
}
