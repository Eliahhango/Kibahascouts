import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { ArrowRight, Clock3, Tag, User } from "lucide-react"
import { PageHero } from "@/components/public/page-hero"
import { SectionShell } from "@/components/public/section-shell"
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

  if (!article) return { title: "Article Not Found" }

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
      <PageHero
        title={article.title}
        subtitle={article.summary}
        breadcrumbs={[{ label: "Newsroom", href: "/newsroom" }, { label: article.title }]}
      />

      <SectionShell eyebrow={article.category} title="Article" tone="background">
        <article className="mx-auto max-w-4xl">
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <User className="h-4 w-4 text-tsa-green-deep" />
              {article.author}
            </span>
            <span>{new Date(article.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</span>
            <span className="inline-flex items-center gap-1">
              <Clock3 className="h-4 w-4 text-tsa-green-deep" />
              {article.readingTime}
            </span>
            {lastUpdated ? (
              <span>
                Last updated {new Date(lastUpdated).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
              </span>
            ) : null}
          </div>

          <div className="relative mt-6 aspect-[16/9] overflow-hidden rounded-2xl border border-border">
            <Image
              src={article.image || "/placeholder.jpg"}
              alt={article.title}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 1024px"
            />
          </div>

          <div className="prose prose-sm mt-8 max-w-none text-foreground">
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

          {article.tags.length > 0 ? (
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
          ) : null}
        </article>
      </SectionShell>

      {related.length > 0 ? (
        <SectionShell eyebrow="Related" title="Related Posts" tone="white">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <Link key={item.id} href={`/newsroom/${item.slug}`} className="card-shell p-5">
                <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                <p className="mt-2 text-base text-muted-foreground">{item.summary}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-tsa-green-deep">
                  Read more <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            ))}
          </div>
        </SectionShell>
      ) : null}
    </>
  )
}
