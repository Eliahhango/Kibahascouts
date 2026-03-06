import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Mail, MapPin, Users } from "lucide-react"
import { PageHero } from "@/components/public/page-hero"
import { SectionShell } from "@/components/public/section-shell"
import { getSiteContentSettingsFromCms, getUnitsFromCms } from "@/lib/cms"
import { normalizePublicText } from "@/lib/public-text"

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
  const [scoutUnits, siteContent] = await Promise.all([getUnitsFromCms(), getSiteContentSettingsFromCms()])
  const unit = scoutUnits.find((item) => item.slug === slug)
  const pageContent = siteContent.unitsPage
  if (!unit) notFound()

  return (
    <>
      <PageHero
        title={unit.name}
        subtitle={`${unit.section} | ${unit.type} | Established ${unit.established}`}
        breadcrumbs={[{ label: "Scout Units", href: "/units" }, { label: unit.name }]}
      />

      <SectionShell eyebrow="Profile" title="Unit Information" tone="background">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <article className="space-y-4">
            <div className="card-shell p-5">
              <div>
                <p className="eyebrow">Meeting Details</p>
                <div className="mt-2 space-y-2 text-base text-muted-foreground">
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
                </div>
              </div>

              <div className="mt-4 border-t border-border pt-4">
                <p className="eyebrow">Contact Information</p>
                <p className="mt-2 inline-flex items-center gap-2 text-base text-muted-foreground">
                  <Mail className="h-4 w-4 text-tsa-green-deep" />
                  {unit.contactEmail}
                </p>
              </div>

              <div className="mt-4 border-t border-border pt-4">
                <p className="eyebrow">Leadership</p>
                {unit.leaders.length > 0 ? (
                  <ul className="mt-3 space-y-2">
                    {unit.leaders.map((leader) => (
                      <li key={leader.name} className="rounded-lg bg-secondary px-3 py-2 text-sm text-secondary-foreground">
                        <span className="font-semibold">{leader.name}</span> - {leader.role}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm text-muted-foreground">Leadership details will be published soon.</p>
                )}
              </div>
            </div>
          </article>

          <aside className="space-y-4">
            <div className="overflow-hidden rounded-2xl border border-border">
              <iframe
                src={mapEmbedUrl(unit.meetingLocation)}
                title={`${unit.name} map`}
                className="h-[260px] w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            <div className="card-shell p-5">
              <h2 className="text-lg font-semibold text-foreground">
                {normalizePublicText(pageContent.unitContactTitle, "Contact This Unit")}
              </h2>
              <p className="mt-2 text-base text-muted-foreground">
                {normalizePublicText(pageContent.unitContactDescription)}
              </p>
              <form className="mt-4 space-y-3">
                <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground" htmlFor="unit-name">
                  Full Name
                </label>
                <input id="unit-name" name="name" type="text" required className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
                <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground" htmlFor="unit-email">
                  Email
                </label>
                <input id="unit-email" name="email" type="email" required className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
                <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground" htmlFor="unit-message">
                  Message
                </label>
                <textarea
                  id="unit-message"
                  name="message"
                  rows={4}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                  placeholder={normalizePublicText(pageContent.unitContactMessagePlaceholder, "I would like to join this unit...")}
                />
                <button type="submit" className="btn-primary w-full">
                  {normalizePublicText(pageContent.unitContactButtonLabel, "Send Inquiry")}
                </button>
              </form>
            </div>
          </aside>
        </div>
      </SectionShell>
    </>
  )
}
