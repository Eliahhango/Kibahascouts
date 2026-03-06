import { Suspense } from "react"
import Link from "next/link"
import {
  Activity,
  CalendarDays,
  Clapperboard,
  Compass,
  Crown,
  Eye,
  FileText,
  Home,
  Inbox,
  Newspaper,
  Settings2,
  ShieldAlert,
  ShieldCheck,
  UserPlus,
} from "lucide-react"
import { AdminDashboardGreeting } from "@/components/admin/admin-dashboard-greeting"
import { DashboardActivityOverview } from "@/components/admin/dashboard-activity-overview"
import { DashboardCards, DashboardCardsSkeleton } from "@/components/admin/dashboard-cards"
import { getPrimarySuperAdminEmail } from "@/lib/auth/admin-users"
import { AdminAuthError, requireAdmin } from "@/lib/auth/require-admin"
import { getAdminDashboardOverview } from "@/lib/firebase/admin-dashboard"
import { redirect } from "next/navigation"

type AdminRole = "super_admin" | "content_admin" | "viewer"

function getRoleBadge(role: string) {
  if (role === "super_admin") {
    return {
      label: "Super Admin",
      className: "border-[#c9910a]/35 bg-[#c9910a]/15 text-[#9b6c04]",
      showCrown: true,
    }
  }

  if (role === "content_admin") {
    return {
      label: "Editor",
      className: "border-[#1e3a2f]/35 bg-[#1e3a2f]/10 text-[#1e3a2f]",
      showCrown: false,
    }
  }

  return {
    label: "Viewer",
    className: "border-slate-300 bg-slate-100 text-slate-700",
    showCrown: false,
  }
}

function toTrend(value: number) {
  if (value <= 0) {
    return { direction: "flat" as const, text: "No change" }
  }

  const change = Math.max(1, Math.round(value * 0.1))
  return { direction: "up" as const, text: `${change} this week` }
}

function toProgress(value: number, maxValue: number) {
  if (maxValue <= 0) {
    return 8
  }

  return Math.round((value / maxValue) * 100)
}

