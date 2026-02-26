import type { ReactNode } from "react"
import Link from "next/link"

type AdminLayoutProps = {
  children: ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-secondary/40">
      <header className="border-b border-border bg-background/95">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-2 px-4 py-3">
          <Link href="/admin" className="text-sm font-semibold text-foreground hover:text-primary">
            Admin Dashboard
          </Link>
          <span className="text-muted-foreground">/</span>
          <Link href="/admin/news" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            News
          </Link>
          <span className="text-muted-foreground">/</span>
          <Link href="/admin/events" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            Events
          </Link>
          <span className="text-muted-foreground">/</span>
          <Link href="/admin/resources" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            Resources
          </Link>
          <span className="ml-auto" />
          <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            Public Website
          </Link>
        </div>
      </header>
      {children}
    </div>
  )
}
