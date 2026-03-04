import "server-only"

import { createHash } from "crypto"

export const ADMIN_BLOCK_SCOPE_VALUES = ["admin_auth", "admin_api", "all"] as const
export type AdminBlockScope = (typeof ADMIN_BLOCK_SCOPE_VALUES)[number]

export const ADMIN_BLOCK_TARGET_VALUES = ["email", "ip"] as const
export type AdminBlockTargetType = (typeof ADMIN_BLOCK_TARGET_VALUES)[number]

export type AdminBlockRecord = {
  id: string
  targetType: AdminBlockTargetType
  targetValue: string
  scope: AdminBlockScope
  reason: string
  active: boolean
  expiresAt: string
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy: string
}

const BLOCK_COLLECTION = "adminBlockedActors"

function normalizeEmail(email: string | null | undefined) {
  if (!email) {
    return ""
  }
  return email.trim().toLowerCase()
}

function normalizeIp(ip: string | null | undefined) {
  if (!ip) {
    return ""
  }
  return ip.trim().toLowerCase()
}

function normalizeTargetValue(targetType: AdminBlockTargetType, targetValue: string) {
  return targetType === "email" ? normalizeEmail(targetValue) : normalizeIp(targetValue)
}

function toNowIso() {
  return new Date().toISOString()
}

function toHash(input: string) {
  return createHash("sha256").update(input).digest("hex")
}

function isValidScope(value: string | null | undefined): value is AdminBlockScope {
  return value === "admin_auth" || value === "admin_api" || value === "all"
}

function isValidTargetType(value: string | null | undefined): value is AdminBlockTargetType {
  return value === "email" || value === "ip"
}

function normalizeBlockDoc(id: string, data: Record<string, unknown>): AdminBlockRecord | null {
  const targetType = String(data.targetType || "")
  if (!isValidTargetType(targetType)) {
    return null
  }

  const scope = String(data.scope || "all")
  if (!isValidScope(scope)) {
    return null
  }

  const targetValue = normalizeTargetValue(targetType, String(data.targetValue || ""))
  if (!targetValue) {
    return null
  }

  return {
    id,
    targetType,
    targetValue,
    scope,
    reason: String(data.reason || ""),
    active: Boolean(data.active),
    expiresAt: String(data.expiresAt || ""),
    createdAt: String(data.createdAt || ""),
    updatedAt: String(data.updatedAt || ""),
    createdBy: String(data.createdBy || "system"),
    updatedBy: String(data.updatedBy || "system"),
  }
}

function isScopeApplicable(blockScope: AdminBlockScope, scope: Exclude<AdminBlockScope, "all">) {
  return blockScope === "all" || blockScope === scope
}

function isExpired(block: AdminBlockRecord) {
  if (!block.expiresAt) {
    return false
  }
  return new Date(block.expiresAt).getTime() <= Date.now()
}

export function buildAdminBlockId(targetType: AdminBlockTargetType, targetValue: string) {
  const normalized = normalizeTargetValue(targetType, targetValue)
  if (!normalized) {
    return ""
  }
  return `${targetType}_${toHash(`${targetType}:${normalized}`)}`
}

async function getBlockCollection() {
  const { getAdminDb } = await import("@/lib/firebase/admin")
  return getAdminDb().collection(BLOCK_COLLECTION)
}

async function getBlockByTarget(targetType: AdminBlockTargetType, targetValue: string) {
  const normalized = normalizeTargetValue(targetType, targetValue)
  if (!normalized) {
    return null
  }

  const docId = buildAdminBlockId(targetType, normalized)
  if (!docId) {
    return null
  }

  const collection = await getBlockCollection()
  const doc = await collection.doc(docId).get()
  if (!doc.exists) {
    return null
  }

  return normalizeBlockDoc(doc.id, (doc.data() || {}) as Record<string, unknown>)
}

async function deactivateExpiredBlock(block: AdminBlockRecord) {
  const collection = await getBlockCollection()
  await collection.doc(block.id).set(
    {
      active: false,
      updatedAt: toNowIso(),
      updatedBy: "system_expiry",
    },
    { merge: true },
  )
}

export async function resolveBlockingRule(params: {
  email?: string | null
  ip?: string | null
  scope: Exclude<AdminBlockScope, "all">
}) {
  const [emailBlock, ipBlock] = await Promise.all([
    params.email ? getBlockByTarget("email", params.email) : Promise.resolve(null),
    params.ip ? getBlockByTarget("ip", params.ip) : Promise.resolve(null),
  ])

  const candidates = [emailBlock, ipBlock].filter((value): value is AdminBlockRecord => Boolean(value))
  if (candidates.length === 0) {
    return null
  }

  for (const block of candidates) {
    if (!block.active) {
      continue
    }

    if (isExpired(block)) {
      await deactivateExpiredBlock(block)
      continue
    }

    if (isScopeApplicable(block.scope, params.scope)) {
      return block
    }
  }

  return null
}

export async function listAdminBlocks(limit = 200) {
  const collection = await getBlockCollection()
  const snapshot = await collection.orderBy("updatedAt", "desc").limit(limit).get()

  return snapshot.docs
    .map((doc) => normalizeBlockDoc(doc.id, (doc.data() || {}) as Record<string, unknown>))
    .filter((value): value is AdminBlockRecord => Boolean(value))
}

export async function upsertAdminBlock(params: {
  targetType: AdminBlockTargetType
  targetValue: string
  scope: AdminBlockScope
  reason: string
  actorEmail: string
  expiresAt?: string
}) {
  const normalizedTarget = normalizeTargetValue(params.targetType, params.targetValue)
  if (!normalizedTarget) {
    throw new Error("Target value is required.")
  }

  const normalizedReason = params.reason.trim()
  if (!normalizedReason) {
    throw new Error("Reason is required.")
  }

  const docId = buildAdminBlockId(params.targetType, normalizedTarget)
  if (!docId) {
    throw new Error("Unable to build block key.")
  }

  const now = toNowIso()
  const collection = await getBlockCollection()
  const docRef = collection.doc(docId)
  const existing = await docRef.get()
  const existingData = (existing.data() || {}) as Record<string, unknown>

  const payload = {
    targetType: params.targetType,
    targetValue: normalizedTarget,
    scope: params.scope,
    reason: normalizedReason,
    active: true,
    expiresAt: params.expiresAt || "",
    createdAt: existing.exists ? String(existingData.createdAt || now) : now,
    updatedAt: now,
    createdBy: existing.exists ? String(existingData.createdBy || params.actorEmail) : params.actorEmail,
    updatedBy: params.actorEmail,
  }

  await docRef.set(payload)
  return normalizeBlockDoc(docId, payload as Record<string, unknown>)
}

export async function removeAdminBlock(blockId: string) {
  const normalizedId = blockId.trim()
  if (!normalizedId) {
    throw new Error("Block id is required.")
  }

  const collection = await getBlockCollection()
  await collection.doc(normalizedId).delete()
}
