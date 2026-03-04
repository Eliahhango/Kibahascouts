"use client"

import { FormEvent, useEffect, useMemo, useState } from "react"
import { Plus, Trash2 } from "lucide-react"
import { mainNavItems } from "@/lib/data"
import { adminFetch } from "@/lib/auth/admin-fetch"
import { Button } from "@/components/ui/button"

type NavigationChildItem = {
  label: string
  href: string
}

type NavigationItem = {
  label: string
  href: string
  description?: string
  children?: NavigationChildItem[]
}

type NavigationSettings = {
  mainNavItems: NavigationItem[]
  updatedAt?: string
  updatedBy?: string
}

type ApiResponse<T> = {
  ok: boolean
  data?: T
  error?: string
}

const defaultDescriptions: Record<string, string> = {
  "About Kibaha Scouts": "Institutional profile, leadership, history, and district governance.",
  Programmes: "Age-based sections, badge progression, and training pathways.",
  "Scout Units": "Directory of packs, troops, and crews across Kibaha wards.",
  Newsroom: "Official updates, press resources, and district announcements.",
  Events: "Calendar and registration for district-level activities and trainings.",
  Resources: "Downloadable forms, handbooks, policies, and annual reports.",
  "Join / Volunteer": "Start as youth, become a leader, or support district programmes.",
}

const defaultSettings: NavigationSettings = {
  mainNavItems: mainNavItems.map((item) => ({
    ...item,
    description: defaultDescriptions[item.label] || "",
    children: item.children?.map((child) => ({ ...child })) || [],
  })),
  updatedAt: "",
  updatedBy: "",
}

function cloneSettings(settings: NavigationSettings): NavigationSettings {
  return {
    mainNavItems: settings.mainNavItems.map((item) => ({
      ...item,
      children: item.children?.map((child) => ({ ...child })) || [],
    })),
    updatedAt: settings.updatedAt || "",
    updatedBy: settings.updatedBy || "",
  }
}

function createEmptyChild(): NavigationChildItem {
  return {
    label: "",
    href: "/",
  }
}

function createEmptyItem(): NavigationItem {
  return {
    label: "",
    href: "/",
    description: "",
    children: [],
  }
}

