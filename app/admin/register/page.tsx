import { redirect } from "next/navigation"
import { AdminRegisterForm } from "./admin-register-form"
import { AdminAuthError, requireAdmin } from "@/lib/auth/require-admin"

type AdminRegisterPageProps = {
  searchParams: Promise<{ next?: string }>
}

export default async function AdminRegisterPage({ searchParams }: AdminRegisterPageProps) {
  const params = await searchParams
  const nextPath = params.next?.startsWith("/admin") ? params.next : "/admin"

  try {
    await requireAdmin()
    redirect(nextPath)
  } catch (error) {
    if (!(error instanceof AdminAuthError)) {
      throw error
    }
  }

  return <AdminRegisterForm nextPath={nextPath} inviteOnly />
}
