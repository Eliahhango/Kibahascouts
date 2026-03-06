import Link from "next/link"
import { redirect } from "next/navigation"
import { AdminBreadcrumbs } from "@/components/admin/admin-breadcrumbs"
import { MessagesManager } from "@/components/admin/messages-manager"
import { AdminAuthError, requireAdmin } from "@/lib/auth/require-admin"

export default async function AdminMessagesPage() {
  try {
    const admin = await requireAdmin("messages:read")
    const isReadOnly = admin.role === "viewer"

    return (
      <main className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <header className="mb-6 flex flex-wrap items-start justify-between gap-4 rounded-xl border border-border bg-white p-5 shadow-sm">
          <div className="space-y-3">
            <AdminBreadcrumbs currentPage="Messages" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">Contact Inbox</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Review contact submissions and update response status.
              </p>
            </div>
          </div>
          {!isReadOnly ? (
            <Link href="/admin/messages#inbox-list" className="btn-primary">
              Review Inbox
            </Link>
          ) : null}
        </header>
        <MessagesManager isReadOnly={isReadOnly} />
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
