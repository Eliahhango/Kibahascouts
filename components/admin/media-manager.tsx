"use client"

import { FormEvent, useEffect, useMemo, useState } from "react"
import { adminFetch } from "@/lib/auth/admin-fetch"
import { ImageUploadField } from "@/components/admin/image-upload-field"
import { Spinner } from "@/components/ui/spinner"

type MediaKind = "video" | "gallery"

type MediaAdminRecord = {
  id: string
  title: string
  kind: MediaKind
  thumbnail: string
  href: string
  embedUrl: string
  sourceProvider: string
  description: string
  displayOrder: number
  published: boolean
  updatedAt: string
}

type MediaFormState = Omit<MediaAdminRecord, "id" | "updatedAt">

const initialFormState: MediaFormState = {
  title: "",
  kind: "video",
  thumbnail: "",
  href: "",
  embedUrl: "",
  sourceProvider: "",
  description: "",
  displayOrder: 0,
  published: false,
}

type ApiResponse<T> = {
  ok: boolean
  data?: T
  error?: string
}

type MediaPreview = {
  sourceUrl: string
  provider: string
  embedUrl: string
  title?: string
  description?: string
  thumbnail?: string
}

type InstagramImportPreview = {
  thumbnailUrl: string
  title: string
  authorName: string
  embedUrl: string
  postUrl: string
}

