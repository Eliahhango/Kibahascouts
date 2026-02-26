import type { Metadata } from "next"
import { CheckCircle2, HandHeart, Users } from "lucide-react"
import { Breadcrumbs } from "@/components/breadcrumbs"

export const metadata: Metadata = {
  title: "Join / Volunteer",
  description: "Join Kibaha Scouts as youth, volunteer as a leader, or support district scouting through donations.",
}

export default function JoinPage() {
  return (
    <>
      <Breadcrumbs items={[{ label: "Join / Volunteer" }]} />

      <section className="bg-background py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4">
          <h1 className="text-3xl font-bold text-foreground md:text-4xl">Join / Volunteer</h1>
          <p className="mt-3 max-w-3xl text-base leading-relaxed text-muted-foreground">
            Become part of Kibaha Scouts as a youth member, adult leader, or community supporter.
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
              <li>Pay annual district and unit membership fees (placeholder range: TZS 10,000 - 25,000).</li>
            </ol>
            <p className="mt-3 text-xs text-muted-foreground">
              Fee waivers and support options are available for eligible families.
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
              <li>Attend Basic Unit Leader Training (BULT).</li>
              <li>Shadow an active unit leader for 4-6 weeks.</li>
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
            <div className="mt-4 grid gap-3 md:grid-cols-3">
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
              Transparency note: annual audited summaries and programme impact reports are published in the Resources section.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
