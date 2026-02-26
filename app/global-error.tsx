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
          <section className="relative w-full max-w-3xl rounded-2xl border border-tsa-green-mid bg-tsa-green-mid p-6 text-center shadow-lg md:p-10">
            <span className="inline-flex items-center gap-2 rounded-full border border-tsa-green-light bg-tsa-green-light px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-primary-foreground">
              <AlertTriangle className="h-3.5 w-3.5" />
              Error
            </span>

            <h1 className="mt-5 text-balance text-3xl font-bold leading-tight md:text-5xl">
              Something went wrong
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-primary-foreground md:text-lg">
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
                className="inline-flex items-center gap-2 rounded-md border border-tsa-green-light bg-tsa-green-light px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-[#9d85e8]"
              >
                <Home className="h-4 w-4" />
                Back to Home
              </Link>
            </div>

            {error?.digest ? (
              <p className="mt-6 text-xs text-primary-foreground">Reference: {error.digest}</p>
            ) : null}
          </section>
        </main>
      </body>
    </html>
  )
}
