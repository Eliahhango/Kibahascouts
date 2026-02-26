"use client"

import { useEffect, useMemo, useRef, useState } from "react"
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
  document.cookie = `googtrans=${value};path=/`
  document.cookie = `googtrans=${value};domain=${window.location.hostname};path=/`
}

function getTranslateCombo() {
  return document.querySelector<HTMLSelectElement>(".goog-te-combo")
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

  const currentScrollY = window.scrollY
  combo.value = code
  combo.dispatchEvent(new Event("change", { bubbles: true }))

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
  const [selectedLanguage, setSelectedLanguage] = useState("en")
  const [ready, setReady] = useState(false)
  const [suggestedLanguage, setSuggestedLanguage] = useState<LocaleDetectResponse | null>(null)
  const toolbarGuardCleanupRef = useRef<null | (() => void)>(null)

  const languageOptions = useMemo(createLanguageOptions, [])
  const languageLabelByCode = useMemo(
    () => new Map(languageOptions.map((language) => [language.code, language.label])),
    [languageOptions],
  )
  const includedLanguages = useMemo(() => languageCodes.join(","), [])

  const startGuard = () => {
    toolbarGuardCleanupRef.current?.()
    toolbarGuardCleanupRef.current = startToolbarGuard()
  }

  const applyLanguageWithRetry = (code: string) => {
    let attempts = 0
    const timer = window.setInterval(() => {
      attempts += 1
      if (applyLanguage(code) || attempts > 24) {
        startGuard()
        window.clearInterval(timer)
      }
    }, 250)
  }

  useEffect(() => {
    startGuard()
    return () => toolbarGuardCleanupRef.current?.()
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
      applyLanguageWithRetry(savedLanguage)
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
        applyLanguageWithRetry(detectedLanguage)

        const dismissedLanguage = localStorage.getItem(dismissKey)
        if (detectedLanguage !== "en" && dismissedLanguage !== detectedLanguage) {
          setSuggestedLanguage({ ...data, language: detectedLanguage })
        }
      } catch {
        setSelectedLanguage("en")
        applyLanguageWithRetry("en")
      }
    }

    detectLocale()

    return () => {
      isCancelled = true
    }
  }, [ready])

  const onChangeLanguage = (nextLanguage: string, persist = true) => {
    const normalized = normalizeLanguageCode(nextLanguage) ?? "en"
    setSelectedLanguage(normalized)
    if (persist) localStorage.setItem(storageKey, normalized)
    setSuggestedLanguage(null)
    applyLanguageWithRetry(normalized)
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
              localStorage.setItem(dismissKey, suggestedLanguage.language)
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
              {languageLabelByCode.get(suggestedLanguage.language) ?? suggestedLanguage.language}
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
                localStorage.setItem(storageKey, suggestedLanguage.language)
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
