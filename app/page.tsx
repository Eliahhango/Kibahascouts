import Image from "next/image"
import Link from "next/link"
import { ArrowRight, ChevronDown, ChevronRight, Clock3, Download, Flag, MapPin, ShieldCheck, Users } from "lucide-react"
import { MediaGalleryGrid } from "@/components/home/media-gallery-grid"
import { getEventsFromCms, getHomepageSettingsFromCms, getMediaItemsFromCms, getNewsFromCms, getResourcesFromCms } from "@/lib/cms"
import { contentGovernance } from "@/lib/content-governance"
import { deriveMediaEmbedFromUrl, isSupportedMediaEmbedUrl } from "@/lib/media-embed"
import { siteConfig } from "@/lib/site-config"

const defaultStory = {
  id: "fallback",
  slug: "newsroom",
  title: "Kibaha Scouts Official Updates",
  summary: "Follow verified district updates, programme notices, and upcoming opportunities across scout sections.",
  image: "/images/hero-scouts.jpg",
}

function getMediaEmbedUrl(item: { kind: "video" | "gallery"; embedUrl?: string; href: string }) {
  if (item.kind !== "video") {
    return ""
  }

  const directEmbedUrl = item.embedUrl?.trim() || ""
  if (directEmbedUrl && isSupportedMediaEmbedUrl(directEmbedUrl)) {
    return directEmbedUrl
  }

  if (!item.href) {
    return ""
  }

  const derivedEmbed = deriveMediaEmbedFromUrl(item.href)
  if (!derivedEmbed?.embedUrl || !isSupportedMediaEmbedUrl(derivedEmbed.embedUrl)) {
    return ""
  }

  return derivedEmbed.embedUrl
}

function getSnapshotVisual(label: string) {
  const normalized = label.toLowerCase()

  if (normalized.includes("youth")) {
    return { icon: Users, iconTone: "bg-indigo-100 text-indigo-700" }
  }

  if (normalized.includes("service")) {
    return { icon: Clock3, iconTone: "bg-amber-100 text-amber-700" }
  }

  if (normalized.includes("adult") || normalized.includes("volunteer")) {
    return { icon: ShieldCheck, iconTone: "bg-emerald-100 text-emerald-700" }
  }

  return { icon: Flag, iconTone: "bg-fuchsia-100 text-fuchsia-700" }
}

