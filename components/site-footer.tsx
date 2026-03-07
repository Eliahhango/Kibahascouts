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

export function SiteFooter() {
  const pathname = usePathname()
  const { footer, name, branding } = siteConfig
  const isAdminRoute = pathname.startsWith("/admin")

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
    <footer className="mt-0 overflow-hidden bg-tsa-green-deep text-primary-foreground" role="contentinfo">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="hidden gap-8 xl:grid xl:grid-cols-[repeat(4,minmax(0,1fr))_240px]">
          {footer.sections.map((section) => (
            <div key={section.title}>
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary-foreground/70">{section.title}</h2>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-primary-foreground transition-colors hover:text-tsa-cream focus-visible:ring-2 focus-visible:ring-tsa-gold"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary-foreground/70">Contact us</h2>
            <div className="space-y-2.5">
              {footer.actions.map((action) => (
                <Link
                  key={action.label}
                  href={action.href}
                  className="inline-flex min-h-11 w-full items-center justify-center rounded-sm border border-tsa-green-light/60 bg-tsa-green-mid px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-tsa-green-light focus-visible:ring-2 focus-visible:ring-tsa-gold"
                >
                  {action.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="xl:hidden">
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

          <div className="mt-5 flex flex-wrap gap-3">
            {footer.actions.map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className="inline-flex min-h-11 w-full items-center justify-center rounded-sm border border-tsa-green-light/60 bg-tsa-green-mid px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-tsa-green-light focus-visible:ring-2 focus-visible:ring-tsa-gold sm:min-w-[12rem] sm:w-auto"
              >
                {action.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-0 border-t border-tsa-green-light/40 bg-tsa-green-mid">
        <div className="mx-auto flex max-w-7xl flex-col items-start gap-4 px-4 pt-4 pb-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <Link
            href={footer.privacyLink.href}
            className="text-sm font-semibold text-primary-foreground transition-colors hover:text-tsa-cream focus-visible:ring-2 focus-visible:ring-tsa-gold"
          >
            {footer.privacyLink.label}
          </Link>

          <div className="flex items-center gap-2">
            {footer.socialLinks.map((social) => {
              const Icon = socialIconMap[social.icon]
              return (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-tsa-green-light/60 bg-transparent text-primary-foreground transition-colors hover:border-tsa-gold hover:bg-primary-foreground hover:text-tsa-green-mid"
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
            title="Member of the World Organization of the Scout Movement"
            className="inline-flex self-start items-center gap-2 rounded-lg border border-tsa-green-light/40 px-3 py-1.5 text-xs font-medium text-primary-foreground/80 hover:border-tsa-gold hover:text-primary-foreground sm:self-auto"
          >
            <Image
              src={branding.wosmBadge}
              alt="WOSM"
              width={24}
              height={24}
              className="h-6 w-6 rounded-full"
            />
            WOSM Member
          </a>

          <p className="text-sm font-semibold text-primary-foreground">&copy; {getCurrentYear()} {name}</p>
        </div>
      </div>
    </footer>
  )
}