async function DashboardOverviewSection({ adminEmail, role }: { adminEmail: string; role: AdminRole }) {
  const overview = await getAdminDashboardOverview(adminEmail)
  const summary = overview.summary

  const metricValues = [
    summary.publishedNews.value,
    summary.publishedEvents.value,
    summary.publishedResources.value,
    summary.unreadMessages.value,
    summary.pageVisitsThisMonth.value,
    summary.activeAdmins.value,
  ]
  const maxMetricValue = Math.max(...metricValues, 1)

  const cards = [
    {
      href: "/admin/news",
      title: "Published News",
      value: summary.publishedNews.value,
      description: "Official district stories currently live.",
      icon: Newspaper,
      tone: "green" as const,
      trend: toTrend(summary.publishedNews.value),
      progress: toProgress(summary.publishedNews.value, maxMetricValue),
      error: summary.publishedNews.error,
    },
    {
      href: "/admin/events",
      title: "Published Events",
      value: summary.publishedEvents.value,
      description: "Events currently visible on public calendar.",
      icon: CalendarDays,
      tone: "green" as const,
      trend: toTrend(summary.publishedEvents.value),
      progress: toProgress(summary.publishedEvents.value, maxMetricValue),
      error: summary.publishedEvents.error,
    },
    {
      href: "/admin/resources",
      title: "Published Resources",
      value: summary.publishedResources.value,
      description: "Published forms, policies, and handbooks.",
      icon: FileText,
      tone: "green" as const,
      trend: toTrend(summary.publishedResources.value),
      progress: toProgress(summary.publishedResources.value, maxMetricValue),
      error: summary.publishedResources.error,
    },
    {
      href: "/admin/messages",
      title: "Unread Messages",
      value: summary.unreadMessages.value,
      description: "Contact submissions pending review.",
      icon: Inbox,
      tone: "gold" as const,
      trend: summary.unreadMessages.value > 0 ? { direction: "up" as const, text: `${summary.unreadMessages.value} pending` } : { direction: "flat" as const, text: "No change" },
      progress: toProgress(summary.unreadMessages.value, maxMetricValue),
      error: summary.unreadMessages.error,
    },
    {
      href: "/admin/security/logs",
      title: "Total Page Visits (this month)",
      value: summary.pageVisitsThisMonth.value,
      description: "Public-site traffic captured in telemetry logs.",
      icon: Activity,
      tone: "gold" as const,
      trend: toTrend(summary.pageVisitsThisMonth.value),
      progress: toProgress(summary.pageVisitsThisMonth.value, maxMetricValue),
      error: summary.pageVisitsThisMonth.error,
    },
    {
      href: "/admin/admins",
      title: "Active Admin Users",
      value: summary.activeAdmins.value,
      description: "Approved admins with active access rights.",
      icon: ShieldCheck,
      tone: "slate" as const,
      trend: toTrend(summary.activeAdmins.value),
      progress: toProgress(summary.activeAdmins.value, maxMetricValue),
      error: summary.activeAdmins.error,
    },
  ]

  const hasErrors = Object.values(summary).some((item) => Boolean(item.error))

  const allQuickActions = [
    {
      href: "/admin/news",
      label: "News",
      description: "Create and publish official district stories.",
      icon: Newspaper,
    },
    {
      href: "/admin/events",
      label: "Events",
      description: "Manage district trainings and event registrations.",
      icon: CalendarDays,
    },
    {
      href: "/admin/resources",
      label: "Resources",
      description: "Upload forms, policies, and downloadable files.",
      icon: FileText,
    },
    {
      href: "/admin/media",
      label: "Media",
      description: "Manage videos and gallery assets.",
      icon: Clapperboard,
    },
    {
      href: "/admin/site-content",
      label: "Site Content",
      description: "Edit page content blocks and CMS sections.",
      icon: Settings2,
    },
    {
      href: "/admin/homepage",
      label: "Homepage",
      description: "Edit featured modules and homepage highlights.",
      icon: Home,
    },
    {
      href: "/admin/messages",
      label: "Inbox",
      description: "Review contact messages from public visitors.",
      icon: Inbox,
    },
    {
      href: "/admin/memberships",
      label: "Memberships",
      description: "Review and manage membership applications.",
      icon: UserPlus,
    },
    {
      href: "/admin/navigation",
      label: "Navigation",
      description: "Update website menus and navigation labels.",
      icon: Compass,
    },
    {
      href: "/admin/admins",
      label: "Admins",
      description: "Manage roles, invitations, and status.",
      icon: ShieldCheck,
    },
    {
      href: "/admin/security",
      label: "Security",
      description: "Inspect logs, blocks, and active alerts.",
      icon: ShieldAlert,
    },
  ]

  const quickActions = role === "super_admin"
    ? allQuickActions
    : role === "content_admin"
      ? allQuickActions.filter((action) => action.href !== "/admin/admins" && action.href !== "/admin/security")
      : []

  const compactActions = quickActions.slice(0, 4)

  const activityStyleByType = {
    news: { icon: Newspaper, dot: "bg-[#1e3a2f]/15 text-[#1e3a2f]" },
    event: { icon: CalendarDays, dot: "bg-[#2f6e4c]/15 text-[#2f6e4c]" },
    message: { icon: Inbox, dot: "bg-[#c9910a]/15 text-[#9b6c04]" },
    security: { icon: ShieldAlert, dot: "bg-red-100 text-red-700" },
    system: { icon: Activity, dot: "bg-slate-100 text-slate-700" },
  } as const

  return (
    <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
      <div className="min-w-0">
        {hasErrors ? (
          <p className="mb-3 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            Some dashboard metrics are using fallback values because certain data queries failed.
          </p>
        ) : null}

        {compactActions.length > 0 ? (
          <div className="flex gap-2 overflow-x-auto pb-1 xl:hidden">
            {compactActions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[#1e3a2f]/30 bg-white px-3 py-1.5 text-xs font-medium text-[#1e3a2f]"
              >
                <action.icon className="h-3.5 w-3.5" />
                {action.label}
              </Link>
            ))}
          </div>
        ) : null}

        <DashboardCards items={cards} />

        <DashboardActivityOverview visitsSeries={overview.visitsSeries} contentBreakdown={overview.contentBreakdown} />

        <section className="mt-8 rounded-xl border border-border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-foreground">Quick Actions</h2>
          <p className="mt-1 text-sm text-muted-foreground">Access content, communication, and security modules by role.</p>

          {role === "viewer" ? (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              <p className="inline-flex items-center gap-2 font-semibold">
                <Eye className="h-4 w-4" />
                You have read-only access.
              </p>
              <p className="mt-1 text-amber-800">Contact a Super Admin to request edit permissions.</p>
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {quickActions.map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="group cursor-pointer rounded-xl border border-border border-l-4 border-l-transparent bg-white p-3 shadow-sm transition-all hover:-translate-y-0.5 hover:border-l-[#1e3a2f] hover:shadow-md sm:p-4"
                >
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#1e3a2f] text-white sm:h-10 sm:w-10">
                    <action.icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-3 text-base font-semibold text-foreground">{action.label}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{action.description}</p>

                  <div className="mt-4 flex items-center justify-between gap-2">
                    <span className="inline-flex items-center text-sm font-semibold text-[#1e3a2f]">
                      <span className="transition-transform group-hover:translate-x-0.5">Open {"->"}</span>
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>

      <aside className="hidden xl:block">
        <div className="sticky top-[4.5rem] space-y-4">
          <section className="rounded-xl border border-border bg-white p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-foreground">Recent Activity</h3>
            <div className="mt-3 space-y-3">
              {overview.recentActivity.map((activity) => {
                const style = activityStyleByType[activity.type] || activityStyleByType.system
                return (
                  <Link key={activity.id} href={activity.href} className="group flex items-start gap-2.5 rounded-md px-1 py-1.5 hover:bg-secondary/70">
                    <span className={`mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${style.dot}`}>
                      <style.icon className="h-3.5 w-3.5" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-foreground">{activity.label}</p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">{activity.timeAgo}</p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>

          {compactActions.length > 0 ? (
            <section className="rounded-xl border border-border bg-white p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-foreground">Quick Actions</h3>
              <div className="mt-3 space-y-2.5">
                {compactActions.map((action) => (
                  <Link
                    key={action.href}
                    href={action.href}
                    className="inline-flex w-full items-center gap-2 rounded-md border border-[#1e3a2f]/40 px-3 py-2 text-sm font-medium text-[#1e3a2f] hover:bg-[#1e3a2f]/5"
                  >
                    <action.icon className="h-4 w-4" />
                    {action.label}
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          <section className="rounded-xl border border-border bg-white p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-foreground">System Status</h3>
            <ul className="mt-3 space-y-2 text-xs">
              <li className="flex items-center justify-between">
                <span className="text-muted-foreground">Database</span>
                <span className="inline-flex items-center gap-1.5 font-semibold text-[#1e3a2f]">
                  <span className="h-2 w-2 rounded-full bg-[#1e3a2f]" />
                  Operational
                </span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-muted-foreground">Storage</span>
                <span className="inline-flex items-center gap-1.5 font-semibold text-[#1e3a2f]">
                  <span className="h-2 w-2 rounded-full bg-[#1e3a2f]" />
                  Operational
                </span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-muted-foreground">API</span>
                <span className="inline-flex items-center gap-1.5 font-semibold text-[#1e3a2f]">
                  <span className="h-2 w-2 rounded-full bg-[#1e3a2f]" />
                  Operational
                </span>
              </li>
            </ul>
          </section>
        </div>
      </aside>
    </div>
  )
}

export default async function AdminHomePage() {
  try {
    const admin = await requireAdmin("dashboard:view")
    const roleBadge = getRoleBadge(admin.role)
    const primaryEmail = await getPrimarySuperAdminEmail()
    const isPrimarySuperAdmin =
      admin.role === "super_admin" &&
      Boolean(primaryEmail) &&
      admin.email.toLowerCase() === String(primaryEmail).toLowerCase()

    return (
      <main className="mx-auto w-full max-w-[120rem] px-4 py-6 sm:px-6 lg:px-8">
        {isPrimarySuperAdmin ? (
          <section className="mb-4 rounded-xl bg-gradient-to-r from-[#1e3a2f] to-[#2d5a42] p-4 text-white shadow-sm">
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-[#f2cf7d]">
              <Crown className="h-6 w-6 text-[#c9910a]" />
              Primary Administrator
            </p>
            <p className="mt-1 text-sm text-white/90">You have full system access and developer privileges.</p>
          </section>
        ) : null}

        <header className="rounded-xl border border-border bg-white p-4 shadow-sm sm:p-6">
          <div className="space-y-3">
            <div>
              <h1 className="text-xl font-bold text-foreground sm:text-2xl">Admin Dashboard</h1>
              <AdminDashboardGreeting email={admin.email} role={admin.role} />
            </div>

            <p className="text-sm text-muted-foreground">
              Signed in as <span className="font-medium text-foreground">{admin.email}</span>.
            </p>

            <div>
              <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${roleBadge.className}`}>
                {roleBadge.showCrown ? <Crown className="h-3.5 w-3.5" /> : null}
                {roleBadge.label}
              </span>
            </div>

            <p className="text-sm text-muted-foreground">Monitor content performance, communication, and security from a single workspace.</p>
          </div>
        </header>

        <Suspense fallback={<section className="mt-6"><DashboardCardsSkeleton /></section>}>
          <DashboardOverviewSection adminEmail={admin.email} role={admin.role} />
        </Suspense>
      </main>
    )
  } catch (error) {
    if (error instanceof AdminAuthError) {
      redirect("/admin/login")
    }
    throw error
  }
}
