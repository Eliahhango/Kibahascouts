import type { Metadata } from "next"
import Link from "next/link"
import { AlertTriangle, BadgeCheck, FileText, ShieldCheck } from "lucide-react"
import { Breadcrumbs } from "@/components/breadcrumbs"

export const metadata: Metadata = {
  title: "Safety & Youth Protection",
  description: "Child safeguarding, misconduct reporting, adult screening, and code of conduct for Kibaha Scouts.",
}

export default function SafetyPage() {
  return (
    <>
      <Breadcrumbs items={[{ label: "Safety & Youth Protection" }]} />

      <section className="bg-background py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4">
          <h1 className="text-3xl font-bold text-foreground md:text-4xl">Safety & Youth Protection</h1>
          <p className="mt-3 max-w-3xl text-base leading-relaxed text-muted-foreground">
            The wellbeing of children and young people is our first responsibility in every programme, activity, and district operation.
          </p>
          <div className="mt-6">
            <Link
              href="/contact#reporting"
              className="inline-flex rounded-md bg-tsa-green-deep px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-tsa-green-mid"
            >
              Report a Concern
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-secondary py-12">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid gap-4 md:grid-cols-2">
            <article className="rounded-lg border border-border bg-card p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-tsa-green-deep/10">
                <ShieldCheck className="h-5 w-5 text-tsa-green-deep" />
              </div>
              <h2 className="mt-3 text-xl font-bold text-card-foreground">Child Safeguarding Policy</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                All units follow a safeguarding framework covering supervision ratios, risk assessments, safe conduct,
                digital communication boundaries, and incident escalation protocols.
              </p>
            </article>

            <article className="rounded-lg border border-border bg-card p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-tsa-green-deep/10">
                <BadgeCheck className="h-5 w-5 text-tsa-green-deep" />
              </div>
              <h2 className="mt-3 text-xl font-bold text-card-foreground">Adult Screening & Training</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                New leaders complete identity verification, references, child protection induction, and required refresher
                training before direct responsibility for youth members.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="bg-background py-12">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <article className="rounded-lg border border-border bg-card p-6">
              <h2 className="text-2xl font-bold text-card-foreground">Report Misconduct (Confidential)</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                If a child is in immediate danger, contact emergency services first. For safeguarding concerns, submit a confidential report through our contact reporting form.
              </p>

              <div className="mt-3 rounded-md bg-secondary p-3 text-sm text-secondary-foreground">
                <p>
                  <span className="font-semibold">Safeguarding Hotline:</span> Hotline details will be shared soon.
                </p>
                <p className="mt-1">
                  <span className="font-semibold">Confidential Email:</span> Confidential email details will be shared soon.
                </p>
              </div>

              <div className="mt-4 rounded-md border border-border bg-card p-4">
                <p className="text-sm text-muted-foreground">
                  Use the secure reporting form on the contact page. Include what happened, where it happened, and when it happened.
                </p>
                <Link
                  href="/contact#reporting"
                  className="mt-3 inline-flex rounded-md bg-tsa-green-deep px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-tsa-green-mid"
                >
                  Go to Reporting Form
                </Link>
              </div>
            </article>

            <aside className="space-y-4">
              <article id="conduct" className="rounded-lg border border-border bg-card p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-tsa-green-deep/10">
                  <FileText className="h-5 w-5 text-tsa-green-deep" />
                </div>
                <h2 className="mt-3 text-lg font-bold text-card-foreground">Code of Conduct</h2>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                  <li>Respect youth dignity and rights at all times.</li>
                  <li>Use transparent communication and accountable supervision.</li>
                  <li>Do not tolerate bullying, discrimination, or abuse.</li>
                  <li>Report concerns through official channels without delay.</li>
                </ul>
              </article>

              <article id="privacy" className="rounded-lg border border-border bg-card p-5">
                <h2 className="text-lg font-bold text-card-foreground">Privacy Policy</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Personal data from youth members, guardians, volunteers, and reports is handled only for programme
                  delivery, legal compliance, and safeguarding responsibilities.
                </p>
              </article>

              <article id="terms" className="rounded-lg border border-border bg-card p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-tsa-green-deep/10">
                  <AlertTriangle className="h-5 w-5 text-tsa-green-deep" />
                </div>
                <h2 className="mt-3 text-lg font-bold text-card-foreground">Terms of Use</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  This website provides official district information. Unauthorized use of TSA trademarks and misuse of reporting channels is prohibited.
                </p>
              </article>
            </aside>
          </div>
        </div>
      </section>
    </>
  )
}
