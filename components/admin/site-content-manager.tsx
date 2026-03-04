
"use client"

import { FormEvent, useEffect, useMemo, useState } from "react"
import { adminFetch } from "@/lib/auth/admin-fetch"
import { Button } from "@/components/ui/button"
import type { SiteContentSettings } from "@/lib/types"

type ApiResponse<T> = {
  ok: boolean
  data?: T
  error?: string
}

type SiteContentPayload = Omit<SiteContentSettings, "updatedAt" | "updatedBy">

type SiteContentForm = {
  aboutHeroTitle: string
  aboutHeroDescription: string
  aboutOverviewTitle: string
  aboutOverviewDescription: string
  aboutOverviewStatsJson: string
  aboutMissionTitle: string
  aboutMissionDescription: string
  aboutVisionTitle: string
  aboutVisionDescription: string
  aboutValuesTitle: string
  aboutValuesItems: string
  aboutLeadershipIntro: string
  aboutHistoryIntro: string
  aboutPartnersIntro: string
  aboutPartnerItems: string
  aboutFaqsTitle: string
  aboutFaqsIntro: string
  programmesPageTitle: string
  programmesPageDescription: string
  programmesListJson: string
  unitsTitle: string
  unitsDescription: string
  unitsStartSectionTitle: string
  unitsStartSectionDescription: string
  unitsStartSectionButtonLabel: string
  unitsContactTitle: string
  unitsContactDescription: string
  unitsContactButtonLabel: string
  unitsContactPlaceholder: string
  safetyTitle: string
  safetyDescription: string
  safetyReportConcernButton: string
  safetyPolicyTitle: string
  safetyPolicyDescription: string
  safetyScreeningTitle: string
  safetyScreeningDescription: string
  safetyReportTitle: string
  safetyReportDescription: string
  safetyHotlineText: string
  safetyConfidentialEmailText: string
  safetyReportHint: string
  safetyReportFormButton: string
  safetyCodeTitle: string
  safetyCodeItems: string
  safetyPrivacyTitle: string
  safetyPrivacyDescription: string
  safetyTermsTitle: string
  safetyTermsDescription: string
  joinTitle: string
  joinDescription: string
  joinYouthTitle: string
  joinYouthSteps: string
  joinYouthNote: string
  joinVolunteerTitle: string
  joinVolunteerIntro: string
  joinVolunteerSteps: string
  joinDonateTitle: string
  joinDonateItems: string
  joinDonateNote: string
  contactTitle: string
  contactDescription: string
  contactOfficeTitle: string
  contactSocialTitle: string
  contactFormTitle: string
  contactFormDescription: string
  contactMapTitle: string
  contactMapEmbedUrl: string
  newsroomTitle: string
  newsroomDescription: string
  newsroomPressTitle: string
  newsroomPressDescription: string
  eventsTitle: string
  eventsDescription: string
  resourcesTitle: string
  resourcesDescription: string
  aboutFaqsJson: string
  aboutTimelineJson: string
}

const jsonIndent = 2

