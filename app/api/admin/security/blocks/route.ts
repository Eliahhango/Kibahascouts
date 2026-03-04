import { NextResponse } from "next/server"
import { z } from "zod"
import { assertAdminMutationRequest, assertAdminRequest, toApiErrorResponse } from "../../_utils"
import { listAdminBlocks, upsertAdminBlock } from "@/lib/security/admin-blocks"
import { logAuditEvent } from "@/lib/security/audit-log"

export const runtime = "nodejs"

const blockInputSchema = z.object({
  targetType: z.enum(["email", "ip"]),
  targetValue: z.string().trim().min(1, "Target value is required."),
  scope: z.enum(["admin_auth", "admin_api", "all"]).optional().default("all"),
  reason: z.string().trim().min(5, "Reason is required."),
  expiresAt: z
    .string()
    .trim()
    .optional()
    .transform((value) => value || "")
    .refine((value) => value === "" || !Number.isNaN(new Date(value).getTime()), {
      message: "Expiry date must be a valid date/time.",
    }),
})

export async function GET(request: Request) {
  try {
    await assertAdminRequest(request, "admins:manage")
    const data = await listAdminBlocks(200)
    return NextResponse.json({ ok: true, data })
  } catch (error) {
    return toApiErrorResponse(error, "Failed to list block rules")
  }
}

export async function POST(request: Request) {
  try {
    const admin = await assertAdminMutationRequest(request, "admins:manage")
    const rawBody = await request.json().catch(() => null)
    const parsedBody = blockInputSchema.safeParse(rawBody)

    if (!parsedBody.success) {
      return NextResponse.json({ ok: false, error: parsedBody.error.issues[0]?.message || "Invalid payload." }, { status: 400 })
    }

    const block = await upsertAdminBlock({
      targetType: parsedBody.data.targetType,
      targetValue: parsedBody.data.targetValue,
      scope: parsedBody.data.scope,
      reason: parsedBody.data.reason,
      actorEmail: admin.email,
      expiresAt: parsedBody.data.expiresAt || "",
    })

    if (!block) {
      return NextResponse.json({ ok: false, error: "Unable to save block rule." }, { status: 500 })
    }

    await logAuditEvent({
      eventType: "security.block.upsert",
      severity: "warning",
      email: admin.email,
      reason: block.reason,
      metadata: {
        blockId: block.id,
        targetType: block.targetType,
        targetValue: block.targetValue,
        scope: block.scope,
        expiresAt: block.expiresAt,
      },
    })

    return NextResponse.json({ ok: true, data: block }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ ok: false, error: error.issues[0]?.message || "Invalid payload." }, { status: 400 })
    }
    return toApiErrorResponse(error, "Failed to save block rule")
  }
}
