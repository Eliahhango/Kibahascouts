import { redirect } from "next/navigation"
import { NewsManager } from "@/components/admin/news-manager"
import { AdminAuthError, requireAdmin } from "@/lib/auth/require-admin"

export default async function AdminNewsPage() {
  try {
    await requireAdmin()

    return (
      <main className="mx-auto w-full max-w-6xl px-4 py-10">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Manage News</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create, update, publish, and remove newsroom content.
          </p>
        </header>
        <NewsManager />
      </main>
    )
  } catch (error) {
    if (error instanceof AdminAuthError) {
      redirect("/admin/login")
    }
    throw error
  }
}
