"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import {
  CalendarDays,
  Clapperboard,
  Compass,
  FileText,
  Home,
  Inbox,
  LayoutDashboard,
  Newspaper,
  Settings2,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react"
import { siteConfig } from "@/lib/site-config"
import { cn } from "@/lib/utils"

const adminNavItems = [
  {
    href: "/admin",
    label: "Overview",
    icon: LayoutDashboard,
    match: (pathname: string) => pathname === "/admin",
  },
  {
    href: "/admin/news",
    label: "News",
    icon: Newspaper,
    match: (pathname: string) => pathname.startsWith("/admin/news"),
  },
  {
    href: "/admin/homepage",
    label: "Homepage",
    icon: Home,
    match: (pathname: string) => pathname.startsWith("/admin/homepage"),
  },
  {
    href: "/admin/navigation",
    label: "Navigation",
    icon: Compass,
    match: (pathname: string) => pathname.startsWith("/admin/navigation"),
  },
  {
    href: "/admin/site-content",
    label: "Site Content",
    icon: Settings2,
    match: (pathname: string) => pathname.startsWith("/admin/site-content"),
  },
  {
    href: "/admin/events",
    label: "Events",
    icon: CalendarDays,
    match: (pathname: string) => pathname.startsWith("/admin/events"),
  },
  {
    href: "/admin/resources",
    label: "Resources",
    icon: FileText,
    match: (pathname: string) => pathname.startsWith("/admin/resources"),
  },
  {
    href: "/admin/media",
    label: "Media",
    icon: Clapperboard,
    match: (pathname: string) => pathname.startsWith("/admin/media"),
  },
  {
    href: "/admin/messages",
    label: "Inbox",
    icon: Inbox,
    match: (pathname: string) => pathname.startsWith("/admin/messages"),
  },
  {
    href: "/admin/admins",
    label: "Admins",
    icon: ShieldCheck,
    match: (pathname: string) => pathname.startsWith("/admin/admins"),
  },
  {
    href: "/admin/security",
    label: "Security",
    icon: ShieldAlert,
    match: (pathname: string) => pathname.startsWith("/admin/security"),
  },
]

type SessionResponse = {
  ok?: boolean
  data?: {
    email?: string
    role?: string
  }
}

function formatRoleLabel(role: string | undefined) {
  if (role === "super_admin") {
    return "Super Admin"
  }

  if (role === "content_admin") {
    return "Content Admin"
  }

  if (role === "viewer") {
    return "Viewer"
  }

  return "Admin"
}

export function AdminNav() {
  const pathname = usePathname()
  const [session, setSession] = useState<{ email: string; role: string } | null>(null)
  const hideAdminNav = pathname === "/admin/login" || pathname === "/admin/register"

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
        // Keep static fallback UI when session read fails.
      }
    }

    void loadSession()

    return () => {
      canceled = true
    }
  }, [hideAdminNav])

  if (hideAdminNav) {
    return null
  }

  const avatarInitial = useMemo(() => {
    const source = session?.email?.trim() || "admin"
    return source.charAt(0).toUpperCase()
  }, [session?.email])

  return (
    <header className="notranslate sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/admin" className="flex items-center gap-2.5 rounded-md px-1 py-0.5 transition hover:bg-secondary/60">
          <div className="relative h-8 w-8 overflow-hidden rounded-full ring-1 ring-border" aria-hidden="true">
            <Image src={siteConfig.branding.primaryLogo} alt="" fill sizes="32px" className="object-cover" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">Admin Dashboard</p>
            <p className="text-[11px] text-muted-foreground">Kibaha Scouts CMS</p>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <Link href="/" className="text-xs font-medium text-muted-foreground hover:text-foreground">
            Public Website
          </Link>
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/70 px-2 py-1">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
              {avatarInitial}
            </span>
            <span className="hidden text-[11px] font-medium text-muted-foreground sm:inline">
              {formatRoleLabel(session?.role)}
            </span>
          </div>
        </div>
      </div>

      <div className="relative border-t border-border/70">
        <nav
          className="mx-auto flex w-full max-w-6xl items-center gap-1 overflow-x-auto px-4 py-2 pr-12 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          aria-label="Admin navigation"
        >
          {adminNavItems.map((item) => {
            const active = item.match(pathname)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                  active ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                )}
                aria-current={active ? "page" : undefined}
              >
                <item.icon className="h-3.5 w-3.5" />
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-background via-background/90 to-transparent" />
      </div>
    </header>
  )
}
