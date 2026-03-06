"use client"

import { FormEvent, useEffect, useMemo, useState } from "react"
import { adminFetch } from "@/lib/auth/admin-fetch"
import { ImageUploadField } from "@/components/admin/image-upload-field"
import { RichTextEditor } from "@/components/admin/rich-text-editor"
import { Spinner } from "@/components/ui/spinner"

type NewsAdminRecord = {
  id: string
  title: string
  slug: string
  summary: string
  body: string
  category: "Announcements" | "Training" | "Community Service" | "Awards" | "General"
  image: string
  date: string
  featured: boolean
  published: boolean
  updatedAt: string
}

type NewsFormState = Omit<NewsAdminRecord, "id" | "updatedAt">

const initialFormState: NewsFormState = {
  title: "",
  slug: "",
  summary: "",
  body: "",
  category: "General",
  image: "",
  date: "",
  featured: false,
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

export function NewsManager() {
  const [items, setItems] = useState<NewsAdminRecord[]>([])
  const [form, setForm] = useState<NewsFormState>(initialFormState)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [slugTouched, setSlugTouched] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [actionState, setActionState] = useState<{ id: string; type: "publish" | "delete" } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [publishFilter, setPublishFilter] = useState<"all" | "published" | "draft">("all")

  const submitLabel = useMemo(() => (editingId ? "Update News Item" : "Create News Item"), [editingId])
  const savingLabel = useMemo(() => (editingId ? "Updating article..." : "Publishing article..."), [editingId])
  const filteredItems = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()

    return items.filter((item) => {
      if (publishFilter === "published" && !item.published) return false
      if (publishFilter === "draft" && item.published) return false

      if (!normalizedQuery) return true

      const searchText = `${item.title} ${item.slug} ${item.category}`.toLowerCase()
      return searchText.includes(normalizedQuery)
    })
  }, [items, publishFilter, searchQuery])

  useEffect(() => {
    void loadNews()
  }, [])

  async function loadNews() {
    setIsLoading(true)
    setError(null)

    try {
      const response = await adminFetch("/api/admin/news", { method: "GET", cache: "no-store" })
      const payload = (await response.json()) as ApiResponse<NewsAdminRecord[]>

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || "Unable to load news.")
      }

      setItems(payload.data || [])
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load news.")
    } finally {
      setIsLoading(false)
    }
  }

  function resetForm() {
    setForm(initialFormState)
    setEditingId(null)
    setSlugTouched(false)
  }

  function startEdit(item: NewsAdminRecord) {
    setForm({
      title: item.title,
      slug: item.slug,
      summary: item.summary,
      body: item.body,
      category: item.category,
      image: item.image || "",
      date: item.date,
      featured: item.featured,
      published: item.published,
    })
    setEditingId(item.id)
    setSlugTouched(true)
    setSuccess(null)
    setError(null)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const actionText = editingId ? "update" : "create"
    const publishText = form.published ? "and publish" : "as draft"
    const confirmed = window.confirm(`Are you sure you want to ${actionText} this news item ${publishText}?`)
    if (!confirmed) return

    setIsSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const endpoint = editingId ? `/api/admin/news/${editingId}` : "/api/admin/news"
      const method = editingId ? "PATCH" : "POST"

      const response = await adminFetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })

      const payload = (await response.json()) as ApiResponse<NewsAdminRecord>
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || "Unable to save news item.")
      }

      setSuccess(editingId ? "News item updated." : "News item created.")
      resetForm()
      await loadNews()
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to save news item.")
    } finally {
      setIsSaving(false)
    }
  }

  async function handleTogglePublished(item: NewsAdminRecord) {
    const nextAction = item.published ? "unpublish" : "publish"
    const confirmed = window.confirm(`Are you sure you want to ${nextAction} "${item.title}"?`)
    if (!confirmed) return

    setError(null)
    setSuccess(null)
    setActionState({ id: item.id, type: "publish" })

    try {
      const response = await adminFetch(`/api/admin/news/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !item.published }),
      })

      const payload = (await response.json()) as ApiResponse<NewsAdminRecord>
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || "Unable to update publish status.")
      }

      setSuccess(`News item ${item.published ? "unpublished" : "published"}.`)
      await loadNews()
    } catch (toggleError) {
      setError(toggleError instanceof Error ? toggleError.message : "Unable to update publish status.")
    } finally {
      setActionState(null)
    }
  }

  async function handleDelete(item: NewsAdminRecord) {
    const confirmed = window.confirm(`Are you sure you want to delete "${item.title}"? This action cannot be undone.`)
    if (!confirmed) return

    setError(null)
    setSuccess(null)
    setActionState({ id: item.id, type: "delete" })

    try {
      const response = await adminFetch(`/api/admin/news/${item.id}`, { method: "DELETE" })
      const payload = (await response.json()) as ApiResponse<null>
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || "Unable to delete news item.")
      }

      if (editingId === item.id) {
        resetForm()
      }
      setSuccess("News item deleted.")
      await loadNews()
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Unable to delete news item.")
    } finally {
      setActionState(null)
    }
  }

  return (
    <section className="space-y-6">
      <div id="news-editor" className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-card-foreground">{editingId ? "Edit News Item" : "Create News Item"}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Use verified district content only. Upload a new image or paste a trusted image URL.
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
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm admin-input"
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
              placeholder="example-news-item"
              pattern="[a-z0-9-]+"
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm admin-input"
            />
          </label>

          <label className="text-sm md:col-span-2">
            <span className="font-medium text-card-foreground">Summary</span>
            <textarea
              required
              value={form.summary}
              onChange={(event) => setForm((current) => ({ ...current, summary: event.target.value }))}
              rows={3}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm admin-input"
            />
          </label>

          <div className="md:col-span-2">
            <RichTextEditor
              label="Body"
              value={form.body}
              onChange={(nextValue) => setForm((current) => ({ ...current, body: nextValue }))}
              placeholder="Write the full story content with formatting..."
              minHeight={260}
            />
          </div>

          <label className="text-sm">
            <span className="font-medium text-card-foreground">Category</span>
            <select
              value={form.category}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  category: event.target.value as NewsAdminRecord["category"],
                }))
              }
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm admin-input"
            >
              <option value="Announcements">Announcements</option>
              <option value="Training">Training</option>
              <option value="Community Service">Community Service</option>
              <option value="Awards">Awards</option>
              <option value="General">General</option>
            </select>
          </label>

          <label className="text-sm">
            <span className="font-medium text-card-foreground">Date</span>
            <input
              required
              type="date"
              value={form.date}
              onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm admin-input"
            />
          </label>

          <div className="md:col-span-2">
            <ImageUploadField
              label="Article Image"
              value={form.image}
              onChange={(url) => setForm((current) => ({ ...current, image: url }))}
              folder="news"
              placeholder="https://..."
            />
          </div>

          <label className="inline-flex items-center gap-2 text-sm text-card-foreground">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(event) => setForm((current) => ({ ...current, featured: event.target.checked }))}
            />
            Featured
          </label>

          <div className="md:col-span-2">
            <p className="text-sm font-semibold text-card-foreground">Visibility</p>
            <div className="mt-2 flex gap-3">
              <button
                type="button"
                onClick={() => setForm((current) => ({ ...current, published: false }))}
                className={`flex-1 rounded-xl border-2 p-3 text-center text-sm font-semibold transition ${
                  !form.published
                    ? "border-amber-400 bg-amber-50 text-amber-700"
                    : "border-border text-muted-foreground hover:bg-secondary"
                }`}
              >
                Save as Draft
                <br />
                <span className="text-xs font-normal">Not visible to public</span>
              </button>
              <button
                type="button"
                onClick={() => setForm((current) => ({ ...current, published: true }))}
                className={`flex-1 rounded-xl border-2 p-3 text-center text-sm font-semibold transition ${
                  form.published
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                    : "border-border text-muted-foreground hover:bg-secondary"
                }`}
              >
                Publish to Website
                <br />
                <span className="text-xs font-normal">Visible to all visitors</span>
              </button>
            </div>
          </div>

          <div className="md:col-span-2 flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-70"
            >
              {isSaving ? (
                <>
                  <Spinner size="sm" className="mr-1.5" />
                  {savingLabel}
                </>
              ) : (
                submitLabel
              )}
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
          <h3 className="text-lg font-semibold text-card-foreground">Existing News</h3>
          <button
            type="button"
            onClick={() => void loadNews()}
            disabled={isLoading}
            title="Reloads the list of items - does not publish or change anything"
            className="inline-flex items-center rounded-md px-2.5 py-1.5 text-xs font-semibold text-muted-foreground transition hover:bg-secondary hover:text-foreground disabled:opacity-70"
          >
            {isLoading ? (
              <span className="inline-flex items-center">
                <Spinner size="sm" className="mr-1.5" />
                Refreshing articles...
              </span>
            ) : (
              "↻ Reload list"
            )}
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <label className="text-xs text-muted-foreground">
            Search
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Title, slug, category..."
              className="mt-1 block w-60 max-w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground admin-input"
            />
          </label>

          <label className="text-xs text-muted-foreground">
            Status
            <select
              value={publishFilter}
              onChange={(event) => setPublishFilter(event.target.value as "all" | "published" | "draft")}
              className="mt-1 block rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground admin-input"
            >
              <option value="all">All</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </label>
        </div>

        {isLoading ? <p className="mt-3 text-sm text-muted-foreground">Loading...</p> : null}
        {!isLoading && items.length === 0 ? <p className="mt-3 text-sm text-muted-foreground">No news items yet.</p> : null}
        {!isLoading && items.length > 0 && filteredItems.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">No news items match your filters.</p>
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
                  <th className="py-2 pr-3 font-medium">Date</th>
                  <th className="py-2 pr-3 font-medium">Visibility</th>
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
                    <td className="py-2 pr-3 text-card-foreground">{item.date}</td>
                    <td className="py-2 pr-3">
                      <div className="flex flex-col gap-1.5">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${
                            item.published
                              ? "border-emerald-200 bg-emerald-100 text-emerald-700"
                              : "border-amber-200 bg-amber-50 text-amber-700"
                          }`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${item.published ? "bg-emerald-500" : "bg-amber-400"}`} />
                          {item.published ? "Live on website" : "Draft - not visible"}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleTogglePublished(item)}
                          disabled={actionState?.id === item.id}
                          className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                            item.published
                              ? "border border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100"
                              : "border border-emerald-400 bg-emerald-600 text-white hover:bg-emerald-700"
                          }`}
                        >
                          {actionState?.id === item.id && actionState.type === "publish" ? (
                            <>
                              <Spinner size="sm" />
                              {item.published ? "Taking offline..." : "Publishing..."}
                            </>
                          ) : item.published ? (
                            "Take Offline"
                          ) : (
                            "Publish to Website"
                          )}
                        </button>
                      </div>
                    </td>
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
                          onClick={() => handleDelete(item)}
                          disabled={actionState?.id === item.id}
                          className="rounded-md border border-destructive/40 px-3 py-1 text-xs font-semibold text-destructive"
                        >
                          {actionState?.id === item.id && actionState.type === "delete" ? (
                            <span className="inline-flex items-center">
                              <Spinner size="sm" className="mr-1.5" />
                              Deleting article...
                            </span>
                          ) : (
                            "Delete"
                          )}
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
