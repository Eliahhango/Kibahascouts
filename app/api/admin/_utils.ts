import { NextResponse } from "next/server"
import { CsrfValidationError, verifyCsrfRequest } from "@/lib/auth/csrf"
import { type AdminPermission } from "@/lib/auth/admin-users"
import { AdminAuthError, requireAdminFromRequest } from "@/lib/auth/require-admin"
import { resolveBlockingRule } from "@/lib/security/admin-blocks"
import { logAdminApiAccess, trackUnauthorizedAccess } from "@/lib/security/audit-log"
import { getRequestIp, getRequestPath, getRequestUserAgent } from "@/lib/security/request-context"

export async function assertAdminRequest(request: Request, permission: AdminPermission = "dashboard:view") {
  const method = request.method.toUpperCase()
  const path = getRequestPath(request)
  const ip = getRequestIp(request)
  const userAgent = getRequestUserAgent(request)

  try {
    const admin = await requireAdminFromRequest(request, permission)
    const actorBlock = await resolveBlockingRule({ email: admin.email, ip, scope: "admin_api" })
    if (actorBlock) {
      throw new AdminAuthError("Your admin access is blocked by security policy.", 403)
    }

    await logAdminApiAccess({
      email: admin.email,
      uid: admin.uid,
      ip,
      userAgent,
      method,
      path,
      status: 200,
      outcome: "success",
    })
    return admin
  } catch (error) {
    const status = error instanceof AdminAuthError ? error.status : error instanceof CsrfValidationError ? error.status : 500
    await logAdminApiAccess({
      ip,
      userAgent,
      method,
      path,
      status,
      outcome: "failure",
      reason: error instanceof Error ? error.message : "Unknown admin API failure",
    })

    if (status === 401 || status === 403) {
      await trackUnauthorizedAccess({
        ip,
        path,
        method,
        reason: error instanceof Error ? error.message : "Unauthorized admin API access",
      })
    }

    throw error
  }
}

export async function assertAdminMutationRequest(request: Request, permission: AdminPermission = "dashboard:view") {
  verifyCsrfRequest(request)
  return assertAdminRequest(request, permission)
}

export function toApiErrorResponse(error: unknown, fallbackMessage: string) {
  if (error instanceof AdminAuthError || error instanceof CsrfValidationError) {
    return NextResponse.json(
      {
        ok: false,
        error: error.message,
      },
      { status: error.status || 403 },
    )
  }

  console.error(fallbackMessage, error)
  return NextResponse.json(
    {
      ok: false,
      error: "Server error. Please try again.",
    },
    { status: 500 },
  )
}
