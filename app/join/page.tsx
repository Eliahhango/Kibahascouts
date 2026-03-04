import type { Metadata } from "next"
import { CheckCircle2, HandHeart, Users } from "lucide-react"
import { Breadcrumbs } from "@/components/breadcrumbs"
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
      <Breadcrumbs items={[{ label: "Join / Volunteer" }]} />

      <section className="bg-background py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-foreground md:text-4xl">
            {normalizePublicText(pageContent.title, "Join / Volunteer")}
          </h1>
          <p className="mt-3 max-w-3xl text-base leading-relaxed text-muted-foreground">
            {normalizePublicText(
              pageContent.description,
              "Use this page to follow verified joining and volunteering steps. Additional district-specific details will be published as soon as they are approved.",
            )}
          </p>
        </div>
      </section>

      <section id="youth" className="bg-secondary py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-tsa-green-deep/10">
              <Users className="h-5 w-5 text-tsa-green-deep" />
            </div>
            <h2 className="mt-3 text-2xl font-bold text-card-foreground">
              {normalizePublicText(pageContent.youthTitle, "Join as Youth")}
            </h2>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
              {pageContent.youthSteps.map((step, index) => (
                <li key={`youth-step-${index}`}>{normalizePublicText(step)}</li>
              ))}
            </ol>
            <p className="mt-3 text-xs text-muted-foreground">
              {normalizePublicText(pageContent.youthNote)}
            </p>
          </div>
        </div>
      </section>

      <section id="volunteer" className="bg-background py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-tsa-green-deep/10">
              <CheckCircle2 className="h-5 w-5 text-tsa-green-deep" />
            </div>
            <h2 className="mt-3 text-2xl font-bold text-card-foreground">
              {normalizePublicText(pageContent.volunteerTitle, "Volunteer as Leader")}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">{normalizePublicText(pageContent.volunteerIntro, "Leader pathway:")}</p>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
              {pageContent.volunteerSteps.map((step, index) => (
                <li key={`volunteer-step-${index}`}>{normalizePublicText(step)}</li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section id="donate" className="bg-secondary py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-tsa-green-deep/10">
              <HandHeart className="h-5 w-5 text-tsa-green-deep" />
            </div>
            <h2 className="mt-3 text-2xl font-bold text-card-foreground">
              {normalizePublicText(pageContent.donateTitle, "Donate / Support")}
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {pageContent.donateItems.map((item, index) => (
                <div key={`${item}-${index}`} className="rounded-md bg-secondary p-3 text-sm text-secondary-foreground">
                  {normalizePublicText(item)}
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              {normalizePublicText(pageContent.donateNote)}
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
