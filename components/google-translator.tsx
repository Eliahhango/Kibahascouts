"use client"

import { useEffect, useMemo, useState } from "react"

type LanguageOption = {
  code: string
  label: string
}

const storageKey = "tsa-translate-language"
const languageOptions: LanguageOption[] = [
  { code: "en", label: "English" },
  { code: "sw", label: "Kiswahili" },
  { code: "fr", label: "French" },
  { code: "ar", label: "Arabic" },
  { code: "es", label: "Spanish" },
  { code: "pt", label: "Portuguese" },
  { code: "de", label: "German" },
  { code: "zh-CN", label: "Chinese" },
]

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

function changeLanguage(code: string) {
  setGoogTransCookie(code)

  const combo = getTranslateCombo()
  if (!combo) return false

  combo.value = code
  combo.dispatchEvent(new Event("change", { bubbles: true }))
  return true
}

export function GoogleTranslator() {
  const [selectedLanguage, setSelectedLanguage] = useState("en")
  const [ready, setReady] = useState(false)

  const includedLanguages = useMemo(
    () => languageOptions.map((language) => language.code).join(","),
    [],
  )

  useEffect(() => {
    suppressTranslateToolbar()

    const observer = new MutationObserver(() => suppressTranslateToolbar())
    observer.observe(document.body, { childList: true, subtree: true })

    return () => observer.disconnect()
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

    const savedLanguage = localStorage.getItem(storageKey)
    const browserLanguage = navigator.language || "en"
    const browserCode = languageOptions.find((language) =>
      browserLanguage.toLowerCase().startsWith(language.code.toLowerCase()),
    )?.code

    const targetLanguage = savedLanguage || (browserCode && browserCode !== "en" ? browserCode : "en")

    setSelectedLanguage(targetLanguage)
    setGoogTransCookie(targetLanguage)

    let attempts = 0
    const timer = window.setInterval(() => {
      attempts += 1
      if (changeLanguage(targetLanguage) || attempts > 20) {
        suppressTranslateToolbar()
        window.clearInterval(timer)
      }
    }, 250)

    return () => window.clearInterval(timer)
  }, [ready])

  const onChangeLanguage = (nextLanguage: string) => {
    setSelectedLanguage(nextLanguage)
    localStorage.setItem(storageKey, nextLanguage)
    setGoogTransCookie(nextLanguage)

    if (!changeLanguage(nextLanguage)) {
      const timer = window.setInterval(() => {
        if (changeLanguage(nextLanguage)) {
          suppressTranslateToolbar()
          window.clearInterval(timer)
        }
      }, 250)
      window.setTimeout(() => {
        window.clearInterval(timer)
        window.location.reload()
      }, 5000)
    }
  }

  return (
    <div className="notranslate inline-flex items-center gap-2">
      <span className="hidden text-[11px] font-medium text-primary-foreground xl:inline">Translate</span>
      <select
        aria-label="Translate website language"
        value={selectedLanguage}
        onChange={(event) => onChangeLanguage(event.target.value)}
        className="rounded-md border border-primary-foreground bg-primary-foreground px-2 py-1 text-xs font-medium text-tsa-green-deep outline-none"
      >
        {languageOptions.map((language) => (
          <option key={language.code} value={language.code}>
            {language.label}
          </option>
        ))}
      </select>
      <div id="google_translate_element" className="fixed -left-[9999px] top-0 h-0 w-0 overflow-hidden" />
    </div>
  )
}
