import { FirebaseApp, getApp, getApps, initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"

type FirebaseClientConfig = {
  apiKey: string
  authDomain: string
  projectId: string
  storageBucket: string
  messagingSenderId: string
  appId: string
}

let cachedApp: FirebaseApp | null = null

function getFirebaseClientConfig(): FirebaseClientConfig {
  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
  }

  const missing = Object.entries(config)
    .filter(([, value]) => !value)
    .map(([key]) => key)

  if (missing.length > 0) {
    throw new Error(`Missing Firebase client env vars: ${missing.join(", ")}`)
  }

  return config
}

export function getFirebaseClientApp() {
  if (cachedApp) {
    return cachedApp
  }

  if (getApps().length > 0) {
    cachedApp = getApp()
    return cachedApp
  }

  cachedApp = initializeApp(getFirebaseClientConfig())
  return cachedApp
}

export function getFirebaseClientAuth() {
  return getAuth(getFirebaseClientApp())
}