export function NavigationSettingsManager() {
  const [settings, setSettings] = useState<NavigationSettings>(() => cloneSettings(defaultSettings))
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    void loadSettings()
  }, [])

  const totalLinks = useMemo(() => {
    return settings.mainNavItems.reduce((acc, item) => acc + 1 + (item.children?.length || 0), 0)
  }, [settings.mainNavItems])

  async function loadSettings() {
    setIsLoading(true)
    setError(null)

    try {
      const response = await adminFetch("/api/admin/navigation-settings", {
        method: "GET",
        cache: "no-store",
      })
      const payload = (await response.json()) as ApiResponse<NavigationSettings>

      if (!response.ok || !payload.ok || !payload.data) {
        throw new Error(payload.error || "Unable to load navigation settings.")
      }

      setSettings(cloneSettings(payload.data))
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load navigation settings.")
    } finally {
      setIsLoading(false)
    }
  }

  function updateItem(index: number, field: keyof NavigationItem, value: string) {
    setSettings((current) => {
      const next = cloneSettings(current)
      const item = next.mainNavItems[index]
      if (!item) {
        return current
      }

      next.mainNavItems[index] = {
        ...item,
        [field]: value,
      }
      return next
    })
  }

  function addItem() {
    setSettings((current) => {
      const next = cloneSettings(current)
      next.mainNavItems.push(createEmptyItem())
      return next
    })
  }

  function removeItem(index: number) {
    if (!window.confirm("Are you sure you want to remove this top navigation item?")) {
      return
    }

    setSettings((current) => {
      const next = cloneSettings(current)
      next.mainNavItems.splice(index, 1)
      return next
    })
  }

  function addChild(itemIndex: number) {
    setSettings((current) => {
      const next = cloneSettings(current)
      const item = next.mainNavItems[itemIndex]
      if (!item) {
        return current
      }
      item.children = [...(item.children || []), createEmptyChild()]
      return next
    })
  }

  function updateChild(itemIndex: number, childIndex: number, field: keyof NavigationChildItem, value: string) {
    setSettings((current) => {
      const next = cloneSettings(current)
      const item = next.mainNavItems[itemIndex]
      const children = item?.children || []
      const child = children[childIndex]
      if (!item || !child) {
        return current
      }

      children[childIndex] = {
        ...child,
        [field]: value,
      }
      item.children = children
      return next
    })
  }

  function removeChild(itemIndex: number, childIndex: number) {
    if (!window.confirm("Are you sure you want to remove this child navigation link?")) {
      return
    }

    setSettings((current) => {
      const next = cloneSettings(current)
      const item = next.mainNavItems[itemIndex]
      if (!item?.children) {
        return current
      }

      item.children.splice(childIndex, 1)
      return next
    })
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!window.confirm("Are you sure you want to publish navigation updates?")) {
      return
    }

    setIsSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await adminFetch("/api/admin/navigation-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mainNavItems: settings.mainNavItems,
        }),
      })
      const payload = (await response.json()) as ApiResponse<NavigationSettings>

      if (!response.ok || !payload.ok || !payload.data) {
        throw new Error(payload.error || "Unable to save navigation settings.")
      }

      setSettings(cloneSettings(payload.data))
      setSuccess("Navigation settings updated.")
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save navigation settings.")
    } finally {
      setIsSaving(false)
    }
  }

  function handleLoadDefaults() {
    if (!window.confirm("Are you sure you want to load default navigation values? Save is required to publish.")) {
      return
    }

    setSettings(cloneSettings(defaultSettings))
    setSuccess("Default navigation values loaded into the form. Click Save to publish.")
    setError(null)
  }

  return (
    <section className="space-y-6">
      <form className="space-y-6" onSubmit={handleSave}>
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-xl font-semibold text-card-foreground">Main Navigation</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Edit top-level navbar links and dropdown child links. Internal links should start with <code>/</code>.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={handleLoadDefaults} disabled={isSaving}>
                Load Defaults
              </Button>
              <Button type="button" variant="secondary" size="sm" onClick={addItem} disabled={isSaving}>
                <Plus className="h-4 w-4" />
                Add Top Item
              </Button>
            </div>
          </div>

          <div className="mt-4 rounded-md border border-border bg-secondary/40 px-3 py-2 text-xs text-muted-foreground">
            Total links currently configured: <span className="font-semibold text-foreground">{totalLinks}</span>
          </div>

          <div className="mt-5 space-y-4">
            {settings.mainNavItems.map((item, itemIndex) => (
              <article key={`item-${itemIndex}`} className="rounded-lg border border-border bg-background p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-card-foreground">Top Item {itemIndex + 1}</p>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeItem(itemIndex)}
                    disabled={settings.mainNavItems.length <= 1 || isSaving}
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove
                  </Button>
                </div>

                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <label className="text-sm">
                    <span className="font-medium text-card-foreground">Label</span>
                    <input
                      required
                      maxLength={70}
                      value={item.label}
                      onChange={(event) => updateItem(itemIndex, "label", event.target.value)}
                      className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="text-sm">
                    <span className="font-medium text-card-foreground">Link</span>
                    <input
                      required
                      value={item.href}
                      onChange={(event) => updateItem(itemIndex, "href", event.target.value)}
                      className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                  </label>
                </div>

                <label className="mt-3 block text-sm">
                  <span className="font-medium text-card-foreground">Dropdown Description (optional)</span>
                  <textarea
                    rows={2}
                    maxLength={180}
                    value={item.description || ""}
                    onChange={(event) => updateItem(itemIndex, "description", event.target.value)}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </label>

                <div className="mt-4 rounded-md border border-border bg-secondary/30 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Child Links ({item.children?.length || 0})
                    </p>
                    <Button type="button" variant="outline" size="sm" onClick={() => addChild(itemIndex)} disabled={isSaving}>
                      <Plus className="h-4 w-4" />
                      Add Child
                    </Button>
                  </div>

                  {item.children && item.children.length > 0 ? (
                    <div className="mt-3 space-y-2">
                      {item.children.map((child, childIndex) => (
                        <div key={`child-${itemIndex}-${childIndex}`} className="rounded-md border border-border bg-background p-3">
                          <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto] md:items-end">
                            <label className="text-sm">
                              <span className="font-medium text-card-foreground">Child Label</span>
                              <input
                                required
                                maxLength={70}
                                value={child.label}
                                onChange={(event) => updateChild(itemIndex, childIndex, "label", event.target.value)}
                                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                              />
                            </label>
                            <label className="text-sm">
                              <span className="font-medium text-card-foreground">Child Link</span>
                              <input
                                required
                                value={child.href}
                                onChange={(event) => updateChild(itemIndex, childIndex, "href", event.target.value)}
                                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                              />
                            </label>
                            <Button type="button" variant="destructive" size="sm" onClick={() => removeChild(itemIndex, childIndex)}>
                              <Trash2 className="h-4 w-4" />
                              Remove
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-muted-foreground">No child links. Add child links for dropdown behavior.</p>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button type="submit" disabled={isLoading || isSaving}>
            {isSaving ? "Saving..." : "Save Navigation Settings"}
          </Button>
          <Button type="button" variant="outline" disabled={isLoading || isSaving} onClick={() => void loadSettings()}>
            {isLoading ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
      </form>

      {error ? <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p> : null}
      {success ? <p className="rounded-md border border-emerald-300/40 bg-emerald-100/30 px-3 py-2 text-sm text-emerald-700">{success}</p> : null}

      {settings.updatedAt ? (
        <p className="text-xs text-muted-foreground">
          Last updated {new Date(settings.updatedAt).toLocaleString("en-GB")}
          {settings.updatedBy ? ` by ${settings.updatedBy}` : ""}.
        </p>
      ) : null}
    </section>
  )
}
