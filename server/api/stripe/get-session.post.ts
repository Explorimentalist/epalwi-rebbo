import { defineEventHandler, readBody } from 'h3'
import Stripe from 'stripe'

export default defineEventHandler(async (event) => {
  try {
    const { sessionId } = await readBody<{ sessionId?: string }>(event)

    if (!sessionId) {
      throw createError({ statusCode: 400, statusMessage: 'Session ID required' })
    }

    const config = useRuntimeConfig()
    const stripe = new Stripe(config.stripeSecretKey, {
      apiVersion: '2024-06-20'
    })

    const session = await stripe.checkout.sessions.retrieve(sessionId)

    return {
      success: true,
      session: {
        id: session.id,
        paymentStatus: session.payment_status,
        amountTotal: session.amount_total,
        currency: session.currency,
        customerEmail: session.customer_details?.email || session.customer_email || null
      }
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error?.message || 'Failed to retrieve session'
    })
  }
})
