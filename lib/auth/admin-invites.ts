import "server-only"

import { randomUUID } from "crypto"
import { z } from "zod"
import { type AdminRole, normalizeAdminEmail } from "@/lib/auth/admin-users"

export const ADMIN_INVITE_STATUS_VALUES = ["invited", "accepted", "superseded", "revoked", "deleted", "expired"] as const
export type AdminInviteStatus = (typeof ADMIN_INVITE_STATUS_VALUES)[number]

export type AdminInviteRecord = {
  id: string
  email: string
  emailLower: string
  role: AdminRole
  status: AdminInviteStatus
  invitedBy: string
  invitedAt: string
  expiresAt: string
  acceptedAt?: string
  acceptedByUid?: string
  invalidatedAt?: string
  invalidatedBy?: string
  invalidationReason?: string
  supersededByInviteId?: string
}

const ADMIN_INVITES_COLLECTION = "adminInvites"
const DEFAULT_INVITE_VALIDITY_DAYS = 7

const adminInviteSchema = z.object({
  email: z.string().email(),
  emailLower: z.string().email(),
  role: z.enum(["super_admin", "content_admin", "viewer"]),
  status: z.enum(ADMIN_INVITE_STATUS_VALUES),
  invitedBy: z.string(),
  invitedAt: z.string(),
  expiresAt: z.string(),
  acceptedAt: z.string().optional(),
  acceptedByUid: z.string().optional(),
  invalidatedAt: z.string().optional(),
  invalidatedBy: z.string().optional(),
  invalidationReason: z.string().optional(),
  supersededByInviteId: z.string().optional(),
})

function nowIso() {
  return new Date().toISOString()
}

function generateInviteId() {
  return randomUUID().replace(/-/g, "")
}

function toExpiryIso(days: number) {
  const safeDays = Number.isFinite(days) && days > 0 ? Math.floor(days) : DEFAULT_INVITE_VALIDITY_DAYS
  return new Date(Date.now() + safeDays * 24 * 60 * 60 * 1000).toISOString()
}

function normalizeInviteRecord(id: string, data: z.infer<typeof adminInviteSchema>): AdminInviteRecord {
  return {
    id,
    email: data.emailLower,
    emailLower: data.emailLower,
    role: data.role,
    status: data.status,
    invitedBy: data.invitedBy,
    invitedAt: data.invitedAt,
    expiresAt: data.expiresAt,
    acceptedAt: data.acceptedAt,
    acceptedByUid: data.acceptedByUid,
    invalidatedAt: data.invalidatedAt,
    invalidatedBy: data.invalidatedBy,
    invalidationReason: data.invalidationReason,
    supersededByInviteId: data.supersededByInviteId,
  }
}

async function getAdminInvitesCollection() {
  const { getAdminDb } = await import("@/lib/firebase/admin")
  return getAdminDb().collection(ADMIN_INVITES_COLLECTION)
}

function validateInviteId(inviteId: string) {
  const normalized = inviteId.trim()
  if (!normalized || normalized.length < 12 || normalized.length > 80) {
    throw new Error("Invalid invite ID.")
  }
  return normalized
}

async function markInviteExpiredIfNeeded(
  id: string,
  record: AdminInviteRecord,
): Promise<AdminInviteRecord | null> {
  if (record.status !== "invited") {
    return record
  }

  if (new Date(record.expiresAt).getTime() > Date.now()) {
    return record
  }

  const collection = await getAdminInvitesCollection()
  const now = nowIso()
  await collection.doc(id).update({
    status: "expired",
    invalidatedAt: now,
    invalidationReason: "invite_expired",
  })
  return null
}

export async function getAdminInviteById(inviteId: string): Promise<AdminInviteRecord | null> {
  const normalizedInviteId = validateInviteId(inviteId)
  const collection = await getAdminInvitesCollection()
  const doc = await collection.doc(normalizedInviteId).get()
  if (!doc.exists) {
    return null
  }

  const parsed = adminInviteSchema.safeParse(doc.data())
  if (!parsed.success) {
    return null
  }

  const record = normalizeInviteRecord(doc.id, parsed.data)
  return markInviteExpiredIfNeeded(doc.id, record)
}

