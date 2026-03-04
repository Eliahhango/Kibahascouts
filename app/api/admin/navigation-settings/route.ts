import { NextResponse } from "next/server"
import { assertAdminMutationRequest, assertAdminRequest, toApiErrorResponse } from "../_utils"
import {
  getNavigationSettingsFromFirestore,
  navigationSettingsInputSchema,
  upsertNavigationSettingsInFirestore,
} from "@/lib/firebase/navigation-settings"

export const runtime = "nodejs"

export async function GET(request: Request) {
  try {
    await assertAdminRequest(request, "content:read")
    const settings = await getNavigationSettingsFromFirestore()
    return NextResponse.json({ ok: true, data: settings })
  } catch (error) {
    return toApiErrorResponse(error, "Failed to load navigation settings")
  }
}

export async function PATCH(request: Request) {
  try {
    const admin = await assertAdminMutationRequest(request, "content:write")
    const rawBody = await request.json().catch(() => null)
    const parsedBody = navigationSettingsInputSchema.safeParse(rawBody)

    if (!parsedBody.success) {
      return NextResponse.json(
        {
          ok: false,
          error: parsedBody.error.issues[0]?.message || "Invalid navigation settings payload.",
        },
        { status: 400 },
      )
    }

    const updated = await upsertNavigationSettingsInFirestore(parsedBody.data, admin.email)
    return NextResponse.json({ ok: true, data: updated })
  } catch (error) {
    return toApiErrorResponse(error, "Failed to update navigation settings")
  }
}
