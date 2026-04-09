import type { H3Event } from 'h3'
import { getHeader } from 'h3'
import { verifySessionToken, extractBearerToken, type JWTSessionPayload } from './jwt'
import { getUserById } from '~/server/utils/database'
import type { UserProfile } from '~/types/auth'

export interface AuthenticatedUser {
  uid: string
  email: string
  role: 'user' | 'admin'
  subscriptionStatus: 'trial' | 'active' | 'expired' | 'cancelled'
  profile: UserProfile
}

export interface AuthMiddlewareResult {
  success: boolean
  user?: AuthenticatedUser
  error?: string
  errorCode?: 'MISSING_TOKEN' | 'INVALID_TOKEN' | 'EXPIRED_TOKEN' | 'USER_NOT_FOUND' | 'DATABASE_ERROR'
}

export interface AuthMiddlewareOptions {
  required?: boolean
  allowExpiredToken?: boolean
  requiredRoles?: Array<'user' | 'admin'>
  requireActiveSubscription?: boolean
  allowTrial?: boolean
}

/**
 * JWT Authentication Middleware for API routes
 * Validates JWT session tokens and loads user profile from PostgreSQL
 */
export async function authenticateRequest(
  event: H3Event,
  options: AuthMiddlewareOptions = {}
): Promise<AuthMiddlewareResult> {
  const {
    required = true,
    allowExpiredToken = false,
    requiredRoles = [],
    requireActiveSubscription = false,
    allowTrial = true
  } = options

  try {
    // Extract token from Authorization header
    const authHeader = getHeader(event, 'authorization')
    const token = extractBearerToken(authHeader)

    if (!token) {
      if (!required) {
        return { success: true } // Optional auth, no token provided
      }
      return {
        success: false,
        error: 'Authentication token required',
        errorCode: 'MISSING_TOKEN'
      }
    }

    // Verify JWT session token
    let payload: JWTSessionPayload
    try {
      payload = verifySessionToken(token)
    } catch (error: any) {
      if (!allowExpiredToken || !error.message.includes('expired')) {
        return {
          success: false,
          error: error.message || 'Invalid authentication token',
          errorCode: error.message.includes('expired') ? 'EXPIRED_TOKEN' : 'INVALID_TOKEN'
        }
      }
      // For expired tokens when allowed, we still need the payload for user lookup
      // This is a simplified approach - in production you might want more sophisticated handling
      return {
        success: false,
        error: 'Session expired',
        errorCode: 'EXPIRED_TOKEN'
      }
    }

    // Load user profile from PostgreSQL database
    let userProfile: UserProfile | null
    try {
      userProfile = await getUserById(payload.uid)
    } catch (error) {
      console.error('Database error during authentication:', error)
      return {
        success: false,
        error: 'Database error during authentication',
        errorCode: 'DATABASE_ERROR'
      }
    }

    if (!userProfile) {
      return {
        success: false,
        error: 'User not found',
        errorCode: 'USER_NOT_FOUND'
      }
    }

    // Verify user is active
    if (!userProfile.isActive) {
      return {
        success: false,
        error: 'Account is inactive',
        errorCode: 'USER_NOT_FOUND'
      }
    }

    // Check role requirements
    if (requiredRoles.length > 0 && !requiredRoles.includes(userProfile.role)) {
      return {
        success: false,
        error: 'Insufficient permissions',
        errorCode: 'INVALID_TOKEN'
      }
    }

    // Check subscription requirements
    if (requireActiveSubscription) {
      const hasActiveSubscription = userProfile.subscription.status === 'active'
      const isTrialValid = allowTrial && 
                          userProfile.trial.daysRemaining > 0 && 
                          !userProfile.trial.isExpired

      if (!hasActiveSubscription && !isTrialValid) {
        return {
          success: false,
          error: 'Active subscription required',
          errorCode: 'INVALID_TOKEN'
        }
      }
    }

    // Create authenticated user object
    const authenticatedUser: AuthenticatedUser = {
      uid: payload.uid,
      email: payload.email,
      role: payload.role,
      subscriptionStatus: payload.subscriptionStatus,
      profile: userProfile
    }

    return {
      success: true,
      user: authenticatedUser
    }

  } catch (error: any) {
    console.error('Authentication middleware error:', error)
    return {
      success: false,
      error: 'Authentication failed',
      errorCode: 'DATABASE_ERROR'
    }
  }
}

/**
 * Middleware for routes that require authentication
 * Throws HTTP errors if authentication fails
 */
