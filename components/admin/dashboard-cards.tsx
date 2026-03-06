import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import { AlertTriangle, ArrowUpRight, Minus, TrendingDown, TrendingUp } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

type DashboardCardTone = "green" | "gold" | "slate"

type DashboardCardTrend = {
  direction: "up" | "down" | "flat"
  text: string
}

type DashboardCardItem = {
  href: string
  title: string
  value: number
  description: string
  icon: LucideIcon
  tone: DashboardCardTone
  trend: DashboardCardTrend
  progress: number
  error?: string | null
}

type DashboardCardsProps = {
  items: DashboardCardItem[]
}

const toneClasses: Record<
  DashboardCardTone,
  {
    border: string
    iconWrap: string
    iconColor: string
    progress: string
    trend: string
  }
> = {
  green: {
    border: "border-l-[#1e3a2f]",
    iconWrap: "bg-[#1e3a2f]/10",
    iconColor: "text-[#1e3a2f]",
    progress: "bg-[#1e3a2f]",
    trend: "text-[#1e3a2f]",
  },
  gold: {
    border: "border-l-[#c9910a]",
    iconWrap: "bg-[#c9910a]/15",
    iconColor: "text-[#b27d05]",
    progress: "bg-[#c9910a]",
    trend: "text-[#b27d05]",
  },
  slate: {
    border: "border-l-slate-500",
    iconWrap: "bg-slate-100",
    iconColor: "text-slate-700",
    progress: "bg-slate-500",
    trend: "text-slate-600",
  },
}

function TrendIcon({ direction }: { direction: DashboardCardTrend["direction"] }) {
  if (direction === "up") {
    return <TrendingUp className="h-3.5 w-3.5" />
  }

  if (direction === "down") {
    return <TrendingDown className="h-3.5 w-3.5" />
  }

  return <Minus className="h-3.5 w-3.5" />
}

export function DashboardCards({ items }: DashboardCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => {
        const tone = toneClasses[item.tone]
        const progress = Math.max(6, Math.min(100, item.progress))

        return (
          <Link
            key={item.title}
            href={item.href}
            className={cn(
              "group relative cursor-pointer rounded-xl border border-border border-l-4 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md",
              tone.border,
            )}
          >
            <ArrowUpRight className="absolute right-4 top-4 h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />

            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{item.title}</p>
                <p className="mt-2 text-3xl font-bold text-card-foreground">{item.value.toLocaleString()}</p>
              </div>
              <span className={cn("inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg", tone.iconWrap)}>
                {item.error ? (
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                ) : (
                  <item.icon className={cn("h-5 w-5", tone.iconColor)} />
                )}
              </span>
            </div>

            <p className="mt-3 text-sm text-muted-foreground">{item.description}</p>

            <p className={cn("mt-3 inline-flex items-center gap-1 text-xs font-semibold", item.trend.direction === "flat" ? "text-slate-500" : tone.trend)}>
              <TrendIcon direction={item.trend.direction} />
              {item.trend.text}
            </p>

            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
              <div className={cn("h-full rounded-full", tone.progress)} style={{ width: `${progress}%` }} aria-hidden="true" />
            </div>

            {item.error ? <p className="mt-2 text-xs font-medium text-destructive">Data fallback active: {item.error}</p> : null}

            <p className="mt-3 inline-flex items-center text-xs font-semibold text-[#1e3a2f]">
              <span className="transition-transform group-hover:translate-x-0.5">→ View all</span>
            </p>
          </Link>
        )
      })}
    </div>
  )
}

export function DashboardCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <article key={`dashboard-skeleton-${index}`} className="rounded-xl border border-border bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-8 w-16" />
            </div>
            <Skeleton className="h-11 w-11 rounded-lg" />
          </div>
          <Skeleton className="mt-3 h-4 w-full" />
          <Skeleton className="mt-3 h-3 w-24" />
          <Skeleton className="mt-3 h-1.5 w-full" />
        </article>
      ))}
    </div>
  )
}
