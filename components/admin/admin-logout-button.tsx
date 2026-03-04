"use client"

import { useState } from "react"
import { signOut } from "firebase/auth"
import { adminFetch } from "@/lib/auth/admin-fetch"
import { getFirebaseClientAuth } from "@/lib/firebase/client"
import { Button } from "@/components/ui/button"

export function AdminLogoutButton() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleLogout() {
    setIsSubmitting(true)

    try {
      await adminFetch("/api/admin/logout", {
        method: "POST",
      })
    } finally {
      try {
        await signOut(getFirebaseClientAuth())
      } catch {
        // Do not block logout redirect if client auth state is unavailable.
      }

      window.location.assign("/admin/login")
      setIsSubmitting(false)
    }
  }

  return (
    <Button type="button" variant="outline" onClick={handleLogout} disabled={isSubmitting}>
      {isSubmitting ? "Signing out..." : "Sign out"}
    </Button>
  )
}
