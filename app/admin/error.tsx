"use client"

import { useEffect } from "react"
import Link from "next/link"
import { AlertTriangle } from "lucide-react"

export default function AdminErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      console.error(error)
    }
  }, [error])

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0d1f17] px-4 py-16">
      <section className="w-full max-w-2xl rounded-2xl border border-white/10 bg-[#0f1923] p-8 text-center shadow-2xl">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#c9910a]/20 text-[#c9910a]">
          <AlertTriangle className="h-6 w-6" />
        </span>
        <h1 className="mt-4 text-3xl font-bold text-white">Admin panel error</h1>
        <p className="mt-3 text-sm text-white/70">
          An unexpected issue occurred while loading this admin section.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="btn-secondary border-[#c9910a] text-[#c9910a] hover:bg-[#c9910a] hover:text-white"
          >
            Try Again
          </button>
          <Link href="/admin" className="btn-primary">
            Back to Dashboard
          </Link>
        </div>

        {error?.digest ? <p className="mt-5 text-xs text-white/50">Reference: {error.digest}</p> : null}
      </section>
    </main>
  )
}
