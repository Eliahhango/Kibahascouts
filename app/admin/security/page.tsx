import { redirect } from "next/navigation"
import { AdminBreadcrumbs } from "@/components/admin/admin-breadcrumbs"
import { SecurityCenter } from "@/components/admin/security-center"
import { AdminAuthError, requireAdmin } from "@/lib/auth/require-admin"

export default async function AdminSecurityPage() {
  try {
    await requireAdmin("admins:manage")

    return (
      <main className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <header className="mb-4 space-y-3 sm:mb-6">
          <AdminBreadcrumbs currentPage="Security" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Security Center</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Monitor visitor traffic, login threats, audit events, and enforce blocking rules.
            </p>
          </div>
        </header>
        <SecurityCenter />
      </main>
    )
  } catch (error) {
    if (error instanceof AdminAuthError) {
      if (error.status === 401) {
        redirect("/admin/login")
      }

      if (error.status === 403) {
        redirect("/admin")
      }
    }

    throw error
  }
}
