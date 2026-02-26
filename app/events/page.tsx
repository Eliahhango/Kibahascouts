import type { Metadata } from "next"
import Link from "next/link"
import { CalendarDays, Clock3, List, MapPin } from "lucide-react"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { getEventsFromCms } from "@/lib/cms"

export const metadata: Metadata = {
  title: "Events",
  description: "Upcoming and past TSA Kibaha District events, trainings, and district activities.",
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
  const scoutEvents = await getEventsFromCms()
  const selectedView = params.view === "calendar" ? "calendar" : "list"
  const showPast = params.past === "true"
  const today = new Date()

  const orderedEvents = [...scoutEvents].sort((a, b) => +toDate(a.date) - +toDate(b.date))
  const visibleEvents = orderedEvents.filter((event) => (showPast ? true : toDate(event.date) >= today))
  const monthBase = visibleEvents[0] || orderedEvents[0]
  const monthDate = monthBase ? toDate(monthBase.date) : new Date()
  const monthYearLabel = monthDate.toLocaleDateString("en-GB", { month: "long", year: "numeric" })
  const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate()
  const firstWeekday = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1).getDay()
  const eventLookup = new Map<number, typeof visibleEvents>()

  visibleEvents
    .filter((event) => {
      const eventDate = toDate(event.date)
      return eventDate.getMonth() === monthDate.getMonth() && eventDate.getFullYear() === monthDate.getFullYear()
    })
    .forEach((event) => {
      const day = toDate(event.date).getDate()
      const existing = eventLookup.get(day) || []
      eventLookup.set(day, [...existing, event])
    })

  return (
    <>
      <Breadcrumbs items={[{ label: "Events" }]} />

      <section className="bg-background py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4">
          <h1 className="text-3xl font-bold text-foreground md:text-4xl">Events</h1>
          <p className="mt-3 max-w-3xl text-base leading-relaxed text-muted-foreground">
            Browse all district activities, training weekends, and ceremonies. Switch between calendar and list views.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <Link
              href={`/events${showPast ? "?past=true" : ""}`}
              className={`inline-flex items-center gap-1 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                selectedView === "list"
                  ? "bg-tsa-green-deep text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-border"
              }`}
            >
              <List className="h-4 w-4" />
              List
            </Link>
            <Link
              href={`/events?view=calendar${showPast ? "&past=true" : ""}`}
              className={`inline-flex items-center gap-1 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                selectedView === "calendar"
                  ? "bg-tsa-green-deep text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-border"
              }`}
            >
              <CalendarDays className="h-4 w-4" />
              Calendar
            </Link>
            <Link
              href={`/events${selectedView === "calendar" ? "?view=calendar" : ""}`}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                !showPast ? "bg-tsa-gold text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-border"
              }`}
            >
              Upcoming
            </Link>
            <Link
              href={`/events?past=true${selectedView === "calendar" ? "&view=calendar" : ""}`}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                showPast ? "bg-tsa-gold text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-border"
              }`}
            >
              Include Past
            </Link>
          </div>
        </div>
      </section>

      {selectedView === "calendar" ? (
        <section className="bg-secondary py-12" aria-labelledby="calendar-view">
          <div className="mx-auto max-w-7xl px-4">
            <h2 id="calendar-view" className="text-2xl font-bold text-foreground">
              Calendar View: {monthYearLabel}
            </h2>
            <div className="mt-6 overflow-hidden rounded-lg border border-border bg-card">
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
                        {dayEvents.length > 2 && (
                          <p className="text-[11px] text-muted-foreground">+{dayEvents.length - 2} more</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className="bg-secondary py-12" aria-labelledby="list-view">
          <div className="mx-auto max-w-7xl px-4">
            <h2 id="list-view" className="sr-only">
              Event list
            </h2>
            <div className="space-y-4">
              {visibleEvents.map((event) => {
                const eventDate = toDate(event.date)
                return (
                  <article key={event.id} className="rounded-lg border border-border bg-card p-5">
                    <Link href={`/events/${event.slug}`} className="group block focus-visible:ring-2 focus-visible:ring-ring">
                      <div className="flex flex-wrap items-start gap-4">
                        <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-md bg-tsa-green-deep text-primary-foreground">
                          <span className="text-lg font-bold leading-none">{eventDate.getDate()}</span>
                          <span className="text-xs uppercase">
                            {eventDate.toLocaleDateString("en-GB", { month: "short" })}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-lg font-bold text-card-foreground group-hover:text-tsa-green-deep">
                            {event.title}
                          </h3>
                          <p className="mt-1 text-sm text-muted-foreground">{event.description}</p>
                          <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                            <span className="inline-flex items-center gap-1">
                              <Clock3 className="h-3.5 w-3.5" />
                              {event.time}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5" />
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
          </div>
        </section>
      )}
    </>
  )
}
