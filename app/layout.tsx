import type { Metadata, Viewport } from 'next'
import { Manrope, Source_Serif_4 } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
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

export const metadata: Metadata = {
  metadataBase: new URL('https://tsa-kibaha.org'),
  title: {
    default: 'TSA Kibaha District | Tanzania Scouts Association',
    template: '%s | TSA Kibaha District',
  },
  description:
    'Official website of the Tanzania Scouts Association, Kibaha District. Building character, confidence, and community through scouting in Coast Region, Tanzania.',
  keywords: ['Tanzania Scouts', 'Kibaha', 'Scouting', 'Youth Development', 'TSA', 'Coast Region'],
  openGraph: {
    type: 'website',
    locale: 'en_TZ',
    url: 'https://tsa-kibaha.org',
    siteName: 'TSA Kibaha District',
    title: 'TSA Kibaha District | Tanzania Scouts Association',
    description:
      'Building character, confidence, and community through scouting in Kibaha District.',
    images: [{ url: '/images/hero-scouts.jpg', width: 1200, height: 630 }],
  },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  themeColor: '#4C1D95',
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
      <body className="font-sans antialiased">
        <SiteHeader />
        <main id="main-content">
          {children}
        </main>
        <SiteFooter />
        <Analytics />
      </body>
    </html>
  )
}
