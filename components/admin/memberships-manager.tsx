"use client"

import { useEffect, useMemo, useState } from "react"
import { adminFetch } from "@/lib/auth/admin-fetch"
import { Spinner } from "@/components/ui/spinner"

type MembershipStatus = "pending" | "approved" | "rejected"
type MembershipRole = "youth" | "volunteer"

type MembershipApplication = {
  id: string
  fullName: string
  age: string
  parentName: string
  parentPhone: string
  parentEmail: string
  ward: string
  unitType: string
  role: MembershipRole
  message: string
  status: MembershipStatus
  submittedAt: string
  updatedAt: string
}

type ApiResponse<T> = {
  ok: boolean
  data?: T
  error?: string
}

function getStatusClass(status: MembershipStatus) {
  if (status === "approved") {
    return "border border-emerald-200 bg-emerald-100 text-emerald-700"
  }
  if (status === "rejected") {
    return "border border-red-200 bg-red-100 text-red-700"
  }
  return "border border-amber-200 bg-amber-50 text-amber-700"
}

function getRoleLabel(role: MembershipRole) {
  return role === "volunteer" ? "Volunteer" : "Youth"
}

function formatSubmittedDate(value: string) {
  if (!value) return "-"
  const parsed = Date.parse(value)
  if (Number.isNaN(parsed)) return value
  return new Date(parsed).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function MembershipsManager({ isReadOnly = false }: { isReadOnly?: boolean }) {
  const [items, setItems] = useState<MembershipApplication[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | MembershipStatus>("all")
  const [expandedIds, setExpandedIds] = useState<string[]>([])
  const [actionState, setActionState] = useState<{ id: string; status: Exclude<MembershipStatus, "pending"> } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    void loadApplications()
  }, [])

  const filteredItems = useMemo(() => {
    if (filter === "all") {
      return items
    }
    return items.filter((item) => item.status === filter)
  }, [items, filter])

  const counts = useMemo(() => {
    const pending = items.filter((item) => item.status === "pending").length
    const approved = items.filter((item) => item.status === "approved").length
    const rejected = items.filter((item) => item.status === "rejected").length
    return {
      all: items.length,
      pending,
      approved,
      rejected,
    }
  }, [items])

  async function loadApplications() {
    setIsLoading(true)
    setError(null)

    try {
      const response = await adminFetch("/api/admin/memberships", { method: "GET", cache: "no-store" })
      const payload = (await response.json()) as ApiResponse<MembershipApplication[]>
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || "Unable to load membership applications.")
      }

      setItems(payload.data || [])
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load membership applications.")
    } finally {
      setIsLoading(false)
    }
  }

  function toggleExpanded(id: string) {
    setExpandedIds((current) => (current.includes(id) ? current.filter((value) => value !== id) : [...current, id]))
  }

  async function handleUpdateStatus(item: MembershipApplication, status: "approved" | "rejected") {
    if (item.status === status) {
      return
    }

    const actionLabel = status === "approved" ? "approve" : "reject"
    const confirmed = window.confirm(`Are you sure you want to ${actionLabel} "${item.fullName}"?`)
    if (!confirmed) return

    setActionState({ id: item.id, status })
    setError(null)
    setSuccess(null)

    try {
      const response = await adminFetch(`/api/admin/memberships/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      const payload = (await response.json()) as ApiResponse<MembershipApplication>
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || "Unable to update application status.")
      }

      setSuccess(`Application ${status}.`)
      await loadApplications()
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Unable to update application status.")
    } finally {
      setActionState(null)
    }
  }

  return (
    <section className="space-y-5">
      {isReadOnly ? (
        <p className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Read-only mode - you can browse but cannot make changes.
        </p>
      ) : null}
      {error ? <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p> : null}
      {success ? <p className="rounded-md border border-emerald-300/40 bg-emerald-100/30 px-3 py-2 text-sm text-emerald-700">{success}</p> : null}

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-card-foreground">Membership Applications</h2>
            <span className="inline-flex rounded-full border border-border bg-secondary px-2.5 py-0.5 text-xs font-semibold text-foreground">
              {counts.all}
            </span>
          </div>
          <button
            type="button"
            onClick={() => void loadApplications()}
            disabled={isLoading}
            title="Reloads the list of items - does not publish or change anything"
            className="inline-flex items-center rounded-md px-2.5 py-1.5 text-xs font-semibold text-muted-foreground transition hover:bg-secondary hover:text-foreground disabled:opacity-70"
          >
            {isLoading ? (
              <span className="inline-flex items-center">
                <Spinner size="sm" className="mr-1.5" />
                Reloading applications...
              </span>
            ) : (
              "\u21BB Reload list"
            )}
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {([
            { key: "all", label: "All", count: counts.all },
            { key: "pending", label: "Pending", count: counts.pending },
            { key: "approved", label: "Approved", count: counts.approved },
            { key: "rejected", label: "Rejected", count: counts.rejected },
          ] as const).map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setFilter(tab.key)}
              className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                filter === tab.key
                  ? "border-tsa-green-deep bg-tsa-green-deep text-white"
                  : "border-border text-foreground hover:bg-secondary"
              }`}
            >
              {tab.label}
              <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${filter === tab.key ? "bg-white/20 text-white" : "bg-secondary text-muted-foreground"}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {isLoading ? <p className="mt-4 text-sm text-muted-foreground">Loading applications...</p> : null}
        {!isLoading && filteredItems.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">No membership applications for this filter.</p>
        ) : null}

        {!isLoading && filteredItems.length > 0 ? (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full divide-y divide-border text-sm">
              <thead>
                <tr className="text-left text-muted-foreground">
                  <th className="py-2 pr-3 font-medium">Name</th>
                  <th className="py-2 pr-3 font-medium">Age</th>
                  <th className="py-2 pr-3 font-medium">Role</th>
                  <th className="py-2 pr-3 font-medium">Ward</th>
                  <th className="py-2 pr-3 font-medium">Phone</th>
                  <th className="py-2 pr-3 font-medium">Section</th>
                  <th className="py-2 pr-3 font-medium">Submitted</th>
                  <th className="py-2 pr-3 font-medium">Status</th>
                  <th className="py-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredItems.map((item) => {
                  const isExpanded = expandedIds.includes(item.id)
                  const isUpdating = actionState?.id === item.id

                  return [
                    <tr key={item.id}>
                      <td className="py-2 pr-3">
                        <p className="font-medium text-card-foreground">{item.fullName || "-"}</p>
                      </td>
                      <td className="py-2 pr-3 text-card-foreground">{item.age || "-"}</td>
                      <td className="py-2 pr-3 text-card-foreground">{getRoleLabel(item.role)}</td>
                      <td className="py-2 pr-3 text-card-foreground">{item.ward || "-"}</td>
                      <td className="py-2 pr-3 text-card-foreground">{item.parentPhone || "-"}</td>
                      <td className="py-2 pr-3 text-card-foreground">{item.unitType || "-"}</td>
                      <td className="py-2 pr-3 text-card-foreground">{formatSubmittedDate(item.submittedAt)}</td>
                      <td className="py-2 pr-3">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${getStatusClass(item.status)}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="py-2">
                        <div className="flex flex-wrap gap-2">
                          {!isReadOnly ? (
                            <>
                              <button
                                type="button"
                                onClick={() => void handleUpdateStatus(item, "approved")}
                                disabled={isUpdating || item.status === "approved"}
                                className="rounded-md border border-emerald-400 bg-emerald-600 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                              >
                                {isUpdating && actionState?.status === "approved" ? (
                                  <span className="inline-flex items-center">
                                    <Spinner size="sm" className="mr-1.5" />
                                    Approving...
                                  </span>
                                ) : (
                                  "Approve"
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() => void handleUpdateStatus(item, "rejected")}
                                disabled={isUpdating || item.status === "rejected"}
                                className="rounded-md border border-red-300 bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                              >
                                {isUpdating && actionState?.status === "rejected" ? (
                                  <span className="inline-flex items-center">
                                    <Spinner size="sm" className="mr-1.5" />
                                    Rejecting...
                                  </span>
                                ) : (
                                  "Reject"
                                )}
                              </button>
                            </>
                          ) : null}
                          <button
                            type="button"
                            onClick={() => toggleExpanded(item.id)}
                            className="rounded-md border border-border px-3 py-1 text-xs font-semibold text-foreground hover:bg-secondary"
                          >
                            {isExpanded ? "Hide Details" : "View Details"}
                          </button>
                        </div>
                      </td>
                    </tr>,
                    isExpanded ? (
                      <tr key={`${item.id}-details`} className="bg-secondary/25">
                        <td colSpan={9} className="px-3 py-3">
                          <div className="grid gap-3 md:grid-cols-2">
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Parent / Guardian Name</p>
                              <p className="text-sm text-card-foreground">{item.parentName || "-"}</p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Email</p>
                              <p className="text-sm text-card-foreground">{item.parentEmail || "-"}</p>
                            </div>
                            <div className="md:col-span-2">
                              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Message</p>
                              <p className="whitespace-pre-wrap text-sm text-card-foreground">{item.message || "-"}</p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : null,
                  ]
                })}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </section>
  )
}


