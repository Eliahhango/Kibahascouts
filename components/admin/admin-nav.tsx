"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
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

export function AdminNav() {
  const pathname = usePathname()
  const hideAdminNav = pathname === "/admin/login" || pathname === "/admin/register"

  if (hideAdminNav) {
    return null
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/admin" className="text-sm font-semibold text-foreground hover:text-primary">
          Admin Dashboard
        </Link>
        <Link href="/" className="text-xs font-medium text-muted-foreground hover:text-foreground">
          Public Website
        </Link>
      </div>

      <div className="border-t border-border/70">
        <nav
          className="mx-auto flex w-full max-w-6xl items-center gap-1 overflow-x-auto px-4 py-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          aria-label="Admin navigation"
        >
          {adminNavItems.map((item) => {
            const active = item.match(pathname)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "inline-flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
                  active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                )}
                aria-current={active ? "page" : undefined}
              >
                <item.icon className="h-3.5 w-3.5" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
