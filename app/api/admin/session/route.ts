import { NextResponse } from "next/server"
import { z } from "zod"
import { getAdminAllowlistWarning, hasAdminAllowlist, isAllowedAdminEmail } from "@/lib/auth/admin-allowlist"
import { getAdminSessionCookieName, getAdminSessionMaxAgeSeconds, getAdminSessionExpiresInMs } from "@/lib/auth/session-cookie"

export const runtime = "nodejs"

const SessionRequestSchema = z.object({
  idToken: z.string().min(1, "ID token is required"),
})

export async function POST(request: Request) {
  try {
    if (!hasAdminAllowlist()) {
      return NextResponse.json(
        {
          ok: false,
          error: getAdminAllowlistWarning(),
        },
        { status: 503 },
      )
    }

    const rawBody = await request.json().catch(() => null)
    const parsedBody = SessionRequestSchema.safeParse(rawBody)

    if (!parsedBody.success) {
      return NextResponse.json(
        {
          ok: false,
          error: "Invalid login payload.",
        },
        { status: 400 },
      )
    }

    const { getAdminAuth } = await import("@/lib/firebase/admin")
    const adminAuth = getAdminAuth()
    const decodedToken = await adminAuth.verifyIdToken(parsedBody.data.idToken)
    const email = decodedToken.email?.toLowerCase()

    if (!isAllowedAdminEmail(email)) {
      return NextResponse.json(
        {
          ok: false,
          error: "Access denied for this account.",
        },
        { status: 403 },
      )
    }

    const sessionCookie = await adminAuth.createSessionCookie(parsedBody.data.idToken, {
      expiresIn: getAdminSessionExpiresInMs(),
    })

    const response = NextResponse.json({ ok: true })
    response.cookies.set({
      name: getAdminSessionCookieName(),
      value: sessionCookie,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: getAdminSessionMaxAgeSeconds(),
    })

    return response
  } catch (error) {
    console.error("Failed to create admin session", error)
    return NextResponse.json(
      {
        ok: false,
        error: "Unable to sign in. Please try again.",
      },
      { status: 500 },
    )
  }
}
