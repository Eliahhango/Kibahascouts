"use client"

import { useState } from "react"
import { Check, Facebook, Link2, MessageCircle } from "lucide-react"

type ShareButtonsProps = {
  url: string
  title: string
  summary?: string
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current">
      <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.847h-7.406l-5.8-7.584-6.637 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932zM17.61 20.645h2.04L6.486 3.24H4.298z" />
    </svg>
  )
}

export function ShareButtons({ url, title, summary }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false)

  const whatsappMessage = summary?.trim()
    ? `${title}\n${summary.trim()}\n${url}`
    : `${title}\n${url}`

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
  const xUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Share this</p>
      <div className="flex flex-wrap items-center gap-2">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs font-semibold text-green-700 transition-colors hover:bg-green-100"
        >
          <MessageCircle className="h-4 w-4" />
          WhatsApp
        </a>

        <a
          href={facebookUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 transition-colors hover:bg-blue-100"
        >
          <Facebook className="h-4 w-4" />
          Facebook
        </a>

        <a
          href={xUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100"
        >
          <XIcon />
          X
        </a>

        <button
          type="button"
          onClick={handleCopy}
          className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${
            copied
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-border bg-background text-foreground hover:bg-secondary"
          }`}
        >
          {copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
          {copied ? "Copied" : "Copy link"}
        </button>
      </div>
    </div>
  )
}
