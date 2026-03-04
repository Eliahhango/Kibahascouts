import { redirect } from "next/navigation"
import { AdminBreadcrumbs } from "@/components/admin/admin-breadcrumbs"
import { SecurityLogsBrowser } from "@/components/admin/security-logs-browser"
import { AdminAuthError, requireAdmin } from "@/lib/auth/require-admin"

export default async function AdminSecurityLogsPage() {
  try {
    await requireAdmin("admins:manage")

    return (
      <main className="mx-auto w-full max-w-6xl px-4 py-10">
        <header className="mb-6 space-y-3">
          <AdminBreadcrumbs currentPage="Security Logs" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Security Logs</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Full visitor, login, alert, audit, and block records.
            </p>
          </div>
        </header>
        <SecurityLogsBrowser />
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
