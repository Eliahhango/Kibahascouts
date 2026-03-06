import Link from "next/link"
import type { ReactNode } from "react"
import { ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

type SectionShellProps = {
  id?: string
  eyebrow?: string
  title: string
  subtitle?: string
  viewAllHref?: string
  viewAllLabel?: string
  viewAllClassName?: string
  tone?: "background" | "white" | "tinted"
  className?: string
  children: ReactNode
}

export function SectionShell({
  id,
  eyebrow,
  title,
  subtitle,
  viewAllHref,
  viewAllLabel = "View all",
  viewAllClassName,
  tone = "background",
  className,
  children,
}: SectionShellProps) {
  return (
    <section
      id={id}
      className={cn(
        "py-12 md:py-16",
        tone === "background" && "bg-background",
        tone === "white" && "bg-white",
        tone === "tinted" && "bg-tsa-green-deep/5",
        className,
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div className="max-w-3xl">
            {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
            <h2 className="section-title mt-2">{title}</h2>
            {subtitle ? <p className="mt-2 text-base leading-relaxed text-muted-foreground">{subtitle}</p> : null}
          </div>
          {viewAllHref ? (
            <Link href={viewAllHref} className={cn("btn-ghost inline-flex items-center gap-1", viewAllClassName)}>
              {viewAllLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : null}
        </header>

        {children}
      </div>
    </section>
  )
}
