"use client"

import { type FormEvent, useState } from "react"
import { CheckCircle2, Send } from "lucide-react"

type MembershipRole = "youth" | "volunteer"

type MembershipFormProps = {
  defaultRole?: MembershipRole
  showRoleSelector?: boolean
}

type MembershipFormState = {
  fullName: string
  age: string
  parentName: string
  parentPhone: string
  parentEmail: string
  ward: string
  unitType: string
  message: string
  honeypot: string
}

const initialState: MembershipFormState = {
  fullName: "",
  age: "",
  parentName: "",
  parentPhone: "",
  parentEmail: "",
  ward: "",
  unitType: "",
  message: "",
  honeypot: "",
}

export function MembershipForm({ defaultRole = "youth", showRoleSelector = true }: MembershipFormProps) {
  const [role, setRole] = useState<MembershipRole>(defaultRole)
  const [form, setForm] = useState<MembershipFormState>(initialState)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  function update<K extends keyof MembershipFormState>(key: K, value: MembershipFormState[K]) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch("/api/membership", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, role }),
      })
      const payload = (await response.json().catch(() => null)) as { ok?: boolean; message?: string; error?: string } | null

      if (!response.ok || !payload?.ok) {
        setError(payload?.error || "Submission failed.")
        return
      }

      setSuccess(payload.message || "Application received! We will contact you soon.")
      setForm(initialState)
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="card-shell flex flex-col items-center gap-3 p-8 text-center">
        <CheckCircle2 className="h-12 w-12 text-tsa-green-deep" />
        <h3 className="text-xl font-bold text-foreground">Application Submitted!</h3>
        <p className="text-base text-muted-foreground">{success}</p>
        <button type="button" onClick={() => setSuccess(null)} className="btn-secondary mt-2">
          Submit Another
        </button>
      </div>
    )
  }

  return (
    <div className="card-shell p-6">
      {showRoleSelector ? (
        <div className="mb-6 flex gap-3">
          {(["youth", "volunteer"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRole(value)}
              className={`flex-1 rounded-xl border-2 py-3 text-sm font-semibold transition ${
                role === value
                  ? "border-tsa-green-deep bg-tsa-green-deep text-white"
                  : "border-border text-foreground hover:bg-secondary"
              }`}
            >
              {value === "youth" ? "Join as Youth Member" : "Volunteer as Leader"}
            </button>
          ))}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
        <input
          type="text"
          value={form.honeypot}
          onChange={(event) => update("honeypot", event.target.value)}
          className="hidden"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
        />

        <label className="text-sm md:col-span-2">
          <span className="font-semibold text-foreground">
            Full Name <span className="text-destructive">*</span>
          </span>
          <input
            required
            value={form.fullName}
            onChange={(event) => update("fullName", event.target.value)}
            placeholder="Enter full name"
            className="admin-input mt-1"
          />
        </label>

        {role === "youth" ? (
          <label className="text-sm">
            <span className="font-semibold text-foreground">Age</span>
            <input
              value={form.age}
              onChange={(event) => update("age", event.target.value)}
              placeholder="e.g. 12"
              className="admin-input mt-1"
            />
          </label>
        ) : null}

        <label className="text-sm">
          <span className="font-semibold text-foreground">{role === "youth" ? "Parent / Guardian Name" : "Your Name"}</span>
          <input
            value={form.parentName}
            onChange={(event) => update("parentName", event.target.value)}
            placeholder="Full name"
            className="admin-input mt-1"
          />
        </label>

        <label className="text-sm">
          <span className="font-semibold text-foreground">
            Phone Number <span className="text-destructive">*</span>
          </span>
          <input
            required
            type="tel"
            value={form.parentPhone}
            onChange={(event) => update("parentPhone", event.target.value)}
            placeholder="+255 7XX XXX XXX"
            className="admin-input mt-1"
          />
        </label>

        <label className="text-sm">
          <span className="font-semibold text-foreground">Email (optional)</span>
          <input
            type="email"
            value={form.parentEmail}
            onChange={(event) => update("parentEmail", event.target.value)}
            placeholder="email@example.com"
            className="admin-input mt-1"
          />
        </label>

        <label className="text-sm">
          <span className="font-semibold text-foreground">
            Ward / Area <span className="text-destructive">*</span>
          </span>
          <input
            required
            value={form.ward}
            onChange={(event) => update("ward", event.target.value)}
            placeholder="e.g. Kibaha Urban"
            className="admin-input mt-1"
          />
        </label>

        <label className="text-sm">
          <span className="font-semibold text-foreground">Preferred Section</span>
          <select value={form.unitType} onChange={(event) => update("unitType", event.target.value)} className="admin-input mt-1">
            <option value="">Select section...</option>
            <option value="Kabu">Kabu (Ages 5-10)</option>
            <option value="Junia">Junia (Ages 11-14)</option>
            <option value="Sinia">Sinia (Ages 15-17)</option>
            <option value="Rova">Rova (Ages 18-26)</option>
            {role === "volunteer" ? <option value="Leader">Scout Leader</option> : null}
          </select>
        </label>

        <label className="text-sm md:col-span-2">
          <span className="font-semibold text-foreground">Additional Message (optional)</span>
          <textarea
            rows={3}
            value={form.message}
            onChange={(event) => update("message", event.target.value)}
            placeholder="Any questions or details..."
            className="admin-input mt-1"
          />
        </label>

        {error ? (
          <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive md:col-span-2">
            {error}
          </p>
        ) : null}

        <div className="md:col-span-2">
          <button type="submit" disabled={submitting} className="btn-primary w-full gap-2">
            {submitting ? (
              "Submitting..."
            ) : (
              <>
                <Send className="h-4 w-4" />
                Submit Application
              </>
            )}
          </button>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            We will contact you within 2-3 working days to confirm your registration.
          </p>
        </div>
      </form>
    </div>
  )
}