export async function getValidAdminInvite(params: {
  inviteId: string
  email?: string | null
}) {
  const invite = await getAdminInviteById(params.inviteId)
  if (!invite) {
    return null
  }

  if (invite.status !== "invited") {
    return null
  }

  if (params.email) {
    const normalizedEmail = normalizeAdminEmail(params.email)
    if (!normalizedEmail || normalizedEmail !== invite.emailLower) {
      return null
    }
  }

  return invite
}

export async function createAdminInvite(params: {
  email: string
  role: AdminRole
  invitedByEmail: string
  expiresInDays?: number
}) {
  const normalizedEmail = normalizeAdminEmail(params.email)
  if (!normalizedEmail) {
    throw new Error("Invalid invite email.")
  }

  const inviteId = generateInviteId()
  const invitedAt = nowIso()
  const expiresAt = toExpiryIso(params.expiresInDays ?? DEFAULT_INVITE_VALIDITY_DAYS)
  const collection = await getAdminInvitesCollection()

  await collection.firestore.runTransaction(async (transaction) => {
    const openInviteQuery = collection
      .where("emailLower", "==", normalizedEmail)
      .where("status", "==", "invited")
    const openInviteSnapshot = await transaction.get(openInviteQuery)

    for (const doc of openInviteSnapshot.docs) {
      transaction.update(doc.ref, {
        status: "superseded",
        invalidatedAt: invitedAt,
        invalidatedBy: params.invitedByEmail,
        invalidationReason: "reinvited",
        supersededByInviteId: inviteId,
      })
    }

    const inviteRef = collection.doc(inviteId)
    transaction.set(inviteRef, {
      email: normalizedEmail,
      emailLower: normalizedEmail,
      role: params.role,
      status: "invited",
      invitedBy: params.invitedByEmail,
      invitedAt,
      expiresAt,
    })
  })

  return {
    id: inviteId,
    email: normalizedEmail,
    role: params.role,
    status: "invited" as const,
    invitedAt,
    expiresAt,
    invitedBy: params.invitedByEmail,
  }
}

export async function markAdminInviteAccepted(params: {
  inviteId: string
  email: string
  acceptedByUid: string
}) {
  const inviteId = validateInviteId(params.inviteId)
  const normalizedEmail = normalizeAdminEmail(params.email)
  if (!normalizedEmail) {
    throw new Error("Invalid invite email.")
  }

  const collection = await getAdminInvitesCollection()
  const now = nowIso()

  await collection.firestore.runTransaction(async (transaction) => {
    const inviteRef = collection.doc(inviteId)
    const inviteDoc = await transaction.get(inviteRef)
    if (!inviteDoc.exists) {
      throw new Error("Invite not found.")
    }

    const parsed = adminInviteSchema.safeParse(inviteDoc.data())
    if (!parsed.success) {
      throw new Error("Invite record is invalid.")
    }

    const record = normalizeInviteRecord(inviteDoc.id, parsed.data)
    if (record.emailLower !== normalizedEmail) {
      throw new Error("Invite email does not match account email.")
    }

    if (record.status !== "invited") {
      throw new Error("Invite is no longer valid.")
    }

    if (new Date(record.expiresAt).getTime() <= Date.now()) {
      transaction.update(inviteRef, {
        status: "expired",
        invalidatedAt: now,
        invalidationReason: "invite_expired",
      })
      throw new Error("Invite has expired.")
    }

    transaction.update(inviteRef, {
      status: "accepted",
      acceptedAt: now,
      acceptedByUid: params.acceptedByUid,
    })
  })
}

export async function invalidateInvitesForEmail(params: {
  email: string
  status: Extract<AdminInviteStatus, "revoked" | "deleted" | "superseded" | "expired">
  actorEmail: string
  reason: string
  supersededByInviteId?: string
}) {
  const normalizedEmail = normalizeAdminEmail(params.email)
  if (!normalizedEmail) {
    return 0
  }

  const collection = await getAdminInvitesCollection()
  const now = nowIso()
  const snapshot = await collection
    .where("emailLower", "==", normalizedEmail)
    .where("status", "==", "invited")
    .get()

  if (snapshot.empty) {
    return 0
  }

  const writer = collection.firestore.batch()
  for (const doc of snapshot.docs) {
    writer.update(doc.ref, {
      status: params.status,
      invalidatedAt: now,
      invalidatedBy: params.actorEmail,
      invalidationReason: params.reason,
      ...(params.supersededByInviteId ? { supersededByInviteId: params.supersededByInviteId } : {}),
    })
  }

  await writer.commit()
  return snapshot.size
}
