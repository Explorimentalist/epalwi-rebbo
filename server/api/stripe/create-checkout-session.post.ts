import { defineEventHandler, readBody } from 'h3'
import Stripe from 'stripe'
import { getConnection } from '~/lib/db/connection'
import { validateUserToken } from '~/server/utils/auth'

// Initialize Stripe with secret key
const config = useRuntimeConfig()
const stripe = new Stripe(config.stripeSecretKey, {
  apiVersion: '2025-08-27.basil'
})

interface CreateCheckoutSessionRequest {
  priceId: string
  planType: 'monthly' | 'annual'
  successUrl: string
  cancelUrl: string
}

interface CreateCheckoutSessionResponse {
  sessionId: string
  url: string
}

export default defineEventHandler(async (event): Promise<CreateCheckoutSessionResponse> => {
  try {
    // Authenticate the request — get the Firebase uid from the JWT
    const tokenData = await validateUserToken(event)
    if (!tokenData) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Authentication required'
      })
    }

    const body = await readBody<CreateCheckoutSessionRequest>(event)

    // Validate required fields
    if (!body.priceId || !body.planType || !body.successUrl || !body.cancelUrl) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required fields: priceId, planType, successUrl, cancelUrl'
      })
    }

    // Resolve the authenticated user's internal UUID and email from the database.
    // The JWT uid maps to users.uid (Firebase UID); the webhook handler needs users.id (internal UUID).
    const db = await getConnection()
    const userResult = await db.query(
      'SELECT id, email, stripe_customer_id FROM users WHERE uid = $1 AND is_active = true',
      [tokenData.uid]
    )
    if (userResult.rows.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found'
      })
    }
    const userId: string = userResult.rows[0].id               // internal UUID — required by webhook handler
    const customerEmail: string = userResult.rows[0].email
    let customerId: string | undefined = userResult.rows[0].stripe_customer_id || undefined

    // Try to use an existing Stripe customer or create one with ES as default country
    try {
      if (!customerId) {
        // Create a lightweight customer with default billing country ES
        const customer = await stripe.customers.create({
          email: customerEmail,
          address: { country: 'ES' },
          metadata: { userId }
        })
        customerId = customer.id

        // Persist the new Stripe customer ID on the user record
        await db.query(
          'UPDATE users SET stripe_customer_id = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
          [customerId, userId]
        )
      }
    } catch (e) {
      // If customer creation fails, proceed without a pre-created customer
      console.warn('Customer prefill skipped:', (e as any)?.message)
    }

    // Create Stripe Checkout Session
               const session = await stripe.checkout.sessions.create({
             mode: 'subscription',
             payment_method_types: ['card'],
             line_items: [
               {
                 price: body.priceId,
                 quantity: 1
               }
             ],
             success_url: body.successUrl,
             cancel_url: body.cancelUrl,
             ...(customerId ? { customer: customerId } : {}),
             client_reference_id: userId,
             subscription_data: {
               trial_period_days: 14, // 14-day free trial
               metadata: {
                 planType: body.planType,
                 userId: userId
               }
             },
             allow_promotion_codes: true,
             billing_address_collection: 'required',
             // Allow updating key customer fields when using an existing customer
             customer_update: {
               name: 'auto',
               address: 'auto'
             },
             // Optional: if you ever collect shipping, restrict to Spain
             // shipping_address_collection: { allowed_countries: ['ES'] },
             locale: 'es', // Spanish locale
             payment_method_collection: 'always',
             tax_id_collection: {
               enabled: true
             }
           })

    if (!session.url) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Session URL not generated'
      })
    }

    const response: CreateCheckoutSessionResponse = {
      sessionId: session.id,
      url: session.url
    }

    return response

  } catch (error: any) {
    console.error('Error creating checkout session:', error)
    
    // Handle Stripe-specific errors
    if (error.type === 'StripeCardError') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Error de tarjeta: ' + error.message
      })
    } else if (error.type === 'StripeInvalidRequestError') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Solicitud inválida: ' + error.message
      })
    } else if (error.type === 'StripeAPIError') {
      throw createError({
        statusCode: 500,
        statusMessage: 'Error del servidor de pagos: ' + error.message
      })
    } else if (error.type === 'StripeConnectionError') {
      throw createError({
        statusCode: 500,
        statusMessage: 'Error de conexión con el servidor de pagos'
      })
    } else if (error.type === 'StripeAuthenticationError') {
      throw createError({
        statusCode: 500,
        statusMessage: 'Error de autenticación con el servidor de pagos'
      })
    } else if (error.type === 'StripeRateLimitError') {
      throw createError({
        statusCode: 429,
        statusMessage: 'Demasiadas solicitudes. Inténtalo de nuevo en unos momentos.'
      })
    } else {
      // Generic error
      throw createError({
        statusCode: 500,
        statusMessage: 'Error interno del servidor: ' + (error.message || 'Unknown error')
      })
    }
  }
})
