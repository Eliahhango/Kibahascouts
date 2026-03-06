import Link from "next/link"
import { Compass } from "lucide-react"

export default function AdminNotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0d1f17] px-4 py-16">
      <section className="w-full max-w-2xl rounded-2xl border border-white/10 bg-[#0f1923] p-8 text-center shadow-2xl">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#c9910a]/20 text-[#c9910a]">
          <Compass className="h-6 w-6" />
        </span>
        <h1 className="mt-4 text-3xl font-bold text-white">Page not found in admin panel</h1>
        <p className="mt-3 text-sm text-white/70">
          The admin route you requested does not exist or is no longer available.
        </p>

        <div className="mt-6">
          <Link href="/admin" className="btn-primary">
            Back to Dashboard
          </Link>
        </div>
      </section>
    </main>
  )
}
