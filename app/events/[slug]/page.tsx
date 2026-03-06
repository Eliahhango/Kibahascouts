import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { CalendarDays, Clock3, Download, MapPin } from "lucide-react"
import { EventLocationMap } from "@/components/events/event-location-map"
import { PageHero } from "@/components/public/page-hero"
import { SectionShell } from "@/components/public/section-shell"
import { getEventsFromCms } from "@/lib/cms"
import { hasValidCoordinates } from "@/lib/maps"
import { hasRichTextMarkup, sanitizeRichTextHtml } from "@/lib/rich-text"

export async function generateStaticParams() {
  const scoutEvents = (await getEventsFromCms()).filter((event) => event.published !== false)
  return scoutEvents.map((event) => ({ slug: event.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const scoutEvents = (await getEventsFromCms()).filter((item) => item.published !== false)
  const event = scoutEvents.find((item) => item.slug === slug)

  if (!event) return { title: "Event Not Found" }

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
  const scoutEvents = (await getEventsFromCms()).filter((item) => item.published !== false)
  const event = scoutEvents.find((item) => item.slug === slug)
  if (!event) notFound()

  const related = scoutEvents.filter((item) => item.id !== event.id).slice(0, 3)
  const hasRegistrationUrl = Boolean(event.registrationUrl && /^https?:\/\//.test(event.registrationUrl))
  const hasMapCoordinates = hasValidCoordinates(event.latitude, event.longitude)
  const fallbackMapUrl =
    event.mapUrl && event.mapUrl.includes("output=embed") ? event.mapUrl : mapEmbedUrl(event.location)
  const dateLabel = new Date(event.date).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })
  const sanitizedDescriptionHtml = sanitizeRichTextHtml(event.descriptionHtml || event.description)
  const hasRichDescription = hasRichTextMarkup(sanitizedDescriptionHtml)

  return (
    <>
      <PageHero
        title={event.title}
        subtitle={event.description}
        breadcrumbs={[{ label: "Events", href: "/events" }, { label: event.title }]}
      />

      <SectionShell eyebrow="Event Details" title="Overview" tone="background">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <article>
            {hasRichDescription ? (
              <div
                className="prose prose-sm max-w-3xl text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: sanitizedDescriptionHtml }}
              />
            ) : (
              <p className="max-w-3xl text-base leading-relaxed text-muted-foreground">{event.description}</p>
            )}

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="card-shell p-4">
                <p className="eyebrow">Date</p>
                <p className="mt-1 inline-flex items-center gap-2 text-base font-semibold text-foreground">
                  <CalendarDays className="h-4 w-4 text-tsa-green-deep" />
                  {dateLabel}
                </p>
              </div>
              <div className="card-shell p-4">
                <p className="eyebrow">Time</p>
                <p className="mt-1 inline-flex items-center gap-2 text-base font-semibold text-foreground">
                  <Clock3 className="h-4 w-4 text-tsa-green-deep" />
                  {event.time}
                </p>
              </div>
              <div className="card-shell p-4 sm:col-span-2">
                <p className="eyebrow">Location</p>
                <p className="mt-1 inline-flex items-center gap-2 text-base font-semibold text-foreground">
                  <MapPin className="h-4 w-4 text-tsa-green-deep" />
                  {event.location}
                </p>
              </div>
            </div>
          </article>

          <aside className="card-shell p-5">
            <h3 className="text-lg font-semibold text-foreground">Registration</h3>
            <p className="mt-2 text-base text-muted-foreground">
              {event.registrationOpen
                ? "Registration is open. Complete participant information and parent/guardian permissions."
                : "Online registration is currently closed for this event."}
            </p>
            {event.registrationOpen && hasRegistrationUrl ? (
              <Link href={event.registrationUrl!} target="_blank" rel="noreferrer" className="btn-primary mt-4 w-full">
                Register Now
              </Link>
            ) : (
              <p className="mt-4 rounded-lg bg-secondary px-4 py-2 text-center text-sm font-semibold text-muted-foreground">
                {event.registrationOpen ? "Registration link will be available soon" : "Registration Closed"}
              </p>
            )}
            <Link href="/resources?category=Forms" className="btn-ghost mt-4 inline-flex items-center gap-1">
              <Download className="h-4 w-4" />
              Download Permission Slip
            </Link>
          </aside>
        </div>
      </SectionShell>

      <SectionShell eyebrow="Location" title="Event Location Map" tone="white">
        {hasMapCoordinates ? (
          <EventLocationMap
            latitude={event.latitude as number}
            longitude={event.longitude as number}
            mapZoom={event.mapZoom}
            title={event.title}
            location={event.location}
          />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border">
            <iframe
              src={fallbackMapUrl}
              title={`${event.title} map`}
              className="h-[320px] w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        )}
      </SectionShell>

      {related.length > 0 ? (
        <SectionShell eyebrow="More Events" title="Related Events" tone="background">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <Link key={item.id} href={`/events/${item.slug}`} className="card-shell p-5">
                <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                <p className="mt-2 text-base text-muted-foreground">{item.description}</p>
              </Link>
            ))}
          </div>
        </SectionShell>
      ) : null}
    </>
  )
}
