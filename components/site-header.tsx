"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronDown, MapPin, Menu, Search, X } from "lucide-react"
import { mainNavItems } from "@/lib/data"
import { GlobalSearch } from "@/components/global-search"
import { GoogleTranslator } from "@/components/google-translator"
import { SearchModal } from "@/components/search-modal"
import { SafeClientBoundary } from "@/components/safe-client-boundary"
import { siteConfig } from "@/lib/site-config"
import type { NavigationItem } from "@/lib/types"

const defaultMenuDescriptions: Record<string, string> = {
  "About Kibaha Scouts": "Institutional profile, leadership, history, and district governance.",
  Programmes: "Age-based sections, badge progression, and training pathways.",
  "Scout Units": "Directory of packs, troops, and crews across Kibaha wards.",
  Newsroom: "Official updates, press resources, and district announcements.",
  Events: "Calendar and registration for district-level activities and trainings.",
  Resources: "Downloadable forms, handbooks, policies, and annual reports.",
  "Join / Volunteer": "Start as youth, become a leader, or support district programmes.",
}

function splitIntoColumns<T>(items: T[]) {
  const midpoint = Math.ceil(items.length / 2)
  return [items.slice(0, midpoint), items.slice(midpoint)]
}

function buildFallbackNavItems(): NavigationItem[] {
  return mainNavItems.map((item) => ({
    ...item,
    description: defaultMenuDescriptions[item.label] || "",
    children: item.children?.map((child) => ({ ...child })),
  }))
}

function normalizeNavItems(items: NavigationItem[] | undefined): NavigationItem[] {
  if (!items || items.length === 0) {
    return buildFallbackNavItems()
  }

  return items.map((item) => ({
    label: (item.label || "").trim() || "Menu",
    href: (item.href || "").trim() || "/",
    description: (item.description || "").trim(),
    children: item.children && item.children.length > 0
      ? item.children.map((child) => ({
          label: (child.label || "").trim() || "Item",
          href: (child.href || "").trim() || "/",
        }))
      : undefined,
  }))
}

type NavigationSettingsResponse = {
  ok?: boolean
  data?: {
    mainNavItems?: NavigationItem[]
  }
}

