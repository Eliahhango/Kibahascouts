import type { Metadata } from "next"
import Image from "next/image"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { timelineEntries, faqs } from "@/lib/data"
import { Users, Target, Eye, Heart, Handshake } from "lucide-react"
import { FAQSection } from "./faq-section"
import { getLeadersFromCms } from "@/lib/cms"

export const metadata: Metadata = {
  title: "About Kibaha Scouts",
  description: "Learn about Kibaha Scouts mission, leadership structure, history timeline, and key governance information.",
}

export default async function AboutPage() {
  const leadershipProfiles = await getLeadersFromCms()

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
            About KIBAHA SCOUTS
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-primary-foreground/90 md:text-lg">
            Official district information, leadership contacts, and programme guidance for members, families, and
            partners.
          </p>
        </div>
      </section>

      {/* District Overview */}
      <section className="bg-background py-12 md:py-16" id="overview">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid gap-8 lg:grid-cols-2">
            <div>
              <h2 className="text-2xl font-bold text-foreground md:text-3xl">District Overview</h2>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                Kibaha Scouts supports youth development through district-level scouting programmes, safeguarding
                standards, and volunteer-led community service activities under the Tanzania Scouts Association
                framework.
              </p>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                This page uses placeholders where district values require verification. Update all marked items with
                approved figures and official records before publishing production content.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { number: "[INSERT REAL STATS]", label: "Youth Members", icon: Users },
                { number: "[INSERT REAL STATS]", label: "Active Units", icon: Target },
                { number: "[INSERT REAL STATS]", label: "Adult Volunteers", icon: Heart },
                { number: "[INSERT REAL STATS]", label: "Annual Service Hours", icon: Handshake },
              ].map((stat) => (
                <div key={stat.label} className="flex flex-col items-center rounded-lg border border-border bg-card p-6 text-center">
                  <stat.icon className="h-8 w-8 text-tsa-green-deep" />
                  <span className="mt-3 text-2xl font-bold text-foreground">{stat.number}</span>
                  <span className="mt-1 text-sm text-muted-foreground">{stat.label}</span>
                </div>
              ))}
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
              <h3 className="mt-4 text-lg font-bold text-card-foreground">Our Mission</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                To contribute to the education and development of young people in Kibaha through a value system based on the Scout Promise and Law, helping to build a better world where people are self-fulfilled as individuals and play a constructive role in society.
              </p>
            </div>
            <div className="rounded-lg bg-card p-6 border border-border">
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-tsa-gold">
                <Eye className="h-6 w-6 text-tsa-green-deep" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-card-foreground">Our Vision</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                A Kibaha District where every young person has access to quality scouting, empowering them to become active citizens who create positive change in their communities and beyond.
              </p>
            </div>
            <div className="rounded-lg bg-card p-6 border border-border">
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-tsa-green-mid">
                <Heart className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-card-foreground">Our Values</h3>
              <ul className="mt-2 space-y-1 text-sm leading-relaxed text-muted-foreground">
                <li>Integrity and trustworthiness</li>
                <li>Respect for self and others</li>
                <li>Service to the community</li>
                <li>Environmental stewardship</li>
                <li>Inclusivity and belonging</li>
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
            Leadership records are shown from CMS or sample placeholders until verified district records are published.
          </p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {leadershipProfiles.map((leader) => (
              <div key={leader.id} className="rounded-lg border border-border bg-card p-5 text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-tsa-green-deep/10">
                  <Users className="h-8 w-8 text-tsa-green-deep" />
                </div>
                <h3 className="mt-3 text-sm font-bold text-card-foreground">{leader.name}</h3>
                <p className="text-xs font-medium text-tsa-green-deep">{leader.role}</p>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{leader.bio}</p>
                <p className="mt-1 text-xs text-muted-foreground">Serving since {leader.since}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* History Timeline */}
      <section className="bg-secondary py-12 md:py-16" id="history">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-2xl font-bold text-foreground md:text-3xl">History & Timeline</h2>
          <p className="mt-2 text-sm text-muted-foreground">Key milestones in Kibaha District scouting</p>
          <div className="relative mt-8 ml-2 border-l-2 border-tsa-green-deep/20 pl-6 sm:ml-4 sm:pl-8">
            {timelineEntries.map((entry, i) => (
              <div key={i} className="relative pb-10 last:pb-0">
                <div className="absolute -left-[33px] flex h-6 w-6 items-center justify-center rounded-full border-2 border-tsa-green-deep bg-background sm:-left-[41px]">
                  <div className="h-2.5 w-2.5 rounded-full bg-tsa-green-deep" />
                </div>
                <span className="inline-block rounded bg-tsa-green-deep px-2 py-0.5 text-xs font-bold text-primary-foreground">
                  {entry.year}
                </span>
                <h3 className="mt-2 text-base font-bold text-foreground">{entry.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{entry.description}</p>
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
            Confirm and publish only verified partner organizations and signed collaboration records.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              "[CONFIRM PARTNER 1]",
              "[CONFIRM PARTNER 2]",
              "[CONFIRM PARTNER 3]",
              "[CONFIRM PARTNER 4]",
              "[CONFIRM PARTNER 5]",
              "[CONFIRM PARTNER 6]",
              "[CONFIRM PARTNER 7]",
              "[CONFIRM PARTNER 8]",
            ].map((partner) => (
              <div key={partner} className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-tsa-green-deep/10">
                  <Handshake className="h-5 w-5 text-tsa-green-deep" />
                </div>
                <span className="text-sm font-medium text-card-foreground">{partner}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="bg-secondary py-12 md:py-16" id="faqs">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-2xl font-bold text-foreground md:text-3xl">Frequently Asked Questions</h2>
          <p className="mt-2 text-sm text-muted-foreground">Answers to common questions about scouting in Kibaha</p>
          <div className="mt-8 max-w-3xl">
            <FAQSection faqs={faqs} />
          </div>
        </div>
      </section>
    </>
  )
}
