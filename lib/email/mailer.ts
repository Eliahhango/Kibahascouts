import "server-only"

import { serverEnv } from "@/lib/env/server"

type SendTransactionalEmailParams = {
  to: string
  subject: string
  html: string
  text: string
}

type SendEmailResult =
  | { ok: true; provider: "resend"; id: string }
  | { ok: false; provider: "resend" | "none"; error: string }

function getConfiguredFromAddress() {
  const fromEmail = serverEnv.RESEND_FROM_EMAIL.trim()
  if (!fromEmail) {
    return ""
  }

  const fromName = serverEnv.RESEND_FROM_NAME.trim() || "Kibaha Scouts"
  return `${fromName} <${fromEmail}>`
}

export function isTransactionalEmailConfigured() {
  return Boolean(serverEnv.RESEND_API_KEY.trim() && serverEnv.RESEND_FROM_EMAIL.trim())
}

export async function sendTransactionalEmail(params: SendTransactionalEmailParams): Promise<SendEmailResult> {
  const apiKey = serverEnv.RESEND_API_KEY.trim()
  const fromAddress = getConfiguredFromAddress()

  if (!apiKey || !fromAddress) {
    return {
      ok: false,
      provider: "none",
      error: "Email provider is not configured (missing RESEND_API_KEY or RESEND_FROM_EMAIL).",
    }
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromAddress,
        to: [params.to],
        subject: params.subject,
        html: params.html,
        text: params.text,
        ...(serverEnv.RESEND_REPLY_TO.trim() ? { reply_to: serverEnv.RESEND_REPLY_TO.trim() } : {}),
      }),
      cache: "no-store",
    })

    const payload = (await response.json().catch(() => null)) as
      | { id?: string; message?: string; error?: { message?: string } }
      | null

    if (!response.ok || !payload?.id) {
      return {
        ok: false,
        provider: "resend",
        error: payload?.error?.message || payload?.message || "Email provider rejected the message.",
      }
    }

    return {
      ok: true,
      provider: "resend",
      id: payload.id,
    }
  } catch (error) {
    return {
      ok: false,
      provider: "resend",
      error: error instanceof Error ? error.message : "Failed to send email.",
    }
  }
}
