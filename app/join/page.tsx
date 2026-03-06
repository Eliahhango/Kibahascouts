import type { Metadata } from "next"
import { CheckCircle2, HandHeart, Users } from "lucide-react"
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
        <article className="card-shell p-6">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-tsa-green-deep/10 text-tsa-green-deep">
            <Users className="h-5 w-5" />
          </div>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-base text-muted-foreground">
            {pageContent.youthSteps.map((step, index) => (
              <li key={`youth-step-${index}`}>{normalizePublicText(step)}</li>
            ))}
          </ol>
          {pageContent.youthNote.trim().length > 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">{normalizePublicText(pageContent.youthNote)}</p>
          ) : null}
        </article>
      </SectionShell>

      <SectionShell
        id="volunteer"
        eyebrow="Volunteer"
        title={normalizePublicText(pageContent.volunteerTitle, "Volunteer as Leader")}
        subtitle={normalizePublicText(pageContent.volunteerIntro, "Leader pathway")}
        tone="white"
      >
        <article className="card-shell p-6">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-tsa-green-deep/10 text-tsa-green-deep">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-base text-muted-foreground">
            {pageContent.volunteerSteps.map((step, index) => (
              <li key={`volunteer-step-${index}`}>{normalizePublicText(step)}</li>
            ))}
          </ol>
        </article>
      </SectionShell>

      <SectionShell id="donate" eyebrow="Support" title={normalizePublicText(pageContent.donateTitle, "Donate / Support")} tone="background">
        <article className="card-shell p-6">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-tsa-green-deep/10 text-tsa-green-deep">
            <HandHeart className="h-5 w-5" />
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {pageContent.donateItems.map((item, index) => (
              <div key={`${item}-${index}`} className="rounded-lg bg-secondary p-3 text-sm text-secondary-foreground">
                {normalizePublicText(item)}
              </div>
            ))}
          </div>
          {pageContent.donateNote.trim().length > 0 ? (
            <p className="mt-4 text-base text-muted-foreground">{normalizePublicText(pageContent.donateNote)}</p>
          ) : null}
        </article>
      </SectionShell>
    </>
  )
}
