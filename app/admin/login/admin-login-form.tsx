"use client"

import Image from "next/image"
import Link from "next/link"
import { FormEvent, useEffect, useMemo, useState } from "react"
import { signInWithEmailAndPassword } from "firebase/auth"
import { Shield } from "lucide-react"
import { adminFetch } from "@/lib/auth/admin-fetch"
import { getFirebaseClientAuth } from "@/lib/firebase/client"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"

type AdminLoginFormProps = {
  nextPath: string
  defaultEmail?: string
}

type ApiResponse = {
  ok: boolean
  error?: string
  retryAfterSeconds?: number
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function getPasswordStrength(password: string) {
  let score = 0

  if (password.length >= 8) score += 1
  if (password.length >= 12) score += 1
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1
  if (/\d/.test(password) && /[^a-zA-Z0-9]/.test(password)) score += 1

  if (score <= 1) {
    return { label: "Weak", percent: 25, tone: "bg-destructive" }
  }

  if (score === 2) {
    return { label: "Fair", percent: 50, tone: "bg-amber-500" }
  }

  if (score === 3) {
    return { label: "Good", percent: 75, tone: "bg-tsa-green-mid" }
  }

  return { label: "Strong", percent: 100, tone: "bg-emerald-500" }
}

function mapSignInError(error: unknown) {
  const code = typeof error === "object" && error && "code" in error ? String(error.code) : ""
  const message = error instanceof Error ? error.message : "Unable to sign in."

  if (message.includes("Email not found in admin allowlist.")) {
    return "Email not found in admin allowlist."
  }

  if (message.includes("awaiting approval")) {
    return "Your admin account is awaiting super admin approval."
  }

  if (message.includes("revoked")) {
    return "Your admin access has been revoked. Contact a super admin."
  }

  if (message.includes("email changed")) {
    return "Your account email changed. Request a fresh invitation."
  }

  if (message.includes("identity mismatch")) {
    return "Admin identity mismatch detected. Contact a super admin."
  }

  if (message.includes("Too many login attempts")) {
    return message
  }

  if (
    code === "auth/invalid-credential" ||
    code === "auth/wrong-password" ||
    code === "auth/user-not-found"
  ) {
    return "Incorrect password."
  }

  if (code === "auth/too-many-requests") {
    return "Too many login attempts - try again in 15 minutes."
  }

  if (code === "auth/invalid-email") {
    return "Please enter a valid email address."
  }

  return message || "Unable to sign in."
}

function mapResetError(error: unknown) {
  const code = typeof error === "object" && error && "code" in error ? String(error.code) : ""
  const message = error instanceof Error ? error.message : "Unable to send password reset email."

  if (message.includes("Email not found in admin allowlist.")) {
    return "Email not found in admin allowlist."
  }

  if (message.includes("No password is set for this email yet")) {
    return "No password is set for this email yet. Use \"Set your password first\" or ask a super admin for help."
  }

  if (message.includes("service is not configured")) {
    return "Password reset email service is not configured. Set RESEND_API_KEY and RESEND_FROM_EMAIL in Vercel."
  }

  if (message.includes("account is disabled")) {
    return "This account is disabled. Contact a super admin."
  }

  if (message.includes("awaiting approval")) {
    return "Your admin account is awaiting super admin approval."
  }

  if (message.includes("revoked")) {
    return "Your admin access has been revoked. Contact a super admin."
  }

  if (code === "auth/invalid-email") {
    return "Please enter a valid email address."
  }

  if (code === "auth/user-not-found") {
    return "No password is set for this email yet. Use \"Set your password first\" or ask a super admin for help."
  }

  if (code === "auth/too-many-requests") {
    return "Too many requests. Please wait a few minutes before requesting another reset email."
  }

  return message || "Unable to send password reset email."
}

async function parseApiResponse<T>(response: Response, fallbackError: string) {
  const payload = (await response.json().catch(() => null)) as (ApiResponse & { data?: T }) | null
  return {
    payload,
    error: payload?.error || fallbackError,
  }
}

export function AdminLoginForm({ nextPath, defaultEmail = "" }: AdminLoginFormProps) {
  const initialEmail = useMemo(() => defaultEmail.trim().toLowerCase(), [defaultEmail])
  const [email, setEmail] = useState(initialEmail)
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isResettingPassword, setIsResettingPassword] = useState(false)
  const [submitMessage, setSubmitMessage] = useState("Verifying credentials...")
  const passwordStrength = useMemo(() => getPasswordStrength(password), [password])
  const normalizedInputEmail = email.trim().toLowerCase()
  const registerHref = isValidEmail(normalizedInputEmail)
    ? `/admin/register?next=${encodeURIComponent(nextPath)}&email=${encodeURIComponent(normalizedInputEmail)}`
    : `/admin/register?next=${encodeURIComponent(nextPath)}`

  useEffect(() => {
    if (!isSubmitting) {
      setSubmitMessage("Verifying credentials...")
      return
    }

    setSubmitMessage("Verifying credentials...")
    const phaseTimer = window.setTimeout(() => {
      setSubmitMessage("Starting secure session...")
    }, 1000)

    return () => window.clearTimeout(phaseTimer)
  }, [isSubmitting])

  async function preflightCheck(normalizedEmail: string) {
    const response = await adminFetch("/api/admin/session/preflight", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: normalizedEmail, action: "check" }),
    })

    const { payload, error: message } = await parseApiResponse(response, "Unable to sign in.")
    if (!response.ok || !payload?.ok) {
      throw new Error(message)
    }
  }

  async function recordFailedAttempt(normalizedEmail: string, reason: string) {
    const response = await adminFetch("/api/admin/session/preflight", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: normalizedEmail, action: "failure", reason }),
    })
    const { payload, error: message } = await parseApiResponse(response, "Unable to sign in.")

    if (response.status === 429 || (payload && payload.error)) {
      return message
    }

    return null
  }

  async function clearFailedAttempts(normalizedEmail: string) {
    await adminFetch("/api/admin/session/preflight", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: normalizedEmail, action: "success" }),
    }).catch(() => null)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setInfo(null)

    const normalizedEmail = email.trim().toLowerCase()
    if (!isValidEmail(normalizedEmail)) {
      setError("Please enter a valid email address.")
      return
    }

    if (!password) {
      setError("Please enter your password.")
      return
    }

    setIsSubmitting(true)

    try {
      await preflightCheck(normalizedEmail)

      const auth = getFirebaseClientAuth()
      const credentials = await signInWithEmailAndPassword(auth, normalizedEmail, password)
      const idToken = await credentials.user.getIdToken(true)

      const response = await adminFetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken, mode: "login" }),
      })
      const { payload, error: message } = await parseApiResponse(response, "Unable to sign in.")

      if (!response.ok || !payload?.ok) {
        throw new Error(message)
      }

      await clearFailedAttempts(normalizedEmail)
      window.location.assign(nextPath)
    } catch (submitError) {
      const uiError = mapSignInError(submitError)
      const reasonCode = uiError.toLowerCase().includes("allowlist") ? "email_not_allowlisted" : "incorrect_password"
      const lockMessage = uiError.toLowerCase().includes("too many")
        ? null
        : await recordFailedAttempt(normalizedEmail, reasonCode)
      setError(lockMessage || uiError)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleForgotPassword() {
    setError(null)
    setInfo(null)

    const normalizedEmail = email.trim().toLowerCase()
    if (!isValidEmail(normalizedEmail)) {
      setError("Enter your admin email first to receive a reset link.")
      return
    }

    setIsResettingPassword(true)
    try {
      const response = await adminFetch("/api/admin/password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail }),
      })
      const { payload, error: message } = await parseApiResponse<{ provider: string }>(
        response,
        "Unable to send password reset email.",
      )

      if (!response.ok || !payload?.ok) {
        throw new Error(message)
      }

      setInfo("Password reset email sent. Check your inbox and spam folder, then follow the secure link to set a new password.")
    } catch (resetError) {
      setError(mapResetError(resetError))
    } finally {
      setIsResettingPassword(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-tsa-green-deep to-[#11251d] px-4 py-10">
      <section className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl">
        <div className="mb-4 flex justify-center">
          <div className="relative h-16 w-16 overflow-hidden rounded-full ring-2 ring-tsa-gold/70">
            <Image src="/images/branding/kibaha-scouts-logo.jpg" alt="Kibaha Scouts logo" fill sizes="64px" className="object-cover" priority />
          </div>
        </div>

        <h1 className="flex items-center justify-center gap-2 text-2xl font-bold text-card-foreground">
          <Shield className="h-5 w-5 text-tsa-green-deep" />
          Admin Sign In
        </h1>
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
              autoFocus
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
            {password ? (
              <div className="mt-2">
                <div className="h-1.5 w-full rounded-full bg-secondary">
                  <div
                    className={`h-1.5 rounded-full transition-all ${passwordStrength.tone}`}
                    style={{ width: `${passwordStrength.percent}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Password strength: {passwordStrength.label}</p>
              </div>
            ) : null}
            <button
              type="button"
              onClick={() => void handleForgotPassword()}
              disabled={isResettingPassword}
              className="mt-2 text-xs font-medium text-primary hover:underline disabled:opacity-70"
            >
              {isResettingPassword ? "Sending reset email..." : "Forgot password?"}
            </button>
          </div>

          {error ? (
            <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          ) : null}

          {info ? (
            <p className="rounded-md border border-emerald-300/40 bg-emerald-100/30 px-3 py-2 text-sm text-emerald-700">
              {info}
            </p>
          ) : null}

          <Button type="submit" disabled={isSubmitting} className="relative w-full overflow-hidden">
            {isSubmitting ? (
              <>
                <Spinner size="sm" className="mr-2" />
                {submitMessage}
                <span className="pointer-events-none absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              </>
            ) : (
              "Sign in to Admin"
            )}
          </Button>
        </form>

        {isSubmitting ? (
          <p className="mt-3 text-center text-xs text-muted-foreground">
            {submitMessage}
          </p>
        ) : null}

        <p className="mt-4 text-xs text-muted-foreground">
          If your account is not allowlisted, contact the district website administrator.
        </p>

        <p className="mt-2 text-xs text-muted-foreground">
          First-time invited admin?{" "}
          <Link href={registerHref} className="font-medium text-primary hover:underline">
            Set your password first
          </Link>
          .
        </p>

        <Link href="/" className="mt-4 inline-flex text-sm font-medium text-primary hover:underline">
          Back to website
        </Link>
      </section>
    </main>
  )
}
