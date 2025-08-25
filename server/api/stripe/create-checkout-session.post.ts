import { defineEventHandler, readBody } from 'h3'
import Stripe from 'stripe'

// Initialize Stripe with secret key
const config = useRuntimeConfig()
const stripe = new Stripe(config.stripeSecretKey, {
  apiVersion: '2025-07-30.basil'
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
  url?: string
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
             client_reference_id: body.userId || 'anonymous',
             subscription_data: {
               trial_period_days: 14, // 14-day free trial
               metadata: {
                 planType: body.planType,
                 userId: body.userId || 'anonymous'
               }
             },
             allow_promotion_codes: true,
             billing_address_collection: 'required',
             locale: 'es', // Spanish locale
             payment_method_collection: 'always',
             tax_id_collection: {
               enabled: true
             }
           })

           const response: CreateCheckoutSessionResponse = {
         sessionId: session.id
       }
       
       if (session.url) {
         response.url = session.url
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
