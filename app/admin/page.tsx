import { Suspense } from "react"
import Link from "next/link"
import { CalendarDays, Clapperboard, Compass, FileText, Home, Inbox, Newspaper, PlusCircle, ShieldAlert } from "lucide-react"
import { AdminBreadcrumbs } from "@/components/admin/admin-breadcrumbs"
import { DashboardCards, DashboardCardsSkeleton } from "@/components/admin/dashboard-cards"
import { AdminLogoutButton } from "@/components/admin/admin-logout-button"
import { Button } from "@/components/ui/button"
import { AdminAuthError, requireAdmin } from "@/lib/auth/require-admin"
import { getAdminDashboardCounts } from "@/lib/firebase/admin-dashboard"
import { redirect } from "next/navigation"

async function DashboardCountsSection({ adminEmail }: { adminEmail: string }) {
  const counts = await getAdminDashboardCounts(adminEmail)

  const cards = [
    {
      title: "Published News",
      value: counts.publishedNews.value,
      description: "Public newsroom items currently published.",
      icon: Newspaper,
      error: counts.publishedNews.error,
    },
    {
      title: "Published Events",
      value: counts.publishedEvents.value,
      description: "Public events currently visible on the website.",
      icon: CalendarDays,
      error: counts.publishedEvents.error,
    },
    {
      title: "Published Resources",
      value: counts.publishedResources.value,
      description: "Public resource files and links currently published.",
      icon: FileText,
      error: counts.publishedResources.error,
    },
    {
      title: "Unread Messages",
      value: counts.unreadMessages.value,
      description: "Contact submissions still awaiting review.",
      icon: Inbox,
      error: counts.unreadMessages.error,
    },
  ]

  const hasErrors = cards.some((card) => Boolean(card.error))

  return (
    <>
      {hasErrors ? (
        <p className="mb-3 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          Some dashboard metrics are using fallback values because data fetches failed.
        </p>
      ) : null}
      <DashboardCards items={cards} />
    </>
  )
}

export default async function AdminHomePage() {
  try {
    const admin = await requireAdmin("dashboard:view")

    return (
      <main className="mx-auto w-full max-w-6xl px-4 py-10">
        <header className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-3">
              <AdminBreadcrumbs currentPage="Overview" />
              <div>
                <h1 className="text-2xl font-bold text-card-foreground">Admin Dashboard</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  Signed in as <span className="font-medium text-foreground">{admin.email}</span>.
                </p>
                <p className="mt-1 text-sm text-muted-foreground">Use this area to monitor content and incoming requests.</p>
              </div>
            </div>

            <AdminLogoutButton />
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <Button asChild size="sm">
              <Link href="/admin/events">
                <PlusCircle className="h-4 w-4" />
                Create New Event
              </Link>
            </Button>
            <Button asChild size="sm" variant="secondary">
              <Link href="/admin/news">
                <PlusCircle className="h-4 w-4" />
                Create News Item
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href="/admin/homepage">
                <Home className="h-4 w-4" />
                Edit Homepage Content
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href="/admin/navigation">
                <Compass className="h-4 w-4" />
                Edit Navigation
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href="/admin/resources">
                <PlusCircle className="h-4 w-4" />
                Add Resource
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href="/admin/media">
                <PlusCircle className="h-4 w-4" />
                Add Media
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href="/admin/security">
                <ShieldAlert className="h-4 w-4" />
                Security Center
              </Link>
            </Button>
          </div>
        </header>

        <section className="mt-6">
          <Suspense fallback={<DashboardCardsSkeleton />}>
            <DashboardCountsSection adminEmail={admin.email} />
          </Suspense>
        </section>

        <section className="mt-6 rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-card-foreground">Content Tools</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/news">Manage News</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/events">Manage Events</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/homepage">
                <Home className="h-4 w-4" />
                Homepage Settings
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/navigation">
                <Compass className="h-4 w-4" />
                Navigation Settings
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/resources">Manage Resources</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/media">
                <Clapperboard className="h-4 w-4" />
                Manage Media
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/messages">Contact Inbox</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/admins">Manage Admins</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/security">
                <ShieldAlert className="h-4 w-4" />
                Security Center
              </Link>
            </Button>
          </div>
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
