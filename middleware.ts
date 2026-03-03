import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { getAdminSessionCookieName } from "@/lib/auth/session-cookie"

const ADMIN_ROOT_PATH = "/admin"
const ADMIN_LOGIN_PATH = "/admin/login"

function buildLoginRedirectUrl(request: NextRequest) {
  const loginUrl = new URL(ADMIN_LOGIN_PATH, request.url)
  const returnPath = `${request.nextUrl.pathname}${request.nextUrl.search}`

  if (returnPath && returnPath !== ADMIN_LOGIN_PATH) {
    loginUrl.searchParams.set("next", returnPath)
  }

  return loginUrl
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (!pathname.startsWith(ADMIN_ROOT_PATH)) {
    return NextResponse.next()
  }

  if (pathname === ADMIN_LOGIN_PATH) {
    // Always allow login route so stale/invalid cookies cannot cause redirect loops.
    return NextResponse.next()
  }

  const hasAdminSession = Boolean(request.cookies.get(getAdminSessionCookieName())?.value)

  if (!hasAdminSession) {
    return NextResponse.redirect(buildLoginRedirectUrl(request))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}
