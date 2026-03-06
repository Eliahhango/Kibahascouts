import type { Metadata } from "next"
import Link from "next/link"
import { CalendarDays, Clock3, List, MapPin } from "lucide-react"
import { PageHero } from "@/components/public/page-hero"
import { SectionShell } from "@/components/public/section-shell"
import { getEventsFromCms, getSiteContentSettingsFromCms } from "@/lib/cms"
import { normalizePublicText } from "@/lib/public-text"

export const metadata: Metadata = {
  title: "Events",
  description: "Upcoming and past Kibaha Scouts events, trainings, and district activities.",
}

type SearchParams = {
  view?: string
  past?: string
}

function toDate(value: string) {
  return new Date(`${value}T00:00:00`)
}

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const [events, siteContent] = await Promise.all([getEventsFromCms(), getSiteContentSettingsFromCms()])
  const pageContent = siteContent.eventsPage
  const scoutEvents = events.filter((event) => event.published !== false)
  const selectedView = params.view === "calendar" ? "calendar" : "list"
  const showPast = params.past === "true"
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const orderedEvents = [...scoutEvents].sort((a, b) => +toDate(a.date) - +toDate(b.date))
  const visibleEvents = orderedEvents.filter((event) => (showPast ? true : toDate(event.date) >= today))
  const shouldAutoIncludePast = !showPast && visibleEvents.length === 0 && orderedEvents.length > 0
  const effectiveEvents = shouldAutoIncludePast ? orderedEvents : visibleEvents
  const monthBase = effectiveEvents[0] || orderedEvents[0]
  const monthDate = monthBase ? toDate(monthBase.date) : new Date()
  const monthYearLabel = monthDate.toLocaleDateString("en-GB", { month: "long", year: "numeric" })
  const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate()
  const firstWeekday = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1).getDay()
  const eventLookup = new Map<number, typeof effectiveEvents>()

  effectiveEvents
    .filter((event) => {
      const eventDate = toDate(event.date)
      return eventDate.getMonth() === monthDate.getMonth() && eventDate.getFullYear() === monthDate.getFullYear()
    })
    .forEach((event) => {
      const day = toDate(event.date).getDate()
      const existing = eventLookup.get(day) || []
      eventLookup.set(day, [...existing, event])
    })

  const subtitle = shouldAutoIncludePast
    ? `${normalizePublicText(pageContent.description)} Showing past published events because no upcoming events are scheduled.`
    : normalizePublicText(pageContent.description)

  return (
    <>
      <PageHero
        title={normalizePublicText(pageContent.title, "Events")}
        subtitle={subtitle}
        breadcrumbs={[{ label: "Events" }]}
      />

      <SectionShell eyebrow="Filter" title="Browse Events" tone="background">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/events${showPast ? "?past=true" : ""}`}
            className={`inline-flex min-h-11 items-center gap-1 rounded-full px-4 py-1.5 text-sm font-semibold ${
              selectedView === "list"
                ? "bg-tsa-green-deep text-white"
                : "bg-secondary text-foreground hover:bg-border"
            }`}
          >
            <List className="h-4 w-4" />
            List
          </Link>
          <Link
            href={`/events?view=calendar${showPast ? "&past=true" : ""}`}
            className={`inline-flex min-h-11 items-center gap-1 rounded-full px-4 py-1.5 text-sm font-semibold ${
              selectedView === "calendar"
                ? "bg-tsa-green-deep text-white"
                : "bg-secondary text-foreground hover:bg-border"
            }`}
          >
            <CalendarDays className="h-4 w-4" />
            Calendar
          </Link>
          <Link
            href={`/events${selectedView === "calendar" ? "?view=calendar" : ""}`}
            className={`inline-flex min-h-11 items-center rounded-full px-4 py-1.5 text-sm font-semibold ${
              !showPast ? "bg-tsa-gold text-white" : "bg-secondary text-foreground hover:bg-border"
            }`}
          >
            Upcoming
          </Link>
          <Link
            href={`/events?past=true${selectedView === "calendar" ? "&view=calendar" : ""}`}
            className={`inline-flex min-h-11 items-center rounded-full px-4 py-1.5 text-sm font-semibold ${
              showPast ? "bg-tsa-gold text-white" : "bg-secondary text-foreground hover:bg-border"
            }`}
          >
            Include Past
          </Link>
        </div>
      </SectionShell>

      {effectiveEvents.length > 0 && selectedView === "calendar" ? (
        <SectionShell eyebrow="Calendar" title={`Calendar View: ${monthYearLabel}`} tone="white">
          <div className="overflow-x-auto rounded-2xl border border-border bg-white">
            <div className="min-w-[700px]">
              <div className="grid grid-cols-7 border-b border-border bg-secondary text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day} className="px-2 py-2">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7">
                {Array.from({ length: firstWeekday }).map((_, index) => (
                  <div key={`offset-${index}`} className="min-h-24 border-b border-r border-border bg-background" />
                ))}
                {Array.from({ length: daysInMonth }).map((_, index) => {
                  const day = index + 1
                  const dayEvents = eventLookup.get(day) || []

                  return (
                    <div key={`day-${day}`} className="min-h-24 border-b border-r border-border p-2">
                      <p className="text-xs font-semibold text-foreground">{day}</p>
                      <div className="mt-1 space-y-1">
                        {dayEvents.slice(0, 2).map((event) => (
                          <Link
                            key={event.id}
                            href={`/events/${event.slug}`}
                            className="block rounded bg-tsa-green-deep/10 px-1.5 py-1 text-[11px] leading-tight text-tsa-green-deep"
                          >
                            {event.title}
                          </Link>
                        ))}
                        {dayEvents.length > 2 ? (
                          <p className="text-[11px] text-muted-foreground">+{dayEvents.length - 2} more</p>
                        ) : null}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </SectionShell>
      ) : null}

      {effectiveEvents.length > 0 && selectedView === "list" ? (
        <SectionShell eyebrow="Schedule" title="Event List" tone="background">
          <div className="space-y-4">
            {effectiveEvents.map((event) => {
              const eventDate = toDate(event.date)
              return (
                <article key={event.id} className="card-shell p-5">
                  <Link href={`/events/${event.slug}`} className="group block">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-[auto_1fr]">
                      <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-tsa-green-deep text-center text-white">
                        <div>
                          <p className="text-2xl font-bold leading-none">{eventDate.getDate()}</p>
                          <p className="text-xs uppercase">
                            {eventDate.toLocaleDateString("en-GB", { month: "short" })}
                          </p>
                        </div>
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-lg font-semibold text-foreground">{event.title}</h3>
                        <p className="mt-2 text-base leading-relaxed text-muted-foreground">{event.description}</p>
                        <div className="mt-2 flex flex-wrap gap-3 text-sm text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <Clock3 className="h-4 w-4 text-tsa-green-deep" />
                            {event.time}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-4 w-4 text-tsa-green-deep" />
                            {event.location}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </article>
              )
            })}
          </div>
        </SectionShell>
      ) : null}
    </>
  )
}
