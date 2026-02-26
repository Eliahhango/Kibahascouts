import "server-only"

import { App, cert, getApp, getApps, initializeApp } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"
import { getFirestore } from "firebase-admin/firestore"

function getFirebaseAdminPrivateKey() {
  return process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n")
}

function getFirebaseAdminOptions() {
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL
  const privateKey = getFirebaseAdminPrivateKey()

  if (projectId && clientEmail && privateKey) {
    return {
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
      projectId,
    }
  }

  return projectId ? { projectId } : {}
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
