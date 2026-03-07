import Image from "next/image"
import Link from "next/link"
import {
  ArrowRight,
  CalendarDays,
  Download,
  FileText,
  Flag,
  GraduationCap,
  Handshake,
  MapPin,
  Play,
  Target,
  TreePine,
  UserCircle2,
  Users,
} from "lucide-react"
import { SectionShell } from "@/components/public/section-shell"
import {
  getEventsFromCms,
  getHomepageSettingsFromCms,
  getMediaItemsFromCms,
  getNewsFromCms,
  getResourcesFromCms,
  getUnitsFromCms,
  getLeadersFromCms,
} from "@/lib/cms"
import { deriveMediaEmbedFromUrl, isSupportedMediaEmbedUrl } from "@/lib/media-embed"
import { siteConfig } from "@/lib/site-config"

const defaultStory = {
  id: "fallback",
  slug: "newsroom",
  title: "Kibaha District Scouts Official Updates",
  summary:
    "Follow verified district updates, programme notices, and upcoming opportunities across all scout sections in Kibaha.",
  image: "/images/hero-scouts.jpg",
}

function toSafeCount(value: number, fallback: string) {
  if (!Number.isFinite(value) || value <= 0) return fallback
  return `${value}+`
}

function getMediaEmbedUrl(item: { kind: "video" | "gallery"; embedUrl?: string; href: string }) {
  if (item.kind !== "video") return ""
  const directEmbedUrl = item.embedUrl?.trim() || ""
  if (directEmbedUrl && isSupportedMediaEmbedUrl(directEmbedUrl)) return directEmbedUrl
  if (!item.href) return ""
  const derivedEmbed = deriveMediaEmbedFromUrl(item.href)
  if (!derivedEmbed?.embedUrl || !isSupportedMediaEmbedUrl(derivedEmbed.embedUrl)) return ""
  return derivedEmbed.embedUrl
}

function resourceIcon(fileType: string) {
  const normalized = fileType.toUpperCase()
  if (normalized.includes("PDF")) return FileText
  return Download
}

