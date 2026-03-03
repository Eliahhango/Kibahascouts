import type { ReactNode } from "react"
import { AdminNav } from "@/components/admin/admin-nav"
import { AdminSessionMonitor } from "@/components/admin/admin-session-monitor"

type AdminLayoutProps = {
  children: ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-secondary/40">
      <AdminSessionMonitor />
      <AdminNav />
      {children}
    </div>
  )
}
