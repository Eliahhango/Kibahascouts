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

function getTranslateCombo() {
  return document.querySelector<HTMLSelectElement>(".goog-te-combo")
}

function changeLanguage(code: string) {
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
    function initWidget() {
      if (!window.google?.translate?.TranslateElement) return

      const mountPoint = document.getElementById("google_translate_element")
      if (!mountPoint || mountPoint.childElementCount > 0) {
        setReady(true)
        return
      }

      new window.google.translate.TranslateElement(
        {
          pageLanguage: "en",
          includedLanguages,
          autoDisplay: false,
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

    let attempts = 0
    const timer = window.setInterval(() => {
      attempts += 1
      if (changeLanguage(targetLanguage) || attempts > 20) {
        window.clearInterval(timer)
      }
    }, 250)

    return () => window.clearInterval(timer)
  }, [ready])

  const onChangeLanguage = (nextLanguage: string) => {
    setSelectedLanguage(nextLanguage)
    localStorage.setItem(storageKey, nextLanguage)

    if (!changeLanguage(nextLanguage)) {
      const timer = window.setInterval(() => {
        if (changeLanguage(nextLanguage)) {
          window.clearInterval(timer)
        }
      }, 250)
      window.setTimeout(() => window.clearInterval(timer), 5000)
    }
  }

  return (
    <div className="notranslate inline-flex items-center gap-2">
      <span className="hidden text-[11px] font-medium text-primary-foreground/80 xl:inline">Translate</span>
      <select
        aria-label="Translate website language"
        value={selectedLanguage}
        onChange={(event) => onChangeLanguage(event.target.value)}
        className="rounded-md border border-primary-foreground/25 bg-primary-foreground/95 px-2 py-1 text-xs font-medium text-tsa-green-deep outline-none"
      >
        {languageOptions.map((language) => (
          <option key={language.code} value={language.code}>
            {language.label}
          </option>
        ))}
      </select>
      <div id="google_translate_element" className="hidden" />
    </div>
  )
}
