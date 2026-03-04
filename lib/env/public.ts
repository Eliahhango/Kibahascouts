import { z } from "zod"

const publicEnvSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url("NEXT_PUBLIC_SITE_URL must be a valid URL."),
  NEXT_PUBLIC_FIREBASE_API_KEY: z.string().min(1, "NEXT_PUBLIC_FIREBASE_API_KEY is required."),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().min(1, "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN is required."),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().min(1, "NEXT_PUBLIC_FIREBASE_PROJECT_ID is required."),
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string().min(1, "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET is required."),
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string().min(1, "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID is required."),
  NEXT_PUBLIC_FIREBASE_APP_ID: z.string().min(1, "NEXT_PUBLIC_FIREBASE_APP_ID is required."),
})

function formatIssues(issues: z.ZodIssue[]) {
  return issues.map((issue) => `- ${issue.path.join(".") || "env"}: ${issue.message}`).join("\n")
}

type PublicEnv = z.infer<typeof publicEnvSchema>

function normalizeValue(value: string | undefined) {
  if (!value) return ""

  const trimmed = value.trim()
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim()
  }

  return trimmed
}

function resolveSiteUrl(value: string) {
  if (value) {
    try {
      new URL(value)
      return value
    } catch {
      // ignore invalid url and fallback below
    }
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }

  return "http://localhost:3000"
}

const rawEnv = {
  NEXT_PUBLIC_SITE_URL: normalizeValue(process.env.NEXT_PUBLIC_SITE_URL),
  NEXT_PUBLIC_FIREBASE_API_KEY: normalizeValue(process.env.NEXT_PUBLIC_FIREBASE_API_KEY),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: normalizeValue(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: normalizeValue(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID),
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: normalizeValue(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET),
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: normalizeValue(process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID),
  NEXT_PUBLIC_FIREBASE_APP_ID: normalizeValue(process.env.NEXT_PUBLIC_FIREBASE_APP_ID),
}

const parsed = publicEnvSchema.safeParse(rawEnv)

const fallbackPublicEnv: PublicEnv = {
  NEXT_PUBLIC_SITE_URL: resolveSiteUrl(rawEnv.NEXT_PUBLIC_SITE_URL),
  NEXT_PUBLIC_FIREBASE_API_KEY: rawEnv.NEXT_PUBLIC_FIREBASE_API_KEY,
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: rawEnv.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: rawEnv.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: rawEnv.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: rawEnv.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  NEXT_PUBLIC_FIREBASE_APP_ID: rawEnv.NEXT_PUBLIC_FIREBASE_APP_ID,
}

if (!parsed.success && process.env.NODE_ENV !== "production") {
  console.warn(`Public environment validation fallback:\n${formatIssues(parsed.error.issues)}`)
}

export const publicEnv = parsed.success ? parsed.data : fallbackPublicEnv
