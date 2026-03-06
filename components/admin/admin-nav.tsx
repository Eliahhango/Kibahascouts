"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"
import type { ComponentType } from "react"
import {
  Bell,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clapperboard,
  Compass,
  ExternalLink,
  FileText,
  Globe,
  Home,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  Newspaper,
  Search,
  Settings,
  Settings2,
  ShieldAlert,
  ShieldCheck,
  UserPlus,
  UserRound,
} from "lucide-react"
import { signOut } from "firebase/auth"
import { adminFetch } from "@/lib/auth/admin-fetch"
import { getFirebaseClientAuth } from "@/lib/firebase/client"
import { siteConfig } from "@/lib/site-config"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Kbd } from "@/components/ui/kbd"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"

type SessionResponse = {
  ok?: boolean
  data?: {
    email?: string
    role?: string
  }
}

type DashboardSummaryResponse = {
  ok?: boolean
  data?: {
    unreadMessages?: number
    securityAlerts?: number
    pendingInvites?: number
    pendingMembershipApplications?: number
  }
}

type AdminNavItem = {
  href: string
  label: string
  icon: ComponentType<{ className?: string }>
  section: "content" | "communication" | "security"
  shortLabel?: string
  match: (pathname: string) => boolean
}

const adminNavItems: AdminNavItem[] = [
  {
    href: "/admin",
    label: "Overview",
    shortLabel: "Home",
    icon: LayoutDashboard,
    section: "content",
    match: (pathname) => pathname === "/admin",
  },
  {
    href: "/admin/news",
    label: "News",
    icon: Newspaper,
    section: "content",
    match: (pathname) => pathname.startsWith("/admin/news"),
  },
  {
    href: "/admin/events",
    label: "Events",
    icon: CalendarDays,
    section: "content",
    match: (pathname) => pathname.startsWith("/admin/events"),
  },
  {
    href: "/admin/resources",
    label: "Resources",
    icon: FileText,
    section: "content",
    match: (pathname) => pathname.startsWith("/admin/resources"),
  },
  {
    href: "/admin/media",
    label: "Media",
    icon: Clapperboard,
    section: "content",
    match: (pathname) => pathname.startsWith("/admin/media"),
  },
  {
    href: "/admin/site-content",
    label: "Site Content",
    icon: Settings2,
    section: "content",
    match: (pathname) => pathname.startsWith("/admin/site-content"),
  },
  {
    href: "/admin/homepage",
    label: "Homepage",
    icon: Home,
    section: "content",
    match: (pathname) => pathname.startsWith("/admin/homepage"),
  },
  {
    href: "/admin/messages",
    label: "Inbox",
    icon: Inbox,
    section: "communication",
    match: (pathname) => pathname.startsWith("/admin/messages"),
  },
  {
    href: "/admin/memberships",
    label: "Memberships",
    shortLabel: "Members",
    icon: UserPlus,
    section: "communication",
    match: (pathname) => pathname.startsWith("/admin/memberships"),
  },
  {
    href: "/admin/navigation",
    label: "Navigation",
    icon: Compass,
    section: "communication",
    match: (pathname) => pathname.startsWith("/admin/navigation"),
  },
  {
    href: "/admin/admins",
    label: "Admins",
    icon: ShieldCheck,
    section: "security",
    match: (pathname) => pathname.startsWith("/admin/admins"),
  },
  {
    href: "/admin/security",
    label: "Security Center",
    icon: ShieldAlert,
    section: "security",
    match: (pathname) => pathname.startsWith("/admin/security"),
  },
]

const compactMobileTabs = ["/admin", "/admin/news", "/admin/events", "/admin/messages", "/admin/security"] as const

const topLevelLabelBySegment: Record<string, string> = {
  admins: "Admins",
  events: "Events",
  homepage: "Homepage",
  media: "Media",
  memberships: "Memberships",
  messages: "Inbox",
  navigation: "Navigation",
  news: "News",
  resources: "Resources",
  security: "Security Center",
  "site-content": "Site Content",
}

