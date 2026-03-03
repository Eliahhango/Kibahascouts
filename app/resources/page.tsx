import type { Metadata } from "next"
import Link from "next/link"
import { Download, FileText, Filter } from "lucide-react"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { getResourcesFromCms } from "@/lib/cms"

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
  const resources = (await getResourcesFromCms()).filter((resource) => resource.published !== false)
  const selectedCategory = params.category
  const filtered =
    selectedCategory && selectedCategory !== "All"
      ? resources.filter((resource) => resource.category === selectedCategory)
      : resources

  const sorted = [...filtered].sort((a, b) => +new Date(b.publishDate) - +new Date(a.publishDate))
  const lastUpdated =
    sorted
      .map((resource) => resource.updatedAt || resource.publishDate)
      .filter(Boolean)
      .sort((a, b) => +new Date(b) - +new Date(a))[0] ?? null

  return (
    <>
      <Breadcrumbs items={[{ label: "Resources" }]} />

      <section className="bg-background py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4">
          <h1 className="text-3xl font-bold text-foreground md:text-4xl">Resources</h1>
          <p className="mt-3 max-w-3xl text-base leading-relaxed text-muted-foreground">
            Search the district document library for forms, training references, policy documents, and reports.
          </p>
          {lastUpdated ? (
            <p className="mt-2 text-xs text-muted-foreground">
              Last updated: {new Date(lastUpdated).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          ) : null}

          <div className="mt-6 flex flex-wrap gap-2">
            {categories.map((category) => {
              const isActive = (category === "All" && !selectedCategory) || selectedCategory === category
              const href = category === "All" ? "/resources" : `/resources?category=${encodeURIComponent(category)}`
              return (
                <Link
                  key={category}
                  href={href}
                  className={`inline-flex items-center gap-1 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-tsa-green-deep text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-border"
                  }`}
                >
                  <Filter className="h-3.5 w-3.5" />
                  {category}
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      <section className="bg-secondary py-12">
        <div className="mx-auto max-w-7xl px-4">
          {sorted.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {sorted.map((resource) => (
                <article key={resource.id} className="rounded-lg border border-border bg-card p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-tsa-green-deep/10">
                      <FileText className="h-5 w-5 text-tsa-green-deep" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="rounded bg-tsa-green-deep/10 px-2 py-0.5 text-xs font-semibold text-tsa-green-deep">
                        {resource.category}
                      </span>
                      <h2 className="mt-2 text-base font-semibold text-card-foreground">{resource.title}</h2>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{resource.summary}</p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {resource.fileType} - {resource.fileSize} - Published{" "}
                        {new Date(resource.publishDate).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                      {resource.downloadUrl && resource.downloadUrl !== "#" ? (
                        <Link
                          href={resource.downloadUrl}
                          className="mt-3 inline-flex items-center gap-1 rounded-md bg-tsa-green-deep px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-tsa-green-mid"
                        >
                          <Download className="h-3.5 w-3.5" />
                          Download
                        </Link>
                      ) : (
                        <span className="mt-3 inline-flex items-center gap-1 rounded-md bg-secondary px-3 py-1.5 text-xs font-semibold text-muted-foreground">
                          Download will be available soon
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-border bg-card p-5">
              <h2 className="text-base font-semibold text-card-foreground">Resource library updates are coming soon</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Published resources will appear here automatically once they are posted from the admin dashboard.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
