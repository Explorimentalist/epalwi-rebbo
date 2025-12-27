import { defineEventHandler, readBody } from 'h3'
import Stripe from 'stripe'
import { getConnection } from '~/lib/db/connection'

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
  userId?: string
}

interface CreateCheckoutSessionResponse {
  sessionId: string
  url: string
}

export default defineEventHandler(async (event): Promise<CreateCheckoutSessionResponse> => {
  try {
    const body = await readBody<CreateCheckoutSessionRequest>(event)
    
    // Validate required fields
    if (!body.priceId || !body.planType || !body.successUrl || !body.cancelUrl) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required fields: priceId, planType, successUrl, cancelUrl'
      })
    }

    // Get userId from auth context if not provided
    let userId = body.userId
    if (!userId || userId === 'anonymous') {
      // In a real app, you'd get this from the JWT token or session
      // For now, we'll use a placeholder
      userId = 'authenticated-user'
    }

    // Try to use an existing Stripe customer or create one with ES as default country
    let customerId: string | undefined
    let customerEmail: string | undefined

    try {
      if (userId && userId !== 'authenticated-user') {
        const db = await getConnection()
        const userQuery = 'SELECT stripe_customer_id, email FROM users WHERE uid = $1'
        const result = await db.query(userQuery, [userId])
        
        if (result.rows.length > 0) {
          const userData = result.rows[0]
          customerId = userData.stripe_customer_id
          customerEmail = userData.email
        }
      }

      if (!customerId) {
        // Create a lightweight customer with default billing country ES
        const customerData: any = {
          address: { country: 'ES' }
        }
        
        if (customerEmail) {
          customerData.email = customerEmail
        }
        
        if (userId) {
          customerData.metadata = { userId }
        }
        
        const customer = await stripe.customers.create(customerData)
        customerId = customer.id

        // Persist on user profile if available
        if (userId && userId !== 'authenticated-user') {
          const db = await getConnection()
          const updateQuery = 'UPDATE users SET stripe_customer_id = $1, updated_at = CURRENT_TIMESTAMP WHERE uid = $2'
          await db.query(updateQuery, [customerId, userId])
        }
      }
    } catch (e) {
      // If admin access fails, proceed without a pre-created customer
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
