import type { Metadata } from "next"
import Image from "next/image"
import { notFound } from "next/navigation"
import { Award, CheckCircle2, Shirt, TrendingUp } from "lucide-react"
import { PageHero } from "@/components/public/page-hero"
import { SectionShell } from "@/components/public/section-shell"
import { getSiteContentSettingsFromCms } from "@/lib/cms"
import { programmes as programmeDocumentReference } from "@/lib/data"
import { normalizePublicText } from "@/lib/public-text"
import type { ProgrammeBadge } from "@/lib/types"

type BadgeFallback = {
  match: string[]
  title: string
  image: string
  description: string
}

const BADGE_FALLBACKS: Record<string, BadgeFallback[]> = {
  kabu: [
    {
      match: ["uanachama", "membership"],
      title: "Membership Badge",
      image: "/images/badges/kabu/uanachama.jpg",
      description:
        "This badge marks official entry into Kabu Scouting. It introduces the Promise, Law, salute, and foundational identity for children aged 5 to 10.",
    },
    {
      match: ["nyota ya kwanza", "first star"],
      title: "First Star Badge",
      image: "/images/badges/kabu/nyota-ya-kwanza.jpg",
      description:
        "The first development level for Kabu members, focused on basic practical skills, discipline, confidence, and everyday responsibility.",
    },
    {
      match: ["nyota ya pili", "second star"],
      title: "Second Star Badge",
      image: "/images/badges/kabu/nyota-ya-pili.jpg",
      description:
        "Builds on the first star stage with stronger self-reliance, service habits, and improved application of Scouting values in daily life.",
    },
    {
      match: ["nyota kuu", "grand star"],
      title: "Grand Star Badge",
      image: "/images/badges/kabu/nyota-kuu.jpg",
      description:
        "The highest Kabu award, granted after completing earlier star requirements and meeting the expected special-skill standards.",
    },
  ],
  junia: [
    {
      match: ["uanachama", "membership"],
      title: "Membership Badge",
      image: "/images/badges/junia/uanachama.jpg",
      description:
        "Confirms formal admission into Junia Scouting (ages 11 to 14), with emphasis on Promise, Law, patrol identity, and section discipline.",
    },
    {
      match: ["daraja la pili", "cheo cha pili", "second class"],
      title: "Second Class Badge",
      image: "/images/badges/junia/daraja-la-pili.jpg",
      description:
        "The first class-level progression in Junia, assessing core fieldcraft, personal initiative, and consistent participation in unit and community tasks.",
    },
    {
      match: ["daraja la kwanza", "cheo cha kwanza", "first class"],
      title: "First Class Badge",
      image: "/images/badges/junia/first-class-official.jpg",
      description:
        "An advanced Junia class badge requiring stronger leadership behavior, wider practical skill competence, and patrol-level responsibility.",
    },
    {
      match: ["mwenge", "torch"],
      title: "Torch (Mwenge) Badge",
      image: "",
      description:
        "The top Junia badge, recognizing readiness for higher section progression through service, commitment, and national values. Official image pending upload.",
    },
  ],
  sinia: [
    {
      match: ["uanachama", "membership"],
      title: "Membership Badge",
      image: "/images/badges/sinia/uanachama.jpg",
      description:
        "Marks formal induction into Sinia Scouting and confirms commitment to the section standards for ages 15 to 17.",
    },
    {
      match: ["nishani ya sinia", "senior badge"],
      title: "Senior Badge",
      image: "/images/badges/sinia/sinia.jpg",
      description:
        "A core Sinia advancement badge focused on maturity, leadership discipline, and dependable service performance.",
    },
    {
      match: ["nyirenda", "look wide"],
      title: "Nyirenda Badge",
      image: "/images/badges/sinia/nyirenda.jpg",
      description:
        "A higher Sinia stage that expects advanced skill application, continuous service, and role-model behavior for younger sections.",
    },
    {
      match: ["kilimanjaro"],
      title: "Kilimanjaro Badge",
      image: "/images/badges/sinia/kilimanjaro.jpg",
      description:
        "The highest Sinia award, symbolizing resilience, high achievement, and readiness for major leadership and transition responsibilities.",
    },
  ],
  "rova-scouts": [
    {
      match: ["uanachama", "membership"],
      title: "Membership Badge",
      image: "/images/badges/rova/uanachama.jpg",
      description:
        "Confirms official admission into Rova Scouting (ages 18 to 26), with a focus on values, responsibility, and service identity.",
    },
    {
      match: ["impeesa", "impessa"],
      title: "Impeesa Badge",
      image: "/images/badges/rova/impeesa.jpg",
      description:
        "The first major Rova progression badge, linked to Scouting heritage and practical leadership readiness.",
    },
    {
      match: ["scout mkuu", "skauti mkuu", "chief scout"],
      title: "Chief Scout Badge",
      image: "/images/badges/rova/scout-mkuu.jpg",
      description:
        "An advanced Rova distinction requiring completion of higher-level personal development and community-service skill pathways.",
    },
    {
      match: ["raisi", "rais", "president"],
      title: "President's Scout Badge",
      image: "/images/badges/rova/raisi.jpg",
      description:
        "The highest Rova recognition, awarded for outstanding completion of progression requirements, leadership, and national-level merit.",
    },
  ],
}

