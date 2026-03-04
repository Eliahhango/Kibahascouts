import { NextResponse } from "next/server"
import { assertAdminMutationRequest, assertAdminRequest, toApiErrorResponse } from "../_utils"
import {
  getSiteContentFromFirestore,
  siteContentSettingsInputSchema,
  upsertSiteContentInFirestore,
} from "@/lib/firebase/site-content"

export const runtime = "nodejs"

export async function GET(request: Request) {
  try {
    await assertAdminRequest(request, "content:read")
    const settings = await getSiteContentFromFirestore()
    return NextResponse.json({ ok: true, data: settings })
  } catch (error) {
    return toApiErrorResponse(error, "Failed to load site content settings")
  }
}

export async function PATCH(request: Request) {
  try {
    const admin = await assertAdminMutationRequest(request, "content:write")
    const rawBody = await request.json().catch(() => null)
    const parsedBody = siteContentSettingsInputSchema.safeParse(rawBody)

    if (!parsedBody.success) {
      return NextResponse.json(
        {
          ok: false,
          error: parsedBody.error.issues[0]?.message || "Invalid site content payload.",
        },
        { status: 400 },
      )
    }

    const updated = await upsertSiteContentInFirestore(parsedBody.data, admin.email)
    return NextResponse.json({ ok: true, data: updated })
  } catch (error) {
    return toApiErrorResponse(error, "Failed to update site content settings")
  }
}
