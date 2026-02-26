"use client"

import { useState } from "react"

type ContactApiResponse = {
  ok: boolean
  message?: string
  error?: string
  fallbackEmail?: string
}

const initialForm = {
  name: "",
  email: "",
  subject: "",
  message: "",
  website: "",
}

export function ContactForm() {
  const [form, setForm] = useState(initialForm)
  const [submitting, setSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [fallbackEmail, setFallbackEmail] = useState<string | null>(null)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setSubmitting(true)
    setSuccessMessage(null)
    setErrorMessage(null)
    setFallbackEmail(null)

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      })

      const data = (await response.json().catch(() => null)) as ContactApiResponse | null

      if (!response.ok || !data?.ok) {
        setErrorMessage(data?.error ?? "Could not send your message. Please try again.")
        if (data?.fallbackEmail) {
          setFallbackEmail(data.fallbackEmail)
        }
        return
      }

      setSuccessMessage(data.message ?? "Message sent successfully.")
      setForm(initialForm)
    } catch {
      setErrorMessage("Network error. Please retry.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="mt-4 space-y-3" onSubmit={onSubmit} noValidate>
      <div>
        <label htmlFor="contact-name" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Full Name
        </label>
        <input
          id="contact-name"
          name="name"
          type="text"
          required
          value={form.name}
          onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
          className="mt-1 w-full rounded-md border border-input px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label htmlFor="contact-email" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Email Address
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          required
          value={form.email}
          onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
          className="mt-1 w-full rounded-md border border-input px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label htmlFor="contact-subject" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Subject
        </label>
        <input
          id="contact-subject"
          name="subject"
          type="text"
          required
          value={form.subject}
          onChange={(event) => setForm((current) => ({ ...current, subject: event.target.value }))}
          className="mt-1 w-full rounded-md border border-input px-3 py-2 text-sm"
        />
      </div>

      <div className="hidden" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input
          id="website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={form.website}
          onChange={(event) => setForm((current) => ({ ...current, website: event.target.value }))}
        />
      </div>

      <div>
        <label htmlFor="contact-message" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Message
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={5}
          required
          value={form.message}
          onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
          className="mt-1 w-full rounded-md border border-input px-3 py-2 text-sm"
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-md bg-tsa-green-deep px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-tsa-green-mid disabled:cursor-not-allowed disabled:opacity-70"
      >
        {submitting ? "Sending..." : "Send Message"}
      </button>

      <div aria-live="polite" className="space-y-2">
        {successMessage ? (
          <p className="rounded-md border border-green-300 bg-green-50 px-3 py-2 text-sm text-green-800">{successMessage}</p>
        ) : null}

        {errorMessage ? (
          <div className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800">
            <p>{errorMessage}</p>
            {fallbackEmail ? (
              <p className="mt-1">
                Temporary fallback:{" "}
                <a href={`mailto:${fallbackEmail}`} className="font-semibold underline">
                  {fallbackEmail}
                </a>
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
    </form>
  )
}
