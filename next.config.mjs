import { validateEnv } from "./scripts/validate-env.mjs"

validateEnv()

const firebaseStorageBucket = (process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "")
  .trim()
  .replace(/^gs:\/\//, "")
  .replace(/^https?:\/\//, "")
  .replace(/\/.*$/, "")

const trustedImageHostnames = Array.from(
  new Set(
    [
      "firebasestorage.googleapis.com",
      "storage.googleapis.com",
      "lh3.googleusercontent.com",
      "avatars.githubusercontent.com",
      firebaseStorageBucket,
    ].filter(Boolean),
  ),
)

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  `img-src 'self' data: blob: ${trustedImageHostnames.map((hostname) => `https://${hostname}`).join(" ")}`,
  "connect-src 'self' https://vitals.vercel-insights.com https://va.vercel-scripts.com https://*.googleapis.com https://*.firebaseio.com https://*.gstatic.com",
  "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://www.instagram.com https://maps.google.com https://www.google.com",
].join("; ")

/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: [
    "firebase-admin",
    "@google-cloud/firestore",
    "@google-cloud/storage",
    "@opentelemetry/api",
  ],
  images: {
    remotePatterns: trustedImageHostnames.map((hostname) => ({
      protocol: "https",
      hostname,
      pathname: "/**",
    })),
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Content-Security-Policy", value: contentSecurityPolicy },
        ],
      },
    ]
  },
}

export default nextConfig