export function SiteHeader() {
  const { branding, name, organization } = siteConfig
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [navItems, setNavItems] = useState<NavigationItem[]>(() => buildFallbackNavItems())
  const navRef = useRef<HTMLElement>(null)
  const menuTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const shouldHideHeader = pathname === "/admin/login" || pathname === "/admin/register"

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }

    return () => {
      document.body.style.overflow = ""
    }
  }, [mobileOpen])

  useEffect(() => {
    const onDocumentClick = (event: MouseEvent) => {
      const target = event.target as Node

      if (navRef.current && !navRef.current.contains(target)) {
        setActiveMenu(null)
      }
    }

    document.addEventListener("mousedown", onDocumentClick)
    return () => document.removeEventListener("mousedown", onDocumentClick)
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveMenu(null)
        setSearchOpen(false)
        setMobileOpen(false)
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
    setActiveMenu(null)
  }, [pathname])

  useEffect(() => {
    if (shouldHideHeader) {
      return
    }

    let cancelled = false

    const loadNavItems = async () => {
      try {
        const response = await fetch("/api/navigation", {
          method: "GET",
          cache: "no-store",
        })
        const payload = (await response.json()) as NavigationSettingsResponse
        if (!response.ok || !payload.ok) {
          return
        }

        if (!cancelled) {
          setNavItems(normalizeNavItems(payload.data?.mainNavItems))
        }
      } catch {
        // Keep fallback nav when API read fails.
      }
    }

    void loadNavItems()

    return () => {
      cancelled = true
    }
  }, [shouldHideHeader])

  const handleMenuEnter = (label: string) => {
    if (menuTimeoutRef.current) clearTimeout(menuTimeoutRef.current)
    setActiveMenu(label)
  }

  const handleMenuLeave = () => {
    menuTimeoutRef.current = setTimeout(() => setActiveMenu(null), 140)
  }

  const utilityLabel = useMemo(
    () =>
      "Kibaha district identity, language translation, and global search.",
    [],
  )

  if (shouldHideHeader) {
    return null
  }

  return (
    <>
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>

      <div className="border-b border-tsa-green-mid bg-gradient-to-r from-tsa-green-deep via-tsa-green-mid to-tsa-gold text-primary-foreground">
        <div
          className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-4 py-2.5 lg:flex-nowrap lg:gap-4"
          aria-label={utilityLabel}
        >
          <div className="inline-flex items-center gap-1.5 rounded-md border border-tsa-green-mid bg-tsa-warm-white px-2.5 py-1 text-xs font-medium text-tsa-green-deep shadow-sm">
            <MapPin className="h-3.5 w-3.5" />
            Kibaha District
          </div>

          <div className="hidden flex-1 md:block">
            <SafeClientBoundary>
              <GlobalSearch />
            </SafeClientBoundary>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <SafeClientBoundary>
              <GoogleTranslator />
            </SafeClientBoundary>
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-primary-foreground text-primary-foreground transition hover:bg-tsa-green-mid md:hidden"
              aria-label="Open search"
            >
              <Search className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <header
        ref={navRef}
        className={`sticky top-0 z-40 border-b border-border bg-background transition-shadow ${scrolled ? "shadow-md" : ""}`}
        role="banner"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link
            href="/"
            className="flex items-center gap-3 rounded focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={`${name} - Home`}
          >
            <div className="relative h-10 w-10 overflow-hidden rounded-full ring-2 ring-tsa-gold shadow-lg" aria-hidden="true">
              <Image
                src={branding.primaryLogo}
                alt=""
                fill
                sizes="40px"
                className="object-cover"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold leading-tight text-foreground">{name}</span>
              <span className="hidden text-xs leading-tight text-muted-foreground sm:block">{organization}</span>
            </div>
          </Link>

          <nav className="hidden items-center gap-0.5 xl:flex" aria-label="Main navigation">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
              const childColumns = item.children ? splitIntoColumns(item.children) : [[], []]
              const isExpanded = item.children ? activeMenu === item.label : false

              return (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => item.children && handleMenuEnter(item.label)}
                  onMouseLeave={handleMenuLeave}
                >
                  <Link
                    href={item.href}
                    onFocus={() => item.children && setActiveMenu(item.label)}
                    className={`inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring ${
                      isActive || isExpanded
                        ? "bg-secondary text-tsa-green-deep"
                        : "text-foreground hover:bg-secondary hover:text-tsa-green-deep"
                    } relative after:absolute after:bottom-0 after:left-3 after:right-3 after:h-0.5 after:origin-center after:rounded-full after:bg-tsa-gold after:transition-transform after:duration-300 after:content-[''] ${
                      isActive ? "after:scale-x-100" : "after:scale-x-0"
                    }`}
                    aria-expanded={item.children ? isExpanded : undefined}
                    aria-haspopup={item.children ? "true" : undefined}
                  >
                    {item.label}
                    {item.children && (
                      <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                    )}
                  </Link>

                  {item.children && isExpanded && (
                    <div
                      className="absolute left-1/2 top-full z-50 mt-2 w-[44rem] max-w-[calc(100vw-2rem)] -translate-x-1/2 rounded-xl border border-border bg-card p-5 shadow-lg"
                      role="menu"
                      onMouseEnter={() => handleMenuEnter(item.label)}
                      onMouseLeave={handleMenuLeave}
                    >
                      <div className="mb-4 border-b border-border pb-3">
                        <p className="text-sm font-semibold text-card-foreground">{item.label}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {item.description || defaultMenuDescriptions[item.label] || "Explore links in this section."}
                        </p>
                      </div>
                      <div className="grid gap-2 md:grid-cols-2">
                        {childColumns.map((column, columnIndex) => (
                          <div key={`${item.label}-column-${columnIndex}`} className="space-y-1">
                            {column.map((child) => (
                              <Link
                                key={child.href}
                                href={child.href}
                                className="block rounded-md px-3 py-2 text-sm text-card-foreground transition-colors hover:bg-secondary hover:text-tsa-green-deep focus-visible:ring-2 focus-visible:ring-ring"
                                role="menuitem"
                                onClick={() => setActiveMenu(null)}
                              >
                                {child.label}
                              </Link>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md text-foreground transition-colors hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring xl:hidden"
              aria-label="Open search"
            >
              <Search className="h-5 w-5" />
            </button>
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md text-foreground transition-colors hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring xl:hidden"
              onClick={() => setMobileOpen((current) => !current)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <MobileNav pathname={pathname} navItems={navItems} open={mobileOpen} onClose={() => setMobileOpen(false)} />
      </header>

      <SafeClientBoundary>
        <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
      </SafeClientBoundary>
    </>
  )
}

function MobileNav({
  pathname,
  navItems,
  open,
  onClose,
}: {
  pathname: string
  navItems: NavigationItem[]
  open: boolean
  onClose: () => void
}) {
  const [expanded, setExpanded] = useState<string | null>(null)

  return (
    <div
      className={`absolute inset-x-0 top-full z-40 border-t border-border bg-background/95 shadow-2xl backdrop-blur transition-all duration-300 ease-in-out xl:hidden ${
        open ? "max-h-[calc(100dvh-4.5rem)] opacity-100" : "pointer-events-none max-h-0 opacity-0"
      }`}
    >
      <nav className="mx-auto max-h-[calc(100dvh-4.5rem)] max-w-7xl overflow-y-auto px-4 py-4" aria-label="Mobile navigation">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
          return (
            <div key={`${item.label}-${item.href}`} className="border-b border-border">
              {item.children ? (
                <>
                  <button
                    type="button"
                    className={`relative flex min-h-14 w-full items-center justify-between py-3 text-left text-base font-medium focus-visible:ring-2 focus-visible:ring-ring after:absolute after:bottom-2 after:left-0 after:h-0.5 after:bg-tsa-gold after:transition-all after:duration-300 after:content-[''] ${
                      isActive ? "text-tsa-green-deep" : "text-foreground"
                    } ${isActive ? "after:w-10" : "after:w-0"}`}
                    onClick={() => setExpanded((current) => (current === item.label ? null : item.label))}
                    aria-expanded={expanded === item.label}
                  >
                    {item.label}
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${
                        expanded === item.label ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {expanded === item.label && (
                    <div className="pb-3 pl-4">
                      {item.description ? <p className="mb-2 text-xs text-muted-foreground">{item.description}</p> : null}
                      {item.children.map((child) => (
                        <Link
                          key={`${child.label}-${child.href}`}
                          href={child.href}
                          className="block rounded-md py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-tsa-green-deep focus-visible:ring-2 focus-visible:ring-ring"
                          onClick={onClose}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  href={item.href}
                  className={`relative block min-h-14 py-3 text-base font-medium transition-colors hover:text-tsa-green-deep focus-visible:ring-2 focus-visible:ring-ring after:absolute after:bottom-2 after:left-0 after:h-0.5 after:bg-tsa-gold after:transition-all after:duration-300 after:content-[''] ${
                    isActive ? "text-tsa-green-deep" : "text-foreground"
                  } ${isActive ? "after:w-10" : "after:w-0"}`}
                  onClick={onClose}
                >
                  {item.label}
                </Link>
              )}
            </div>
          )
        })}
      </nav>
    </div>
  )
}
