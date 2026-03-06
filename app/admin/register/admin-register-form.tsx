"use client"

import Link from "next/link"
import { FormEvent, useMemo, useState } from "react"
import { createUserWithEmailAndPassword, signOut } from "firebase/auth"
import { adminFetch } from "@/lib/auth/admin-fetch"
import { getFirebaseClientAuth } from "@/lib/firebase/client"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"

type AdminRole = "super_admin" | "content_admin" | "viewer"

type AdminRegisterFormProps = {
  nextPath: string
  defaultEmail?: string
  defaultInviteId?: string
  inviteOnly?: boolean
}

type RegisterPreflightPayload = {
  email: string
  role: AdminRole
  inviteId: string
  onboardingStatus: "invited" | "pending" | "approved" | "revoked" | "deleted"
  registrationRequired: boolean
}

type ApiResponse<T> = {
  ok: boolean
  data?: T
  error?: string
}

const REGISTRATION_NOT_AVAILABLE_MESSAGE = "Registration not available."

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

function mapRegisterError(error: unknown) {
  const code = typeof error === "object" && error && "code" in error ? String(error.code) : ""
  const message = error instanceof Error ? error.message : "Unable to set up admin account."

  if (message.includes(REGISTRATION_NOT_AVAILABLE_MESSAGE)) {
    return REGISTRATION_NOT_AVAILABLE_MESSAGE
  }

  if (message.includes("Invitation link is required") || message.includes("invalid or expired")) {
    return message
  }

  if (message.includes("pending super admin approval")) {
    return "Account setup is complete and pending super admin approval."
  }

  if (message.includes("disabled")) {
    return REGISTRATION_NOT_AVAILABLE_MESSAGE
  }

  if (code === "auth/email-already-in-use") {
    return "Registration already completed. Please sign in."
  }

  if (code === "auth/weak-password") {
    return "Password is too weak. Use at least 8 characters."
  }

  if (code === "auth/operation-not-allowed") {
    return "Email/password sign-in is not enabled in Firebase Authentication."
  }

  if (code === "auth/invalid-email") {
    return "Please enter a valid email address."
  }

  return message || "Unable to set up admin account."
}

async function parseApiResponse<T>(response: Response) {
  const payload = (await response.json().catch(() => null)) as ApiResponse<T> | null
  return {
    payload,
    error: payload?.error || "Unable to complete request.",
  }
}

