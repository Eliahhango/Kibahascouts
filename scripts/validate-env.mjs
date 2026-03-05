import { z } from "zod"
import { pathToFileURL } from "url"
import nextEnv from "@next/env"

const { loadEnvConfig } = nextEnv

const positiveInt = (field, min, max) =>
  z.coerce
    .number({ invalid_type_error: `${field} must be a number.` })
    .int(`${field} must be an integer.`)
    .min(min, `${field} must be at least ${min}.`)
    .max(max, `${field} must be at most ${max}.`)

const envSchema = z
  .object({
    NEXT_PUBLIC_SITE_URL: z.string().url("NEXT_PUBLIC_SITE_URL must be a valid URL."),
    SAMPLE_MODE: z.enum(["true", "false"]).default("false"),
    NEXT_PUBLIC_FIREBASE_API_KEY: z.string().min(1, "NEXT_PUBLIC_FIREBASE_API_KEY is required."),
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().min(1, "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN is required."),
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().min(1, "NEXT_PUBLIC_FIREBASE_PROJECT_ID is required."),
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string().min(1, "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET is required."),
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string().min(1, "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID is required."),
    NEXT_PUBLIC_FIREBASE_APP_ID: z.string().min(1, "NEXT_PUBLIC_FIREBASE_APP_ID is required."),
    FIREBASE_ADMIN_PROJECT_ID: z.string().min(1, "FIREBASE_ADMIN_PROJECT_ID is required."),
    FIREBASE_ADMIN_CLIENT_EMAIL: z.string().email("FIREBASE_ADMIN_CLIENT_EMAIL must be a valid email."),
    FIREBASE_ADMIN_PRIVATE_KEY: z.string().min(1, "FIREBASE_ADMIN_PRIVATE_KEY is required."),
    ADMIN_SESSION_COOKIE_NAME: z.string().min(1).default("kibaha_admin_session"),
    ADMIN_SESSION_MAX_AGE_DAYS: positiveInt("ADMIN_SESSION_MAX_AGE_DAYS", 1, 14).default(5),
    CONTACT_FORM_RATE_LIMIT_MAX: positiveInt("CONTACT_FORM_RATE_LIMIT_MAX", 1, 100).default(5),
    CONTACT_FORM_RATE_LIMIT_WINDOW_MS: positiveInt("CONTACT_FORM_RATE_LIMIT_WINDOW_MS", 60_000, 86_400_000).default(900_000),
    ADMIN_MAX_CONCURRENT_SESSIONS: positiveInt("ADMIN_MAX_CONCURRENT_SESSIONS", 1, 20).default(3),
    ADMIN_LOGIN_MAX_ATTEMPTS: positiveInt("ADMIN_LOGIN_MAX_ATTEMPTS", 1, 20).default(5),
    ADMIN_LOGIN_WINDOW_MINUTES: positiveInt("ADMIN_LOGIN_WINDOW_MINUTES", 1, 120).default(15),
    ADMIN_SESSION_REFRESH_BEFORE_MINUTES: positiveInt("ADMIN_SESSION_REFRESH_BEFORE_MINUTES", 1, 120).default(20),
    ADMIN_SECURITY_ALERT_THRESHOLD: positiveInt("ADMIN_SECURITY_ALERT_THRESHOLD", 1, 100).default(8),
    ADMIN_SECURITY_ALERT_WINDOW_MINUTES: positiveInt("ADMIN_SECURITY_ALERT_WINDOW_MINUTES", 1, 1_440).default(30),
    INSTAGRAM_ACCESS_TOKEN: z.string().optional().default(""),
    ADMIN_EMAILS: z.string().optional(),
    RESEND_API_KEY: z.string().optional().default(""),
    RESEND_FROM_EMAIL: z.string().optional().default(""),
    RESEND_FROM_NAME: z.string().optional().default("Kibaha Scouts"),
    RESEND_REPLY_TO: z.string().optional().default(""),
  })
  .superRefine((env, ctx) => {
    if (!env.FIREBASE_ADMIN_PRIVATE_KEY.includes("PRIVATE KEY")) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["FIREBASE_ADMIN_PRIVATE_KEY"],
        message: "FIREBASE_ADMIN_PRIVATE_KEY does not look like a valid private key.",
      })
    }
  })

function formatIssues(issues) {
  return issues.map((issue) => `- ${issue.path.join(".") || "env"}: ${issue.message}`).join("\n")
}

export function validateEnv(rawEnv = process.env) {
  const parsed = envSchema.safeParse(rawEnv)

  if (!parsed.success) {
    throw new Error(`Environment validation failed:\n${formatIssues(parsed.error.issues)}`)
  }

  return parsed.data
}

const isDirectExecution = process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url

if (isDirectExecution) {
  // Load .env files like Next.js does, so local validation matches build/runtime behavior.
  loadEnvConfig(process.cwd())
  validateEnv()
  console.log("Environment validation passed.")
}
