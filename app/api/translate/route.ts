import { NextRequest, NextResponse } from "next/server"
import { normalizeLanguageCode } from "@/lib/translate-languages"

export const runtime = "nodejs"

type TranslateRequestBody = {
  texts?: string[]
  targetLang?: string
  sourceLang?: string
}

function sanitizeTexts(input: unknown) {
  if (!Array.isArray(input)) return []
  return input
    .map((value) => (typeof value === "string" ? value.trim() : ""))
    .filter(Boolean)
    .slice(0, 220)
}

async function translateWithApiKey(
  texts: string[],
  targetLang: string,
  sourceLang: string,
  apiKey: string,
) {
  const response = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${encodeURIComponent(apiKey)}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      q: texts,
      source: sourceLang,
      target: targetLang,
      format: "text",
    }),
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error("Official translation endpoint failed")
  }

  const payload = (await response.json()) as {
    data?: { translations?: Array<{ translatedText?: string }> }
  }

  return payload.data?.translations?.map((item) => item.translatedText ?? "") ?? []
}

async function translateSingleUnofficial(text: string, targetLang: string, sourceLang: string) {
  const params = new URLSearchParams()
  params.set("client", "gtx")
  params.set("sl", sourceLang)
  params.set("tl", targetLang)
  params.set("dt", "t")
  params.set("q", text)

  const response = await fetch(`https://translate.googleapis.com/translate_a/single?${params.toString()}`, {
    cache: "no-store",
    headers: {
      "User-Agent": "Mozilla/5.0",
    },
  })

  if (!response.ok) {
    throw new Error("Google fallback translate endpoint failed")
  }

  const payload = (await response.json()) as unknown[]
  const segments = Array.isArray(payload?.[0]) ? (payload[0] as unknown[]) : []

  return segments
    .map((segment) => (Array.isArray(segment) ? (segment[0] as string | undefined) ?? "" : ""))
    .join("")
}

async function translateWithFallback(texts: string[], targetLang: string, sourceLang: string) {
  const concurrency = 8
  const results = new Array<string>(texts.length)
  let index = 0

  async function worker() {
    while (index < texts.length) {
      const current = index
      index += 1
      try {
        results[current] = await translateSingleUnofficial(texts[current], targetLang, sourceLang)
      } catch {
        results[current] = texts[current]
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, texts.length) }, worker))
  return results
}

export async function POST(request: NextRequest) {
  let body: TranslateRequestBody
  try {
    body = (await request.json()) as TranslateRequestBody
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 })
  }

  const texts = sanitizeTexts(body.texts)
  const targetLang = normalizeLanguageCode(body.targetLang ?? "") ?? "en"
  const sourceLang = normalizeLanguageCode(body.sourceLang ?? "en") ?? "en"

  if (texts.length === 0) {
    return NextResponse.json({ ok: true, translations: [] })
  }

  if (targetLang === sourceLang) {
    return NextResponse.json({ ok: true, translations: texts })
  }

  try {
    const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY?.trim()
    const translations = apiKey
      ? await translateWithApiKey(texts, targetLang, sourceLang, apiKey)
      : await translateWithFallback(texts, targetLang, sourceLang)

    if (!Array.isArray(translations) || translations.length !== texts.length) {
      return NextResponse.json({ ok: false, error: "Translation response mismatch" }, { status: 502 })
    }

    return NextResponse.json(
      { ok: true, translations },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : "Translation failed"
    return NextResponse.json({ ok: false, error: message }, { status: 502 })
  }
}
