"use client"

import { useEffect, useMemo, useState } from "react"

type AdminRole = "super_admin" | "content_admin" | "viewer"

type AdminDashboardGreetingProps = {
  email: string
  role: AdminRole
}

function getGreetingByHour(hour: number) {
  if (hour < 12) {
    return "Good morning"
  }

  if (hour < 18) {
    return "Good afternoon"
  }

  return "Good evening"
}

function getRoleDescription(role: AdminRole) {
  if (role === "super_admin") {
    return "Full system access"
  }

  if (role === "content_admin") {
    return "Content management access"
  }

  return "Read-only access"
}

export function AdminDashboardGreeting({ email, role }: AdminDashboardGreetingProps) {
  const [hour, setHour] = useState<number | null>(null)

  useEffect(() => {
    const updateHour = () => setHour(new Date().getHours())
    updateHour()

    const interval = window.setInterval(updateHour, 60_000)
    return () => window.clearInterval(interval)
  }, [])

  const firstPart = useMemo(() => {
    const normalized = email.trim().toLowerCase()
    const [left] = normalized.split("@")
    return left || "admin"
  }, [email])

  return (
    <div className="mt-2">
      {hour === null ? (
        <p className="text-sm text-muted-foreground">Welcome back, {firstPart}.</p>
      ) : (
        <p className="text-sm text-muted-foreground">
          {getGreetingByHour(hour)}, <span className="font-semibold text-foreground">{firstPart}</span>.
        </p>
      )}
      <p className="mt-0.5 text-xs text-muted-foreground">{getRoleDescription(role)}</p>
    </div>
  )
}
