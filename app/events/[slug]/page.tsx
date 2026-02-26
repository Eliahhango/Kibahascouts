import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, CalendarDays, Clock3, Download, MapPin } from "lucide-react"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { getEventsFromCms } from "@/lib/cms"

export async function generateStaticParams() {
  const scoutEvents = await getEventsFromCms()
  return scoutEvents.map((event) => ({ slug: event.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const scoutEvents = await getEventsFromCms()
  const event = scoutEvents.find((item) => item.slug === slug)

  if (!event) {
    return { title: "Event Not Found" }
  }

  return {
    title: event.title,
    description: event.description,
  }
}

function mapEmbedUrl(location: string) {
  return `https://maps.google.com/maps?q=${encodeURIComponent(location)}&t=&z=13&ie=UTF8&iwloc=&output=embed`
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const scoutEvents = await getEventsFromCms()
  const event = scoutEvents.find((item) => item.slug === slug)
  if (!event) notFound()

  const related = scoutEvents.filter((item) => item.id !== event.id).slice(0, 3)
  const dateLabel = new Date(event.date).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Events", href: "/events" },
          { label: event.title },
        ]}
      />

      <section className="bg-background py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4">
          <Link
            href="/events"
            className="inline-flex items-center gap-1 rounded text-sm text-tsa-green-deep transition-colors hover:text-tsa-green-mid focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Events
          </Link>

          <div className="mt-4 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <article>
              <h1 className="text-balance text-3xl font-bold text-foreground md:text-4xl">{event.title}</h1>
              <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground">{event.description}</p>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-border bg-card p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Date</p>
                  <p className="mt-1 inline-flex items-center gap-2 text-sm font-semibold text-card-foreground">
                    <CalendarDays className="h-4 w-4 text-tsa-green-deep" />
                    {dateLabel}
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-card p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Time</p>
                  <p className="mt-1 inline-flex items-center gap-2 text-sm font-semibold text-card-foreground">
                    <Clock3 className="h-4 w-4 text-tsa-green-deep" />
                    {event.time}
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-card p-4 sm:col-span-2">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Location</p>
                  <p className="mt-1 inline-flex items-center gap-2 text-sm font-semibold text-card-foreground">
                    <MapPin className="h-4 w-4 text-tsa-green-deep" />
                    {event.location}
                  </p>
                </div>
              </div>
            </article>

            <aside className="rounded-lg border border-border bg-card p-5">
              <h2 className="text-xl font-bold text-card-foreground">Registration</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {event.registrationOpen
                  ? "Registration is open. Secure your place and complete parent/guardian permissions in advance."
                  : "Online registration is currently closed for this event."}
              </p>
              <button
                type="button"
                className={`mt-4 w-full rounded-md px-4 py-2 text-sm font-semibold ${
                  event.registrationOpen
                    ? "bg-tsa-green-deep text-primary-foreground hover:bg-tsa-green-mid"
                    : "cursor-not-allowed bg-secondary text-muted-foreground"
                }`}
                disabled={!event.registrationOpen}
              >
                {event.registrationOpen ? "Register Now" : "Registration Closed"}
              </button>
              <Link
                href="/resources?category=Forms"
                className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-tsa-green-deep hover:text-tsa-green-mid"
              >
                <Download className="h-4 w-4" />
                Download Permission Slip
              </Link>
            </aside>
          </div>
        </div>
      </section>

      <section className="bg-secondary py-12">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-2xl font-bold text-foreground">Event Location Map</h2>
          <div className="mt-4 overflow-hidden rounded-lg border border-border">
            <iframe
              src={event.mapUrl || mapEmbedUrl(event.location)}
              title={`${event.title} map`}
              className="h-[320px] w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>

      <section className="bg-background py-12">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-2xl font-bold text-foreground">Related Events</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <Link
                key={item.id}
                href={`/events/${item.slug}`}
                className="rounded-lg border border-border bg-card p-5 transition-colors hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring"
              >
                <h3 className="text-base font-semibold text-card-foreground">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