const nestedLabelBySegment: Record<string, string> = {
  logs: "Logs",
}

function formatRoleLabel(role: string | undefined) {
  if (role === "super_admin") return "Super Admin"
  if (role === "content_admin") return "Editor"
  if (role === "viewer") return "Viewer"
  return "Admin"
}

function formatNameFromEmail(email: string | undefined) {
  if (!email) return "Admin User"
  const base = email.split("@")[0] || ""
  return base
    .split(/[.\-_]/g)
    .filter(Boolean)
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(" ")
}

function getBreadcrumb(pathname: string) {
  if (pathname === "/admin") {
    return "Dashboard / Overview"
  }

  const segments = pathname.split("/").filter(Boolean)
  const first = segments[1]
  const second = segments[2]
  const firstLabel = topLevelLabelBySegment[first || ""] || "Dashboard"
  const secondLabel = nestedLabelBySegment[second || ""] || (second ? second.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "")

  if (secondLabel) {
    return `Dashboard / ${firstLabel} / ${secondLabel}`
  }

  return `Dashboard / ${firstLabel}`
}

function SidebarNavItem({
  item,
  pathname,
  collapsed,
  unreadMessages,
  pendingMembershipApplications,
}: {
  item: AdminNavItem
  pathname: string
  collapsed: boolean
  unreadMessages: number
  pendingMembershipApplications: number
}) {
  const active = item.match(pathname)
  const badgeCount = item.href === "/admin/messages"
    ? unreadMessages
    : item.href === "/admin/memberships"
      ? pendingMembershipApplications
      : 0

  return (
    <Link
      href={item.href}
      title={collapsed ? item.label : undefined}
      className={cn(
        "group relative flex h-11 items-center gap-3 rounded-md border-l-4 px-3 text-sm font-medium transition-all",
        collapsed ? "justify-center px-0" : "",
        active
          ? "border-[#c9910a] bg-[#1e3a2f] text-white"
          : "border-transparent text-slate-300 hover:bg-[#1e3a2f] hover:text-white",
      )}
      aria-current={active ? "page" : undefined}
    >
      <item.icon className="h-4 w-4 shrink-0" />
      {!collapsed ? <span className="truncate">{item.label}</span> : null}
      {badgeCount > 0 ? (
        <span
          className={cn(
            "inline-flex items-center rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-semibold leading-none text-white",
            collapsed ? "absolute -right-1 -top-1 min-w-[1.1rem] justify-center px-1.5" : "ml-auto",
          )}
        >
          {badgeCount > 99 ? "99+" : badgeCount}
        </span>
      ) : null}
    </Link>
  )
}

