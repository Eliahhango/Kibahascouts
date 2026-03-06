import Link from "next/link"
import { Compass, Home, Search } from "lucide-react"

const quickLinks = [
  { label: "About Kibaha Scouts", href: "/about" },
  { label: "Programmes", href: "/programmes" },
  { label: "Newsroom", href: "/newsroom" },
  { label: "Contact Us", href: "/contact" },
]

export default function NotFound() {
  return (
    <section className="relative min-h-screen overflow-hidden border-y border-border bg-tsa-green-deep py-20 md:py-28">
      <div className="relative mx-auto max-w-4xl px-4 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-tsa-green-mid bg-tsa-green-mid px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-primary-foreground">
          <Compass className="h-3.5 w-3.5" />
          Error 404
        </span>

        <h1 className="mt-5 text-balance text-3xl font-bold leading-tight text-primary-foreground md:text-5xl">
          Page not found
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-primary-foreground md:text-lg">
          The page you are trying to open does not exist or may have been moved.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-md bg-tsa-gold px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-tsa-gold-light"
          >
            <Home className="h-4 w-4" />
            Back to Home
          </Link>
          <Link
            href="/newsroom"
            className="inline-flex items-center gap-2 rounded-md border border-tsa-green-mid bg-tsa-green-mid px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-tsa-green-light"
          >
            <Search className="h-4 w-4" />
            Browse Updates
          </Link>
        </div>

        <div className="mt-10 section-shell bg-primary-foreground p-6 text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-tsa-green-deep">Try these pages</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg border border-border bg-background px-4 py-3 text-sm font-medium text-foreground transition-colors hover:border-tsa-gold hover:text-tsa-green-deep"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
