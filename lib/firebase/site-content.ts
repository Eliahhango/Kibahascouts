import "server-only"

import { z } from "zod"
import { faqs, programmes, timelineEntries } from "@/lib/data"
import { getAdminDb } from "@/lib/firebase/admin"
import type { SiteContentSettings } from "@/lib/types"

const SITE_SETTINGS_COLLECTION = "siteSettings"
const SITE_CONTENT_DOC_ID = "siteContent"

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const httpUrlPattern = /^https?:\/\/.+/i

const textLineSchema = z.string().trim().min(1).max(240)
const textParagraphSchema = z.string().trim().min(1).max(2000)

const snapshotItemSchema = z.object({
  label: z.string().trim().min(1).max(80),
  value: z.string().trim().min(1).max(80),
})

const faqItemSchema = z.object({
  question: z.string().trim().min(1).max(240),
  answer: z.string().trim().min(1).max(2000),
})

const timelineItemSchema = z.object({
  year: z.string().trim().min(1).max(80),
  title: z.string().trim().min(1).max(180),
  description: z.string().trim().min(1).max(500),
})

const programmeSchema = z.object({
  slug: z.string().trim().min(1).regex(slugPattern, "Programme slug must be lowercase and use hyphens."),
  title: z.string().trim().min(1).max(120),
  ageRange: z.string().trim().min(1).max(80),
  description: textParagraphSchema,
  objectives: z.array(textLineSchema).min(1).max(20),
  activities: z.array(textLineSchema).min(1).max(20),
  badges: z.array(textLineSchema).min(1).max(30),
  progression: z.array(textLineSchema).min(1).max(30),
  uniformGuidance: textParagraphSchema,
  image: z.string().trim().min(1).max(500),
})

const aboutPageSchema = z.object({
  heroTitle: z.string().trim().min(1).max(160),
  heroDescription: textParagraphSchema,
  overviewTitle: z.string().trim().min(1).max(120),
  overviewDescription: textParagraphSchema,
  overviewStats: z.array(snapshotItemSchema).length(4),
  missionTitle: z.string().trim().min(1).max(120),
  missionDescription: textParagraphSchema,
  visionTitle: z.string().trim().min(1).max(120),
  visionDescription: textParagraphSchema,
  valuesTitle: z.string().trim().min(1).max(120),
  valuesItems: z.array(textLineSchema).min(1).max(20),
  leadershipIntro: textParagraphSchema,
  historyIntro: textParagraphSchema,
  partnersIntro: textParagraphSchema,
  partnerItems: z.array(textLineSchema).min(1).max(30),
  faqsTitle: z.string().trim().min(1).max(120),
  faqsIntro: textParagraphSchema,
})

const programmesPageSchema = z.object({
  title: z.string().trim().min(1).max(120),
  description: textParagraphSchema,
})

const unitsPageSchema = z.object({
  title: z.string().trim().min(1).max(120),
  description: textParagraphSchema,
  startSectionTitle: z.string().trim().min(1).max(120),
  startSectionDescription: textParagraphSchema,
  startSectionButtonLabel: z.string().trim().min(1).max(80),
  unitContactTitle: z.string().trim().min(1).max(120),
  unitContactDescription: textParagraphSchema,
  unitContactButtonLabel: z.string().trim().min(1).max(80),
  unitContactMessagePlaceholder: z.string().trim().min(1).max(240),
})

const safetyPageSchema = z.object({
  title: z.string().trim().min(1).max(120),
  description: textParagraphSchema,
  reportConcernButtonLabel: z.string().trim().min(1).max(80),
  policyTitle: z.string().trim().min(1).max(120),
  policyDescription: textParagraphSchema,
  screeningTitle: z.string().trim().min(1).max(120),
  screeningDescription: textParagraphSchema,
  reportSectionTitle: z.string().trim().min(1).max(120),
  reportSectionDescription: textParagraphSchema,
  hotlineText: z.string().trim().min(1).max(200),
  confidentialEmailText: z.string().trim().min(1).max(200),
  reportHint: textParagraphSchema,
  reportFormButtonLabel: z.string().trim().min(1).max(80),
  codeTitle: z.string().trim().min(1).max(120),
  codeItems: z.array(textLineSchema).min(1).max(20),
  privacyTitle: z.string().trim().min(1).max(120),
  privacyDescription: textParagraphSchema,
  termsTitle: z.string().trim().min(1).max(120),
  termsDescription: textParagraphSchema,
})

