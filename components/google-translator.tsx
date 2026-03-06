"use client"

import { useEffect, useRef, useState } from "react"
import { Globe } from "lucide-react"

declare global {
  interface Window {
    googleTranslateElementInit?: () => void
    google?: {
      translate?: {
        TranslateElement: new (
          options: {
            pageLanguage: string
            includedLanguages: string
            layout: number
            autoDisplay: boolean
            multilanguagePage: boolean
          },
          elementId: string
        ) => void
        InlineLayout?: { SIMPLE: number }
      }
    }
  }
}

export function GoogleTranslator() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const initializeTranslateElement = () => {
      if (!window.google?.translate?.TranslateElement) {
        return false
      }

      const element = document.getElementById("google-translate-element")
      if (!element) {
        return false
      }

      element.innerHTML = ""
      new window.google.translate.TranslateElement(
        {
          pageLanguage: "en",
          includedLanguages:
            "en,sw,fr,ar,es,pt,de,hi,it,ru,tr,ja,ko,zh-CN,zh-TW,so,om,rw,lg,ny,sn,st,tn,xh,yo,ig,ha,am",
          layout: 0,
          autoDisplay: false,
          multilanguagePage: false,
        },
        "google-translate-element",
      )
      setLoaded(true)
      return true
    }

    window.googleTranslateElementInit = () => {
      initializeTranslateElement()
    }

    const existingScript = document.getElementById("google-translate-script")
    if (existingScript) {
      initializeTranslateElement()
      return () => {
        delete window.googleTranslateElementInit
      }
    }

    const script = document.createElement("script")
    script.id = "google-translate-script"
    script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
    script.async = true
    script.defer = true
    document.body.appendChild(script)

    return () => {
      delete window.googleTranslateElementInit
    }
  }, [])

  return (
    <div className="notranslate flex items-center gap-2" ref={containerRef}>
      <Globe className="h-3.5 w-3.5 shrink-0 text-primary-foreground opacity-80" />
      <div
        id="google-translate-element"
        className={`google-translate-container transition-opacity ${loaded ? "opacity-100" : "opacity-0"}`}
      />
    </div>
  )
}
