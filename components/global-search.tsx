"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { Calendar, Download, FileText, Search, Users } from "lucide-react"
import { buildSearchIndex, searchIndex } from "@/lib/search"
import type { SearchFilter } from "@/lib/types"

const filterLabels: Record<SearchFilter, string> = {
  all: "All",
  news: "News",
  event: "Events",
  resource: "Resources",
  unit: "Units",
}

function resultIcon(type: SearchFilter) {
  switch (type) {
    case "news":
      return <FileText className="h-4 w-4 text-tsa-green-mid" />
    case "event":
      return <Calendar className="h-4 w-4 text-tsa-gold" />
    case "resource":
      return <Download className="h-4 w-4 text-tsa-green-light" />
    case "unit":
      return <Users className="h-4 w-4 text-tsa-green-deep" />
    default:
      return <Search className="h-4 w-4 text-muted-foreground" />
  }
}

export function GlobalSearch() {
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState<SearchFilter>("all")
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const index = useMemo(() => buildSearchIndex(), [])

  const results = useMemo(() => searchIndex(index, query, filter, 6), [filter, index, query])

  useEffect(() => {
    const onDocumentClick = (event: MouseEvent) => {
      const target = event.target as Node
      if (wrapperRef.current && !wrapperRef.current.contains(target)) {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", onDocumentClick)
    return () => document.removeEventListener("mousedown", onDocumentClick)
  }, [])

  return (
    <div ref={wrapperRef} className="relative w-full max-w-lg">
      <div className="flex items-center rounded-md border border-tsa-green-mid/30 bg-background/95 px-2">
        <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
        <input
          type="search"
          className="w-full bg-transparent px-2 py-1.5 text-sm text-foreground outline-none placeholder:text-muted-foreground"
          placeholder="Search news, events, resources, units"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          aria-label="Global site search"
        />
        <select
          value={filter}
          onChange={(event) => setFilter(event.target.value as SearchFilter)}
          className="max-w-28 rounded-md border border-transparent bg-secondary px-2 py-1 text-xs text-secondary-foreground outline-none focus-visible:border-tsa-green-mid"
          aria-label="Search category"
        >
          {Object.keys(filterLabels).map((value) => (
            <option key={value} value={value}>
              {filterLabels[value as SearchFilter]}
            </option>
          ))}
        </select>
      </div>

      {open && query.trim() && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-md border border-border bg-card shadow-xl">
          {results.length === 0 ? (
            <p className="px-3 py-4 text-sm text-muted-foreground">No results found.</p>
          ) : (
            <ul>
              {results.map((result) => (
                <li key={`${result.type}-${result.url}`}>
                  <Link
                    href={result.url}
                    className="flex items-start gap-2 px-3 py-2.5 transition-colors hover:bg-secondary"
                    onClick={() => {
                      setOpen(false)
                      setQuery("")
                    }}
                  >
                    <span className="mt-0.5">{resultIcon(result.type)}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-card-foreground">
                        {result.title}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">{result.description}</span>
                    </span>
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                      {filterLabels[result.type]}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
