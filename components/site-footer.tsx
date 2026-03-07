"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Facebook, Instagram, Youtube, type LucideIcon } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { getCurrentYear, siteConfig, type FooterSocialIcon } from "@/lib/site-config"

const socialIconMap: Record<FooterSocialIcon, LucideIcon> = {
  facebook: Facebook,
  instagram: Instagram,
  youtube: Youtube,
}

const socialHoverClassMap: Record<FooterSocialIcon, string> = {
  facebook: "hover:bg-[#1877f2]",
  instagram: "hover:bg-[#e1306c]",
  youtube: "hover:bg-[#ff0000]",
}

export function SiteFooter() {
  const pathname = usePathname()
  const { footer, name, branding, contact, partners } = siteConfig
  const isAdminRoute = pathname.startsWith("/admin")
  const sectionHeadingClass = "mb-3 text-xs font-semibold uppercase tracking-widest text-primary-foreground/60"

  if (isAdminRoute) {
    return (
      <footer className="border-t border-border bg-background" role="contentinfo">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-4 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div>
            <p className="text-sm font-semibold text-foreground">Kibaha Scouts Admin Panel</p>
            <p className="text-xs text-muted-foreground">
              Manage content, navigation, users, security logs, and message inbox.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <Link
              href="/admin"
              className="rounded-md border border-border px-2 py-1 font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              Dashboard
            </Link>
            <Link
              href="/admin/site-content"
              className="rounded-md border border-border px-2 py-1 font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              Site Content
            </Link>
            <Link
              href="/admin/security"
              className="rounded-md border border-border px-2 py-1 font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              Security
            </Link>
            <Link
              href="/"
              className="rounded-md border border-border px-2 py-1 font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              Public Website
            </Link>
          </div>

          <p className="text-xs text-muted-foreground">&copy; {getCurrentYear()} {name} Admin</p>
        </div>
      </footer>
    )
  }

  return (
    <footer
      className="mt-0 overflow-hidden bg-tsa-green-deep text-primary-foreground"
      role="contentinfo"
      aria-label="Site footer"
    >
      <div className="border-b border-tsa-green-light/30 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-2 text-center">
            <Image
              src={branding.primaryLogo}
              alt={name}
              width={48}
              height={48}
              className="h-12 w-12 rounded-full object-cover ring-2 ring-tsa-gold"
            />
            <p className="text-xl font-bold text-white">{name}</p>
            <p className="text-sm italic text-white/60">{branding.footerTagline}</p>
            <p className="text-xs text-white/50">Under the patronage of: {contact.patron}</p>
          </div>
        </div>
      </div>

      <div className="py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="hidden gap-8 xl:grid xl:grid-cols-5">
            {footer.sections.map((section) => (
              <div key={section.title}>
                <h2 className={sectionHeadingClass}>{section.title}</h2>
                <ul className="space-y-2.5">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-primary-foreground/80 transition-colors hover:text-tsa-cream focus-visible:ring-2 focus-visible:ring-tsa-gold"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div>
              <h2 className={sectionHeadingClass}>Contact</h2>
              <ul className="space-y-2.5 text-sm text-primary-foreground/80">
                <li>
                  <a href={contact.emailHref} className="transition-colors hover:text-tsa-cream">
                    {contact.email}
                  </a>
                </li>
                <li>
                  <a href={contact.phoneHref} className="transition-colors hover:text-tsa-cream">
                    {contact.phoneDisplay}
                  </a>
                </li>
                <li className="leading-snug">{contact.address}</li>
                <li className="text-white/50">{contact.officeHours}</li>
              </ul>
              <div className="mt-4 space-y-2">
                {footer.actions.map((action) => (
                  <Link
                    key={action.label}
                    href={action.href}
                    className="inline-flex w-full items-center justify-center rounded-md border border-tsa-green-light/50 bg-tsa-green-mid px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-tsa-green-light"
                  >
                    {action.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6 xl:hidden">
            <Accordion
              type="single"
              collapsible
              className="overflow-hidden rounded-sm border border-tsa-green-light/50 bg-tsa-green-mid"
            >
              {footer.sections.map((section) => (
                <AccordionItem key={section.title} value={section.title} className="border-tsa-green-light/40 last:border-b-0">
                  <AccordionTrigger className="!relative !block !rounded-none !py-3.5 !pl-4 !pr-12 !text-left !text-[1rem] !font-semibold !text-primary-foreground hover:!bg-tsa-green-light hover:!no-underline after:pointer-events-none after:absolute after:inset-y-0 after:right-0 after:z-0 after:w-11 after:border-l after:border-tsa-green-light/40 after:bg-tsa-green-deep [&>svg]:!absolute [&>svg]:!right-3.5 [&>svg]:!top-1/2 [&>svg]:!z-10 [&>svg]:!h-5 [&>svg]:!w-5 [&>svg]:!-translate-y-1/2 [&>svg]:!text-primary-foreground">
                    <span className="relative z-10 block leading-tight">{section.title}</span>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-3">
                    <ul className="space-y-1.5">
                      {section.links.map((link) => (
                        <li key={link.href}>
                          <Link
                            href={link.href}
                            className="block rounded-sm px-2 py-1 text-sm text-primary-foreground transition-colors hover:bg-tsa-green-light hover:text-tsa-cream focus-visible:ring-2 focus-visible:ring-tsa-gold"
                          >
                            {link.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            <div>
              <h2 className={sectionHeadingClass}>Contact</h2>
              <ul className="space-y-2.5 text-sm text-primary-foreground/80">
                <li>
                  <a href={contact.emailHref} className="transition-colors hover:text-tsa-cream">
                    {contact.email}
                  </a>
                </li>
                <li>
                  <a href={contact.phoneHref} className="transition-colors hover:text-tsa-cream">
                    {contact.phoneDisplay}
                  </a>
                </li>
                <li className="leading-snug">{contact.address}</li>
                <li className="text-white/50">{contact.officeHours}</li>
              </ul>
              <div className="mt-4 space-y-2">
                {footer.actions.map((action) => (
                  <Link
                    key={action.label}
                    href={action.href}
                    className="inline-flex w-full items-center justify-center rounded-md border border-tsa-green-light/50 bg-tsa-green-mid px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-tsa-green-light"
                  >
                    {action.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-tsa-green-light/30 py-5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6 overflow-x-auto pb-1 opacity-60 sm:flex-wrap sm:justify-center sm:overflow-visible">
            <p className="mb-1 w-full shrink-0 text-center text-xs uppercase tracking-widest text-white/50">Affiliated with</p>
            {partners.slice(0, 4).map((partner) => (
              <div key={partner.name} className="flex shrink-0 items-center gap-2">
                <Image
                  src={partner.logo}
                  alt={partner.name}
                  width={28}
                  height={28}
                  className="h-7 w-7 rounded-full object-contain opacity-80"
                />
                <span className="hidden text-xs text-white/60 sm:block">{partner.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-tsa-green-light/40 bg-tsa-green-mid py-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2">
              {footer.socialLinks.map((social) => {
                const Icon = socialIconMap[social.icon]
                const hoverClass = socialHoverClassMap[social.icon]

                return (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    target="_blank"
                    rel="noreferrer"
                    className={`inline-flex h-10 w-10 items-center justify-center rounded-full border border-tsa-green-light/60 text-primary-foreground/90 transition-colors hover:border-transparent ${hoverClass}`}
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                )
              })}
            </div>

            <a
              href={branding.wosmUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-xs text-white/60 transition-colors hover:text-white"
              title="Member of the World Organization of the Scout Movement"
            >
              <Image src={branding.wosmBadge} alt="WOSM" width={32} height={32} className="h-8 w-8 rounded-full object-contain" />
              <span>WOSM Member</span>
            </a>

            <p className="text-xs text-white/70 md:text-right">
              &copy; {getCurrentYear()} {name}. All rights reserved.
            </p>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs text-white/50">
            <Link href={footer.privacyLink.href} className="transition-colors hover:text-white">
              {footer.privacyLink.label}
            </Link>
            <span className="text-white/35">&middot;</span>
            <Link href="/safety#terms" className="transition-colors hover:text-white">
              Terms of Use
            </Link>
            <span className="text-white/35">&middot;</span>
            <Link href="/safety" className="transition-colors hover:text-white">
              Child Safeguarding
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
