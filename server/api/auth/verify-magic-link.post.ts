/**
 * Verify Magic Link API Endpoint
 * POST /api/auth/verify-magic-link
 */

import jwt from 'jsonwebtoken'
import { getFirebaseAdminAuth, getFirebaseAdminDb } from '~/services/firebase-admin'
import type { 
  TokenVerificationPayload, 
  TokenVerificationResponse, 
  JWTPayload,
  UserProfile,
  FirebaseCustomClaims 
} from '~/types/auth'

/**
 * Verify JWT token
 */
function verifyMagicLinkToken(token: string): JWTPayload {
  const config = useRuntimeConfig()
  const jwtSecret = config['jwtSecret'] as string
  
  if (!jwtSecret) {
    throw new Error('JWT secret not configured')
  }

  try {
    const payload = jwt.verify(token, jwtSecret, {
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
 * Create or get user profile using Firebase Admin
 */
async function createOrGetUserProfile(email: string): Promise<UserProfile> {
  console.log('🔧 Debug: Creating/getting user profile via Firebase Admin')
  
  try {
    const adminAuth = getFirebaseAdminAuth()
    const adminDb = getFirebaseAdminDb()
    
    // Try to get existing user by email
    let userRecord
    try {
      userRecord = await adminAuth.getUserByEmail(email)
      console.log('✅ Existing user found:', userRecord.uid)
    } catch (error) {
      // User doesn't exist, create new one
      console.log('🔧 Debug: User not found, creating new user...')
      userRecord = await adminAuth.createUser({
        email,
        emailVerified: true
      })
      console.log('✅ New user created:', userRecord.uid)
    }
    
    // Get or create user document in Firestore
    const userDocRef = adminDb.collection('users').doc(userRecord.uid)
    const userDoc = await userDocRef.get()
    
    const now = new Date()
    const trialEndDate = new Date(now.getTime() + (14 * 24 * 60 * 60 * 1000)) // 14 days trial
    
    let userProfile: UserProfile
    
    if (userDoc.exists) {
      // Update existing profile
      const data = userDoc.data()!
      userProfile = {
        uid: userRecord.uid,
        email: userRecord.email!,
        displayName: userRecord.displayName || undefined,
        photoURL: userRecord.photoURL || undefined,
        role: data['role'] || 'user',
        createdAt: data['createdAt']?.toDate() || now,
        lastLoginAt: now,
        subscription: data['subscription'] || { status: 'trial' },
        trial: data['trial'] || {
          startDate: data['createdAt']?.toDate() || now,
          endDate: trialEndDate,
          daysRemaining: 14,
          isExpired: false
        },
        emailVerified: userRecord.emailVerified,
        isActive: data['isActive'] ?? true
      }
      
      // Update last login
      await userDocRef.update({
        lastLoginAt: now,
        emailVerified: userRecord.emailVerified
      })
    } else {
      // Create new profile
      userProfile = {
        uid: userRecord.uid,
        email: userRecord.email!,
        displayName: userRecord.displayName || undefined,
        photoURL: userRecord.photoURL || undefined,
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
        emailVerified: userRecord.emailVerified,
        isActive: true
      }
      
      // Save to Firestore
      await userDocRef.set({
        ...userProfile,
        createdAt: now,
        lastLoginAt: now
      })
    }
    
    console.log('✅ User profile processed successfully')
    return userProfile
    
  } catch (error) {
    console.error('❌ Error creating/getting user profile:', error)
    throw error
  }
}

/**
 * Create Firebase custom token using Firebase Admin
 */
async function createFirebaseCustomToken(uid: string, claims?: FirebaseCustomClaims): Promise<string> {
  console.log('🔧 Debug: Creating Firebase custom token via Admin SDK')
  
  try {
    const adminAuth = getFirebaseAdminAuth()
    
    // Create custom token with claims
    const customToken = await adminAuth.createCustomToken(uid, claims || {})
    
    console.log('✅ Firebase custom token created successfully')
    return customToken
  } catch (error) {
    console.error('❌ Error creating custom token:', error)
    throw error
  }
}

export default defineEventHandler(async (event): Promise<TokenVerificationResponse> => {
  try {
    console.log('🔧 Debug: Magic link verification request received')
    
    // Only allow POST requests
    assertMethod(event, 'POST')

    // Parse request body
    const body = await readBody<TokenVerificationPayload>(event)
    console.log('🔧 Debug: Request body received:', { hasToken: !!body?.token })
    
    if (!body || !body.token) {
      console.error('❌ No token provided in request')
      throw createError({
        statusCode: 400,
        statusMessage: 'Token is required'
      })
    }

    const { token } = body

    // Verify the JWT token
    let payload: JWTPayload
    try {
      console.log('🔧 Debug: Verifying JWT token...')
      payload = verifyMagicLinkToken(token)
      console.log('✅ JWT token verified successfully for email:', payload.email)
    } catch (error: any) {
      console.error('❌ JWT token verification failed:', error.message)
      throw createError({
        statusCode: 401,
        statusMessage: error.message || 'Invalid token'
      })
    }

    // Create or get user profile
    console.log('🔧 Debug: Creating/getting user profile for:', payload.email)
    const userProfile = await createOrGetUserProfile(payload.email)
    console.log('✅ User profile processed successfully')

    // Create custom Firebase token
    console.log('🔧 Debug: Creating Firebase custom token...')
    const customClaims: FirebaseCustomClaims = {
      role: userProfile.role,
      subscriptionStatus: userProfile.subscription.status,
      trialEndDate: userProfile.trial.endDate.getTime()
    }

    const firebaseToken = await createFirebaseCustomToken(userProfile.uid, customClaims)
    console.log('✅ Firebase custom token created successfully')

    console.log('✅ Magic link verification completed successfully')
    return {
      success: true,
      message: 'Verificación exitosa',
      user: userProfile,
      firebaseToken
    }

  } catch (error: any) {
    console.error('❌ Verify magic link error:', error)
    console.error('❌ Error stack:', error.stack)

    // Handle specific error types
    if (error.statusCode) {
      throw error // Re-throw HTTP errors
    }

    // Generic error response
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to verify magic link: ' + (error.message || 'Unknown error')
    })
  }
}) 