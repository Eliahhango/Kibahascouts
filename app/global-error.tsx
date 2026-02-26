"use client"

import Link from "next/link"
import { AlertTriangle, Home, RefreshCw } from "lucide-react"
import { useEffect } from "react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html lang="en">
      <body className="min-h-screen bg-tsa-green-deep text-primary-foreground">
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-16">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(142,115,216,0.35),transparent_35%),radial-gradient(circle_at_85%_0%,rgba(94,61,196,0.3),transparent_40%)]" />

          <section className="relative w-full max-w-3xl rounded-2xl border border-primary-foreground/20 bg-primary-foreground/10 p-6 text-center shadow-2xl md:p-10">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-primary-foreground/90">
              <AlertTriangle className="h-3.5 w-3.5" />
              Error
            </span>

            <h1 className="mt-5 text-balance text-3xl font-bold leading-tight md:text-5xl">
              Something went wrong
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-primary-foreground/85 md:text-lg">
              An unexpected error occurred while loading this page. Please try again.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => reset()}
                className="inline-flex items-center gap-2 rounded-md bg-tsa-gold px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-tsa-gold-light"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </button>

              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-md border border-primary-foreground/25 bg-primary-foreground/10 px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-foreground/15"
              >
                <Home className="h-4 w-4" />
                Back to Home
              </Link>
            </div>

            {error?.digest ? (
              <p className="mt-6 text-xs text-primary-foreground/70">Reference: {error.digest}</p>
            ) : null}
          </section>
        </main>
      </body>
    </html>
  )
}
