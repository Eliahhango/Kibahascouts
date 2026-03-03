import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { programmes } from "@/lib/data"
import { CheckCircle2, Award, TrendingUp, Shirt } from "lucide-react"
import { normalizePublicText } from "@/lib/public-text"

export async function generateStaticParams() {
  return programmes.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const prog = programmes.find((p) => p.slug === slug)
  if (!prog) return { title: "Programme Not Found" }
  return { title: prog.title, description: normalizePublicText(prog.description).slice(0, 160) }
}

export default async function ProgrammeDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const prog = programmes.find((p) => p.slug === slug)
  if (!prog) notFound()

  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Programmes", href: "/programmes" },
          { label: prog.title },
        ]}
      />

      {/* Header */}
      <section className="bg-tsa-green-deep py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4">
          <span className="inline-block rounded-full bg-tsa-gold px-3 py-1 text-xs font-semibold text-tsa-green-deep">
            Ages {prog.ageRange}
          </span>
          <h1 className="mt-3 text-3xl font-bold text-primary-foreground md:text-4xl">
            {prog.title}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-primary-foreground/90">
            {normalizePublicText(prog.description)}
          </p>
        </div>
      </section>

      {/* Objectives */}
      <section className="bg-background py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-2xl font-bold text-foreground">Objectives</h2>
          <ul className="mt-6 grid gap-3 md:grid-cols-2">
            {prog.objectives.map((obj, i) => (
              <li key={i} className="flex items-start gap-3 rounded-lg border border-border bg-card p-4">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-tsa-green-deep" />
                <span className="text-sm leading-relaxed text-card-foreground">{obj}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Activities */}
      <section className="bg-secondary py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-2xl font-bold text-foreground">Activities</h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {prog.activities.map((act, i) => (
              <div key={i} className="rounded-lg border border-border bg-card p-4">
                <p className="text-sm font-medium text-card-foreground">{act}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Badges */}
      <section className="bg-background py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="flex items-center gap-2 text-2xl font-bold text-foreground">
            <Award className="h-6 w-6 text-tsa-gold" />
            Badges
          </h2>
          <div className="mt-6 flex flex-wrap gap-3">
            {prog.badges.map((badge, i) => (
              <span
                key={i}
                className="rounded-full border border-tsa-green-deep/20 bg-tsa-green-deep/5 px-4 py-2 text-sm font-medium text-tsa-green-deep"
              >
                {normalizePublicText(badge, "Badge details coming soon")}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Progression */}
      <section className="bg-secondary py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="flex items-center gap-2 text-2xl font-bold text-foreground">
            <TrendingUp className="h-6 w-6 text-tsa-green-deep" />
            Progression Path
          </h2>
          <div className="relative mt-8 ml-2 border-l-2 border-tsa-gold/30 pl-6 sm:ml-4 sm:pl-8">
            {prog.progression.map((step, i) => (
              <div key={i} className="relative pb-8 last:pb-0">
                <div className="absolute -left-[33px] flex h-6 w-6 items-center justify-center rounded-full bg-tsa-gold text-tsa-green-deep font-bold text-xs sm:-left-[41px]">
                  {i + 1}
                </div>
                <p className="text-sm leading-relaxed text-foreground">{normalizePublicText(step)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Uniform */}
      <section className="bg-background py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="flex items-center gap-2 text-2xl font-bold text-foreground">
            <Shirt className="h-6 w-6 text-tsa-green-mid" />
            Uniform Guidance
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {normalizePublicText(prog.uniformGuidance)}
          </p>
        </div>
      </section>
    </>
  )
}
