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
  { prefix: "/admin", message: "Loading dashboard..." },
]

function resolveLoadingMessage(pathname: string) {
  const matched = routeLoadingMessages.find(
    (item) => pathname === item.prefix || pathname.startsWith(`${item.prefix}/`)
  )
  return matched?.message || "Loading dashboard..."
}

export default function AdminLoading() {
  const pathname = usePathname()
  const [progress, setProgress] = useState(12)
  const [showHint, setShowHint] = useState(false)
  const loadingMessage = useMemo(() => resolveLoadingMessage(pathname || "/admin"), [pathname])

  useEffect(() => {
    setProgress(12)
    setShowHint(false)

    // Animate progress naturally and stop before completion until route settles.
    const steps = [
      { target: 35, delay: 300 },
      { target: 55, delay: 700 },
      { target: 72, delay: 1400 },
      { target: 85, delay: 2200 },
    ]

    const timers: number[] = []

    steps.forEach(({ target, delay }) => {
      timers.push(window.setTimeout(() => setProgress(target), delay))
    })

    timers.push(window.setTimeout(() => setShowHint(true), 2500))

    return () => timers.forEach((timer) => window.clearTimeout(timer))
  }, [pathname])

  return (
    <main
      className="notranslate fixed inset-0 z-[9999] flex items-center justify-center bg-[#0d1f17] px-4"
      role="status"
      aria-label={loadingMessage}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(201,145,10,0.08) 0%, transparent 70%)",
          }}
        />
      </div>

      <section className="relative flex w-full max-w-xs flex-col items-center text-center">
        <div className="relative mb-8 flex items-center justify-center">
          <div
            className="absolute h-28 w-28 rounded-full border-2 border-dashed border-[#c9910a]/30"
            style={{ animation: "orbital-spin 8s linear infinite" }}
          />
          <div
            className="absolute h-24 w-24 rounded-full border border-[#c9910a]/20"
            style={{ animation: "pulse 2s ease-in-out infinite" }}
          />
          <div className="relative z-10 h-[72px] w-[72px] overflow-hidden rounded-full ring-2 ring-[#c9910a]/60 shadow-lg shadow-[#c9910a]/10">
            <Image
              src="/images/branding/kibaha-scouts-logo.jpg"
              alt="Kibaha Scouts"
              fill
              sizes="72px"
              className="object-cover"
              priority
            />
          </div>
        </div>

        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#c9910a]">
          Kibaha Scouts CMS
        </p>

        <p className="mt-2 text-sm font-medium text-white/80">{loadingMessage}</p>

        <div className="mt-6 h-0.5 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#1e3a2f] to-[#c9910a] transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="mt-4 flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-[#c9910a]/60"
              style={{
                animation: `dot-bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>

        <p
          className="mt-4 text-xs text-white/40 transition-opacity duration-700"
          style={{ opacity: showHint ? 1 : 0 }}
        >
          This may take a moment
        </p>
      </section>
    </main>
  )
}
