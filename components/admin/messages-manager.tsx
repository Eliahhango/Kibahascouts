"use client"

import { useEffect, useMemo, useState } from "react"

type MessageStatus = "unread" | "read" | "replied"

type ContactMessage = {
  id: string
  name: string
  email: string
  subject: string
  message: string
  ip: string
  userAgent: string
  createdAt: string
  status: MessageStatus
}

type ApiResponse<T> = {
  ok: boolean
  data?: T
  error?: string
}

export function MessagesManager() {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    void loadMessages()
  }, [])

  const selectedMessage = useMemo(() => messages.find((message) => message.id === selectedId) || null, [messages, selectedId])

  async function loadMessages() {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/admin/messages", { method: "GET", cache: "no-store" })
      const payload = (await response.json()) as ApiResponse<ContactMessage[]>
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || "Unable to load messages.")
      }

      const loadedMessages = payload.data || []
      setMessages(loadedMessages)
      if (!selectedId && loadedMessages.length > 0) {
        setSelectedId(loadedMessages[0].id)
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load messages.")
    } finally {
      setIsLoading(false)
    }
  }

  async function updateStatus(status: MessageStatus) {
    if (!selectedMessage) return
    setIsUpdating(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch(`/api/admin/messages/${selectedMessage.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })

      const payload = (await response.json()) as ApiResponse<ContactMessage>
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || "Unable to update status.")
      }

      setSuccess(`Message marked as ${status}.`)
      await loadMessages()
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Unable to update status.")
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <section className="space-y-6">
      {error ? <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p> : null}
      {success ? <p className="rounded-md border border-emerald-300/40 bg-emerald-100/30 px-3 py-2 text-sm text-emerald-700">{success}</p> : null}

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-card-foreground">Inbox</h2>
          {isLoading ? <p className="mt-3 text-sm text-muted-foreground">Loading messages...</p> : null}
          {!isLoading && messages.length === 0 ? <p className="mt-3 text-sm text-muted-foreground">No contact messages yet.</p> : null}

          {!isLoading && messages.length > 0 ? (
            <ul className="mt-3 space-y-2">
              {messages.map((message) => {
                const isSelected = message.id === selectedId
                return (
                  <li key={message.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(message.id)}
                      className={`w-full rounded-lg border px-3 py-3 text-left transition ${
                        isSelected ? "border-primary bg-primary/5" : "border-border bg-background hover:bg-secondary"
                      }`}
                    >
                      <p className="text-sm font-semibold text-foreground">{message.subject || "[NO SUBJECT]"}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{message.name} - {message.email}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {message.createdAt
                          ? new Date(message.createdAt).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "Unknown date"}
                      </p>
                      <span className="mt-2 inline-flex rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground">
                        {message.status}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          ) : null}
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-card-foreground">Message Details</h2>
          {!selectedMessage ? <p className="mt-3 text-sm text-muted-foreground">Select a message to view details.</p> : null}

          {selectedMessage ? (
            <div className="mt-4 space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Name</p>
                  <p className="text-sm font-medium text-card-foreground">{selectedMessage.name || "[UNKNOWN]"}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Email</p>
                  <a href={`mailto:${selectedMessage.email}`} className="text-sm font-medium text-primary hover:underline">
                    {selectedMessage.email}
                  </a>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Status</p>
                  <p className="text-sm font-medium text-card-foreground">{selectedMessage.status}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Received</p>
                  <p className="text-sm font-medium text-card-foreground">
                    {selectedMessage.createdAt
                      ? new Date(selectedMessage.createdAt).toLocaleString("en-GB")
                      : "Unknown"}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Subject</p>
                <p className="text-sm font-semibold text-card-foreground">{selectedMessage.subject || "[NO SUBJECT]"}</p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Message</p>
                <p className="whitespace-pre-wrap rounded-md border border-border bg-background p-3 text-sm text-card-foreground">
                  {selectedMessage.message || "[EMPTY MESSAGE]"}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">IP</p>
                  <p className="text-xs text-muted-foreground break-all">{selectedMessage.ip || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">User Agent</p>
                  <p className="text-xs text-muted-foreground break-all">{selectedMessage.userAgent || "N/A"}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => updateStatus("unread")}
                  className="rounded-md border border-border px-3 py-1.5 text-xs font-semibold text-foreground"
                >
                  Mark Unread
                </button>
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => updateStatus("read")}
                  className="rounded-md border border-border px-3 py-1.5 text-xs font-semibold text-foreground"
                >
                  Mark Read
                </button>
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => updateStatus("replied")}
                  className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground disabled:opacity-70"
                >
                  Mark Replied
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}
