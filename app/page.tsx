import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Download, MapPin, Clock, Play, ChevronRight } from "lucide-react"
import { campaigns } from "@/lib/data"
import { getEventsFromCms, getNewsFromCms, getResourcesFromCms } from "@/lib/cms"

export default async function HomePage() {
  const [newsArticles, scoutEvents, resources] = await Promise.all([
    getNewsFromCms(),
    getEventsFromCms(),
    getResourcesFromCms(),
  ])
  const featuredNews = newsArticles.find((n) => n.featured) || newsArticles[0]
  const latestNews = newsArticles.filter((n) => n.id !== featuredNews.id).slice(0, 4)
  const upcomingEvents = scoutEvents.slice(0, 5)
  const topResources = resources.slice(0, 6)

  return (
    <>
      {/* ── Hero Banner ──────────────────────────────── */}
      <section className="relative bg-tsa-green-deep" aria-label="Featured story">
        <div className="absolute inset-0">
          <Image
            src="/images/hero-scouts.jpg"
            alt=""
            fill
            className="object-cover opacity-40"
            priority
            sizes="100vw"
          />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-16 md:py-24 lg:py-32">
          <div className="max-w-2xl">
            <span className="mb-3 inline-block rounded-full bg-tsa-gold px-3 py-1 text-xs font-semibold uppercase tracking-wider text-tsa-green-deep">
              Featured Story
            </span>
            <h1 className="text-balance text-3xl font-bold leading-tight text-primary-foreground md:text-4xl lg:text-5xl">
              {featuredNews.title}
            </h1>
            <p className="mt-4 text-base leading-relaxed text-primary-foreground/90 md:text-lg">
              {featuredNews.summary}
            </p>
            <Link
              href={`/newsroom/${featuredNews.slug}`}
              className="mt-6 inline-flex items-center gap-2 rounded-md bg-tsa-gold px-5 py-2.5 text-sm font-semibold text-tsa-green-deep transition-colors hover:bg-tsa-gold-light focus-visible:ring-2 focus-visible:ring-tsa-gold focus-visible:ring-offset-2"
            >
              Read More
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Latest News ──────────────────────────────── */}
      <section className="bg-background py-12 md:py-16" aria-labelledby="latest-news-heading">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 id="latest-news-heading" className="text-2xl font-bold text-foreground md:text-3xl">
                Latest News
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Stay updated with the latest from TSA Kibaha District
              </p>
            </div>
            <Link
              href="/newsroom"
              className="hidden items-center gap-1 text-sm font-medium text-tsa-green-deep transition-colors hover:text-tsa-green-mid md:flex focus-visible:ring-2 focus-visible:ring-ring rounded"
            >
              All news <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {latestNews.map((article) => (
              <Link
                key={article.id}
                href={`/newsroom/${article.slug}`}
                className="group flex flex-col rounded-lg border border-border bg-card transition-shadow hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="relative aspect-[16/10] overflow-hidden rounded-t-lg">
                  <Image
                    src={article.image}
                    alt={article.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                  <span className="absolute left-3 top-3 rounded bg-tsa-green-deep/90 px-2 py-0.5 text-xs font-medium text-primary-foreground">
                    {article.category}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <time className="text-xs text-muted-foreground" dateTime={article.date}>
                    {new Date(article.date).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </time>
                  <h3 className="mt-2 text-sm font-semibold leading-snug text-card-foreground group-hover:text-tsa-green-deep">
                    {article.title}
                  </h3>
                  <p className="mt-2 flex-1 text-xs leading-relaxed text-muted-foreground line-clamp-2">
                    {article.summary}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          <Link
            href="/newsroom"
            className="mt-6 flex items-center gap-1 text-sm font-medium text-tsa-green-deep transition-colors hover:text-tsa-green-mid md:hidden focus-visible:ring-2 focus-visible:ring-ring rounded"
          >
            All news <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ── Highlights / Initiatives ─────────────────── */}
      <section className="bg-secondary py-12 md:py-16" aria-labelledby="highlights-heading">
        <div className="mx-auto max-w-7xl px-4">
          <h2 id="highlights-heading" className="mb-8 text-2xl font-bold text-foreground md:text-3xl">
            Highlights
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: "Membership Drive 2026",
                desc: "Goal: 2,000 youth scouts in Kibaha by year end. Join the movement and invite a friend today.",
                color: "bg-tsa-green-deep",
                textColor: "text-primary-foreground",
                link: "/join",
              },
              {
                title: "Community Service Hours",
                desc: "Kibaha scouts have contributed over 12,000 hours of community service in the past 12 months.",
                color: "bg-tsa-gold",
                textColor: "text-tsa-green-deep",
                link: "/newsroom?category=Community+Service",
              },
              {
                title: "Leader Training Programme",
                desc: "New BULT sessions are open for registration. Equip yourself to guide the next generation of scouts.",
                color: "bg-tsa-green-mid",
                textColor: "text-primary-foreground",
                link: "/events/leader-training-weekend",
              },
              {
                title: "New Scout Hall",
                desc: "Construction is underway on a dedicated headquarters and training center for Kibaha District scouts.",
                color: "bg-foreground",
                textColor: "text-background",
                link: "/newsroom/new-scout-hall-construction-begins",
              },
            ].map((highlight) => (
              <Link
                key={highlight.title}
                href={highlight.link}
                className={`group flex flex-col justify-between rounded-lg p-6 ${highlight.color} ${highlight.textColor} transition-shadow hover:shadow-lg focus-visible:ring-2 focus-visible:ring-ring`}
              >
                <div>
                  <h3 className="text-lg font-bold">{highlight.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed opacity-90">
                    {highlight.desc}
                  </p>
                </div>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium opacity-80 group-hover:opacity-100">
                  Learn more <ChevronRight className="h-4 w-4" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Upcoming Events ──────────────────────────── */}
      <section className="bg-background py-12 md:py-16" aria-labelledby="events-heading">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 id="events-heading" className="text-2xl font-bold text-foreground md:text-3xl">
                Upcoming Events
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Mark your calendar for these important dates
              </p>
            </div>
            <Link
              href="/events"
              className="hidden items-center gap-1 text-sm font-medium text-tsa-green-deep transition-colors hover:text-tsa-green-mid md:flex focus-visible:ring-2 focus-visible:ring-ring rounded"
            >
              All events <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="space-y-3">
            {upcomingEvents.map((event) => {
              const eventDate = new Date(event.date)
              return (
                <Link
                  key={event.id}
                  href={`/events/${event.slug}`}
                  className="group flex items-start gap-4 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {/* Date block */}
                  <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-md bg-tsa-green-deep text-primary-foreground">
                    <span className="text-lg font-bold leading-none">
                      {eventDate.getDate()}
                    </span>
                    <span className="text-xs uppercase">
                      {eventDate.toLocaleDateString("en-GB", { month: "short" })}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-card-foreground group-hover:text-tsa-green-deep md:text-base">
                      {event.title}
                    </h3>
                    <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {event.time}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {event.location}
                      </span>
                    </div>
                  </div>
                  {event.registrationOpen && (
                    <span className="hidden shrink-0 rounded-full bg-tsa-gold/20 px-3 py-1 text-xs font-medium text-tsa-green-deep md:block">
                      Open for Registration
                    </span>
                  )}
                </Link>
              )
            })}
          </div>

          <Link
            href="/events"
            className="mt-6 flex items-center gap-1 text-sm font-medium text-tsa-green-deep transition-colors hover:text-tsa-green-mid md:hidden focus-visible:ring-2 focus-visible:ring-ring rounded"
          >
            All events <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ── Resources ────────────────────────────────── */}
      <section className="bg-secondary py-12 md:py-16" aria-labelledby="resources-heading">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 id="resources-heading" className="text-2xl font-bold text-foreground md:text-3xl">
                Resources & Downloads
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Forms, handbooks, badge requirements, and more
              </p>
            </div>
            <Link
              href="/resources"
              className="hidden items-center gap-1 text-sm font-medium text-tsa-green-deep transition-colors hover:text-tsa-green-mid md:flex focus-visible:ring-2 focus-visible:ring-ring rounded"
            >
              All resources <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {topResources.map((resource) => (
              <div
                key={resource.id}
                className="flex items-start gap-3 rounded-lg border border-border bg-card p-4"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-tsa-green-deep/10">
                  <Download className="h-5 w-5 text-tsa-green-deep" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-card-foreground">
                    {resource.title}
                  </h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {resource.fileType} &middot; {resource.fileSize}
                  </p>
                  <button className="mt-2 text-xs font-medium text-tsa-green-deep transition-colors hover:text-tsa-green-mid focus-visible:ring-2 focus-visible:ring-ring rounded">
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>

          <Link
            href="/resources"
            className="mt-6 flex items-center gap-1 text-sm font-medium text-tsa-green-deep transition-colors hover:text-tsa-green-mid md:hidden focus-visible:ring-2 focus-visible:ring-ring rounded"
          >
            All resources <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ── Media Section ────────────────────────────── */}
      <section className="bg-background py-12 md:py-16" aria-labelledby="media-heading">
        <div className="mx-auto max-w-7xl px-4">
          <h2 id="media-heading" className="mb-8 text-2xl font-bold text-foreground md:text-3xl">
            Media
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Video placeholders */}
            {[
              { title: "Kibaha Scouts in Action: Camporee 2025 Highlights", thumb: "/images/campaigns/trees.jpg" },
              { title: "How Scouting Changes Lives: Stories from Kibaha", thumb: "/images/about-hero.jpg" },
              { title: "Building Tomorrow's Leaders: TSA Kibaha Training", thumb: "/images/campaigns/membership.jpg" },
            ].map((video, i) => (
              <div
                key={i}
                className="group relative overflow-hidden rounded-lg border border-border"
              >
                <div className="relative aspect-video">
                  <Image
                    src={video.thumb}
                    alt={video.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-foreground/20 transition-colors group-hover:bg-foreground/30">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-tsa-gold text-tsa-green-deep">
                      <Play className="ml-1 h-6 w-6" />
                    </div>
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-medium text-card-foreground">
                    {video.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Campaigns ────────────────────────────────── */}
      <section className="bg-tsa-green-deep py-12 md:py-16" aria-labelledby="campaigns-heading">
        <div className="mx-auto max-w-7xl px-4">
          <h2 id="campaigns-heading" className="mb-2 text-2xl font-bold text-primary-foreground md:text-3xl">
            Campaigns
          </h2>
          <p className="mb-8 text-sm text-primary-foreground/80">
            Join our ongoing initiatives making a difference in Kibaha
          </p>
          <div className="grid gap-6 md:grid-cols-3">
            {campaigns.map((campaign) => (
              <Link
                key={campaign.id}
                href={campaign.link}
                className="group overflow-hidden rounded-lg bg-tsa-green-mid transition-shadow hover:shadow-xl focus-visible:ring-2 focus-visible:ring-tsa-gold"
              >
                <div className="relative aspect-[16/10]">
                  <Image
                    src={campaign.image}
                    alt={campaign.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <div className="p-5">
                  <span className="inline-block rounded-full bg-tsa-gold/20 px-2.5 py-0.5 text-xs font-medium text-tsa-gold">
                    {campaign.status}
                  </span>
                  <h3 className="mt-2 text-lg font-bold text-primary-foreground">
                    {campaign.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-primary-foreground/80 line-clamp-2">
                    {campaign.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────── */}
      <section className="bg-tsa-gold py-12 md:py-16" aria-label="Call to action">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <h2 className="text-balance text-2xl font-bold text-tsa-green-deep md:text-3xl">
            Ready to Begin Your Scouting Journey?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-tsa-green-deep/80 md:text-base">
            Whether you are a young person looking for adventure or an adult who wants to make a
            difference, there is a place for you in TSA Kibaha District.
          </p>
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/join#youth"
              className="inline-flex items-center gap-2 rounded-md bg-tsa-green-deep px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-tsa-green-mid focus-visible:ring-2 focus-visible:ring-ring"
            >
              Join as Youth
            </Link>
            <Link
              href="/join#volunteer"
              className="inline-flex items-center gap-2 rounded-md border-2 border-tsa-green-deep px-6 py-2.5 text-sm font-semibold text-tsa-green-deep transition-colors hover:bg-tsa-green-deep hover:text-primary-foreground focus-visible:ring-2 focus-visible:ring-ring"
            >
              Volunteer as Leader
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
