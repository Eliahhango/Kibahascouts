import type { Metadata } from "next"
import Link from "next/link"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { getSiteContentSettingsFromCms } from "@/lib/cms"
import { ArrowRight, Users } from "lucide-react"
import { normalizePublicText } from "@/lib/public-text"

export const metadata: Metadata = {
  title: "Programmes",
  description: "Explore Kibaha Scouts programmes for Cub Scouts, Scouts, and Rover Scouts.",
}

export default async function ProgrammesPage() {
  const siteContent = await getSiteContentSettingsFromCms()
  const pageContent = siteContent.programmesPage
  const programmes = siteContent.programmesList

  return (
    <>
      <Breadcrumbs items={[{ label: "Programmes" }]} />

      <section className="bg-background py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4">
          <h1 className="text-3xl font-bold text-foreground md:text-4xl">
            {normalizePublicText(pageContent.title, "Scout Programmes")}
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
            {normalizePublicText(
              pageContent.description,
              "Kibaha Scouts offers three progressive sections for young people aged 7 to 25. Each programme is designed to develop skills, build character, and foster a love of adventure and service.",
            )}
          </p>

          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {programmes.map((prog) => (
              <Link
                key={prog.slug}
                href={`/programmes/${prog.slug}`}
                className="group overflow-hidden rounded-lg border border-border bg-card transition-shadow hover:shadow-lg focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="relative aspect-[16/10]">
                  <div className="absolute inset-0 bg-tsa-green-deep/20 flex items-center justify-center">
                    <Users className="h-16 w-16 text-tsa-green-deep/40" />
                  </div>
                </div>
                <div className="p-6">
                  <span className="inline-block rounded-full bg-tsa-gold/20 px-3 py-1 text-xs font-semibold text-tsa-green-deep">
                    Ages {prog.ageRange}
                  </span>
                  <h2 className="mt-3 text-xl font-bold text-card-foreground group-hover:text-tsa-green-deep">
                    {prog.title}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-3">
                    {normalizePublicText(prog.description)}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-tsa-green-deep">
                    Learn more <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
