"use client"

import { FormEvent, useEffect, useMemo, useState } from "react"

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

export function NewsManager() {
  const [items, setItems] = useState<NewsAdminRecord[]>([])
  const [form, setForm] = useState<NewsFormState>(initialFormState)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const submitLabel = useMemo(() => (editingId ? "Update News Item" : "Create News Item"), [editingId])

  useEffect(() => {
    void loadNews()
  }, [])

  async function loadNews() {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/admin/news", { method: "GET", cache: "no-store" })
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
    setSuccess(null)
    setError(null)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const endpoint = editingId ? `/api/admin/news/${editingId}` : "/api/admin/news"
      const method = editingId ? "PATCH" : "POST"

      const response = await fetch(endpoint, {
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
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch(`/api/admin/news/${item.id}`, {
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
    }
  }

  async function handleDelete(item: NewsAdminRecord) {
    const confirmed = window.confirm(`Delete "${item.title}"? This cannot be undone.`)
    if (!confirmed) return

    setError(null)
    setSuccess(null)

    try {
      const response = await fetch(`/api/admin/news/${item.id}`, { method: "DELETE" })
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
    }
  }

  return (
    <section className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-card-foreground">{editingId ? "Edit News Item" : "Create News Item"}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Use verified district content only. Leave image empty if no approved image URL/path is available.
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
              placeholder="example-news-item"
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </label>

          <label className="text-sm md:col-span-2">
            <span className="font-medium text-card-foreground">Summary</span>
            <textarea
              required
              value={form.summary}
              onChange={(event) => setForm((current) => ({ ...current, summary: event.target.value }))}
              rows={3}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </label>

          <label className="text-sm md:col-span-2">
            <span className="font-medium text-card-foreground">Body</span>
            <textarea
              required
              value={form.body}
              onChange={(event) => setForm((current) => ({ ...current, body: event.target.value }))}
              rows={6}
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
                  category: event.target.value as NewsAdminRecord["category"],
                }))
              }
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
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
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </label>

          <label className="text-sm md:col-span-2">
            <span className="font-medium text-card-foreground">Image URL or local path (optional)</span>
            <input
              value={form.image}
              onChange={(event) => setForm((current) => ({ ...current, image: event.target.value }))}
              placeholder="/images/news/example.jpg"
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </label>

          <label className="inline-flex items-center gap-2 text-sm text-card-foreground">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(event) => setForm((current) => ({ ...current, featured: event.target.checked }))}
            />
            Featured
          </label>

          <label className="inline-flex items-center gap-2 text-sm text-card-foreground">
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
        <h3 className="text-lg font-semibold text-card-foreground">Existing News</h3>
        {isLoading ? <p className="mt-3 text-sm text-muted-foreground">Loading...</p> : null}
        {!isLoading && items.length === 0 ? <p className="mt-3 text-sm text-muted-foreground">No news items yet.</p> : null}

        {!isLoading && items.length > 0 ? (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full divide-y divide-border text-sm">
              <thead>
                <tr className="text-left text-muted-foreground">
                  <th className="py-2 pr-3 font-medium">Title</th>
                  <th className="py-2 pr-3 font-medium">Category</th>
                  <th className="py-2 pr-3 font-medium">Date</th>
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
                    <td className="py-2 pr-3 text-card-foreground">{item.date}</td>
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
