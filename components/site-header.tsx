"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronDown, MapPin, Menu, Search, X } from "lucide-react"
import { mainNavItems } from "@/lib/data"
import { GlobalSearch } from "@/components/global-search"
import { SearchModal } from "@/components/search-modal"

type DistrictOption = {
  id: string
  label: string
  disabled?: boolean
}

const districtOptions: DistrictOption[] = [
  { id: "kibaha", label: "Kibaha District" },
  { id: "bagamoyo", label: "Bagamoyo District (Coming Soon)", disabled: true },
  { id: "kisarawe", label: "Kisarawe District (Coming Soon)", disabled: true },
  { id: "mkuranga", label: "Mkuranga District (Coming Soon)", disabled: true },
]

const menuDescriptions: Record<string, string> = {
  "About TSA Kibaha": "Institutional profile, leadership, history, and district governance.",
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

export function SiteHeader() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [lang, setLang] = useState<"en" | "sw">("en")
  const [district, setDistrict] = useState<DistrictOption>(districtOptions[0])
  const [districtOpen, setDistrictOpen] = useState(false)
  const districtRef = useRef<HTMLDivElement>(null)
  const menuTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const activeLanguageLabel = lang === "en" ? "English" : "Kiswahili"

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
    const storedDistrict = localStorage.getItem("tsa-district")
    const storedLang = localStorage.getItem("tsa-language")

    if (storedLang === "sw" || storedLang === "en") {
      setLang(storedLang)
      document.documentElement.lang = storedLang
    }

    if (storedDistrict) {
      const selected = districtOptions.find((option) => option.id === storedDistrict)
      if (selected) {
        setDistrict(selected)
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("tsa-language", lang)
    document.documentElement.lang = lang
  }, [lang])

  useEffect(() => {
    const onDocumentClick = (event: MouseEvent) => {
      if (!districtRef.current) return
      const target = event.target as Node
      if (!districtRef.current.contains(target)) {
        setDistrictOpen(false)
      }
    }

    document.addEventListener("mousedown", onDocumentClick)
    return () => document.removeEventListener("mousedown", onDocumentClick)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
    setActiveMenu(null)
    setDistrictOpen(false)
  }, [pathname])

  const handleMenuEnter = (label: string) => {
    if (menuTimeoutRef.current) clearTimeout(menuTimeoutRef.current)
    setActiveMenu(label)
  }

  const handleMenuLeave = () => {
    menuTimeoutRef.current = setTimeout(() => setActiveMenu(null), 140)
  }

  const utilityLabel = useMemo(
    () =>
      lang === "en"
        ? "District selector, language switch, and global search."
        : "Kichaguo cha wilaya, kubadilisha lugha, na utafutaji wa tovuti.",
    [lang],
  )

  return (
    <>
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>

      <div className="border-b border-tsa-green-mid/30 bg-gradient-to-r from-tsa-green-deep via-[#5b2ea6] to-tsa-green-mid text-primary-foreground">
        <div
          className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-4 py-2.5 md:flex-nowrap md:gap-4"
          aria-label={utilityLabel}
        >
          <div ref={districtRef} className="relative">
            <button
              type="button"
              onClick={() => setDistrictOpen((current) => !current)}
              aria-expanded={districtOpen}
              aria-haspopup="listbox"
              aria-label="Select district website"
              className="inline-flex items-center gap-1.5 rounded-md border border-primary-foreground/25 bg-primary-foreground/10 px-2.5 py-1 text-xs font-medium shadow-sm backdrop-blur transition hover:bg-primary-foreground/20 focus-visible:ring-2 focus-visible:ring-tsa-gold"
            >
              <MapPin className="h-3.5 w-3.5" />
              {district.label}
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${districtOpen ? "rotate-180" : ""}`} />
            </button>
            {districtOpen && (
              <div
                role="listbox"
                className="absolute left-0 z-50 mt-1 min-w-64 rounded-lg border border-border bg-card p-1.5 text-card-foreground shadow-2xl"
              >
                {districtOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    disabled={option.disabled}
                    onClick={() => {
                      if (option.disabled) return
                      setDistrict(option)
                      localStorage.setItem("tsa-district", option.id)
                      setDistrictOpen(false)
                    }}
                    className="block w-full rounded-md px-3 py-2 text-left text-xs font-medium transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="hidden flex-1 md:block">
            <GlobalSearch />
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => setLang("en")}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
                lang === "en"
                  ? "bg-primary-foreground text-tsa-green-deep"
                  : "text-primary-foreground/85 hover:bg-primary-foreground/15"
              }`}
              aria-label="Switch language to English"
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setLang("sw")}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
                lang === "sw"
                  ? "bg-primary-foreground text-tsa-green-deep"
                  : "text-primary-foreground/85 hover:bg-primary-foreground/15"
              }`}
              aria-label="Switch language to Kiswahili"
            >
              Kiswahili
            </button>
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-primary-foreground/30 text-primary-foreground transition hover:bg-primary-foreground/15 md:hidden"
              aria-label={`Open search (${activeLanguageLabel})`}
            >
              <Search className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <header
        className={`sticky top-0 z-40 border-b border-border/80 bg-background/95 backdrop-blur transition-shadow ${scrolled ? "shadow-md" : ""}`}
        role="banner"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link
            href="/"
            className="flex items-center gap-3 rounded focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="TSA Kibaha District - Home"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-tsa-green-deep shadow-lg ring-2 ring-tsa-gold/30" aria-hidden="true">
              <svg viewBox="0 0 32 32" className="h-6 w-6 text-tsa-gold" fill="currentColor">
                <path d="M16 2l3.09 9.51H29l-8.045 5.84L24.045 27 16 21.16 7.955 27l3.09-9.65L3 11.51h9.91z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold leading-tight text-foreground">TSA Kibaha District</span>
              <span className="text-xs leading-tight text-muted-foreground">Tanzania Scouts Association</span>
            </div>
          </Link>

          <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Main navigation">
            {mainNavItems.map((item) => {
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
                    className={`inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring ${
                      isActive || isExpanded
                        ? "bg-secondary text-tsa-green-deep"
                        : "text-foreground hover:bg-secondary hover:text-tsa-green-deep"
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
                      className="absolute left-1/2 top-full z-50 mt-2 w-[44rem] -translate-x-1/2 rounded-xl border border-border/80 bg-card/98 p-5 shadow-2xl backdrop-blur"
                      role="menu"
                      onMouseEnter={() => handleMenuEnter(item.label)}
                      onMouseLeave={handleMenuLeave}
                    >
                      <div className="mb-4 border-b border-border pb-3">
                        <p className="text-sm font-semibold text-card-foreground">{item.label}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{menuDescriptions[item.label]}</p>
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
              className="inline-flex h-9 w-9 items-center justify-center rounded-md text-foreground transition-colors hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring lg:hidden"
              aria-label="Open search"
            >
              <Search className="h-5 w-5" />
            </button>
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md text-foreground transition-colors hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring lg:hidden"
              onClick={() => setMobileOpen((current) => !current)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileOpen && <MobileNav pathname={pathname} onClose={() => setMobileOpen(false)} />}
      </header>

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}

function MobileNav({ pathname, onClose }: { pathname: string; onClose: () => void }) {
  const [expanded, setExpanded] = useState<string | null>(null)

  return (
    <div className="fixed inset-0 top-[68px] z-40 overflow-y-auto bg-background lg:hidden">
      <nav className="mx-auto max-w-7xl px-4 py-4" aria-label="Mobile navigation">
        {mainNavItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
          return (
            <div key={item.label} className="border-b border-border">
              {item.children ? (
                <>
                  <button
                    type="button"
                    className={`flex w-full items-center justify-between py-3 text-left text-base font-medium focus-visible:ring-2 focus-visible:ring-ring ${
                      isActive ? "text-tsa-green-deep" : "text-foreground"
                    }`}
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
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="block py-2 text-sm text-muted-foreground transition-colors hover:text-tsa-green-deep focus-visible:ring-2 focus-visible:ring-ring"
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
                  className={`block py-3 text-base font-medium transition-colors hover:text-tsa-green-deep focus-visible:ring-2 focus-visible:ring-ring ${
                    isActive ? "text-tsa-green-deep" : "text-foreground"
                  }`}
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
