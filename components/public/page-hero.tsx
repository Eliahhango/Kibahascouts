import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

type HeroBreadcrumb = {
  label: string
  href?: string
}

type PageHeroProps = {
  title: string
  subtitle?: string
  breadcrumbs?: HeroBreadcrumb[]
  className?: string
}

export function PageHero({ title, subtitle, breadcrumbs = [], className }: PageHeroProps) {
  const fullBreadcrumbs = [{ label: "Home", href: "/" }, ...breadcrumbs]

  return (
    <section className={cn("relative overflow-hidden border-b border-tsa-green-mid bg-tsa-green-deep", className)}>
      <div className="mx-auto flex min-h-[260px] max-w-7xl flex-col justify-center px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <nav aria-label="Breadcrumb" className="mb-3">
          <ol className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-primary-foreground/80">
            {fullBreadcrumbs.map((crumb, index) => {
              const last = index === fullBreadcrumbs.length - 1
              return (
                <li key={`${crumb.label}-${index}`} className="inline-flex items-center gap-1.5">
                  {index > 0 ? <ChevronRight className="h-3.5 w-3.5 text-tsa-gold" /> : null}
                  {crumb.href && !last ? (
                    <Link href={crumb.href} className="text-primary-foreground/90 transition-colors hover:text-tsa-gold">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="font-semibold text-tsa-gold">{crumb.label}</span>
                  )}
                </li>
              )
            })}
          </ol>
        </nav>
        <h1 className="max-w-4xl text-balance text-3xl font-bold text-white sm:text-4xl md:text-5xl">{title}</h1>
        {subtitle ? <p className="mt-3 max-w-3xl text-base leading-relaxed text-white/85">{subtitle}</p> : null}
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 text-background">
        <svg viewBox="0 0 1440 120" preserveAspectRatio="none" className="h-[80px] w-full fill-current md:h-[100px]">
          <path d="M0,32L80,48C160,64,320,96,480,101.3C640,107,800,85,960,69.3C1120,53,1280,43,1360,37.3L1440,32L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z" />
        </svg>
      </div>
    </section>
  )
}
