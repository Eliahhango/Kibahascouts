import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { getAdminSessionCookieName } from "@/lib/auth/session-cookie"

const ADMIN_ROOT_PATH = "/admin"
const ADMIN_API_ROOT_PATH = "/api/admin"
const ADMIN_LOGIN_PATH = "/admin/login"
const ADMIN_CSRF_COOKIE_NAME = "kibaha_admin_csrf"

function createCsrfToken() {
  return `${crypto.randomUUID().replace(/-/g, "")}${crypto.randomUUID().replace(/-/g, "")}`
}

function withCsrfCookie(request: NextRequest, response: NextResponse) {
  if (request.cookies.get(ADMIN_CSRF_COOKIE_NAME)?.value) {
    return response
  }

  response.cookies.set({
    name: ADMIN_CSRF_COOKIE_NAME,
    value: createCsrfToken(),
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  })

  return response
}

function buildLoginRedirectUrl(request: NextRequest) {
  const loginUrl = new URL(ADMIN_LOGIN_PATH, request.url)
  const returnPath = `${request.nextUrl.pathname}${request.nextUrl.search}`

  if (returnPath && returnPath !== ADMIN_LOGIN_PATH) {
    loginUrl.searchParams.set("next", returnPath)
  }

  return loginUrl
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isAdminPagePath = pathname.startsWith(ADMIN_ROOT_PATH)
  const isAdminApiPath = pathname.startsWith(ADMIN_API_ROOT_PATH)

  if (!isAdminPagePath && !isAdminApiPath) {
    return NextResponse.next()
  }

  if (isAdminApiPath) {
    return withCsrfCookie(request, NextResponse.next())
  }

  if (pathname === ADMIN_LOGIN_PATH) {
    // Always allow login route so stale/invalid cookies cannot cause redirect loops.
    return withCsrfCookie(request, NextResponse.next())
  }

  const hasAdminSession = Boolean(request.cookies.get(getAdminSessionCookieName())?.value)

  if (!hasAdminSession) {
    return withCsrfCookie(request, NextResponse.redirect(buildLoginRedirectUrl(request)))
  }

  return withCsrfCookie(request, NextResponse.next())
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
}
