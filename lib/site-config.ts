import { publicEnv } from "@/lib/env/public"

export type FooterSocialIcon = "facebook" | "instagram" | "youtube"

type FooterLink = {
  label: string
  href: string
}

type FooterSection = {
  title: string
  links: FooterLink[]
}

type FooterAction = {
  label: string
  href: string
}

type FooterSocialLink = {
  label: string
  href: string
  icon: FooterSocialIcon
}

export const siteConfig = {
  name: "KIBAHA SCOUTS",
  shortName: "Kibaha District",
  organization: "Tanzania Scouts Association \u2013 Kibaha District Local Association",
  siteUrl: publicEnv.NEXT_PUBLIC_SITE_URL || "https://kibahascouts.vercel.app",
  description:
    "Official website of Kibaha Scouts with district updates, events, resources, and safeguarding information.",
  contact: {
    address: "P. O. Box 30011, Kibaha \u2013 Pwani, Tanzania",
    phoneDisplay: "+255 715 669 288 / +255 753 712 302 / +255 787 303 401",
    phoneHref: "tel:+255715669288",
    email: "kbhscouts@gmail.com",
    emailHref: "mailto:kbhscouts@gmail.com",
    officeHours: "Monday \u2013 Friday, 8:00 AM \u2013 5:00 PM",
    patron: "The President of The United Republic of Tanzania",
    patronSwahili: "Mlezi: Rais wa Jamhuri ya Muungano wa Tanzania",
    poBox: "P. O. Box 30011",
    region: "Kibaha \u2013 Pwani, Tanzania",
  },
  branding: {
    primaryLogo: "/images/branding/kibaha-scouts-logo.jpg",
    appIcon: "/images/branding/kibaha-scouts-logo.png",
    scoutBadge: "/images/branding/scout-badge.svg",
    footerCenterLogo: "/images/branding/tanzania-scouts-logo.png",
    footerCenterLogoAlt: "Tanzania Scouts logo",
    footerTagline: "Creating a Better World",
    wosmBadge: "/images/branding/wosm-badge.png",
    wosmBadgeAlt: "Member of the World Organization of the Scout Movement (WOSM)",
    wosmUrl: "https://www.scout.org",
    tanzaniaScoutsUrl: "https://tanzaniascouts.or.tz",
  },
  partners: [
    {
      name: "Tanzania Scouts Association",
      logo: "/images/branding/tanzania-scouts-logo.png",
      href: "https://tanzaniascouts.or.tz",
      description: "National governing body for Scouting in Tanzania",
    },
    {
      name: "World Organization of the Scout Movement (WOSM)",
      logo: "/images/branding/wosm-badge.png",
      href: "https://www.scout.org",
      description: "Global Scout membership body - 172 countries",
    },
    {
      name: "Jeshi la Zimamoto na Uokoaji Tanzania",
      logo: "/images/partners/jeshi-zimamoto.png",
      href: "https://tanzaniascouts.or.tz",
      description: "Tanzania Fire and Rescue Force",
    },
    {
      name: "PCCB - Takukuru",
      logo: "/images/partners/pccb.png",
      href: "https://www.pccb.go.tz",
      description: "Prevention and Combating of Corruption Bureau",
    },
    {
      name: "ZAECA",
      logo: "/images/partners/zaeca.png",
      href: "https://zaeca.go.tz",
      description: "Zanzibar Anti-Corruption and Economic Crimes Authority",
    },
    {
      name: "Safe From Harm",
      logo: "/images/partners/safe-from-harm.png",
      href: "https://tanzaniascouts.or.tz",
      description: "Child protection and safeguarding programme",
    },
    {
      name: "Tanzania Government Policies",
      logo: "/images/partners/tanzania-policies.png",
      href: "https://tanzaniascouts.or.tz",
      description: "Official Tanzania national policies and frameworks",
    },
  ],
  footer: {
    sections: [
      {
        title: "About Kibaha Scouts",
        links: [
          { label: "District Overview", href: "/about" },
          { label: "Leadership", href: "/about#leadership" },
          { label: "History", href: "/about#history" },
          { label: "FAQs", href: "/about#faqs" },
        ],
      },
      {
        title: "Programmes",
        links: [
          { label: "Cub Scouts", href: "/programmes/cub-scouts" },
          { label: "Scouts", href: "/programmes/scouts" },
          { label: "Rover Scouts", href: "/programmes/rovers" },
          { label: "Scout Units", href: "/units" },
        ],
      },
      {
        title: "Get Involved",
        links: [
          { label: "Join as Youth", href: "/join#youth" },
          { label: "Volunteer", href: "/join#volunteer" },
          { label: "Donate", href: "/join#donate" },
          { label: "Events", href: "/events" },
        ],
      },
      {
        title: "Policies",
        links: [
          { label: "Child Safeguarding", href: "/safety" },
          { label: "Privacy Policy", href: "/safety#privacy" },
          { label: "Terms of Use", href: "/safety#terms" },
          { label: "Code of Conduct", href: "/safety#conduct" },
        ],
      },
    ] satisfies FooterSection[],
    actions: [
      { label: "Newsletters", href: "/newsroom" },
      { label: "Report Misconduct", href: "/contact#reporting" },
    ] satisfies FooterAction[],
    privacyLink: {
      label: "Privacy policy",
      href: "/safety#privacy",
    },
    socialLinks: [
      {
        label: "Facebook",
        href: "https://www.facebook.com/profile.php?id=61588095737784",
        icon: "facebook",
      },
      {
        label: "Instagram",
        href: "https://www.instagram.com/kibahascouts/",
        icon: "instagram",
      },
      {
        label: "YouTube",
        href: "https://www.youtube.com/channel/UCOdbCJouM-b66bOPjw9V-8Q",
        icon: "youtube",
      },
    ] satisfies FooterSocialLink[],
  },
} as const

export const getCurrentYear = () => new Date().getFullYear()