const emptyForm: SiteContentForm = {
  aboutHeroTitle: "",
  aboutHeroDescription: "",
  aboutOverviewTitle: "",
  aboutOverviewDescription: "",
  aboutOverviewStatsJson: "[]",
  aboutMissionTitle: "",
  aboutMissionDescription: "",
  aboutVisionTitle: "",
  aboutVisionDescription: "",
  aboutValuesTitle: "",
  aboutValuesItems: "",
  aboutLeadershipIntro: "",
  aboutHistoryIntro: "",
  aboutPartnersIntro: "",
  aboutPartnerItems: "",
  aboutFaqsTitle: "",
  aboutFaqsIntro: "",
  programmesPageTitle: "",
  programmesPageDescription: "",
  programmesListJson: "[]",
  unitsTitle: "",
  unitsDescription: "",
  unitsStartSectionTitle: "",
  unitsStartSectionDescription: "",
  unitsStartSectionButtonLabel: "",
  unitsContactTitle: "",
  unitsContactDescription: "",
  unitsContactButtonLabel: "",
  unitsContactPlaceholder: "",
  safetyTitle: "",
  safetyDescription: "",
  safetyReportConcernButton: "",
  safetyPolicyTitle: "",
  safetyPolicyDescription: "",
  safetyScreeningTitle: "",
  safetyScreeningDescription: "",
  safetyReportTitle: "",
  safetyReportDescription: "",
  safetyHotlineText: "",
  safetyConfidentialEmailText: "",
  safetyReportHint: "",
  safetyReportFormButton: "",
  safetyCodeTitle: "",
  safetyCodeItems: "",
  safetyPrivacyTitle: "",
  safetyPrivacyDescription: "",
  safetyTermsTitle: "",
  safetyTermsDescription: "",
  joinTitle: "",
  joinDescription: "",
  joinYouthTitle: "",
  joinYouthSteps: "",
  joinYouthNote: "",
  joinVolunteerTitle: "",
  joinVolunteerIntro: "",
  joinVolunteerSteps: "",
  joinDonateTitle: "",
  joinDonateItems: "",
  joinDonateNote: "",
  contactTitle: "",
  contactDescription: "",
  contactOfficeTitle: "",
  contactSocialTitle: "",
  contactFormTitle: "",
  contactFormDescription: "",
  contactMapTitle: "",
  contactMapEmbedUrl: "",
  newsroomTitle: "",
  newsroomDescription: "",
  newsroomPressTitle: "",
  newsroomPressDescription: "",
  eventsTitle: "",
  eventsDescription: "",
  resourcesTitle: "",
  resourcesDescription: "",
  aboutFaqsJson: "[]",
  aboutTimelineJson: "[]",
}

function joinLines(items: string[]) {
  return items.join("\n")
}

function splitLines(value: string) {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
}

function parseJsonArray<T>(fieldLabel: string, value: string): T[] {
  let parsed: unknown
  try {
    parsed = JSON.parse(value)
  } catch {
    throw new Error(`${fieldLabel} must be valid JSON.`)
  }

  if (!Array.isArray(parsed)) {
    throw new Error(`${fieldLabel} must be a JSON array.`)
  }

  return parsed as T[]
}

