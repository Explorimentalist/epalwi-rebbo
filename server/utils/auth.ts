import type { H3Event } from 'h3'
import { getHeader } from 'h3'
import { verifySessionToken, extractBearerToken } from '~/lib/auth/jwt'
import { getUserById } from '~/server/utils/database'
import { getGraceDaysRemaining as getGraceDaysRemainingUtil, isInGracePeriod as isInGracePeriodUtil } from '~/utils/gracePeriod'
import type { UserProfile } from '~/types/auth'

export interface UserSubscriptionInfo {
  uid: string
  email?: string
  hasActiveSubscription: boolean
  isTrialActive: boolean
  isInGracePeriod: boolean
  graceDaysRemaining: number
  trialDaysRemaining: number
  subscriptionStatus: 'trial' | 'active' | 'expired' | 'cancelled'
  canAccessFeatures: boolean
}

export interface AuthValidationResult {
  success: boolean
  user?: UserSubscriptionInfo
  error?: string
  errorCode?: 'INVALID_TOKEN' | 'USER_NOT_FOUND' | 'SUBSCRIPTION_EXPIRED' | 'VERIFICATION_FAILED'
}

/**
 * Extract and validate JWT session token from request headers
 */
export async function validateUserToken(event: H3Event): Promise<{ uid: string; email?: string } | null> {
  const authHeader = getHeader(event, 'authorization')
  const token = extractBearerToken(authHeader)
  
  console.log('🔧 Debug [validateUserToken]: Auth header present:', !!authHeader)
  console.log('🔧 Debug [validateUserToken]: Token extracted:', !!token, token ? `${token.substring(0, 20)}...` : 'null')
  
  if (!token) return null

  try {
    console.log('🔧 Debug [validateUserToken]: Attempting to verify session token...')
    const payload = verifySessionToken(token)
    console.log('✅ Debug [validateUserToken]: Session token verified successfully for uid:', payload.uid)
    
    const result: { uid: string; email?: string } = { uid: payload.uid }
    if (payload.email) {
      result.email = payload.email
    }
    return result
  } catch (err) {
    console.error('❌ [validateUserToken]: Token validation failed:', err)
    console.error('❌ [validateUserToken]: Error type:', err?.constructor?.name)
    console.error('❌ [validateUserToken]: Error message:', err?.message)
    return null
  }
}

/**
 * Get comprehensive user subscription status from PostgreSQL
 * - Computes 14-day trial from createdAt if no explicit trial info exists
 * - Applies 3-day grace period after trial end
 * - Treats subscription.status in ['active','trialing'] as active
 */
export async function getUserSubscriptionStatus(uid: string): Promise<UserSubscriptionInfo> {
  const user = await getUserById(uid)

  if (!user) {
    throw new Error('User not found')
  }

  const now = new Date()

  // Ensure dates are proper Date objects (PostgreSQL returns strings)
  const createdAt: Date = user.createdAt instanceof Date ? user.createdAt : new Date(user.createdAt)
  const trialEndDate = user.trial?.endDate 
    ? (user.trial.endDate instanceof Date ? user.trial.endDate : new Date(user.trial.endDate))
    : new Date(createdAt.getTime() + 14 * 24 * 60 * 60 * 1000)

  const msPerDay = 24 * 60 * 60 * 1000
  const trialMsRemaining = trialEndDate.getTime() - now.getTime()
  const trialDaysRemaining = Math.max(0, Math.ceil(trialMsRemaining / msPerDay))
  const isTrialActive = trialDaysRemaining > 0

  // Grace period: 3 days after trial end (via utils)
  const isInGracePeriod = !isTrialActive && isInGracePeriodUtil(trialEndDate, now, 3)
  const graceDaysRemaining = !isTrialActive ? getGraceDaysRemainingUtil(trialEndDate, now, 3) : 0

  // Paid subscription status
  const rawStatus: string | undefined = user.subscription?.status
  const hasActiveSubscription = rawStatus === 'active' || rawStatus === 'trialing'

  // Derived user-facing status
  let subscriptionStatus: UserSubscriptionInfo['subscriptionStatus'] = 'trial'
  if (hasActiveSubscription) subscriptionStatus = 'active'
  else if (rawStatus === 'cancelled' || rawStatus === 'canceled') subscriptionStatus = 'cancelled'
  else if (!isTrialActive && !isInGracePeriod) subscriptionStatus = 'expired'

  const canAccessFeatures = hasActiveSubscription || isTrialActive || isInGracePeriod

  return {
    uid,
    email: user.email,
    hasActiveSubscription,
    isTrialActive,
    isInGracePeriod,
    graceDaysRemaining,
    trialDaysRemaining,
    subscriptionStatus,
    canAccessFeatures
  }
}

