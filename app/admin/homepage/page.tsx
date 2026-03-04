import { redirect } from "next/navigation"
import { AdminBreadcrumbs } from "@/components/admin/admin-breadcrumbs"
import { HomepageSettingsManager } from "@/components/admin/homepage-settings-manager"
import { AdminAuthError, requireAdmin } from "@/lib/auth/require-admin"

export default async function AdminHomepageSettingsPage() {
  try {
    await requireAdmin("content:write")

    return (
      <main className="mx-auto w-full max-w-6xl px-4 py-10">
        <header className="mb-6 space-y-3">
          <AdminBreadcrumbs currentPage="Homepage" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Homepage Content Settings</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Configure District Snapshot and Priority Initiatives content shown on the public homepage.
            </p>
          </div>
        </header>
        <HomepageSettingsManager />
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
