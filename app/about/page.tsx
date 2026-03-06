import type { Metadata } from "next"
import { Eye, Handshake, Heart, Target, Users } from "lucide-react"
import { FAQSection } from "./faq-section"
import { PageHero } from "@/components/public/page-hero"
import { SectionShell } from "@/components/public/section-shell"
import { getLeadersFromCms, getSiteContentSettingsFromCms } from "@/lib/cms"
import { normalizePublicText } from "@/lib/public-text"

export const metadata: Metadata = {
  title: "About Kibaha Scouts",
  description:
    "Learn about Kibaha Scouts mission, leadership structure, history timeline, and key governance information.",
}

export default async function AboutPage() {
  const [leadershipProfiles, siteContent] = await Promise.all([
    getLeadersFromCms(),
    getSiteContentSettingsFromCms(),
  ])
  const aboutContent = siteContent.about
  const statIcons = [Users, Target, Heart, Handshake] as const
  const partners = aboutContent.partnerItems.filter((item) => item.trim().length > 0)
  const timelineEntries = siteContent.aboutTimeline.filter((item) => item.title.trim().length > 0)
  const faqs = siteContent.aboutFaqs.filter((item) => item.question.trim().length > 0)

  return (
    <>
      <PageHero
        title={normalizePublicText(aboutContent.heroTitle, "About KIBAHA SCOUTS")}
        subtitle={normalizePublicText(
          aboutContent.heroDescription,
          "Official district information, leadership contacts, and programme guidance for members, families, and partners.",
        )}
        breadcrumbs={[{ label: "About Kibaha Scouts" }]}
      />

      <SectionShell
        id="overview"
        eyebrow="About"
        title={normalizePublicText(aboutContent.overviewTitle, "District Overview")}
        subtitle={normalizePublicText(aboutContent.overviewDescription)}
        tone="background"
      >
        {aboutContent.overviewStats.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {aboutContent.overviewStats.map((stat, index) => {
              const StatIcon = statIcons[index % statIcons.length]
              return (
                <article key={`${stat.label}-${index}`} className="card-shell p-5 text-center">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-tsa-green-deep/10 text-tsa-green-deep">
                    <StatIcon className="h-5 w-5" />
                  </span>
                  <p className="mt-3 text-2xl font-bold text-foreground">{normalizePublicText(stat.value)}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{normalizePublicText(stat.label)}</p>
                </article>
              )
            })}
          </div>
        ) : null}
      </SectionShell>

      <SectionShell eyebrow="Values" title="Mission, Vision and Values" tone="white">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <article className="card-shell p-6">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-tsa-green-deep/10 text-tsa-green-deep">
              <Target className="h-6 w-6" />
            </span>
            <h3 className="mt-4 text-lg font-semibold text-foreground">
              {normalizePublicText(aboutContent.missionTitle, "Our Mission")}
            </h3>
            <p className="mt-2 text-base leading-relaxed text-muted-foreground">
              {normalizePublicText(aboutContent.missionDescription)}
            </p>
          </article>

          <article className="card-shell p-6">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-tsa-gold/15 text-tsa-gold">
              <Eye className="h-6 w-6" />
            </span>
            <h3 className="mt-4 text-lg font-semibold text-foreground">
              {normalizePublicText(aboutContent.visionTitle, "Our Vision")}
            </h3>
            <p className="mt-2 text-base leading-relaxed text-muted-foreground">
              {normalizePublicText(aboutContent.visionDescription)}
            </p>
          </article>

          <article className="card-shell p-6">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-tsa-green-mid/15 text-tsa-green-mid">
              <Heart className="h-6 w-6" />
            </span>
            <h3 className="mt-4 text-lg font-semibold text-foreground">
              {normalizePublicText(aboutContent.valuesTitle, "Our Values")}
            </h3>
            <ul className="mt-2 space-y-1 text-base leading-relaxed text-muted-foreground">
              {aboutContent.valuesItems.map((item, index) => (
                <li key={`value-${index}`}>• {normalizePublicText(item)}</li>
              ))}
            </ul>
          </article>
        </div>
      </SectionShell>

      {leadershipProfiles.length > 0 ? (
        <SectionShell
          id="leadership"
          eyebrow="Leadership"
          title="District Leadership"
          subtitle={normalizePublicText(aboutContent.leadershipIntro)}
          tone="background"
        >
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {leadershipProfiles.map((leader) => (
              <article key={leader.id} className="card-shell p-5 text-center">
                <span className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-tsa-green-deep/10 text-tsa-green-deep">
                  <Users className="h-8 w-8" />
                </span>
                <h3 className="mt-3 text-lg font-semibold text-foreground">{normalizePublicText(leader.name)}</h3>
                <p className="text-sm font-semibold text-tsa-green-deep">{normalizePublicText(leader.role)}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{normalizePublicText(leader.bio)}</p>
                <p className="mt-2 text-xs text-muted-foreground">Serving since {normalizePublicText(leader.since)}</p>
              </article>
            ))}
          </div>
        </SectionShell>
      ) : null}

      {timelineEntries.length > 0 ? (
        <SectionShell
          id="history"
          eyebrow="History"
          title="History and Timeline"
          subtitle={normalizePublicText(aboutContent.historyIntro, "Key milestones in Kibaha District scouting.")}
          tone="white"
        >
          <div className="relative ml-2 border-l-2 border-tsa-green-deep/20 pl-6 md:ml-4 md:pl-8">
            {timelineEntries.map((entry, index) => (
              <article key={`${entry.year}-${index}`} className="relative pb-10 last:pb-0">
                <span className="absolute -left-[33px] inline-flex h-6 w-6 items-center justify-center rounded-full bg-tsa-green-deep text-xs font-bold text-white md:-left-[41px]">
                  {index + 1}
                </span>
                <p className="eyebrow">{normalizePublicText(entry.year)}</p>
                <h3 className="mt-2 text-lg font-semibold text-foreground">{normalizePublicText(entry.title)}</h3>
                <p className="mt-1 text-base leading-relaxed text-muted-foreground">{normalizePublicText(entry.description)}</p>
              </article>
            ))}
          </div>
        </SectionShell>
      ) : null}

      {partners.length > 0 ? (
        <SectionShell
          id="partners"
          eyebrow="Partnerships"
          title="Partners and Stakeholders"
          subtitle={normalizePublicText(aboutContent.partnersIntro)}
          tone="background"
        >
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {partners.map((partner, index) => (
              <article key={`${partner}-${index}`} className="card-shell flex items-center gap-3 p-4">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-tsa-green-deep/10 text-tsa-green-deep">
                  <Handshake className="h-5 w-5" />
                </span>
                <p className="text-base font-medium text-foreground">{normalizePublicText(partner)}</p>
              </article>
            ))}
          </div>
        </SectionShell>
      ) : null}

      {faqs.length > 0 ? (
        <SectionShell
          id="faqs"
          eyebrow="FAQs"
          title={normalizePublicText(aboutContent.faqsTitle, "Frequently Asked Questions")}
          subtitle={normalizePublicText(aboutContent.faqsIntro)}
          tone="white"
        >
          <div className="card-shell max-w-4xl p-5">
            <FAQSection faqs={faqs} />
          </div>
        </SectionShell>
      ) : null}
    </>
  )
}
