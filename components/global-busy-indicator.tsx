"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"

const INTERACTIVE_SELECTOR = "a[href],button,input[type='submit'],input[type='button'],[role='button']"
const MIN_BUSY_MS = 450
const VAR_BUSY_MS = 350

function isInteractiveElement(element: Element | null) {
  if (!element) {
    return false
  }

  const interactive = element.closest(INTERACTIVE_SELECTOR)
  if (!interactive) {
    return false
  }

  const htmlElement = interactive as HTMLElement
  if (htmlElement.closest("[data-no-busy]")) {
    return false
  }

  if ("disabled" in htmlElement && (htmlElement as HTMLButtonElement | HTMLInputElement).disabled) {
    return false
  }

  if (htmlElement.getAttribute("aria-disabled") === "true") {
    return false
  }

  return true
}

function getBusyDuration() {
  return MIN_BUSY_MS + Math.floor(Math.random() * VAR_BUSY_MS)
}

export function GlobalBusyIndicator() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isBusy, setIsBusy] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hasMountedRef = useRef(false)

  function startBusy(durationMs = getBusyDuration()) {
    setIsBusy(true)

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      setIsBusy(false)
      timeoutRef.current = null
    }, durationMs)
  }

  useEffect(() => {
    const clickHandler = (event: MouseEvent) => {
      if (event.defaultPrevented) {
        return
      }

      const target = event.target as Element | null
      if (!isInteractiveElement(target)) {
        return
      }

      startBusy()
    }

    document.addEventListener("click", clickHandler, true)
    return () => {
      document.removeEventListener("click", clickHandler, true)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true
      return
    }

    startBusy(320)
  }, [pathname, searchParams])

  return (
    <>
      <div
        className={cn(
          "pointer-events-none fixed inset-x-0 top-0 z-[90] h-0.5 transition-opacity duration-200",
          isBusy ? "opacity-100" : "opacity-0",
        )}
      >
        <div className="h-full w-full animate-pulse bg-tsa-gold" />
      </div>

      <div
        className={cn(
          "pointer-events-none fixed right-4 top-4 z-[90] transition-all duration-200",
          isBusy ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0",
        )}
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-tsa-gold/40 bg-card/95 px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm backdrop-blur">
          <Spinner className="size-3.5 text-tsa-green-deep" />
          Serving request...
        </div>
      </div>
    </>
  )
}
