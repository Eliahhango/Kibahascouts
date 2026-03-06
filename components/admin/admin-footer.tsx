import Link from "next/link"

export function AdminFooter() {
  return (
    <footer className="border-t border-border bg-[#f5f6f2]">
      <div className="mx-auto grid min-h-12 w-full items-center gap-2 px-4 py-2 text-xs text-muted-foreground sm:px-6 lg:grid-cols-[1fr_auto_1fr] lg:px-8">
        <p className="text-left">Kibaha Scouts CMS · v1.0 · © 2025 Tanzania Scouts Association</p>
        <p className="text-left lg:text-center">All data is stored securely on Tanzanian servers 🔒</p>
        <div className="flex items-center gap-4 lg:justify-end">
          <Link href="/contact" className="hover:text-foreground">
            Help
          </Link>
          <Link href="/contact" className="hover:text-foreground">
            Report a Bug
          </Link>
          <Link href="/newsroom" className="hover:text-foreground">
            Changelog
          </Link>
        </div>
      </div>
    </footer>
  )
}