export default async function HomePage() {
  const { name } = siteConfig
  const [newsArticles, scoutEvents, resources, mediaItems, homepageSettings] = await Promise.all([
    getNewsFromCms(),
    getEventsFromCms(),
    getResourcesFromCms(),
    getMediaItemsFromCms(),
    getHomepageSettingsFromCms(),
  ])

  const publishedNews = newsArticles.filter((article) => article.published !== false)
  const publishedEvents = scoutEvents.filter((event) => event.published !== false)
  const publishedResources = resources.filter((resource) => resource.published !== false)

  const featuredNews = publishedNews.find((article) => article.featured) ?? defaultStory
  const latestNews = publishedNews.filter((article) => !article.featured).slice(0, 4)
  const upcomingEvents = publishedEvents.slice(0, 5)
  const topResources = publishedResources.slice(0, 6)
  const featuredMedia = mediaItems
    .filter((item) => item.published !== false)
    .slice(0, 18)
    .map((item) => ({
      ...item,
      resolvedEmbedUrl: getMediaEmbedUrl(item),
    }))
  const featuredStoryImage = featuredNews.image || "/images/hero-scouts.jpg"

  return (
    <>
      <section className="relative overflow-hidden border-b border-border bg-tsa-green-deep" aria-label="Featured story">
        <div className="absolute inset-0">
          <Image src={featuredStoryImage} alt="" fill className="scale-105 object-cover blur-[1.5px] opacity-45" priority sizes="100vw" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(15,31,24,0.92)_8%,rgba(30,58,47,0.74)_48%,rgba(15,31,24,0.5)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_38%,rgba(74,140,92,0.28),rgba(17,37,29,0.78))]" />
        </div>

        <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
          <div>
            {contentGovernance.homepageMode === "sample" ? (
              <div className="mb-4 max-w-2xl rounded-md border border-tsa-gold/50 bg-tsa-gold/20 px-3 py-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-primary-foreground">
                  {contentGovernance.homepageBadge}
                </p>
                <p className="mt-1 text-sm text-primary-foreground">{contentGovernance.homepageMessage}</p>
              </div>
            ) : null}
            <span className="eyebrow bg-tsa-green-mid text-primary-foreground">Featured Story</span>
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

          <div className="section-shell bg-primary-foreground p-5 pb-8 md:pb-5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-tsa-green-deep">District Snapshot</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {homepageSettings.districtSnapshot.map((item, index) => {
                const visual = getSnapshotVisual(item.label)

                return (
                  <div key={`snapshot-${index}-${item.label}`} className="rounded-lg border border-border/70 bg-secondary p-3">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex h-8 w-8 items-center justify-center rounded-full ${visual.iconTone}`}>
                        <visual.icon className="h-4 w-4" />
                      </span>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">{item.label}</p>
                    </div>
                    <p className="mt-3 border-b border-tsa-gold/80 pb-2 text-2xl font-extrabold text-tsa-green-deep md:text-3xl">
                      {item.value}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-4 z-10 flex justify-center">
          <ChevronDown className="h-6 w-6 animate-bounce text-primary-foreground/80" />
        </div>
      </section>

      <section className="py-12 md:py-16" aria-labelledby="latest-news-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {latestNews.length > 0 ? (
              latestNews.map((article) => (
                <Link key={article.id} href={`/newsroom/${article.slug}`} className="section-shell card-lift group overflow-hidden">
                  <div className="relative aspect-[16/9]">
                    <Image
                      src={article.image}
                      alt={article.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <span className="absolute left-3 top-3 rounded bg-tsa-green-deep px-2 py-0.5 text-xs font-medium text-primary-foreground transition-colors group-hover:bg-tsa-gold">
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
              ))
            ) : publishedNews.length > 0 ? (
              <article className="section-shell rounded-lg border border-border bg-card p-5 md:col-span-2 lg:col-span-4">
                <h3 className="text-base font-semibold text-card-foreground">No additional news items yet</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  The featured story is live. More published news items will appear here automatically.
                </p>
              </article>
            ) : (
              <article className="section-shell rounded-lg border border-border bg-card p-5 md:col-span-2 lg:col-span-4">
                <h3 className="text-base font-semibold text-card-foreground">News updates are coming soon</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Published district stories will appear here automatically once they are posted from the admin dashboard.
                </p>
              </article>
            )}
          </div>
        </div>
      </section>

      <section className="bg-secondary py-12 md:py-16" aria-labelledby="highlights-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <span className="eyebrow">Highlights</span>
          <h2 id="highlights-heading" className="section-title mt-3">
            Priority Initiatives
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {homepageSettings.priorityInitiatives.map((item, index) => {
              const isExternalLink = /^https?:\/\//i.test(item.href)

              return (
                <Link
                  key={`initiative-${index}-${item.title}`}
                  href={item.href}
                  target={isExternalLink ? "_blank" : undefined}
                  rel={isExternalLink ? "noreferrer" : undefined}
                  className={`section-shell card-lift p-5 ${index % 2 ? "bg-card" : "bg-background"}`}
                >
                  <h3 className="text-lg font-bold text-card-foreground">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-tsa-green-deep">
                    Learn more
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16" aria-labelledby="events-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map((event) => {
                const date = new Date(event.date)
                return (
                  <Link
                    key={event.id}
                    href={`/events/${event.slug}`}
                    className="group flex flex-wrap items-start gap-3 border-b border-border px-4 py-4 last:border-b-0 hover:bg-secondary lg:grid lg:grid-cols-[auto_1fr_auto] lg:items-center"
                  >
                    <div className="flex h-16 w-16 flex-col items-center justify-center rounded-md border-b-2 border-tsa-gold bg-tsa-green-deep text-primary-foreground">
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
                    <div className="ml-auto flex items-center gap-2 lg:ml-0 lg:justify-end">
                      {event.registrationOpen && (
                        <span className="inline-flex min-h-[44px] items-center rounded-full bg-tsa-gold/20 px-3 py-1 text-xs font-semibold text-tsa-green-deep">
                          Registration Open
                        </span>
                      )}
                      <ChevronRight className="h-4 w-4 text-tsa-green-deep opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>
                  </Link>
                )
              })
            ) : (
              <div className="px-4 py-5 text-sm text-muted-foreground">
                Upcoming events will appear here soon after publication from the admin dashboard.
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="bg-secondary py-12 md:py-16" aria-labelledby="resources-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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
            {topResources.length > 0 ? (
              topResources.map((resource) => (
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
                      {resource.downloadUrl && resource.downloadUrl !== "#" ? (
                        <Link href={resource.downloadUrl} className="mt-2 inline-flex min-h-[44px] items-center text-xs font-semibold text-tsa-green-deep">
                          Download
                        </Link>
                      ) : (
                        <span className="mt-2 inline-flex text-xs font-semibold text-muted-foreground">
                          Download will be available soon
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <article className="section-shell rounded-lg border border-border bg-card p-5 md:col-span-2 lg:col-span-3">
                <h3 className="text-base font-semibold text-card-foreground">Resource downloads are coming soon</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  As soon as files are published from the admin dashboard, they will appear here automatically.
                </p>
              </article>
            )}
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16" aria-labelledby="media-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <span className="eyebrow">Media</span>
          <h2 id="media-heading" className="section-title mt-3">
            Videos and Gallery
          </h2>
          <div className="mt-6">
            <MediaGalleryGrid items={featuredMedia} />
          </div>
        </div>
      </section>

      <section className="bg-tsa-green-deep py-12 md:py-16" aria-labelledby="campaigns-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <span className="eyebrow bg-tsa-green-mid text-primary-foreground">Campaigns</span>
          <h2 id="campaigns-heading" className="mt-3 text-3xl font-bold text-primary-foreground">
            Ongoing District Campaigns
          </h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {homepageSettings.campaigns.map((campaign) => (
              <Link key={campaign.id} href={campaign.link} className="overflow-hidden rounded-xl border border-tsa-green-mid bg-[#422a76] card-lift">
                <div className="relative aspect-[16/10]">
                  <Image src={campaign.image} alt={campaign.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
                </div>
                <div className="p-5">
                  <span className="rounded-full bg-tsa-gold/20 px-2.5 py-0.5 text-xs font-medium text-tsa-gold">
                    {campaign.status}
                  </span>
                  <h3 className="mt-2 text-lg font-semibold text-primary-foreground">{campaign.title}</h3>
                  <p className="mt-2 text-sm text-primary-foreground">{campaign.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[radial-gradient(ellipse_at_center,#2d5a3d_0%,#1e3a2f_100%)] py-12 md:py-16" aria-label="Call to action">
        <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mx-auto max-w-3xl text-balance text-3xl font-bold text-primary-foreground md:text-4xl">
            Start Your Scouting Journey with {name}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-primary-foreground md:text-base">
            Join as a youth member, support as a volunteer leader, or partner with the district to support verified
            scouting priorities.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/join#youth"
              className="inline-flex items-center gap-2 rounded-md bg-tsa-gold px-8 py-3 text-sm font-semibold text-white hover:bg-tsa-gold-light"
            >
              Join as Youth
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/join#volunteer"
              className="inline-flex items-center gap-2 rounded-md border-2 border-white/70 px-8 py-3 text-sm font-semibold text-white hover:bg-white hover:text-tsa-green-deep"
            >
              Volunteer as Leader
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
