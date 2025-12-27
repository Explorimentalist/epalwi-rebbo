import { defineEventHandler, readBody } from 'h3'
import Stripe from 'stripe'
import { getConnection } from '~/lib/db/connection'

// Initialize Stripe with secret key
const config = useRuntimeConfig()
const stripe = new Stripe(config.stripeSecretKey, {
  apiVersion: '2025-08-27.basil'
})

interface CreatePortalSessionRequest {
  returnUrl?: string
  userId?: string
}

interface CreatePortalSessionResponse {
  url: string
}

export default defineEventHandler(async (event): Promise<CreatePortalSessionResponse> => {
  try {
    const body = await readBody<CreatePortalSessionRequest>(event)
    
    // Get user's Stripe customer ID from PostgreSQL
    let customerId: string | null = null
    
    if (body.userId) {
      try {
        const db = await getConnection()
        const userQuery = 'SELECT stripe_customer_id FROM users WHERE uid = $1'
        const result = await db.query(userQuery, [body.userId])
        
        if (result.rows.length > 0) {
          customerId = result.rows[0].stripe_customer_id
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
      }
    }
    
    if (!customerId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'No subscription found. Please subscribe first.'
      })
    }

    // Create Stripe Customer Portal Session
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: body.returnUrl || `${config.public.appUrl}/subscription/manage`
    })

    if (!session.url) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to create customer portal session'
      })
    }

    return {
      url: session.url
    }

  } catch (error: any) {
    console.error('Error creating portal session:', error)
    
    // Handle Stripe-specific errors
    if (error.type === 'StripeInvalidRequestError') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid request: ' + error.message
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
