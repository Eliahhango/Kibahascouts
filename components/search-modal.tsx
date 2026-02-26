"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import Link from "next/link"
import { Search, X, FileText, Calendar, Download, Users } from "lucide-react"
import { buildSearchIndex, searchIndex } from "@/lib/search"
import type { SearchFilter } from "@/lib/types"

export function SearchModal({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState<SearchFilter>("all")
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100)
    } else {
      setQuery("")
      setFilter("all")
    }
  }, [open])

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    if (open) window.addEventListener("keydown", handleEsc)
    return () => window.removeEventListener("keydown", handleEsc)
  }, [open, onClose])

  const allResults = useMemo(() => buildSearchIndex(), [])

  const filtered = useMemo(() => {
    return searchIndex(allResults, query, filter, 8)
  }, [query, filter, allResults])

  const typeIcon = (type: string) => {
    switch (type) {
      case "news": return <FileText className="h-4 w-4 text-tsa-green-mid" />
      case "event": return <Calendar className="h-4 w-4 text-tsa-gold" />
      case "resource": return <Download className="h-4 w-4 text-tsa-green-light" />
      case "unit": return <Users className="h-4 w-4 text-tsa-green-deep" />
      default: return null
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center bg-foreground/50 pt-20"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Site search"
    >
      <div
        className="w-full max-w-2xl rounded-lg bg-background shadow-2xl mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <Search className="h-5 w-5 text-muted-foreground" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search news, events, resources, units..."
            className="flex-1 bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground"
            aria-label="Search"
          />
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Close search"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Filter pills */}
        <div className="flex gap-2 px-4 pt-3 pb-2">
          {(["all", "news", "event", "resource", "unit"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors focus-visible:ring-2 focus-visible:ring-ring ${
                filter === f
                  ? "bg-tsa-green-deep text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-border"
              }`}
            >
              {f === "all" ? "All" : f === "event" ? "Events" : f === "unit" ? "Units" : f === "news" ? "News" : "Resources"}
            </button>
          ))}
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto px-4 pb-4">
          {query.trim() && filtered.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No results found for &quot;{query}&quot;
            </p>
          )}
          {filtered.map((result, i) => (
            <Link
              key={i}
              href={result.url}
              onClick={onClose}
              className="flex items-start gap-3 rounded-md px-3 py-3 transition-colors hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="mt-0.5">{typeIcon(result.type)}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {result.title}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {result.description}
                </p>
              </div>
              <span className="rounded bg-secondary px-2 py-0.5 text-xs capitalize text-muted-foreground">
                {result.type}
              </span>
            </Link>
          ))}
          {!query.trim() && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Start typing to search across the site
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
