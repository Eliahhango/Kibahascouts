"use client"

import { FormEvent, useEffect, useMemo, useState } from "react"
import { adminFetch } from "@/lib/auth/admin-fetch"

type ResourceAdminRecord = {
  id: string
  title: string
  slug: string
  description: string
  category: "Forms" | "Training" | "Policies" | "Badges" | "Reports" | "General"
  fileType: "PDF" | "DOCX" | "XLSX" | "ZIP" | "UNKNOWN"
  fileSize: string
  publishDate: string
  downloadUrl: string
  published: boolean
  updatedAt: string
}

type ResourceFormState = Omit<ResourceAdminRecord, "id" | "updatedAt">

const initialFormState: ResourceFormState = {
  title: "",
  slug: "",
  description: "",
  category: "General",
  fileType: "UNKNOWN",
  fileSize: "",
  publishDate: "",
  downloadUrl: "",
  published: false,
}

type ApiResponse<T> = {
  ok: boolean
  data?: T
  error?: string
}

function createSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function ResourcesManager() {
  const [items, setItems] = useState<ResourceAdminRecord[]>([])
  const [form, setForm] = useState<ResourceFormState>(initialFormState)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [slugTouched, setSlugTouched] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [actionState, setActionState] = useState<{ id: string; type: "publish" | "delete" } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [publishFilter, setPublishFilter] = useState<"all" | "published" | "draft">("all")

  const submitLabel = useMemo(() => (editingId ? "Update Resource" : "Create Resource"), [editingId])
  const filteredItems = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()

    return items.filter((item) => {
      if (publishFilter === "published" && !item.published) return false
      if (publishFilter === "draft" && item.published) return false

      if (!normalizedQuery) return true

      const searchText = `${item.title} ${item.slug} ${item.category} ${item.fileType}`.toLowerCase()
      return searchText.includes(normalizedQuery)
    })
  }, [items, publishFilter, searchQuery])

  useEffect(() => {
    void loadResources()
  }, [])

  async function loadResources() {
    setIsLoading(true)
    setError(null)

    try {
      const response = await adminFetch("/api/admin/resources", { method: "GET", cache: "no-store" })
      const payload = (await response.json()) as ApiResponse<ResourceAdminRecord[]>

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || "Unable to load resources.")
      }

      setItems(payload.data || [])
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load resources.")
    } finally {
      setIsLoading(false)
    }
  }

  function resetForm() {
    setForm(initialFormState)
    setEditingId(null)
    setSlugTouched(false)
  }

  function startEdit(item: ResourceAdminRecord) {
    setForm({
      title: item.title,
      slug: item.slug,
      description: item.description,
      category: item.category,
      fileType: item.fileType,
      fileSize: item.fileSize,
      publishDate: item.publishDate,
      downloadUrl: item.downloadUrl || "",
      published: item.published,
    })
    setEditingId(item.id)
    setSlugTouched(true)
    setSuccess(null)
    setError(null)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const endpoint = editingId ? `/api/admin/resources/${editingId}` : "/api/admin/resources"
      const method = editingId ? "PATCH" : "POST"

      const response = await adminFetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })

      const payload = (await response.json()) as ApiResponse<ResourceAdminRecord>
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || "Unable to save resource.")
      }

      setSuccess(editingId ? "Resource updated." : "Resource created.")
      resetForm()
      await loadResources()
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to save resource.")
    } finally {
      setIsSaving(false)
    }
  }

  async function handleTogglePublished(item: ResourceAdminRecord) {
    setError(null)
    setSuccess(null)
    setActionState({ id: item.id, type: "publish" })

    try {
      const response = await adminFetch(`/api/admin/resources/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !item.published }),
      })

      const payload = (await response.json()) as ApiResponse<ResourceAdminRecord>
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || "Unable to update publish status.")
      }

      setSuccess(`Resource ${item.published ? "unpublished" : "published"}.`)
      await loadResources()
    } catch (toggleError) {
      setError(toggleError instanceof Error ? toggleError.message : "Unable to update publish status.")
    } finally {
      setActionState(null)
    }
  }

  async function handleDelete(item: ResourceAdminRecord) {
    const confirmed = window.confirm(`Delete "${item.title}"? This cannot be undone.`)
    if (!confirmed) return

    setError(null)
    setSuccess(null)
    setActionState({ id: item.id, type: "delete" })

    try {
      const response = await adminFetch(`/api/admin/resources/${item.id}`, { method: "DELETE" })
      const payload = (await response.json()) as ApiResponse<null>
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || "Unable to delete resource.")
      }

      if (editingId === item.id) {
        resetForm()
      }
      setSuccess("Resource deleted.")
      await loadResources()
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Unable to delete resource.")
    } finally {
      setActionState(null)
    }
  }

  return (
    <section className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-card-foreground">{editingId ? "Edit Resource" : "Create Resource"}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          External downloads are supported. If no approved file URL exists yet, leave Download URL empty.
        </p>

        <form className="mt-5 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <label className="text-sm">
            <span className="font-medium text-card-foreground">Title</span>
            <input
              required
              value={form.title}
              onChange={(event) => {
                const nextTitle = event.target.value
                setForm((current) => ({
                  ...current,
                  title: nextTitle,
                  slug: slugTouched ? current.slug : createSlug(nextTitle),
                }))
              }}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </label>

          <label className="text-sm">
            <span className="font-medium text-card-foreground">Slug</span>
            <input
              required
              value={form.slug}
              onChange={(event) => {
                setSlugTouched(true)
                setForm((current) => ({ ...current, slug: event.target.value }))
              }}
              pattern="[a-z0-9-]+"
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </label>

          <label className="text-sm md:col-span-2">
            <span className="font-medium text-card-foreground">Description</span>
            <textarea
              required
              rows={4}
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </label>

          <label className="text-sm">
            <span className="font-medium text-card-foreground">Category</span>
            <select
              value={form.category}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  category: event.target.value as ResourceAdminRecord["category"],
                }))
              }
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="Forms">Forms</option>
              <option value="Training">Training</option>
              <option value="Policies">Policies</option>
              <option value="Badges">Badges</option>
              <option value="Reports">Reports</option>
              <option value="General">General</option>
            </select>
          </label>

          <label className="text-sm">
            <span className="font-medium text-card-foreground">File Type</span>
            <select
              value={form.fileType}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  fileType: event.target.value as ResourceAdminRecord["fileType"],
                }))
              }
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="PDF">PDF</option>
              <option value="DOCX">DOCX</option>
              <option value="XLSX">XLSX</option>
              <option value="ZIP">ZIP</option>
              <option value="UNKNOWN">UNKNOWN</option>
            </select>
          </label>

          <label className="text-sm">
            <span className="font-medium text-card-foreground">File Size</span>
            <input
              required
              value={form.fileSize}
              onChange={(event) => setForm((current) => ({ ...current, fileSize: event.target.value }))}
              placeholder="e.g. 2.4 MB"
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </label>

          <label className="text-sm">
            <span className="font-medium text-card-foreground">Publish Date</span>
            <input
              required
              type="date"
              value={form.publishDate}
              onChange={(event) => setForm((current) => ({ ...current, publishDate: event.target.value }))}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </label>

          <label className="text-sm md:col-span-2">
            <span className="font-medium text-card-foreground">Download URL (optional)</span>
            <input
              value={form.downloadUrl}
              onChange={(event) => setForm((current) => ({ ...current, downloadUrl: event.target.value }))}
              placeholder="https://..."
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </label>

          <label className="inline-flex items-center gap-2 text-sm text-card-foreground md:col-span-2">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(event) => setForm((current) => ({ ...current, published: event.target.checked }))}
            />
            Published
          </label>

          <div className="md:col-span-2 flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-70"
            >
              {isSaving ? "Saving..." : submitLabel}
            </button>
            {editingId ? (
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex rounded-md border border-border px-4 py-2 text-sm font-semibold text-foreground"
              >
                Cancel Edit
              </button>
            ) : null}
          </div>
        </form>
      </div>

      {error ? <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p> : null}
      {success ? <p className="rounded-md border border-emerald-300/40 bg-emerald-100/30 px-3 py-2 text-sm text-emerald-700">{success}</p> : null}

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-lg font-semibold text-card-foreground">Existing Resources</h3>
          <button
            type="button"
            onClick={() => void loadResources()}
            disabled={isLoading}
            className="rounded-md border border-border px-3 py-1.5 text-xs font-semibold text-foreground disabled:opacity-70"
          >
            {isLoading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <label className="text-xs text-muted-foreground">
            Search
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Title, slug, category..."
              className="mt-1 block w-60 max-w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
            />
          </label>

          <label className="text-xs text-muted-foreground">
            Status
            <select
              value={publishFilter}
              onChange={(event) => setPublishFilter(event.target.value as "all" | "published" | "draft")}
              className="mt-1 block rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
            >
              <option value="all">All</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </label>
        </div>

        {isLoading ? <p className="mt-3 text-sm text-muted-foreground">Loading...</p> : null}
        {!isLoading && items.length === 0 ? <p className="mt-3 text-sm text-muted-foreground">No resources yet.</p> : null}
        {!isLoading && items.length > 0 && filteredItems.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">No resources match your filters.</p>
        ) : null}
        {!isLoading && filteredItems.length > 0 ? (
          <p className="mt-3 text-xs text-muted-foreground">
            Showing {filteredItems.length} of {items.length} item(s).
          </p>
        ) : null}

        {!isLoading && filteredItems.length > 0 ? (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full divide-y divide-border text-sm">
              <thead>
                <tr className="text-left text-muted-foreground">
                  <th className="py-2 pr-3 font-medium">Title</th>
                  <th className="py-2 pr-3 font-medium">Category</th>
                  <th className="py-2 pr-3 font-medium">Type</th>
                  <th className="py-2 pr-3 font-medium">Published</th>
                  <th className="py-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredItems.map((item) => (
                  <tr key={item.id}>
                    <td className="py-2 pr-3">
                      <p className="font-medium text-card-foreground">{item.title}</p>
                      <p className="text-xs text-muted-foreground">/{item.slug}</p>
                    </td>
                    <td className="py-2 pr-3 text-card-foreground">{item.category}</td>
                    <td className="py-2 pr-3 text-card-foreground">{item.fileType}</td>
                    <td className="py-2 pr-3 text-card-foreground">{item.published ? "Yes" : "No"}</td>
                    <td className="py-2">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => startEdit(item)}
                          disabled={Boolean(actionState)}
                          className="rounded-md border border-border px-3 py-1 text-xs font-semibold text-foreground"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleTogglePublished(item)}
                          disabled={actionState?.id === item.id}
                          className="rounded-md border border-border px-3 py-1 text-xs font-semibold text-foreground"
                        >
                          {actionState?.id === item.id && actionState.type === "publish" ? "Updating..." : item.published ? "Unpublish" : "Publish"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item)}
                          disabled={actionState?.id === item.id}
                          className="rounded-md border border-destructive/40 px-3 py-1 text-xs font-semibold text-destructive"
                        >
                          {actionState?.id === item.id && actionState.type === "delete" ? "Deleting..." : "Delete"}
                        </button>
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
