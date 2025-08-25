import { defineEventHandler, readBody, getHeader } from 'h3'
import Stripe from 'stripe'

// Initialize Stripe with secret key
const config = useRuntimeConfig()
const stripe = new Stripe(config.stripeSecretKey, {
  apiVersion: '2025-07-30.basil'
})

interface WebhookEvent {
  id: string
  type: string
  data: {
    object: any
  }
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const signature = getHeader(event, 'stripe-signature')
    
    if (!signature) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing Stripe signature'
      })
    }

    if (!config.stripeWebhookSecret) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Webhook secret not configured'
      })
    }

    // Verify webhook signature
    let stripeEvent: WebhookEvent
    try {
      stripeEvent = stripe.webhooks.constructEvent(
        body,
        signature,
        config.stripeWebhookSecret
      )
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message)
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid webhook signature'
      })
    }

    // Handle different event types
    switch (stripeEvent.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(stripeEvent.data.object)
        break
        
      case 'customer.subscription.created':
        await handleSubscriptionCreated(stripeEvent.data.object)
        break
        
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(stripeEvent.data.object)
        break
        
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(stripeEvent.data.object)
        break
        
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(stripeEvent.data.object)
        break
        
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(stripeEvent.data.object)
        break
        
      case 'customer.subscription.trial_will_end':
        await handleTrialWillEnd(stripeEvent.data.object)
        break
        
      default:
        console.log(`Unhandled event type: ${stripeEvent.type}`)
    }

    return { received: true }

  } catch (error: any) {
    console.error('Webhook error:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Webhook processing failed: ' + (error.message || 'Unknown error')
    })
  }
})

// Handle checkout session completion
async function handleCheckoutSessionCompleted(session: any) {
  console.log('Checkout session completed:', session.id)
  
  // Extract user information from session
  const userId = session.client_reference_id
  const customerId = session.customer
  const subscriptionId = session.subscription
  
  if (userId && userId !== 'anonymous') {
    // Update user profile with Stripe customer ID
    // This would typically update your Firestore user document
    console.log(`User ${userId} completed checkout, customer: ${customerId}, subscription: ${subscriptionId}`)
  }
}

// Handle subscription creation
async function handleSubscriptionCreated(subscription: any) {
  console.log('Subscription created:', subscription.id)
  
  // Extract metadata
  const userId = subscription.metadata?.userId
  const planType = subscription.metadata?.planType
  
  if (userId && userId !== 'anonymous') {
    // Update user subscription status in Firestore
    console.log(`User ${userId} subscription created: ${planType}`)
  }
}

// Handle subscription updates
async function handleSubscriptionUpdated(subscription: any) {
  console.log('Subscription updated:', subscription.id)
  
  const userId = subscription.metadata?.userId
  const status = subscription.status
  
  if (userId && userId !== 'anonymous') {
    // Update user subscription status in Firestore
    console.log(`User ${userId} subscription status: ${status}`)
  }
}

// Handle subscription deletion
async function handleSubscriptionDeleted(subscription: any) {
  console.log('Subscription deleted:', subscription.id)
  
  const userId = subscription.metadata?.userId
  
  if (userId && userId !== 'anonymous') {
    // Update user subscription status to cancelled in Firestore
    console.log(`User ${userId} subscription cancelled`)
  }
}

// Handle successful invoice payment
async function handleInvoicePaymentSucceeded(invoice: any) {
  console.log('Invoice payment succeeded:', invoice.id)
  
  const subscriptionId = invoice.subscription
  const customerId = invoice.customer
  
  // Update subscription status to active
  console.log(`Subscription ${subscriptionId} payment succeeded`)
}

// Handle failed invoice payment
async function handleInvoicePaymentFailed(invoice: any) {
  console.log('Invoice payment failed:', invoice.id)
  
  const subscriptionId = invoice.subscription
  const customerId = invoice.customer
  
  // Update subscription status to past_due
  console.log(`Subscription ${subscriptionId} payment failed`)
}

// Handle trial ending soon
async function handleTrialWillEnd(subscription: any) {
  console.log('Trial will end:', subscription.id)
  
  const userId = subscription.metadata?.userId
  
  if (userId && userId !== 'anonymous') {
    // Send notification to user that trial is ending
    console.log(`User ${userId} trial ending soon`)
  }
}
