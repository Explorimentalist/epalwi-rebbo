import { defineEventHandler, readBody } from 'h3'
import Stripe from 'stripe'

// Initialize Stripe with secret key
const config = useRuntimeConfig()
const stripe = new Stripe(config.stripeSecretKey, {
  apiVersion: '2025-07-30.basil'
})

interface ReactivateSubscriptionRequest {
  subscriptionId: string
}

interface ReactivateSubscriptionResponse {
  success: boolean
  subscription?: any
  message?: string
}

export default defineEventHandler(async (event): Promise<ReactivateSubscriptionResponse> => {
  try {
    const body = await readBody<ReactivateSubscriptionRequest>(event)
    
    // Validate required fields
    if (!body.subscriptionId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required field: subscriptionId'
      })
    }

    // Reactivate subscription by removing the cancellation
    const subscription = await stripe.subscriptions.update(body.subscriptionId, {
      cancel_at_period_end: false
    })

    return {
      success: true,
      subscription,
      message: 'Subscription reactivated successfully'
    }

  } catch (error: any) {
    console.error('Error reactivating subscription:', error)
    
    // Handle Stripe-specific errors
    if (error.type === 'StripeInvalidRequestError') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid subscription or cannot be reactivated: ' + error.message
      })
    } else if (error.type === 'StripeAPIError') {
      throw createError({
        statusCode: 500,
        statusMessage: 'Payment service error: ' + error.message
      })
    } else if (error.type === 'StripeConnectionError') {
      throw createError({
        statusCode: 500,
        statusMessage: 'Connection error with payment service'
      })
    } else if (error.type === 'StripeAuthenticationError') {
      throw createError({
        statusCode: 500,
        statusMessage: 'Authentication error with payment service'
      })
    } else {
      // Re-throw createError instances
      if (error.statusCode) {
        throw error
      }
      
      // Generic error
      throw createError({
        statusCode: 500,
        statusMessage: 'Internal server error: ' + (error.message || 'Unknown error')
      })
    }
  }
})