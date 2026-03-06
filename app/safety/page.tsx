import type { Metadata } from "next"
import Link from "next/link"
import { AlertTriangle, BadgeCheck, FileText, ShieldCheck } from "lucide-react"
import { PageHero } from "@/components/public/page-hero"
import { SectionShell } from "@/components/public/section-shell"
import { getSiteContentSettingsFromCms } from "@/lib/cms"
import { normalizePublicText } from "@/lib/public-text"

export const metadata: Metadata = {
  title: "Safety & Youth Protection",
  description:
    "Child safeguarding, misconduct reporting, adult screening, and code of conduct for Kibaha Scouts.",
}

export default async function SafetyPage() {
  const siteContent = await getSiteContentSettingsFromCms()
  const pageContent = siteContent.safetyPage

  return (
    <>
      <PageHero
        title={normalizePublicText(pageContent.title, "Safety & Youth Protection")}
        subtitle={normalizePublicText(
          pageContent.description,
          "The wellbeing of children and young people is our first responsibility in every programme and district operation.",
        )}
        breadcrumbs={[{ label: "Safety & Youth Protection" }]}
      />

      <SectionShell eyebrow="Protection" title="Safeguarding Framework" tone="background">
        <div className="grid gap-4 md:grid-cols-2">
          <article className="card-shell p-5">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-tsa-green-deep/10 text-tsa-green-deep">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <h2 className="mt-3 text-xl font-semibold text-foreground">
              {normalizePublicText(pageContent.policyTitle, "Child Safeguarding Policy")}
            </h2>
            <p className="mt-2 text-base leading-relaxed text-muted-foreground">
              {normalizePublicText(pageContent.policyDescription)}
            </p>
          </article>

          <article className="card-shell p-5">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-tsa-green-deep/10 text-tsa-green-deep">
              <BadgeCheck className="h-5 w-5" />
            </span>
            <h2 className="mt-3 text-xl font-semibold text-foreground">
              {normalizePublicText(pageContent.screeningTitle, "Adult Screening & Training")}
            </h2>
            <p className="mt-2 text-base leading-relaxed text-muted-foreground">
              {normalizePublicText(pageContent.screeningDescription)}
            </p>
          </article>
        </div>
      </SectionShell>

      <SectionShell
        eyebrow="Reporting"
        title={normalizePublicText(pageContent.reportSectionTitle, "Report Misconduct (Confidential)")}
        subtitle={normalizePublicText(pageContent.reportSectionDescription)}
        tone="white"
      >
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <article className="card-shell p-6">
            <div className="rounded-lg bg-secondary p-4 text-sm text-secondary-foreground">
              <p>
                <span className="font-semibold">Safeguarding Hotline:</span>{" "}
                {normalizePublicText(pageContent.hotlineText)}
              </p>
              <p className="mt-1">
                <span className="font-semibold">Confidential Email:</span>{" "}
                {normalizePublicText(pageContent.confidentialEmailText)}
              </p>
            </div>

            <p className="mt-4 text-base text-muted-foreground">{normalizePublicText(pageContent.reportHint)}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link href="/contact#reporting" className="btn-primary">
                {normalizePublicText(pageContent.reportFormButtonLabel, "Go to Reporting Form")}
              </Link>
              <Link href="/contact#reporting" className="btn-secondary">
                {normalizePublicText(pageContent.reportConcernButtonLabel, "Report a Concern")}
              </Link>
            </div>
          </article>

          <aside className="space-y-4">
            <article id="conduct" className="card-shell p-5">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-tsa-green-deep/10 text-tsa-green-deep">
                <FileText className="h-5 w-5" />
              </span>
              <h2 className="mt-3 text-lg font-semibold text-foreground">
                {normalizePublicText(pageContent.codeTitle, "Code of Conduct")}
              </h2>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-base text-muted-foreground">
                {pageContent.codeItems.map((item, index) => (
                  <li key={`code-item-${index}`}>{normalizePublicText(item)}</li>
                ))}
              </ul>
            </article>

            <article id="privacy" className="card-shell p-5">
              <h2 className="text-lg font-semibold text-foreground">
                {normalizePublicText(pageContent.privacyTitle, "Privacy Policy")}
              </h2>
              <p className="mt-2 text-base text-muted-foreground">
                {normalizePublicText(pageContent.privacyDescription)}
              </p>
            </article>

            <article id="terms" className="card-shell p-5">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-tsa-green-deep/10 text-tsa-green-deep">
                <AlertTriangle className="h-5 w-5" />
              </span>
              <h2 className="mt-3 text-lg font-semibold text-foreground">
                {normalizePublicText(pageContent.termsTitle, "Terms of Use")}
              </h2>
              <p className="mt-2 text-base text-muted-foreground">
                {normalizePublicText(pageContent.termsDescription)}
              </p>
            </article>
          </aside>
        </div>
      </SectionShell>
    </>
  )
}