export function MediaManager() {
  const [items, setItems] = useState<MediaAdminRecord[]>([])
  const [form, setForm] = useState<MediaFormState>(initialFormState)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isResolvingPreview, setIsResolvingPreview] = useState(false)
  const [instagramUrl, setInstagramUrl] = useState("")
  const [instagramPreview, setInstagramPreview] = useState<InstagramImportPreview | null>(null)
  const [isFetchingInstagram, setIsFetchingInstagram] = useState(false)
  const [instagramImportMode, setInstagramImportMode] = useState<"gallery" | "video" | null>(null)
  const [actionState, setActionState] = useState<{ id: string; type: "publish" | "delete" } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [publishFilter, setPublishFilter] = useState<"all" | "published" | "draft">("all")

  const submitLabel = useMemo(() => (editingId ? "Update Media Item" : "Create Media Item"), [editingId])
  const filteredItems = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()

    return items.filter((item) => {
      if (publishFilter === "published" && !item.published) return false
      if (publishFilter === "draft" && item.published) return false

      if (!normalizedQuery) return true

      const searchText = `${item.title} ${item.kind} ${item.description} ${item.sourceProvider}`.toLowerCase()
      return searchText.includes(normalizedQuery)
    })
  }, [items, publishFilter, searchQuery])

  useEffect(() => {
    void loadMedia()
  }, [])

  async function loadMedia() {
    setIsLoading(true)
    setError(null)

    try {
      const response = await adminFetch("/api/admin/media", { method: "GET", cache: "no-store" })
      const payload = (await response.json()) as ApiResponse<MediaAdminRecord[]>

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || "Unable to load media items.")
      }

      setItems(payload.data || [])
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load media items.")
    } finally {
      setIsLoading(false)
    }
  }

  function resetForm() {
    setForm(initialFormState)
    setEditingId(null)
  }

  function startEdit(item: MediaAdminRecord) {
    setForm({
      title: item.title,
      kind: item.kind,
      thumbnail: item.thumbnail,
      href: item.href || "",
      embedUrl: item.embedUrl || "",
      sourceProvider: item.sourceProvider || "",
      description: item.description || "",
      displayOrder: item.displayOrder || 0,
      published: item.published,
    })
    setEditingId(item.id)
    setSuccess(null)
    setError(null)
  }

  async function handleFetchFromLink() {
    const sourceUrl = form.href.trim()
    if (!sourceUrl) {
      setError("Please paste a video URL first.")
      setSuccess(null)
      return
    }

    setIsResolvingPreview(true)
    setError(null)
    setSuccess(null)

    try {
      const query = new URLSearchParams({ url: sourceUrl })
      const response = await adminFetch(`/api/admin/media/preview?${query.toString()}`, {
        method: "GET",
        cache: "no-store",
      })
      const payload = (await response.json()) as ApiResponse<MediaPreview>
      if (!response.ok || !payload.ok || !payload.data) {
        throw new Error(payload.error || "Unable to fetch preview metadata.")
      }

      const preview = payload.data
      setForm((current) => ({
        ...current,
        kind: "video",
        href: preview.sourceUrl || current.href,
        sourceProvider: current.sourceProvider.trim() || preview.provider || "",
        embedUrl: current.embedUrl.trim() || preview.embedUrl || "",
        title: current.title.trim() || preview.title || current.title,
        description: current.description.trim() || preview.description || current.description,
        thumbnail: current.thumbnail.trim() || preview.thumbnail || current.thumbnail,
      }))
      setSuccess("Video metadata fetched. Review details, then save.")
    } catch (previewError) {
      setError(previewError instanceof Error ? previewError.message : "Unable to fetch preview metadata.")
    } finally {
      setIsResolvingPreview(false)
    }
  }

  async function handleFetchInstagramImages() {
    const sourceUrl = instagramUrl.trim()
    if (!sourceUrl) {
      setError("Please paste an Instagram post URL first.")
      setSuccess(null)
      return
    }

    setIsFetchingInstagram(true)
    setInstagramPreview(null)
    setError(null)
    setSuccess(null)

    try {
      const response = await adminFetch("/api/admin/media/instagram-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: sourceUrl }),
      })

      const payload = (await response.json()) as ApiResponse<InstagramImportPreview>
      if (!response.ok || !payload.ok || !payload.data) {
        throw new Error(payload.error || "Could not fetch Instagram post. Make sure the post is public.")
      }

      setInstagramPreview(payload.data)
      setSuccess("Instagram post fetched. Choose how to import it.")
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Could not fetch Instagram post. Make sure the post is public.")
    } finally {
      setIsFetchingInstagram(false)
    }
  }

  async function handleAddInstagram(kind: "gallery" | "video") {
    if (!instagramPreview) {
      return
    }

    setInstagramImportMode(kind)
    setError(null)
    setSuccess(null)

    const title = instagramPreview.title?.trim() || "Instagram Post"
    const description = instagramPreview.authorName
      ? `Imported from Instagram by ${instagramPreview.authorName}`
      : "Imported from Instagram"

    try {
      const response = await adminFetch("/api/admin/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind,
          title,
          thumbnail: instagramPreview.thumbnailUrl,
          href: instagramPreview.postUrl,
          embedUrl: kind === "video" ? instagramPreview.embedUrl : "",
          sourceProvider: "Instagram",
          description,
          published: false,
        }),
      })

      const payload = (await response.json()) as ApiResponse<MediaAdminRecord>
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || "Unable to import Instagram media.")
      }

      setSuccess(kind === "gallery" ? "Instagram post added as gallery image." : "Instagram post added as video embed.")
      await loadMedia()
    } catch (importError) {
      setError(importError instanceof Error ? importError.message : "Unable to import Instagram media.")
    } finally {
      setInstagramImportMode(null)
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const actionText = editingId ? "update" : "create"
    const publishText = form.published ? "and publish" : "as draft"
    const confirmed = window.confirm(`Are you sure you want to ${actionText} this media item ${publishText}?`)
    if (!confirmed) return

    setIsSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const endpoint = editingId ? `/api/admin/media/${editingId}` : "/api/admin/media"
      const method = editingId ? "PATCH" : "POST"

      const response = await adminFetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })

      const payload = (await response.json()) as ApiResponse<MediaAdminRecord>
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || "Unable to save media item.")
      }

      setSuccess(editingId ? "Media item updated." : "Media item created.")
      resetForm()
      await loadMedia()
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to save media item.")
    } finally {
      setIsSaving(false)
    }
  }

  async function handleTogglePublished(item: MediaAdminRecord) {
    const nextAction = item.published ? "unpublish" : "publish"
    const confirmed = window.confirm(`Are you sure you want to ${nextAction} "${item.title}"?`)
    if (!confirmed) return

    setError(null)
    setSuccess(null)
    setActionState({ id: item.id, type: "publish" })

    try {
      const response = await adminFetch(`/api/admin/media/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !item.published }),
      })

      const payload = (await response.json()) as ApiResponse<MediaAdminRecord>
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || "Unable to update publish status.")
      }

      setSuccess(`Media item ${item.published ? "unpublished" : "published"}.`)
      await loadMedia()
    } catch (toggleError) {
      setError(toggleError instanceof Error ? toggleError.message : "Unable to update publish status.")
    } finally {
      setActionState(null)
    }
  }

  async function handleDelete(item: MediaAdminRecord) {
    const confirmed = window.confirm(`Are you sure you want to delete "${item.title}"? This action cannot be undone.`)
    if (!confirmed) return

    setError(null)
    setSuccess(null)
    setActionState({ id: item.id, type: "delete" })

    try {
      const response = await adminFetch(`/api/admin/media/${item.id}`, { method: "DELETE" })
      const payload = (await response.json()) as ApiResponse<null>
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || "Unable to delete media item.")
      }

      if (editingId === item.id) {
        resetForm()
      }
      setSuccess("Media item deleted.")
      await loadMedia()
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Unable to delete media item.")
    } finally {
      setActionState(null)
    }
  }

  return (
    <section className="space-y-6">
      <div id="media-editor" className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-card-foreground">{editingId ? "Edit Media Item" : "Create Media Item"}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Paste a video link and click fetch to auto-fill caption/title and embed settings. Gallery items can still be entered manually.
        </p>

        <details className="mt-4 rounded-lg border border-border bg-secondary/30 p-4">
          <summary className="cursor-pointer text-sm font-semibold text-card-foreground">Import from Instagram</summary>
          <div className="mt-3 space-y-3">
            <label className="block text-sm">
              <span className="font-medium text-card-foreground">Instagram Post URL</span>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <input
                  value={instagramUrl}
                  onChange={(event) => setInstagramUrl(event.target.value)}
                  placeholder="https://www.instagram.com/p/ABC123/"
                  className="min-w-[260px] flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  onClick={() => void handleFetchInstagramImages()}
                  disabled={isFetchingInstagram || !instagramUrl.trim()}
                  className="inline-flex items-center rounded-md border border-border px-3 py-2 text-xs font-semibold text-foreground disabled:opacity-70"
                >
                  {isFetchingInstagram ? (
                    <>
                      <Spinner size="sm" className="mr-1.5" />
                      Fetching...
                    </>
                  ) : (
                    "Fetch Images"
                  )}
                </button>
              </div>
            </label>

            {instagramPreview ? (
              <article className="rounded-lg border border-border bg-background p-3">
                {instagramPreview.thumbnailUrl ? (
                  <img
                    src={instagramPreview.thumbnailUrl}
                    alt={instagramPreview.title || "Instagram preview"}
                    className="h-40 w-full rounded-md object-cover"
                  />
                ) : null}
                <p className="mt-2 text-sm font-semibold text-card-foreground">{instagramPreview.title || "Instagram Post"}</p>
                <p className="text-xs text-muted-foreground">{instagramPreview.authorName || "Instagram"}</p>

                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => void handleAddInstagram("gallery")}
                    disabled={instagramImportMode !== null}
                    className="inline-flex items-center rounded-md border border-border px-3 py-2 text-xs font-semibold text-foreground disabled:opacity-70"
                  >
                    {instagramImportMode === "gallery" ? (
                      <>
                        <Spinner size="sm" className="mr-1.5" />
                        Importing...
                      </>
                    ) : (
                      "Add as Gallery Image"
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleAddInstagram("video")}
                    disabled={instagramImportMode !== null}
                    className="inline-flex items-center rounded-md border border-border px-3 py-2 text-xs font-semibold text-foreground disabled:opacity-70"
                  >
                    {instagramImportMode === "video" ? (
                      <>
                        <Spinner size="sm" className="mr-1.5" />
                        Importing...
                      </>
                    ) : (
                      "Add as Video Embed"
                    )}
                  </button>
                </div>
              </article>
            ) : null}
          </div>
        </details>

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
            <span className="font-medium text-card-foreground">Type</span>
            <select
              value={form.kind}
              onChange={(event) => {
                const nextKind = event.target.value as MediaKind
                setForm((current) => ({
                  ...current,
                  kind: nextKind,
                  ...(nextKind === "gallery" ? { embedUrl: "", sourceProvider: "" } : {}),
                }))
              }}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="video">Video</option>
              <option value="gallery">Gallery</option>
            </select>
          </label>

          <label className="text-sm md:col-span-2">
            <span className="font-medium text-card-foreground">Video or gallery URL</span>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <input
                value={form.href}
                onChange={(event) => setForm((current) => ({ ...current, href: event.target.value }))}
                placeholder="https://youtube.com/... or /newsroom/..."
                className="min-w-[260px] flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
              <button
                type="button"
                onClick={() => void handleFetchFromLink()}
                disabled={isResolvingPreview || !form.href.trim()}
                className="inline-flex items-center rounded-md border border-border px-3 py-2 text-xs font-semibold text-foreground disabled:opacity-70"
              >
                {isResolvingPreview ? (
                  <>
                    <Spinner size="sm" className="mr-1.5" />
                    Fetching...
                  </>
                ) : (
                  "Fetch from Link"
                )}
              </button>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">For videos, this will auto-fill provider, embed URL, and available metadata.</p>
          </label>

          <label className="text-sm">
            <span className="font-medium text-card-foreground">Source Provider</span>
            <input
              value={form.sourceProvider}
              onChange={(event) => setForm((current) => ({ ...current, sourceProvider: event.target.value }))}
              placeholder="YouTube"
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </label>

          <label className="text-sm">
            <span className="font-medium text-card-foreground">Embed URL (optional)</span>
            <input
              value={form.embedUrl}
              onChange={(event) => setForm((current) => ({ ...current, embedUrl: event.target.value }))}
              placeholder="https://www.youtube.com/embed/..."
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </label>

          <div className="md:col-span-2">
            <ImageUploadField
              label="Thumbnail Image"
              value={form.thumbnail}
              onChange={(url) => setForm((current) => ({ ...current, thumbnail: url }))}
              folder="media"
              placeholder="https://..."
            />
          </div>

          <label className="text-sm md:col-span-2">
            <span className="font-medium text-card-foreground">Description</span>
            <textarea
              rows={3}
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </label>

          <label className="text-sm">
            <span className="font-medium text-card-foreground">Display Order</span>
            <input
              min={0}
              type="number"
              value={form.displayOrder}
              onChange={(event) => setForm((current) => ({ ...current, displayOrder: Number(event.target.value || 0) }))}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
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
                  Saving media...
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
          <h3 className="text-lg font-semibold text-card-foreground">Existing Media Items</h3>
          <button
            type="button"
            onClick={() => void loadMedia()}
            disabled={isLoading}
            title="Reloads the list of items - does not publish or change anything"
            className="inline-flex items-center rounded-md px-2.5 py-1.5 text-xs font-semibold text-muted-foreground transition hover:bg-secondary hover:text-foreground disabled:opacity-70"
          >
            {isLoading ? (
              <span className="inline-flex items-center">
                <Spinner size="sm" className="mr-1.5" />
                Refreshing media...
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
              placeholder="Title, type, description..."
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
        {!isLoading && items.length === 0 ? <p className="mt-3 text-sm text-muted-foreground">No media items yet.</p> : null}
        {!isLoading && items.length > 0 && filteredItems.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">No media items match your filters.</p>
        ) : null}

        {!isLoading && filteredItems.length > 0 ? (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full divide-y divide-border text-sm">
              <thead>
                <tr className="text-left text-muted-foreground">
                  <th className="py-2 pr-3 font-medium">Title</th>
                  <th className="py-2 pr-3 font-medium">Type</th>
                  <th className="py-2 pr-3 font-medium">Provider</th>
                  <th className="py-2 pr-3 font-medium">Order</th>
                  <th className="py-2 pr-3 font-medium">Visibility</th>
                  <th className="py-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredItems.map((item) => (
                  <tr key={item.id}>
                    <td className="py-2 pr-3">
                      <p className="font-medium text-card-foreground">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.thumbnail || item.href || "-"}</p>
                    </td>
                    <td className="py-2 pr-3 text-card-foreground capitalize">{item.kind}</td>
                    <td className="py-2 pr-3 text-card-foreground">{item.sourceProvider || "-"}</td>
                    <td className="py-2 pr-3 text-card-foreground">{item.displayOrder}</td>
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
                          onClick={() => void handleDelete(item)}
                          disabled={actionState?.id === item.id}
                          className="rounded-md border border-destructive/40 px-3 py-1 text-xs font-semibold text-destructive"
                        >
                          {actionState?.id === item.id && actionState.type === "delete" ? (
                            <span className="inline-flex items-center">
                              <Spinner size="sm" className="mr-1.5" />
                              Deleting media...
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
