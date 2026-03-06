import type { Metadata } from "next"
import Link from "next/link"
import { CheckCircle2, Gift, HandHeart, Users } from "lucide-react"
import { MembershipForm } from "@/components/public/membership-form"
import { PageHero } from "@/components/public/page-hero"
import { SectionShell } from "@/components/public/section-shell"
import { getSiteContentSettingsFromCms } from "@/lib/cms"
import { normalizePublicText } from "@/lib/public-text"

export const metadata: Metadata = {
  title: "Join / Volunteer",
  description: "Membership, volunteering, and support pathways for Kibaha Scouts.",
}

export default async function JoinPage() {
  const siteContent = await getSiteContentSettingsFromCms()
  const pageContent = siteContent.joinPage

  return (
    <>
      <PageHero
        title={normalizePublicText(pageContent.title, "Join / Volunteer")}
        subtitle={normalizePublicText(
          pageContent.description,
          "Follow verified membership, volunteering, and support pathways for Kibaha District Scouts.",
        )}
        breadcrumbs={[{ label: "Join / Volunteer" }]}
      />

      <SectionShell id="youth" eyebrow="Join" title={normalizePublicText(pageContent.youthTitle, "Join as Youth")} tone="background">
        <article className="space-y-5">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-tsa-green-deep/10 text-tsa-green-deep">
            <Users className="h-5 w-5" />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {pageContent.youthSteps.map((step, index) => (
              <article key={`youth-step-${index}`} className="card-shell p-4">
                <div className="flex items-start gap-3">
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-tsa-gold text-sm font-bold text-white">
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">Step {index + 1}</p>
                    <p className="mt-1 text-base leading-relaxed text-muted-foreground">{normalizePublicText(step)}</p>
                  </div>
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-tsa-green-mid" />
                </div>
              </article>
            ))}
          </div>
          <div className="mt-8">
            <h3 className="mb-2 text-xl font-bold text-foreground">Ready to Join? Apply Online</h3>
            <p className="mb-4 text-base text-muted-foreground">
              Fill in the form below and the district team will contact you to complete your registration.
            </p>
            <MembershipForm defaultRole="youth" showRoleSelector={false} />
          </div>
          {pageContent.youthNote.trim().length > 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">{normalizePublicText(pageContent.youthNote)}</p>
          ) : null}
          <div className="rounded-xl border border-tsa-gold/40 bg-tsa-gold/5 p-4">
            <p className="text-sm text-muted-foreground">
              Need help with youth registration requirements?
              {" "}
              <Link href="/contact" className="font-semibold text-tsa-green-deep hover:underline">
                Contact the district office
              </Link>
              .
            </p>
          </div>
        </article>
      </SectionShell>

      <SectionShell
        id="volunteer"
        eyebrow="Volunteer"
        title={normalizePublicText(pageContent.volunteerTitle, "Volunteer as Leader")}
        subtitle={normalizePublicText(pageContent.volunteerIntro, "Leader pathway")}
        tone="white"
      >
        <article className="space-y-5">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-tsa-green-deep/10 text-tsa-green-deep">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {pageContent.volunteerSteps.map((step, index) => (
              <article key={`volunteer-step-${index}`} className="card-shell p-4">
                <div className="flex items-start gap-3">
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-tsa-gold text-sm font-bold text-white">
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">Step {index + 1}</p>
                    <p className="mt-1 text-base leading-relaxed text-muted-foreground">{normalizePublicText(step)}</p>
                  </div>
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-tsa-green-mid" />
                </div>
              </article>
            ))}
          </div>
          <div className="mt-8">
            <h3 className="mb-2 text-xl font-bold text-foreground">Ready to Volunteer? Apply Online</h3>
            <p className="mb-4 text-base text-muted-foreground">
              Fill in the form below and the district team will contact you to complete your registration.
            </p>
            <MembershipForm defaultRole="volunteer" showRoleSelector={false} />
          </div>
          <div className="rounded-xl border border-tsa-gold/40 bg-tsa-gold/5 p-4">
            <p className="text-sm text-muted-foreground">
              Ready to volunteer and need onboarding support?
              {" "}
              <Link href="/contact" className="font-semibold text-tsa-green-deep hover:underline">
                Contact the district office
              </Link>
              .
            </p>
          </div>
        </article>
      </SectionShell>

      <SectionShell id="donate" eyebrow="Support" title={normalizePublicText(pageContent.donateTitle, "Donate / Support")} tone="background">
        <article className="space-y-5">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-tsa-green-deep/10 text-tsa-green-deep">
            <HandHeart className="h-5 w-5" />
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {pageContent.donateItems.map((item, index) => (
              <article key={`${item}-${index}`} className="card-shell p-4">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-tsa-green-deep/10 text-tsa-green-deep">
                  {index % 2 === 0 ? <HandHeart className="h-4 w-4" /> : <Gift className="h-4 w-4" />}
                </span>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{normalizePublicText(item)}</p>
              </article>
            ))}
          </div>
          {pageContent.donateNote.trim().length > 0 ? (
            <p className="mt-4 text-base text-muted-foreground">{normalizePublicText(pageContent.donateNote)}</p>
          ) : null}
          <div className="rounded-xl border border-tsa-gold/40 bg-tsa-gold/5 p-4">
            <p className="text-sm text-muted-foreground">
              Want to support through partnerships or donations?
              {" "}
              <Link href="/contact" className="font-semibold text-tsa-green-deep hover:underline">
                Contact the district office
              </Link>
              .
            </p>
          </div>
        </article>
      </SectionShell>
    </>
  )
}