export function AdminNav() {
  const pathname = usePathname()
  const hideAdminNav = pathname === "/admin/login" || pathname === "/admin/register"
  const [session, setSession] = useState<{ email: string; role: string } | null>(null)
  const [collapsed, setCollapsed] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [summary, setSummary] = useState({
    unreadMessages: 0,
    securityAlerts: 0,
    pendingInvites: 0,
    pendingMembershipApplications: 0,
  })
  const searchInputRef = useRef<HTMLInputElement>(null)

  const contentItems = useMemo(() => adminNavItems.filter((item) => item.section === "content"), [])
  const communicationItems = useMemo(() => adminNavItems.filter((item) => item.section === "communication"), [])
  const securityItems = useMemo(() => adminNavItems.filter((item) => item.section === "security"), [])

  useEffect(() => {
    const width = collapsed ? "64px" : "240px"
    document.documentElement.style.setProperty("--admin-sidebar-width", width)

    return () => {
      document.documentElement.style.setProperty("--admin-sidebar-width", "240px")
    }
  }, [collapsed])

  useEffect(() => {
    if (hideAdminNav) {
      return
    }

    let canceled = false

    const loadSession = async () => {
      try {
        const response = await fetch("/api/admin/session", { method: "GET", cache: "no-store" })
        if (!response.ok) {
          return
        }

        const payload = (await response.json().catch(() => null)) as SessionResponse | null
        if (!payload?.ok || !payload.data?.email) {
          return
        }

        if (!canceled) {
          setSession({
            email: payload.data.email,
            role: payload.data.role || "viewer",
          })
        }
      } catch {
        // Keep fallback UI if session fetch fails.
      }
    }

    void loadSession()

    return () => {
      canceled = true
    }
  }, [hideAdminNav])

  useEffect(() => {
    if (hideAdminNav) {
      return
    }

    let canceled = false

    const loadSummary = async () => {
      try {
        const response = await fetch("/api/admin/dashboard-summary", {
          method: "GET",
          cache: "no-store",
        })
        if (!response.ok) {
          return
        }

        const payload = (await response.json().catch(() => null)) as DashboardSummaryResponse | null
        if (!payload?.ok || !payload.data) {
          return
        }

        if (!canceled) {
          setSummary({
            unreadMessages: Number(payload.data.unreadMessages || 0),
            securityAlerts: Number(payload.data.securityAlerts || 0),
            pendingInvites: Number(payload.data.pendingInvites || 0),
            pendingMembershipApplications: Number(payload.data.pendingMembershipApplications || 0),
          })
        }
      } catch {
        // Keep zero badges if summary fails.
      }
    }

    void loadSummary()
    const interval = window.setInterval(() => {
      void loadSummary()
    }, 45_000)

    return () => {
      canceled = true
      window.clearInterval(interval)
    }
  }, [hideAdminNav])

  useEffect(() => {
    setDrawerOpen(false)
  }, [pathname])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        searchInputRef.current?.focus()
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  async function handleSignOut() {
    if (isSigningOut) {
      return
    }

    const confirmed = window.confirm("Sign out from Kibaha Scouts CMS?")
    if (!confirmed) {
      return
    }

    setIsSigningOut(true)

    try {
      await adminFetch("/api/admin/logout", { method: "POST" })
    } finally {
      try {
        await signOut(getFirebaseClientAuth())
      } catch {
        // Continue redirect even when local auth cache is unavailable.
      }

      window.location.assign("/admin/login")
      setIsSigningOut(false)
    }
  }

  if (hideAdminNav) {
    return null
  }

  const avatarInitial = (session?.email || "admin").charAt(0).toUpperCase()
  const displayName = formatNameFromEmail(session?.email)
  const roleLabel = formatRoleLabel(session?.role)
  const breadcrumbLabel = getBreadcrumb(pathname)
  const hasAlerts = summary.unreadMessages > 0 ||
    summary.securityAlerts > 0 ||
    summary.pendingInvites > 0 ||
    summary.pendingMembershipApplications > 0
  const compactTabItems = compactMobileTabs
    .map((href) => adminNavItems.find((item) => item.href === href))
    .filter((item): item is AdminNavItem => Boolean(item))

  return (
    <>
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 hidden border-r border-white/10 bg-[#0f1923] text-white lg:flex lg:flex-col",
          collapsed ? "w-16" : "w-[240px]",
        )}
      >
        <div className={cn("relative border-b border-white/10 px-3 py-4", collapsed ? "px-2.5" : "px-4")}>
          <button
            type="button"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={() => setCollapsed((current) => !current)}
            className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-md border border-white/15 text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>

          <Link href="/admin" className={cn("flex items-center gap-3 rounded-md", collapsed ? "justify-center" : "")}>
            <div className="relative h-9 w-9 overflow-hidden rounded-full border border-[#c9910a]/70" aria-hidden="true">
              <Image src={siteConfig.branding.primaryLogo} alt="" fill sizes="36px" className="object-cover" />
            </div>
            {!collapsed ? (
              <div className="min-w-0">
                <p className="truncate text-[11px] font-semibold uppercase tracking-[0.18em] text-[#c9910a]">
                  Kibaha Scouts CMS
                </p>
                <p className="truncate text-xs text-slate-300">District Admin Console</p>
              </div>
            ) : null}
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-3">
          <div className="space-y-5">
            <section>
              {!collapsed ? <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Content</p> : null}
              <div className="mt-2 space-y-1">
                {contentItems.map((item) => (
                  <SidebarNavItem
                    key={item.href}
                    item={item}
                    pathname={pathname}
                    collapsed={collapsed}
                    unreadMessages={summary.unreadMessages}
                    pendingMembershipApplications={summary.pendingMembershipApplications}
                  />
                ))}
              </div>
            </section>

            <section>
              {!collapsed ? <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Communication</p> : null}
              <div className="mt-2 space-y-1">
                {communicationItems.map((item) => (
                  <SidebarNavItem
                    key={item.href}
                    item={item}
                    pathname={pathname}
                    collapsed={collapsed}
                    unreadMessages={summary.unreadMessages}
                    pendingMembershipApplications={summary.pendingMembershipApplications}
                  />
                ))}
              </div>
            </section>

            <section>
              {!collapsed ? <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Access &amp; Security</p> : null}
              <div className="mt-2 space-y-1">
                {securityItems.map((item) => (
                  <SidebarNavItem
                    key={item.href}
                    item={item}
                    pathname={pathname}
                    collapsed={collapsed}
                    unreadMessages={summary.unreadMessages}
                    pendingMembershipApplications={summary.pendingMembershipApplications}
                  />
                ))}
              </div>
            </section>
          </div>
        </nav>

        <div className={cn("border-t border-white/10", collapsed ? "p-2.5" : "p-4")}>
          <div className={cn("rounded-lg bg-white/5", collapsed ? "p-2" : "p-3")}>
            <div className={cn("flex items-center gap-3", collapsed ? "justify-center" : "")}>
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#1e3a2f] text-sm font-semibold text-white">
                {avatarInitial}
              </span>
              {!collapsed ? (
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">{displayName}</p>
                  <span className="mt-0.5 inline-flex rounded-full border border-[#c9910a]/40 bg-[#c9910a]/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#f2cf7d]">
                    {roleLabel}
                  </span>
                </div>
              ) : null}
            </div>

            <button
              type="button"
              title="Sign out"
              disabled={isSigningOut}
              onClick={handleSignOut}
              className={cn(
                "mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md border border-red-500/60 px-3 py-2 text-xs font-semibold text-red-300 transition hover:bg-red-500/10 disabled:opacity-60",
                collapsed ? "px-0" : "",
              )}
            >
              <LogOut className="h-4 w-4" />
              {!collapsed ? (isSigningOut ? "Signing out..." : "Sign Out") : null}
            </button>
          </div>
        </div>
      </aside>

      <header className="fixed inset-x-0 top-0 z-40 h-14 border-b border-border bg-white lg:left-[var(--admin-sidebar-width)]">
        <div className="flex h-full items-center gap-3 px-3 sm:px-4 lg:px-6">
          <button
            type="button"
            title="Open navigation menu"
            onClick={() => setDrawerOpen(true)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border text-foreground lg:hidden"
          >
            <Menu className="h-4 w-4" />
          </button>

          <div className="min-w-0 flex-1 sm:flex-none">
            <p className="truncate text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{breadcrumbLabel}</p>
          </div>

          <div className="hidden flex-1 sm:block">
            <label className="mx-auto flex max-w-xl items-center gap-2 rounded-lg border border-border bg-[#f8fafb] px-3 py-1.5 text-sm">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                ref={searchInputRef}
                type="search"
                placeholder="Search content, events, users..."
                className="h-7 w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
              <Kbd className="hidden md:inline-flex">Cmd+K</Kbd>
            </label>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              title="Alerts"
              className="relative inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-foreground transition hover:bg-secondary"
            >
              <Bell className="h-4 w-4" />
              {hasAlerts ? <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" /> : null}
            </button>

            <Link
              href="/"
              target="_blank"
              rel="noreferrer"
              className="hidden items-center gap-1.5 rounded-md border border-border px-2.5 py-2 text-xs font-semibold text-foreground transition hover:bg-secondary sm:inline-flex"
            >
              <Globe className="h-3.5 w-3.5" />
              Public Website
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  title="Account menu"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-secondary/50 text-sm font-semibold text-foreground"
                >
                  {avatarInitial}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="truncate text-sm font-semibold text-foreground">{displayName}</p>
                  <p className="truncate text-xs text-muted-foreground">{session?.email || "admin@kibahascouts.site"}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">
                  <UserRound className="h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/admin/site-content" className="cursor-pointer">
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  className="cursor-pointer"
                  onSelect={(event) => {
                    event.preventDefault()
                    void handleSignOut()
                  }}
                >
                  <LogOut className="h-4 w-4" />
                  {isSigningOut ? "Signing out..." : "Sign Out"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent side="left" className="w-[85vw] max-w-[20rem] border-r border-white/10 bg-[#0f1923] p-0 text-white lg:hidden">
          <SheetHeader className="border-b border-white/10 px-4 py-4">
            <SheetTitle className="text-left text-sm font-semibold uppercase tracking-[0.16em] text-[#c9910a]">
              Kibaha Scouts CMS
            </SheetTitle>
          </SheetHeader>

          <div className="space-y-4 p-4">
            <section>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Content</p>
              <div className="mt-2 space-y-1">
                {contentItems.map((item) => (
                  <SidebarNavItem
                    key={item.href}
                    item={item}
                    pathname={pathname}
                    collapsed={false}
                    unreadMessages={summary.unreadMessages}
                    pendingMembershipApplications={summary.pendingMembershipApplications}
                  />
                ))}
              </div>
            </section>

            <section>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Communication</p>
              <div className="mt-2 space-y-1">
                {communicationItems.map((item) => (
                  <SidebarNavItem
                    key={item.href}
                    item={item}
                    pathname={pathname}
                    collapsed={false}
                    unreadMessages={summary.unreadMessages}
                    pendingMembershipApplications={summary.pendingMembershipApplications}
                  />
                ))}
              </div>
            </section>

            <section>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Access &amp; Security</p>
              <div className="mt-2 space-y-1">
                {securityItems.map((item) => (
                  <SidebarNavItem
                    key={item.href}
                    item={item}
                    pathname={pathname}
                    collapsed={false}
                    unreadMessages={summary.unreadMessages}
                    pendingMembershipApplications={summary.pendingMembershipApplications}
                  />
                ))}
              </div>
            </section>

            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-red-500/60 px-3 py-2 text-xs font-semibold text-red-300"
            >
              <LogOut className="h-4 w-4" />
              {isSigningOut ? "Signing out..." : "Sign Out"}
            </button>
          </div>
        </SheetContent>
      </Sheet>

      <nav
        className="admin-bottom-nav fixed inset-x-0 bottom-0 z-40 grid h-16 grid-cols-5 border-t border-border bg-white px-2 lg:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {compactTabItems.map((item) => {
          const active = item.match(pathname)
          const showBadge = item.href === "/admin/messages" && summary.unreadMessages > 0
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center justify-center gap-1 rounded-md text-[11px] font-medium",
                active ? "text-[#1e3a2f]" : "text-muted-foreground",
              )}
              aria-current={active ? "page" : undefined}
            >
              <item.icon className="h-4 w-4" />
              <span className="truncate">{item.shortLabel || item.label}</span>
              {showBadge ? <span className="absolute right-4 top-2 h-2 w-2 rounded-full bg-red-500" /> : null}
            </Link>
          )
        })}
      </nav>
    </>
  )
}
