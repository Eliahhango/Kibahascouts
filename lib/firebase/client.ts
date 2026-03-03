import { FirebaseApp, getApp, getApps, initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { publicEnv } from "@/lib/env/public"

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
  return {
    apiKey: publicEnv.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: publicEnv.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: publicEnv.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: publicEnv.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: publicEnv.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: publicEnv.NEXT_PUBLIC_FIREBASE_APP_ID,
  }
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
