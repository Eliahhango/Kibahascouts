import type { Metadata } from "next"
import Image from "next/image"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { Users, Target, Eye, Heart, Handshake } from "lucide-react"
import { FAQSection } from "./faq-section"
import { getLeadersFromCms, getSiteContentSettingsFromCms } from "@/lib/cms"
import { normalizePublicText } from "@/lib/public-text"

export const metadata: Metadata = {
  title: "About Kibaha Scouts",
  description: "Learn about Kibaha Scouts mission, leadership structure, history timeline, and key governance information.",
}

export default async function AboutPage() {
  const [leadershipProfiles, siteContent] = await Promise.all([getLeadersFromCms(), getSiteContentSettingsFromCms()])
  const aboutContent = siteContent.about
  const statIcons = [Users, Target, Heart, Handshake] as const

  return (
    <>
      <Breadcrumbs items={[{ label: "About Kibaha Scouts" }]} />

      {/* Hero */}
      <section className="relative bg-tsa-green-deep" aria-label="About hero">
        <div className="absolute inset-0">
          <Image src="/images/about-hero.jpg" alt="" fill className="object-cover opacity-30" sizes="100vw" priority />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-16 md:py-24">
          <h1 className="text-balance text-3xl font-bold text-primary-foreground md:text-4xl lg:text-5xl">
            {normalizePublicText(aboutContent.heroTitle, "About KIBAHA SCOUTS")}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-primary-foreground/90 md:text-lg">
            {normalizePublicText(
              aboutContent.heroDescription,
              "Official district information, leadership contacts, and programme guidance for members, families, and partners.",
            )}
          </p>
        </div>
      </section>

      {/* District Overview */}
      <section className="bg-background py-12 md:py-16" id="overview">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid gap-8 lg:grid-cols-2">
            <div>
              <h2 className="text-2xl font-bold text-foreground md:text-3xl">
                {normalizePublicText(aboutContent.overviewTitle, "District Overview")}
              </h2>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                {normalizePublicText(aboutContent.overviewDescription)}
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {aboutContent.overviewStats.map((stat, index) => {
                const StatIcon = statIcons[index % statIcons.length]
                return (
                  <div key={`${stat.label}-${index}`} className="flex flex-col items-center rounded-lg border border-border bg-card p-6 text-center">
                    <StatIcon className="h-8 w-8 text-tsa-green-deep" />
                    <span className="mt-3 text-2xl font-bold text-foreground">{normalizePublicText(stat.value, "Coming soon")}</span>
                    <span className="mt-1 text-sm text-muted-foreground">{normalizePublicText(stat.label, "Coming soon")}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Mission, Vision, Values */}
      <section className="bg-secondary py-12 md:py-16" id="mission">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-2xl font-bold text-foreground md:text-3xl">Mission, Vision & Values</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg bg-card p-6 border border-border">
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-tsa-green-deep">
                <Target className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-card-foreground">
                {normalizePublicText(aboutContent.missionTitle, "Our Mission")}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {normalizePublicText(aboutContent.missionDescription)}
              </p>
            </div>
            <div className="rounded-lg bg-card p-6 border border-border">
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-tsa-gold">
                <Eye className="h-6 w-6 text-tsa-green-deep" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-card-foreground">
                {normalizePublicText(aboutContent.visionTitle, "Our Vision")}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {normalizePublicText(aboutContent.visionDescription)}
              </p>
            </div>
            <div className="rounded-lg bg-card p-6 border border-border">
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-tsa-green-mid">
                <Heart className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-card-foreground">
                {normalizePublicText(aboutContent.valuesTitle, "Our Values")}
              </h3>
              <ul className="mt-2 space-y-1 text-sm leading-relaxed text-muted-foreground">
                {aboutContent.valuesItems.map((item, index) => (
                  <li key={`value-${index}`}>{normalizePublicText(item)}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section className="bg-background py-12 md:py-16" id="leadership">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-2xl font-bold text-foreground md:text-3xl">District Leadership</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {normalizePublicText(
              aboutContent.leadershipIntro,
              "Leadership records are published from district updates and will continue to expand as profiles are shared.",
            )}
          </p>
          {leadershipProfiles.length > 0 ? (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {leadershipProfiles.map((leader) => (
                <div key={leader.id} className="rounded-lg border border-border bg-card p-5 text-center">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-tsa-green-deep/10">
                    <Users className="h-8 w-8 text-tsa-green-deep" />
                  </div>
                  <h3 className="mt-3 text-sm font-bold text-card-foreground">
                    {normalizePublicText(leader.name, "Leader profile coming soon")}
                  </h3>
                  <p className="text-xs font-medium text-tsa-green-deep">{normalizePublicText(leader.role)}</p>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{normalizePublicText(leader.bio)}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Serving since {normalizePublicText(leader.since)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-lg border border-border bg-card p-5 text-sm text-muted-foreground">
              Leadership profiles will be published soon.
            </div>
          )}
        </div>
      </section>

      {/* History Timeline */}
      <section className="bg-secondary py-12 md:py-16" id="history">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-2xl font-bold text-foreground md:text-3xl">History & Timeline</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {normalizePublicText(aboutContent.historyIntro, "Key milestones in Kibaha District scouting")}
          </p>
          <div className="relative mt-8 ml-2 border-l-2 border-tsa-green-deep/20 pl-6 sm:ml-4 sm:pl-8">
            {siteContent.aboutTimeline.map((entry, i) => (
              <div key={i} className="relative pb-10 last:pb-0">
                <div className="absolute -left-[33px] flex h-6 w-6 items-center justify-center rounded-full border-2 border-tsa-green-deep bg-background sm:-left-[41px]">
                  <div className="h-2.5 w-2.5 rounded-full bg-tsa-green-deep" />
                </div>
                <span className="inline-block rounded bg-tsa-green-deep px-2 py-0.5 text-xs font-bold text-primary-foreground">
                  {normalizePublicText(entry.year, "Coming soon")}
                </span>
                <h3 className="mt-2 text-base font-bold text-foreground">{normalizePublicText(entry.title)}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{normalizePublicText(entry.description)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners */}
      <section className="bg-background py-12 md:py-16" id="partners">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-2xl font-bold text-foreground md:text-3xl">Partners & Stakeholders</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {normalizePublicText(
              aboutContent.partnersIntro,
              "Verified partner profiles are being added and more details will be published soon.",
            )}
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {aboutContent.partnerItems.map((partner, index) => (
              <div key={`${partner}-${index}`} className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-tsa-green-deep/10">
                  <Handshake className="h-5 w-5 text-tsa-green-deep" />
                </div>
                <span className="text-sm font-medium text-card-foreground">{normalizePublicText(partner, "Coming soon")}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="bg-secondary py-12 md:py-16" id="faqs">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-2xl font-bold text-foreground md:text-3xl">
            {normalizePublicText(aboutContent.faqsTitle, "Frequently Asked Questions")}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {normalizePublicText(aboutContent.faqsIntro, "Answers to common questions about scouting in Kibaha")}
          </p>
          <div className="mt-8 max-w-3xl">
            <FAQSection faqs={siteContent.aboutFaqs} />
          </div>
        </div>
      </section>
    </>
  )
}
