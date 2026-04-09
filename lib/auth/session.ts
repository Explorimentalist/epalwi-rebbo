import { generateSessionToken, verifySessionToken, refreshSessionToken, type JWTSessionPayload } from './jwt'
import { getUserById, updateUser } from '~/server/utils/database'
import type { UserProfile } from '~/types/auth'

export interface SessionInfo {
  token: string
  user: UserProfile
  expiresAt: Date
  refreshToken?: string
}

export interface CreateSessionOptions {
  expiresIn?: string
  remember?: boolean
}

export interface SessionValidationResult {
  valid: boolean
  user?: UserProfile
  token?: string
  error?: string
  needsRefresh?: boolean
}

/**
 * Create a new JWT session for authenticated user
 * @param user - User profile from database
 * @param options - Session creation options
 * @returns Session information with JWT token
 */
export async function createSession(
  user: UserProfile,
  options: CreateSessionOptions = {}
): Promise<SessionInfo> {
  const { expiresIn = '7d', remember = false } = options

  // Update user's last login timestamp
  await updateUser(user.uid, { lastLoginAt: new Date() })

  // Generate JWT session token
  const token = generateSessionToken(
    {
      uid: user.uid,
      email: user.email,
      role: user.role,
      subscriptionStatus: user.subscription.status
    },
    { 
      expiresIn: remember ? '30d' : expiresIn // Extended session for "remember me"
    }
  )

  // Calculate expiration date
  const expirationMs = remember ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000
  const expiresAt = new Date(Date.now() + expirationMs)

  return {
    token,
    user,
    expiresAt
  }
}

/**
 * Validate and refresh session token
 * @param token - Current JWT session token
 * @returns Session validation result with refreshed token if needed
 */
export async function validateSession(token: string): Promise<SessionValidationResult> {
  try {
    // Verify JWT token
    const payload: JWTSessionPayload = verifySessionToken(token)

    // Load current user profile from database
    const user = await getUserById(payload.uid)
    if (!user) {
      return {
        valid: false,
        error: 'User not found'
      }
    }

    // Check if user is still active
    if (!user.isActive) {
      return {
        valid: false,
        error: 'Account is inactive'
      }
    }

    // Check if session needs refresh (within 24 hours of expiry)
    const now = Math.floor(Date.now() / 1000)
    const refreshThreshold = 24 * 60 * 60 // 24 hours in seconds
    const needsRefresh = payload.exp - now <= refreshThreshold

    let refreshedToken: string | undefined

    // If session needs refresh, generate new token
    if (needsRefresh) {
      refreshedToken = refreshSessionToken(token)
    }

    return {
      valid: true,
      user,
      token: refreshedToken || token,
      needsRefresh: !!refreshedToken
    }

  } catch (error: any) {
    return {
      valid: false,
      error: error.message || 'Invalid session'
    }
  }
}

/**
 * Invalidate session (logout)
 * Note: With stateless JWT, we can't actually invalidate the token
 * In production, you might want to implement a token blacklist
 * @param user - User profile
 */
export async function invalidateSession(user: UserProfile): Promise<void> {
  // Update user's last activity timestamp
  await updateUser(user.uid, { lastLoginAt: new Date() })
  
  // In a stateless JWT system, we can't truly invalidate tokens
  // For enhanced security, you could implement:
  // 1. Token blacklist in Redis/database
  // 2. Shorter token lifetimes
  // 3. Token versioning in user profile
  
  console.log(`Session invalidated for user ${user.uid}`)
}

/**
 * Get user session information from JWT token
 * @param token - JWT session token
 * @returns User profile and session info or null if invalid
 */
export async function getSessionInfo(token: string): Promise<SessionInfo | null> {
  const validation = await validateSession(token)
  
  if (!validation.valid || !validation.user) {
    return null
  }

  // Calculate expiration from token
  try {
    const payload = verifySessionToken(token)
    const expiresAt = new Date(payload.exp * 1000)

    return {
      token: validation.token || token,
      user: validation.user,
      expiresAt
    }
  } catch (error) {
    return null
  }
}

