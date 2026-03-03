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

const parsed = publicEnvSchema.safeParse(process.env)

if (!parsed.success) {
  throw new Error(`Public environment validation failed:\n${formatIssues(parsed.error.issues)}`)
}

export const publicEnv = parsed.data
