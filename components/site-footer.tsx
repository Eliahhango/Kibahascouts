import Image from "next/image"
import Link from "next/link"
import { Facebook, Instagram, Youtube, type LucideIcon } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { getCurrentYear, siteConfig, type FooterSocialIcon } from "@/lib/site-config"

const socialIconMap: Record<FooterSocialIcon, LucideIcon> = {
  facebook: Facebook,
  instagram: Instagram,
  youtube: Youtube,
}

export function SiteFooter() {
  const { branding, footer, name, organization } = siteConfig

  return (
    <footer className="mt-14 bg-tsa-green-deep text-primary-foreground" role="contentinfo">
      <div className="mx-auto max-w-7xl px-4 pb-10 pt-8 lg:pb-12 lg:pt-10">
        <div className="hidden gap-8 lg:grid lg:grid-cols-[repeat(4,minmax(0,1fr))_240px]">
          {footer.sections.map((section) => (
            <div key={section.title}>
              <h2 className="mb-4 text-2xl font-bold text-primary-foreground">{section.title}</h2>
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
            <h2 className="mb-4 text-2xl font-bold text-primary-foreground">Contact us</h2>
            <div className="space-y-2.5">
              {footer.actions.map((action) => (
                <Link
                  key={action.label}
                  href={action.href}
                  className="inline-flex min-h-11 w-full items-center justify-center rounded-sm border border-[#5f78ad] bg-[#2e508f] px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-[#3b5d9b] focus-visible:ring-2 focus-visible:ring-tsa-gold"
                >
                  {action.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:hidden">
          <Accordion
            type="single"
            collapsible
            className="overflow-hidden rounded-sm border border-[#5f78ad] bg-[#1b447e]"
          >
            {footer.sections.map((section) => (
              <AccordionItem key={section.title} value={section.title} className="border-[#4f6aa1] last:border-b-0">
                <AccordionTrigger className="!relative !block !rounded-none !py-3.5 !pl-4 !pr-12 !text-left !text-[1rem] !font-semibold !text-primary-foreground hover:!bg-[#2a4f90] hover:!no-underline after:pointer-events-none after:absolute after:inset-y-0 after:right-0 after:w-11 after:border-l after:border-[#4f6aa1] after:bg-[#1d4682] [&>svg]:!absolute [&>svg]:!right-3.5 [&>svg]:!top-1/2 [&>svg]:!-translate-y-1/2 [&>svg]:!text-primary-foreground">
                  <span className="block leading-tight">{section.title}</span>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-3">
                  <ul className="space-y-1.5">
                    {section.links.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className="block rounded-sm px-2 py-1 text-sm text-primary-foreground transition-colors hover:bg-[#2a4f90] hover:text-tsa-cream focus-visible:ring-2 focus-visible:ring-tsa-gold"
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
                className="inline-flex min-h-11 min-w-[12rem] items-center justify-center rounded-sm border border-[#5f78ad] bg-[#2e508f] px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-[#3b5d9b] focus-visible:ring-2 focus-visible:ring-tsa-gold"
              >
                {action.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-8 border-t border-[#4f6aa1] pt-8 lg:mt-10 lg:pt-9">
          <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-primary-foreground">
              {organization}
            </p>
            <div className="mt-3 flex items-center justify-center gap-3">
              <div className="relative h-10 w-10 overflow-hidden rounded-full border border-[#5f78ad] p-1">
                <Image src={branding.scoutBadge} alt="" fill sizes="40px" className="object-contain p-1" />
              </div>
              <span className="text-2xl font-extrabold tracking-[0.2em] text-primary-foreground sm:text-4xl">SCOUTS</span>
            </div>
            <p className="mt-1.5 text-sm text-primary-foreground sm:text-base">{branding.footerTagline}</p>
            <div className="mt-3 px-3 py-2">
              <Image
                src={branding.footerCenterLogo}
                alt={branding.footerCenterLogoAlt}
                width={224}
                height={224}
                className="h-auto w-20 object-contain sm:w-24"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-[#4f6aa1] bg-[#2a4f90]">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
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
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#3a5e9d] text-primary-foreground transition-colors hover:bg-primary-foreground hover:text-[#113b82]"
                >
                  <Icon className="h-4 w-4" />
                </a>
              )
            })}
          </div>

          <p className="text-sm font-semibold text-primary-foreground">&copy; {getCurrentYear()} {name}</p>
        </div>
      </div>
    </footer>
  )
}
