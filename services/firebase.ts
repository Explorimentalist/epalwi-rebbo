/**
 * Firebase Configuration Service
 * Initializes Firebase app with Auth, Firestore, and Functions
 */

import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth, connectAuthEmulator } from 'firebase/auth'
import { getFirestore, type Firestore, connectFirestoreEmulator } from 'firebase/firestore'
import { getFunctions, type Functions, connectFunctionsEmulator } from 'firebase/functions'

// Firebase configuration interface
interface FirebaseConfig {
  apiKey: string
  authDomain: string
  projectId: string
  storageBucket?: string
  messagingSenderId?: string
  appId?: string
  measurementId?: string
}

// Global Firebase instances
let app: FirebaseApp | null = null
let auth: Auth | null = null
let db: Firestore | null = null
let functions: Functions | null = null

/**
 * Initialize Firebase with runtime config
 */
export function initFirebase(): {
  app: FirebaseApp
  auth: Auth
  db: Firestore
  functions: Functions
} {
  // Only initialize once
  if (app && auth && db && functions) {
    return { app, auth, db, functions }
  }

  const config = useRuntimeConfig()
  
  // Validate required config
  if (!config.public.firebaseApiKey || !config.public.firebaseAuthDomain || !config.public.firebaseProjectId) {
    throw new Error('Missing required Firebase configuration. Please check your environment variables.')
  }

  const firebaseConfig: FirebaseConfig = {
    apiKey: config.public.firebaseApiKey,
    authDomain: config.public.firebaseAuthDomain,
    projectId: config.public.firebaseProjectId,
    storageBucket: `${config.public.firebaseProjectId}.appspot.com`,
    messagingSenderId: '331415551469',
    appId: '1:331415551469:web:ef32ebc21d6c8d196cbbe4'
  }

  try {
    // Initialize Firebase app
    app = initializeApp(firebaseConfig)
    
    // Initialize services
    auth = getAuth(app)
    db = getFirestore(app)
    functions = getFunctions(app)

    // Connect to emulators in development (opt-in via runtime config)
    if (import.meta.dev && import.meta.client) {
      const useEmulators = Boolean(config.public.useFirebaseEmulators)
      if (useEmulators) {
        // Only connect to emulators if not already connected
        try {
          connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true })
          connectFirestoreEmulator(db, 'localhost', 8080)
          connectFunctionsEmulator(functions, 'localhost', 5001)
          console.log('🔥 Connected to Firebase emulators')
        } catch (error) {
          // Emulators might already be connected
          console.log('⚠️ Firebase emulators connection skipped (already connected)')
        }
      } else {
        console.log('ℹ️ Firebase emulators disabled (NUXT_PUBLIC_USE_FIREBASE_EMULATORS=false)')
      }
    }

    console.log('🔥 Firebase initialized successfully')
    
    return { app, auth, db, functions }
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error)
    throw error
  }
}

/**
 * Get Firebase Auth instance
 */
export function getFirebaseAuth(): Auth {
  if (!auth) {
    const { auth: initializedAuth } = initFirebase()
    return initializedAuth
  }
  return auth
}

/**
 * Get Firestore instance
 */
export function getFirebaseDb(): Firestore {
  if (!db) {
    const { db: initializedDb } = initFirebase()
    return initializedDb
  }
  return db
}

/**
 * Get Firebase Functions instance
 */
export function getFirebaseFunctions(): Functions {
  if (!functions) {
    const { functions: initializedFunctions } = initFirebase()
    return initializedFunctions
  }
  return functions
}

/**
 * Get Firebase App instance
 */
export function getFirebaseApp(): FirebaseApp {
  if (!app) {
    const { app: initializedApp } = initFirebase()
    return initializedApp
  }
  return app
}

// Export individual instances for direct use
export { app, auth, db, functions }

// Export types
export type { FirebaseApp, Auth, Firestore, Functions } 
