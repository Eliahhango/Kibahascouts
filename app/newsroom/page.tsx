import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, CalendarDays, Download, User } from "lucide-react"
import { PageHero } from "@/components/public/page-hero"
import { SectionShell } from "@/components/public/section-shell"
import { getNewsFromCms, getResourcesFromCms, getSiteContentSettingsFromCms } from "@/lib/cms"
import { normalizePublicText } from "@/lib/public-text"

export const metadata: Metadata = {
  title: "Newsroom",
  description: "Latest announcements, training updates, community service stories, and awards from Kibaha Scouts.",
}

const categories = ["All", "Announcements", "Training", "Community Service", "Awards"] as const

export default async function NewsroomPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const params = await searchParams
  const category = params.category
  const [newsArticles, resources, siteContent] = await Promise.all([
    getNewsFromCms(),
    getResourcesFromCms(),
    getSiteContentSettingsFromCms(),
  ])
  const pageContent = siteContent.newsroomPage
  const publishedArticles = newsArticles.filter((article) => article.published !== false)
  const publishedResources = resources.filter((resource) => resource.published !== false)

  const sortedArticles = [...publishedArticles].sort((a, b) => +new Date(b.date) - +new Date(a.date))
  const filteredArticles =
    category && category !== "All"
      ? sortedArticles.filter((article) => article.category === category)
      : sortedArticles

  const pressDownloads = publishedResources.filter((resource) =>
    ["TSA Brand Guidelines for Units", "District Census Report 2025", "Kibaha District Annual Plan 2026"].includes(
      resource.title,
    ),
  )

  return (
    <>
      <PageHero
        title={normalizePublicText(pageContent.title, "Newsroom")}
        subtitle={normalizePublicText(
          pageContent.description,
          "Official updates from Kibaha Scouts including announcements, training highlights, community service impact, and awards.",
        )}
        breadcrumbs={[{ label: "Newsroom" }]}
      />

      <SectionShell eyebrow="Filter" title="News Categories" tone="background">
        <div className="flex flex-wrap gap-2">
          {categories.map((item) => {
            const isActive = (item === "All" && !category) || category === item
            const href = item === "All" ? "/newsroom" : `/newsroom?category=${encodeURIComponent(item)}`

            return (
              <Link
                key={item}
                href={href}
                className={`inline-flex min-h-11 items-center rounded-full px-4 py-1.5 text-sm font-semibold ${
                  isActive ? "bg-tsa-green-deep text-white" : "bg-secondary text-foreground hover:bg-border"
                }`}
              >
                {item}
              </Link>
            )
          })}
        </div>
      </SectionShell>

      {filteredArticles.length > 0 ? (
        <SectionShell eyebrow="Latest" title="Published Articles" tone="white">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredArticles.map((article) => (
              <article key={article.id} className="card-shell overflow-hidden">
                <Link href={`/newsroom/${article.slug}`} className="group block">
                  <div className="relative aspect-[16/10]">
                    <Image
                      src={article.image || "/placeholder.jpg"}
                      alt={article.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-5">
                    <span className="eyebrow">{article.category}</span>
                    <h3 className="mt-3 text-lg font-semibold text-foreground">{article.title}</h3>
                    <p className="mt-2 line-clamp-3 text-base leading-relaxed text-muted-foreground">{article.summary}</p>
                    <div className="mt-3 flex flex-wrap gap-3 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <CalendarDays className="h-4 w-4 text-tsa-green-deep" />
                        {new Date(article.date).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <User className="h-4 w-4 text-tsa-green-deep" />
                        {article.author}
                      </span>
                    </div>
                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-tsa-green-deep">
                      Read article <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </SectionShell>
      ) : null}

      {pressDownloads.length > 0 ? (
        <SectionShell
          id="press"
          eyebrow="Press"
          title={normalizePublicText(pageContent.pressTitle, "Press and Downloads")}
          subtitle={normalizePublicText(pageContent.pressDescription, "Media-ready files for official district communication.")}
          tone="background"
        >
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pressDownloads.map((resource) => (
              <article key={resource.id} className="card-shell p-5">
                <h3 className="text-lg font-semibold text-foreground">{resource.title}</h3>
                <p className="mt-2 text-base text-muted-foreground">{resource.summary}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {resource.fileType} • {resource.fileSize}
                </p>
                {resource.downloadUrl && resource.downloadUrl !== "#" ? (
                  <Link href={resource.downloadUrl} className="btn-secondary mt-4 w-full">
                    <Download className="mr-1 h-4 w-4" />
                    Download
                  </Link>
                ) : null}
              </article>
            ))}
          </div>
        </SectionShell>
      ) : null}
    </>
  )
}
