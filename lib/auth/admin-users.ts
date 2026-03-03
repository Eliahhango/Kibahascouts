import "server-only"

import { z } from "zod"
import { serverEnv } from "@/lib/env/server"

export const ADMIN_ROLE_VALUES = ["super_admin", "content_admin", "viewer"] as const
export type AdminRole = (typeof ADMIN_ROLE_VALUES)[number]

export const ADMIN_PERMISSION_VALUES = [
  "dashboard:view",
  "content:read",
  "content:write",
  "messages:read",
  "messages:write",
  "admins:manage",
] as const
export type AdminPermission = (typeof ADMIN_PERMISSION_VALUES)[number]

export type AdminUserRecord = {
  email: string
  role: AdminRole
  active: boolean
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy: string
  lastLoginAt?: string
  lastLoginIp?: string
}

const ADMIN_USERS_COLLECTION = "adminUsers"
const SYSTEM_ACTOR = "system"

const adminUserSchema = z.object({
  email: z.string().email(),
  emailLower: z.string().email(),
  role: z.enum(ADMIN_ROLE_VALUES),
  active: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
  createdBy: z.string().default(SYSTEM_ACTOR),
  updatedBy: z.string().default(SYSTEM_ACTOR),
  lastLoginAt: z.string().optional(),
  lastLoginIp: z.string().optional(),
})

const rolePermissions: Record<AdminRole, readonly AdminPermission[]> = {
  super_admin: ["dashboard:view", "content:read", "content:write", "messages:read", "messages:write", "admins:manage"],
  content_admin: ["dashboard:view", "content:read", "content:write", "messages:read", "messages:write"],
  viewer: ["dashboard:view", "content:read", "messages:read"],
}

let bootstrapPromise: Promise<void> | null = null

function parseBootstrapEmails(rawValue: string) {
  return rawValue
    .split(",")
    .map((value) => normalizeAdminEmail(value))
    .filter((value): value is string => Boolean(value))
}

function normalizeAdminRecord(data: z.infer<typeof adminUserSchema>): AdminUserRecord {
  return {
    email: data.emailLower,
    role: data.role,
    active: data.active,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    createdBy: data.createdBy,
    updatedBy: data.updatedBy,
    lastLoginAt: data.lastLoginAt,
    lastLoginIp: data.lastLoginIp,
  }
}

async function getAdminUsersCollection() {
  const { getAdminDb } = await import("@/lib/firebase/admin")
  return getAdminDb().collection(ADMIN_USERS_COLLECTION)
}

export function normalizeAdminEmail(email: string | null | undefined) {
  if (!email) {
    return null
  }

  const normalized = email.trim().toLowerCase()
  return normalized || null
}

export function getRolePermissions(role: AdminRole) {
  return rolePermissions[role]
}

export function hasAdminPermission(role: AdminRole, permission: AdminPermission) {
  return rolePermissions[role].includes(permission)
}

export async function ensureBootstrapAdminUsers() {
  if (!bootstrapPromise) {
    bootstrapPromise = (async () => {
      const bootstrapEmails = parseBootstrapEmails(serverEnv.ADMIN_EMAILS)
      if (bootstrapEmails.length === 0) {
        return
      }

      const collection = await getAdminUsersCollection()
      const existing = await collection.limit(1).get()
      if (!existing.empty) {
        return
      }

      const now = new Date().toISOString()
      const writer = collection.firestore.batch()

      for (const email of bootstrapEmails) {
        const docRef = collection.doc(email)
        writer.set(docRef, {
          email,
          emailLower: email,
          role: "super_admin",
          active: true,
          createdAt: now,
          updatedAt: now,
          createdBy: SYSTEM_ACTOR,
          updatedBy: SYSTEM_ACTOR,
        })
      }

      await writer.commit()
      console.warn("Bootstrapped admin users from ADMIN_EMAILS because adminUsers collection was empty.")
    })().catch((error) => {
      bootstrapPromise = null
      throw error
    })
  }

  await bootstrapPromise
}

