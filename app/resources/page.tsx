import type { Metadata } from "next"
import Link from "next/link"
import { Download, FileText, Filter } from "lucide-react"
import { PageHero } from "@/components/public/page-hero"
import { SectionShell } from "@/components/public/section-shell"
import { getResourcesFromCms, getSiteContentSettingsFromCms } from "@/lib/cms"
import { normalizePublicText } from "@/lib/public-text"

export const metadata: Metadata = {
  title: "Resources",
  description: "Document library for forms, training materials, policies, badges, and reports for Kibaha Scouts.",
}

const categories = ["All", "Forms", "Training", "Policies", "Badges", "Reports"] as const

type SearchParams = {
  category?: string
}

export default async function ResourcesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const [resourcesFromCms, siteContent] = await Promise.all([getResourcesFromCms(), getSiteContentSettingsFromCms()])
  const pageContent = siteContent.resourcesPage
  const resources = resourcesFromCms.filter((resource) => resource.published !== false)
  const selectedCategory = params.category
  const filtered =
    selectedCategory && selectedCategory !== "All"
      ? resources.filter((resource) => resource.category === selectedCategory)
      : resources
  const sorted = [...filtered].sort((a, b) => +new Date(b.publishDate) - +new Date(a.publishDate))

  return (
    <>
      <PageHero
        title={normalizePublicText(pageContent.title, "Resources")}
        subtitle={normalizePublicText(
          pageContent.description,
          "Search district forms, training references, policy documents, badge guidance, and official reports.",
        )}
        breadcrumbs={[{ label: "Resources" }]}
      />

      <SectionShell eyebrow="Filter" title="Resource Categories" tone="background">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => {
            const isActive = (category === "All" && !selectedCategory) || selectedCategory === category
            const href = category === "All" ? "/resources" : `/resources?category=${encodeURIComponent(category)}`
            return (
              <Link
                key={category}
                href={href}
                className={`inline-flex min-h-11 items-center gap-1 rounded-full px-4 py-1.5 text-sm font-semibold ${
                  isActive ? "bg-tsa-green-deep text-white" : "bg-secondary text-foreground hover:bg-border"
                }`}
              >
                <Filter className="h-3.5 w-3.5" />
                {category}
              </Link>
            )
          })}
        </div>
      </SectionShell>

      {sorted.length > 0 ? (
        <SectionShell eyebrow="Library" title="Published Documents" tone="white">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sorted.map((resource) => (
              <article key={resource.id} className="card-shell p-5">
                <div className="flex items-start gap-3">
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-tsa-green-deep/10 text-tsa-green-deep">
                    <FileText className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <span className="inline-flex rounded-full bg-tsa-green-deep/10 px-2.5 py-0.5 text-xs font-semibold text-tsa-green-deep">
                      {resource.category}
                    </span>
                    <h2 className="mt-2 text-lg font-semibold text-foreground">{resource.title}</h2>
                    <p className="mt-2 text-base leading-relaxed text-muted-foreground">{resource.summary}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {resource.fileType} • {resource.fileSize} •{" "}
                      {new Date(resource.publishDate).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
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
