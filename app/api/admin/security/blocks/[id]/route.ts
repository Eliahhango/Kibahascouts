import { NextResponse } from "next/server"
import { assertAdminMutationRequest, toApiErrorResponse } from "../../../_utils"
import { removeAdminBlock } from "@/lib/security/admin-blocks"
import { logAuditEvent } from "@/lib/security/audit-log"

export const runtime = "nodejs"

type Params = {
  params: Promise<{ id: string }>
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    const admin = await assertAdminMutationRequest(request, "admins:manage")
    const { id } = await params

    if (!id) {
      return NextResponse.json({ ok: false, error: "Block id is required." }, { status: 400 })
    }

    await removeAdminBlock(id)
    await logAuditEvent({
      eventType: "security.block.delete",
      severity: "warning",
      email: admin.email,
      metadata: { blockId: id },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    return toApiErrorResponse(error, "Failed to remove block rule")
  }
}
