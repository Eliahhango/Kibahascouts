"use client"

import Image from "next/image"
import { usePathname } from "next/navigation"
import { useEffect, useMemo, useState } from "react"

const routeLoadingMessages: Array<{ prefix: string; message: string }> = [
  { prefix: "/admin/site-content", message: "Loading site content settings..." },
  { prefix: "/admin/navigation", message: "Loading navigation settings..." },
  { prefix: "/admin/homepage", message: "Loading homepage settings..." },
  { prefix: "/admin/security", message: "Loading security centre..." },
  { prefix: "/admin/admins", message: "Loading admin accounts..." },
  { prefix: "/admin/messages", message: "Loading contact inbox..." },
  { prefix: "/admin/media", message: "Loading media centre..." },
  { prefix: "/admin/resources", message: "Loading resources library..." },
  { prefix: "/admin/events", message: "Loading events calendar..." },
  { prefix: "/admin/news", message: "Loading news articles..." },
  { prefix: "/admin", message: "Loading dashboard overview..." },
]

function resolveLoadingMessage(pathname: string) {
  const matched = routeLoadingMessages.find((item) => pathname === item.prefix || pathname.startsWith(`${item.prefix}/`))
  return matched?.message || "Loading dashboard overview..."
}

export default function AdminLoading() {
  const pathname = usePathname()
  const [showSecondaryHint, setShowSecondaryHint] = useState(false)

  useEffect(() => {
    setShowSecondaryHint(false)
    const timer = window.setTimeout(() => setShowSecondaryHint(true), 2000)
    return () => window.clearTimeout(timer)
  }, [pathname])

  const loadingMessage = useMemo(() => resolveLoadingMessage(pathname || "/admin"), [pathname])

  return (
    <main className="notranslate flex min-h-screen items-center justify-center bg-tsa-green-deep px-4 py-12">
      <section className="text-center">
        <div className="relative mx-auto h-20 w-20">
          <span className="absolute inset-0 rounded-full bg-tsa-gold/40 animate-ping" />
          <div className="relative h-20 w-20 overflow-hidden rounded-full ring-2 ring-tsa-gold/70">
            <Image src="/images/branding/kibaha-scouts-logo.jpg" alt="Kibaha Scouts logo" fill sizes="80px" className="object-cover" priority />
          </div>
        </div>
        <p className="mt-5 text-sm font-semibold tracking-wide text-primary-foreground">{loadingMessage}</p>
        {showSecondaryHint ? (
          <p className="mt-1 text-xs text-primary-foreground/80">This may take a few seconds</p>
        ) : null}
      </section>
    </main>
  )
}
