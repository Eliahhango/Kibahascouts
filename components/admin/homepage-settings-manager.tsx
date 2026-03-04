"use client"

import { FormEvent, useEffect, useState } from "react"
import { adminFetch } from "@/lib/auth/admin-fetch"
import { Button } from "@/components/ui/button"

type DistrictSnapshotItem = {
  label: string
  value: string
}

type PriorityInitiative = {
  title: string
  description: string
  href: string
}

type CampaignItem = {
  id: string
  title: string
  description: string
  image: string
  status: "Active" | "Upcoming" | "Completed"
  link: string
}

type HomepageSettings = {
  districtSnapshot: DistrictSnapshotItem[]
  priorityInitiatives: PriorityInitiative[]
  campaigns: CampaignItem[]
  updatedAt?: string
  updatedBy?: string
}

type ApiResponse<T> = {
  ok: boolean
  data?: T
  error?: string
}

const defaultSettings: HomepageSettings = {
  districtSnapshot: [
    { label: "Active Units", value: "Coming soon" },
    { label: "Youth Members", value: "Coming soon" },
    { label: "Adult Volunteers", value: "Coming soon" },
    { label: "Service Hours", value: "Coming soon" },
  ],
  priorityInitiatives: [
    {
      title: "Membership Readiness Plan",
      description: "District membership priorities and targets are pending confirmation.",
      href: "/join",
    },
    {
      title: "Community Service Reporting",
      description: "Service indicators will be published after district verification.",
      href: "/newsroom?category=Community+Service",
    },
    {
      title: "Leader Training Schedule",
      description: "Upcoming leader development sessions will be posted in the events calendar.",
      href: "/events/leader-training-weekend",
    },
    {
      title: "Infrastructure Updates",
      description: "District facility development updates will be published once confirmed.",
      href: "/newsroom/new-scout-hall-construction-begins",
    },
  ],
  campaigns: [
    {
      id: "c1",
      title: "District Environmental Campaign",
      description: "Verified campaign scope and targets pending confirmation.",
      image: "/images/campaigns/trees.jpg",
      status: "Active",
      link: "/newsroom/district-programme-update",
    },
    {
      id: "c2",
      title: "Community Health Campaign",
      description: "Verified campaign implementation details pending confirmation.",
      image: "/images/campaigns/hygiene.jpg",
      status: "Active",
      link: "/newsroom/community-service-planning",
    },
    {
      id: "c3",
      title: "Membership Awareness Campaign",
      description: "Verified campaign plan pending confirmation.",
      image: "/images/campaigns/membership.jpg",
      status: "Upcoming",
      link: "/join",
    },
  ],
  updatedAt: "",
  updatedBy: "",
}

function cloneSettings(settings: HomepageSettings): HomepageSettings {
  return {
    districtSnapshot: settings.districtSnapshot.map((item) => ({ ...item })),
    priorityInitiatives: settings.priorityInitiatives.map((item) => ({ ...item })),
    campaigns: settings.campaigns.map((item) => ({ ...item })),
    updatedAt: settings.updatedAt || "",
    updatedBy: settings.updatedBy || "",
  }
}

