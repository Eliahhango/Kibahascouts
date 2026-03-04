"use client"

import dynamic from "next/dynamic"
import { FormEvent, useEffect, useMemo, useState } from "react"
import { EVENT_MAP_DEFAULT_ZOOM, buildOpenStreetMapPlaceUrl } from "@/lib/maps"
import { adminFetch } from "@/lib/auth/admin-fetch"

const EventLocationPicker = dynamic(
  () => import("@/components/admin/event-location-picker").then((module) => module.EventLocationPicker),
  {
    ssr: false,
    loading: () => (
      <div className="h-[320px] w-full animate-pulse rounded-md border border-border bg-secondary" />
    ),
  },
)

type EventAdminRecord = {
  id: string
  title: string
  slug: string
  description: string
  date: string
  time: string
  location: string
  latitude: number | null
  longitude: number | null
  mapZoom: number
  mapUrl: string
  image: string
  category: string
  registrationOpen: boolean
  registrationUrl: string
  published: boolean
  updatedAt: string
}

type EventFormState = Omit<EventAdminRecord, "id" | "updatedAt" | "mapUrl">

const initialFormState: EventFormState = {
  title: "",
  slug: "",
  description: "",
  date: "",
  time: "",
  location: "",
  latitude: null,
  longitude: null,
  mapZoom: EVENT_MAP_DEFAULT_ZOOM,
  image: "",
  category: "General",
  registrationOpen: false,
  registrationUrl: "",
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

function formatCoordinates(latitude: number | null, longitude: number | null) {
  if (typeof latitude !== "number" || typeof longitude !== "number") {
    return "No map point selected yet."
  }
  return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
}

export function EventsManager() {
  const [items, setItems] = useState<EventAdminRecord[]>([])
  const [form, setForm] = useState<EventFormState>(initialFormState)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [slugTouched, setSlugTouched] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [actionState, setActionState] = useState<{ id: string; type: "publish" | "delete" } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [publishFilter, setPublishFilter] = useState<"all" | "published" | "draft">("all")

  const submitLabel = useMemo(() => (editingId ? "Update Event" : "Create Event"), [editingId])
  const filteredItems = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()

    return items.filter((item) => {
      if (publishFilter === "published" && !item.published) return false
      if (publishFilter === "draft" && item.published) return false

      if (!normalizedQuery) return true

      const searchText = `${item.title} ${item.slug} ${item.location} ${item.category}`.toLowerCase()
      return searchText.includes(normalizedQuery)
    })
  }, [items, publishFilter, searchQuery])

  useEffect(() => {
    void loadEvents()
  }, [])

  async function loadEvents() {
    setIsLoading(true)
    setError(null)

    try {
      const response = await adminFetch("/api/admin/events", { method: "GET", cache: "no-store" })
      const payload = (await response.json()) as ApiResponse<EventAdminRecord[]>

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || "Unable to load events.")
      }

      setItems(payload.data || [])
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load events.")
    } finally {
      setIsLoading(false)
    }
  }

  function resetForm() {
    setForm(initialFormState)
    setEditingId(null)
    setSlugTouched(false)
  }

  function startEdit(item: EventAdminRecord) {
    setForm({
      title: item.title,
      slug: item.slug,
      description: item.description,
      date: item.date,
      time: item.time,
      location: item.location,
      latitude: typeof item.latitude === "number" ? item.latitude : null,
      longitude: typeof item.longitude === "number" ? item.longitude : null,
      mapZoom: item.mapZoom || EVENT_MAP_DEFAULT_ZOOM,
      image: item.image || "",
      category: item.category,
      registrationOpen: item.registrationOpen,
      registrationUrl: item.registrationUrl || "",
      published: item.published,
    })
    setEditingId(item.id)
    setSlugTouched(true)
    setSuccess(null)
    setError(null)
  }

  function handleMapSelect(latitude: number, longitude: number) {
    setForm((current) => ({
      ...current,
      latitude,
      longitude,
      location: current.location.trim() || `Map selected (${latitude.toFixed(5)}, ${longitude.toFixed(5)})`,
    }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (typeof form.latitude !== "number" || typeof form.longitude !== "number") {
      setError("Please select the event location from the map before saving.")
      setSuccess(null)
      return
    }

    const actionText = editingId ? "update" : "create"
    const publishText = form.published ? "and publish" : "as draft"
    const confirmed = window.confirm(`Are you sure you want to ${actionText} this event ${publishText}?`)
    if (!confirmed) return

    setIsSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const endpoint = editingId ? `/api/admin/events/${editingId}` : "/api/admin/events"
      const method = editingId ? "PATCH" : "POST"

      const response = await adminFetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })

      const payload = (await response.json()) as ApiResponse<EventAdminRecord>
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || "Unable to save event.")
      }

      setSuccess(editingId ? "Event updated." : "Event created.")
      resetForm()
      await loadEvents()
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to save event.")
    } finally {
      setIsSaving(false)
    }
  }

  async function handleTogglePublished(item: EventAdminRecord) {
    const nextAction = item.published ? "unpublish" : "publish"
    const confirmed = window.confirm(`Are you sure you want to ${nextAction} "${item.title}"?`)
    if (!confirmed) return

    setError(null)
    setSuccess(null)
    setActionState({ id: item.id, type: "publish" })

    try {
      const response = await adminFetch(`/api/admin/events/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !item.published }),
      })

      const payload = (await response.json()) as ApiResponse<EventAdminRecord>
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || "Unable to update publish status.")
      }

      setSuccess(`Event ${item.published ? "unpublished" : "published"}.`)
      await loadEvents()
    } catch (toggleError) {
      setError(toggleError instanceof Error ? toggleError.message : "Unable to update publish status.")
    } finally {
      setActionState(null)
    }
  }

  async function handleDelete(item: EventAdminRecord) {
    const confirmed = window.confirm(`Are you sure you want to delete "${item.title}"? This action cannot be undone.`)
    if (!confirmed) return

    setError(null)
    setSuccess(null)
    setActionState({ id: item.id, type: "delete" })

    try {
      const response = await adminFetch(`/api/admin/events/${item.id}`, { method: "DELETE" })
      const payload = (await response.json()) as ApiResponse<null>
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || "Unable to delete event.")
      }

      if (editingId === item.id) {
        resetForm()
      }
      setSuccess("Event deleted.")
      await loadEvents()
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Unable to delete event.")
    } finally {
      setActionState(null)
    }
  }

  return (
    <section className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-card-foreground">{editingId ? "Edit Event" : "Create Event"}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Select location from the map to place an exact event marker for public users.
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
            <span className="font-medium text-card-foreground">Date</span>
            <input
              required
              type="date"
              value={form.date}
              onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </label>

          <label className="text-sm">
            <span className="font-medium text-card-foreground">Time</span>
            <input
              required
              value={form.time}
              onChange={(event) => setForm((current) => ({ ...current, time: event.target.value }))}
              placeholder="e.g. 09:00 - 13:00"
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </label>

          <label className="text-sm md:col-span-2">
            <span className="font-medium text-card-foreground">Location Label</span>
            <input
              required
              value={form.location}
              onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))}
              placeholder="Kibaha District Grounds, Pwani"
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </label>

          <div className="text-sm md:col-span-2">
            <p className="font-medium text-card-foreground">Event Point on Map</p>
            <div className="mt-1">
              <EventLocationPicker
                latitude={form.latitude}
                longitude={form.longitude}
                zoom={form.mapZoom}
                eventTitle={form.title}
                locationName={form.location}
                onSelectLocation={handleMapSelect}
                onZoomChange={(zoom) => setForm((current) => ({ ...current, mapZoom: zoom }))}
              />
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span>Selected coordinates: {formatCoordinates(form.latitude, form.longitude)}</span>
              {typeof form.latitude === "number" && typeof form.longitude === "number" ? (
                <a
                  href={buildOpenStreetMapPlaceUrl(form.latitude, form.longitude, form.mapZoom)}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-tsa-green-deep hover:text-tsa-green-mid"
                >
                  Open selected point in map
                </a>
              ) : null}
              <button
                type="button"
                className="rounded border border-border px-2 py-1 text-[11px] font-semibold text-foreground"
                onClick={() =>
                  setForm((current) => ({
                    ...current,
                    latitude: null,
                    longitude: null,
                    mapZoom: EVENT_MAP_DEFAULT_ZOOM,
                  }))
                }
              >
                Clear Map Point
              </button>
            </div>
          </div>

          <label className="text-sm">
            <span className="font-medium text-card-foreground">Category</span>
            <input
              required
              value={form.category}
              onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
              placeholder="Training"
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </label>

          <label className="text-sm">
            <span className="font-medium text-card-foreground">Map Zoom</span>
            <input
              type="number"
              min={3}
              max={19}
              value={form.mapZoom}
              onChange={(event) =>
                setForm((current) => ({ ...current, mapZoom: Math.max(3, Math.min(19, Number(event.target.value || EVENT_MAP_DEFAULT_ZOOM))) }))
              }
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </label>

          <label className="text-sm md:col-span-2">
            <span className="font-medium text-card-foreground">Image URL or local path (optional)</span>
            <input
              value={form.image}
              onChange={(event) => setForm((current) => ({ ...current, image: event.target.value }))}
              placeholder="/images/events/example.jpg"
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </label>

          <label className="inline-flex items-center gap-2 text-sm text-card-foreground">
            <input
              type="checkbox"
              checked={form.registrationOpen}
              onChange={(event) => setForm((current) => ({ ...current, registrationOpen: event.target.checked }))}
            />
            Registration Open
          </label>

          <label className="inline-flex items-center gap-2 text-sm text-card-foreground">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(event) => setForm((current) => ({ ...current, published: event.target.checked }))}
            />
            Published
          </label>

          <label className="text-sm md:col-span-2">
            <span className="font-medium text-card-foreground">Registration URL (optional)</span>
            <input
              value={form.registrationUrl}
              onChange={(event) => setForm((current) => ({ ...current, registrationUrl: event.target.value }))}
              placeholder="https://..."
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
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
          <h3 className="text-lg font-semibold text-card-foreground">Existing Events</h3>
          <button
            type="button"
            onClick={() => void loadEvents()}
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
              placeholder="Title, slug, location..."
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
        {!isLoading && items.length === 0 ? <p className="mt-3 text-sm text-muted-foreground">No events yet.</p> : null}
        {!isLoading && items.length > 0 && filteredItems.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">No events match your filters.</p>
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
                  <th className="py-2 pr-3 font-medium">Date</th>
                  <th className="py-2 pr-3 font-medium">Location</th>
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
                    <td className="py-2 pr-3 text-card-foreground">{item.date}</td>
                    <td className="py-2 pr-3 text-card-foreground">
                      <p>{item.location}</p>
                      <p className="text-xs text-muted-foreground">{formatCoordinates(item.latitude, item.longitude)}</p>
                    </td>
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
                          onClick={() => void handleDelete(item)}
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
