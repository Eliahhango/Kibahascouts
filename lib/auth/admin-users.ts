import "server-only"

import { z } from "zod"
import { serverEnv } from "@/lib/env/server"

export const ADMIN_ROLE_VALUES = ["super_admin", "content_admin", "viewer"] as const
export type AdminRole = (typeof ADMIN_ROLE_VALUES)[number]

export const ADMIN_ONBOARDING_STATUS_VALUES = ["invited", "pending", "approved", "revoked", "deleted"] as const
export type AdminOnboardingStatus = (typeof ADMIN_ONBOARDING_STATUS_VALUES)[number]

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
  onboardingStatus: AdminOnboardingStatus
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy: string
  uid?: string
  inviteId?: string
  invitedAt?: string
  inviteAcceptedAt?: string
  approvedAt?: string
  approvedBy?: string
  revokedAt?: string
  deletedAt?: string
  lastLoginAt?: string
  lastLoginIp?: string
}

export type AdminUserMutableUpdates = Partial<
  Pick<
    AdminUserRecord,
    | "role"
    | "active"
    | "onboardingStatus"
    | "uid"
    | "inviteId"
    | "invitedAt"
    | "inviteAcceptedAt"
    | "approvedAt"
    | "approvedBy"
    | "revokedAt"
    | "deletedAt"
  >
>

const ADMIN_USERS_COLLECTION = "adminUsers"
const ADMIN_USERS_ARCHIVE_COLLECTION = "adminUsersArchive"
const SYSTEM_ACTOR = "system"

const adminUserSchema = z.object({
  email: z.string().email(),
  emailLower: z.string().email(),
  role: z.enum(ADMIN_ROLE_VALUES),
  active: z.boolean(),
  onboardingStatus: z.enum(ADMIN_ONBOARDING_STATUS_VALUES).optional().default("approved"),
  createdAt: z.string(),
  updatedAt: z.string(),
  createdBy: z.string().default(SYSTEM_ACTOR),
  updatedBy: z.string().default(SYSTEM_ACTOR),
  uid: z.string().optional(),
  inviteId: z.string().optional(),
  invitedAt: z.string().optional(),
  inviteAcceptedAt: z.string().optional(),
  approvedAt: z.string().optional(),
  approvedBy: z.string().optional(),
  revokedAt: z.string().optional(),
  deletedAt: z.string().optional(),
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
    onboardingStatus: data.onboardingStatus ?? "approved",
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    createdBy: data.createdBy,
    updatedBy: data.updatedBy,
    uid: data.uid,
    inviteId: data.inviteId,
    invitedAt: data.invitedAt,
    inviteAcceptedAt: data.inviteAcceptedAt,
    approvedAt: data.approvedAt,
    approvedBy: data.approvedBy,
    revokedAt: data.revokedAt,
    deletedAt: data.deletedAt,
    lastLoginAt: data.lastLoginAt,
    lastLoginIp: data.lastLoginIp,
  }
}

function nowIso() {
  return new Date().toISOString()
}

function resolveDefaultActive(onboardingStatus: AdminOnboardingStatus) {
  return onboardingStatus === "approved"
}

function mergeOnboardingDefaults(
  onboardingStatus: AdminOnboardingStatus,
  actorEmail: string,
  existing?: Pick<AdminUserRecord, "invitedAt" | "inviteAcceptedAt" | "approvedAt" | "approvedBy" | "revokedAt" | "deletedAt">,
) {
  const now = nowIso()
  const merged = {
    invitedAt: existing?.invitedAt,
    inviteAcceptedAt: existing?.inviteAcceptedAt,
    approvedAt: existing?.approvedAt,
    approvedBy: existing?.approvedBy,
    revokedAt: existing?.revokedAt,
    deletedAt: existing?.deletedAt,
  }

  if (onboardingStatus === "invited" && !merged.invitedAt) {
    merged.invitedAt = now
  }

  if (onboardingStatus === "pending" && !merged.inviteAcceptedAt) {
    merged.inviteAcceptedAt = now
  }

  if (onboardingStatus === "approved") {
    if (!merged.approvedAt) {
      merged.approvedAt = now
    }
    if (!merged.approvedBy) {
      merged.approvedBy = actorEmail
    }
  }

  if (onboardingStatus === "revoked" && !merged.revokedAt) {
    merged.revokedAt = now
  }

  if (onboardingStatus === "deleted" && !merged.deletedAt) {
    merged.deletedAt = now
  }

  return merged
}

