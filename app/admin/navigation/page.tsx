import { redirect } from "next/navigation"
import { AdminBreadcrumbs } from "@/components/admin/admin-breadcrumbs"
import { NavigationSettingsManager } from "@/components/admin/navigation-settings-manager"
import { AdminAuthError, requireAdmin } from "@/lib/auth/require-admin"

export default async function AdminNavigationSettingsPage() {
  try {
    await requireAdmin("content:write")

    return (
      <main className="mx-auto w-full max-w-6xl px-4 py-10">
        <header className="mb-6 space-y-3">
          <AdminBreadcrumbs currentPage="Navigation" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Navigation Settings</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Configure the website header navigation for desktop and mobile menus.
            </p>
          </div>
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
