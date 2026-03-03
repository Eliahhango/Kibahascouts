import { LoaderCircle } from "lucide-react"

export default function AdminLoading() {
  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-6xl items-center justify-center px-4 py-10">
      <div className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-3 text-sm text-muted-foreground shadow-sm">
        <LoaderCircle className="h-4 w-4 animate-spin" />
        Verifying admin access...
      </div>
    </main>
  )
}
