import { NextRequest, NextResponse } from "next/server"
import { detectLanguageFromAcceptLanguage, detectLanguageFromCountry } from "@/lib/translate-languages"

type DetectionSource = "ip" | "browser" | "default"

function getCountryCode(request: NextRequest) {
  return (
    request.headers.get("x-vercel-ip-country") ??
    request.headers.get("cf-ipcountry") ??
    request.headers.get("x-country-code") ??
    request.headers.get("x-appengine-country")
  )
}

export async function GET(request: NextRequest) {
  const country = getCountryCode(request)?.toUpperCase() ?? null
  const fromCountry = detectLanguageFromCountry(country)
  const fromBrowser = detectLanguageFromAcceptLanguage(request.headers.get("accept-language"))

  let language = "en"
  let source: DetectionSource = "default"

  if (fromCountry) {
    language = fromCountry
    source = "ip"
  } else if (fromBrowser) {
    language = fromBrowser
    source = "browser"
  }

  return NextResponse.json({ language, source, country })
}
