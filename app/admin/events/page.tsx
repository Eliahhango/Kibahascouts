import { redirect } from "next/navigation"
import { AdminBreadcrumbs } from "@/components/admin/admin-breadcrumbs"
import { EventsManager } from "@/components/admin/events-manager"
import { AdminAuthError, requireAdmin } from "@/lib/auth/require-admin"

export default async function AdminEventsPage() {
  try {
    await requireAdmin("content:write")

    return (
      <main className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
        <header className="mb-6 space-y-3">
          <AdminBreadcrumbs currentPage="Events" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Manage Events</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Maintain event details, registration links, and publish status.
            </p>
          </div>
        </header>
        <EventsManager />
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
