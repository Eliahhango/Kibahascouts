import { NextResponse } from "next/server"
import { assertAdminRequest, toApiErrorResponse } from "../_utils"
import { getAdminDashboardSummary } from "@/lib/firebase/admin-dashboard"

export const runtime = "nodejs"

export async function GET(request: Request) {
  try {
    await assertAdminRequest(request, "dashboard:view")
    const summary = await getAdminDashboardSummary()

    return NextResponse.json({
      ok: true,
      data: summary.navSummary,
    })
  } catch (error) {
    return toApiErrorResponse(error, "Failed to load dashboard summary")
  }
}
