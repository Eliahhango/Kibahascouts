"use client"

import { FormEvent, useEffect, useState } from "react"
import { adminFetch } from "@/lib/auth/admin-fetch"
import { Button } from "@/components/ui/button"

type AdminRole = "super_admin" | "content_admin" | "viewer"

type AdminUserRecord = {
  email: string
  role: AdminRole
  active: boolean
  createdAt: string
  updatedAt: string
  lastLoginAt?: string
  lastLoginIp?: string
}

type ApiResponse<T> = {
  ok: boolean
  data?: T
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

  useEffect(() => {
    void loadUsers()
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

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await adminFetch("/api/admin/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role }),
      })

      const payload = (await response.json()) as ApiResponse<null>
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || "Unable to add admin user.")
      }

      setEmail("")
      setRole("content_admin")
      setSuccess("Admin user saved.")
      await loadUsers()
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Unable to add admin user.")
    } finally {
      setIsSaving(false)
    }
  }

  async function updateUser(emailValue: string, updates: Partial<Pick<AdminUserRecord, "role" | "active">>, successText: string) {
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
    if (!window.confirm(`Remove admin access for ${emailValue}?`)) {
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

  return (
    <section className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-card-foreground">Add Admin User</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage admin access from Firestore-backed records. New users are active immediately.
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
              className="mt-1 block w-72 max-w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
            />
          </label>

          <label className="text-sm">
            <span className="font-medium text-card-foreground">Role</span>
            <select
              value={role}
              onChange={(event) => setRole(event.target.value as AdminRole)}
              className="mt-1 block rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
            >
              {roleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Admin"}
          </Button>
        </form>
      </div>

      {error ? <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p> : null}
      {success ? <p className="rounded-md border border-emerald-300/40 bg-emerald-100/30 px-3 py-2 text-sm text-emerald-700">{success}</p> : null}

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-lg font-semibold text-card-foreground">Current Admin Users</h3>
          <Button type="button" variant="outline" size="sm" onClick={() => void loadUsers()} disabled={isLoading}>
            {isLoading ? "Refreshing..." : "Refresh"}
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
                  <th className="py-2 pr-3 font-medium">Last Login</th>
                  <th className="py-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((user) => (
                  <tr key={user.email}>
                    <td className="py-2 pr-3">
                      <p className="font-medium text-card-foreground">{user.email}</p>
                    </td>
                    <td className="py-2 pr-3">
                      <select
                        value={user.role}
                        onChange={(event) =>
                          void updateUser(user.email, { role: event.target.value as AdminRole }, "Admin role updated.")
                        }
                        className="rounded-md border border-input bg-background px-2 py-1 text-xs text-foreground"
                      >
                        {roleOptions.map((option) => (
                          <option key={`${user.email}-${option.value}`} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2 pr-3 text-card-foreground">{user.active ? "Active" : "Disabled"}</td>
                    <td className="py-2 pr-3 text-card-foreground">{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString("en-GB") : "Never"}</td>
                    <td className="py-2">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => void updateUser(user.email, { active: !user.active }, user.active ? "Admin disabled." : "Admin enabled.")}
                        >
                          {user.active ? "Disable" : "Enable"}
                        </Button>
                        <Button type="button" variant="destructive" size="sm" onClick={() => void deleteUser(user.email)}>
                          Remove
                        </Button>
                      </div>
                    </td>
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
