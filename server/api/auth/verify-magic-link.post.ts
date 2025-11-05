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
    
    try {
      // For development, we'll use a mock approach since we don't have proper credentials
      // In production, you should use Application Default Credentials or a service account key
      console.log('🔧 Debug: Skipping Firebase Admin initialization for development')
      console.log('⚠️ Note: This is a development-only approach. Production requires proper credentials.')
      
      // We'll handle user creation differently in development
      return
    } catch (error) {
      console.error('❌ Failed to initialize Firebase Admin:', error)
      throw error
    }
  }
}

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
 * Create or get user profile (Development Mode)
 * In development, we'll create a mock user profile without Firebase Admin SDK
 */
async function createOrGetUserProfile(email: string): Promise<UserProfile> {
  console.log('🔧 Debug: Creating mock user profile for development')
  
  try {
    // For development, create a mock user profile
    const now = new Date()
    const trialEndDate = new Date(now.getTime() + (14 * 24 * 60 * 60 * 1000)) // 14 days trial
    
    // Generate a mock UID
    const mockUid = `dev_${email.replace('@', '_').replace('.', '_')}_${Date.now()}`
    
    const userProfile: UserProfile = {
      uid: mockUid,
      email,
      displayName: null,
      photoURL: null,
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
    
    console.log('✅ Mock user profile created:', { uid: mockUid, email })
    return userProfile
    
  } catch (error) {
    console.error('❌ Error creating mock user profile:', error)
    throw error
  }
}

/**
 * Create Firebase custom token (Development Mode)
 * In development, we'll return a mock token
 */
async function createFirebaseCustomToken(uid: string, claims?: FirebaseCustomClaims): Promise<string> {
  console.log('🔧 Debug: Creating mock Firebase custom token for development')
  
  try {
    // For development, create a mock custom token
    // In production, this would use Firebase Admin SDK
    const mockToken = `dev_mock_token_${uid}_${Date.now()}`
    
    console.log('✅ Mock Firebase custom token created:', mockToken)
    return mockToken
  } catch (error) {
    console.error('❌ Error creating mock custom token:', error)
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