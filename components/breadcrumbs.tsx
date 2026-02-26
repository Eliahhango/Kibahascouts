import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"

interface BreadcrumbItem {
  label: string
  href?: string
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="border-b border-border bg-secondary"
    >
      <div className="mx-auto max-w-7xl px-4 py-2.5">
        <ol className="flex flex-wrap items-center gap-1.5 text-sm">
          <li>
            <Link
              href="/"
              className="flex items-center gap-1 text-muted-foreground transition-colors hover:text-tsa-green-deep focus-visible:ring-2 focus-visible:ring-ring rounded"
              aria-label="Home"
            >
              <Home className="h-3.5 w-3.5" />
              <span className="sr-only">Home</span>
            </Link>
          </li>
          {items.map((item, i) => (
            <li key={i} className="flex items-center gap-1.5">
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" aria-hidden="true" />
              {item.href ? (
                <Link
                  href={item.href}
                  className="text-muted-foreground transition-colors hover:text-tsa-green-deep focus-visible:ring-2 focus-visible:ring-ring rounded"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="font-medium text-foreground" aria-current="page">
                  {item.label}
                </span>
              )}
            </li>
          ))}
        </ol>
      </div>
    </nav>
  )
}
