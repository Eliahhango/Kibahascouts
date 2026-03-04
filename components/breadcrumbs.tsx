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
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-2.5">
        <ol className="flex min-w-0 flex-wrap items-center gap-1.5 text-sm">
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
            <li key={i} className="flex min-w-0 items-center gap-1.5">
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" aria-hidden="true" />
              {item.href ? (
                <Link
                  href={item.href}
                  className="max-w-[10rem] truncate rounded text-muted-foreground transition-colors hover:text-tsa-green-deep focus-visible:ring-2 focus-visible:ring-ring sm:max-w-[14rem] md:max-w-none"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="max-w-[11rem] truncate font-medium text-foreground sm:max-w-[16rem] md:max-w-none" aria-current="page">
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
