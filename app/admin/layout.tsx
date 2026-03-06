import type { ReactNode } from "react"
import { AdminFooter } from "@/components/admin/admin-footer"
import { AdminNav } from "@/components/admin/admin-nav"
import { AdminSessionMonitor } from "@/components/admin/admin-session-monitor"

type AdminLayoutProps = {
  children: ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="notranslate min-h-screen bg-[#f3f5f7]">
      <AdminSessionMonitor />
      <AdminNav />
      <div className="flex min-h-screen flex-col pb-[calc(4rem+env(safe-area-inset-bottom))] pt-14 lg:pb-0 lg:pl-[var(--admin-sidebar-width)]">
        <div className="flex-1">{children}</div>
        <AdminFooter />
      </div>
    </div>
  )
}
