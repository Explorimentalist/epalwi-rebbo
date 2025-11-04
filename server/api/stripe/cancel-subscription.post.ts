import { defineEventHandler, readBody } from 'h3'
import Stripe from 'stripe'

// Initialize Stripe with secret key
const config = useRuntimeConfig()
const stripe = new Stripe(config.stripeSecretKey, {
  apiVersion: '2025-07-30.basil'
})

interface CancelSubscriptionRequest {
  subscriptionId: string
  atPeriodEnd?: boolean
}

interface CancelSubscriptionResponse {
  success: boolean
  subscription?: any
  message?: string
}

export default defineEventHandler(async (event): Promise<CancelSubscriptionResponse> => {
  try {
    const body = await readBody<CancelSubscriptionRequest>(event)
    
    // Validate required fields
    if (!body.subscriptionId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required field: subscriptionId'
      })
    }

    // Cancel subscription (at period end by default to be user-friendly)
    const subscription = await stripe.subscriptions.update(body.subscriptionId, {
      cancel_at_period_end: body.atPeriodEnd !== false
    })

    return {
      success: true,
      subscription,
      message: body.atPeriodEnd !== false 
        ? 'Subscription will be cancelled at the end of the current billing period'
        : 'Subscription cancelled immediately'
    }

  } catch (error: any) {
    console.error('Error cancelling subscription:', error)
    
    // Handle Stripe-specific errors
    if (error.type === 'StripeInvalidRequestError') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid subscription or already cancelled: ' + error.message
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