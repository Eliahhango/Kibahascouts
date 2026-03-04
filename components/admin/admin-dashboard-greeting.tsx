"use client"

import { useEffect, useMemo, useState } from "react"

type AdminDashboardGreetingProps = {
  email: string
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

export function AdminDashboardGreeting({ email }: AdminDashboardGreetingProps) {
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

  if (hour === null) {
    return <p className="mt-2 text-sm text-muted-foreground">Welcome back, {firstPart}.</p>
  }

  return (
    <p className="mt-2 text-sm text-muted-foreground">
      {getGreetingByHour(hour)}, <span className="font-semibold text-foreground">{firstPart}</span>.
    </p>
  )
}
