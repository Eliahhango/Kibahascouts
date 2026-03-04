"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { usePathname } from "next/navigation"
import { X } from "lucide-react"
import { languageCodes, normalizeLanguageCode } from "@/lib/translate-languages"

type LanguageOption = {
  code: string
  label: string
}

type LocaleDetectResponse = {
  language: string
  source: "ip" | "browser" | "default"
  country: string | null
}

const storageKey = "tsa-translate-language"
const dismissKey = "tsa-translate-dismissed"

const customLanguageLabels: Record<string, string> = {
  en: "English",
  sw: "Kiswahili",
  zh: "Chinese",
  "zh-CN": "Chinese (Simplified)",
  "zh-TW": "Chinese (Traditional)",
  jw: "Javanese",
  hmn: "Hmong",
}

declare global {
  interface Window {
    googleTranslateElementInit?: () => void
    google?: {
      translate?: {
        TranslateElement?: new (options: Record<string, unknown>, elementId: string) => unknown
      }
    }
  }
}

function setGoogTransCookie(code: string) {
  const value = `/en/${code}`
  const expires = "Fri, 31 Dec 2099 23:59:59 GMT"
  const baseParts = [`googtrans=${value}`, "path=/", `expires=${expires}`, "SameSite=Lax"]
  if (window.location.protocol === "https:") {
    baseParts.push("Secure")
  }

  const baseCookie = baseParts.join(";")
  document.cookie = baseCookie

  const host = window.location.hostname
  if (host && host !== "localhost" && !/^\d+\.\d+\.\d+\.\d+$/.test(host)) {
    document.cookie = `${baseCookie};domain=${host}`
    document.cookie = `${baseCookie};domain=.${host}`
  }
}

function getTranslateCombo() {
  return document.querySelector<HTMLSelectElement>(".goog-te-combo")
}

function hasTranslateApplied() {
  return document.body.classList.contains("translated-ltr") || document.body.classList.contains("translated-rtl")
}

function suppressTranslateToolbar() {
  const selectors = [
    "iframe.goog-te-banner-frame",
    "iframe.goog-te-banner-frame.skiptranslate",
    'iframe[class*="VIpgJd-ZVi9od-ORHb"]',
    ".goog-te-banner-frame",
    ".goog-te-banner-frame.skiptranslate",
    ".VIpgJd-ZVi9od-ORHb-OEVmcd",
    ".VIpgJd-ZVi9od-aZ2wEe-wOHMyf",
    "body > .skiptranslate",
  ]

  selectors.forEach((selector) => {
    document.querySelectorAll<HTMLElement>(selector).forEach((element) => {
      element.style.setProperty("display", "none", "important")
      element.style.setProperty("visibility", "hidden", "important")
      element.style.setProperty("height", "0", "important")
      element.style.setProperty("min-height", "0", "important")
    })
  })

  document.documentElement.style.setProperty("top", "0px", "important")
  document.documentElement.style.setProperty("margin-top", "0px", "important")
  document.body.style.setProperty("top", "0px", "important")
  document.body.style.setProperty("margin-top", "0px", "important")
}

function startToolbarGuard(durationMs = 12000) {
  suppressTranslateToolbar()

  const interval = window.setInterval(() => {
    suppressTranslateToolbar()
  }, 350)

  const timeout = window.setTimeout(() => {
    window.clearInterval(interval)
  }, durationMs)

  return () => {
    window.clearInterval(interval)
    window.clearTimeout(timeout)
  }
}

function applyLanguage(code: string) {
  setGoogTransCookie(code)

  const combo = getTranslateCombo()
  if (!combo) return false

  const optionExists = Array.from(combo.options).some((option) => option.value === code)
  if (!optionExists) return false

  const currentScrollY = window.scrollY
  combo.value = code
  combo.dispatchEvent(new Event("change", { bubbles: true }))
  combo.dispatchEvent(new Event("input", { bubbles: true }))

  window.requestAnimationFrame(() => {
    window.scrollTo({ top: currentScrollY, behavior: "auto" })
  })

  return true
}

function createLanguageOptions() {
  const displayNames =
    typeof Intl !== "undefined" && "DisplayNames" in Intl
      ? new Intl.DisplayNames(["en"], { type: "language" })
      : null

  return languageCodes.map((code) => {
    const base = code.split("-")[0]
    const label = customLanguageLabels[code] ?? displayNames?.of(base) ?? code
    return { code, label }
  }) satisfies LanguageOption[]
}

