"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { FormEvent, useState } from "react"
import { signInWithEmailAndPassword, signOut } from "firebase/auth"
import { getFirebaseClientAuth } from "@/lib/firebase/client"

type AdminLoginFormProps = {
  nextPath: string
}

export function AdminLoginForm({ nextPath }: AdminLoginFormProps) {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const auth = getFirebaseClientAuth()
      const credentials = await signInWithEmailAndPassword(auth, email.trim(), password)
      const idToken = await credentials.user.getIdToken(true)

      const response = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      })

      const payload = (await response.json().catch(() => null)) as { error?: string } | null

      if (!response.ok) {
        throw new Error(payload?.error || "Unable to sign in.")
      }

      await signOut(auth)
      router.replace(nextPath)
      router.refresh()
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to sign in.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-4 py-10">
      <section className="w-full rounded-xl border border-border bg-card p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-card-foreground">Admin Sign In</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in with an allowlisted admin email to manage website content.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="admin-email" className="text-sm font-medium text-card-foreground">
              Email
            </label>
            <input
              id="admin-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div>
            <label htmlFor="admin-password" className="text-sm font-medium text-card-foreground">
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              required
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          {error ? (
            <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Signing in..." : "Sign in to Admin"}
          </button>
        </form>

        <p className="mt-4 text-xs text-muted-foreground">
          If your account is not allowlisted, contact the district website administrator.
        </p>

        <Link href="/" className="mt-4 inline-flex text-sm font-medium text-primary hover:underline">
          Back to website
        </Link>
      </section>
    </main>
  )
}