function toForm(settings: SiteContentSettings): SiteContentForm {
  return {
    aboutHeroTitle: settings.about.heroTitle,
    aboutHeroDescription: settings.about.heroDescription,
    aboutOverviewTitle: settings.about.overviewTitle,
    aboutOverviewDescription: settings.about.overviewDescription,
    aboutOverviewStatsJson: JSON.stringify(settings.about.overviewStats, null, jsonIndent),
    aboutMissionTitle: settings.about.missionTitle,
    aboutMissionDescription: settings.about.missionDescription,
    aboutVisionTitle: settings.about.visionTitle,
    aboutVisionDescription: settings.about.visionDescription,
    aboutValuesTitle: settings.about.valuesTitle,
    aboutValuesItems: joinLines(settings.about.valuesItems),
    aboutLeadershipIntro: settings.about.leadershipIntro,
    aboutHistoryIntro: settings.about.historyIntro,
    aboutPartnersIntro: settings.about.partnersIntro,
    aboutPartnerItems: joinLines(settings.about.partnerItems),
    aboutFaqsTitle: settings.about.faqsTitle,
    aboutFaqsIntro: settings.about.faqsIntro,
    programmesPageTitle: settings.programmesPage.title,
    programmesPageDescription: settings.programmesPage.description,
    programmesListJson: JSON.stringify(settings.programmesList, null, jsonIndent),
    unitsTitle: settings.unitsPage.title,
    unitsDescription: settings.unitsPage.description,
    unitsStartSectionTitle: settings.unitsPage.startSectionTitle,
    unitsStartSectionDescription: settings.unitsPage.startSectionDescription,
    unitsStartSectionButtonLabel: settings.unitsPage.startSectionButtonLabel,
    unitsContactTitle: settings.unitsPage.unitContactTitle,
    unitsContactDescription: settings.unitsPage.unitContactDescription,
    unitsContactButtonLabel: settings.unitsPage.unitContactButtonLabel,
    unitsContactPlaceholder: settings.unitsPage.unitContactMessagePlaceholder,
    safetyTitle: settings.safetyPage.title,
    safetyDescription: settings.safetyPage.description,
    safetyReportConcernButton: settings.safetyPage.reportConcernButtonLabel,
    safetyPolicyTitle: settings.safetyPage.policyTitle,
    safetyPolicyDescription: settings.safetyPage.policyDescription,
    safetyScreeningTitle: settings.safetyPage.screeningTitle,
    safetyScreeningDescription: settings.safetyPage.screeningDescription,
    safetyReportTitle: settings.safetyPage.reportSectionTitle,
    safetyReportDescription: settings.safetyPage.reportSectionDescription,
    safetyHotlineText: settings.safetyPage.hotlineText,
    safetyConfidentialEmailText: settings.safetyPage.confidentialEmailText,
    safetyReportHint: settings.safetyPage.reportHint,
    safetyReportFormButton: settings.safetyPage.reportFormButtonLabel,
    safetyCodeTitle: settings.safetyPage.codeTitle,
    safetyCodeItems: joinLines(settings.safetyPage.codeItems),
    safetyPrivacyTitle: settings.safetyPage.privacyTitle,
    safetyPrivacyDescription: settings.safetyPage.privacyDescription,
    safetyTermsTitle: settings.safetyPage.termsTitle,
    safetyTermsDescription: settings.safetyPage.termsDescription,
    joinTitle: settings.joinPage.title,
    joinDescription: settings.joinPage.description,
    joinYouthTitle: settings.joinPage.youthTitle,
    joinYouthSteps: joinLines(settings.joinPage.youthSteps),
    joinYouthNote: settings.joinPage.youthNote,
    joinVolunteerTitle: settings.joinPage.volunteerTitle,
    joinVolunteerIntro: settings.joinPage.volunteerIntro,
    joinVolunteerSteps: joinLines(settings.joinPage.volunteerSteps),
    joinDonateTitle: settings.joinPage.donateTitle,
    joinDonateItems: joinLines(settings.joinPage.donateItems),
    joinDonateNote: settings.joinPage.donateNote,
    contactTitle: settings.contactPage.title,
    contactDescription: settings.contactPage.description,
    contactOfficeTitle: settings.contactPage.officeTitle,
    contactSocialTitle: settings.contactPage.socialTitle,
    contactFormTitle: settings.contactPage.formTitle,
    contactFormDescription: settings.contactPage.formDescription,
    contactMapTitle: settings.contactPage.mapTitle,
    contactMapEmbedUrl: settings.contactPage.mapEmbedUrl,
    newsroomTitle: settings.newsroomPage.title,
    newsroomDescription: settings.newsroomPage.description,
    newsroomPressTitle: settings.newsroomPage.pressTitle,
    newsroomPressDescription: settings.newsroomPage.pressDescription,
    eventsTitle: settings.eventsPage.title,
    eventsDescription: settings.eventsPage.description,
    resourcesTitle: settings.resourcesPage.title,
    resourcesDescription: settings.resourcesPage.description,
    aboutFaqsJson: JSON.stringify(settings.aboutFaqs, null, jsonIndent),
    aboutTimelineJson: JSON.stringify(settings.aboutTimeline, null, jsonIndent),
  }
}