/**
 * Validate incoming request and compute subscription access with graceful errors
 */
export async function validateUserSubscription(event: H3Event): Promise<AuthValidationResult> {
  try {
    // Development fallback: allow mock auth via header when devAuthMock is enabled
    try {
      const config = useRuntimeConfig() as any
      const devMock = Boolean(config?.public?.devAuthMock)
      const devHeader = getHeader(event, 'x-dev-auth-user')
      if (devMock && devHeader) {
        try {
          const decodedJson = Buffer.from(devHeader, 'base64').toString('utf-8')
          const devUser = JSON.parse(decodedJson)
          const now = new Date()
          // Derive trial period from provided data, fallback to 14 days from now
          const trialStart = devUser?.trial?.startDate ? new Date(devUser.trial.startDate) : (devUser?.createdAt ? new Date(devUser.createdAt) : now)
          const trialEnd = devUser?.trial?.endDate ? new Date(devUser.trial.endDate) : new Date(trialStart.getTime() + 14 * 24 * 60 * 60 * 1000)
          const msPerDay = 24 * 60 * 60 * 1000
          const trialMsRemaining = trialEnd.getTime() - now.getTime()
          const trialDaysRemaining = Math.max(0, Math.ceil(trialMsRemaining / msPerDay))
          const isTrialActive = trialDaysRemaining > 0
          const isInGrace = !isTrialActive && isInGracePeriodUtil(trialEnd, now, 3)
          const graceDaysRemaining = !isTrialActive ? getGraceDaysRemainingUtil(trialEnd, now, 3) : 0
          const rawStatus = devUser?.subscription?.status as string | undefined
          const hasActiveSubscription = rawStatus === 'active' || rawStatus === 'trialing'
          let subscriptionStatus: UserSubscriptionInfo['subscriptionStatus'] = 'trial'
          if (hasActiveSubscription) subscriptionStatus = 'active'
          else if (rawStatus === 'cancelled' || rawStatus === 'canceled') subscriptionStatus = 'cancelled'
          else if (!isTrialActive && !isInGrace) subscriptionStatus = 'expired'

          const userInfo: UserSubscriptionInfo = {
            uid: String(devUser?.uid || 'dev-user'),
            email: devUser?.email,
            hasActiveSubscription,
            isTrialActive,
            isInGracePeriod: isInGrace,
            graceDaysRemaining,
            trialDaysRemaining,
            subscriptionStatus,
            canAccessFeatures: hasActiveSubscription || isTrialActive || isInGrace
          }
          return { success: true, user: userInfo }
        } catch (e) {
          console.warn('Dev auth header present but invalid; falling back to normal validation')
        }
      }
    } catch {}

    const tokenData = await validateUserToken(event)
    if (!tokenData) {
      return { success: false, error: 'Invalid or missing authentication token', errorCode: 'INVALID_TOKEN' }
    }

    console.log('🔧 Debug [validateUserSubscription]: JWT validated successfully, uid:', tokenData.uid)
    console.log('🔧 Debug [validateUserSubscription]: Attempting database lookup...')
    
    const userInfo = await getUserSubscriptionStatus(tokenData.uid)
    console.log('✅ Debug [validateUserSubscription]: Database lookup successful')
    return { success: true, user: userInfo }
  } catch (err: any) {
    console.error('Subscription validation failed:', err)
    if (err?.message === 'User not found') {
      return { success: false, error: 'User not found', errorCode: 'USER_NOT_FOUND' }
    }
    return { success: false, error: 'Verification temporarily unavailable', errorCode: 'VERIFICATION_FAILED' }
  }
}

/**
 * Log access attempts (stub for analytics)
 */
export async function logAccessAttempt(userInfo: UserSubscriptionInfo, resource: string, granted: boolean) {
  console.log(`Access ${granted ? 'granted' : 'denied'} for user ${userInfo.uid} to ${resource}`)
}
