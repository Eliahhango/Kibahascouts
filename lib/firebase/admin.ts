import "server-only"

import { App, cert, getApp, getApps, initializeApp } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"
import { getFirestore } from "firebase-admin/firestore"
import { serverEnv } from "@/lib/env/server"

function getFirebaseAdminOptions() {
  const { FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, FIREBASE_ADMIN_PRIVATE_KEY } = serverEnv

  if (!FIREBASE_ADMIN_PROJECT_ID || !FIREBASE_ADMIN_CLIENT_EMAIL || !FIREBASE_ADMIN_PRIVATE_KEY) {
    throw new Error("Firebase Admin credentials are incomplete.")
  }

  return {
    credential: cert({
      projectId: FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: FIREBASE_ADMIN_PRIVATE_KEY,
    }),
    projectId: FIREBASE_ADMIN_PROJECT_ID,
  }
}

export function getFirebaseAdminApp(): App {
  if (getApps().length > 0) {
    return getApp()
  }

  return initializeApp(getFirebaseAdminOptions())
}

export function getAdminAuth() {
  return getAuth(getFirebaseAdminApp())
}

export function getAdminDb() {
  return getFirestore(getFirebaseAdminApp())
}
