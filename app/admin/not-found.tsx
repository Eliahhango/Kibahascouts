import Link from "next/link"
import { SearchX } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AdminNotFoundPage() {
  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-3xl items-center justify-center px-4 py-16">
      <section className="w-full rounded-xl border border-border bg-card p-6 text-center shadow-sm md:p-8">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1 text-xs font-semibold text-muted-foreground">
          <SearchX className="h-3.5 w-3.5" />
          Admin 404
        </span>
        <h1 className="mt-4 text-2xl font-bold text-card-foreground">Admin page not found</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          The requested admin route does not exist or is no longer available.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <Button asChild>
            <Link href="/admin">Go to Admin Dashboard</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/">Back to Website</Link>
          </Button>
        </div>
      </section>
    </main>
  )
}
