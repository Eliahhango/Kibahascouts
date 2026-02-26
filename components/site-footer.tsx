import Link from "next/link"
import { Mail, MapPin, Phone } from "lucide-react"

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

const socialLinks = [
  { label: "Facebook", href: "#", icon: "M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" },
  { label: "Twitter / X", href: "#", icon: "M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" },
  { label: "Instagram", href: "#", icon: "M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37zM17.5 6.5h.01M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9a5.5 5.5 0 0 1-5.5 5.5h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2z" },
  { label: "YouTube", href: "#", icon: "m22 8-6 4 6 4V8zM14 6H2v12h12V6z" },
]

export function SiteFooter() {
  return (
    <footer className="relative mt-14 overflow-hidden bg-[#2f1458] text-primary-foreground" role="contentinfo">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(167,139,250,0.3),transparent_35%),radial-gradient(circle_at_85%_0%,rgba(124,58,237,0.22),transparent_40%)]" />

      <div className="relative mx-auto max-w-7xl px-4 py-14">
        <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1fr]">
          <div className="rounded-xl border border-primary-foreground/15 bg-primary-foreground/5 p-5">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded focus-visible:ring-2 focus-visible:ring-tsa-gold"
              aria-label="TSA Kibaha District Home"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-tsa-gold shadow-lg" aria-hidden="true">
                <svg viewBox="0 0 32 32" className="h-5 w-5 text-tsa-green-deep" fill="currentColor">
                  <path d="M16 2l3.09 9.51H29l-8.045 5.84L24.045 27 16 21.16 7.955 27l3.09-9.65L3 11.51h9.91z" />
                </svg>
              </div>
              <div>
                <span className="block text-sm font-bold text-primary-foreground">TSA Kibaha District</span>
                <span className="block text-[11px] uppercase tracking-[0.12em] text-primary-foreground/65">
                  Official District Website
                </span>
              </div>
            </Link>

            <p className="mt-4 text-sm leading-relaxed text-primary-foreground/80">
              Building character, confidence, and community through scouting in Kibaha District, Coast Region, Tanzania.
            </p>

            <div className="mt-4 space-y-2 text-sm text-primary-foreground/80">
              <p className="inline-flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-tsa-gold" />
                P.O. Box 1234, Kibaha, Coast Region, Tanzania
              </p>
              <p className="inline-flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-tsa-gold" />
                +255 23 240 1234
              </p>
              <p className="inline-flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-tsa-gold" />
                info@tsa-kibaha.org
              </p>
            </div>
          </div>

          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading}>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.12em] text-tsa-gold">{heading}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-primary-foreground/80 transition-colors hover:text-tsa-gold focus-visible:ring-2 focus-visible:ring-tsa-gold"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-primary-foreground/15 pt-6">
          <div className="flex items-center gap-2">
            <span className="text-sm text-primary-foreground/70">Follow us:</span>
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                aria-label={social.label}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary-foreground/10 text-primary-foreground/85 hover:bg-tsa-gold hover:text-tsa-green-deep"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d={social.icon} />
                </svg>
              </a>
            ))}
          </div>

          <p className="text-xs text-primary-foreground/70">
            &copy; {new Date().getFullYear()} Tanzania Scouts Association - Kibaha District. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
