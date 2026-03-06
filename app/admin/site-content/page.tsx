import Link from "next/link"
import { redirect } from "next/navigation"
import { AdminBreadcrumbs } from "@/components/admin/admin-breadcrumbs"
import { SiteContentManager } from "@/components/admin/site-content-manager"
import { AdminAuthError, requireAdmin } from "@/lib/auth/require-admin"

export default async function AdminSiteContentPage() {
  try {
    await requireAdmin("content:write")

    return (
      <main className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <header className="mb-6 flex flex-wrap items-start justify-between gap-4 rounded-xl border border-border bg-white p-5 shadow-sm">
          <div className="space-y-3">
            <AdminBreadcrumbs currentPage="Site Content" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">Site Content Settings</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Edit public page content for sections linked from the website navigation.
              </p>
            </div>
          </div>
          <Link href="/admin/site-content#site-content-editor" className="btn-primary">
            Edit Content Blocks
          </Link>
        </header>
        <SiteContentManager />
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
