import "server-only"

import { z } from "zod"
import { mainNavItems } from "@/lib/data"
import { getAdminDb } from "@/lib/firebase/admin"
import type { NavigationItem, NavigationSettings } from "@/lib/types"

const SITE_SETTINGS_COLLECTION = "siteSettings"
const NAVIGATION_SETTINGS_DOC_ID = "navigation"

const hrefPattern = /^https?:\/\/.+/i

const defaultDescriptions: Record<string, string> = {
  "About Kibaha Scouts": "Institutional profile, leadership, history, and district governance.",
  Programmes: "Age-based sections, badge progression, and training pathways.",
  "Scout Units": "Directory of packs, troops, and crews across Kibaha wards.",
  Newsroom: "Official updates, press resources, and district announcements.",
  Events: "Calendar and registration for district-level activities and trainings.",
  Resources: "Downloadable forms, handbooks, policies, and annual reports.",
  "Join / Volunteer": "Start as youth, become a leader, or support district programmes.",
}

function withDescription(item: NavigationItem): NavigationItem {
  return {
    ...item,
    description: item.description || defaultDescriptions[item.label] || "",
    children: item.children?.map((child) => ({ ...child })) || undefined,
  }
}

const defaultMainNavItems = mainNavItems.map((item) => withDescription(item)) as NavigationItem[]

const navigationChildSchema = z.object({
  label: z.string().trim().min(1, "Child label is required.").max(70, "Child label must be at most 70 characters."),
  href: z
    .string()
    .trim()
    .min(1, "Child link is required.")
    .refine((value) => value.startsWith("/") || hrefPattern.test(value), {
      message: "Child link must start with '/' or be a valid http(s) URL.",
    }),
})

const navigationItemSchema = z.object({
  label: z.string().trim().min(1, "Item label is required.").max(70, "Item label must be at most 70 characters."),
  href: z
    .string()
    .trim()
    .min(1, "Item link is required.")
    .refine((value) => value.startsWith("/") || hrefPattern.test(value), {
      message: "Item link must start with '/' or be a valid http(s) URL.",
    }),
  description: z.string().trim().max(180, "Description must be at most 180 characters.").optional().default(""),
  children: z.array(navigationChildSchema).max(20, "Each item can have at most 20 child links.").optional().default([]),
})

export const navigationSettingsInputSchema = z.object({
  mainNavItems: z.array(navigationItemSchema).min(1, "At least one navigation item is required.").max(20, "At most 20 navigation items are allowed."),
})

const navigationSettingsDocSchema = navigationSettingsInputSchema.extend({
  updatedAt: z.string().optional(),
  updatedBy: z.string().optional(),
})

function cloneDefaults(): NavigationSettings {
  return {
    mainNavItems: defaultMainNavItems.map((item) => ({
      ...item,
      children: item.children?.map((child) => ({ ...child })) || [],
    })),
    updatedAt: "",
    updatedBy: "",
  }
}

export function getDefaultNavigationSettings() {
  return cloneDefaults()
}

async function getNavigationSettingsDocRef() {
  return getAdminDb().collection(SITE_SETTINGS_COLLECTION).doc(NAVIGATION_SETTINGS_DOC_ID)
}

function normalizeItems(items: NavigationItem[]) {
  return items.map((item) => ({
    label: item.label,
    href: item.href,
    description: item.description || "",
    children: item.children?.map((child) => ({ ...child })) || [],
  }))
}

export async function getNavigationSettingsFromFirestore(): Promise<NavigationSettings> {
  const docRef = await getNavigationSettingsDocRef()
  const doc = await docRef.get()

  if (!doc.exists) {
    return cloneDefaults()
  }

  const parsed = navigationSettingsDocSchema.safeParse(doc.data() || {})
  if (!parsed.success) {
    console.warn("Invalid navigation settings document. Falling back to defaults.")
    return cloneDefaults()
  }

  return {
    mainNavItems: normalizeItems(parsed.data.mainNavItems),
    updatedAt: parsed.data.updatedAt || "",
    updatedBy: parsed.data.updatedBy || "",
  }
}

export async function upsertNavigationSettingsInFirestore(
  settings: z.infer<typeof navigationSettingsInputSchema>,
  actorEmail: string,
) {
  const parsedSettings = navigationSettingsInputSchema.parse(settings)
  const now = new Date().toISOString()
  const normalizedActorEmail = actorEmail.trim().toLowerCase()

  const payload = {
    mainNavItems: normalizeItems(parsedSettings.mainNavItems),
    updatedAt: now,
    updatedBy: normalizedActorEmail,
  }

  const docRef = await getNavigationSettingsDocRef()
  await docRef.set(payload, { merge: true })

  return {
    ...payload,
  } satisfies NavigationSettings
}
