import type { Metadata } from "next"
import { Mail, MapPin, Phone } from "lucide-react"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { ContactForm } from "@/components/contact-form"
import { siteConfig } from "@/lib/site-config"

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Kibaha Scouts office, send inquiries, and connect through social channels.",
}

export default function ContactPage() {
  const { contact } = siteConfig
  const hasPhoneLink = Boolean(contact.phoneHref)
  const hasEmailLink = Boolean(contact.emailHref)

  return (
    <>
      <Breadcrumbs items={[{ label: "Contact" }]} />

      <section className="bg-background py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4">
          <h1 className="text-3xl font-bold text-foreground md:text-4xl">Contact KIBAHA SCOUTS</h1>
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
                {contact.address}
              </p>
              <p className="inline-flex items-center gap-2">
                <Phone className="h-4 w-4 text-tsa-green-deep" />
                {hasPhoneLink ? (
                  <a href={contact.phoneHref} className="hover:text-tsa-green-mid">
                    {contact.phoneDisplay}
                  </a>
                ) : (
                  contact.phoneDisplay
                )}
              </p>
              <p className="inline-flex items-center gap-2">
                <Mail className="h-4 w-4 text-tsa-green-deep" />
                {hasEmailLink ? (
                  <a href={contact.emailHref} className="hover:text-tsa-green-mid">
                    {contact.email}
                  </a>
                ) : (
                  contact.email
                )}
              </p>
              <p>Office hours: {contact.officeHours}</p>
            </div>

            <h3 className="mt-6 text-lg font-semibold text-card-foreground">Social Media</h3>
            <ul className="mt-2 space-y-1 text-sm text-tsa-green-deep">
              <li>
                <a
                  href="https://www.facebook.com/profile.php?id=61588095737784"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-tsa-green-mid"
                >
                  Facebook: Kibaha Scouts
                </a>
              </li>
              <li>
                <a href="https://www.instagram.com/kibahascouts/" target="_blank" rel="noreferrer" className="hover:text-tsa-green-mid">
                  Instagram: @kibahascouts
                </a>
              </li>
              <li>
                <a
                  href="https://www.youtube.com/channel/UCOdbCJouM-b66bOPjw9V-8Q"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-tsa-green-mid"
                >
                  YouTube: Kibaha Scouts
                </a>
              </li>
            </ul>
          </article>

          <article id="reporting" className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-2xl font-bold text-card-foreground">Contact Form</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Include your unit or school name for faster response. This form uses server-side validation, a honeypot
              field, and IP-based rate limiting.
            </p>
            <ContactForm />
          </article>
        </div>
      </section>

      <section className="bg-background py-12">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-2xl font-bold text-foreground">Map</h2>
          <div className="mt-4 overflow-hidden rounded-lg border border-border">
            <iframe
              title="Kibaha Scouts office map"
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