const joinPageSchema = z.object({
  title: z.string().trim().min(1).max(120),
  description: textParagraphSchema,
  youthTitle: z.string().trim().min(1).max(120),
  youthSteps: z.array(textLineSchema).min(1).max(30),
  youthNote: textParagraphSchema,
  volunteerTitle: z.string().trim().min(1).max(120),
  volunteerIntro: textParagraphSchema,
  volunteerSteps: z.array(textLineSchema).min(1).max(30),
  donateTitle: z.string().trim().min(1).max(120),
  donateItems: z.array(textLineSchema).min(1).max(30),
  donateNote: textParagraphSchema,
})

const contactPageSchema = z.object({
  title: z.string().trim().min(1).max(120),
  description: textParagraphSchema,
  officeTitle: z.string().trim().min(1).max(120),
  socialTitle: z.string().trim().min(1).max(120),
  formTitle: z.string().trim().min(1).max(120),
  formDescription: textParagraphSchema,
  mapTitle: z.string().trim().min(1).max(120),
  mapEmbedUrl: z
    .string()
    .trim()
    .min(1)
    .max(2000)
    .refine((value) => httpUrlPattern.test(value), {
      message: "Map embed URL must be a valid http(s) URL.",
    }),
})

const newsroomPageSchema = z.object({
  title: z.string().trim().min(1).max(120),
  description: textParagraphSchema,
  pressTitle: z.string().trim().min(1).max(120),
  pressDescription: textParagraphSchema,
})

const eventsPageSchema = z.object({
  title: z.string().trim().min(1).max(120),
  description: textParagraphSchema,
})

const resourcesPageSchema = z.object({
  title: z.string().trim().min(1).max(120),
  description: textParagraphSchema,
})

export const siteContentSettingsInputSchema = z.object({
  about: aboutPageSchema,
  programmesPage: programmesPageSchema,
  programmesList: z.array(programmeSchema).min(1).max(20),
  unitsPage: unitsPageSchema,
  safetyPage: safetyPageSchema,
  joinPage: joinPageSchema,
  contactPage: contactPageSchema,
  newsroomPage: newsroomPageSchema,
  eventsPage: eventsPageSchema,
  resourcesPage: resourcesPageSchema,
  aboutFaqs: z.array(faqItemSchema).min(1).max(40),
  aboutTimeline: z.array(timelineItemSchema).min(1).max(40),
})

const siteContentSettingsDocSchema = siteContentSettingsInputSchema.extend({
  updatedAt: z.string().optional(),
  updatedBy: z.string().optional(),
})

