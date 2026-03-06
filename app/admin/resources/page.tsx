import { redirect } from "next/navigation"
import { AdminBreadcrumbs } from "@/components/admin/admin-breadcrumbs"
import { ResourcesManager } from "@/components/admin/resources-manager"
import { AdminAuthError, requireAdmin } from "@/lib/auth/require-admin"

export default async function AdminResourcesPage() {
  try {
    await requireAdmin("content:write")

    return (
      <main className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <header className="mb-4 space-y-3 sm:mb-6">
          <AdminBreadcrumbs currentPage="Resources" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Manage Resources</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Add or update resource metadata and external download URLs.
            </p>
          </div>
        </header>
        <ResourcesManager />
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
