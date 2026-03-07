import type { Metadata } from "next"
import Image from "next/image"
import { notFound } from "next/navigation"
import { Award, CheckCircle2, Shirt, TrendingUp } from "lucide-react"
import { PageHero } from "@/components/public/page-hero"
import { SectionShell } from "@/components/public/section-shell"
import { getSiteContentSettingsFromCms } from "@/lib/cms"
import { normalizePublicText } from "@/lib/public-text"
import type { ProgrammeBadge } from "@/lib/types"

type BadgeFallback = {
  match: string[]
  image: string
  description: string
}

const BADGE_FALLBACKS: Record<string, BadgeFallback[]> = {
  kabu: [
    {
      match: ["uanachama"],
      image: "/images/badges/kabu/uanachama.jpg",
      description:
        "Huanzisha rasmi Kabu katika sehemu ya Skauti. Mwongozo unaonyesha msingi wake ni umri wa miaka 5-10, hadithi ya Mowgli, saluti, ahadi na sheria za Kabu.",
    },
    {
      match: ["nyota ya kwanza"],
      image: "/images/badges/kabu/nyota-ya-kwanza.jpg",
      description:
        "Hatua ya kwanza ya maendeleo ya Kabu yenye majaribio ya stadi za msingi, nidhamu, na kujitambua katika mazingira ya nyumbani na shule.",
    },
    {
      match: ["nyota ya pili"],
      image: "/images/badges/kabu/nyota-ya-pili.jpg",
      description:
        "Huongeza kiwango cha uwajibikaji kwa Kabu kupitia mazoezi zaidi ya huduma, ustadi wa vitendo, na ufuatiliaji wa maendeleo binafsi.",
    },
    {
      match: ["nyota kuu"],
      image: "/images/badges/kabu/nyota-kuu.jpg",
      description:
        "Tuzo ya juu ya Kabu. Kulingana na mwongozo, hutolewa baada ya kumaliza Nyota ya Pili na kukidhi mahitaji ya nishani za ustadi.",
    },
  ],
  junia: [
    {
      match: ["uanachama"],
      image: "/images/badges/junia/uanachama.jpg",
      description:
        "Nishani ya kuingizwa rasmi kwa Junia (miaka 11-14), ikisisitiza ahadi, sheria, na utamaduni wa patrol kabla ya mapito ya madaraja.",
    },
    {
      match: ["daraja la pili", "cheo cha pili"],
      image: "/images/badges/junia/daraja-la-pili.jpg",
      description:
        "Hatua ya mwanzo ya daraja la Junia inayopima stadi za msingi za ujasusi, kujitegemea, na ushiriki wa huduma kwa jamii.",
    },
    {
      match: ["daraja la kwanza", "cheo cha kwanza"],
      image: "/images/badges/junia/daraja-la-kwanza.jpg",
      description:
        "Daraja la juu zaidi kabla ya Mwenge, likihitaji uelewa mpana wa stadi za skauti, maadili ya uongozi, na utekelezaji wa majukumu ya patrol.",
    },
    {
      match: ["mwenge"],
      image: "/images/badges/junia/mwenge.jpg",
      description:
        "Nishani ya juu ya Junia inayohusishwa na uzalendo, huduma kwa jamii, na maandalizi ya kuhamia sehemu ya Sinia.",
    },
  ],
  sinia: [
    {
      match: ["uanachama"],
      image: "/images/badges/sinia/uanachama.jpg",
      description:
        "Hutambua kuapishwa kwa Sinia na uthibitisho wa kufuata ahadi, sheria, na misingi ya sehemu ya vijana wa miaka 15-17.",
    },
    {
      match: ["nishani ya sinia", "senior badge"],
      image: "/images/badges/sinia/sinia.jpg",
      description:
        "Hatua kuu ya kati ya Sinia inayojenga ukomavu, nidhamu ya uongozi, na uwezo wa kutekeleza majukumu ya juu ya skauti.",
    },
    {
      match: ["nyirenda", "look wide"],
      image: "/images/badges/sinia/nyirenda.jpg",
      description:
        "Nishani ya maendeleo ya juu ndani ya Sinia inayohitaji stadi za juu, huduma endelevu, na utayari wa kuwa mfano kwa makundi madogo.",
    },
    {
      match: ["kilimanjaro"],
      image: "/images/badges/sinia/kilimanjaro.jpg",
      description:
        "Nishani ya juu kabisa ya Sinia; mwongozo unaifananisha na uthubutu wa kufikia kilele cha Kilimanjaro na kubeba dhamira ya Mwenge wa Uhuru.",
    },
  ],
  "rova-scouts": [
    {
      match: ["uanachama"],
      image: "/images/badges/rova/uanachama.jpg",
      description:
        "Nishani ya kuingizwa rasmi Rova (miaka 18-26), ikiweka msingi wa maadili, utumishi, na uwajibikaji wa skauti kijana.",
    },
    {
      match: ["impeesa", "impessa"],
      image: "/images/badges/rova/impeesa.jpg",
      description:
        "Hatua ya kwanza ya mapito ya Rova, ikihusishwa na historia ya uanaskauti na uthibitisho wa stadi za msingi za uongozi na utumishi.",
    },
    {
      match: ["scout mkuu", "skauti mkuu"],
      image: "/images/badges/rova/scout-mkuu.jpg",
      description:
        "Nishani ya juu ya kati kwa Rova inayohitaji kukamilisha nishani za ustadi kwa maendeleo binafsi na huduma kwa jamii.",
    },
    {
      match: ["raisi", "rais"],
      image: "/images/badges/rova/raisi.jpg",
      description:
        "Tuzo ya juu kabisa ya Rova. Mwongozo unaieleza kama kilele cha mapito ya Rova, ikiwa na utambuzi wa kitaifa na cheti cha heshima.",
    },
  ],
}

function resolveBadgeFallback(programmeSlug: string, title: string) {
  const candidates = BADGE_FALLBACKS[programmeSlug] || []
  const normalizedTitle = title.trim().toLowerCase()
  return candidates.find((entry) => entry.match.some((keyword) => normalizedTitle.includes(keyword)))
}

function normalizeBadge(programmeSlug: string, badge: string | ProgrammeBadge) {
  const title = typeof badge === "string" ? normalizePublicText(badge, "Badge") : normalizePublicText(badge.title, "Badge")
  const fallback = resolveBadgeFallback(programmeSlug, title)
  const image = typeof badge === "string" ? fallback?.image || "" : (badge.image || "").trim() || fallback?.image || ""

  const baseDescription = typeof badge === "string" ? "" : badge.description || ""
  const description = normalizePublicText(baseDescription || fallback?.description || "", "")

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
        <SectionShell eyebrow="Badges" title="Official Badge Pathways" tone="background">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {prog.badges.map((badge, index) => {
              const item = normalizeBadge(prog.slug, badge)
              return (
                <article key={`badge-${index}`} className="card-shell flex h-full flex-col p-4">
                  <div className="flex items-center gap-3">
                    <div className="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl border border-tsa-green-deep/15 bg-white">
                      {item.image ? (
                        <Image src={item.image} alt={item.title} fill sizes="56px" className="object-contain p-1.5" />
                      ) : (
                        <Award className="h-6 w-6 text-tsa-green-deep" />
                      )}
                    </div>
                    <h3 className="text-sm font-semibold leading-tight text-foreground">{item.title}</h3>
                  </div>
                  {item.description ? (
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
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