function toPayload(form: SiteContentForm): SiteContentPayload {
  return {
    about: {
      heroTitle: form.aboutHeroTitle,
      heroDescription: form.aboutHeroDescription,
      overviewTitle: form.aboutOverviewTitle,
      overviewDescription: form.aboutOverviewDescription,
      overviewStats: parseJsonArray("About overview stats", form.aboutOverviewStatsJson),
      missionTitle: form.aboutMissionTitle,
      missionDescription: form.aboutMissionDescription,
      visionTitle: form.aboutVisionTitle,
      visionDescription: form.aboutVisionDescription,
      valuesTitle: form.aboutValuesTitle,
      valuesItems: splitLines(form.aboutValuesItems),
      leadershipIntro: form.aboutLeadershipIntro,
      historyIntro: form.aboutHistoryIntro,
      partnersIntro: form.aboutPartnersIntro,
      partnerItems: splitLines(form.aboutPartnerItems),
      faqsTitle: form.aboutFaqsTitle,
      faqsIntro: form.aboutFaqsIntro,
    },
    programmesPage: {
      title: form.programmesPageTitle,
      description: form.programmesPageDescription,
    },
    programmesList: parseJsonArray("Programmes list", form.programmesListJson),
    unitsPage: {
      title: form.unitsTitle,
      description: form.unitsDescription,
      startSectionTitle: form.unitsStartSectionTitle,
      startSectionDescription: form.unitsStartSectionDescription,
      startSectionButtonLabel: form.unitsStartSectionButtonLabel,
      unitContactTitle: form.unitsContactTitle,
      unitContactDescription: form.unitsContactDescription,
      unitContactButtonLabel: form.unitsContactButtonLabel,
      unitContactMessagePlaceholder: form.unitsContactPlaceholder,
    },
    safetyPage: {
      title: form.safetyTitle,
      description: form.safetyDescription,
      reportConcernButtonLabel: form.safetyReportConcernButton,
      policyTitle: form.safetyPolicyTitle,
      policyDescription: form.safetyPolicyDescription,
      screeningTitle: form.safetyScreeningTitle,
      screeningDescription: form.safetyScreeningDescription,
      reportSectionTitle: form.safetyReportTitle,
      reportSectionDescription: form.safetyReportDescription,
      hotlineText: form.safetyHotlineText,
      confidentialEmailText: form.safetyConfidentialEmailText,
      reportHint: form.safetyReportHint,
      reportFormButtonLabel: form.safetyReportFormButton,
      codeTitle: form.safetyCodeTitle,
      codeItems: splitLines(form.safetyCodeItems),
      privacyTitle: form.safetyPrivacyTitle,
      privacyDescription: form.safetyPrivacyDescription,
      termsTitle: form.safetyTermsTitle,
      termsDescription: form.safetyTermsDescription,
    },
    joinPage: {
      title: form.joinTitle,
      description: form.joinDescription,
      youthTitle: form.joinYouthTitle,
      youthSteps: splitLines(form.joinYouthSteps),
      youthNote: form.joinYouthNote,
      volunteerTitle: form.joinVolunteerTitle,
      volunteerIntro: form.joinVolunteerIntro,
      volunteerSteps: splitLines(form.joinVolunteerSteps),
      donateTitle: form.joinDonateTitle,
      donateItems: splitLines(form.joinDonateItems),
      donateNote: form.joinDonateNote,
    },
    contactPage: {
      title: form.contactTitle,
      description: form.contactDescription,
      officeTitle: form.contactOfficeTitle,
      socialTitle: form.contactSocialTitle,
      formTitle: form.contactFormTitle,
      formDescription: form.contactFormDescription,
      mapTitle: form.contactMapTitle,
      mapEmbedUrl: form.contactMapEmbedUrl,
    },
    newsroomPage: {
      title: form.newsroomTitle,
      description: form.newsroomDescription,
      pressTitle: form.newsroomPressTitle,
      pressDescription: form.newsroomPressDescription,
    },
    eventsPage: {
      title: form.eventsTitle,
      description: form.eventsDescription,
    },
    resourcesPage: {
      title: form.resourcesTitle,
      description: form.resourcesDescription,
    },
    aboutFaqs: parseJsonArray("About FAQs", form.aboutFaqsJson),
    aboutTimeline: parseJsonArray("About timeline", form.aboutTimelineJson),
  }
}

type FieldProps = {
  label: string
  value: string
  onChange: (value: string) => void
  rows?: number
}

function Field({ label, value, onChange, rows = 0 }: FieldProps) {
  return (
    <label className="block text-sm">
      <span className="font-medium text-card-foreground">{label}</span>
      {rows > 0 ? (
        <textarea
          rows={rows}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      ) : (
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      )}
    </label>
  )
}

function SectionBlock({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <article className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-card-foreground">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      <div className="mt-5 grid gap-4 md:grid-cols-2">{children}</div>
    </article>
  )
}