export default async function HomePage() {
  const { name } = siteConfig
  const [newsArticles, scoutEvents, resources, mediaItems, homepageSettings, units, leaders] = await Promise.all([
    getNewsFromCms(),
    getEventsFromCms(),
    getResourcesFromCms(),
    getMediaItemsFromCms(),
    getHomepageSettingsFromCms(),
    getUnitsFromCms(),
    getLeadersFromCms(),
  ])

  const publishedNews = newsArticles.filter((article) => article.published !== false)
  const publishedEvents = scoutEvents.filter((event) => event.published !== false)
  const publishedResources = resources.filter((resource) => resource.published !== false)
  const publishedUnits = units.filter((unit) => unit.published !== false)
  const publishedLeaders = leaders.filter((leader) => leader.id)
  const publishedMedia = mediaItems.filter((item) => item.published !== false)

  const featuredNews = publishedNews.find((article) => article.featured) ?? publishedNews[0] ?? defaultStory
  const latestNews = publishedNews.filter((article) => article.id !== featuredNews.id).slice(0, 3)
  const upcomingEvents = [...publishedEvents]
    .sort((a, b) => Date.parse(a.date) - Date.parse(b.date))
    .slice(0, 5)
  const topResources = publishedResources.slice(0, 6)
  const featuredMedia = publishedMedia.slice(0, 6).map((item) => ({
    ...item,
    resolvedEmbedUrl: getMediaEmbedUrl(item),
  }))

  const snapshotByLabel = new Map(
    homepageSettings.districtSnapshot.map((item) => [item.label.toLowerCase(), item.value]),
  )

  const statTiles = [
    {
      label: "Active Units",
      value:
        snapshotByLabel.get("active units") ||
        toSafeCount(publishedUnits.length, "10+"),
      icon: Target,
    },
    {
      label: "Youth Members",
      value:
        snapshotByLabel.get("youth members") ||
        snapshotByLabel.get("youth reached") ||
        "100+",
      icon: Users,
    },
    {
      label: "Scout Leaders",
      value:
        snapshotByLabel.get("adult volunteers") ||
        snapshotByLabel.get("leaders") ||
        toSafeCount(publishedLeaders.length, "20+"),
      icon: UserCircle2,
    },
    {
      label: "District Campaigns",
      value: toSafeCount(homepageSettings.campaigns.length, "3+"),
      icon: Flag,
    },
  ]

  const highlightIcons = [Target, GraduationCap, TreePine, Handshake]

  return (
    <>
      <section className="relative overflow-hidden bg-tsa-green-deep text-white" aria-label="Homepage hero">
        <div className="absolute inset-0">
          <Image
            src={featuredNews.image || "/images/hero-scouts.jpg"}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_24%,rgba(201,145,10,0.22),rgba(30,58,47,0.94)_58%)]" />
        </div>

        <div className="relative mx-auto grid min-h-[520px] max-w-7xl grid-cols-1 gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[3fr_2fr] lg:px-8 lg:py-20">
          <div className="flex flex-col justify-center">
            <p className="eyebrow text-tsa-gold">Official District Branch</p>
            <h1 className="mt-3 text-balance text-4xl font-bold text-white md:text-5xl">
              Tanzania Scouts Association - Kibaha District
            </h1>
            <p className="mt-3 text-lg font-semibold text-tsa-gold">{featuredNews.title}</p>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/80">{featuredNews.summary}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/join#youth" className="btn-primary">
                Join as Youth
              </Link>
              <Link href="/about" className="btn-secondary border-white text-white shadow-sm backdrop-blur-sm hover:bg-white hover:text-tsa-green-deep">
                Learn More
              </Link>
            </div>
          </div>

          <div className="grid content-center grid-cols-2 gap-4">
            {statTiles.map((tile) => (
              <article key={tile.label} tabIndex={0} className="rounded-xl border border-white/15 bg-white/8 p-4 backdrop-blur-sm">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-tsa-gold text-white shadow-sm">
                  <tile.icon className="h-5 w-5 stroke-[1.5]" />
                </span>
                <p className="mt-3 text-3xl font-black text-white">{tile.value}</p>
                <p className="mt-1 text-sm text-white/85">{tile.label}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 text-background">
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none" className="h-[80px] w-full fill-current md:h-[100px]">
            <path d="M0,32L80,48C160,64,320,96,480,101.3C640,107,800,85,960,69.3C1120,53,1280,43,1360,37.3L1440,32L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z" />
          </svg>
        </div>
      </section>

      {latestNews.length > 0 ? (
        <SectionShell
          eyebrow="Newsroom"
          title="Latest News"
          viewAllHref="/newsroom"
          viewAllLabel="All news"
          tone="background"
        >
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {latestNews.map((article) => (
              <Link key={article.id} href={`/newsroom/${article.slug}`} className="card-shell group overflow-hidden">
                <div className="h-1 w-full bg-tsa-gold" />
                <div className="relative aspect-[16/10]">
                  <Image
                    src={article.image}
                    alt={article.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-5">
                  <p className="eyebrow">{article.category}</p>
                  <h3 className="mt-2 text-lg font-semibold text-foreground">{article.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {new Date(article.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                  <p className="mt-3 line-clamp-3 text-base text-muted-foreground">{article.summary}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-tsa-gold">
                    Read more <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </SectionShell>
      ) : null}

      {homepageSettings.priorityInitiatives.length > 0 ? (
        <SectionShell eyebrow="Highlights" title="Priority Initiatives" tone="white">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {homepageSettings.priorityInitiatives.map((item, index) => {
              const Icon = highlightIcons[index % highlightIcons.length]
              const accentBorder = index % 2 === 0 ? "border-l-tsa-green-deep" : "border-l-tsa-gold"
              const iconBg = index % 2 === 0 ? "bg-tsa-green-deep text-white shadow-sm" : "bg-tsa-gold text-white shadow-sm"
              const isExternalLink = /^https?:\/\//i.test(item.href)

              return (
                <Link
                  key={`${item.title}-${index}`}
                  href={item.href}
                  target={isExternalLink ? "_blank" : undefined}
                  rel={isExternalLink ? "noreferrer" : undefined}
                  className={`card-shell border-l-4 ${accentBorder} p-5 hover:border-tsa-green-deep`}
                >
                  <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${iconBg}`}>
                    <Icon className="h-5 w-5 stroke-[1.5]" />
                  </span>
                  <h3 className="mt-3 text-lg font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-2 text-base leading-relaxed text-muted-foreground">{item.description}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-tsa-green-deep">
                    Learn more <ArrowRight className="h-4 w-4" />
                  </span>
                </Link>
              )
            })}
          </div>
        </SectionShell>
      ) : null}

      {upcomingEvents.length > 0 ? (
        <SectionShell
          eyebrow="Events"
          title="Upcoming Events"
          viewAllHref="/events"
          viewAllLabel="All events"
          tone="background"
        >
          <div className="space-y-4">
            {upcomingEvents.map((event) => {
              const eventDate = new Date(event.date)
              return (
                <article key={event.id} className="card-shell p-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-[auto_1fr_auto] md:items-center">
                    <div className="flex w-full items-center justify-start md:w-auto">
                      <div className="flex h-16 w-16 flex-col items-center justify-center rounded-lg bg-tsa-green-deep text-white">
                        <span className="text-2xl font-bold leading-none">{eventDate.getDate()}</span>
                        <span className="text-xs uppercase">
                          {eventDate.toLocaleDateString("en-GB", { month: "short" })}
                        </span>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{event.title}</h3>
                      <div className="mt-1 flex flex-wrap gap-3 text-sm text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-4 w-4 text-tsa-green-deep" />
                          {event.location}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <CalendarDays className="h-4 w-4 text-tsa-green-deep" />
                          {event.time}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-tsa-green-deep/10 px-2.5 py-1 text-xs font-semibold text-tsa-green-deep">
                        {event.category}
                      </span>
                      <Link href={`/events/${event.slug}`} className="btn-secondary !px-4 !py-2 text-xs">
                        {event.registrationOpen ? "Register" : "Learn More"}
                      </Link>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </SectionShell>
      ) : null}

      {topResources.length > 0 ? (
        <SectionShell
          eyebrow="Resources"
          title="Downloads and Forms"
          viewAllHref="/resources"
          viewAllLabel="All resources"
          tone="tinted"
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {topResources.map((resource) => {
              const ResourceIcon = resourceIcon(resource.fileType)
              const hasDownload = Boolean(resource.downloadUrl && resource.downloadUrl !== "#")

              return (
                <article key={resource.id} className="card-shell p-5">
                  <div className="flex items-start gap-3">
                    <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-tsa-green-deep text-white shadow-sm">
                      <ResourceIcon className="h-5 w-5 stroke-[1.5]" />
                    </span>
                    <div className="min-w-0">
                      <h3 className="line-clamp-2 text-lg font-semibold text-foreground">{resource.title}</h3>
                      <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {resource.fileType} â€¢ {resource.fileSize}
                      </p>
                      <span className="mt-2 inline-flex rounded-full bg-tsa-green-deep/10 px-2.5 py-0.5 text-xs font-semibold text-tsa-green-deep">
                        {resource.category}
                      </span>
                    </div>
                  </div>
                  {hasDownload ? (
                    <Link href={resource.downloadUrl} className="btn-secondary mt-4 w-full">
                      Download
                    </Link>
                  ) : null}
                </article>
              )
            })}
          </div>
        </SectionShell>
      ) : null}

      {featuredMedia.length > 0 ? (
        <SectionShell
          eyebrow="Media"
          title="Videos and Gallery"
          viewAllHref="/newsroom"
          viewAllLabel="View all media"
          viewAllClassName="text-tsa-gold hover:text-tsa-gold-light no-underline hover:no-underline"
          tone="white"
        >
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {featuredMedia.map((item) => {
              const previewLink = item.href || "/newsroom"
              const imageSrc = item.thumbnail || "/images/about-hero.jpg"

              return (
                <Link key={item.id} href={previewLink} className="group card-shell overflow-hidden">
                  {item.kind === "video" && item.resolvedEmbedUrl ? (
                    <div className="relative aspect-video bg-black">
                      <iframe
                        title={item.title}
                        src={item.resolvedEmbedUrl}
                        className="absolute inset-0 h-full w-full"
                        loading="lazy"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <div className="relative aspect-video overflow-hidden">
                      <Image src={imageSrc} alt={item.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
                      <div className="absolute inset-0 bg-gradient-to-t from-tsa-green-deep/85 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-tsa-gold text-white shadow-lg">
                          <Play className="h-5 w-5 fill-current" />
                        </span>
                      </div>
                    </div>
                  )}
                  <div className="p-4">
                    <p className="eyebrow">{item.kind === "video" ? "Video" : "Gallery"}</p>
                    <h3 className="mt-2 text-lg font-semibold text-foreground">{item.title}</h3>
                  </div>
                </Link>
              )
            })}
          </div>
        </SectionShell>
      ) : null}

      {homepageSettings.campaigns.length > 0 ? (
        <SectionShell eyebrow="Campaigns" title="Ongoing District Campaigns" tone="background">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {homepageSettings.campaigns.map((campaign) => (
              <Link key={campaign.id} href={campaign.link} className="group card-shell aspect-[4/3] overflow-hidden p-0">
                <div className="relative h-full w-full">
                  {campaign.image ? (
                    <Image
                      src={campaign.image}
                      alt={campaign.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                      onError={undefined}
                      unoptimized={!campaign.image.startsWith("https://")}
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-tsa-green-deep to-tsa-green-mid" />
                  )}
                  <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-tsa-green-deep/85 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <span className="inline-flex rounded-full bg-tsa-gold px-2.5 py-0.5 text-xs font-semibold text-white">
                      {campaign.status}
                    </span>
                    <h3 className="mt-2 text-lg font-semibold text-white">{campaign.title}</h3>
                    <p className="mt-1 line-clamp-2 text-sm text-white/80">{campaign.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </SectionShell>
      ) : null}

      <section className="relative overflow-hidden bg-gradient-to-r from-tsa-green-deep via-tsa-green-mid to-tsa-green-deep py-14 md:py-16" aria-label="Call to action">
        <div
          className="pointer-events-none absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Cpath fill='%23ffffff' d='M60 16l10 20h20l-16 14 6 22-20-12-20 12 6-22-16-14h20z'/%3E%3C/svg%3E\")",
            backgroundSize: "120px 120px",
          }}
        />
        <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-balance text-3xl font-bold text-white md:text-4xl">
            Start Your Scouting Journey with <span className="text-tsa-gold">KIBAHA SCOUTS</span>
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-base leading-relaxed text-white/85">
            Join as a youth member, support as a volunteer leader, or partner with {name} to build character and service in our district.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link href="/join#youth" className="btn-primary">
              Join as Youth
            </Link>
            <Link href="/join#volunteer" className="btn-secondary border-white text-white shadow-sm backdrop-blur-sm hover:bg-white hover:text-tsa-green-deep">
              Volunteer as Leader
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}


