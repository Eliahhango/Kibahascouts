import { redirect } from "next/navigation"
import { AdminBreadcrumbs } from "@/components/admin/admin-breadcrumbs"
import { MediaManager } from "@/components/admin/media-manager"
import { AdminAuthError, requireAdmin } from "@/lib/auth/require-admin"

export default async function AdminMediaPage() {
  try {
    await requireAdmin("content:write")

    return (
      <main className="mx-auto w-full max-w-6xl px-4 py-10">
        <header className="mb-6 space-y-3">
          <AdminBreadcrumbs currentPage="Media" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Manage Videos & Gallery</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Create, update, publish, and remove media cards shown on the homepage.
            </p>
          </div>
        </header>
        <MediaManager />
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
