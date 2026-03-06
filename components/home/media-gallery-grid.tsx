"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Play } from "lucide-react"
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

  if (items.length === 0) return null

  return (
    <div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {visibleItems.map((item) => {
          const imageSrc = item.thumbnail || "/images/about-hero.jpg"

          return (
            <article key={item.id} className="card-shell group overflow-hidden rounded-2xl">
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
                    <div className="absolute inset-0 bg-gradient-to-t from-tsa-green-deep/80 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-tsa-gold text-white shadow-lg">
                        <Play className="h-5 w-5 fill-current" />
                      </span>
                    </div>
                  </div>
                </Link>
              ) : (
                <div className="group relative aspect-video">
                  <Image src={imageSrc} alt={item.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
                  <div className="absolute inset-0 bg-gradient-to-t from-tsa-green-deep/80 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-tsa-gold text-white shadow-lg">
                      <Play className="h-5 w-5 fill-current" />
                    </span>
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
