"use client"

import { FormEvent, useEffect, useState } from "react"
import { adminFetch } from "@/lib/auth/admin-fetch"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"

type AdminRole = "super_admin" | "content_admin" | "viewer"
type AdminOnboardingStatus = "invited" | "pending" | "approved" | "revoked" | "deleted"

type AdminUserRecord = {
  email: string
  role: AdminRole
  active: boolean
  onboardingStatus: AdminOnboardingStatus
  createdAt: string
  updatedAt: string
  lastLoginAt?: string
  lastLoginIp?: string
  invitationAccepted?: boolean
  invitationAcceptedAt?: string
  isPrimarySuperAdmin?: boolean
}

type ApiResponse<T> = {
  ok: boolean
  data?: T
  error?: string
}

type CreateAdminResponseData = {
  invitationEmailSent: boolean
  invitationEmailSkipped: boolean
  invitationEmailError?: string
  inviteId?: string
}

type SessionResponse = {
  ok: boolean
  data?: {
    email: string
    role: AdminRole
  }
  error?: string
}

const roleOptions: Array<{ value: AdminRole; label: string }> = [
  { value: "super_admin", label: "Super Admin" },
  { value: "content_admin", label: "Content Admin" },
  { value: "viewer", label: "Viewer" },
]

export function AdminUsersManager() {
  const [users, setUsers] = useState<AdminUserRecord[]>([])
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<AdminRole>("content_admin")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [currentAdminEmail, setCurrentAdminEmail] = useState<string | null>(null)

  useEffect(() => {
    void loadUsers()
    void loadCurrentAdmin()
  }, [])

  async function loadUsers() {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/admin/admins", { method: "GET", cache: "no-store" })
      const payload = (await response.json()) as ApiResponse<AdminUserRecord[]>
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || "Unable to load admin users.")
      }

      setUsers(payload.data || [])
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load admin users.")
    } finally {
      setIsLoading(false)
    }
  }

  async function loadCurrentAdmin() {
    try {
      const response = await fetch("/api/admin/session", { method: "GET", cache: "no-store" })
      const payload = (await response.json()) as SessionResponse
      if (!response.ok || !payload.ok || !payload.data?.email) {
        return
      }

      setCurrentAdminEmail(payload.data.email.trim().toLowerCase())
    } catch {
      // No-op: page-level auth already protects this route.
    }
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const normalizedEmail = email.trim().toLowerCase()
    const confirmed = window.confirm(
      `Are you sure you want to add ${normalizedEmail} as ${role.replace("_", " ")}?`,
    )

    if (!confirmed) {
      return
    }

    setIsSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await adminFetch("/api/admin/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail, role }),
      })

      const payload = (await response.json()) as ApiResponse<CreateAdminResponseData>
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || "Unable to add admin user.")
      }

      setEmail("")
      setRole("content_admin")
      if (payload.data?.invitationEmailSent) {
        setSuccess("Admin user saved and invitation email sent.")
      } else if (payload.data?.invitationEmailError) {
        setSuccess(`Admin user saved. Invitation email was not sent: ${payload.data.invitationEmailError}`)
      } else if (payload.data?.invitationEmailSkipped) {
        setSuccess("Admin user saved. Invitation email skipped because the admin account already exists.")
      } else {
        setSuccess("Admin user saved.")
      }
      await loadUsers()
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Unable to add admin user.")
    } finally {
      setIsSaving(false)
    }
  }

  async function updateUser(
    emailValue: string,
    updates: Partial<Pick<AdminUserRecord, "role" | "active" | "onboardingStatus">>,
    successText: string,
    confirmMessage: string,
  ) {
    if (!window.confirm(confirmMessage)) {
      return
    }

    setError(null)
    setSuccess(null)

    try {
      const response = await adminFetch(`/api/admin/admins/${encodeURIComponent(emailValue)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })

      const payload = (await response.json()) as ApiResponse<null>
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || "Unable to update admin user.")
      }

      setSuccess(successText)
      await loadUsers()
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Unable to update admin user.")
    }
  }

  async function deleteUser(emailValue: string) {
    if (!window.confirm(`Are you sure you want to remove admin access for ${emailValue}? This action cannot be undone.`)) {
      return
    }

    setError(null)
    setSuccess(null)

    try {
      const response = await adminFetch(`/api/admin/admins/${encodeURIComponent(emailValue)}`, {
        method: "DELETE",
      })
      const payload = (await response.json()) as ApiResponse<null>
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || "Unable to remove admin user.")
      }

      setSuccess("Admin user removed.")
      await loadUsers()
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Unable to remove admin user.")
    }
  }

  async function handleRoleChange(user: AdminUserRecord, nextRole: AdminRole) {
    if (user.role === nextRole) {
      return
    }

    await updateUser(
      user.email,
      { role: nextRole },
      "Admin role updated.",
      `Are you sure you want to change ${user.email} role from ${user.role.replace("_", " ")} to ${nextRole.replace("_", " ")}?`,
    )
  }

  async function handleActiveToggle(user: AdminUserRecord) {
    await updateUser(
      user.email,
      { active: !user.active },
      user.active ? "Admin disabled." : "Admin enabled.",
      `Are you sure you want to ${user.active ? "disable" : "enable"} ${user.email}?`,
    )
  }

  async function handleApprove(user: AdminUserRecord) {
    await updateUser(
      user.email,
      { onboardingStatus: "approved", active: true },
      "Admin approved.",
      `Approve ${user.email} for admin access?`,
    )
  }

  function formatOnboardingStatus(status: AdminOnboardingStatus) {
    if (status === "invited") return "Invited"
    if (status === "pending") return "Pending Approval"
    if (status === "approved") return "Approved"
    if (status === "revoked") return "Revoked"
    return "Deleted"
  }

  return (
    <section className="space-y-6">
      <div id="admin-invite" className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-card-foreground">Add Admin User</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Allowlist admin emails here. Invitation is considered accepted after the admin sets a password and creates an account.
        </p>

        <form className="mt-5 flex flex-wrap items-end gap-3" onSubmit={handleCreate}>
          <label className="text-sm">
            <span className="font-medium text-card-foreground">Email</span>
            <input
              required
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@example.com"
              className="mt-1 block w-72 max-w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground admin-input"
            />
          </label>

          <label className="text-sm">
            <span className="font-medium text-card-foreground">Role</span>
            <select
              value={role}
              onChange={(event) => setRole(event.target.value as AdminRole)}
              className="mt-1 block rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground admin-input"
            >
              {roleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <Button type="submit" disabled={isSaving}>
            {isSaving ? (
              <>
                <Spinner size="sm" className="mr-1.5" />
                Saving admin access...
              </>
            ) : (
              "Save Admin"
            )}
          </Button>
        </form>
      </div>

      {error ? <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p> : null}
      {success ? <p className="rounded-md border border-emerald-300/40 bg-emerald-100/30 px-3 py-2 text-sm text-emerald-700">{success}</p> : null}

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-lg font-semibold text-card-foreground">Current Admin Users</h3>
          <Button type="button" variant="outline" size="sm" onClick={() => void loadUsers()} disabled={isLoading}>
            {isLoading ? (
              <>
                <Spinner size="sm" className="mr-1.5" />
                Refreshing admin accounts...
              </>
            ) : (
              "Refresh"
            )}
          </Button>
        </div>

        {isLoading ? <p className="mt-4 text-sm text-muted-foreground">Loading admin users...</p> : null}
        {!isLoading && users.length === 0 ? <p className="mt-4 text-sm text-muted-foreground">No admin users found.</p> : null}

        {!isLoading && users.length > 0 ? (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full divide-y divide-border text-sm">
              <thead>
                <tr className="text-left text-muted-foreground">
                  <th className="py-2 pr-3 font-medium">Email</th>
                  <th className="py-2 pr-3 font-medium">Role</th>
                  <th className="py-2 pr-3 font-medium">Status</th>
                  <th className="py-2 pr-3 font-medium">Onboarding</th>
                  <th className="py-2 pr-3 font-medium">Invitation</th>
                  <th className="py-2 pr-3 font-medium">Last Login</th>
                  <th className="py-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((user) => {
                  const isSelf = currentAdminEmail === user.email
                  const isPrimaryProtected = Boolean(user.isPrimarySuperAdmin && !isSelf)
                  const controlsLocked = isSelf || isPrimaryProtected

                  return (
                    <tr key={user.email}>
                      <td className="py-2 pr-3 align-top">
                        <p className="font-medium text-card-foreground">
                          {user.email}
                          {isSelf ? (
                            <span className="ml-2 rounded bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-primary">
                              You
                            </span>
                          ) : null}
                          {user.isPrimarySuperAdmin ? (
                            <span className="ml-2 rounded bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-amber-800">
                              Primary
                            </span>
                          ) : null}
                        </p>
                      </td>
                      <td className="py-2 pr-3 align-top">
                        <select
                          value={user.role}
                          disabled={controlsLocked}
                          onChange={(event) => void handleRoleChange(user, event.target.value as AdminRole)}
                          className="rounded-md border border-input bg-background px-2 py-1 text-xs text-foreground admin-input"
                        >
                          {roleOptions.map((option) => (
                            <option key={`${user.email}-${option.value}`} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-2 pr-3 align-top text-card-foreground">{user.active ? "Active" : "Disabled"}</td>
                      <td className="py-2 pr-3 align-top text-card-foreground">{formatOnboardingStatus(user.onboardingStatus)}</td>
                      <td className="py-2 pr-3 align-top text-card-foreground">
                        <div className="space-y-1">
                          <p className={user.invitationAccepted ? "text-emerald-700" : "text-amber-700"}>
                            {user.invitationAccepted ? "Accepted" : "Pending"}
                          </p>
                          {user.invitationAcceptedAt ? (
                            <p className="text-xs text-muted-foreground">
                              {new Date(user.invitationAcceptedAt).toLocaleString("en-GB")}
                            </p>
                          ) : null}
                        </div>
                      </td>
                      <td className="py-2 pr-3 align-top text-card-foreground">
                        {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString("en-GB") : "Never"}
                      </td>
                      <td className="py-2 align-top">
                        <div className="flex flex-wrap gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={controlsLocked}
                            onClick={() => void handleActiveToggle(user)}
                          >
                            {user.active ? "Disable" : "Enable"}
                          </Button>
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            disabled={controlsLocked || user.onboardingStatus === "approved"}
                            onClick={() => void handleApprove(user)}
                          >
                            {user.onboardingStatus === "approved" ? "Approved" : "Approve"}
                          </Button>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            disabled={controlsLocked}
                            onClick={() => void deleteUser(user.email)}
                          >
                            Remove
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            <p className="mt-3 text-xs text-muted-foreground">
              Your own super admin account is locked for role/status changes and deletion. The primary super admin account is protected from role changes, disable, or deletion by other admins.
            </p>
          </div>
        ) : null}
      </div>
    </section>
  )
}
