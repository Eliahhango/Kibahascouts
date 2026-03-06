import { redirect } from "next/navigation"
import { AdminBreadcrumbs } from "@/components/admin/admin-breadcrumbs"
import { AdminUsersManager } from "@/components/admin/admin-users-manager"
import { AdminAuthError, requireAdmin } from "@/lib/auth/require-admin"

export default async function AdminUsersPage() {
  try {
    await requireAdmin("admins:manage")

    return (
      <main className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <header className="mb-4 space-y-3 sm:mb-6">
          <AdminBreadcrumbs currentPage="Admins" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Admin Access Management</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Add, remove, or update admin roles and status.
            </p>
          </div>
        </header>
        <AdminUsersManager />
      </main>
    )
  } catch (error) {
    if (error instanceof AdminAuthError) {
      if (error.status === 401) {
        redirect("/admin/login")
      }
    }
    throw error
  }
}
