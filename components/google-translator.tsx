"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { usePathname } from "next/navigation"
import { Loader2, X } from "lucide-react"
import { normalizeLanguageCode } from "@/lib/translate-languages"

type LocaleDetectResponse = {
  language: string
  source: "ip" | "browser" | "default"
  country: string | null
}

type TranslateResponse = {
  ok: boolean
  translations?: string[]
  error?: string
}

const storageKey = "tsa-translate-language"
const dismissKey = "tsa-translate-dismissed"

const languageOptions = [
  { code: "en", label: "English" },
  { code: "sw", label: "Kiswahili" },
  { code: "fr", label: "French" },
  { code: "ar", label: "Arabic" },
  { code: "es", label: "Spanish" },
  { code: "pt", label: "Portuguese" },
  { code: "de", label: "German" },
  { code: "hi", label: "Hindi" },
  { code: "it", label: "Italian" },
  { code: "ru", label: "Russian" },
  { code: "tr", label: "Turkish" },
  { code: "ja", label: "Japanese" },
  { code: "ko", label: "Korean" },
  { code: "zh-CN", label: "Chinese (Simplified)" },
  { code: "zh-TW", label: "Chinese (Traditional)" },
] as const

const supportedCodes = new Set<string>(languageOptions.map((item) => item.code))

function sanitizeLanguageCode(value: string | null | undefined) {
  const normalized = normalizeLanguageCode(value)
  if (!normalized || !supportedCodes.has(normalized)) return "en"
  return normalized
}

function containsTranslatableText(text: string) {
  const trimmed = text.trim()
  if (trimmed.length < 2) return false
  return /[A-Za-z]/.test(trimmed)
}

function isSkippableParent(element: Element | null) {
  if (!element) return true
  if (element.closest(".notranslate")) return true
  const tag = element.tagName
  return (
    tag === "SCRIPT" ||
    tag === "STYLE" ||
    tag === "NOSCRIPT" ||
    tag === "CODE" ||
    tag === "PRE" ||
    tag === "SVG" ||
    tag === "PATH" ||
    tag === "META" ||
    tag === "LINK" ||
    tag === "IFRAME" ||
    tag === "CANVAS"
  )
}

function chunkArray<T>(array: T[], chunkSize: number) {
  const chunks: T[][] = []
  for (let index = 0; index < array.length; index += chunkSize) {
    chunks.push(array.slice(index, index + chunkSize))
  }
  return chunks
}

function waitForNextFrame() {
  return new Promise<void>((resolve) => {
    window.requestAnimationFrame(() => resolve())
  })
}