const defaultSiteContentSettings: SiteContentSettings = {
  about: {
    heroTitle: "About KIBAHA SCOUTS",
    heroDescription:
      "Official district information, leadership contacts, and programme guidance for members, families, and partners.",
    overviewTitle: "District Overview",
    overviewDescription:
      "Kibaha Scouts supports youth development through district-level scouting programmes, safeguarding standards, and volunteer-led community service activities under the Tanzania Scouts Association framework.",
    overviewStats: [
      { value: "Coming soon", label: "Youth Members" },
      { value: "Coming soon", label: "Active Units" },
      { value: "Coming soon", label: "Adult Volunteers" },
      { value: "Coming soon", label: "Annual Service Hours" },
    ],
    missionTitle: "Our Mission",
    missionDescription:
      "To contribute to the education and development of young people in Kibaha through a value system based on the Scout Promise and Law, helping to build a better world where people are self-fulfilled as individuals and play a constructive role in society.",
    visionTitle: "Our Vision",
    visionDescription:
      "A Kibaha District where every young person has access to quality scouting, empowering them to become active citizens who create positive change in their communities and beyond.",
    valuesTitle: "Our Values",
    valuesItems: [
      "Integrity and trustworthiness",
      "Respect for self and others",
      "Service to the community",
      "Environmental stewardship",
      "Inclusivity and belonging",
    ],
    leadershipIntro:
      "Leadership records are published from district updates and will continue to expand as profiles are shared.",
    historyIntro: "Key milestones in Kibaha District scouting",
    partnersIntro: "Verified partner profiles are being added and more details will be published soon.",
    partnerItems: [
      "District government partners",
      "Education sector partners",
      "Community health partners",
      "Youth development partners",
      "Environmental partners",
      "Emergency response partners",
      "Faith and community partners",
      "Private sector supporters",
    ],
    faqsTitle: "Frequently Asked Questions",
    faqsIntro: "Answers to common questions about scouting in Kibaha",
  },
  programmesPage: {
    title: "Scout Programmes",
    description:
      "Kibaha Scouts offers three progressive sections for young people aged 7 to 25. Each programme is designed to develop skills, build character, and foster a love of adventure and service.",
  },
  programmesList: programmes.map((programme) => ({
    ...programme,
    objectives: [...programme.objectives],
    activities: [...programme.activities],
    badges: [...programme.badges],
    progression: [...programme.progression],
  })),
  unitsPage: {
    title: "Scout Units Directory",
    description: "Find active packs, troops, and crews across Kibaha District. Filter by ward or meeting day.",
    startSectionTitle: "Start a New Unit",
    startSectionDescription:
      "Interested in opening a new pack, troop, or crew in your ward? Contact the district programme office to review leader availability, meeting venue options, and start-up requirements.",
    startSectionButtonLabel: "Request New Unit Pack",
    unitContactTitle: "Contact This Unit",
    unitContactDescription:
      "Submit your interest and a district officer will connect you with the unit leadership team.",
    unitContactButtonLabel: "Send Inquiry",
    unitContactMessagePlaceholder: "I would like to join this unit...",
  },
  safetyPage: {
    title: "Safety & Youth Protection",
    description:
      "The wellbeing of children and young people is our first responsibility in every programme, activity, and district operation.",
    reportConcernButtonLabel: "Report a Concern",
    policyTitle: "Child Safeguarding Policy",
    policyDescription:
      "All units follow a safeguarding framework covering supervision ratios, risk assessments, safe conduct, digital communication boundaries, and incident escalation protocols.",
    screeningTitle: "Adult Screening & Training",
    screeningDescription:
      "New leaders complete identity verification, references, child protection induction, and required refresher training before direct responsibility for youth members.",
    reportSectionTitle: "Report Misconduct (Confidential)",
    reportSectionDescription:
      "If a child is in immediate danger, contact emergency services first. For safeguarding concerns, submit a confidential report through our contact reporting form.",
    hotlineText: "Safeguarding Hotline: Hotline details will be shared soon.",
    confidentialEmailText: "Confidential Email: Confidential email details will be shared soon.",
    reportHint:
      "Use the secure reporting form on the contact page. Include what happened, where it happened, and when it happened.",
    reportFormButtonLabel: "Go to Reporting Form",
    codeTitle: "Code of Conduct",
    codeItems: [
      "Respect youth dignity and rights at all times.",
      "Use transparent communication and accountable supervision.",
      "Do not tolerate bullying, discrimination, or abuse.",
      "Report concerns through official channels without delay.",
    ],
    privacyTitle: "Privacy Policy",
    privacyDescription:
      "Personal data from youth members, guardians, volunteers, and reports is handled only for programme delivery, legal compliance, and safeguarding responsibilities.",
    termsTitle: "Terms of Use",
    termsDescription:
      "This website provides official district information. Unauthorized use of TSA trademarks and misuse of reporting channels is prohibited.",
  },
  joinPage: {
    title: "Join / Volunteer",
    description:
      "Use this page to follow verified joining and volunteering steps. Additional district-specific details will be published as soon as they are approved.",
    youthTitle: "Join as Youth",
    youthSteps: [
      "Choose a nearby unit from the Scout Units directory.",
      "Complete membership and parental consent forms.",
      "Attend one orientation meeting and basic health/safety briefing.",
      "Annual district and unit membership fees will be published soon.",
    ],
    youthNote: "Fee waiver policy and support options will be shared soon.",
    volunteerTitle: "Volunteer as Leader",
    volunteerIntro: "Leader pathway:",
    volunteerSteps: [
      "Submit volunteer application and references.",
      "Complete screening and safeguarding checks.",
      "Attend required district leader training when the next intake is announced.",
      "Shadow an active unit leader for the required onboarding period.",
      "Receive role assignment and annual development goals.",
    ],
    donateTitle: "Donate / Support",
    donateItems: [
      "Sponsor one scout (uniform + annual registration)",
      "Support a district training weekend",
      "Contribute equipment for camps and first aid",
    ],
    donateNote: "Donation channels and accountability contacts will be shared soon.",
  },
  contactPage: {
    title: "Contact KIBAHA SCOUTS",
    description:
      "Reach the district office for programme inquiries, membership support, partnerships, and media requests.",
    officeTitle: "District Office Details",
    socialTitle: "Social Media",
    formTitle: "Contact Form",
    formDescription:
      "Include your unit or school name for faster response. This form uses server-side validation, a honeypot field, and IP-based rate limiting.",
    mapTitle: "Map",
    mapEmbedUrl: "https://maps.google.com/maps?q=Kibaha%20District%20Council&t=&z=13&ie=UTF8&iwloc=&output=embed",
  },
  newsroomPage: {
    title: "Newsroom",
    description:
      "Official updates from Kibaha Scouts, including announcements, training highlights, community service impact, and scout achievements.",
    pressTitle: "Press & Downloads",
    pressDescription: "Media-ready files for official district communication.",
  },
  eventsPage: {
    title: "Events",
    description: "Browse all district activities, training weekends, and ceremonies. Switch between calendar and list views.",
  },
  resourcesPage: {
    title: "Resources",
    description: "Search the district document library for forms, training references, policy documents, and reports.",
  },
  aboutFaqs: faqs.map((item) => ({ ...item })),
  aboutTimeline: timelineEntries.map((item) => ({ ...item })),
  updatedAt: "",
  updatedBy: "",
}

