"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { PlayCircle } from "lucide-react"
import type { MediaItem } from "@/lib/types"

type MediaGalleryItem = MediaItem & {
  resolvedEmbedUrl?: string
}

type MediaGalleryGridProps = {
  items: MediaGalleryItem[]
}

type ViewportSettings = {
  initialCount: number
  increment: number
}

const MOBILE_SETTINGS: ViewportSettings = { initialCount: 4, increment: 2 }
const TABLET_SETTINGS: ViewportSettings = { initialCount: 6, increment: 3 }
const DESKTOP_SETTINGS: ViewportSettings = { initialCount: 8, increment: 4 }

function resolveViewportSettings(width: number): ViewportSettings {
  if (width < 640) {
    return MOBILE_SETTINGS
  }

  if (width < 1024) {
    return TABLET_SETTINGS
  }

  return DESKTOP_SETTINGS
}

export function MediaGalleryGrid({ items }: MediaGalleryGridProps) {
  const [initialCount, setInitialCount] = useState(MOBILE_SETTINGS.initialCount)
  const [increment, setIncrement] = useState(MOBILE_SETTINGS.increment)
  const [visibleCount, setVisibleCount] = useState(() => Math.min(items.length, MOBILE_SETTINGS.initialCount))

  useEffect(() => {
    const syncViewport = () => {
      const nextSettings = resolveViewportSettings(window.innerWidth)
      setInitialCount(nextSettings.initialCount)
      setIncrement(nextSettings.increment)
      setVisibleCount((previous) => {
        const minimum = Math.min(items.length, nextSettings.initialCount)
        if (previous < minimum) {
          return minimum
        }
        return Math.min(previous, items.length)
      })
    }

    syncViewport()
    window.addEventListener("resize", syncViewport)
    return () => window.removeEventListener("resize", syncViewport)
  }, [items.length])

  useEffect(() => {
    setVisibleCount((previous) => {
      const minimum = Math.min(items.length, initialCount)
      if (previous < minimum) {
        return minimum
      }
      return Math.min(previous, items.length)
    })
  }, [initialCount, items.length])

  const visibleItems = items.slice(0, visibleCount)
  const hasMore = visibleCount < items.length

  if (items.length === 0) {
    return (
      <article className="section-shell rounded-lg border border-border bg-card p-5 sm:col-span-2 lg:col-span-3">
        <h3 className="text-base font-semibold text-card-foreground">Media updates are coming soon</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Published videos and gallery items will appear here automatically from the admin dashboard.
        </p>
      </article>
    )
  }

  return (
    <div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {visibleItems.map((item) => {
          const imageSrc = item.thumbnail || "/images/about-hero.jpg"

          return (
            <article key={item.id} className="section-shell card-lift overflow-hidden">
              {item.kind === "video" && item.resolvedEmbedUrl ? (
                <div className="relative aspect-video bg-black">
                  <iframe
                    title={item.title}
                    src={item.resolvedEmbedUrl}
                    className="absolute inset-0 h-full w-full"
                    loading="lazy"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
              ) : item.href ? (
                <Link href={item.href} className="group block">
                  <div className="relative aspect-video">
                    <Image src={imageSrc} alt={item.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
                    <div className="absolute inset-0 flex items-center justify-center bg-foreground/25 transition-colors group-hover:bg-foreground/35">
                      <PlayCircle className="h-12 w-12 text-primary-foreground" />
                    </div>
                  </div>
                </Link>
              ) : (
                <div className="group relative aspect-video">
                  <Image src={imageSrc} alt={item.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
                  <div className="absolute inset-0 flex items-center justify-center bg-foreground/25">
                    <PlayCircle className="h-12 w-12 text-primary-foreground" />
                  </div>
                </div>
              )}
              <div className="p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-tsa-green-deep">
                  {item.kind === "video" ? "Video" : "Gallery"}
                  {item.sourceProvider ? ` - ${item.sourceProvider}` : ""}
                </p>
                <h3 className="mt-1 text-sm font-semibold text-card-foreground">{item.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>
              </div>
            </article>
          )
        })}
      </div>

      {hasMore ? (
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={() => {
              setVisibleCount((previous) => Math.min(previous + increment, items.length))
            }}
            className="inline-flex items-center justify-center rounded-md border border-border bg-card px-4 py-2 text-sm font-semibold text-card-foreground transition-colors hover:bg-secondary"
          >
            Load more
          </button>
        </div>
      ) : null}
    </div>
  )
}
