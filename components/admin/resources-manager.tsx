"use client"

import { FormEvent, useEffect, useMemo, useState } from "react"

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

export function ResourcesManager() {
  const [items, setItems] = useState<ResourceAdminRecord[]>([])
  const [form, setForm] = useState<ResourceFormState>(initialFormState)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const submitLabel = useMemo(() => (editingId ? "Update Resource" : "Create Resource"), [editingId])

  useEffect(() => {
    void loadResources()
  }, [])

  async function loadResources() {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/admin/resources", { method: "GET", cache: "no-store" })
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

      const response = await fetch(endpoint, {
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

    try {
      const response = await fetch(`/api/admin/resources/${item.id}`, {
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
    }
  }

  async function handleDelete(item: ResourceAdminRecord) {
    const confirmed = window.confirm(`Delete "${item.title}"? This cannot be undone.`)
    if (!confirmed) return

    setError(null)
    setSuccess(null)

    try {
      const response = await fetch(`/api/admin/resources/${item.id}`, { method: "DELETE" })
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
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </label>

          <label className="text-sm">
            <span className="font-medium text-card-foreground">Slug</span>
            <input
              required
              value={form.slug}
              onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))}
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
              placeholder="[CONFIRM FILE SIZE]"
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
        <h3 className="text-lg font-semibold text-card-foreground">Existing Resources</h3>
        {isLoading ? <p className="mt-3 text-sm text-muted-foreground">Loading...</p> : null}
        {!isLoading && items.length === 0 ? <p className="mt-3 text-sm text-muted-foreground">No resources yet.</p> : null}

        {!isLoading && items.length > 0 ? (
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
                {items.map((item) => (
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
                          className="rounded-md border border-border px-3 py-1 text-xs font-semibold text-foreground"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleTogglePublished(item)}
                          className="rounded-md border border-border px-3 py-1 text-xs font-semibold text-foreground"
                        >
                          {item.published ? "Unpublish" : "Publish"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item)}
                          className="rounded-md border border-destructive/40 px-3 py-1 text-xs font-semibold text-destructive"
                        >
                          Delete
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