/**
 * Check if user subscription allows access
 * @param user - User profile
 * @returns Access permission details
 */
export function checkSubscriptionAccess(user: UserProfile): {
  hasAccess: boolean
  reason: 'active_subscription' | 'trial_active' | 'expired' | 'cancelled'
  daysRemaining?: number
} {
  // Check active subscription
  if (user.subscription.status === 'active') {
    return {
      hasAccess: true,
      reason: 'active_subscription'
    }
  }

  // Check trial period
  if (!user.trial.isExpired && user.trial.daysRemaining > 0) {
    return {
      hasAccess: true,
      reason: 'trial_active',
      daysRemaining: user.trial.daysRemaining
    }
  }

  // Access expired
  const reason = user.subscription.status === 'cancelled' ? 'cancelled' : 'expired'
  return {
    hasAccess: false,
    reason
  }
}

/**
 * Update session with latest user data from database
 * Useful when user profile changes (subscription, trial, etc.)
 * @param currentToken - Current JWT token
 * @returns New session with updated user data
 */
export async function refreshSessionWithLatestUser(currentToken: string): Promise<SessionInfo | null> {
  try {
    const payload = verifySessionToken(currentToken)
    const latestUser = await getUserById(payload.uid)

    if (!latestUser || !latestUser.isActive) {
      return null
    }

    // Create new session with latest user data
    return await createSession(latestUser)
  } catch (error) {
    return null
  }
}

/**
 * Create session from user ID (for internal use)
 * @param userId - User ID
 * @param options - Session options
 * @returns Session info or null if user not found
 */
export async function createSessionFromUserId(
  userId: string,
  options: CreateSessionOptions = {}
): Promise<SessionInfo | null> {
  const user = await getUserById(userId)
  
  if (!user || !user.isActive) {
    return null
  }

  return await createSession(user, options)
}

/**
 * Extend session expiration time
 * @param currentToken - Current JWT token
 * @param additionalTime - Additional time in milliseconds
 * @returns New session with extended expiration
 */
export async function extendSession(
  currentToken: string,
  additionalTime: number = 7 * 24 * 60 * 60 * 1000 // 7 days default
): Promise<SessionInfo | null> {
  try {
    const payload = verifySessionToken(currentToken)
    const user = await getUserById(payload.uid)

    if (!user || !user.isActive) {
      return null
    }

    // Create new session (effectively extending it)
    return await createSession(user, { expiresIn: '30d' }) // Extended session
  } catch (error) {
    return null
  }
}

/**
 * Get session statistics (for admin/analytics)
 * @param userId - User ID (optional, for specific user stats)
 * @returns Session statistics
 */
export async function getSessionStats(userId?: string): Promise<{
  userCount?: number
  lastLogin?: Date
  sessionCount?: number
}> {
  // This is a placeholder - in production you might track sessions in database
  // For now, we can only get basic user info
  
  if (userId) {
    const user = await getUserById(userId)
    return {
      lastLogin: user?.lastLoginAt,
      sessionCount: 1 // Placeholder
    }
  }

  // For all users, this would require additional tracking
  return {
    userCount: 0, // Placeholder
    sessionCount: 0 // Placeholder
  }
}

/**
 * Verify session and get user with access check
 * Combines session validation with subscription access verification
 * @param token - JWT session token
 * @returns User profile if session valid and has access
 */
export async function verifySessionWithAccess(token: string): Promise<{
  user?: UserProfile
  hasAccess: boolean
  error?: string
  accessReason?: string
}> {
  const validation = await validateSession(token)
  
  if (!validation.valid || !validation.user) {
    return {
      hasAccess: false,
      error: validation.error || 'Invalid session'
    }
  }

  const accessCheck = checkSubscriptionAccess(validation.user)
  
  return {
    user: validation.user,
    hasAccess: accessCheck.hasAccess,
    accessReason: accessCheck.reason
  }
}