export async function requireAuth(
  event: H3Event,
  options: Omit<AuthMiddlewareOptions, 'required'> = {}
): Promise<AuthenticatedUser> {
  const result = await authenticateRequest(event, { ...options, required: true })

  if (!result.success || !result.user) {
    const statusCode = result.errorCode === 'EXPIRED_TOKEN' ? 401 : 
                      result.errorCode === 'MISSING_TOKEN' ? 401 :
                      result.errorCode === 'USER_NOT_FOUND' ? 404 : 401

    throw createError({
      statusCode,
      statusMessage: result.error || 'Authentication required'
    })
  }

  return result.user
}

/**
 * Middleware for routes that require admin role
 */
export async function requireAdmin(event: H3Event): Promise<AuthenticatedUser> {
  return await requireAuth(event, { requiredRoles: ['admin'] })
}

/**
 * Middleware for routes that require active subscription
 */
export async function requireActiveSubscription(
  event: H3Event,
  allowTrial: boolean = true
): Promise<AuthenticatedUser> {
  return await requireAuth(event, { 
    requireActiveSubscription: true,
    allowTrial
  })
}

/**
 * Middleware for routes with optional authentication
 * Returns user if authenticated, undefined if not
 */
export async function optionalAuth(event: H3Event): Promise<AuthenticatedUser | undefined> {
  const result = await authenticateRequest(event, { required: false })
  return result.user
}

/**
 * Get authenticated user from event context
 * Assumes authentication middleware has already run
 */
export function getAuthenticatedUser(event: H3Event): AuthenticatedUser | undefined {
  return (event.context as any).user
}

/**
 * Set authenticated user in event context
 * For use by authentication middleware
 */
export function setAuthenticatedUser(event: H3Event, user: AuthenticatedUser): void {
  if (!event.context) {
    event.context = {}
  }
  ;(event.context as any).user = user
}

/**
 * Check if current user has specific permissions
 */
export function hasPermission(
  user: AuthenticatedUser,
  permission: 'admin' | 'active_subscription' | 'trial_access'
): boolean {
  switch (permission) {
    case 'admin':
      return user.role === 'admin'
    
    case 'active_subscription':
      return user.subscriptionStatus === 'active'
    
    case 'trial_access':
      return user.profile.trial.daysRemaining > 0 && !user.profile.trial.isExpired
    
    default:
      return false
  }
}

/**
 * Check if user can access premium features
 */
export function canAccessPremiumFeatures(user: AuthenticatedUser): boolean {
  return hasPermission(user, 'active_subscription') || 
         hasPermission(user, 'trial_access') ||
         hasPermission(user, 'admin')
}

/**
 * Development authentication fallback
 * Allows mock authentication in development mode
 */
export async function devAuthFallback(event: H3Event): Promise<AuthenticatedUser | null> {
  try {
    const config = useRuntimeConfig() as any
    const devMock = Boolean(config?.public?.devAuthMock)
    
    if (!devMock) return null

    const devHeader = getHeader(event, 'x-dev-auth-user')
    if (!devHeader) return null

    const decodedJson = Buffer.from(devHeader, 'base64').toString('utf-8')
    const devUser = JSON.parse(decodedJson)

    // Create mock authenticated user
    const mockUser: AuthenticatedUser = {
      uid: String(devUser?.uid || 'dev-user'),
      email: devUser?.email || 'dev@example.com',
      role: devUser?.role || 'user',
      subscriptionStatus: devUser?.subscription?.status || 'trial',
      profile: {
        uid: String(devUser?.uid || 'dev-user'),
        email: devUser?.email || 'dev@example.com',
        role: devUser?.role || 'user',
        displayName: devUser?.displayName,
        photoURL: devUser?.photoURL,
        emailVerified: true,
        isActive: true,
        createdAt: new Date(),
        lastLoginAt: new Date(),
        subscription: {
          status: devUser?.subscription?.status || 'trial'
        },
        trial: {
          startDate: new Date(),
          endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          daysRemaining: 14,
          isExpired: false
        }
      }
    }

    return mockUser
  } catch (error) {
    console.warn('Dev auth fallback failed:', error)
    return null
  }
}

/**
 * Combined authentication middleware with dev fallback
 */
export async function authenticateWithFallback(
  event: H3Event,
  options: AuthMiddlewareOptions = {}
): Promise<AuthMiddlewareResult> {
  // Try dev auth fallback first in development
  const devUser = await devAuthFallback(event)
  if (devUser) {
    return { success: true, user: devUser }
  }

  // Fall back to normal JWT authentication
  return await authenticateRequest(event, options)
}