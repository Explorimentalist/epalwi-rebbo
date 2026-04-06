import { defineEventHandler, createError } from 'h3'
import { validateUserToken } from '~/server/utils/auth'
import { getUserById } from '~/server/utils/database'
import type { UserSubscription, SubscriptionStatus } from '~/types/subscription'

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
    const subscriptionData = user.subscription as any
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
      status: (subscriptionData?.status as SubscriptionStatus) || 'trial'
    }
    
    if (subscriptionData?.planId) {
      subscription.planId = subscriptionData.planId
    }
    if (subscriptionData?.planType) {
      subscription.planType = subscriptionData.planType as 'monthly' | 'annual'
    }
    if (subscriptionData?.currentPeriodStart) {
      const date = toDateOrUndefined(subscriptionData.currentPeriodStart)
      if (date) {
        subscription.currentPeriodStart = date
      }
    }
    if (subscriptionData?.currentPeriodEnd) {
      const date = toDateOrUndefined(subscriptionData.currentPeriodEnd)
      if (date) {
        subscription.currentPeriodEnd = date
      }
    }
    if (subscriptionData?.cancelAtPeriodEnd !== undefined) {
      subscription.cancelAtPeriodEnd = subscriptionData.cancelAtPeriodEnd
    }
    if (subscriptionData?.stripeCustomerId) {
      subscription.stripeCustomerId = subscriptionData.stripeCustomerId
    }
    if (subscriptionData?.stripeSubscriptionId) {
      subscription.stripeSubscriptionId = subscriptionData.stripeSubscriptionId
    }

    // Add trial dates from user.trial if available
    if (user.trial) {
      const trialStart = toDateOrUndefined(user.trial.startDate)
      if (trialStart) {
        subscription.trialStart = trialStart
      }
      const trialEnd = toDateOrUndefined(user.trial.endDate)
      if (trialEnd) {
        subscription.trialEnd = trialEnd
      }
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