function resolveBadgeFallback(programmeSlug: string, title: string) {
  const candidates = BADGE_FALLBACKS[programmeSlug] || []
  const normalizedTitle = title.trim().toLowerCase()
  return candidates.find((entry) => entry.match.some((keyword) => normalizedTitle.includes(keyword)))
}

function normalizeBadge(programmeSlug: string, badge: string | ProgrammeBadge) {
  const sourceTitle = typeof badge === "string" ? normalizePublicText(badge, "Badge") : normalizePublicText(badge.title, "Badge")
  const fallback = resolveBadgeFallback(programmeSlug, sourceTitle)
  const title = fallback?.title || sourceTitle
  const image = fallback ? fallback.image : typeof badge === "string" ? "" : (badge.image || "").trim()

  const sourceDescription = typeof badge === "string" ? "" : badge.description || ""
  const description = normalizePublicText(fallback?.description || sourceDescription, "")

  return {
    title,
    image,
    description,
  }
}

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

  const docsProgramme = programmeDocumentReference.find((programme) => programme.slug === prog.slug)
  const displayObjectives = docsProgramme?.objectives?.length ? docsProgramme.objectives : prog.objectives
  const displayActivities = docsProgramme?.activities?.length ? docsProgramme.activities : prog.activities

  return (
    <>
      <PageHero
        title={prog.title}
        subtitle={normalizePublicText(prog.description)}
        breadcrumbs={[{ label: "Programmes", href: "/programmes" }, { label: prog.title }]}
      />

      {displayObjectives.length > 0 ? (
        <SectionShell eyebrow="Objectives" title="Learning Objectives" tone="background">
          <div className="grid gap-4 md:grid-cols-2">
            {displayObjectives.map((obj, index) => (
              <article key={`objective-${index}`} className="card-shell flex items-start gap-3 p-4">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-tsa-green-deep" />
                <p className="text-base leading-relaxed text-foreground">{normalizePublicText(obj)}</p>
              </article>
            ))}
          </div>
        </SectionShell>
      ) : null}

      {displayActivities.length > 0 ? (
        <SectionShell eyebrow="Activities" title="Programme Activities" tone="white">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {displayActivities.map((act, index) => (
              <article key={`activity-${index}`} className="card-shell p-4">
                <p className="text-base font-medium text-foreground">{normalizePublicText(act)}</p>
              </article>
            ))}
          </div>
        </SectionShell>
      ) : null}

      {prog.badges.length > 0 ? (
        <SectionShell eyebrow="Badges" title="Official Badge Pathways" tone="background">
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-2">
            {prog.badges.map((badge, index) => {
              const item = normalizeBadge(prog.slug, badge)
              return (
                <article key={`badge-${index}`} className="card-shell flex h-full flex-col p-6 sm:p-7">
                  <div className="relative mx-auto h-36 w-36 overflow-hidden rounded-2xl border border-tsa-green-deep/20 bg-white shadow-sm sm:h-44 sm:w-44 lg:h-48 lg:w-48">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        sizes="(max-width: 640px) 144px, (max-width: 1024px) 176px, 192px"
                        className="object-contain p-2.5"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Award className="h-10 w-10 text-tsa-green-deep" />
                      </div>
                    )}
                  </div>
                  <h3 className="mt-4 text-center text-lg font-semibold leading-tight text-foreground">{item.title}</h3>
                  {item.description ? (
                    <p className="mt-3 text-center text-base leading-relaxed text-muted-foreground">{item.description}</p>
                  ) : null}
                </article>
              )
            })}
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


