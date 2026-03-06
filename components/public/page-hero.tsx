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
    <section className={cn("border-b border-tsa-green-mid bg-tsa-green-deep", className)}>
      <div className="mx-auto flex min-h-[200px] max-w-7xl flex-col justify-center px-4 py-8 sm:px-6 lg:px-8">
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
        <h1 className="text-balance text-4xl font-bold text-white md:text-5xl">{title}</h1>
        {subtitle ? <p className="mt-3 max-w-3xl text-base leading-relaxed text-white/85">{subtitle}</p> : null}
      </div>
    </section>
  )
}
