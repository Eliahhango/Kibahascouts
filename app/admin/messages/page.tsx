import { redirect } from "next/navigation"
import { AdminBreadcrumbs } from "@/components/admin/admin-breadcrumbs"
import { MessagesManager } from "@/components/admin/messages-manager"
import { AdminAuthError, requireAdmin } from "@/lib/auth/require-admin"

export default async function AdminMessagesPage() {
  try {
    await requireAdmin("messages:write")

    return (
      <main className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
        <header className="mb-6 space-y-3">
          <AdminBreadcrumbs currentPage="Messages" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Contact Inbox</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Review contact submissions and update response status.
            </p>
          </div>
        </header>
        <MessagesManager />
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
