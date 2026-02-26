import { redirect } from "next/navigation"
import { EventsManager } from "@/components/admin/events-manager"
import { AdminAuthError, requireAdmin } from "@/lib/auth/require-admin"

export default async function AdminEventsPage() {
  try {
    await requireAdmin()

    return (
      <main className="mx-auto w-full max-w-6xl px-4 py-10">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Manage Events</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Maintain event details, registration links, and publish status.
          </p>
        </header>
        <EventsManager />
      </main>
    )
  } catch (error) {
    if (error instanceof AdminAuthError) {
      redirect("/admin/login")
    }
    throw error
  }
}
