"use client"

import { FormEvent, useEffect, useMemo, useState } from "react"
import { adminFetch } from "@/lib/auth/admin-fetch"
import { Button } from "@/components/ui/button"

type AdminBlockTargetType = "email" | "ip"
type AdminBlockScope = "admin_auth" | "admin_api" | "all"

type AdminBlockRecord = {
  id: string
  targetType: AdminBlockTargetType
  targetValue: string
  scope: AdminBlockScope
  reason: string
  active: boolean
  expiresAt: string
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy: string
}

type AuditLog = {
  id: string
  eventType: string
  severity: string
  email: string
  ip: string
  userAgent: string
  method: string
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
  userAgent: string
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

type BlockFormState = {
  targetType: AdminBlockTargetType
  targetValue: string
  scope: AdminBlockScope
  reason: string
  expiresAt: string
}

const initialData: SecurityPayload = {
  auditLogs: [],
  securityAlerts: [],
  loginAttempts: [],
  visitorLogs: [],
  blockedActors: [],
}

const initialBlockForm: BlockFormState = {
  targetType: "ip",
  targetValue: "",
  scope: "admin_auth",
  reason: "",
  expiresAt: "",
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

export function SecurityCenter() {
  const [data, setData] = useState<SecurityPayload>(initialData)
  const [form, setForm] = useState<BlockFormState>(initialBlockForm)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [activeActionId, setActiveActionId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const activeLoginAttempts = useMemo(
    () => data.loginAttempts.filter((attempt) => attempt.active).sort((a, b) => b.count - a.count),
    [data.loginAttempts],
  )

  const uniqueVisitorCount = useMemo(() => {
    const ids = new Set<string>()
    for (const visitor of data.visitorLogs) {
      const key = visitor.visitorId || visitor.ip
      if (key) {
        ids.add(key)
      }
    }
    return ids.size
  }, [data.visitorLogs])

  useEffect(() => {
    void loadSecurityData()
  }, [])

  async function loadSecurityData() {
    setIsLoading(true)
    setError(null)

    try {
      const response = await adminFetch("/api/admin/security/logs?limit=120", { method: "GET", cache: "no-store" })
      const payload = (await response.json()) as ApiResponse<SecurityPayload>

      if (!response.ok || !payload.ok || !payload.data) {
        throw new Error(payload.error || "Unable to load security data.")
      }

      setData(payload.data)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load security data.")
    } finally {
      setIsLoading(false)
    }
  }

  async function createBlock(input: BlockFormState, confirmMessage: string) {
    const normalizedTargetValue = input.targetValue.trim()
    const normalizedReason = input.reason.trim()
    if (!normalizedTargetValue || !normalizedReason) {
      setError("Target value and reason are required.")
      return false
    }

    if (!window.confirm(confirmMessage)) {
      return false
    }

    setIsSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await adminFetch("/api/admin/security/blocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...input,
          targetValue: normalizedTargetValue,
          reason: normalizedReason,
          expiresAt: input.expiresAt || "",
        }),
      })
      const payload = (await response.json()) as ApiResponse<AdminBlockRecord>

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || "Unable to save block rule.")
      }

      setSuccess(`Block rule saved for ${normalizedTargetValue}.`)
      await loadSecurityData()
      return true
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save block rule.")
      return false
    } finally {
      setIsSaving(false)
    }
  }

  async function handleCreateBlock(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const saved = await createBlock(
      form,
      `Are you sure you want to block ${form.targetType} "${form.targetValue.trim()}" for ${form.scope.replace("_", " ")} access?`,
    )
    if (saved) {
      setForm(initialBlockForm)
    }
  }

  async function handleQuickBlock(targetType: AdminBlockTargetType, targetValue: string, reason: string) {
    const normalizedTarget = targetValue.trim()
    if (!normalizedTarget || normalizedTarget === "unknown") {
      setError("Cannot block an empty or unknown target.")
      return
    }

    setActiveActionId(`${targetType}:${normalizedTarget}`)
    await createBlock(
      {
        targetType,
        targetValue: normalizedTarget,
        scope: "admin_auth",
        reason,
        expiresAt: "",
      },
      `Are you sure you want to block ${targetType} "${normalizedTarget}" from admin sign-in attempts?`,
    )
    setActiveActionId(null)
  }

  async function handleRemoveBlock(block: AdminBlockRecord) {
    if (!window.confirm(`Are you sure you want to remove this block for ${block.targetType} "${block.targetValue}"?`)) {
      return
    }

    setActiveActionId(block.id)
    setError(null)
    setSuccess(null)

    try {
      const response = await adminFetch(`/api/admin/security/blocks/${encodeURIComponent(block.id)}`, {
        method: "DELETE",
      })
      const payload = (await response.json()) as ApiResponse<null>
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || "Unable to remove block rule.")
      }

      setSuccess("Block rule removed.")
      await loadSecurityData()
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : "Unable to remove block rule.")
    } finally {
      setActiveActionId(null)
    }
  }

  return (
    <section className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <article className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Blocked Actors</p>
          <p className="mt-1 text-2xl font-bold text-card-foreground">{data.blockedActors.filter((item) => item.active).length}</p>
        </article>
        <article className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Active Login Threats</p>
          <p className="mt-1 text-2xl font-bold text-card-foreground">{activeLoginAttempts.length}</p>
        </article>
        <article className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Recent Visitors</p>
          <p className="mt-1 text-2xl font-bold text-card-foreground">{uniqueVisitorCount}</p>
        </article>
        <article className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Security Alerts</p>
          <p className="mt-1 text-2xl font-bold text-card-foreground">{data.securityAlerts.length}</p>
        </article>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-xl font-semibold text-card-foreground">Block Management</h2>
          <Button type="button" variant="outline" size="sm" onClick={() => void loadSecurityData()} disabled={isLoading}>
            {isLoading ? "Refreshing..." : "Refresh Security Data"}
          </Button>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Block suspicious IPs or emails from admin authentication and API usage.
        </p>

        <form className="mt-5 grid gap-4 md:grid-cols-2" onSubmit={handleCreateBlock}>
          <label className="text-sm">
            <span className="font-medium text-card-foreground">Target Type</span>
            <select
              value={form.targetType}
              onChange={(event) => setForm((current) => ({ ...current, targetType: event.target.value as AdminBlockTargetType }))}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
            >
              <option value="ip">IP Address</option>
              <option value="email">Email</option>
            </select>
          </label>

          <label className="text-sm">
            <span className="font-medium text-card-foreground">Target Value</span>
            <input
              required
              value={form.targetValue}
              onChange={(event) => setForm((current) => ({ ...current, targetValue: event.target.value }))}
              placeholder={form.targetType === "ip" ? "203.0.113.10" : "person@example.com"}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
            />
          </label>

          <label className="text-sm">
            <span className="font-medium text-card-foreground">Scope</span>
            <select
              value={form.scope}
              onChange={(event) => setForm((current) => ({ ...current, scope: event.target.value as AdminBlockScope }))}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
            >
              <option value="admin_auth">Admin Login Only</option>
              <option value="admin_api">Admin API Only</option>
              <option value="all">All Admin Access</option>
            </select>
          </label>

          <label className="text-sm">
            <span className="font-medium text-card-foreground">Expires At (optional)</span>
            <input
              type="datetime-local"
              value={form.expiresAt}
              onChange={(event) => setForm((current) => ({ ...current, expiresAt: event.target.value }))}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
            />
          </label>

          <label className="text-sm md:col-span-2">
            <span className="font-medium text-card-foreground">Reason</span>
            <textarea
              required
              rows={2}
              value={form.reason}
              onChange={(event) => setForm((current) => ({ ...current, reason: event.target.value }))}
              placeholder="Reason for blocking this actor..."
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
            />
          </label>

          <div className="md:col-span-2">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Block Rule"}
            </Button>
          </div>
        </form>
      </div>

      {error ? <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p> : null}
      {success ? <p className="rounded-md border border-emerald-300/40 bg-emerald-100/30 px-3 py-2 text-sm text-emerald-700">{success}</p> : null}

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-card-foreground">Blocked Actors</h3>
        {data.blockedActors.length === 0 ? <p className="mt-3 text-sm text-muted-foreground">No block rules configured.</p> : null}
        {data.blockedActors.length > 0 ? (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full divide-y divide-border text-sm">
              <thead>
                <tr className="text-left text-muted-foreground">
                  <th className="py-2 pr-3 font-medium">Target</th>
                  <th className="py-2 pr-3 font-medium">Scope</th>
                  <th className="py-2 pr-3 font-medium">Reason</th>
                  <th className="py-2 pr-3 font-medium">Updated</th>
                  <th className="py-2 pr-3 font-medium">Expires</th>
                  <th className="py-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.blockedActors.map((block) => (
                  <tr key={block.id}>
                    <td className="py-2 pr-3 text-card-foreground">
                      <span className="font-medium">{block.targetValue}</span>
                      <span className="ml-2 text-xs uppercase text-muted-foreground">{block.targetType}</span>
                    </td>
                    <td className="py-2 pr-3 text-card-foreground">{block.scope}</td>
                    <td className="py-2 pr-3 text-card-foreground">{shorten(block.reason, 70)}</td>
                    <td className="py-2 pr-3 text-card-foreground">{formatDateTime(block.updatedAt)}</td>
                    <td className="py-2 pr-3 text-card-foreground">{formatDateTime(block.expiresAt)}</td>
                    <td className="py-2">
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        disabled={activeActionId === block.id}
                        onClick={() => void handleRemoveBlock(block)}
                      >
                        {activeActionId === block.id ? "Removing..." : "Unblock"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-card-foreground">Failed Login Attempts</h3>
        {activeLoginAttempts.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">No active failed login attempts currently.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full divide-y divide-border text-sm">
              <thead>
                <tr className="text-left text-muted-foreground">
                  <th className="py-2 pr-3 font-medium">Email</th>
                  <th className="py-2 pr-3 font-medium">IP</th>
                  <th className="py-2 pr-3 font-medium">Count</th>
                  <th className="py-2 pr-3 font-medium">Lock Reset</th>
                  <th className="py-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {activeLoginAttempts.map((attempt) => (
                  <tr key={attempt.id}>
                    <td className="py-2 pr-3 text-card-foreground">{attempt.email || "-"}</td>
                    <td className="py-2 pr-3 text-card-foreground">{attempt.ip || "-"}</td>
                    <td className="py-2 pr-3 text-card-foreground">{attempt.count}</td>
                    <td className="py-2 pr-3 text-card-foreground">{formatDateTime(attempt.resetAt)}</td>
                    <td className="py-2">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={!attempt.ip || attempt.ip === "unknown" || activeActionId === `ip:${attempt.ip}`}
                          onClick={() => void handleQuickBlock("ip", attempt.ip, "Blocked due to repeated failed admin login attempts.")}
                        >
                          {activeActionId === `ip:${attempt.ip}` ? "Blocking..." : "Block IP"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={!attempt.email || activeActionId === `email:${attempt.email}`}
                          onClick={() => void handleQuickBlock("email", attempt.email, "Blocked due to repeated failed admin login attempts.")}
                        >
                          {activeActionId === `email:${attempt.email}` ? "Blocking..." : "Block Email"}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-card-foreground">Recent Site Visitors</h3>
        {data.visitorLogs.length === 0 ? <p className="mt-3 text-sm text-muted-foreground">No visitor logs captured yet.</p> : null}
        {data.visitorLogs.length > 0 ? (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full divide-y divide-border text-sm">
              <thead>
                <tr className="text-left text-muted-foreground">
                  <th className="py-2 pr-3 font-medium">Path</th>
                  <th className="py-2 pr-3 font-medium">IP</th>
                  <th className="py-2 pr-3 font-medium">Referrer</th>
                  <th className="py-2 pr-3 font-medium">Time</th>
                  <th className="py-2 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.visitorLogs.slice(0, 80).map((visitor) => (
                  <tr key={visitor.id}>
                    <td className="py-2 pr-3 text-card-foreground">{`${visitor.path}${visitor.search}`}</td>
                    <td className="py-2 pr-3 text-card-foreground">{visitor.ip || "-"}</td>
                    <td className="py-2 pr-3 text-card-foreground">{shorten(visitor.referrer || "-", 60)}</td>
                    <td className="py-2 pr-3 text-card-foreground">{formatDateTime(visitor.createdAt)}</td>
                    <td className="py-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={!visitor.ip || visitor.ip === "unknown" || activeActionId === `ip:${visitor.ip}`}
                        onClick={() => void handleQuickBlock("ip", visitor.ip, "Blocked based on suspicious visitor activity.")}
                      >
                        {activeActionId === `ip:${visitor.ip}` ? "Blocking..." : "Block IP"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-card-foreground">Security Alerts</h3>
        {data.securityAlerts.length === 0 ? <p className="mt-3 text-sm text-muted-foreground">No security alerts yet.</p> : null}
        {data.securityAlerts.length > 0 ? (
          <ul className="mt-3 space-y-2">
            {data.securityAlerts.slice(0, 20).map((alert) => (
              <li key={alert.id} className="rounded-md border border-border bg-background px-3 py-2 text-sm">
                <p className="font-medium text-card-foreground">{alert.title}</p>
                <p className="text-xs text-muted-foreground">{formatDateTime(alert.createdAt)}</p>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-card-foreground">Audit Trail</h3>
        {data.auditLogs.length === 0 ? <p className="mt-3 text-sm text-muted-foreground">No audit events yet.</p> : null}
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
                {data.auditLogs.slice(0, 120).map((log) => (
                  <tr key={log.id}>
                    <td className="py-2 pr-3 text-card-foreground">{log.eventType}</td>
                    <td className="py-2 pr-3 text-card-foreground">{log.email || log.ip || "-"}</td>
                    <td className="py-2 pr-3 text-card-foreground">{shorten(log.path || "-", 45)}</td>
                    <td className="py-2 pr-3 text-card-foreground">{log.status || "-"}</td>
                    <td className="py-2 pr-3 text-card-foreground">{shorten(log.reason || "-", 45)}</td>
                    <td className="py-2 text-card-foreground">{formatDateTime(log.createdAt)}</td>
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
