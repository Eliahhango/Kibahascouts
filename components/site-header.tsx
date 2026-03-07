"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronDown, ChevronRight, MapPin, Menu, Search, X } from "lucide-react"
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
    children:
      item.children && item.children.length > 0
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
  const { branding, name } = siteConfig
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
    menuTimeoutRef.current = setTimeout(() => setActiveMenu(null), 200)
  }

  const utilityLabel = useMemo(
    () => "Kibaha district identity, language translation, and global search.",
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

      <div className="border-b border-tsa-green-mid/60 bg-tsa-green-deep text-primary-foreground">
        <div className="mx-auto flex max-w-[92rem] items-center gap-4 px-4 py-2 sm:px-6 lg:px-8" aria-label={utilityLabel}>
          <div className="flex shrink-0 items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-white/80">
              <MapPin className="h-3 w-3 text-tsa-gold" />
              Kibaha District, Tanzania
            </span>
            <span className="text-xs text-white/30">|</span>
            <a
              href={branding.wosmUrl}
              target="_blank"
              rel="noreferrer"
              className="hidden items-center gap-1.5 text-xs font-medium text-white/80 transition-colors hover:text-white sm:inline-flex"
            >
              <Image src={branding.wosmBadge} alt="" width={14} height={14} className="h-3.5 w-3.5 rounded-full" />
              WOSM Member
            </a>
          </div>

          <div className="mx-auto hidden max-w-xl flex-1 md:block">
            <SafeClientBoundary>
              <GlobalSearch />
            </SafeClientBoundary>
          </div>

          <div className="ml-auto min-w-0 shrink">
            <SafeClientBoundary>
              <GoogleTranslator />
            </SafeClientBoundary>
          </div>
        </div>
      </div>

      <header
        ref={navRef}
        className={`sticky top-0 z-40 border-b border-border bg-background transition-shadow ${scrolled ? "shadow-sm ring-1 ring-black/5" : ""}`}
        role="banner"
      >
        <div className="mx-auto flex max-w-[92rem] items-center justify-between px-4 py-2 sm:px-6 md:py-3 lg:px-8">
          <div className="relative z-10 flex shrink-0 items-center gap-3 pr-2 lg:pr-4">
            <Link
              href="/"
              className="relative h-11 w-11 overflow-hidden rounded-full ring-2 ring-tsa-gold shadow-lg focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={`${name} - Home`}
            >
              <Image
                src={branding.primaryLogo}
                alt=""
                fill
                sizes="44px"
                className="object-cover"
                priority
              />
            </Link>

            <Link
              href="/"
              className="flex flex-col rounded focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={`${name} - Home`}
            >
              <span className="whitespace-nowrap text-[0.9375rem] font-extrabold leading-tight tracking-tight text-foreground">{name}</span>
            </Link>
          </div>

          <div className="mx-2 hidden h-8 w-px bg-border lg:block" />

          <nav className="hidden min-w-0 flex-1 items-center justify-end gap-0 pl-2 lg:flex xl:pl-4" aria-label="Main navigation">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
              const childColumns = item.children ? splitIntoColumns(item.children) : [[], []]
              const isExpanded = item.children ? activeMenu === item.label : false

              return (
                <div
                  key={item.label}
                  className="relative isolate shrink-0"
                  onMouseEnter={() => item.children && handleMenuEnter(item.label)}
                  onMouseLeave={handleMenuLeave}
                >
                  <Link
                    href={item.href}
                    onClick={(event) => {
                      if (!item.children) return
                      event.preventDefault()
                      setActiveMenu((current) => (current === item.label ? null : item.label))
                    }}
                    onFocus={() => item.children && setActiveMenu(item.label)}
                    className={`relative inline-flex h-11 shrink-0 items-center gap-1 whitespace-nowrap rounded-md px-2.5 text-[0.93rem] font-medium leading-none transition-colors focus-visible:ring-2 focus-visible:ring-ring lg:px-2 lg:text-xs xl:px-3 xl:text-[0.8125rem] 2xl:text-sm ${
                      isActive || isExpanded
                        ? "bg-secondary text-tsa-green-deep"
                        : "text-foreground hover:bg-secondary hover:text-tsa-green-deep"
                    } after:absolute after:bottom-0 after:left-2.5 after:right-2.5 after:h-0.5 after:origin-center after:rounded-full after:bg-tsa-gold after:transition-transform after:duration-300 after:content-[''] 2xl:after:left-3 2xl:after:right-3 ${
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

                  {item.children ? (
                    <div
                      className={`absolute left-0 top-full z-50 mt-2 w-max min-w-[36rem] max-w-[min(44rem,calc(100vw-1rem))] origin-top rounded-2xl border border-border bg-white p-6 shadow-xl ring-1 ring-black/5 transition-all duration-150 ${
                        isExpanded
                          ? "visible pointer-events-auto opacity-100 scale-100 animate-in fade-in-0 zoom-in-95"
                          : "invisible pointer-events-none opacity-0 scale-95"
                      }`}
                      role="menu"
                      onMouseEnter={() => handleMenuEnter(item.label)}
                      onMouseLeave={handleMenuLeave}
                    >
                      <div className="absolute inset-x-0 top-0 h-0.5 rounded-t-2xl bg-gradient-to-r from-tsa-green-deep via-tsa-gold to-tsa-green-deep" />
                      <div className="mb-4 border-b border-border/60 pb-4">
                        <p className="text-base font-bold text-tsa-green-deep">{item.label}</p>
                        <p className="mt-1 text-sm text-muted-foreground">
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
                                className="group flex items-center gap-2 rounded-lg px-3 py-3 text-[0.8125rem] font-medium text-foreground transition-all hover:bg-tsa-green-deep/8 hover:text-tsa-green-deep focus-visible:ring-2 focus-visible:ring-ring"
                                role="menuitem"
                                onClick={() => setActiveMenu(null)}
                              >
                                {child.label}
                                <ChevronRight className="ml-auto h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-60" />
                              </Link>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              )
            })}
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-md text-foreground transition-colors hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring lg:hidden"
              aria-label="Open search"
            >
              <Search className="h-5 w-5" />
            </button>
            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-md text-foreground transition-colors hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring lg:hidden"
              onClick={() => setMobileOpen((current) => !current)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      <MobileNav pathname={pathname} navItems={navItems} open={mobileOpen} onClose={() => setMobileOpen(false)} />

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
      className={`fixed inset-x-0 top-[calc(var(--header-height,4.5rem))] z-40 border-t border-border bg-background/95 shadow-2xl backdrop-blur transition-all duration-300 ease-in-out lg:hidden ${
        open ? "max-h-[calc(100dvh-var(--header-height,4.5rem))] opacity-100" : "pointer-events-none max-h-0 opacity-0"
      }`}
    >
      <nav className="mx-auto max-h-[calc(100dvh-var(--header-height,4.5rem))] max-w-[92rem] overflow-y-auto px-4 py-4 sm:px-6 lg:px-8" aria-label="Mobile navigation">
        <div className="mb-1 flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <span className="h-5 w-1 rounded-full bg-tsa-gold" />
            <p className="text-sm font-bold text-foreground">Menu</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-foreground transition-colors hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Close navigation"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

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
                    <ChevronDown className={`h-4 w-4 transition-transform ${expanded === item.label ? "rotate-180" : ""}`} />
                  </button>
                  {expanded === item.label && (
                    <div className="border-l-2 border-tsa-gold/40 pb-3 pl-3">
                      {item.description ? <p className="mb-2 text-xs text-muted-foreground">{item.description}</p> : null}
                      {item.children.map((child) => (
                        <Link
                          key={`${child.label}-${child.href}`}
                          href={child.href}
                          className="block rounded-md py-2.5 text-[0.9375rem] text-muted-foreground transition-colors hover:bg-secondary hover:text-tsa-green-deep focus-visible:ring-2 focus-visible:ring-ring"
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

        <div className="mt-4 border-t border-border pt-4">
          <Link href="/join" onClick={onClose} className="btn-primary w-full justify-center text-sm">
            Join Kibaha Scouts
          </Link>
        </div>
      </nav>
    </div>
  )
}
