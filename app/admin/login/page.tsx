import { redirect } from "next/navigation"
import { AdminLoginForm } from "./admin-login-form"
import { AdminAuthError, requireAdmin } from "@/lib/auth/require-admin"

type AdminLoginPageProps = {
  searchParams: Promise<{ next?: string; email?: string }>
}

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  const params = await searchParams
  const nextPath = params.next?.startsWith("/admin") ? params.next : "/admin"
  const defaultEmail = params.email?.trim().toLowerCase() || ""

  try {
    await requireAdmin()
    redirect(nextPath)
  } catch (error) {
    if (!(error instanceof AdminAuthError)) {
      throw error
    }
  }

  return <AdminLoginForm nextPath={nextPath} defaultEmail={defaultEmail} />
}
