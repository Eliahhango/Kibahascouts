import { redirect } from "next/navigation"
import { AdminBreadcrumbs } from "@/components/admin/admin-breadcrumbs"
import { NewsManager } from "@/components/admin/news-manager"
import { AdminAuthError, requireAdmin } from "@/lib/auth/require-admin"

export default async function AdminNewsPage() {
  try {
    await requireAdmin("content:write")

    return (
      <main className="mx-auto w-full max-w-6xl px-4 py-10">
        <header className="mb-6 space-y-3">
          <AdminBreadcrumbs currentPage="News" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Manage News</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Create, update, publish, and remove newsroom content.
            </p>
          </div>
        </header>
        <NewsManager />
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
