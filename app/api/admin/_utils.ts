import { NextResponse } from "next/server"
import { AdminAuthError, requireAdminFromRequest } from "@/lib/auth/require-admin"

export async function assertAdminRequest(request: Request) {
  await requireAdminFromRequest(request)
}

export function toApiErrorResponse(error: unknown, fallbackMessage: string) {
  if (error instanceof AdminAuthError) {
    return NextResponse.json(
      {
        ok: false,
        error: error.message,
      },
      { status: error.status },
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
