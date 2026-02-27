import { redirect } from "next/navigation"
import { MessagesManager } from "@/components/admin/messages-manager"
import { AdminAuthError, requireAdmin } from "@/lib/auth/require-admin"

export default async function AdminMessagesPage() {
  try {
    await requireAdmin()

    return (
      <main className="mx-auto w-full max-w-6xl px-4 py-10">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Contact Inbox</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Review contact submissions and update response status.
          </p>
        </header>
        <MessagesManager />
      </main>
    )
  } catch (error) {
    if (error instanceof AdminAuthError) {
      redirect("/admin/login")
    }
    throw error
  }
}
