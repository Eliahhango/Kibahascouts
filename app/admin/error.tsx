"use client"

import { useEffect } from "react"
import Link from "next/link"
import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AdminErrorPage({
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
        <span className="inline-flex items-center gap-2 rounded-full border border-destructive/30 bg-destructive/10 px-3 py-1 text-xs font-semibold text-destructive">
          <AlertTriangle className="h-3.5 w-3.5" />
          Admin Error
        </span>
        <h1 className="mt-4 text-2xl font-bold text-card-foreground">Unable to load admin section</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Try again, or return to the admin dashboard.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <Button type="button" onClick={() => reset()}>
            Try again
          </Button>
          <Button asChild type="button" variant="outline">
            <Link href="/admin">Back to Admin Home</Link>
          </Button>
        </div>

        {error?.digest ? <p className="mt-4 text-xs text-muted-foreground">Reference: {error.digest}</p> : null}
      </section>
    </main>
  )
}