export async function getAdminUserByEmail(email: string | null | undefined): Promise<AdminUserRecord | null> {
  const normalized = normalizeAdminEmail(email)
  if (!normalized) {
    return null
  }

  await ensureBootstrapAdminUsers()
  const collection = await getAdminUsersCollection()
  const doc = await collection.doc(normalized).get()
  if (!doc.exists) {
    return null
  }

  const parsed = adminUserSchema.safeParse(doc.data())
  if (!parsed.success) {
    console.error("Invalid admin user record", parsed.error.flatten())
    return null
  }

  return normalizeAdminRecord(parsed.data)
}

export async function listAdminUsers(): Promise<AdminUserRecord[]> {
  await ensureBootstrapAdminUsers()
  const collection = await getAdminUsersCollection()
  const snapshot = await collection.get()

  return snapshot.docs
    .map((doc) => {
      const parsed = adminUserSchema.safeParse(doc.data())
      if (!parsed.success) {
        return null
      }
      return normalizeAdminRecord(parsed.data)
    })
    .filter((value): value is AdminUserRecord => Boolean(value))
    .sort((a, b) => a.email.localeCompare(b.email))
}

export async function upsertAdminUser(params: {
  email: string
  role: AdminRole
  active?: boolean
  actorEmail: string
}) {
  const normalizedEmail = normalizeAdminEmail(params.email)
  if (!normalizedEmail) {
    throw new Error("Invalid admin email.")
  }

  const collection = await getAdminUsersCollection()
  const now = new Date().toISOString()
  const docRef = collection.doc(normalizedEmail)
  const current = await docRef.get()

  if (!current.exists) {
    await docRef.set({
      email: normalizedEmail,
      emailLower: normalizedEmail,
      role: params.role,
      active: params.active ?? true,
      createdAt: now,
      updatedAt: now,
      createdBy: params.actorEmail,
      updatedBy: params.actorEmail,
    })
    return
  }

  await docRef.update({
    role: params.role,
    active: params.active ?? true,
    updatedAt: now,
    updatedBy: params.actorEmail,
  })
}

export async function updateAdminUser(
  email: string,
  updates: Partial<Pick<AdminUserRecord, "role" | "active">>,
  actorEmail: string,
) {
  const normalizedEmail = normalizeAdminEmail(email)
  if (!normalizedEmail) {
    throw new Error("Invalid admin email.")
  }

  const collection = await getAdminUsersCollection()
  const docRef = collection.doc(normalizedEmail)
  const existing = await docRef.get()
  if (!existing.exists) {
    throw new Error("Admin user not found.")
  }

  await docRef.update({
    ...(updates.role ? { role: updates.role } : {}),
    ...(typeof updates.active === "boolean" ? { active: updates.active } : {}),
    updatedAt: new Date().toISOString(),
    updatedBy: actorEmail,
  })
}

export async function deleteAdminUser(email: string) {
  const normalizedEmail = normalizeAdminEmail(email)
  if (!normalizedEmail) {
    throw new Error("Invalid admin email.")
  }

  const collection = await getAdminUsersCollection()
  await collection.doc(normalizedEmail).delete()
}

export async function getSuperAdminCount() {
  const users = await listAdminUsers()
  return users.filter((user) => user.role === "super_admin" && user.active).length
}

export async function markAdminLogin(email: string, ip: string) {
  const normalizedEmail = normalizeAdminEmail(email)
  if (!normalizedEmail) {
    return
  }

  const collection = await getAdminUsersCollection()
  const docRef = collection.doc(normalizedEmail)
  const existing = await docRef.get()
  if (!existing.exists) {
    return
  }

  await docRef.update({
    lastLoginAt: new Date().toISOString(),
    lastLoginIp: ip,
    updatedAt: new Date().toISOString(),
  })
}
