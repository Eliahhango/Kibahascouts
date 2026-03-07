import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, Users } from "lucide-react"
import { PageHero } from "@/components/public/page-hero"
import { SectionShell } from "@/components/public/section-shell"
import { getSiteContentSettingsFromCms } from "@/lib/cms"
import { normalizePublicText } from "@/lib/public-text"

export const metadata: Metadata = {
  title: "Programmes",
  description: "Explore Kibaha Scouts programmes for Kabu, Junia, Sinia, and Rova sections.",
}

export default async function ProgrammesPage() {
  const siteContent = await getSiteContentSettingsFromCms()
  const pageContent = siteContent.programmesPage
  const programmes = siteContent.programmesList

  return (
    <>
      <PageHero
        title={normalizePublicText(pageContent.title, "Scout Programmes")}
        subtitle={normalizePublicText(
          pageContent.description,
          "Kibaha Scouts offers four progressive sections (Kabu, Junia, Sinia, and Rova) for members aged 5 to 26, with clear badge progression at each stage.",
        )}
        breadcrumbs={[{ label: "Programmes" }]}
      />

      {programmes.length > 0 ? (
        <SectionShell eyebrow="Programmes" title="Age-Based Scout Sections" tone="background">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {programmes.map((prog, index) => (
              <Link key={prog.slug} href={`/programmes/${prog.slug}`} className="card-shell group overflow-hidden">
                <div
                  className={`relative aspect-[16/10] ${
                    index % 2 === 0
                      ? "bg-gradient-to-br from-tsa-green-deep to-tsa-green-mid"
                      : "bg-gradient-to-br from-tsa-green-mid to-tsa-green-light"
                  }`}
                >
                  <div className="absolute inset-0 flex items-center px-5">
                    <h2 className="text-2xl font-bold leading-tight text-white">{prog.title}</h2>
                  </div>
                  <Users className="absolute bottom-3 right-3 h-16 w-16 text-white/20" />
                </div>
                <div className="p-5">
                  <span className="inline-flex rounded-full bg-tsa-gold/15 px-3 py-1 text-xs font-semibold text-tsa-gold">
                    Ages {prog.ageRange}
                  </span>
                  <h2 className="mt-3 text-xl font-semibold text-foreground">{prog.title}</h2>
                  <p className="mt-2 line-clamp-3 text-base leading-relaxed text-muted-foreground">
                    {normalizePublicText(prog.description)}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-tsa-green-deep">
                    Learn more <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </SectionShell>
      ) : null}
    </>
  )
}

