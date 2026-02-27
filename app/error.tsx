"use client"

import Link from "next/link"
import { useEffect } from "react"

export default function ErrorPage({
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
    <main className="mx-auto flex min-h-[60vh] w-full max-w-3xl items-center justify-center px-4 py-16">
      <section className="w-full rounded-xl border border-border bg-card p-6 text-center shadow-sm md:p-8">
        <h1 className="text-2xl font-bold text-card-foreground md:text-3xl">Something went wrong</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          The page could not be loaded. Please try again, or return to the home page.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => reset()}
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            Try again
          </button>
          <Link href="/" className="rounded-md border border-border px-4 py-2 text-sm font-semibold text-foreground">
            Back to home
          </Link>
        </div>

        {error?.digest ? <p className="mt-4 text-xs text-muted-foreground">Reference: {error.digest}</p> : null}
      </section>
    </main>
  )
}
