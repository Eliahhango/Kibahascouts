import { redirect } from "next/navigation"
import { AdminRegisterForm } from "./admin-register-form"
import { AdminAuthError, requireAdmin } from "@/lib/auth/require-admin"

type AdminRegisterPageProps = {
  searchParams: Promise<{ next?: string; email?: string; invite?: string }>
}

export default async function AdminRegisterPage({ searchParams }: AdminRegisterPageProps) {
  const params = await searchParams
  const nextPath = params.next?.startsWith("/admin") ? params.next : "/admin"
  const defaultEmail = params.email?.trim().toLowerCase() || ""
  const defaultInviteId = params.invite?.trim() || ""

  try {
    await requireAdmin()
    redirect(nextPath)
  } catch (error) {
    if (!(error instanceof AdminAuthError)) {
      throw error
    }
  }

  return <AdminRegisterForm nextPath={nextPath} defaultEmail={defaultEmail} defaultInviteId={defaultInviteId} inviteOnly />
}
