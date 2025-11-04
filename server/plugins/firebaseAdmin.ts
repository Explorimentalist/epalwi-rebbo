/**
 * Firebase Admin Initialization (Server Only)
 * Initializes Firebase Admin SDK once for server-side auth and Firestore access.
 */
import { getApps, initializeApp, applicationDefault, cert } from 'firebase-admin/app'

// Nuxt Nitro server plugin
export default defineNitroPlugin(() => {
  try {
    if (getApps().length > 0) {
      // Already initialized
      return
    }

    const projectId = process.env['FIREBASE_PROJECT_ID']
    const clientEmail = process.env['FIREBASE_CLIENT_EMAIL']
    let privateKey = process.env['FIREBASE_PRIVATE_KEY']

    // Support \n in env vars (e.g., when stored as single-line)
    if (privateKey) {
      privateKey = privateKey.replace(/\\n/g, '\n')
    }

    if (projectId && clientEmail && privateKey) {
      initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey
        })
      })
      console.log('🔥 Firebase Admin initialized with service account')
    } else {
      // Fallback to application default credentials (for local/dev with gcloud auth)
      initializeApp({
        credential: applicationDefault()
      })
      console.log('🔥 Firebase Admin initialized with application default credentials')
    }
  } catch (err) {
    console.error('❌ Firebase Admin initialization failed:', err)
  }
})

