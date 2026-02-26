import type { Metadata } from "next"
import { Mail, MapPin, Phone } from "lucide-react"
import { Breadcrumbs } from "@/components/breadcrumbs"

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact TSA Kibaha District office, send inquiries, and connect through social channels.",
}

export default function ContactPage() {
  return (
    <>
      <Breadcrumbs items={[{ label: "Contact" }]} />

      <section className="bg-background py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4">
          <h1 className="text-3xl font-bold text-foreground md:text-4xl">Contact TSA Kibaha District</h1>
          <p className="mt-3 max-w-3xl text-base leading-relaxed text-muted-foreground">
            Reach the district office for programme inquiries, membership support, partnerships, and media requests.
          </p>
        </div>
      </section>

      <section className="bg-secondary py-12">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 lg:grid-cols-[1fr_1fr]">
          <article className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-2xl font-bold text-card-foreground">District Office Details</h2>
            <div className="mt-4 space-y-3 text-sm text-muted-foreground">
              <p className="inline-flex items-center gap-2">
                <MapPin className="h-4 w-4 text-tsa-green-deep" />
                Plot 45, District Office Road, Kibaha Town, Coast Region, Tanzania
              </p>
              <p className="inline-flex items-center gap-2">
                <Phone className="h-4 w-4 text-tsa-green-deep" />
                +255 23 240 1234
              </p>
              <p className="inline-flex items-center gap-2">
                <Mail className="h-4 w-4 text-tsa-green-deep" />
                info@tsa-kibaha.org
              </p>
              <p>Office hours: Monday to Friday, 08:00-16:30</p>
            </div>

            <h3 className="mt-6 text-lg font-semibold text-card-foreground">Social Media</h3>
            <ul className="mt-2 space-y-1 text-sm text-tsa-green-deep">
              <li>
                <a href="#" className="hover:text-tsa-green-mid">
                  Facebook: TSA Kibaha District
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-tsa-green-mid">
                  Instagram: @tsa.kibaha
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-tsa-green-mid">
                  YouTube: TSA Kibaha District
                </a>
              </li>
            </ul>
          </article>

          <article className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-2xl font-bold text-card-foreground">Contact Form</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Include your unit or school name for faster response. Anti-spam protection includes a hidden honeypot field.
            </p>
            <form className="mt-4 space-y-3">
              <div>
                <label htmlFor="contact-name" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Full Name
                </label>
                <input
                  id="contact-name"
                  name="name"
                  type="text"
                  required
                  className="mt-1 w-full rounded-md border border-input px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label htmlFor="contact-email" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Email Address
                </label>
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  required
                  className="mt-1 w-full rounded-md border border-input px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label htmlFor="contact-subject" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Subject
                </label>
                <input
                  id="contact-subject"
                  name="subject"
                  type="text"
                  className="mt-1 w-full rounded-md border border-input px-3 py-2 text-sm"
                />
              </div>
              <div className="hidden" aria-hidden="true">
                <label htmlFor="website">Website</label>
                <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
              </div>
              <div>
                <label htmlFor="contact-message" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Message
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  rows={5}
                  required
                  className="mt-1 w-full rounded-md border border-input px-3 py-2 text-sm"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-md bg-tsa-green-deep px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-tsa-green-mid"
              >
                Send Message
              </button>
            </form>
          </article>
        </div>
      </section>

      <section className="bg-background py-12">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-2xl font-bold text-foreground">Map</h2>
          <div className="mt-4 overflow-hidden rounded-lg border border-border">
            <iframe
              title="TSA Kibaha District office map"
              src="https://maps.google.com/maps?q=Kibaha%20District%20Council&t=&z=13&ie=UTF8&iwloc=&output=embed"
              className="h-[320px] w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>
    </>
  )
}
