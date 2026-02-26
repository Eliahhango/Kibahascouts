import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, CalendarDays, User } from "lucide-react"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { getNewsFromCms, getResourcesFromCms } from "@/lib/cms"

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
  const [newsArticles, resources] = await Promise.all([getNewsFromCms(), getResourcesFromCms()])

  const sortedArticles = [...newsArticles].sort((a, b) => +new Date(b.date) - +new Date(a.date))
  const filteredArticles =
    category && category !== "All"
      ? sortedArticles.filter((article) => article.category === category)
      : sortedArticles

  const pressDownloads = resources.filter((resource) =>
    ["TSA Brand Guidelines for Units", "District Census Report 2025", "Kibaha District Annual Plan 2026"].includes(
      resource.title,
    ),
  )

  return (
    <>
      <Breadcrumbs items={[{ label: "Newsroom" }]} />

      <section className="bg-background py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4">
          <h1 className="text-3xl font-bold text-foreground md:text-4xl">Newsroom</h1>
          <p className="mt-3 max-w-3xl text-base leading-relaxed text-muted-foreground">
            Official updates from Kibaha Scouts, including announcements, training highlights, community service
            impact, and scout achievements.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            {categories.map((item) => {
              const isActive = (item === "All" && !category) || category === item
              const href = item === "All" ? "/newsroom" : `/newsroom?category=${encodeURIComponent(item)}`

              return (
                <Link
                  key={item}
                  href={href}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-tsa-green-deep text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-border"
                  }`}
                >
                  {item}
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      <section className="bg-secondary py-12" aria-labelledby="news-list">
        <div className="mx-auto max-w-7xl px-4">
          <h2 id="news-list" className="sr-only">
            News list
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredArticles.map((article) => (
              <article key={article.id} className="overflow-hidden rounded-lg border border-border bg-card">
                <Link href={`/newsroom/${article.slug}`} className="group block focus-visible:ring-2 focus-visible:ring-ring">
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
                    <span className="rounded bg-tsa-green-deep/10 px-2 py-0.5 text-xs font-semibold text-tsa-green-deep">
                      {article.category}
                    </span>
                    <h3 className="mt-3 text-lg font-bold text-card-foreground group-hover:text-tsa-green-deep">
                      {article.title}
                    </h3>
                    <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{article.summary}</p>
                    <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {new Date(article.date).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <User className="h-3.5 w-3.5" />
                        {article.author}
                      </span>
                    </div>
                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-tsa-green-deep">
                      Read article
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="press" className="bg-background py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-2xl font-bold text-foreground md:text-3xl">Press & Downloads</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Media-ready files for official district communication.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pressDownloads.map((resource) => (
              <div key={resource.id} className="rounded-lg border border-border bg-card p-5">
                <h3 className="text-base font-semibold text-card-foreground">{resource.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{resource.summary}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {resource.fileType} - {resource.fileSize}
                </p>
                <Link
                  href={resource.downloadUrl}
                  className="mt-4 inline-flex rounded-md bg-tsa-green-deep px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-tsa-green-mid"
                >
                  Download
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
