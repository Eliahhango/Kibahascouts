import "server-only"

import { randomBytes, timingSafeEqual } from "crypto"

export const ADMIN_CSRF_COOKIE_NAME = "kibaha_admin_csrf"
export const ADMIN_CSRF_HEADER_NAME = "x-csrf-token"

export class CsrfValidationError extends Error {
  status: number

  constructor(message = "Invalid CSRF token.") {
    super(message)
    this.name = "CsrfValidationError"
    this.status = 403
  }
}

export function createCsrfToken() {
  return randomBytes(32).toString("hex")
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

function tokensMatch(headerToken: string, cookieToken: string) {
  if (!headerToken || !cookieToken || headerToken.length !== cookieToken.length) {
    return false
  }

  try {
    return timingSafeEqual(Buffer.from(headerToken), Buffer.from(cookieToken))
  } catch {
    return false
  }
}

export function verifyCsrfRequest(request: Request) {
  const headerToken = request.headers.get(ADMIN_CSRF_HEADER_NAME) || ""
  const cookieToken = readCookieFromHeader(request.headers.get("cookie"), ADMIN_CSRF_COOKIE_NAME) || ""

  if (!tokensMatch(headerToken, cookieToken)) {
    throw new CsrfValidationError()
  }

  return cookieToken
}
