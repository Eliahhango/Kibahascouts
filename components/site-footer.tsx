import Link from "next/link"
import { Mail, Phone, MapPin } from "lucide-react"

const footerLinks = {
  "About TSA Kibaha": [
    { label: "District Overview", href: "/about" },
    { label: "Leadership", href: "/about#leadership" },
    { label: "History", href: "/about#history" },
    { label: "FAQs", href: "/about#faqs" },
  ],
  Programmes: [
    { label: "Cub Scouts", href: "/programmes/cub-scouts" },
    { label: "Scouts", href: "/programmes/scouts" },
    { label: "Rover Scouts", href: "/programmes/rovers" },
    { label: "Scout Units", href: "/units" },
  ],
  "Get Involved": [
    { label: "Join as Youth", href: "/join#youth" },
    { label: "Volunteer", href: "/join#volunteer" },
    { label: "Donate", href: "/join#donate" },
    { label: "Events", href: "/events" },
  ],
  Policies: [
    { label: "Child Safeguarding", href: "/safety" },
    { label: "Privacy Policy", href: "/safety#privacy" },
    { label: "Terms of Use", href: "/safety#terms" },
    { label: "Code of Conduct", href: "/safety#conduct" },
  ],
}

export function SiteFooter() {
  return (
    <footer className="bg-tsa-green-deep text-primary-foreground" role="contentinfo">
      {/* Main footer */}
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand column */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-tsa-gold rounded" aria-label="TSA Kibaha District Home">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-tsa-gold" aria-hidden="true">
                <svg viewBox="0 0 32 32" className="h-5 w-5 text-tsa-green-deep" fill="currentColor">
                  <path d="M16 2l3.09 9.51H29l-8.045 5.84L24.045 27 16 21.16 7.955 27l3.09-9.65L3 11.51h9.91z" />
                </svg>
              </div>
              <div>
                <span className="block text-sm font-bold text-primary-foreground">
                  TSA Kibaha District
                </span>
              </div>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-primary-foreground/80">
              Building character, confidence, and community through scouting in Kibaha District, Coast Region, Tanzania.
            </p>
            {/* Contact info */}
            <div className="mt-4 space-y-2 text-sm text-primary-foreground/80">
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                <span>P.O. Box 1234, Kibaha, Coast Region, Tanzania</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0" />
                <span>+255 23 240 1234</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0" />
                <span>info@tsa-kibaha.org</span>
              </div>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading}>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-tsa-gold">
                {heading}
              </h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-primary-foreground/80 transition-colors hover:text-tsa-gold focus-visible:ring-2 focus-visible:ring-tsa-gold rounded"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Social links */}
        <div className="mt-10 flex items-center gap-4 border-t border-tsa-green-mid pt-6">
          <span className="text-sm text-primary-foreground/60">Follow us:</span>
          {[
            { label: "Facebook", href: "#", icon: "M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" },
            { label: "Twitter / X", href: "#", icon: "M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" },
            { label: "Instagram", href: "#", icon: "M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37zM17.5 6.5h.01M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9a5.5 5.5 0 0 1-5.5 5.5h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2z" },
            { label: "YouTube", href: "#", icon: "m22 8-6 4 6 4V8zM14 6H2v12h12V6z" },
          ].map((social) => (
            <a
              key={social.label}
              href={social.href}
              aria-label={social.label}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-tsa-green-mid text-primary-foreground/80 transition-colors hover:bg-tsa-gold hover:text-tsa-green-deep focus-visible:ring-2 focus-visible:ring-tsa-gold"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d={social.icon} />
              </svg>
            </a>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-tsa-green-mid bg-tsa-green-deep/80">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <p className="text-center text-xs text-primary-foreground/60">
            &copy; {new Date().getFullYear()} Tanzania Scouts Association &ndash; Kibaha District. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