function cloneDefaults(): SiteContentSettings {
  return {
    about: {
      ...defaultSiteContentSettings.about,
      overviewStats: defaultSiteContentSettings.about.overviewStats.map((item) => ({ ...item })),
      valuesItems: [...defaultSiteContentSettings.about.valuesItems],
      partnerItems: [...defaultSiteContentSettings.about.partnerItems],
    },
    programmesPage: { ...defaultSiteContentSettings.programmesPage },
    programmesList: defaultSiteContentSettings.programmesList.map((programme) => ({
      ...programme,
      objectives: [...programme.objectives],
      activities: [...programme.activities],
      badges: [...programme.badges],
      progression: [...programme.progression],
    })),
    unitsPage: { ...defaultSiteContentSettings.unitsPage },
    safetyPage: {
      ...defaultSiteContentSettings.safetyPage,
      codeItems: [...defaultSiteContentSettings.safetyPage.codeItems],
    },
    joinPage: {
      ...defaultSiteContentSettings.joinPage,
      youthSteps: [...defaultSiteContentSettings.joinPage.youthSteps],
      volunteerSteps: [...defaultSiteContentSettings.joinPage.volunteerSteps],
      donateItems: [...defaultSiteContentSettings.joinPage.donateItems],
    },
    contactPage: { ...defaultSiteContentSettings.contactPage },
    newsroomPage: { ...defaultSiteContentSettings.newsroomPage },
    eventsPage: { ...defaultSiteContentSettings.eventsPage },
    resourcesPage: { ...defaultSiteContentSettings.resourcesPage },
    aboutFaqs: defaultSiteContentSettings.aboutFaqs.map((item) => ({ ...item })),
    aboutTimeline: defaultSiteContentSettings.aboutTimeline.map((item) => ({ ...item })),
    updatedAt: "",
    updatedBy: "",
  }
}

export function getDefaultSiteContentSettings() {
  return cloneDefaults()
}

async function getSiteContentDocRef() {
  return getAdminDb().collection(SITE_SETTINGS_COLLECTION).doc(SITE_CONTENT_DOC_ID)
}

export async function getSiteContentFromFirestore(): Promise<SiteContentSettings> {
  const docRef = await getSiteContentDocRef()
  const doc = await docRef.get()

  if (!doc.exists) {
    return cloneDefaults()
  }

  const parsed = siteContentSettingsDocSchema.safeParse(doc.data() || {})
  if (!parsed.success) {
    console.warn("Invalid site content settings document. Falling back to defaults.")
    return cloneDefaults()
  }

  const settings = parsed.data
  return {
    ...settings,
    about: {
      ...settings.about,
      overviewStats: settings.about.overviewStats.map((item) => ({ ...item })),
      valuesItems: [...settings.about.valuesItems],
      partnerItems: [...settings.about.partnerItems],
    },
    programmesPage: { ...settings.programmesPage },
    programmesList: settings.programmesList.map((programme) => ({
      ...programme,
      objectives: [...programme.objectives],
      activities: [...programme.activities],
      badges: [...programme.badges],
      progression: [...programme.progression],
    })),
    unitsPage: { ...settings.unitsPage },
    safetyPage: { ...settings.safetyPage, codeItems: [...settings.safetyPage.codeItems] },
    joinPage: {
      ...settings.joinPage,
      youthSteps: [...settings.joinPage.youthSteps],
      volunteerSteps: [...settings.joinPage.volunteerSteps],
      donateItems: [...settings.joinPage.donateItems],
    },
    contactPage: { ...settings.contactPage },
    newsroomPage: { ...settings.newsroomPage },
    eventsPage: { ...settings.eventsPage },
    resourcesPage: { ...settings.resourcesPage },
    aboutFaqs: settings.aboutFaqs.map((item) => ({ ...item })),
    aboutTimeline: settings.aboutTimeline.map((item) => ({ ...item })),
    updatedAt: settings.updatedAt || "",
    updatedBy: settings.updatedBy || "",
  }
}

export async function upsertSiteContentInFirestore(
  settings: z.infer<typeof siteContentSettingsInputSchema>,
  actorEmail: string,
) {
  const parsedSettings = siteContentSettingsInputSchema.parse(settings)
  const now = new Date().toISOString()
  const normalizedActorEmail = actorEmail.trim().toLowerCase()

  const payload = {
    ...parsedSettings,
    updatedAt: now,
    updatedBy: normalizedActorEmail,
  }

  const docRef = await getSiteContentDocRef()
  await docRef.set(payload, { merge: true })

  return {
    ...payload,
  } satisfies SiteContentSettings
}
