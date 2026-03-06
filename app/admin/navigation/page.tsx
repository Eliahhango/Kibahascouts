import Link from "next/link"
import { redirect } from "next/navigation"
import { AdminBreadcrumbs } from "@/components/admin/admin-breadcrumbs"
import { NavigationSettingsManager } from "@/components/admin/navigation-settings-manager"
import { AdminAuthError, requireAdmin } from "@/lib/auth/require-admin"

export default async function AdminNavigationSettingsPage() {
  try {
    await requireAdmin("content:write")

    return (
      <main className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <header className="mb-6 flex flex-wrap items-start justify-between gap-4 rounded-xl border border-border bg-white p-5 shadow-sm">
          <div className="space-y-3">
            <AdminBreadcrumbs currentPage="Navigation" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">Navigation Settings</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Configure the website header navigation for desktop and mobile menus.
              </p>
            </div>
          </div>
          <Link href="/admin/navigation#navigation-editor" className="btn-primary">
            Add Nav Link
          </Link>
        </header>
        <NavigationSettingsManager />
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
