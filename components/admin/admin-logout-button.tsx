"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { signOut } from "firebase/auth"
import { adminFetch } from "@/lib/auth/admin-fetch"
import { getFirebaseClientAuth } from "@/lib/firebase/client"
import { Button } from "@/components/ui/button"

export function AdminLogoutButton() {
  const router = useRouter()
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

      router.replace("/admin/login")
      router.refresh()
      setIsSubmitting(false)
    }
  }

  return (
    <Button type="button" variant="outline" onClick={handleLogout} disabled={isSubmitting}>
      {isSubmitting ? "Signing out..." : "Sign out"}
    </Button>
  )
}
