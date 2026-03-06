import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Award, CheckCircle2, Shirt, TrendingUp } from "lucide-react"
import { PageHero } from "@/components/public/page-hero"
import { SectionShell } from "@/components/public/section-shell"
import { getSiteContentSettingsFromCms } from "@/lib/cms"
import { normalizePublicText } from "@/lib/public-text"

export async function generateStaticParams() {
  const siteContent = await getSiteContentSettingsFromCms()
  return siteContent.programmesList.map((programme) => ({ slug: programme.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const siteContent = await getSiteContentSettingsFromCms()
  const prog = siteContent.programmesList.find((programme) => programme.slug === slug)
  if (!prog) return { title: "Programme Not Found" }
  return { title: prog.title, description: normalizePublicText(prog.description).slice(0, 160) }
}

export default async function ProgrammeDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const siteContent = await getSiteContentSettingsFromCms()
  const prog = siteContent.programmesList.find((programme) => programme.slug === slug)
  if (!prog) notFound()

  return (
    <>
      <PageHero
        title={prog.title}
        subtitle={normalizePublicText(prog.description)}
        breadcrumbs={[{ label: "Programmes", href: "/programmes" }, { label: prog.title }]}
      />

      {prog.objectives.length > 0 ? (
        <SectionShell eyebrow="Objectives" title="Learning Objectives" tone="background">
          <div className="grid gap-4 md:grid-cols-2">
            {prog.objectives.map((obj, index) => (
              <article key={`objective-${index}`} className="card-shell flex items-start gap-3 p-4">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-tsa-green-deep" />
                <p className="text-base leading-relaxed text-foreground">{normalizePublicText(obj)}</p>
              </article>
            ))}
          </div>
        </SectionShell>
      ) : null}

      {prog.activities.length > 0 ? (
        <SectionShell eyebrow="Activities" title="Programme Activities" tone="white">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {prog.activities.map((act, index) => (
              <article key={`activity-${index}`} className="card-shell p-4">
                <p className="text-base font-medium text-foreground">{normalizePublicText(act)}</p>
              </article>
            ))}
          </div>
        </SectionShell>
      ) : null}

      {prog.badges.length > 0 ? (
        <SectionShell eyebrow="Badges" title="Badge Pathways" tone="background">
          <div className="flex flex-wrap gap-3">
            {prog.badges.map((badge, index) => (
              <span
                key={`badge-${index}`}
                className="inline-flex items-center gap-1 rounded-full border border-tsa-green-deep/20 bg-tsa-green-deep/5 px-4 py-2 text-sm font-medium text-tsa-green-deep"
              >
                <Award className="h-4 w-4" />
                {normalizePublicText(badge)}
              </span>
            ))}
          </div>
        </SectionShell>
      ) : null}

      {prog.progression.length > 0 ? (
        <SectionShell eyebrow="Progression" title="Progression Path" tone="white">
          <div className="relative ml-2 border-l-2 border-tsa-gold/35 pl-6 md:ml-4 md:pl-8">
            {prog.progression.map((step, index) => (
              <article key={`progress-${index}`} className="relative pb-8 last:pb-0">
                <span className="absolute -left-[33px] inline-flex h-6 w-6 items-center justify-center rounded-full bg-tsa-gold text-xs font-bold text-white md:-left-[41px]">
                  {index + 1}
                </span>
                <p className="inline-flex items-center gap-2 text-base font-medium text-foreground">
                  <TrendingUp className="h-4 w-4 text-tsa-green-deep" />
                  {normalizePublicText(step)}
                </p>
              </article>
            ))}
          </div>
        </SectionShell>
      ) : null}

      {prog.uniformGuidance.trim().length > 0 ? (
        <SectionShell eyebrow="Uniform" title="Uniform Guidance" tone="background">
          <article className="card-shell max-w-3xl p-5">
            <p className="inline-flex items-center gap-2 text-base leading-relaxed text-muted-foreground">
              <Shirt className="h-5 w-5 text-tsa-green-mid" />
              {normalizePublicText(prog.uniformGuidance)}
            </p>
          </article>
        </SectionShell>
      ) : null}
    </>
  )
}
