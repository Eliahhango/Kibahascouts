import { Suspense } from 'react'
import type { Metadata, Viewport } from 'next'
import { Manrope, Source_Serif_4 } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ConditionalShell } from '@/components/conditional-shell'
import { SiteVisitTracker } from '@/components/site-visit-tracker'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { BackToTop } from '@/components/back-to-top'
import { siteConfig } from '@/lib/site-config'
import { getMetadataBase, getSiteUrl } from '@/lib/site-url'
import './globals.css'

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
})

const sourceSerif = Source_Serif_4({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-source-serif',
})

const siteUrl = getSiteUrl()

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  title: {
    default: `${siteConfig.name} | ${siteConfig.organization}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: ['Tanzania Scouts', 'Kibaha', 'Scouting', 'Youth Development', 'TSA', 'Coast Region'],
  openGraph: {
    type: 'website',
    locale: 'en_TZ',
    url: siteUrl,
    siteName: siteConfig.name,
    title: `${siteConfig.name} | ${siteConfig.organization}`,
    description:
      'Building character, confidence, and community through scouting in Kibaha District.',
    images: [
      { url: siteConfig.branding.appIcon, width: 320, height: 320 },
      { url: '/images/hero-scouts.jpg', width: 1200, height: 630 },
    ],
  },
  icons: {
    icon: siteConfig.branding.appIcon,
    shortcut: siteConfig.branding.appIcon,
    apple: siteConfig.branding.appIcon,
  },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  themeColor: '#1e3a2f',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${manrope.variable} ${sourceSerif.variable}`}>
      <body className="flex min-h-screen flex-col overflow-x-hidden font-sans antialiased">
        <Suspense fallback={null}>
          <SiteVisitTracker />
        </Suspense>
        <ConditionalShell>
          <SiteHeader />
        </ConditionalShell>
        <div className="flex flex-1 flex-col">
          <main id="main-content" className="flex-1">
            {children}
          </main>
          <ConditionalShell>
            <>
              <SiteFooter />
              <BackToTop />
            </>
          </ConditionalShell>
        </div>
        <Analytics />
      </body>
    </html>
  )
}


