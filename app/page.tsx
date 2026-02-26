import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Clock3, Download, MapPin, PlayCircle } from "lucide-react"
import { campaigns } from "@/lib/data"
import { getEventsFromCms, getNewsFromCms, getResourcesFromCms } from "@/lib/cms"
import { siteConfig } from "@/lib/site-config"

const highlights = [
  {
    title: "District Membership Drive",
    description: "Coordinated school outreach with a target of 2,000 active youth members by year-end.",
    href: "/join",
  },
  {
    title: "Community Service Impact",
    description: "More than 12,000 service hours delivered through health, hygiene, and clean-up campaigns.",
    href: "/newsroom?category=Community+Service",
  },
  {
    title: "Leader Training Pipeline",
    description: "Quarterly BULT and safeguarding sessions for consistent leadership quality in every unit.",
    href: "/events/leader-training-weekend",
  },
  {
    title: "District Scout Hall Project",
    description: "New headquarters and training center development underway for long-term programme growth.",
    href: "/newsroom/new-scout-hall-construction-begins",
  },
]

const mediaItems = [
  { title: "Kibaha Camporee Highlights", thumb: "/images/campaigns/trees.jpg" },
  { title: "Youth Leadership Stories", thumb: "/images/about-hero.jpg" },
  { title: "District Training Sessions", thumb: "/images/campaigns/membership.jpg" },
]

const defaultStory = {
  id: "fallback",
  slug: "newsroom",
  title: "Kibaha Scouts Official Updates",
  summary: "Follow district highlights, programme milestones, and upcoming opportunities across all scout sections.",
}

