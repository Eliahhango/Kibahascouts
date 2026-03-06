"use client"

import { Area, AreaChart, Cell, Line, Pie, PieChart, CartesianGrid, XAxis } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import type { DashboardContentBreakdownItem, DashboardVisitPoint } from "@/lib/firebase/admin-dashboard"

type DashboardActivityOverviewProps = {
  visitsSeries: DashboardVisitPoint[]
  contentBreakdown: DashboardContentBreakdownItem[]
}

const chartConfig = {
  visits: {
    label: "Daily Visits",
    color: "#1e3a2f",
  },
} as const

export function DashboardActivityOverview({ visitsSeries, contentBreakdown }: DashboardActivityOverviewProps) {
  return (
    <section className="mt-8 space-y-3">
      <div>
        <p className="inline-flex rounded-full bg-[#1e3a2f]/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#1e3a2f]">
          Last 30 days
        </p>
        <h2 className="mt-2 text-xl font-semibold text-foreground">Activity Overview</h2>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
        <article className="rounded-xl border border-border bg-white p-4 shadow-sm xl:col-span-3">
          <h3 className="text-sm font-semibold text-foreground">Daily Site Visits</h3>
          <p className="mt-1 text-xs text-muted-foreground">Traffic trend captured from public website telemetry.</p>

          <ChartContainer config={chartConfig} className="mt-4 h-[12rem] w-full sm:h-[18rem]">
            <AreaChart data={visitsSeries}>
              <defs>
                <linearGradient id="visits-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#c9910a" stopOpacity={0.26} />
                  <stop offset="95%" stopColor="#c9910a" stopOpacity={0.04} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="label"
                interval={4}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Area
                type="monotone"
                dataKey="visits"
                stroke="#c9910a"
                fill="url(#visits-fill)"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="visits"
                stroke="#1e3a2f"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 4, fill: "#1e3a2f" }}
              />
            </AreaChart>
          </ChartContainer>
        </article>

        <article className="rounded-xl border border-border bg-white p-4 shadow-sm xl:col-span-2">
          <h3 className="text-sm font-semibold text-foreground">Content Breakdown</h3>
          <p className="mt-1 text-xs text-muted-foreground">Published content split by module.</p>

          <div className="mt-4 flex justify-center">
            <ChartContainer config={{}} className="h-[10rem] w-full max-w-[16rem] sm:h-[14rem]">
              <PieChart>
                <Pie
                  data={contentBreakdown}
                  dataKey="value"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={78}
                  paddingAngle={3}
                >
                  {contentBreakdown.map((entry) => (
                    <Cell key={entry.key} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent formatter={(value, name) => [`${value}`, `${name}`]} />}
                />
              </PieChart>
            </ChartContainer>
          </div>

          <div className="mt-2 space-y-2">
            {contentBreakdown.map((item) => (
              <div key={item.key} className="flex items-center justify-between text-xs">
                <span className="inline-flex items-center gap-2 text-muted-foreground">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.label}
                </span>
                <span className="font-semibold text-foreground">
                  {item.percentage}% ({item.value})
                </span>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  )
}
