import "server-only"

import type { DecodedIdToken } from "firebase-admin/auth"
import { cookies } from "next/headers"
import { getAdminUserByEmail, getRolePermissions, hasAdminPermission, type AdminPermission, type AdminRole } from "./admin-users"
import { getTrackedAdminSession, touchTrackedAdminSession } from "./admin-session-store"
import { getAdminSessionCookieName } from "./session-cookie"

export class AdminAuthError extends Error {
  status: number

  constructor(message: string, status = 401) {
    super(message)
    this.name = "AdminAuthError"
    this.status = status
  }
}

export type AdminSession = {
  uid: string
  email: string
  role: AdminRole
  permissions: readonly AdminPermission[]
  sessionExpiresAt: string
  token: DecodedIdToken
}

export function readCookieFromHeader(cookieHeader: string | null, name: string) {
  if (!cookieHeader) {
    return null
  }

  const parts = cookieHeader.split(";").map((part) => part.trim())

  for (const part of parts) {
    const [cookieName, ...cookieValueParts] = part.split("=")
    if (cookieName === name) {
      return decodeURIComponent(cookieValueParts.join("="))
    }
  }

  return null
}

function assertAdminPermission(role: AdminRole, permission: AdminPermission) {
  if (!hasAdminPermission(role, permission)) {
    throw new AdminAuthError("You do not have permission to perform this action.", 403)
  }
}

export async function verifyAdminSessionCookie(
  sessionCookie: string,
  permission: AdminPermission = "dashboard:view",
) {
  try {
    const { getAdminAuth } = await import("@/lib/firebase/admin")
    const decoded = await getAdminAuth().verifySessionCookie(sessionCookie, true)
    const email = decoded.email?.toLowerCase()
    const trackedSession = await getTrackedAdminSession(sessionCookie)

    if (!trackedSession || trackedSession.uid !== decoded.uid) {
      throw new AdminAuthError("Invalid or expired admin session.", 401)
    }

    const adminUser = await getAdminUserByEmail(email)
    if (!adminUser || !adminUser.active) {
      throw new AdminAuthError("Email not found in admin allowlist.", 403)
    }

    assertAdminPermission(adminUser.role, permission)
    await touchTrackedAdminSession(sessionCookie)

    return {
      uid: decoded.uid,
      email: adminUser.email,
      role: adminUser.role,
      permissions: getRolePermissions(adminUser.role),
      sessionExpiresAt: trackedSession.expiresAt,
      token: decoded,
    } satisfies AdminSession
  } catch (error) {
    if (error instanceof AdminAuthError) {
      throw error
    }

    throw new AdminAuthError("Invalid or expired admin session.", 401)
  }
}

export async function requireAdmin(permission: AdminPermission = "dashboard:view") {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(getAdminSessionCookieName())?.value

  if (!sessionCookie) {
    throw new AdminAuthError("Admin session is required.", 401)
  }

  return verifyAdminSessionCookie(sessionCookie, permission)
}

export async function requireAdminFromRequest(
  request: Request,
  permission: AdminPermission = "dashboard:view",
) {
  const sessionCookie = readCookieFromHeader(request.headers.get("cookie"), getAdminSessionCookieName())

  if (!sessionCookie) {
    throw new AdminAuthError("Admin session is required.", 401)
  }

  return verifyAdminSessionCookie(sessionCookie, permission)
}
