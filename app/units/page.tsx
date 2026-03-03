import type { Metadata } from "next"
import Link from "next/link"
import { MapPin, Users } from "lucide-react"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { getUnitsFromCms } from "@/lib/cms"

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
  const scoutUnits = await getUnitsFromCms()
  const wardFilter = params.ward
  const dayFilter = params.day

  const wards = Array.from(new Set(scoutUnits.map((unit) => unit.ward))).sort()
  const meetingDays = Array.from(new Set(scoutUnits.map((unit) => unit.meetingDay))).sort()

  const filtered = scoutUnits.filter((unit) => {
    if (wardFilter && unit.ward !== wardFilter) return false
    if (dayFilter && unit.meetingDay !== dayFilter) return false
    return true
  })

  return (
    <>
      <Breadcrumbs items={[{ label: "Scout Units" }]} />

      <section className="bg-background py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4">
          <h1 className="text-3xl font-bold text-foreground md:text-4xl">Scout Units Directory</h1>
          <p className="mt-3 max-w-3xl text-base leading-relaxed text-muted-foreground">
            Find active packs, troops, and crews across Kibaha District. Filter by ward or meeting day.
          </p>

          <div id="find" className="mt-6 grid gap-3 md:grid-cols-2">
            <div>
              <p className="mb-2 text-sm font-semibold text-foreground">Filter by Ward</p>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={dayFilter ? `/units?day=${encodeURIComponent(dayFilter)}` : "/units"}
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    !wardFilter ? "bg-tsa-green-deep text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-border"
                  }`}
                >
                  All wards
                </Link>
                {wards.map((ward) => (
                  <Link
                    key={ward}
                    href={`/units?ward=${encodeURIComponent(ward)}${dayFilter ? `&day=${encodeURIComponent(dayFilter)}` : ""}`}
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      wardFilter === ward
                        ? "bg-tsa-green-deep text-primary-foreground"
                        : "bg-secondary text-secondary-foreground hover:bg-border"
                    }`}
                  >
                    {ward}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-semibold text-foreground">Filter by Meeting Day</p>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={wardFilter ? `/units?ward=${encodeURIComponent(wardFilter)}` : "/units"}
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    !dayFilter ? "bg-tsa-gold text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-border"
                  }`}
                >
                  All days
                </Link>
                {meetingDays.map((day) => (
                  <Link
                    key={day}
                    href={`/units?day=${encodeURIComponent(day)}${wardFilter ? `&ward=${encodeURIComponent(wardFilter)}` : ""}`}
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      dayFilter === day
                        ? "bg-tsa-gold text-primary-foreground"
                        : "bg-secondary text-secondary-foreground hover:bg-border"
                    }`}
                  >
                    {day}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-secondary py-12">
        <div className="mx-auto max-w-7xl px-4">
          {filtered.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((unit) => (
                <article key={unit.id} className="rounded-lg border border-border bg-card p-5">
                  <h2 className="text-base font-bold text-card-foreground">{unit.name}</h2>
                  <p className="mt-1 text-xs font-medium uppercase tracking-wide text-tsa-green-deep">{unit.section}</p>
                  <p className="mt-3 text-sm text-muted-foreground">{unit.meetingLocation}</p>
                  <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {unit.ward}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {unit.memberCount} members
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Meetings: {unit.meetingDay}, {unit.meetingTime}
                  </p>
                  <Link
                    href={`/units/${unit.slug}`}
                    className="mt-4 inline-flex rounded-md bg-tsa-green-deep px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-tsa-green-mid"
                  >
                    View Unit Profile
                  </Link>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-border bg-card p-5">
              <h2 className="text-base font-semibold text-card-foreground">Unit directory updates are coming soon</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Published scout units will appear here automatically once they are available.
              </p>
            </div>
          )}
        </div>
      </section>

      <section id="start" className="bg-background py-12">
        <div className="mx-auto max-w-4xl px-4">
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-2xl font-bold text-foreground">Start a New Unit</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Interested in opening a new pack, troop, or crew in your ward? Contact the district programme office to
              review leader availability, meeting venue options, and start-up requirements.
            </p>
            <Link
              href="/contact"
              className="mt-4 inline-flex rounded-md bg-tsa-gold px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-tsa-green-mid"
            >
              Request New Unit Pack
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