export function GoogleTranslator() {
  const pathname = usePathname()
  const [selectedLanguage, setSelectedLanguage] = useState("en")
  const [isTranslating, setIsTranslating] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [suggestedLanguage, setSuggestedLanguage] = useState<LocaleDetectResponse | null>(null)
  const originalTextMapRef = useRef(new Map<Text, string>())
  const originalAttrMapRef = useRef(new Map<HTMLElement, Map<string, string>>())
  const translationCacheRef = useRef(new Map<string, string>())
  const activeRunIdRef = useRef(0)
  const mountedRef = useRef(false)

  const languageLabelByCode = useMemo(
    () => new Map<string, string>(languageOptions.map((item) => [item.code, item.label])),
    [],
  )

  const restoreOriginalContent = () => {
    for (const [node, original] of originalTextMapRef.current) {
      if (!node.isConnected) {
        originalTextMapRef.current.delete(node)
        continue
      }
      node.nodeValue = original
    }

    for (const [element, attributes] of originalAttrMapRef.current) {
      if (!element.isConnected) {
        originalAttrMapRef.current.delete(element)
        continue
      }

      for (const [attribute, originalValue] of attributes) {
        element.setAttribute(attribute, originalValue)
      }
    }
  }

  const translateStrings = async (texts: string[], targetLang: string) => {
    const response = await fetch("/api/translate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        texts,
        sourceLang: "en",
        targetLang,
      }),
      cache: "no-store",
    })

    const payload = (await response.json()) as TranslateResponse
    if (!response.ok || !payload.ok || !Array.isArray(payload.translations)) {
      throw new Error(payload.error || "Translation request failed")
    }

    return payload.translations
  }

  const applyLanguage = async (languageCode: string) => {
    const normalizedLanguage = sanitizeLanguageCode(languageCode)
    const runId = ++activeRunIdRef.current
    setErrorMessage("")

    restoreOriginalContent()
    await waitForNextFrame()
    if (runId !== activeRunIdRef.current) return

    if (normalizedLanguage === "en") {
      document.documentElement.lang = "en"
      return
    }

    setIsTranslating(true)

    try {
      const textBindings: Array<{ node: Text; source: string }> = []
      const attributeBindings: Array<{ element: HTMLElement; attribute: string; source: string }> = []

      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
      while (walker.nextNode()) {
        const textNode = walker.currentNode as Text
        const parent = textNode.parentElement
        if (isSkippableParent(parent)) continue

        const sourceText = textNode.nodeValue || ""
        if (!containsTranslatableText(sourceText)) continue

        if (!originalTextMapRef.current.has(textNode)) {
          originalTextMapRef.current.set(textNode, sourceText)
        }

        textBindings.push({
          node: textNode,
          source: originalTextMapRef.current.get(textNode) || sourceText,
        })
      }

      document
        .querySelectorAll<HTMLElement>("input[placeholder], textarea[placeholder], [aria-label], [title], input[type='submit'][value], input[type='button'][value]")
        .forEach((element) => {
          if (isSkippableParent(element)) return

          ;(["placeholder", "aria-label", "title", "value"] as const).forEach((attribute) => {
            const current = element.getAttribute(attribute)
            if (!current || !containsTranslatableText(current)) return

            if (!originalAttrMapRef.current.has(element)) {
              originalAttrMapRef.current.set(element, new Map())
            }

            const attributes = originalAttrMapRef.current.get(element)!
            if (!attributes.has(attribute)) {
              attributes.set(attribute, current)
            }

            attributeBindings.push({
              element,
              attribute,
              source: attributes.get(attribute) || current,
            })
          })
        })

      const sources = Array.from(
        new Set(
          [...textBindings.map((item) => item.source), ...attributeBindings.map((item) => item.source)],
        ),
      )

      for (const chunk of chunkArray(sources, 40)) {
        if (runId !== activeRunIdRef.current) return

        const unresolved = chunk.filter(
          (text) => !translationCacheRef.current.has(`${normalizedLanguage}|${text}`),
        )
        if (unresolved.length === 0) continue

        const translated = await translateStrings(unresolved, normalizedLanguage)
        unresolved.forEach((original, index) => {
          const translatedText = translated[index] ?? original
          translationCacheRef.current.set(`${normalizedLanguage}|${original}`, translatedText)
        })
      }

      if (runId !== activeRunIdRef.current) return

      textBindings.forEach(({ node, source }) => {
        if (!node.isConnected) return
        const translated = translationCacheRef.current.get(`${normalizedLanguage}|${source}`)
        if (translated) node.nodeValue = translated
      })

      attributeBindings.forEach(({ element, attribute, source }) => {
        if (!element.isConnected) return
        const translated = translationCacheRef.current.get(`${normalizedLanguage}|${source}`)
        if (translated) element.setAttribute(attribute, translated)
      })

      document.documentElement.lang = normalizedLanguage
    } catch (error) {
      const message = error instanceof Error ? error.message : "Translation failed"
      setErrorMessage(message)
    } finally {
      if (runId === activeRunIdRef.current) {
        setIsTranslating(false)
      }
    }
  }

  useEffect(() => {
    mountedRef.current = true

    const savedLanguage = sanitizeLanguageCode(localStorage.getItem(storageKey))
    if (savedLanguage !== "en") {
      setSelectedLanguage(savedLanguage)
      void applyLanguage(savedLanguage)
      return
    }

    const detectLocale = async () => {
      try {
        const response = await fetch("/api/locale-detect", { cache: "no-store" })
        if (!response.ok) return

        const locale = (await response.json()) as LocaleDetectResponse
        const detected = sanitizeLanguageCode(locale.language)
        const dismissed = sanitizeLanguageCode(localStorage.getItem(dismissKey))

        if (detected !== "en") {
          setSelectedLanguage(detected)
          void applyLanguage(detected)

          if (dismissed !== detected) {
            setSuggestedLanguage({ ...locale, language: detected })
          }
        }
      } catch {
        // Keep english defaults when locale detection fails.
      }
    }

    void detectLocale()
  }, [])

  useEffect(() => {
    if (!mountedRef.current || selectedLanguage === "en") return
    const timer = window.setTimeout(() => {
      void applyLanguage(selectedLanguage)
    }, 120)
    return () => window.clearTimeout(timer)
  }, [pathname, selectedLanguage])

  const onChangeLanguage = (nextLanguage: string) => {
    const normalized = sanitizeLanguageCode(nextLanguage)
    setSelectedLanguage(normalized)
    setSuggestedLanguage(null)
    localStorage.setItem(storageKey, normalized)
    void applyLanguage(normalized)
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
        {isTranslating && <Loader2 className="h-3.5 w-3.5 animate-spin text-primary-foreground" aria-hidden="true" />}
      </div>

      {errorMessage ? (
        <div className="fixed bottom-4 right-4 z-[80] w-[min(22rem,calc(100vw-2rem))] rounded-md border border-destructive/30 bg-card p-3 shadow-xl">
          <p className="text-xs font-semibold text-destructive">Translation issue</p>
          <p className="mt-1 text-xs text-muted-foreground">{errorMessage}</p>
        </div>
      ) : null}

      {suggestedLanguage ? (
        <div className="fixed bottom-4 right-4 z-[80] w-[min(22rem,calc(100vw-2rem))] rounded-md border border-border bg-card p-3 shadow-xl">
          <button
            type="button"
            aria-label="Dismiss language suggestion"
            onClick={() => {
              localStorage.setItem(dismissKey, sanitizeLanguageCode(suggestedLanguage.language))
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
              {languageLabelByCode.get(sanitizeLanguageCode(suggestedLanguage.language)) ?? suggestedLanguage.language}
            </span>
            .
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onChangeLanguage("en")}
              className="rounded-md border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-secondary"
            >
              Show original
            </button>
            <button
              type="button"
              onClick={() => {
                localStorage.setItem(storageKey, sanitizeLanguageCode(suggestedLanguage.language))
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
