import { redirect } from "next/navigation"
import { CalendarDays, FileText, Inbox, Newspaper } from "lucide-react"
import { DashboardCards } from "@/components/admin/dashboard-cards"
import { AdminAuthError, requireAdmin } from "@/lib/auth/require-admin"
import { getAdminDashboardCounts } from "@/lib/firebase/admin-dashboard"

export default async function AdminHomePage() {
  try {
    const admin = await requireAdmin()
    const counts = await getAdminDashboardCounts()

    const cards = [
      {
        title: "Published News",
        value: counts.publishedNews,
        description: "Public newsroom items currently published.",
        icon: Newspaper,
      },
      {
        title: "Published Events",
        value: counts.publishedEvents,
        description: "Public events currently visible on the website.",
        icon: CalendarDays,
      },
      {
        title: "Published Resources",
        value: counts.publishedResources,
        description: "Public resource files and links currently published.",
        icon: FileText,
      },
      {
        title: "Unread Messages",
        value: counts.unreadMessages,
        description: "Contact submissions still awaiting review.",
        icon: Inbox,
      },
    ]

    return (
      <main className="mx-auto w-full max-w-6xl px-4 py-10">
        <header className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-card-foreground">Admin Dashboard</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Signed in as <span className="font-medium text-foreground">{admin.email}</span>.
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            Use this area to monitor published content and incoming contact requests.
          </p>

          <form action="/api/admin/logout" method="post" className="mt-5">
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-md border border-border px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-secondary"
            >
              Sign out
            </button>
          </form>
        </header>

        <section className="mt-6">
          <DashboardCards items={cards} />
        </section>
      </main>
    )
  } catch (error) {
    if (error instanceof AdminAuthError) {
      redirect("/admin/login")
    }
    throw error
  }
}
