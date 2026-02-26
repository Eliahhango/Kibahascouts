import Image from "next/image"
import { siteConfig } from "@/lib/site-config"

export function SiteFooter() {
  const { branding } = siteConfig

  return (
    <footer className="mt-14 bg-tsa-green-deep text-primary-foreground" role="contentinfo">
      <div className="mx-auto max-w-7xl px-4 py-10 md:py-12">
        <div className="mx-auto max-w-6xl rounded-md border border-tsa-green-mid bg-[#3f2374] px-4 py-6 sm:px-8 sm:py-8">
          <div className="grid items-center gap-4 sm:grid-cols-[auto_1fr]">
            <div className="relative mx-auto h-24 w-24 sm:h-28 sm:w-28 md:h-36 md:w-36">
              <Image src={branding.scoutBadge} alt="" fill sizes="144px" className="object-contain" />
            </div>

            <div className="text-center sm:text-left">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-foreground sm:text-sm">
                TANZANIA SCOUTS ASSOCIATION
              </p>
              <p className="mt-1 text-4xl font-extrabold tracking-[0.14em] text-primary-foreground sm:text-6xl md:text-7xl">
                SCOUTS
              </p>
              <p className="mt-1 text-xl font-medium text-primary-foreground sm:text-3xl">
                Creating a Better World
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
