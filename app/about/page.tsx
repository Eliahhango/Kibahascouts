import type { Metadata } from "next"
import Image from "next/image"
import { ArrowRight, Eye, Handshake, Heart, Target, Users } from "lucide-react"
import { FAQSection } from "./faq-section"
import { PartnerLogo } from "@/components/public/partner-logo"
import { PageHero } from "@/components/public/page-hero"
import { SectionShell } from "@/components/public/section-shell"
import { getLeadersFromCms, getSiteContentSettingsFromCms } from "@/lib/cms"
import { normalizePublicText } from "@/lib/public-text"
import { siteConfig } from "@/lib/site-config"

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
                <li key={`value-${index}`}>- {normalizePublicText(item)}</li>
              ))}
            </ul>
          </article>
        </div>
      </SectionShell>

      <SectionShell eyebrow="Affiliation" title="International Membership" tone="tinted">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <article className="card-shell flex items-center gap-5 p-6">
            <a href="https://www.scout.org" target="_blank" rel="noreferrer" className="shrink-0">
              <Image
                src="/images/branding/wosm-badge.png"
                alt="World Organization of the Scout Movement"
                width={80}
                height={80}
                className="h-20 w-20 rounded-full object-contain shadow-md"
              />
            </a>
            <div>
              <h3 className="text-lg font-semibold text-foreground">World Organization of the Scout Movement</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {"Kibaha Scouts is a proud member of WOSM \u2014 the global body representing over 57 million Scouts across 172 countries."}
              </p>
              <a
                href="https://www.scout.org"
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-tsa-green-deep hover:underline"
              >
                scout.org
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </article>

          <article className="card-shell flex items-center gap-5 p-6">
            <a href="https://tanzaniascouts.or.tz" target="_blank" rel="noreferrer" className="shrink-0">
              <Image
                src="/images/branding/tanzania-scouts-logo.png"
                alt="Tanzania Scouts Association"
                width={80}
                height={80}
                className="h-20 w-20 rounded-full object-contain shadow-md"
              />
            </a>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Tanzania Scouts Association</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Kibaha District is an official local association under the Tanzania Scouts Association, operating under the national body since its founding.
              </p>
              <a
                href="https://tanzaniascouts.or.tz"
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-tsa-green-deep hover:underline"
              >
                tanzaniascouts.or.tz
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </article>
        </div>

        <div className="mt-5 rounded-xl border border-tsa-gold/30 bg-tsa-gold/5 px-6 py-4 text-center">
          <p className="text-sm font-semibold text-foreground">Patron: The President of The United Republic of Tanzania</p>
          <p className="mt-0.5 text-sm italic text-muted-foreground">Mlezi: Rais wa Jamhuri ya Muungano wa Tanzania</p>
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
          <div className="space-y-4">
            {timelineEntries.map((entry, index) => (
              <article
                key={`${entry.year}-${index}`}
                className="relative pl-8 before:absolute before:bottom-0 before:left-3 before:top-0 before:w-0.5 before:bg-tsa-gold/30 last:before:hidden"
              >
                <span className="absolute left-0 top-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-tsa-gold text-xs font-bold text-white">
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

      <SectionShell
        id="partners"
        eyebrow="Partnerships"
        title="Our Partners and Collaborators"
        subtitle="Kibaha Scouts works in partnership with national and international organisations to advance Scouting and youth development across the district."
        tone="white"
      >
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {siteConfig.partners.map((partner) => (
            <a
              key={partner.name}
              href={partner.href}
              target="_blank"
              rel="noreferrer"
              title={partner.name}
              className="group flex flex-col items-center gap-3 rounded-2xl border border-border bg-white p-4 shadow-sm transition-all duration-200 hover:border-tsa-gold hover:shadow-md"
            >
              <div className="relative flex h-16 w-16 shrink-0 items-center justify-center sm:h-20 sm:w-20">
                <PartnerLogo src={partner.logo} alt={partner.name} />
              </div>
              <p className="text-center text-xs font-semibold leading-tight text-foreground group-hover:text-tsa-green-deep">
                {partner.name}
              </p>
            </a>
          ))}
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Kibaha Scouts is an official local association of the Tanzania Scouts Association.
          </p>
          <a
            href="https://tanzaniascouts.or.tz"
            target="_blank"
            rel="noreferrer"
            className="btn-secondary mt-3 inline-flex"
          >
            Visit Tanzania Scouts Association
            <ArrowRight className="ml-1.5 h-4 w-4" />
          </a>
        </div>
      </SectionShell>

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