export function GoogleTranslator() {
  const pathname = usePathname()
  const [selectedLanguage, setSelectedLanguage] = useState("en")
  const [ready, setReady] = useState(false)
  const [suggestedLanguage, setSuggestedLanguage] = useState<LocaleDetectResponse | null>(null)
  const toolbarGuardCleanupRef = useRef<null | (() => void)>(null)
  const applyTimerRef = useRef<number | null>(null)
  const observerRef = useRef<MutationObserver | null>(null)
  const pendingLanguageRef = useRef<string | null>(null)
  const lastAppliedRef = useRef<string | null>(null)

  const languageOptions = useMemo(createLanguageOptions, [])
  const languageLabelByCode = useMemo(
    () => new Map(languageOptions.map((language) => [language.code, language.label])),
    [languageOptions],
  )
  const includedLanguages = useMemo(() => languageCodes.join(","), [])
  const normalizedSuggestedLanguage = suggestedLanguage
    ? normalizeLanguageCode(suggestedLanguage.language) ?? "en"
    : null

  const startGuard = () => {
    toolbarGuardCleanupRef.current?.()
    toolbarGuardCleanupRef.current = startToolbarGuard()
  }

  const clearApplyTimer = () => {
    if (applyTimerRef.current !== null) {
      window.clearTimeout(applyTimerRef.current)
      applyTimerRef.current = null
    }
  }

  const attemptApplyLanguage = (code: string) => {
    const applied = applyLanguage(code)
    const translationActive = hasTranslateApplied()
    const done = code === "en" ? applied && !translationActive : applied && translationActive

    if (done) {
      pendingLanguageRef.current = null
      lastAppliedRef.current = code
      startGuard()
    }
    return done
  }

  const applyLanguageWhenReady = (code: string, initialDelayMs = 0) => {
    pendingLanguageRef.current = code
    clearApplyTimer()

    const runWithRetry = (attempt: number) => {
      const pending = pendingLanguageRef.current
      if (!pending) {
        clearApplyTimer()
        return
      }

      if (attemptApplyLanguage(pending)) {
        clearApplyTimer()
        return
      }

      if (attempt >= 30) {
        // Keep selected value and cookie even if the widget did not attach in time.
        clearApplyTimer()
        return
      }

      const delayMs = Math.min(300 * (attempt + 1), 2000)
      applyTimerRef.current = window.setTimeout(() => runWithRetry(attempt + 1), delayMs)
    }

    applyTimerRef.current = window.setTimeout(() => {
      runWithRetry(0)
    }, Math.max(0, initialDelayMs))
  }

  const startComboObserver = () => {
    if (observerRef.current) {
      return
    }

    observerRef.current = new MutationObserver(() => {
      const pending = pendingLanguageRef.current
      if (!pending) {
        return
      }
      if (attemptApplyLanguage(pending)) {
        clearApplyTimer()
      }
    })

    observerRef.current.observe(document.body, {
      childList: true,
      subtree: true,
    })
  }

  useEffect(() => {
    startGuard()
    startComboObserver()

    return () => {
      toolbarGuardCleanupRef.current?.()
      clearApplyTimer()
      observerRef.current?.disconnect()
      observerRef.current = null
    }
  }, [])

  useEffect(() => {
    function initWidget() {
      if (!window.google?.translate?.TranslateElement) return

      const mountPoint = document.getElementById("google_translate_element")
      if (!mountPoint || mountPoint.childElementCount > 0) {
        setReady(true)
        return
      }

      const translateNamespace = window.google.translate as {
        TranslateElement: {
          new (options: Record<string, unknown>, elementId: string): unknown
          InlineLayout?: {
            SIMPLE?: unknown
          }
        }
      }

      new translateNamespace.TranslateElement(
        {
          pageLanguage: "en",
          includedLanguages,
          autoDisplay: false,
          layout: translateNamespace.TranslateElement?.InlineLayout?.SIMPLE,
        },
        "google_translate_element",
      )
      setReady(true)
    }

    if (window.google?.translate?.TranslateElement) {
      initWidget()
      return
    }

    window.googleTranslateElementInit = initWidget

    if (!document.getElementById("google-translate-script")) {
      const script = document.createElement("script")
      script.id = "google-translate-script"
      script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
      script.async = true
      document.body.appendChild(script)
    }
  }, [includedLanguages])

  useEffect(() => {
    if (!ready) return

    const savedLanguage = normalizeLanguageCode(localStorage.getItem(storageKey))
    if (savedLanguage) {
      setSelectedLanguage(savedLanguage)
      applyLanguageWhenReady(savedLanguage)
      return
    }

    let isCancelled = false

    const detectLocale = async () => {
      try {
        const response = await fetch("/api/locale-detect", { cache: "no-store" })
        if (!response.ok) throw new Error("Locale detection failed")
        const data = (await response.json()) as LocaleDetectResponse

        if (isCancelled) return

        const detectedLanguage = normalizeLanguageCode(data.language) ?? "en"
        setSelectedLanguage(detectedLanguage)
        applyLanguageWhenReady(detectedLanguage)

        const dismissedLanguage = localStorage.getItem(dismissKey)
        if (detectedLanguage !== "en" && dismissedLanguage !== detectedLanguage) {
          setSuggestedLanguage({ ...data, language: detectedLanguage })
        }
      } catch {
        setSelectedLanguage("en")
        applyLanguageWhenReady("en")
      }
    }

    detectLocale()

    return () => {
      isCancelled = true
    }
  }, [ready])

  useEffect(() => {
    if (!ready) {
      return
    }

    const lastApplied = lastAppliedRef.current
    if (!lastApplied || lastApplied === "en") {
      return
    }

    applyLanguageWhenReady(lastApplied, 800)
  }, [pathname, ready])

  const onChangeLanguage = (nextLanguage: string, persist = true) => {
    const normalized = normalizeLanguageCode(nextLanguage) ?? "en"
    setSelectedLanguage(normalized)
    if (persist) localStorage.setItem(storageKey, normalized)
    setSuggestedLanguage(null)
    applyLanguageWhenReady(normalized)
  }

  return (
    <>
      <div className="notranslate inline-flex items-center gap-2">
        <span className="hidden text-[11px] font-medium text-primary-foreground xl:inline">Translate</span>
        <select
          aria-label="Translate website language"
          value={selectedLanguage}
          onChange={(event) => onChangeLanguage(event.target.value)}
          className="max-w-[9.5rem] rounded-md border border-primary-foreground bg-primary-foreground px-2 py-1 text-xs font-medium text-tsa-green-deep outline-none sm:max-w-none"
        >
          {languageOptions.map((language) => (
            <option key={language.code} value={language.code}>
              {language.label}
            </option>
          ))}
        </select>
        <div id="google_translate_element" className="fixed -left-[9999px] top-0 h-0 w-0 overflow-hidden" />
      </div>

      {suggestedLanguage ? (
        <div className="fixed bottom-4 right-4 z-[80] w-[min(22rem,calc(100vw-2rem))] rounded-md border border-border bg-card p-3 shadow-xl">
          <button
            type="button"
            aria-label="Dismiss language suggestion"
            onClick={() => {
              localStorage.setItem(dismissKey, normalizedSuggestedLanguage || "en")
              setSuggestedLanguage(null)
            }}
            className="absolute right-2 top-2 inline-flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-secondary"
          >
            <X className="h-4 w-4" />
          </button>

          <p className="pr-6 text-sm font-semibold text-foreground">
            {suggestedLanguage.country
              ? `Language detected for ${suggestedLanguage.country}`
              : "Language detected"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Showing this page in{" "}
            <span className="font-semibold text-foreground">
              {languageLabelByCode.get(normalizedSuggestedLanguage || "en") ?? suggestedLanguage.language}
            </span>
            . You can switch back anytime.
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onChangeLanguage("en", true)}
              className="rounded-md border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-secondary"
            >
              Show original
            </button>
            <button
              type="button"
              onClick={() => {
                localStorage.setItem(storageKey, normalizedSuggestedLanguage || "en")
                setSuggestedLanguage(null)
              }}
              className="rounded-md bg-tsa-green-deep px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-tsa-green-mid"
            >
              Keep this language
            </button>
          </div>
        </div>
      ) : null}
    </>
  )
}
