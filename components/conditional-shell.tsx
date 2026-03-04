"use client"

import type { ReactNode } from "react"
import { usePathname } from "next/navigation"

type ConditionalShellProps = {
  children: ReactNode
}

export function ConditionalShell({ children }: ConditionalShellProps) {
  const pathname = usePathname() || ""

  if (pathname.startsWith("/admin")) {
    return null
  }

  return <>{children}</>
}