export function SiteContentManager() {
  const [form, setForm] = useState<SiteContentForm>(emptyForm)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [updatedAt, setUpdatedAt] = useState("")
  const [updatedBy, setUpdatedBy] = useState("")

  useEffect(() => {
    void loadSettings()
  }, [])

  const counts = useMemo(() => {
    let programmes = 0
    let faqs = 0
    let timeline = 0

    try {
      programmes = parseJsonArray("Programmes list", form.programmesListJson).length
    } catch {
      programmes = 0
    }

    try {
      faqs = parseJsonArray("About FAQs", form.aboutFaqsJson).length
    } catch {
      faqs = 0
    }

    try {
      timeline = parseJsonArray("About timeline", form.aboutTimelineJson).length
    } catch {
      timeline = 0
    }

    return { programmes, faqs, timeline }
  }, [form.programmesListJson, form.aboutFaqsJson, form.aboutTimelineJson])

  async function loadSettings() {
    setIsLoading(true)
    setError(null)

    try {
      const response = await adminFetch("/api/admin/site-content", {
        method: "GET",
        cache: "no-store",
      })
      const payload = (await response.json()) as ApiResponse<SiteContentSettings>

      if (!response.ok || !payload.ok || !payload.data) {
        throw new Error(payload.error || "Unable to load site content settings.")
      }

      setForm(toForm(payload.data))
      setUpdatedAt(payload.data.updatedAt || "")
      setUpdatedBy(payload.data.updatedBy || "")
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load site content settings.")
    } finally {
      setIsLoading(false)
    }
  }

  function setValue<K extends keyof SiteContentForm>(key: K, value: string) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!window.confirm("Are you sure you want to publish these site content updates?")) {
      return
    }

    setIsSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const payloadBody = toPayload(form)

      const response = await adminFetch("/api/admin/site-content", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadBody),
      })
      const payload = (await response.json()) as ApiResponse<SiteContentSettings>

      if (!response.ok || !payload.ok || !payload.data) {
        throw new Error(payload.error || "Unable to save site content settings.")
      }

      setForm(toForm(payload.data))
      setUpdatedAt(payload.data.updatedAt || "")
      setUpdatedBy(payload.data.updatedBy || "")
      setSuccess("Site content settings updated.")
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save site content settings.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <section className="space-y-6">
      <form className="space-y-6" onSubmit={handleSave}>
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">
            This section controls the text and structured content for pages linked in the main navigation.
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Current counts: {counts.programmes} programmes, {counts.faqs} FAQs, {counts.timeline} timeline entries.
          </p>
        </div>

        <SectionBlock title="About Page" description="Hero, overview, mission, values, partners, and FAQ section headings.">
          <Field label="Hero Title" value={form.aboutHeroTitle} onChange={(value) => setValue("aboutHeroTitle", value)} />
          <Field label="Hero Description" value={form.aboutHeroDescription} onChange={(value) => setValue("aboutHeroDescription", value)} rows={3} />
          <Field label="Overview Title" value={form.aboutOverviewTitle} onChange={(value) => setValue("aboutOverviewTitle", value)} />
          <Field
            label="Overview Description"
            value={form.aboutOverviewDescription}
            onChange={(value) => setValue("aboutOverviewDescription", value)}
            rows={3}
          />
          <Field label="Mission Title" value={form.aboutMissionTitle} onChange={(value) => setValue("aboutMissionTitle", value)} />
          <Field
            label="Mission Description"
            value={form.aboutMissionDescription}
            onChange={(value) => setValue("aboutMissionDescription", value)}
            rows={3}
          />
          <Field label="Vision Title" value={form.aboutVisionTitle} onChange={(value) => setValue("aboutVisionTitle", value)} />
          <Field
            label="Vision Description"
            value={form.aboutVisionDescription}
            onChange={(value) => setValue("aboutVisionDescription", value)}
            rows={3}
          />
          <Field label="Values Title" value={form.aboutValuesTitle} onChange={(value) => setValue("aboutValuesTitle", value)} />
          <Field
            label="Values Items (one per line)"
            value={form.aboutValuesItems}
            onChange={(value) => setValue("aboutValuesItems", value)}
            rows={5}
          />
          <Field
            label="Leadership Intro"
            value={form.aboutLeadershipIntro}
            onChange={(value) => setValue("aboutLeadershipIntro", value)}
            rows={3}
          />
          <Field label="History Intro" value={form.aboutHistoryIntro} onChange={(value) => setValue("aboutHistoryIntro", value)} rows={3} />
          <Field label="Partners Intro" value={form.aboutPartnersIntro} onChange={(value) => setValue("aboutPartnersIntro", value)} rows={3} />
          <Field
            label="Partner Items (one per line)"
            value={form.aboutPartnerItems}
            onChange={(value) => setValue("aboutPartnerItems", value)}
            rows={6}
          />
          <Field label="FAQs Title" value={form.aboutFaqsTitle} onChange={(value) => setValue("aboutFaqsTitle", value)} />
          <Field label="FAQs Intro" value={form.aboutFaqsIntro} onChange={(value) => setValue("aboutFaqsIntro", value)} rows={3} />
          <Field
            label='Overview Stats JSON (array of {"label": "...", "value": "..."})'
            value={form.aboutOverviewStatsJson}
            onChange={(value) => setValue("aboutOverviewStatsJson", value)}
            rows={9}
          />
          <Field
            label='About FAQs JSON (array of {"question": "...", "answer": "..."})'
            value={form.aboutFaqsJson}
            onChange={(value) => setValue("aboutFaqsJson", value)}
            rows={10}
          />
          <Field
            label='About Timeline JSON (array of {"year": "...", "title": "...", "description": "..."})'
            value={form.aboutTimelineJson}
            onChange={(value) => setValue("aboutTimelineJson", value)}
            rows={10}
          />
        </SectionBlock>

        <SectionBlock title="Programmes" description="Programmes page header and the full programmes catalogue.">
          <Field label="Page Title" value={form.programmesPageTitle} onChange={(value) => setValue("programmesPageTitle", value)} />
          <Field
            label="Page Description"
            value={form.programmesPageDescription}
            onChange={(value) => setValue("programmesPageDescription", value)}
            rows={3}
          />
          <Field
            label='Programmes JSON (array of Programme objects including slug, title, ageRange, description, objectives, activities, badges, progression, uniformGuidance, image)'
            value={form.programmesListJson}
            onChange={(value) => setValue("programmesListJson", value)}
            rows={16}
          />
        </SectionBlock>

        <SectionBlock title="Scout Units Page" description="Header text and unit inquiry block copy.">
          <Field label="Page Title" value={form.unitsTitle} onChange={(value) => setValue("unitsTitle", value)} />
          <Field label="Page Description" value={form.unitsDescription} onChange={(value) => setValue("unitsDescription", value)} rows={3} />
          <Field
            label="Start Section Title"
            value={form.unitsStartSectionTitle}
            onChange={(value) => setValue("unitsStartSectionTitle", value)}
          />
          <Field
            label="Start Section Description"
            value={form.unitsStartSectionDescription}
            onChange={(value) => setValue("unitsStartSectionDescription", value)}
            rows={3}
          />
          <Field
            label="Start Section Button Label"
            value={form.unitsStartSectionButtonLabel}
            onChange={(value) => setValue("unitsStartSectionButtonLabel", value)}
          />
          <Field label="Unit Contact Title" value={form.unitsContactTitle} onChange={(value) => setValue("unitsContactTitle", value)} />
          <Field
            label="Unit Contact Description"
            value={form.unitsContactDescription}
            onChange={(value) => setValue("unitsContactDescription", value)}
            rows={3}
          />
          <Field
            label="Unit Contact Button Label"
            value={form.unitsContactButtonLabel}
            onChange={(value) => setValue("unitsContactButtonLabel", value)}
          />
          <Field
            label="Unit Contact Message Placeholder"
            value={form.unitsContactPlaceholder}
            onChange={(value) => setValue("unitsContactPlaceholder", value)}
          />
        </SectionBlock>

        <SectionBlock title="Safety Page" description="All copy blocks for safety and youth protection.">
          <Field label="Page Title" value={form.safetyTitle} onChange={(value) => setValue("safetyTitle", value)} />
          <Field label="Page Description" value={form.safetyDescription} onChange={(value) => setValue("safetyDescription", value)} rows={3} />
          <Field
            label="Report Concern Button Label"
            value={form.safetyReportConcernButton}
            onChange={(value) => setValue("safetyReportConcernButton", value)}
          />
          <Field label="Policy Title" value={form.safetyPolicyTitle} onChange={(value) => setValue("safetyPolicyTitle", value)} />
          <Field
            label="Policy Description"
            value={form.safetyPolicyDescription}
            onChange={(value) => setValue("safetyPolicyDescription", value)}
            rows={3}
          />
          <Field
            label="Screening Title"
            value={form.safetyScreeningTitle}
            onChange={(value) => setValue("safetyScreeningTitle", value)}
          />
          <Field
            label="Screening Description"
            value={form.safetyScreeningDescription}
            onChange={(value) => setValue("safetyScreeningDescription", value)}
            rows={3}
          />
          <Field label="Report Section Title" value={form.safetyReportTitle} onChange={(value) => setValue("safetyReportTitle", value)} />
          <Field
            label="Report Section Description"
            value={form.safetyReportDescription}
            onChange={(value) => setValue("safetyReportDescription", value)}
            rows={3}
          />
          <Field label="Hotline Text" value={form.safetyHotlineText} onChange={(value) => setValue("safetyHotlineText", value)} />
          <Field
            label="Confidential Email Text"
            value={form.safetyConfidentialEmailText}
            onChange={(value) => setValue("safetyConfidentialEmailText", value)}
          />
          <Field label="Report Hint" value={form.safetyReportHint} onChange={(value) => setValue("safetyReportHint", value)} rows={3} />
          <Field
            label="Report Form Button Label"
            value={form.safetyReportFormButton}
            onChange={(value) => setValue("safetyReportFormButton", value)}
          />
          <Field label="Code Title" value={form.safetyCodeTitle} onChange={(value) => setValue("safetyCodeTitle", value)} />
          <Field
            label="Code Items (one per line)"
            value={form.safetyCodeItems}
            onChange={(value) => setValue("safetyCodeItems", value)}
            rows={5}
          />
          <Field label="Privacy Title" value={form.safetyPrivacyTitle} onChange={(value) => setValue("safetyPrivacyTitle", value)} />
          <Field
            label="Privacy Description"
            value={form.safetyPrivacyDescription}
            onChange={(value) => setValue("safetyPrivacyDescription", value)}
            rows={3}
          />
          <Field label="Terms Title" value={form.safetyTermsTitle} onChange={(value) => setValue("safetyTermsTitle", value)} />
          <Field
            label="Terms Description"
            value={form.safetyTermsDescription}
            onChange={(value) => setValue("safetyTermsDescription", value)}
            rows={3}
          />
        </SectionBlock>

        <SectionBlock title="Join / Volunteer Page" description="All join, volunteer, and donation section copy.">
          <Field label="Page Title" value={form.joinTitle} onChange={(value) => setValue("joinTitle", value)} />
          <Field label="Page Description" value={form.joinDescription} onChange={(value) => setValue("joinDescription", value)} rows={3} />
          <Field label="Youth Section Title" value={form.joinYouthTitle} onChange={(value) => setValue("joinYouthTitle", value)} />
          <Field label="Youth Steps (one per line)" value={form.joinYouthSteps} onChange={(value) => setValue("joinYouthSteps", value)} rows={5} />
          <Field label="Youth Note" value={form.joinYouthNote} onChange={(value) => setValue("joinYouthNote", value)} rows={3} />
          <Field
            label="Volunteer Section Title"
            value={form.joinVolunteerTitle}
            onChange={(value) => setValue("joinVolunteerTitle", value)}
          />
          <Field
            label="Volunteer Intro"
            value={form.joinVolunteerIntro}
            onChange={(value) => setValue("joinVolunteerIntro", value)}
            rows={3}
          />
          <Field
            label="Volunteer Steps (one per line)"
            value={form.joinVolunteerSteps}
            onChange={(value) => setValue("joinVolunteerSteps", value)}
            rows={5}
          />
          <Field label="Donate Section Title" value={form.joinDonateTitle} onChange={(value) => setValue("joinDonateTitle", value)} />
          <Field label="Donate Items (one per line)" value={form.joinDonateItems} onChange={(value) => setValue("joinDonateItems", value)} rows={5} />
          <Field label="Donate Note" value={form.joinDonateNote} onChange={(value) => setValue("joinDonateNote", value)} rows={3} />
        </SectionBlock>

        <SectionBlock title="Contact Page" description="Page hero, section headings, and map URL.">
          <Field label="Page Title" value={form.contactTitle} onChange={(value) => setValue("contactTitle", value)} />
          <Field
            label="Page Description"
            value={form.contactDescription}
            onChange={(value) => setValue("contactDescription", value)}
            rows={3}
          />
          <Field label="Office Section Title" value={form.contactOfficeTitle} onChange={(value) => setValue("contactOfficeTitle", value)} />
          <Field label="Social Section Title" value={form.contactSocialTitle} onChange={(value) => setValue("contactSocialTitle", value)} />
          <Field label="Form Section Title" value={form.contactFormTitle} onChange={(value) => setValue("contactFormTitle", value)} />
          <Field
            label="Form Section Description"
            value={form.contactFormDescription}
            onChange={(value) => setValue("contactFormDescription", value)}
            rows={3}
          />
          <Field label="Map Section Title" value={form.contactMapTitle} onChange={(value) => setValue("contactMapTitle", value)} />
          <Field label="Map Embed URL" value={form.contactMapEmbedUrl} onChange={(value) => setValue("contactMapEmbedUrl", value)} rows={3} />
        </SectionBlock>

        <SectionBlock title="Newsroom / Events / Resources" description="Top headings and intro copy for listing pages.">
          <Field label="Newsroom Title" value={form.newsroomTitle} onChange={(value) => setValue("newsroomTitle", value)} />
          <Field
            label="Newsroom Description"
            value={form.newsroomDescription}
            onChange={(value) => setValue("newsroomDescription", value)}
            rows={3}
          />
          <Field
            label="Newsroom Press Title"
            value={form.newsroomPressTitle}
            onChange={(value) => setValue("newsroomPressTitle", value)}
          />
          <Field
            label="Newsroom Press Description"
            value={form.newsroomPressDescription}
            onChange={(value) => setValue("newsroomPressDescription", value)}
            rows={3}
          />
          <Field label="Events Title" value={form.eventsTitle} onChange={(value) => setValue("eventsTitle", value)} />
          <Field label="Events Description" value={form.eventsDescription} onChange={(value) => setValue("eventsDescription", value)} rows={3} />
          <Field label="Resources Title" value={form.resourcesTitle} onChange={(value) => setValue("resourcesTitle", value)} />
          <Field
            label="Resources Description"
            value={form.resourcesDescription}
            onChange={(value) => setValue("resourcesDescription", value)}
            rows={3}
          />
        </SectionBlock>

        <div className="flex flex-wrap items-center gap-2">
          <Button type="submit" disabled={isLoading || isSaving}>
            {isSaving ? "Saving..." : "Save Site Content"}
          </Button>
          <Button type="button" variant="outline" disabled={isLoading || isSaving} onClick={() => void loadSettings()}>
            {isLoading ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
      </form>

      {error ? <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p> : null}
      {success ? <p className="rounded-md border border-emerald-300/40 bg-emerald-100/30 px-3 py-2 text-sm text-emerald-700">{success}</p> : null}

      {updatedAt ? (
        <p className="text-xs text-muted-foreground">
          Last updated {new Date(updatedAt).toLocaleString("en-GB")}
          {updatedBy ? ` by ${updatedBy}` : ""}.
        </p>
      ) : null}
    </section>
  )
}