export function HomepageSettingsManager() {
  const [settings, setSettings] = useState<HomepageSettings>(() => cloneSettings(defaultSettings))
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    void loadSettings()
  }, [])

  async function loadSettings() {
    setIsLoading(true)
    setError(null)

    try {
      const response = await adminFetch("/api/admin/homepage-settings", {
        method: "GET",
        cache: "no-store",
      })
      const payload = (await response.json()) as ApiResponse<HomepageSettings>

      if (!response.ok || !payload.ok || !payload.data) {
        throw new Error(payload.error || "Unable to load homepage settings.")
      }

      setSettings(cloneSettings(payload.data))
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load homepage settings.")
    } finally {
      setIsLoading(false)
    }
  }

  function updateSnapshotItem(index: number, key: keyof DistrictSnapshotItem, value: string) {
    setSettings((current) => {
      const next = cloneSettings(current)
      next.districtSnapshot[index] = {
        ...next.districtSnapshot[index],
        [key]: value,
      }
      return next
    })
  }

  function updatePriorityItem(index: number, key: keyof PriorityInitiative, value: string) {
    setSettings((current) => {
      const next = cloneSettings(current)
      next.priorityInitiatives[index] = {
        ...next.priorityInitiatives[index],
        [key]: value,
      }
      return next
    })
  }

  function updateCampaignItem(index: number, key: keyof CampaignItem, value: string) {
    setSettings((current) => {
      const next = cloneSettings(current)
      next.campaigns[index] = {
        ...next.campaigns[index],
        [key]: key === "status" ? (value as CampaignItem["status"]) : value,
      }
      return next
    })
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!window.confirm("Are you sure you want to update homepage snapshot, initiatives, and campaign cards?")) {
      return
    }

    setIsSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await adminFetch("/api/admin/homepage-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          districtSnapshot: settings.districtSnapshot,
          priorityInitiatives: settings.priorityInitiatives,
          campaigns: settings.campaigns,
        }),
      })
      const payload = (await response.json()) as ApiResponse<HomepageSettings>

      if (!response.ok || !payload.ok || !payload.data) {
        throw new Error(payload.error || "Unable to save homepage settings.")
      }

      setSettings(cloneSettings(payload.data))
      setSuccess("Homepage settings updated.")
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save homepage settings.")
    } finally {
      setIsSaving(false)
    }
  }

  function handleResetDefaults() {
    if (!window.confirm("Are you sure you want to load default values into the form? Save is required to publish them.")) {
      return
    }

    setSettings(cloneSettings(defaultSettings))
    setSuccess("Default values loaded into the form. Click Save to publish.")
    setError(null)
  }

  return (
    <section className="space-y-6">
      <form className="space-y-6" onSubmit={handleSave}>
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-xl font-semibold text-card-foreground">District Snapshot</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                These values appear in the homepage hero card.
              </p>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={handleResetDefaults} disabled={isSaving}>
              Load Defaults
            </Button>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {settings.districtSnapshot.map((item, index) => (
              <div key={`snapshot-${index}`} className="rounded-lg border border-border bg-secondary/40 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Snapshot Card {index + 1}</p>
                <label className="mt-3 block text-sm">
                  <span className="font-medium text-card-foreground">Label</span>
                  <input
                    required
                    maxLength={40}
                    value={item.label}
                    onChange={(event) => updateSnapshotItem(index, "label", event.target.value)}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </label>
                <label className="mt-3 block text-sm">
                  <span className="font-medium text-card-foreground">Value</span>
                  <input
                    required
                    maxLength={80}
                    value={item.value}
                    onChange={(event) => updateSnapshotItem(index, "value", event.target.value)}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-card-foreground">Priority Initiatives</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage homepage initiative cards. Internal links should start with <code>/</code>.
          </p>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {settings.priorityInitiatives.map((item, index) => (
              <div key={`initiative-${index}`} className="rounded-lg border border-border bg-secondary/40 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Initiative {index + 1}</p>
                <label className="mt-3 block text-sm">
                  <span className="font-medium text-card-foreground">Title</span>
                  <input
                    required
                    maxLength={80}
                    value={item.title}
                    onChange={(event) => updatePriorityItem(index, "title", event.target.value)}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </label>
                <label className="mt-3 block text-sm">
                  <span className="font-medium text-card-foreground">Description</span>
                  <textarea
                    required
                    rows={3}
                    maxLength={220}
                    value={item.description}
                    onChange={(event) => updatePriorityItem(index, "description", event.target.value)}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </label>
                <label className="mt-3 block text-sm">
                  <span className="font-medium text-card-foreground">Link</span>
                  <input
                    required
                    value={item.href}
                    onChange={(event) => updatePriorityItem(index, "href", event.target.value)}
                    placeholder="/newsroom"
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-card-foreground">Homepage Campaigns</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            These cards are displayed in the public campaigns section on the homepage.
          </p>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {settings.campaigns.map((item, index) => (
              <div key={`campaign-${item.id}-${index}`} className="rounded-lg border border-border bg-secondary/40 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Campaign {index + 1}</p>
                <label className="mt-3 block text-sm">
                  <span className="font-medium text-card-foreground">ID</span>
                  <input
                    required
                    maxLength={40}
                    value={item.id}
                    onChange={(event) => updateCampaignItem(index, "id", event.target.value)}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </label>
                <label className="mt-3 block text-sm">
                  <span className="font-medium text-card-foreground">Title</span>
                  <input
                    required
                    maxLength={100}
                    value={item.title}
                    onChange={(event) => updateCampaignItem(index, "title", event.target.value)}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </label>
                <label className="mt-3 block text-sm">
                  <span className="font-medium text-card-foreground">Description</span>
                  <textarea
                    required
                    rows={3}
                    maxLength={240}
                    value={item.description}
                    onChange={(event) => updateCampaignItem(index, "description", event.target.value)}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </label>
                <label className="mt-3 block text-sm">
                  <span className="font-medium text-card-foreground">Image URL or local path</span>
                  <input
                    required
                    maxLength={500}
                    value={item.image}
                    onChange={(event) => updateCampaignItem(index, "image", event.target.value)}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </label>
                <label className="mt-3 block text-sm">
                  <span className="font-medium text-card-foreground">Status</span>
                  <select
                    value={item.status}
                    onChange={(event) => updateCampaignItem(index, "status", event.target.value)}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="Active">Active</option>
                    <option value="Upcoming">Upcoming</option>
                    <option value="Completed">Completed</option>
                  </select>
                </label>
                <label className="mt-3 block text-sm">
                  <span className="font-medium text-card-foreground">Link</span>
                  <input
                    required
                    value={item.link}
                    onChange={(event) => updateCampaignItem(index, "link", event.target.value)}
                    placeholder="/newsroom"
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button type="submit" disabled={isLoading || isSaving}>
            {isSaving ? "Saving..." : "Save Homepage Settings"}
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
