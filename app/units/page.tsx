import type { Metadata } from "next"
import Link from "next/link"
import { MapPin, Users } from "lucide-react"
import { PageHero } from "@/components/public/page-hero"
import { SectionShell } from "@/components/public/section-shell"
import { getSiteContentSettingsFromCms, getUnitsFromCms } from "@/lib/cms"
import { normalizePublicText } from "@/lib/public-text"

export const metadata: Metadata = {
  title: "Scout Units",
  description: "Directory of Kibaha Scouts packs, troops, and rover crews by ward and meeting day.",
}

type SearchParams = {
  ward?: string
  day?: string
}

export default async function UnitsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const [scoutUnits, siteContent] = await Promise.all([getUnitsFromCms(), getSiteContentSettingsFromCms()])
  const publishedUnits = scoutUnits.filter((unit) => unit.published !== false)
  const pageContent = siteContent.unitsPage
  const wardFilter = params.ward
  const dayFilter = params.day

  const wards = Array.from(new Set(publishedUnits.map((unit) => unit.ward))).sort()
  const meetingDays = Array.from(new Set(publishedUnits.map((unit) => unit.meetingDay))).sort()

  const filtered = publishedUnits.filter((unit) => {
    if (wardFilter && unit.ward !== wardFilter) return false
    if (dayFilter && unit.meetingDay !== dayFilter) return false
    return true
  })

  return (
    <>
      <PageHero
        title={normalizePublicText(pageContent.title, "Scout Units Directory")}
        subtitle={normalizePublicText(
          pageContent.description,
          "Find active packs, troops, and crews across Kibaha District by ward and meeting day.",
        )}
        breadcrumbs={[{ label: "Scout Units" }]}
      />

      <SectionShell eyebrow="Filter" title="Find a Unit" tone="background">
        <div id="find" className="grid gap-4 md:grid-cols-2">
          <div className="card-shell p-4">
            <p className="text-sm font-semibold text-foreground">Filter by Ward</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link
                href={dayFilter ? `/units?day=${encodeURIComponent(dayFilter)}` : "/units"}
                className={`inline-flex min-h-10 items-center rounded-full px-3 py-1 text-xs font-semibold ${
                  !wardFilter ? "bg-tsa-green-deep text-white" : "bg-secondary text-foreground"
                }`}
              >
                All wards
              </Link>
              {wards.map((ward) => (
                <Link
                  key={ward}
                  href={`/units?ward=${encodeURIComponent(ward)}${dayFilter ? `&day=${encodeURIComponent(dayFilter)}` : ""}`}
                  className={`inline-flex min-h-10 items-center rounded-full px-3 py-1 text-xs font-semibold ${
                    wardFilter === ward ? "bg-tsa-green-deep text-white" : "bg-secondary text-foreground"
                  }`}
                >
                  {ward}
                </Link>
              ))}
            </div>
          </div>

          <div className="card-shell p-4">
            <p className="text-sm font-semibold text-foreground">Filter by Meeting Day</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link
                href={wardFilter ? `/units?ward=${encodeURIComponent(wardFilter)}` : "/units"}
                className={`inline-flex min-h-10 items-center rounded-full px-3 py-1 text-xs font-semibold ${
                  !dayFilter ? "bg-tsa-gold text-white" : "bg-secondary text-foreground"
                }`}
              >
                All days
              </Link>
              {meetingDays.map((day) => (
                <Link
                  key={day}
                  href={`/units?day=${encodeURIComponent(day)}${wardFilter ? `&ward=${encodeURIComponent(wardFilter)}` : ""}`}
                  className={`inline-flex min-h-10 items-center rounded-full px-3 py-1 text-xs font-semibold ${
                    dayFilter === day ? "bg-tsa-gold text-white" : "bg-secondary text-foreground"
                  }`}
                >
                  {day}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </SectionShell>

      {filtered.length > 0 ? (
        <SectionShell eyebrow="Directory" title="Published Units" tone="white">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((unit) => (
              <article key={unit.id} className="card-shell p-5">
                <h2 className="text-lg font-semibold text-foreground">{unit.name}</h2>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-tsa-green-deep">{unit.section}</p>
                <p className="mt-3 text-base text-muted-foreground">{unit.meetingLocation}</p>
                <div className="mt-3 flex flex-wrap gap-3 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-4 w-4 text-tsa-green-deep" />
                    {unit.ward}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Users className="h-4 w-4 text-tsa-green-deep" />
                    {unit.memberCount} members
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Meetings: {unit.meetingDay}, {unit.meetingTime}
                </p>
                <Link href={`/units/${unit.slug}`} className="btn-secondary mt-4 w-full">
                  View Unit Profile
                </Link>
              </article>
            ))}
          </div>
        </SectionShell>
      ) : null}

      <SectionShell
        id="start"
        eyebrow="Expand Scouting"
        title={normalizePublicText(pageContent.startSectionTitle, "Start a New Unit")}
        subtitle={normalizePublicText(pageContent.startSectionDescription)}
        tone="background"
      >
        <div className="card-shell max-w-4xl p-6">
          <Link href="/contact" className="btn-primary">
            {normalizePublicText(pageContent.startSectionButtonLabel, "Request New Unit Pack")}
          </Link>
        </div>
      </SectionShell>
    </>
  )
}
