/**
 * Verify Magic Link API Endpoint
 * POST /api/auth/verify-magic-link
 */

import { verifyMagicLinkToken, generateSessionToken } from '~/lib/auth/jwt'
import { createSession } from '~/lib/auth/session'
import { createUser, getUserByEmail, getUserById, updateUser } from '~/server/utils/database'
import type { 
  TokenVerificationPayload, 
  TokenVerificationResponse, 
  JWTPayload,
  UserProfile
} from '~/types/auth'


/**
 * Create or get user profile using PostgreSQL
 */
async function createOrGetUserProfile(email: string): Promise<UserProfile> {
  console.log('🔧 Debug: Attempting to create/get user profile via PostgreSQL')
  
  try {
    // Try to get existing user by email
    let userProfile = await getUserByEmail(email)
    
    if (userProfile) {
      console.log('✅ Existing user found:', userProfile.uid)
      
      // Update last login time
      await updateUser(userProfile.uid, { 
        lastLoginAt: new Date(),
        emailVerified: true 
      })
      
      // Update the profile with fresh lastLoginAt
      userProfile.lastLoginAt = new Date()
      userProfile.emailVerified = true
      
      return userProfile
    }
    
    // User doesn't exist, create new one
    console.log('🔧 Debug: User not found, creating new user...')
    
    const now = new Date()
    const trialEndDate = new Date(now.getTime() + (14 * 24 * 60 * 60 * 1000)) // 14 days trial
    
    const newUserData: {
      email: string;
      displayName?: string;
      photoURL?: string;
      role?: 'user' | 'admin';
    } = {
      email,
      role: 'user'
    }
    
    const userId = await createUser(newUserData)
    console.log('✅ New user created:', userId)
    
    // Get the full user profile
    userProfile = await getUserById(userId)
    if (!userProfile) {
      throw new Error('Failed to retrieve created user profile')
    }
    
    console.log('✅ User profile processed successfully via PostgreSQL')
    return userProfile
    
  } catch (error) {
    console.error('❌ PostgreSQL user creation failed:', error)
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

    // Create JWT session token
    console.log('🔧 Debug: Creating JWT session token...')
    const sessionInfo = await createSession(userProfile, { 
      expiresIn: '7d' // 7-day session for magic link auth
    })
    console.log('✅ JWT session token created successfully')

    console.log('✅ Magic link verification completed successfully')
    return {
      success: true,
      message: 'Verificación exitosa',
      user: userProfile,
      sessionToken: sessionInfo.token,
      expiresAt: sessionInfo.expiresAt
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