async function getAdminUsersCollection() {
  const { getAdminDb } = await import("@/lib/firebase/admin")
  return getAdminDb().collection(ADMIN_USERS_COLLECTION)
}

async function getAdminUsersArchiveCollection() {
  const { getAdminDb } = await import("@/lib/firebase/admin")
  return getAdminDb().collection(ADMIN_USERS_ARCHIVE_COLLECTION)
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

export function isApprovedAdmin(user: Pick<AdminUserRecord, "active" | "onboardingStatus"> | null | undefined) {
  return Boolean(user?.active && user?.onboardingStatus === "approved")
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

      const now = nowIso()
      const writer = collection.firestore.batch()

      for (const email of bootstrapEmails) {
        const docRef = collection.doc(email)
        writer.set(docRef, {
          email,
          emailLower: email,
          role: "super_admin",
          active: true,
          onboardingStatus: "approved",
          createdAt: now,
          updatedAt: now,
          createdBy: SYSTEM_ACTOR,
          updatedBy: SYSTEM_ACTOR,
          approvedAt: now,
          approvedBy: SYSTEM_ACTOR,
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

export async function getAdminUserByUid(uid: string | null | undefined): Promise<AdminUserRecord | null> {
  if (!uid) {
    return null
  }

  await ensureBootstrapAdminUsers()
  const collection = await getAdminUsersCollection()
  const snapshot = await collection.where("uid", "==", uid).limit(2).get()
  if (snapshot.empty) {
    return null
  }

  const records = snapshot.docs
    .map((doc) => adminUserSchema.safeParse(doc.data()))
    .filter((result): result is { success: true; data: z.infer<typeof adminUserSchema> } => result.success)
    .map((result) => normalizeAdminRecord(result.data))
    .sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)))

  return records[0] || null
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
  onboardingStatus?: AdminOnboardingStatus
  uid?: string
  inviteId?: string
  invitedAt?: string
  inviteAcceptedAt?: string
  approvedAt?: string
  approvedBy?: string
  revokedAt?: string
  deletedAt?: string
  actorEmail: string
}) {
  const normalizedEmail = normalizeAdminEmail(params.email)
  if (!normalizedEmail) {
    throw new Error("Invalid admin email.")
  }

  const collection = await getAdminUsersCollection()
  const now = nowIso()
  const docRef = collection.doc(normalizedEmail)
  const current = await docRef.get()
  const onboardingStatus = params.onboardingStatus ?? "approved"
  const active = typeof params.active === "boolean" ? params.active : resolveDefaultActive(onboardingStatus)

  if (!current.exists) {
    const defaults = mergeOnboardingDefaults(onboardingStatus, params.actorEmail)

    const payload: Record<string, unknown> = {
      email: normalizedEmail,
      emailLower: normalizedEmail,
      role: params.role,
      active,
      onboardingStatus,
      createdAt: now,
      updatedAt: now,
      createdBy: params.actorEmail,
      updatedBy: params.actorEmail,
    }

    if (params.uid) payload.uid = params.uid
    if (params.inviteId) payload.inviteId = params.inviteId
    if (params.invitedAt || defaults.invitedAt) payload.invitedAt = params.invitedAt || defaults.invitedAt
    if (params.inviteAcceptedAt || defaults.inviteAcceptedAt) {
      payload.inviteAcceptedAt = params.inviteAcceptedAt || defaults.inviteAcceptedAt
    }
    if (params.approvedAt || defaults.approvedAt) payload.approvedAt = params.approvedAt || defaults.approvedAt
    if (params.approvedBy || defaults.approvedBy) payload.approvedBy = params.approvedBy || defaults.approvedBy
    if (params.revokedAt || defaults.revokedAt) payload.revokedAt = params.revokedAt || defaults.revokedAt
    if (params.deletedAt || defaults.deletedAt) payload.deletedAt = params.deletedAt || defaults.deletedAt

    await docRef.set(payload)
    return
  }

  const currentParsed = adminUserSchema.safeParse(current.data())
  const currentRecord = currentParsed.success ? normalizeAdminRecord(currentParsed.data) : null
  const nextStatus = params.onboardingStatus ?? currentRecord?.onboardingStatus ?? "approved"
  const nextActive = typeof params.active === "boolean" ? params.active : currentRecord?.active ?? resolveDefaultActive(nextStatus)
  const defaults = mergeOnboardingDefaults(nextStatus, params.actorEmail, currentRecord || undefined)

  await docRef.update({
    role: params.role,
    active: nextActive,
    onboardingStatus: nextStatus,
    ...(typeof params.uid === "string" ? { uid: params.uid } : {}),
    ...(typeof params.inviteId === "string" ? { inviteId: params.inviteId } : {}),
    ...(typeof params.invitedAt === "string" ? { invitedAt: params.invitedAt } : {}),
    ...(typeof params.inviteAcceptedAt === "string" ? { inviteAcceptedAt: params.inviteAcceptedAt } : {}),
    ...(typeof params.approvedAt === "string" ? { approvedAt: params.approvedAt } : {}),
    ...(typeof params.approvedBy === "string" ? { approvedBy: params.approvedBy } : {}),
    ...(typeof params.revokedAt === "string" ? { revokedAt: params.revokedAt } : {}),
    ...(typeof params.deletedAt === "string" ? { deletedAt: params.deletedAt } : {}),
    ...(nextStatus === "invited" && defaults.invitedAt ? { invitedAt: defaults.invitedAt } : {}),
    ...(nextStatus === "pending" && defaults.inviteAcceptedAt ? { inviteAcceptedAt: defaults.inviteAcceptedAt } : {}),
    ...(nextStatus === "approved" && defaults.approvedAt ? { approvedAt: defaults.approvedAt } : {}),
    ...(nextStatus === "approved" && defaults.approvedBy ? { approvedBy: defaults.approvedBy } : {}),
    ...(nextStatus === "revoked" && defaults.revokedAt ? { revokedAt: defaults.revokedAt } : {}),
    ...(nextStatus === "deleted" && defaults.deletedAt ? { deletedAt: defaults.deletedAt } : {}),
    updatedAt: now,
    updatedBy: params.actorEmail,
  })
}

export async function updateAdminUser(
  email: string,
  updates: AdminUserMutableUpdates,
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

  const parsed = adminUserSchema.safeParse(existing.data())
  const current = parsed.success ? normalizeAdminRecord(parsed.data) : null
  const nextStatus = updates.onboardingStatus ?? current?.onboardingStatus
  const defaults = nextStatus ? mergeOnboardingDefaults(nextStatus, actorEmail, current || undefined) : null

  await docRef.update({
    ...(updates.role ? { role: updates.role } : {}),
    ...(typeof updates.active === "boolean" ? { active: updates.active } : {}),
    ...(updates.onboardingStatus ? { onboardingStatus: updates.onboardingStatus } : {}),
    ...(typeof updates.uid === "string" ? { uid: updates.uid } : {}),
    ...(typeof updates.inviteId === "string" ? { inviteId: updates.inviteId } : {}),
    ...(typeof updates.invitedAt === "string" ? { invitedAt: updates.invitedAt } : {}),
    ...(typeof updates.inviteAcceptedAt === "string" ? { inviteAcceptedAt: updates.inviteAcceptedAt } : {}),
    ...(typeof updates.approvedAt === "string" ? { approvedAt: updates.approvedAt } : {}),
    ...(typeof updates.approvedBy === "string" ? { approvedBy: updates.approvedBy } : {}),
    ...(typeof updates.revokedAt === "string" ? { revokedAt: updates.revokedAt } : {}),
    ...(typeof updates.deletedAt === "string" ? { deletedAt: updates.deletedAt } : {}),
    ...(nextStatus === "invited" && defaults?.invitedAt ? { invitedAt: defaults.invitedAt } : {}),
    ...(nextStatus === "pending" && defaults?.inviteAcceptedAt ? { inviteAcceptedAt: defaults.inviteAcceptedAt } : {}),
    ...(nextStatus === "approved" && defaults?.approvedAt ? { approvedAt: defaults.approvedAt } : {}),
    ...(nextStatus === "approved" && defaults?.approvedBy ? { approvedBy: defaults.approvedBy } : {}),
    ...(nextStatus === "revoked" && defaults?.revokedAt ? { revokedAt: defaults.revokedAt } : {}),
    ...(nextStatus === "deleted" && defaults?.deletedAt ? { deletedAt: defaults.deletedAt } : {}),
    updatedAt: nowIso(),
    updatedBy: actorEmail,
  })
}

export async function archiveAndDeleteAdminUser(params: {
  email: string
  actorEmail: string
  reason: string
}) {
  const normalizedEmail = normalizeAdminEmail(params.email)
  if (!normalizedEmail) {
    throw new Error("Invalid admin email.")
  }

  const usersCollection = await getAdminUsersCollection()
  const archiveCollection = await getAdminUsersArchiveCollection()
  const now = nowIso()

  await usersCollection.firestore.runTransaction(async (transaction) => {
    const docRef = usersCollection.doc(normalizedEmail)
    const existing = await transaction.get(docRef)
    if (!existing.exists) {
      return
    }

    const parsed = adminUserSchema.safeParse(existing.data())
    if (!parsed.success) {
      transaction.delete(docRef)
      return
    }

    const record = normalizeAdminRecord(parsed.data)
    const archiveId = `${normalizedEmail.replace(/[^a-z0-9]/g, "_")}_${Date.now()}`
    const archiveRef = archiveCollection.doc(archiveId)
    transaction.set(archiveRef, {
      ...record,
      archivedAt: now,
      archivedBy: params.actorEmail,
      archiveReason: params.reason,
      deletedAt: now,
      onboardingStatus: "deleted",
      active: false,
    })
    transaction.delete(docRef)
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
  return users.filter((user) => user.role === "super_admin" && user.active && user.onboardingStatus === "approved").length
}

function toSortableTimestamp(value: string | undefined) {
  if (!value) {
    return Number.MAX_SAFE_INTEGER
  }

  const parsed = Date.parse(value)
  if (Number.isNaN(parsed)) {
    return Number.MAX_SAFE_INTEGER
  }

  return parsed
}

export async function getPrimarySuperAdminEmail() {
  const users = await listAdminUsers()
  const superAdmins = users.filter((user) => user.role === "super_admin" && user.onboardingStatus !== "deleted")

  if (superAdmins.length === 0) {
    return null
  }

  superAdmins.sort((a, b) => {
    const timestampDiff = toSortableTimestamp(a.createdAt) - toSortableTimestamp(b.createdAt)
    if (timestampDiff !== 0) {
      return timestampDiff
    }

    return a.email.localeCompare(b.email)
  })

  return superAdmins[0]?.email || null
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
    lastLoginAt: nowIso(),
    lastLoginIp: ip,
    updatedAt: nowIso(),
  })
}
