import { Suspense } from "react"
import Link from "next/link"
import {
  CalendarDays,
  Clapperboard,
  Compass,
  FileText,
  Home,
  Inbox,
  Newspaper,
  Settings2,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react"
import { AdminBreadcrumbs } from "@/components/admin/admin-breadcrumbs"
import { AdminDashboardGreeting } from "@/components/admin/admin-dashboard-greeting"
import { DashboardCards, DashboardCardsSkeleton } from "@/components/admin/dashboard-cards"
import { AdminLogoutButton } from "@/components/admin/admin-logout-button"
import { AdminAuthError, requireAdmin } from "@/lib/auth/require-admin"
import { getAdminDashboardCounts } from "@/lib/firebase/admin-dashboard"
import { redirect } from "next/navigation"

async function DashboardCountsSection({ adminEmail }: { adminEmail: string }) {
  const counts = await getAdminDashboardCounts(adminEmail)

  const cards = [
    {
      href: "/admin/news",
      title: "Published News",
      value: counts.publishedNews.value,
      description: "Public newsroom items currently published.",
      icon: Newspaper,
      accent: "purple" as const,
      error: counts.publishedNews.error,
    },
    {
      href: "/admin/events",
      title: "Published Events",
      value: counts.publishedEvents.value,
      description: "Public events currently visible on the website.",
      icon: CalendarDays,
      accent: "blue" as const,
      error: counts.publishedEvents.error,
    },
    {
      href: "/admin/resources",
      title: "Published Resources",
      value: counts.publishedResources.value,
      description: "Public resource files and links currently published.",
      icon: FileText,
      accent: "green" as const,
      error: counts.publishedResources.error,
    },
    {
      href: "/admin/messages",
      title: "Unread Messages",
      value: counts.unreadMessages.value,
      description: "Contact submissions still awaiting review.",
      icon: Inbox,
      accent: "amber" as const,
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
    const roleBadge = admin.role === "super_admin"
      ? { label: "Super Admin", className: "border-violet-200 bg-violet-100 text-violet-700" }
      : admin.role === "content_admin"
        ? { label: "Content Admin", className: "border-blue-200 bg-blue-100 text-blue-700" }
        : { label: "Viewer", className: "border-slate-200 bg-slate-100 text-slate-700" }

    const toolCards = [
      {
        href: "/admin/news",
        label: "News Manager",
        description: "Create and publish official district stories.",
        icon: Newspaper,
        iconTone: "bg-violet-100 text-violet-700",
      },
      {
        href: "/admin/events",
        label: "Events Calendar",
        description: "Manage upcoming events, details, and publishing.",
        icon: CalendarDays,
        iconTone: "bg-blue-100 text-blue-700",
      },
      {
        href: "/admin/resources",
        label: "Resources Library",
        description: "Upload or update forms, files, and links.",
        icon: FileText,
        iconTone: "bg-emerald-100 text-emerald-700",
      },
      {
        href: "/admin/media",
        label: "Media Center",
        description: "Maintain videos and gallery content for homepage.",
        icon: Clapperboard,
        iconTone: "bg-fuchsia-100 text-fuchsia-700",
      },
      {
        href: "/admin/messages",
        label: "Inbox",
        description: "Review and manage contact submissions.",
        icon: Inbox,
        iconTone: "bg-amber-100 text-amber-700",
      },
      {
        href: "/admin/homepage",
        label: "Homepage",
        description: "Edit featured sections and homepage highlights.",
        icon: Home,
        iconTone: "bg-indigo-100 text-indigo-700",
      },
      {
        href: "/admin/navigation",
        label: "Navigation",
        description: "Update header menus and navigation labels.",
        icon: Compass,
        iconTone: "bg-cyan-100 text-cyan-700",
      },
      {
        href: "/admin/site-content",
        label: "Site Content",
        description: "Update text content across public pages.",
        icon: Settings2,
        iconTone: "bg-slate-100 text-slate-700",
      },
      {
        href: "/admin/admins",
        label: "Admin Access",
        description: "Manage admin roles, invitations, and status.",
        icon: ShieldCheck,
        iconTone: "bg-purple-100 text-purple-700",
      },
      {
        href: "/admin/security",
        label: "Security Center",
        description: "Review logs, blocks, and threat alerts.",
        icon: ShieldAlert,
        iconTone: "bg-rose-100 text-rose-700",
      },
    ]

    return (
      <main className="mx-auto w-full max-w-6xl px-4 py-10">
        <header className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-3">
              <AdminBreadcrumbs currentPage="Overview" />
              <div>
                <h1 className="text-2xl font-bold text-card-foreground">Admin Dashboard</h1>
                <AdminDashboardGreeting email={admin.email} />
                <p className="mt-2 text-sm text-muted-foreground">
                  Signed in as <span className="font-medium text-foreground">{admin.email}</span>.
                </p>
                <div className="mt-2">
                  <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${roleBadge.className}`}>
                    {roleBadge.label}
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">Use this area to monitor content and incoming requests.</p>
              </div>
            </div>

            <AdminLogoutButton />
          </div>
        </header>

        <section className="mt-6">
          <Suspense fallback={<DashboardCardsSkeleton />}>
            <DashboardCountsSection adminEmail={admin.email} />
          </Suspense>
        </section>

        <hr className="mt-8 border-border/70" />

        <section className="mt-8 rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-card-foreground">Management Tools</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Access content, security, and communication modules from one place.
          </p>

          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
            {toolCards.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="rounded-xl border border-border bg-background p-4 transition-transform hover:-translate-y-0.5 hover:bg-secondary/30"
              >
                <span className={`inline-flex h-11 w-11 items-center justify-center rounded-lg ${tool.iconTone}`}>
                  <tool.icon className="h-6 w-6" />
                </span>
                <h3 className="mt-3 text-sm font-semibold text-card-foreground">{tool.label}</h3>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{tool.description}</p>
              </Link>
            ))}
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
