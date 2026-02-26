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
  const { footer, name } = siteConfig

  return (
    <footer className="mt-0 bg-tsa-green-deep text-primary-foreground" role="contentinfo">
      <div className="mx-auto max-w-7xl px-4 py-8 lg:py-10">
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
                  className="inline-flex min-h-11 w-full items-center justify-center rounded-sm border border-[#6b55ab] bg-[#4a3291] px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-[#5a41a5] focus-visible:ring-2 focus-visible:ring-tsa-gold"
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
            className="overflow-hidden rounded-sm border border-[#6450a4] bg-[#3f297f]"
          >
            {footer.sections.map((section) => (
              <AccordionItem key={section.title} value={section.title} className="border-[#5b479b] last:border-b-0">
                <AccordionTrigger className="!relative !block !rounded-none !py-3.5 !pl-4 !pr-12 !text-left !text-[1rem] !font-semibold !text-primary-foreground hover:!bg-[#4e3794] hover:!no-underline after:pointer-events-none after:absolute after:inset-y-0 after:right-0 after:w-11 after:border-l after:border-[#5b479b] after:bg-[#432d86] [&>svg]:!absolute [&>svg]:!right-3.5 [&>svg]:!top-1/2 [&>svg]:!-translate-y-1/2 [&>svg]:!text-primary-foreground">
                  <span className="block leading-tight">{section.title}</span>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-3">
                  <ul className="space-y-1.5">
                    {section.links.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className="block rounded-sm px-2 py-1 text-sm text-primary-foreground transition-colors hover:bg-[#4e3794] hover:text-tsa-cream focus-visible:ring-2 focus-visible:ring-tsa-gold"
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
                className="inline-flex min-h-11 min-w-[12rem] items-center justify-center rounded-sm border border-[#6b55ab] bg-[#4a3291] px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-[#5a41a5] focus-visible:ring-2 focus-visible:ring-tsa-gold"
              >
                {action.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-[#5f4ca0] bg-[#402c81]">
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
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#5a44a8] text-primary-foreground transition-colors hover:bg-primary-foreground hover:text-[#402c81]"
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