export function AdminRegisterForm({
  nextPath,
  defaultEmail = "",
  defaultInviteId = "",
  inviteOnly = true,
}: AdminRegisterFormProps) {
  const initialEmail = useMemo(() => defaultEmail.trim().toLowerCase(), [defaultEmail])
  const initialInviteId = useMemo(() => defaultInviteId?.trim() || "", [defaultInviteId])
  const [email, setEmail] = useState(initialEmail)
  const [eligibleEmail, setEligibleEmail] = useState("")
  const [inviteId, setInviteId] = useState(initialInviteId)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [eligibilityStatus, setEligibilityStatus] = useState<"idle" | "checking" | "approved" | "rejected">("idle")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const passwordStrength = useMemo(() => getPasswordStrength(password), [password])

  async function checkEligibility(normalizedEmail: string, currentInviteId: string) {
    const response = await adminFetch("/api/admin/register/preflight", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: normalizedEmail, inviteId: currentInviteId || undefined }),
    })

    const { payload, error: message } = await parseApiResponse<RegisterPreflightPayload>(response)
    if (!response.ok || !payload?.ok || !payload.data) {
      throw new Error(message)
    }

    return payload.data
  }

  async function handleCheckInvitation() {
    setError(null)
    setInfo(null)

    const normalizedEmail = email.trim().toLowerCase()
    if (!isValidEmail(normalizedEmail)) {
      setError("Please enter a valid email address.")
      return
    }

    setEligibilityStatus("checking")

    try {
      const preflight = await checkEligibility(normalizedEmail, inviteId)
      setInviteId(preflight.inviteId || inviteId)

      if (!preflight.registrationRequired) {
        setEligibilityStatus("rejected")
        if (preflight.onboardingStatus === "pending" || preflight.onboardingStatus === "invited") {
          setInfo("Account setup is complete and pending super admin approval.")
          return
        }

        setInfo("Registration already completed for this account. Please sign in.")
        return
      }

      setEligibleEmail(normalizedEmail)
      setEligibilityStatus("approved")
      setInfo("Invitation verified. Set your password to continue.")
    } catch (checkError) {
      setEligibilityStatus("rejected")
      setError(mapRegisterError(checkError))
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setInfo(null)

    const normalizedEmail = email.trim().toLowerCase()
    if (eligibilityStatus !== "approved" || eligibleEmail !== normalizedEmail || !inviteId) {
      setError(REGISTRATION_NOT_AVAILABLE_MESSAGE)
      return
    }

    if (!isValidEmail(normalizedEmail)) {
      setError("Please enter a valid email address.")
      return
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.")
      return
    }

    if (password !== confirmPassword) {
      setError("Password confirmation does not match.")
      return
    }

    setIsSubmitting(true)

    try {
      const auth = getFirebaseClientAuth()
      const credentials = await createUserWithEmailAndPassword(auth, normalizedEmail, password)
      const idToken = await credentials.user.getIdToken(true)

      const response = await adminFetch("/api/admin/register/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken, inviteId }),
      })
      const { payload, error: message } = await parseApiResponse<unknown>(response)

      if (!response.ok || !payload?.ok) {
        throw new Error(message)
      }

      await signOut(auth).catch(() => null)
      const loginPath = `/admin/login?next=${encodeURIComponent(nextPath)}&email=${encodeURIComponent(normalizedEmail)}`
      window.location.assign(loginPath)
    } catch (submitError) {
      setError(mapRegisterError(submitError))
    } finally {
      setIsSubmitting(false)
    }
  }

  const normalizedEmail = email.trim().toLowerCase()
  const loginHref = isValidEmail(normalizedEmail)
    ? `/admin/login?next=${encodeURIComponent(nextPath)}&email=${encodeURIComponent(normalizedEmail)}`
    : `/admin/login?next=${encodeURIComponent(nextPath)}`

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-4 py-10">
      <section className="w-full rounded-xl border border-border bg-card p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-card-foreground">Admin Account Setup</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {inviteOnly
            ? "Enter your invited admin email first. If eligible, you can set your password and continue."
            : "Enter an allowlisted admin email, set your password once, then use the normal admin sign-in page."}
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="admin-register-email" className="text-sm font-medium text-card-foreground">
              Admin Email
            </label>
            <input
              id="admin-register-email"
              type="email"
              autoComplete="email"
              autoFocus
              required
              value={email}
              onChange={(event) => {
                const nextEmail = event.target.value
                setEmail(nextEmail)

                const normalizedNext = nextEmail.trim().toLowerCase()
                if (eligibleEmail && normalizedNext !== eligibleEmail) {
                  setEligibleEmail("")
                  setEligibilityStatus("idle")
                  setInviteId(initialInviteId)
                  setPassword("")
                  setConfirmPassword("")
                }
              }}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          {eligibilityStatus === "approved" ? (
            <>
              <div>
                <label htmlFor="admin-register-password" className="text-sm font-medium text-card-foreground">
                  Password
                </label>
                <input
                  id="admin-register-password"
                  type="password"
                  autoComplete="new-password"
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
              </div>

              <div>
                <label htmlFor="admin-register-confirm-password" className="text-sm font-medium text-card-foreground">
                  Confirm Password
                </label>
                <input
                  id="admin-register-confirm-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            </>
          ) : null}

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

          {eligibilityStatus === "approved" ? (
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? (
                <>
                  <Spinner size="sm" className="mr-1.5" />
                  Setting up account...
                </>
              ) : (
                "Set Password and Continue"
              )}
            </Button>
          ) : (
            <Button type="button" disabled={eligibilityStatus === "checking"} onClick={() => void handleCheckInvitation()} className="w-full">
              {eligibilityStatus === "checking" ? (
                <>
                  <Spinner size="sm" className="mr-1.5" />
                  Verifying invitation...
                </>
              ) : (
                "Continue"
              )}
            </Button>
          )}
        </form>

        <p className="mt-4 text-xs text-muted-foreground">
          Already set up?{" "}
          <Link href={loginHref} className="font-medium text-primary hover:underline">
            Sign in here
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
