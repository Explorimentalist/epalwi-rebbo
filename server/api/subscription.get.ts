import { defineEventHandler, createError } from 'h3'
import { validateUserToken } from '~/server/utils/auth'
import { getUserById } from '~/server/utils/database'
import type { UserSubscription } from '~/types/subscription'

/**
 * GET /api/subscription
 *
 * Returns the authenticated user's subscription status.
 * Requires a valid JWT token in the Authorization header.
 *
 * Response shape:
 * {
 *   success: boolean,
 *   subscription: UserSubscription | null
 * }
 */
export default defineEventHandler(async (event) => {
  try {
    // 1. Validate JWT authentication
    const tokenData = await validateUserToken(event)

    if (!tokenData) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized: Invalid or missing authentication token'
      })
    }

    const { uid } = tokenData
    console.log(`📡 [GET /api/subscription] Fetching subscription for user: ${uid}`)

    // 2. Query user_profiles view which joins subscriptions
    const user = await getUserById(uid)

    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found'
      })
    }

    // 3. Format subscription data for response
    // The user_profiles view returns subscription as a JSON object
    const subscriptionData = user.subscription

    if (!subscriptionData) {
      // User has no subscription record - return null subscription
      console.log(`📡 [GET /api/subscription] User ${uid} has no subscription`)
      return {
        success: true,
        subscription: null
      }
    }

    // Helper to ensure dates are properly formatted
    const toDateOrUndefined = (value: any): Date | undefined => {
      if (!value) return undefined
      if (value instanceof Date) return value
      // PostgreSQL may return date strings
      const date = new Date(value)
      return isNaN(date.getTime()) ? undefined : date
    }

    // Build the subscription response
    const subscription: UserSubscription = {
      status: subscriptionData.status || 'trial',
      planId: subscriptionData.planId,
      planType: subscriptionData.planId as 'monthly' | 'annual' | undefined,
      currentPeriodStart: toDateOrUndefined(subscriptionData.currentPeriodStart),
      currentPeriodEnd: toDateOrUndefined(subscriptionData.currentPeriodEnd),
      cancelAtPeriodEnd: subscriptionData.cancelAtPeriodEnd ?? false,
      stripeCustomerId: subscriptionData.stripeCustomerId,
      stripeSubscriptionId: subscriptionData.stripeSubscriptionId
    }

    // Add trial dates from user.trial if available
    if (user.trial) {
      subscription.trialStart = toDateOrUndefined(user.trial.startDate)
      subscription.trialEnd = toDateOrUndefined(user.trial.endDate)
    }

    console.log(`✅ [GET /api/subscription] Returning subscription for user ${uid}: status=${subscription.status}`)

    return {
      success: true,
      subscription
    }

  } catch (error: any) {
    // Re-throw H3 errors
    if (error.statusCode) {
      throw error
    }

    // Log unexpected errors
    console.error('❌ [GET /api/subscription] Error:', error)

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error while fetching subscription'
    })
  }
})
