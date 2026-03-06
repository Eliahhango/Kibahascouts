import type { Metadata } from "next"
import { Mail, MapPin, Phone } from "lucide-react"
import { ContactForm } from "@/components/contact-form"
import { PageHero } from "@/components/public/page-hero"
import { SectionShell } from "@/components/public/section-shell"
import { getSiteContentSettingsFromCms } from "@/lib/cms"
import { normalizePublicText } from "@/lib/public-text"
import { siteConfig } from "@/lib/site-config"

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Kibaha Scouts office, send inquiries, and connect through social channels.",
}

export default async function ContactPage() {
  const { contact } = siteConfig
  const siteContent = await getSiteContentSettingsFromCms()
  const pageContent = siteContent.contactPage
  const hasPhoneLink = Boolean(contact.phoneHref)
  const hasEmailLink = Boolean(contact.emailHref)

  return (
    <>
      <PageHero
        title={normalizePublicText(pageContent.title, "Contact KIBAHA SCOUTS")}
        subtitle={normalizePublicText(
          pageContent.description,
          "Reach the district office for programme inquiries, membership support, partnerships, and media requests.",
        )}
        breadcrumbs={[{ label: "Contact" }]}
      />

      <SectionShell eyebrow="Contact" title={normalizePublicText(pageContent.officeTitle, "District Office Details")} tone="background">
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
          <article className="card-shell p-6">
            <div className="space-y-3 text-base text-muted-foreground">
              <p className="inline-flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-tsa-green-deep" />
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

            <h3 className="mt-6 text-lg font-semibold text-foreground">
              {normalizePublicText(pageContent.socialTitle, "Social Media")}
            </h3>
            <ul className="mt-2 space-y-1 text-base text-tsa-green-deep">
              <li>
                <a href="https://www.facebook.com/profile.php?id=61588095737784" target="_blank" rel="noreferrer" className="hover:text-tsa-green-mid">
                  Facebook: Kibaha Scouts
                </a>
              </li>
              <li>
                <a href="https://www.instagram.com/kibahascouts/" target="_blank" rel="noreferrer" className="hover:text-tsa-green-mid">
                  Instagram: @kibahascouts
                </a>
              </li>
              <li>
                <a href="https://www.youtube.com/channel/UCOdbCJouM-b66bOPjw9V-8Q" target="_blank" rel="noreferrer" className="hover:text-tsa-green-mid">
                  YouTube: Kibaha Scouts
                </a>
              </li>
            </ul>
          </article>

          <article id="reporting" className="card-shell p-6">
            <h2 className="text-xl font-semibold text-foreground">
              {normalizePublicText(pageContent.formTitle, "Contact Form")}
            </h2>
            <p className="mt-2 text-base text-muted-foreground">
              {normalizePublicText(pageContent.formDescription)}
            </p>
            <ContactForm />
          </article>
        </div>
      </SectionShell>

      <SectionShell eyebrow="Map" title={normalizePublicText(pageContent.mapTitle, "Map")} tone="white">
        <div className="overflow-hidden rounded-2xl border border-border">
          <iframe
            title="Kibaha Scouts office map"
            src={pageContent.mapEmbedUrl}
            className="h-[320px] w-full"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </SectionShell>
    </>
  )
}
