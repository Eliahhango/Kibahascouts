import type { LucideIcon } from "lucide-react"

type DashboardCardItem = {
  title: string
  value: number
  description: string
  icon: LucideIcon
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
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <item.icon className="h-5 w-5" />
            </span>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">{item.description}</p>
        </article>
      ))}
    </div>
  )
}
