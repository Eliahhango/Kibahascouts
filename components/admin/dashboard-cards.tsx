import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import { AlertTriangle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

type DashboardCardItem = {
  href: string
  title: string
  value: number
  description: string
  icon: LucideIcon
  accent: "purple" | "blue" | "green" | "amber"
  error?: string | null
}

type DashboardCardsProps = {
  items: DashboardCardItem[]
}

const accentClasses: Record<DashboardCardItem["accent"], { border: string; icon: string; spark: string }> = {
  purple: {
    border: "border-l-violet-500",
    icon: "text-violet-700",
    spark: "bg-violet-500",
  },
  blue: {
    border: "border-l-blue-500",
    icon: "text-blue-700",
    spark: "bg-blue-500",
  },
  green: {
    border: "border-l-emerald-500",
    icon: "text-emerald-700",
    spark: "bg-emerald-500",
  },
  amber: {
    border: "border-l-amber-500",
    icon: "text-amber-700",
    spark: "bg-amber-500",
  },
}

export function DashboardCards({ items }: DashboardCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => {
        const accent = accentClasses[item.accent]
        const trendWidth = Math.min(100, Math.max(0, item.value))

        return (
          <Link
            key={item.title}
            href={item.href}
            className={`rounded-xl border border-l-4 border-border ${accent.border} bg-card p-5 shadow-sm transition-transform hover:-translate-y-0.5`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-muted-foreground">{item.title}</p>
                <div className="mt-1 flex items-center gap-2">
                  <p className="text-3xl font-bold text-card-foreground">{item.value}</p>
                  {item.value > 0 ? (
                    <span className="rounded-full border border-emerald-300 bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                      Live
                    </span>
                  ) : null}
                </div>
              </div>
              {item.error ? (
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                </span>
              ) : (
                <span className={`inline-flex h-10 w-10 items-center justify-center ${accent.icon}`}>
                  <item.icon className="h-5 w-5" />
                </span>
              )}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">{item.description}</p>
            <div className="mt-3 h-1.5 w-full rounded-full bg-secondary">
              <div
                className={`h-1.5 rounded-full ${accent.spark}`}
                style={{ width: `${trendWidth}%` }}
                aria-hidden="true"
              />
            </div>
            {item.error ? <p className="mt-2 text-xs font-medium text-destructive">Data fallback active: {item.error}</p> : null}
          </Link>
        )
      })}
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
