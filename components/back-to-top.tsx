"use client"

import { useEffect, useState } from "react"
import { ChevronUp } from "lucide-react"

export function BackToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 400)
    }

    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Back to top"
      className={`fixed bottom-6 right-6 z-50 h-10 w-10 rounded-full bg-tsa-green-deep text-white shadow-lg transition-all hover:bg-tsa-green-mid focus-visible:ring-2 focus-visible:ring-ring ${
        visible ? "opacity-100 scale-100" : "pointer-events-none opacity-0 scale-90"
      }`}
    >
      <ChevronUp className="mx-auto h-5 w-5" />
    </button>
  )
}
