import { validateEnv } from "./scripts/validate-env.mjs"

validateEnv()

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  serverExternalPackages: [
    "firebase-admin",
    "@google-cloud/firestore",
    "@google-cloud/storage",
    "@opentelemetry/api",
  ],
  images: {
    unoptimized: true,
  },
}

export default nextConfig
