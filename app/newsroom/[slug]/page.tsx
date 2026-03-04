import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { ArrowLeft, ArrowRight, Clock3, Tag, User } from "lucide-react"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { getNewsFromCms } from "@/lib/cms"
import { hasRichTextMarkup, sanitizeRichTextHtml } from "@/lib/rich-text"

export async function generateStaticParams() {
  const newsArticles = (await getNewsFromCms()).filter((article) => article.published !== false)
  return newsArticles.map((article) => ({ slug: article.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const newsArticles = (await getNewsFromCms()).filter((item) => item.published !== false)
  const article = newsArticles.find((item) => item.slug === slug)

  if (!article) {
    return { title: "Article Not Found" }
  }

  return {
    title: article.title,
    description: article.summary,
    openGraph: {
      title: article.title,
      description: article.summary,
      type: "article",
      publishedTime: article.date,
      images: [{ url: article.image || "/placeholder.jpg" }],
    },
  }
}

export default async function NewsArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const newsArticles = (await getNewsFromCms()).filter((item) => item.published !== false)
  const article = newsArticles.find((item) => item.slug === slug)
  if (!article) notFound()

  const related = newsArticles.filter((item) => item.id !== article.id).slice(0, 3)
  const sanitizedContentHtml = sanitizeRichTextHtml(article.content)
  const shouldRenderRichText = hasRichTextMarkup(sanitizedContentHtml)
  const contentParagraphs = article.content
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
  const lastUpdated = article.updatedAt || article.date

  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Newsroom", href: "/newsroom" },
          { label: article.title },
        ]}
      />

      <article className="bg-background py-12 md:py-16">
        <div className="mx-auto max-w-4xl px-4">
          <Link
            href="/newsroom"
            className="inline-flex items-center gap-1 rounded text-sm text-tsa-green-deep transition-colors hover:text-tsa-green-mid focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Newsroom
          </Link>

          <header className="mt-4">
            <span className="rounded bg-tsa-green-deep/10 px-2 py-0.5 text-xs font-semibold text-tsa-green-deep">
              {article.category}
            </span>
            <h1 className="mt-4 text-balance text-3xl font-bold text-foreground md:text-4xl">{article.title}</h1>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground">{article.summary}</p>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <User className="h-4 w-4" />
                {article.author}
              </span>
              <span>{new Date(article.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</span>
              <span className="inline-flex items-center gap-1">
                <Clock3 className="h-4 w-4" />
                {article.readingTime}
              </span>
              {lastUpdated ? (
                <span>
                  Last updated {new Date(lastUpdated).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </span>
              ) : null}
            </div>
          </header>

          <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-lg border border-border">
            <Image
              src={article.image || "/placeholder.jpg"}
              alt={article.title}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 1024px"
            />
          </div>

          <div className="prose prose-slate mt-8 max-w-none">
            {shouldRenderRichText ? (
              <div dangerouslySetInnerHTML={{ __html: sanitizedContentHtml }} />
            ) : (
              contentParagraphs.map((paragraph, index) => (
                <p key={index} className="mb-5 text-base leading-relaxed text-foreground/90">
                  {paragraph}
                </p>
              ))
            )}
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <Tag className="h-3.5 w-3.5" />
              Tags
            </span>
            {article.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </article>

      <section className="bg-secondary py-12">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-2xl font-bold text-foreground">Related Posts</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <Link
                key={item.id}
                href={`/newsroom/${item.slug}`}
                className="rounded-lg border border-border bg-card p-5 transition-colors hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring"
              >
                <h3 className="text-base font-semibold text-card-foreground">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.summary}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-tsa-green-deep">
                  Read more
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
