import { redirect } from "next/navigation"
import { ResourcesManager } from "@/components/admin/resources-manager"
import { AdminAuthError, requireAdmin } from "@/lib/auth/require-admin"

export default async function AdminResourcesPage() {
  try {
    await requireAdmin()

    return (
      <main className="mx-auto w-full max-w-6xl px-4 py-10">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Manage Resources</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Add or update resource metadata and external download URLs.
          </p>
        </header>
        <ResourcesManager />
      </main>
    )
  } catch (error) {
    if (error instanceof AdminAuthError) {
      redirect("/admin/login")
    }
    throw error
  }
}
