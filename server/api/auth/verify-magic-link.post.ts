/**
 * Verify Magic Link API Endpoint
 * POST /api/auth/verify-magic-link
 */

import jwt from 'jsonwebtoken'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'
import { initializeApp, getApps, cert } from 'firebase-admin/app'
import type { 
  TokenVerificationPayload, 
  TokenVerificationResponse, 
  JWTPayload,
  UserProfile,
  FirebaseCustomClaims 
} from '~/types/auth'

// Initialize Firebase Admin SDK
function initFirebaseAdmin() {
  if (getApps().length === 0) {
    const config = useRuntimeConfig()
    
    // In development, you might want to use a service account key
    // In production, use Application Default Credentials
    const firebaseConfig = {
      projectId: config.public.firebaseProjectId,
      // Add other config as needed
    }

    try {
      initializeApp(firebaseConfig)
    } catch (error) {
      console.error('Failed to initialize Firebase Admin:', error)
      throw error
    }
  }
}

/**
 * Verify JWT token
 */
function verifyMagicLinkToken(token: string): JWTPayload {
  const config = useRuntimeConfig()
  
  if (!config.mailersendApiKey) {
    throw new Error('JWT secret not configured')
  }

  try {
    const payload = jwt.verify(token, config.mailersendApiKey, {
      algorithms: ['HS256'],
      issuer: 'epalwi-rebbo',
      audience: 'epalwi-rebbo-users'
    }) as JWTPayload

    // Check if token is expired
    const now = Math.floor(Date.now() / 1000)
    if (payload.exp < now) {
      throw new Error('Token expired')
    }

    return payload
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token expired')
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token')
    } else {
      throw error
    }
  }
}

/**
 * Create or get user profile
 */
async function createOrGetUserProfile(email: string): Promise<UserProfile> {
  initFirebaseAdmin()
  
  const auth = getAuth()
  const db = getFirestore()
  
  try {
    // Try to get existing user
    let firebaseUser
    try {
      firebaseUser = await auth.getUserByEmail(email)
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        // Create new user
        firebaseUser = await auth.createUser({
          email,
          emailVerified: true, // Email is verified through magic link
        })
      } else {
        throw error
      }
    }

    // Get or create user profile in Firestore
    const userDocRef = db.collection('users').doc(firebaseUser.uid)
    const userDoc = await userDocRef.get()
    
    const now = new Date()
    const trialEndDate = new Date(now.getTime() + (14 * 24 * 60 * 60 * 1000)) // 14 days trial
    
    if (!userDoc.exists) {
      // Create new user profile
      const newUserProfile = {
        uid: firebaseUser.uid,
        email,
        displayName: firebaseUser.displayName || null,
        photoURL: firebaseUser.photoURL || null,
        role: 'user',
        createdAt: now,
        lastLoginAt: now,
        subscription: {
          status: 'trial'
        },
        trial: {
          startDate: now,
          endDate: trialEndDate,
          daysRemaining: 14,
          isExpired: false
        },
        emailVerified: true,
        isActive: true
      }
      
      await userDocRef.set(newUserProfile)
      
      // Set custom claims
      const customClaims: FirebaseCustomClaims = {
        role: 'user',
        subscriptionStatus: 'trial',
        trialEndDate: trialEndDate.getTime()
      }
      
      await auth.setCustomUserClaims(firebaseUser.uid, customClaims)
      
      return newUserProfile as UserProfile
    } else {
      // Update existing user
      const userData = userDoc.data()!
      
      // Calculate current trial status
      const trialStart = userData['trial']?.startDate?.toDate() || userData['createdAt'].toDate()
      const trialEnd = userData['trial']?.endDate?.toDate() || new Date(trialStart.getTime() + (14 * 24 * 60 * 60 * 1000))
      const daysRemaining = Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)))
      const isExpired = now > trialEnd
      
      const updatedProfile = {
        ...userData,
        lastLoginAt: now,
        emailVerified: true,
        trial: {
          startDate: trialStart,
          endDate: trialEnd,
          daysRemaining,
          isExpired
        }
      }
      
      await userDocRef.update({
        lastLoginAt: now,
        emailVerified: true,
        'trial.daysRemaining': daysRemaining,
        'trial.isExpired': isExpired
      })
      
      return updatedProfile as UserProfile
    }
  } catch (error) {
    console.error('Error creating/getting user profile:', error)
    throw error
  }
}

/**
 * Create Firebase custom token
 */
async function createFirebaseCustomToken(uid: string, claims?: FirebaseCustomClaims): Promise<string> {
  initFirebaseAdmin()
  
  const auth = getAuth()
  
  try {
    const customToken = await auth.createCustomToken(uid, claims)
    return customToken
  } catch (error) {
    console.error('Error creating custom token:', error)
    throw error
  }
}

export default defineEventHandler(async (event): Promise<TokenVerificationResponse> => {
  try {
    // Only allow POST requests
    assertMethod(event, 'POST')

    // Parse request body
    const body = await readBody<TokenVerificationPayload>(event)
    
    if (!body || !body.token) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Token is required'
      })
    }

    const { token } = body

    // Verify the JWT token
    let payload: JWTPayload
    try {
      payload = verifyMagicLinkToken(token)
    } catch (error: any) {
      throw createError({
        statusCode: 401,
        statusMessage: error.message || 'Invalid token'
      })
    }

    // Create or get user profile
    const userProfile = await createOrGetUserProfile(payload.email)

    // Create custom Firebase token
    const customClaims: FirebaseCustomClaims = {
      role: userProfile.role,
      subscriptionStatus: userProfile.subscription.status,
      trialEndDate: userProfile.trial.endDate.getTime()
    }

    const firebaseToken = await createFirebaseCustomToken(userProfile.uid, customClaims)

    return {
      success: true,
      message: 'Verificación exitosa',
      user: userProfile,
      firebaseToken
    }

  } catch (error: any) {
    console.error('❌ Verify magic link error:', error)

    // Handle specific error types
    if (error.statusCode) {
      throw error // Re-throw HTTP errors
    }

    // Generic error response
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to verify magic link'
    })
  }
}) 