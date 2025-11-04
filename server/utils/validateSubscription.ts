import type { H3Event } from 'h3'
import { createError } from 'h3'
import { validateUserSubscription, logAccessAttempt, type UserSubscriptionInfo } from './auth'

export type ValidationReason =
  | 'OK'
  | 'GRACE'
  | 'EXPIRED'
  | 'INVALID_TOKEN'
  | 'USER_NOT_FOUND'
  | 'VERIFICATION_FAILED'

export interface SubscriptionValidationOptions {
  // Allow access during grace period
  allowGrace?: boolean
  // Optional resource label for analytics/logging
  resource?: string
}

export interface SubscriptionValidationResult {
  ok: boolean
  reason: ValidationReason
  statusCode: number
  errorCode?: 'INVALID_TOKEN' | 'USER_NOT_FOUND' | 'SUBSCRIPTION_EXPIRED' | 'VERIFICATION_FAILED'
  user?: UserSubscriptionInfo
}

/**
 * Centralized subscription validation with consistent shape and error mapping.
 */
export async function validateSubscription(
  event: H3Event,
  options: SubscriptionValidationOptions = {}
): Promise<SubscriptionValidationResult> {
  const { allowGrace = true, resource = 'unknown' } = options

  const authResult = await validateUserSubscription(event)

  if (!authResult.success) {
    // Map auth validation failures to HTTP-ish codes and reasons
    const map: Record<string, { reason: ValidationReason; statusCode: number }> = {
      INVALID_TOKEN: { reason: 'INVALID_TOKEN', statusCode: 401 },
      USER_NOT_FOUND: { reason: 'USER_NOT_FOUND', statusCode: 404 },
      VERIFICATION_FAILED: { reason: 'VERIFICATION_FAILED', statusCode: 503 }
    }
    const key = authResult.errorCode || 'VERIFICATION_FAILED'
    const mapped = map[key]
    return {
      ok: false,
      reason: mapped?.reason || 'VERIFICATION_FAILED',
      statusCode: mapped?.statusCode || 503,
      errorCode: authResult.errorCode || 'VERIFICATION_FAILED'
    }
  }

  const user = authResult.user!

  // Determine access based on active/trial/grace
  if (user.hasActiveSubscription || user.isTrialActive) {
    await logAccessAttempt(user, resource, true)
    return { ok: true, reason: 'OK', statusCode: 200, user }
  }

  if (user.isInGracePeriod) {
    await logAccessAttempt(user, resource, true)
    return {
      ok: allowGrace,
      reason: 'GRACE',
      statusCode: allowGrace ? 200 : 403,
      user
    }
  }

  // Expired - block
  await logAccessAttempt(user, resource, false)
  return {
    ok: false,
    reason: 'EXPIRED',
    statusCode: 403,
    errorCode: 'SUBSCRIPTION_EXPIRED',
    user
  }
}

/**
 * Helper that throws H3 error on failure, returns user on success.
 */
export async function enforceSubscription(
  event: H3Event,
  options: SubscriptionValidationOptions = {}
): Promise<UserSubscriptionInfo> {
  const result = await validateSubscription(event, options)
  if (result.ok && result.user) return result.user

  throw createError({
    statusCode: result.statusCode,
    statusMessage: result.reason === 'EXPIRED' ? 'Subscription required' : 'Authentication failed',
    data: {
      success: false,
      error: result.reason,
      errorCode: result.errorCode || (result.reason === 'EXPIRED' ? 'SUBSCRIPTION_EXPIRED' : undefined)
    }
  })
}