export default async function HomePage() {
  const { branding, name } = siteConfig
  const [newsArticles, scoutEvents, resources] = await Promise.all([
    getNewsFromCms(),
    getEventsFromCms(),
    getResourcesFromCms(),
  ])

  const featuredNews = newsArticles.find((article) => article.featured) ?? newsArticles[0] ?? defaultStory
  const latestNews = newsArticles.filter((article) => article.id !== featuredNews.id).slice(0, 4)
  const upcomingEvents = scoutEvents.slice(0, 5)
  const topResources = resources.slice(0, 6)

  return (
    <>
      <section className="relative overflow-hidden border-b border-border bg-tsa-green-deep" aria-label="Featured story">
        <div className="absolute inset-0">
          <Image src="/images/hero-scouts.jpg" alt="" fill className="object-cover opacity-35" priority sizes="100vw" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(24,8,47,0.9)_8%,rgba(24,8,47,0.6)_48%,rgba(24,8,47,0.3)_100%)]" />
        </div>

        <div className="relative mx-auto grid max-w-7xl gap-8 px-4 py-16 md:grid-cols-[1.1fr_0.9fr] md:py-24">
          <div>
            <div className="mb-4 inline-flex flex-wrap items-center gap-2 rounded-lg border border-primary-foreground/25 bg-primary-foreground/12 p-2.5 backdrop-blur-sm">
              <Image
                src={branding.primaryLogo}
                alt={`${name} logo`}
                width={56}
                height={56}
                className="h-14 w-14 rounded bg-white p-1 object-contain"
              />
              <Image
                src={branding.scoutBadge}
                alt="Scout badge"
                width={56}
                height={56}
                className="h-14 w-14 rounded bg-white p-1 object-contain"
              />
              <Image
                src={branding.footerCenterLogo}
                alt="Tanzania Scouts logo"
                width={56}
                height={56}
                className="h-14 w-14 rounded bg-white p-1 object-contain"
              />
            </div>
            <span className="eyebrow bg-primary-foreground/16 text-primary-foreground">Featured Story</span>
            <h1 className="mt-4 max-w-2xl text-balance text-3xl font-bold leading-tight text-primary-foreground md:text-5xl">
              {featuredNews.title}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-primary-foreground/85 md:text-lg">
              {featuredNews.summary}
            </p>
            <Link
              href={featuredNews.slug === "newsroom" ? "/newsroom" : `/newsroom/${featuredNews.slug}`}
              className="mt-7 inline-flex items-center gap-2 rounded-md bg-tsa-gold px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-tsa-gold-light"
            >
              Read Full Story
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="section-shell bg-primary-foreground/95 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-tsa-green-deep">District Snapshot</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {[
                ["10", "Active Units"],
                ["300+", "Youth Members"],
                ["50+", "Adult Volunteers"],
                ["12k+", "Service Hours"],
              ].map(([value, label]) => (
                <div key={label} className="rounded-lg bg-secondary p-3">
                  <p className="text-2xl font-bold text-tsa-green-deep">{value}</p>
                  <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16" aria-labelledby="latest-news-heading">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <span className="eyebrow">Newsroom</span>
              <h2 id="latest-news-heading" className="section-title mt-3">
                Latest News
              </h2>
            </div>
            <Link href="/newsroom" className="hidden items-center gap-1 text-sm font-semibold text-tsa-green-deep md:inline-flex">
              All news
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {latestNews.map((article) => (
              <Link key={article.id} href={`/newsroom/${article.slug}`} className="section-shell card-lift group overflow-hidden">
                <div className="relative aspect-[16/10]">
                  <Image
                    src={article.image}
                    alt={article.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <span className="absolute left-3 top-3 rounded bg-tsa-green-deep px-2 py-0.5 text-xs font-medium text-primary-foreground">
                    {article.category}
                  </span>
                </div>
                <div className="p-4">
                  <time className="text-xs text-muted-foreground" dateTime={article.date}>
                    {new Date(article.date).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </time>
                  <h3 className="mt-2 line-clamp-2 text-base font-semibold text-card-foreground group-hover:text-tsa-green-deep">
                    {article.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{article.summary}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-secondary py-12 md:py-16" aria-labelledby="highlights-heading">
        <div className="mx-auto max-w-7xl px-4">
          <span className="eyebrow">Highlights</span>
          <h2 id="highlights-heading" className="section-title mt-3">
            Priority Initiatives
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {highlights.map((item, index) => (
              <Link
                key={item.title}
                href={item.href}
                className={`section-shell card-lift p-5 ${index % 2 ? "bg-card" : "bg-background"}`}
              >
                <h3 className="text-lg font-bold text-card-foreground">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-tsa-green-deep">
                  Learn more
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16" aria-labelledby="events-heading">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <span className="eyebrow">Events</span>
              <h2 id="events-heading" className="section-title mt-3">
                Upcoming Events
              </h2>
            </div>
            <Link href="/events" className="hidden items-center gap-1 text-sm font-semibold text-tsa-green-deep md:inline-flex">
              All events
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="section-shell overflow-hidden">
            {upcomingEvents.map((event) => {
              const date = new Date(event.date)
              return (
                <Link
                  key={event.id}
                  href={`/events/${event.slug}`}
                  className="grid gap-4 border-b border-border px-4 py-4 last:border-b-0 md:grid-cols-[auto_1fr_auto] md:items-center hover:bg-secondary"
                >
                  <div className="flex h-14 w-14 flex-col items-center justify-center rounded-md bg-tsa-green-deep text-primary-foreground">
                    <span className="text-lg font-bold leading-none">{date.getDate()}</span>
                    <span className="text-xs uppercase">{date.toLocaleDateString("en-GB", { month: "short" })}</span>
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-card-foreground">{event.title}</h3>
                    <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
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
                  {event.registrationOpen && (
                    <span className="inline-flex h-fit rounded-full bg-tsa-gold/20 px-3 py-1 text-xs font-semibold text-tsa-green-deep">
                      Registration Open
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      <section className="bg-secondary py-12 md:py-16" aria-labelledby="resources-heading">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <span className="eyebrow">Resources</span>
              <h2 id="resources-heading" className="section-title mt-3">
                Downloads and Forms
              </h2>
            </div>
            <Link href="/resources" className="hidden items-center gap-1 text-sm font-semibold text-tsa-green-deep md:inline-flex">
              All resources
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {topResources.map((resource) => (
              <article key={resource.id} className="section-shell card-lift p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-tsa-green-deep/10">
                    <Download className="h-5 w-5 text-tsa-green-deep" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-card-foreground">{resource.title}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {resource.fileType} - {resource.fileSize}
                    </p>
                    <Link href={resource.downloadUrl} className="mt-2 inline-flex text-xs font-semibold text-tsa-green-deep">
                      Download
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16" aria-labelledby="media-heading">
        <div className="mx-auto max-w-7xl px-4">
          <span className="eyebrow">Media</span>
          <h2 id="media-heading" className="section-title mt-3">
            Videos and Gallery
          </h2>
          <div className="mt-6 grid gap-5 md:grid-cols-3">
            {mediaItems.map((item) => (
              <article key={item.title} className="section-shell card-lift overflow-hidden">
                <div className="group relative aspect-video">
                  <Image src={item.thumb} alt={item.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
                  <div className="absolute inset-0 flex items-center justify-center bg-foreground/25 transition-colors group-hover:bg-foreground/35">
                    <PlayCircle className="h-12 w-12 text-primary-foreground" />
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-card-foreground">{item.title}</h3>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-tsa-green-deep py-12 md:py-16" aria-labelledby="campaigns-heading">
        <div className="mx-auto max-w-7xl px-4">
          <span className="eyebrow bg-primary-foreground/12 text-primary-foreground">Campaigns</span>
          <h2 id="campaigns-heading" className="mt-3 text-3xl font-bold text-primary-foreground">
            Ongoing District Campaigns
          </h2>
          <div className="mt-6 grid gap-5 md:grid-cols-3">
            {campaigns.map((campaign) => (
              <Link key={campaign.id} href={campaign.link} className="overflow-hidden rounded-xl border border-primary-foreground/20 bg-primary-foreground/10 card-lift">
                <div className="relative aspect-[16/10]">
                  <Image src={campaign.image} alt={campaign.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
                </div>
                <div className="p-5">
                  <span className="rounded-full bg-tsa-gold/20 px-2.5 py-0.5 text-xs font-medium text-tsa-gold">
                    {campaign.status}
                  </span>
                  <h3 className="mt-2 text-lg font-semibold text-primary-foreground">{campaign.title}</h3>
                  <p className="mt-2 text-sm text-primary-foreground/85">{campaign.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-tsa-gold py-12 md:py-16" aria-label="Call to action">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <h2 className="mx-auto max-w-3xl text-balance text-3xl font-bold text-primary-foreground md:text-4xl">
            Start Your Scouting Journey with {name}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-primary-foreground/90 md:text-base">
            Join as a youth member, support as a volunteer leader, or partner with the district to strengthen scouting
            programmes in Kibaha.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/join#youth"
              className="inline-flex items-center gap-2 rounded-md bg-tsa-green-deep px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-tsa-green-mid"
            >
              Join as Youth
            </Link>
            <Link
              href="/join#volunteer"
              className="inline-flex items-center gap-2 rounded-md border-2 border-primary-foreground px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-foreground hover:text-tsa-green-deep"
            >
              Volunteer as Leader
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
