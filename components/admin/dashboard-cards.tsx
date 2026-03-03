import type { LucideIcon } from "lucide-react"
import { AlertTriangle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

type DashboardCardItem = {
  title: string
  value: number
  description: string
  icon: LucideIcon
  error?: string | null
}

type DashboardCardsProps = {
  items: DashboardCardItem[]
}

export function DashboardCards({ items }: DashboardCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <article key={item.title} className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm text-muted-foreground">{item.title}</p>
              <p className="mt-1 text-3xl font-bold text-card-foreground">{item.value}</p>
            </div>
            {item.error ? (
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <AlertTriangle className="h-5 w-5" />
              </span>
            ) : (
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <item.icon className="h-5 w-5" />
              </span>
            )}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">{item.description}</p>
          {item.error ? <p className="mt-2 text-xs font-medium text-destructive">Data fallback active: {item.error}</p> : null}
        </article>
      ))}
    </div>
  )
}

export function DashboardCardsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <article key={`dashboard-skeleton-${index}`} className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16" />
            </div>
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
          <Skeleton className="mt-4 h-3 w-full" />
        </article>
      ))}
    </div>
  )
}
