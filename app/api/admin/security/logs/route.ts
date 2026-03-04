import { NextResponse } from "next/server"
import { z } from "zod"
import { assertAdminRequest, toApiErrorResponse } from "../../_utils"
import { listAdminBlocks } from "@/lib/security/admin-blocks"

export const runtime = "nodejs"

const querySchema = z.object({
  limit: z.coerce.number().int().min(20).max(200).optional().default(100),
})

function normalizeString(value: unknown) {
  return typeof value === "string" ? value : ""
}

function normalizeNumber(value: unknown) {
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : 0
}

function normalizeBoolean(value: unknown) {
  return value === true
}

export async function GET(request: Request) {
  try {
    await assertAdminRequest(request, "admins:manage")

    const requestUrl = new URL(request.url)
    const parsedQuery = querySchema.safeParse({
      limit: requestUrl.searchParams.get("limit") || undefined,
    })

    if (!parsedQuery.success) {
      return NextResponse.json({ ok: false, error: parsedQuery.error.issues[0]?.message || "Invalid query." }, { status: 400 })
    }

    const { getAdminDb } = await import("@/lib/firebase/admin")
    const db = getAdminDb()
    const limit = parsedQuery.data.limit

    const [auditSnapshot, alertSnapshot, attemptsSnapshot, visitorsSnapshot, blockedActors] = await Promise.all([
      db.collection("adminAuditLogs").orderBy("createdAt", "desc").limit(limit).get(),
      db.collection("adminSecurityAlerts").orderBy("createdAt", "desc").limit(limit).get(),
      db.collection("adminLoginAttempts").orderBy("updatedAt", "desc").limit(limit).get(),
      db.collection("siteVisitorLogs").orderBy("createdAt", "desc").limit(limit).get(),
      listAdminBlocks(limit),
    ])

    const now = Date.now()

    const auditLogs = auditSnapshot.docs.map((doc) => {
      const data = doc.data() as Record<string, unknown>
      return {
        id: doc.id,
        eventType: normalizeString(data.eventType),
        severity: normalizeString(data.severity),
        email: normalizeString(data.email),
        ip: normalizeString(data.ip),
        userAgent: normalizeString(data.userAgent),
        method: normalizeString(data.method),
        path: normalizeString(data.path),
        status: normalizeNumber(data.status),
        reason: normalizeString(data.reason),
        createdAt: normalizeString(data.createdAt),
      }
    })

    const securityAlerts = alertSnapshot.docs.map((doc) => {
      const data = doc.data() as Record<string, unknown>
      return {
        id: doc.id,
        title: normalizeString(data.title),
        acknowledged: normalizeBoolean(data.acknowledged),
        createdAt: normalizeString(data.createdAt),
        details: data.details || {},
      }
    })

    const loginAttempts = attemptsSnapshot.docs.map((doc) => {
      const data = doc.data() as Record<string, unknown>
      const resetAt = normalizeString(data.resetAt)
      return {
        id: doc.id,
        email: normalizeString(data.email),
        ip: normalizeString(data.ip),
        count: normalizeNumber(data.count),
        resetAt,
        updatedAt: normalizeString(data.updatedAt),
        active: resetAt ? new Date(resetAt).getTime() > now : false,
      }
    })

    const visitorLogs = visitorsSnapshot.docs.map((doc) => {
      const data = doc.data() as Record<string, unknown>
      return {
        id: doc.id,
        path: normalizeString(data.path),
        search: normalizeString(data.search),
        referrer: normalizeString(data.referrer),
        ip: normalizeString(data.ip),
        userAgent: normalizeString(data.userAgent),
        visitorId: normalizeString(data.visitorId),
        createdAt: normalizeString(data.createdAt),
      }
    })

    return NextResponse.json({
      ok: true,
      data: {
        auditLogs,
        securityAlerts,
        loginAttempts,
        visitorLogs,
        blockedActors,
      },
    })
  } catch (error) {
    return toApiErrorResponse(error, "Failed to load security logs")
  }
}
