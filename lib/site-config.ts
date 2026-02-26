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
  shortName: "Kibaha Scouts",
  organization: "Tanzania Scouts Association",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://kibahascouts.vercel.app",
  description:
    "Official website of Kibaha Scouts. Replace placeholder fields with verified district information before production publishing.",
  contact: {
    address: "[ADD VERIFIED ADDRESS]",
    phoneDisplay: "[CONFIRM PHONE]",
    phoneHref: "tel:[CONFIRM PHONE]",
    email: "[CONFIRM EMAIL]",
    emailHref: "mailto:[CONFIRM EMAIL]",
  },
  branding: {
    primaryLogo: "/images/branding/kibaha-scouts-logo.jpg",
    appIcon: "/images/branding/kibaha-scouts-logo.png",
    scoutBadge: "/images/branding/scout-badge.svg",
    footerCenterLogo: "/images/branding/tanzania-scouts-logo.png",
    footerCenterLogoAlt: "Tanzania Scouts logo",
    footerTagline: "Creating a Better World",
  },
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
