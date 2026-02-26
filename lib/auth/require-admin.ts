import "server-only"

import type { DecodedIdToken } from "firebase-admin/auth"
import { cookies } from "next/headers"
import { isAllowedAdminEmail } from "./admin-allowlist"
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
  token: DecodedIdToken
}

function readCookieFromHeader(cookieHeader: string | null, name: string) {
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

export async function verifyAdminSessionCookie(sessionCookie: string) {
  try {
    const { getAdminAuth } = await import("@/lib/firebase/admin")
    const decoded = await getAdminAuth().verifySessionCookie(sessionCookie, true)
    const email = decoded.email?.toLowerCase()

    if (!isAllowedAdminEmail(email)) {
      throw new AdminAuthError("Access denied for this account.", 403)
    }

    return {
      uid: decoded.uid,
      email: email || "",
      token: decoded,
    } satisfies AdminSession
  } catch (error) {
    if (error instanceof AdminAuthError) {
      throw error
    }

    throw new AdminAuthError("Invalid or expired admin session.", 401)
  }
}

export async function requireAdmin() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(getAdminSessionCookieName())?.value

  if (!sessionCookie) {
    throw new AdminAuthError("Admin session is required.", 401)
  }

  return verifyAdminSessionCookie(sessionCookie)
}

export async function requireAdminFromRequest(request: Request) {
  const sessionCookie = readCookieFromHeader(request.headers.get("cookie"), getAdminSessionCookieName())

  if (!sessionCookie) {
    throw new AdminAuthError("Admin session is required.", 401)
  }

  return verifyAdminSessionCookie(sessionCookie)
}
