import { redirect } from "next/navigation"
import { AdminAuthError, requireAdmin } from "@/lib/auth/require-admin"

export default async function AdminHomePage() {
  try {
    const admin = await requireAdmin()

    return (
      <main className="mx-auto w-full max-w-6xl px-4 py-10">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-card-foreground">Admin Panel</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Signed in as <span className="font-medium text-foreground">{admin.email}</span>.
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            Dashboard modules will appear here as content tools are enabled.
          </p>

          <form action="/api/admin/logout" method="post" className="mt-6">
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-md border border-border px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-secondary"
            >
              Sign out
            </button>
          </form>
        </div>
      </main>
    )
  } catch (error) {
    if (error instanceof AdminAuthError) {
      redirect("/admin/login")
    }
    throw error
  }
}
