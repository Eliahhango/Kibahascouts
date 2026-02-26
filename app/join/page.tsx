import type { Metadata } from "next"
import { CheckCircle2, HandHeart, Users } from "lucide-react"
import { Breadcrumbs } from "@/components/breadcrumbs"

export const metadata: Metadata = {
  title: "Join / Volunteer",
  description: "Membership, volunteering, and support pathways for Kibaha Scouts.",
}

export default function JoinPage() {
  return (
    <>
      <Breadcrumbs items={[{ label: "Join / Volunteer" }]} />

      <section className="bg-background py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4">
          <h1 className="text-3xl font-bold text-foreground md:text-4xl">Join / Volunteer</h1>
          <p className="mt-3 max-w-3xl text-base leading-relaxed text-muted-foreground">
            Use this page to follow verified joining and volunteering steps. Placeholder fields should be replaced by
            official district process details.
          </p>
        </div>
      </section>

      <section id="youth" className="bg-secondary py-12">
        <div className="mx-auto max-w-7xl px-4">
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-tsa-green-deep/10">
              <Users className="h-5 w-5 text-tsa-green-deep" />
            </div>
            <h2 className="mt-3 text-2xl font-bold text-card-foreground">Join as Youth</h2>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
              <li>Choose a nearby unit from the Scout Units directory.</li>
              <li>Complete membership and parental consent forms.</li>
              <li>Attend one orientation meeting and basic health/safety briefing.</li>
              <li>Confirm annual district and unit membership fees: [CONFIRM MEMBERSHIP FEES].</li>
            </ol>
            <p className="mt-3 text-xs text-muted-foreground">
              Fee waiver policy and support options: [CONFIRM DISTRICT POLICY].
            </p>
          </div>
        </div>
      </section>

      <section id="volunteer" className="bg-background py-12">
        <div className="mx-auto max-w-7xl px-4">
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-tsa-green-deep/10">
              <CheckCircle2 className="h-5 w-5 text-tsa-green-deep" />
            </div>
            <h2 className="mt-3 text-2xl font-bold text-card-foreground">Volunteer as Leader</h2>
            <p className="mt-2 text-sm text-muted-foreground">Leader pathway (placeholder):</p>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
              <li>Submit volunteer application and references.</li>
              <li>Complete screening and safeguarding checks.</li>
              <li>Attend required district leader training: [CONFIRM TRAINING NAME].</li>
              <li>Shadow an active unit leader for the required period: [CONFIRM PERIOD].</li>
              <li>Receive role assignment and annual development goals.</li>
            </ol>
          </div>
        </div>
      </section>

      <section id="donate" className="bg-secondary py-12">
        <div className="mx-auto max-w-7xl px-4">
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-tsa-green-deep/10">
              <HandHeart className="h-5 w-5 text-tsa-green-deep" />
            </div>
            <h2 className="mt-3 text-2xl font-bold text-card-foreground">Donate / Support</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[
                "Sponsor one scout (uniform + annual registration)",
                "Support a district training weekend",
                "Contribute equipment for camps and first aid",
              ].map((item) => (
                <div key={item} className="rounded-md bg-secondary p-3 text-sm text-secondary-foreground">
                  {item}
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Donation channels and accountability contacts: [CONFIRM DISTRICT DONATION PROCESS].
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
