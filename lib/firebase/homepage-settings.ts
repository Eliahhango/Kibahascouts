import "server-only"

import { z } from "zod"
import { getAdminDb } from "@/lib/firebase/admin"
import type { HomepageSettings } from "@/lib/types"

const SITE_SETTINGS_COLLECTION = "siteSettings"
const HOMEPAGE_SETTINGS_DOC_ID = "homepage"

const hrefPattern = /^https?:\/\/.+/i

export const DEFAULT_DISTRICT_SNAPSHOT = [
  { label: "Active Units", value: "Coming soon" },
  { label: "Youth Members", value: "Coming soon" },
  { label: "Adult Volunteers", value: "Coming soon" },
  { label: "Service Hours", value: "Coming soon" },
] as const

export const DEFAULT_PRIORITY_INITIATIVES = [
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
] as const

export const DEFAULT_CAMPAIGNS = [
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
] as const

const districtSnapshotItemSchema = z.object({
  label: z.string().trim().min(1, "Snapshot label is required.").max(40, "Snapshot label must be at most 40 characters."),
  value: z.string().trim().min(1, "Snapshot value is required.").max(80, "Snapshot value must be at most 80 characters."),
})

const priorityInitiativeSchema = z.object({
  title: z.string().trim().min(3, "Initiative title is required.").max(80, "Initiative title must be at most 80 characters."),
  description: z
    .string()
    .trim()
    .min(10, "Initiative description is required.")
    .max(220, "Initiative description must be at most 220 characters."),
  href: z
    .string()
    .trim()
    .min(1, "Initiative link is required.")
    .refine((value) => value.startsWith("/") || hrefPattern.test(value), {
      message: "Initiative link must start with '/' or be a valid http(s) URL.",
    }),
})

const campaignSchema = z.object({
  id: z.string().trim().min(1, "Campaign id is required.").max(40, "Campaign id must be at most 40 characters."),
  title: z.string().trim().min(3, "Campaign title is required.").max(100, "Campaign title must be at most 100 characters."),
  description: z
    .string()
    .trim()
    .min(10, "Campaign description is required.")
    .max(240, "Campaign description must be at most 240 characters."),
  image: z.string().trim().min(1, "Campaign image is required.").max(500, "Campaign image must be at most 500 characters."),
  status: z.enum(["Active", "Upcoming", "Completed"]),
  link: z
    .string()
    .trim()
    .min(1, "Campaign link is required.")
    .refine((value) => value.startsWith("/") || hrefPattern.test(value), {
      message: "Campaign link must start with '/' or be a valid http(s) URL.",
    }),
})

export const homepageSettingsInputSchema = z.object({
  districtSnapshot: z
    .array(districtSnapshotItemSchema)
    .length(DEFAULT_DISTRICT_SNAPSHOT.length, `District Snapshot must contain exactly ${DEFAULT_DISTRICT_SNAPSHOT.length} items.`),
  priorityInitiatives: z
    .array(priorityInitiativeSchema)
    .length(DEFAULT_PRIORITY_INITIATIVES.length, `Priority Initiatives must contain exactly ${DEFAULT_PRIORITY_INITIATIVES.length} items.`),
  campaigns: z.array(campaignSchema).length(DEFAULT_CAMPAIGNS.length, `Campaigns must contain exactly ${DEFAULT_CAMPAIGNS.length} items.`),
})

const homepageSettingsDocSchema = z.object({
  districtSnapshot: z.array(districtSnapshotItemSchema).optional(),
  priorityInitiatives: z.array(priorityInitiativeSchema).optional(),
  campaigns: z.array(campaignSchema).optional(),
  updatedAt: z.string().optional(),
  updatedBy: z.string().optional(),
})

function cloneDefaults(): HomepageSettings {
  return {
    districtSnapshot: DEFAULT_DISTRICT_SNAPSHOT.map((item) => ({ ...item })),
    priorityInitiatives: DEFAULT_PRIORITY_INITIATIVES.map((item) => ({ ...item })),
    campaigns: DEFAULT_CAMPAIGNS.map((item) => ({ ...item })),
    updatedAt: "",
    updatedBy: "",
  }
}

export function getDefaultHomepageSettings() {
  return cloneDefaults()
}

async function getHomepageSettingsDocRef() {
  return getAdminDb().collection(SITE_SETTINGS_COLLECTION).doc(HOMEPAGE_SETTINGS_DOC_ID)
}

export async function getHomepageSettingsFromFirestore(): Promise<HomepageSettings> {
  try {
    const docRef = await getHomepageSettingsDocRef()
    const doc = await docRef.get()

    if (!doc.exists) {
      return cloneDefaults()
    }

    const parsed = homepageSettingsDocSchema.safeParse(doc.data() || {})
    if (!parsed.success) {
      console.warn("Invalid homepage settings document. Falling back to defaults.")
      return cloneDefaults()
    }

    const districtSnapshot =
      parsed.data.districtSnapshot && parsed.data.districtSnapshot.length === DEFAULT_DISTRICT_SNAPSHOT.length
        ? parsed.data.districtSnapshot.map((item) => ({ ...item }))
        : DEFAULT_DISTRICT_SNAPSHOT.map((item) => ({ ...item }))

    const priorityInitiatives =
      parsed.data.priorityInitiatives && parsed.data.priorityInitiatives.length === DEFAULT_PRIORITY_INITIATIVES.length
        ? parsed.data.priorityInitiatives.map((item) => ({ ...item }))
        : DEFAULT_PRIORITY_INITIATIVES.map((item) => ({ ...item }))

    const campaigns =
      parsed.data.campaigns && parsed.data.campaigns.length === DEFAULT_CAMPAIGNS.length
        ? parsed.data.campaigns.map((item) => ({ ...item }))
        : DEFAULT_CAMPAIGNS.map((item) => ({ ...item }))

    return {
      districtSnapshot,
      priorityInitiatives,
      campaigns,
      updatedAt: parsed.data.updatedAt || "",
      updatedBy: parsed.data.updatedBy || "",
    }
  } catch (error) {
    console.error("[homepage-settings] Failed to read from Firestore:", error)
    return cloneDefaults()
  }
}

export async function upsertHomepageSettingsInFirestore(
  settings: z.infer<typeof homepageSettingsInputSchema>,
  actorEmail: string,
) {
  const parsedSettings = homepageSettingsInputSchema.parse(settings)
  const now = new Date().toISOString()
  const normalizedActorEmail = actorEmail.trim().toLowerCase()

  const payload = {
    districtSnapshot: parsedSettings.districtSnapshot.map((item) => ({ ...item })),
    priorityInitiatives: parsedSettings.priorityInitiatives.map((item) => ({ ...item })),
    campaigns: parsedSettings.campaigns.map((item) => ({ ...item })),
    updatedAt: now,
    updatedBy: normalizedActorEmail,
  }

  const docRef = await getHomepageSettingsDocRef()
  await docRef.set(payload, { merge: true })

  return {
    ...payload,
  } satisfies HomepageSettings
}

