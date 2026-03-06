"use client"

import { useEffect, useMemo, useState } from "react"
import { adminFetch } from "@/lib/auth/admin-fetch"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"

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

function getStatusBadgeClass(status: MessageStatus) {
  if (status === "replied") {
    return "bg-emerald-100 text-emerald-700"
  }

  if (status === "read") {
    return "bg-tsa-green-deep/10 text-tsa-green-deep"
  }

  return "bg-amber-100 text-amber-800"
}

export function MessagesManager() {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [updatingMessage, setUpdatingMessage] = useState("Updating message...")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | MessageStatus>("all")

  useEffect(() => {
    void loadMessages()
  }, [])

  const filteredMessages = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()

    return messages.filter((message) => {
      if (statusFilter !== "all" && message.status !== statusFilter) {
        return false
      }

      if (!normalizedQuery) {
        return true
      }

      const searchText = `${message.subject} ${message.name} ${message.email}`.toLowerCase()
      return searchText.includes(normalizedQuery)
    })
  }, [messages, searchQuery, statusFilter])

  const selectedMessage = useMemo(
    () => filteredMessages.find((message) => message.id === selectedId) || null,
    [filteredMessages, selectedId],
  )
  const filteredMessageIds = useMemo(() => filteredMessages.map((message) => message.id), [filteredMessages])
  const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds])
  const selectedFilteredCount = useMemo(
    () => filteredMessageIds.reduce((count, id) => count + (selectedIdSet.has(id) ? 1 : 0), 0),
    [filteredMessageIds, selectedIdSet],
  )

  useEffect(() => {
    if (filteredMessages.length === 0) {
      if (selectedId) {
        setSelectedId(null)
      }
      return
    }

    if (!selectedId || !filteredMessages.some((message) => message.id === selectedId)) {
      setSelectedId(filteredMessages[0].id)
    }
  }, [filteredMessages, selectedId])

  useEffect(() => {
    const idSet = new Set(messages.map((message) => message.id))
    setSelectedIds((current) => current.filter((id) => idSet.has(id)))
  }, [messages])

  async function loadMessages() {
    setIsLoading(true)
    setError(null)

    try {
      const response = await adminFetch("/api/admin/messages", { method: "GET", cache: "no-store" })
      const payload = (await response.json()) as ApiResponse<ContactMessage[]>
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || "Unable to load messages.")
      }

      setMessages(payload.data || [])
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load messages.")
    } finally {
      setIsLoading(false)
    }
  }

  async function updateStatus(status: MessageStatus) {
    if (!selectedMessage) return
    const confirmed = window.confirm(
      `Are you sure you want to mark this message as "${status}"?`,
    )
    if (!confirmed) return

    setIsUpdating(true)
    setUpdatingMessage("Updating message status...")
    setError(null)
    setSuccess(null)

    try {
      const response = await adminFetch(`/api/admin/messages/${selectedMessage.id}/status`, {
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

  async function deleteSelectedMessage() {
    if (!selectedMessage) return

    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this message? This action cannot be undone.",
    )
    if (!confirmed) return

    setIsUpdating(true)
    setUpdatingMessage("Deleting message...")
    setError(null)
    setSuccess(null)

    try {
      const messageId = selectedMessage.id
      const response = await adminFetch(`/api/admin/messages/${messageId}`, {
        method: "DELETE",
      })

      const payload = (await response.json()) as ApiResponse<{ id: string }>
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || "Unable to delete message.")
      }

      setMessages((current) => current.filter((message) => message.id !== messageId))
      setSelectedId((current) => (current === messageId ? null : current))
      setSelectedIds((current) => current.filter((id) => id !== messageId))
      setSuccess("Message deleted.")
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Unable to delete message.")
    } finally {
      setIsUpdating(false)
    }
  }

  function toggleMessageSelection(messageId: string, checked: boolean) {
    setSelectedIds((current) => {
      if (checked) {
        if (current.includes(messageId)) {
          return current
        }
        return [...current, messageId]
      }

      return current.filter((id) => id !== messageId)
    })
  }

  function selectAllResults() {
    if (filteredMessageIds.length === 0) {
      return
    }

    setSelectedIds((current) => Array.from(new Set([...current, ...filteredMessageIds])))
  }

  function selectAllInboxMessages() {
    if (messages.length === 0) {
      return
    }

    setSelectedIds(messages.map((message) => message.id))
  }

  function clearFilteredSelection() {
    if (filteredMessageIds.length === 0) {
      return
    }

    const filteredSet = new Set(filteredMessageIds)
    setSelectedIds((current) => current.filter((id) => !filteredSet.has(id)))
  }

  function clearAllSelection() {
    if (selectedIds.length === 0) {
      return
    }

    setSelectedIds([])
  }

  async function deleteSelectedMessages() {
    if (selectedIds.length === 0) {
      return
    }

    const confirmed = window.confirm(
      `Are you sure you want to permanently delete ${selectedIds.length} selected message(s)? This action cannot be undone.`,
    )
    if (!confirmed) return

    setIsUpdating(true)
    setUpdatingMessage("Deleting selected messages...")
    setError(null)
    setSuccess(null)

    try {
      const idsToDelete = [...selectedIds]
      const idsSet = new Set(idsToDelete)
      const response = await adminFetch("/api/admin/messages/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: idsToDelete }),
      })

      const payload = (await response.json()) as ApiResponse<{ deletedCount: number }>
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || "Unable to bulk delete messages.")
      }

      setMessages((current) => current.filter((message) => !idsSet.has(message.id)))
      setSelectedIds((current) => current.filter((id) => !idsSet.has(id)))
      setSelectedId((current) => (current && idsSet.has(current) ? null : current))
      const deletedCount = payload.data?.deletedCount ?? idsToDelete.length
      setSuccess(`${deletedCount} message(s) deleted.`)
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Unable to bulk delete messages.")
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <section className="space-y-6">
      {error ? <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p> : null}
      {success ? <p className="rounded-md border border-emerald-300/40 bg-emerald-100/30 px-3 py-2 text-sm text-emerald-700">{success}</p> : null}

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <div id="inbox-list" className={cn("rounded-xl border border-border bg-card p-4 shadow-sm", selectedId ? "hidden lg:block" : "block")}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-card-foreground">Inbox</h2>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => void loadMessages()}
                disabled={isLoading}
                className="rounded-md border border-border px-3 py-1.5 text-xs font-semibold text-foreground disabled:opacity-70"
              >
                {isLoading ? (
                  <span className="inline-flex items-center">
                    <Spinner size="sm" className="mr-1.5" />
                    Refreshing inbox...
                  </span>
                ) : (
                  "Refresh"
                )}
              </button>
              <button
                type="button"
                onClick={() => void deleteSelectedMessages()}
                disabled={isUpdating || selectedIds.length === 0}
                className="rounded-md bg-destructive px-3 py-1.5 text-xs font-semibold text-destructive-foreground disabled:opacity-70"
              >
                {isUpdating ? (
                  <span className="inline-flex items-center">
                    <Spinner size="sm" className="mr-1.5" />
                    {updatingMessage}
                  </span>
                ) : (
                  `Delete Selected (${selectedIds.length})`
                )}
              </button>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <label className="text-xs text-muted-foreground">
              Search
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Subject, name, email..."
                className="mt-1 block w-60 max-w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground admin-input"
              />
            </label>

            <label className="text-xs text-muted-foreground">
              Status
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as "all" | MessageStatus)}
                className="mt-1 block rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground admin-input"
              >
                <option value="all">All</option>
                <option value="unread">Unread</option>
                <option value="read">Read</option>
                <option value="replied">Replied</option>
              </select>
            </label>
          </div>

          {isLoading ? <p className="mt-3 text-sm text-muted-foreground">Loading messages...</p> : null}
          {!isLoading && messages.length === 0 ? <p className="mt-3 text-sm text-muted-foreground">No contact messages yet.</p> : null}
          {!isLoading && messages.length > 0 && filteredMessages.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">No messages match your filters.</p>
          ) : null}
          {!isLoading && filteredMessages.length > 0 ? (
            <p className="mt-3 text-xs text-muted-foreground">
              Showing {filteredMessages.length} of {messages.length} message(s).
            </p>
          ) : null}
          {!isLoading && filteredMessages.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={selectAllResults}
                disabled={selectedFilteredCount === filteredMessages.length}
                className="rounded-md border border-border px-2.5 py-1 text-xs font-semibold text-foreground disabled:opacity-60"
              >
                Select All Results
              </button>
              <button
                type="button"
                onClick={selectAllInboxMessages}
                disabled={selectedIds.length === messages.length}
                className="rounded-md border border-border px-2.5 py-1 text-xs font-semibold text-foreground disabled:opacity-60"
              >
                Select All Inbox
              </button>
              <button
                type="button"
                onClick={clearFilteredSelection}
                disabled={selectedFilteredCount === 0}
                className="rounded-md border border-border px-2.5 py-1 text-xs font-semibold text-foreground disabled:opacity-60"
              >
                Clear Results Selection
              </button>
              <button
                type="button"
                onClick={clearAllSelection}
                disabled={selectedIds.length === 0}
                className="rounded-md border border-border px-2.5 py-1 text-xs font-semibold text-foreground disabled:opacity-60"
              >
                Clear All Selection
              </button>
              <span className="inline-flex items-center text-xs text-muted-foreground">
                {selectedFilteredCount} selected in results, {selectedIds.length} selected total
              </span>
            </div>
          ) : null}

          {!isLoading && filteredMessages.length > 0 ? (
            <ul className="mt-3 space-y-2">
              {filteredMessages.map((message) => {
                const isSelected = message.id === selectedId
                const isChecked = selectedIdSet.has(message.id)
                return (
                  <li key={message.id}>
                    <div
                      className={`w-full rounded-lg border px-3 py-3 text-left transition ${
                        isSelected ? "border-primary bg-primary/5" : "border-border bg-background hover:bg-secondary"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(event) => toggleMessageSelection(message.id, event.target.checked)}
                          className="mt-1 h-4 w-4 rounded border-input text-primary focus:ring-primary"
                          aria-label={`Select message ${message.subject || message.id}`}
                        />
                        <button type="button" onClick={() => setSelectedId(message.id)} className="min-w-0 flex-1 text-left">
                          <p className="text-sm font-semibold text-foreground">{message.subject || "No subject provided"}</p>
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
                          <span className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${getStatusBadgeClass(message.status)}`}>
                            {message.status}
                          </span>
                        </button>
                      </div>
                    </div>
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
              <button
                type="button"
                onClick={() => setSelectedId(null)}
                className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-[#1e3a2f] lg:hidden"
              >
                Back to messages
              </button>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Name</p>
                  <p className="text-sm font-medium text-card-foreground">{selectedMessage.name || "Not provided"}</p>
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
                <p className="text-sm font-semibold text-card-foreground">{selectedMessage.subject || "No subject provided"}</p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Message</p>
                <p className="whitespace-pre-wrap rounded-md border border-border bg-background p-3 text-sm text-card-foreground">
                  {selectedMessage.message || "No message was provided."}
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
                  disabled={isUpdating || selectedMessage.status === "unread"}
                  onClick={() => updateStatus("unread")}
                  className="rounded-md border border-border px-3 py-1.5 text-xs font-semibold text-foreground disabled:opacity-60"
                >
                  {isUpdating ? (
                    <span className="inline-flex items-center">
                      <Spinner size="sm" className="mr-1.5" />
                      {updatingMessage}
                    </span>
                  ) : (
                    "Mark Unread"
                  )}
                </button>
                <button
                  type="button"
                  disabled={isUpdating || selectedMessage.status === "read"}
                  onClick={() => updateStatus("read")}
                  className="rounded-md border border-border px-3 py-1.5 text-xs font-semibold text-foreground disabled:opacity-60"
                >
                  {isUpdating ? (
                    <span className="inline-flex items-center">
                      <Spinner size="sm" className="mr-1.5" />
                      {updatingMessage}
                    </span>
                  ) : (
                    "Mark Read"
                  )}
                </button>
                <button
                  type="button"
                  disabled={isUpdating || selectedMessage.status === "replied"}
                  onClick={() => updateStatus("replied")}
                  className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground disabled:opacity-70"
                >
                  {isUpdating ? (
                    <span className="inline-flex items-center">
                      <Spinner size="sm" className="mr-1.5" />
                      {updatingMessage}
                    </span>
                  ) : (
                    "Mark Replied"
                  )}
                </button>
                <a
                  href={`mailto:${selectedMessage.email}?subject=${encodeURIComponent(`Re: ${selectedMessage.subject || "Contact message"}`)}`}
                  className="rounded-md border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-secondary"
                >
                  Reply by Email
                </a>
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => void deleteSelectedMessage()}
                  className="rounded-md bg-destructive px-3 py-1.5 text-xs font-semibold text-destructive-foreground disabled:opacity-70"
                >
                  {isUpdating ? (
                    <span className="inline-flex items-center">
                      <Spinner size="sm" className="mr-1.5" />
                      {updatingMessage}
                    </span>
                  ) : (
                    "Delete Message"
                  )}
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}
