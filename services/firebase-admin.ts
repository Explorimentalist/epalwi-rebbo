/**
 * Firebase Admin SDK Service
 * Server-side Firebase operations for webhooks and API routes
 */

import * as admin from 'firebase-admin'

// Global admin instance
let adminApp: admin.app.App | null = null

/**
 * Initialize Firebase Admin SDK
 */
export function initFirebaseAdmin(): admin.app.App {
  // Only initialize once
  if (adminApp) {
    return adminApp
  }

  try {
    // Check if Firebase Admin is already initialized
    if (admin.apps.length > 0) {
      adminApp = admin.apps[0] as admin.app.App
      return adminApp
    }

    const config = useRuntimeConfig()
    
    // In development, use the Firebase project ID for default credentials
    if (import.meta.dev) {
      adminApp = admin.initializeApp({
        projectId: config.public.firebaseProjectId
      })
    } else {
      // In production, you should use service account credentials
      // For now, we'll use the default application credentials
      adminApp = admin.initializeApp({
        projectId: config.public.firebaseProjectId,
        // In production, you can add:
        // credential: admin.credential.cert(serviceAccountKey)
      })
    }

    console.log('🔥 Firebase Admin initialized successfully')
    return adminApp
  } catch (error) {
    console.error('❌ Firebase Admin initialization failed:', error)
    throw error
  }
}

/**
 * Get Firebase Admin Firestore instance
 */
export function getFirebaseAdminDb(): admin.firestore.Firestore {
  const app = initFirebaseAdmin()
  return app.firestore()
}

/**
 * Get Firebase Admin Auth instance
 */
export function getFirebaseAdminAuth(): admin.auth.Auth {
  const app = initFirebaseAdmin()
  return app.auth()
}

/**
 * Get Firebase Admin App instance
 */
export function getFirebaseAdminApp(): admin.app.App {
  return initFirebaseAdmin()
}

// Export types
export type AdminFirestore = admin.firestore.Firestore
export type AdminAuth = admin.auth.Auth