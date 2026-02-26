import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Mail, MapPin, Users } from "lucide-react"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { getUnitsFromCms } from "@/lib/cms"

export async function generateStaticParams() {
  const scoutUnits = await getUnitsFromCms()
  return scoutUnits.map((unit) => ({ slug: unit.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const scoutUnits = await getUnitsFromCms()
  const unit = scoutUnits.find((item) => item.slug === slug)
  if (!unit) return { title: "Unit Not Found" }
  return {
    title: unit.name,
    description: `Unit profile for ${unit.name} in ${unit.ward}, Kibaha District.`,
  }
}

function mapEmbedUrl(location: string) {
  return `https://maps.google.com/maps?q=${encodeURIComponent(location)}&t=&z=13&ie=UTF8&iwloc=&output=embed`
}

export default async function UnitProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const scoutUnits = await getUnitsFromCms()
  const unit = scoutUnits.find((item) => item.slug === slug)
  if (!unit) notFound()

  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Scout Units", href: "/units" },
          { label: unit.name },
        ]}
      />

      <section className="bg-background py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4">
          <h1 className="text-balance text-3xl font-bold text-foreground md:text-4xl">{unit.name}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {unit.section} - {unit.type} - Established {unit.established}
          </p>

          <div className="mt-6 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <article className="space-y-4">
              <div className="rounded-lg border border-border bg-card p-5">
                <h2 className="text-xl font-bold text-card-foreground">Unit Information</h2>
                <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                  <p className="inline-flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-tsa-green-deep" />
                    {unit.meetingLocation}
                  </p>
                  <p>
                    <span className="font-semibold text-foreground">Ward:</span> {unit.ward}
                  </p>
                  <p>
                    <span className="font-semibold text-foreground">Meeting Schedule:</span> {unit.meetingDay}, {unit.meetingTime}
                  </p>
                  <p className="inline-flex items-center gap-2">
                    <Users className="h-4 w-4 text-tsa-green-deep" />
                    {unit.memberCount} active members
                  </p>
                  <p className="inline-flex items-center gap-2">
                    <Mail className="h-4 w-4 text-tsa-green-deep" />
                    {unit.contactEmail}
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-card p-5">
                <h2 className="text-xl font-bold text-card-foreground">Unit Leadership</h2>
                <ul className="mt-3 space-y-2">
                  {unit.leaders.map((leader) => (
                    <li key={leader.name} className="rounded-md bg-secondary px-3 py-2 text-sm text-secondary-foreground">
                      <span className="font-semibold">{leader.name}</span> - {leader.role}
                    </li>
                  ))}
                </ul>
              </div>
            </article>

            <aside className="space-y-4">
              <div className="overflow-hidden rounded-lg border border-border">
                <iframe
                  src={mapEmbedUrl(unit.meetingLocation)}
                  title={`${unit.name} map`}
                  className="h-[260px] w-full"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>

              <div className="rounded-lg border border-border bg-card p-5">
                <h2 className="text-lg font-bold text-card-foreground">Contact This Unit</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Submit your interest and a district officer will connect you with the unit leadership team.
                </p>
                <form className="mt-4 space-y-3">
                  <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground" htmlFor="unit-name">
                    Full Name
                  </label>
                  <input
                    id="unit-name"
                    name="name"
                    type="text"
                    required
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                  <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground" htmlFor="unit-email">
                    Email
                  </label>
                  <input
                    id="unit-email"
                    name="email"
                    type="email"
                    required
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                  <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground" htmlFor="unit-message">
                    Message
                  </label>
                  <textarea
                    id="unit-message"
                    name="message"
                    rows={4}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="I would like to join this unit..."
                  />
                  <button
                    type="submit"
                    className="w-full rounded-md bg-tsa-green-deep px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-tsa-green-mid"
                  >
                    Send Inquiry
                  </button>
                </form>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  )
}
