import { defineEventHandler, readBody, getHeader } from 'h3'
import Stripe from 'stripe'
import { getConnection } from '~/lib/db/connection'

// Initialize Stripe with secret key
const config = useRuntimeConfig()
const stripe = new Stripe(config.stripeSecretKey, {
  apiVersion: '2025-08-27.basil'
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
  
  try {
    // Extract user information from session
    const userId = session.client_reference_id
    const customerId = session.customer
    const subscriptionId = session.subscription
    
    if (userId && userId !== 'anonymous') {
      const db = await getConnection()
      
      // Update user profile with Stripe customer ID and subscription
      const updateQuery = `
        UPDATE users 
        SET stripe_customer_id = $1,
            stripe_subscription_id = $2,
            subscription_status = $3,
            subscription_current_period_start = NOW(),
            updated_at = CURRENT_TIMESTAMP
        WHERE uid = $4
      `
      
      await db.query(updateQuery, [customerId, subscriptionId, 'active', userId])
      
      console.log(`User ${userId} subscription created: customer ${customerId}, subscription ${subscriptionId}`)
    }
  } catch (error) {
    console.error('Error handling checkout session completion:', error)
    throw error
  }
}

// Handle subscription creation
async function handleSubscriptionCreated(subscription: any) {
  console.log('Subscription created:', subscription.id)
  
  try {
    // Extract metadata
    const userId = subscription.metadata?.userId
    const planType = subscription.metadata?.planType
    const customerId = subscription.customer
    
    if (userId && userId !== 'anonymous') {
      const db = await getConnection()
      
      // Update user subscription status in PostgreSQL
      const updateQuery = `
        UPDATE users 
        SET subscription_status = $1,
            stripe_subscription_id = $2,
            stripe_customer_id = $3,
            subscription_plan_type = $4,
            subscription_current_period_start = $5,
            subscription_current_period_end = $6,
            subscription_cancel_at_period_end = $7,
            subscription_trial_start = $8,
            subscription_trial_end = $9,
            updated_at = CURRENT_TIMESTAMP
        WHERE uid = $10
      `
      
      await db.query(updateQuery, [
        subscription.status,
        subscription.id,
        customerId,
        planType,
        new Date(subscription.current_period_start * 1000),
        new Date(subscription.current_period_end * 1000),
        subscription.cancel_at_period_end,
        subscription.trial_start ? new Date(subscription.trial_start * 1000) : null,
        subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
        userId
      ])
      
      console.log(`User ${userId} subscription created: ${planType}, status: ${subscription.status}`)
    }
  } catch (error) {
    console.error('Error handling subscription creation:', error)
    throw error
  }
}

// Handle subscription updates
async function handleSubscriptionUpdated(subscription: any) {
  console.log('Subscription updated:', subscription.id)
  
  try {
    const userId = subscription.metadata?.userId
    const customerId = subscription.customer
    const status = subscription.status
    
    if (userId && userId !== 'anonymous') {
      const db = await getConnection()
      
      // Update user subscription status in PostgreSQL
      const updateQuery = `
        UPDATE users 
        SET subscription_status = $1,
            stripe_subscription_id = $2,
            stripe_customer_id = $3,
            subscription_plan_type = $4,
            subscription_current_period_start = $5,
            subscription_current_period_end = $6,
            subscription_cancel_at_period_end = $7,
            subscription_trial_start = $8,
            subscription_trial_end = $9,
            updated_at = CURRENT_TIMESTAMP
        WHERE uid = $10
      `
      
      await db.query(updateQuery, [
        status,
        subscription.id,
        customerId,
        subscription.metadata?.planType,
        new Date(subscription.current_period_start * 1000),
        new Date(subscription.current_period_end * 1000),
        subscription.cancel_at_period_end,
        subscription.trial_start ? new Date(subscription.trial_start * 1000) : null,
        subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
        userId
      ])
      
      console.log(`User ${userId} subscription status updated: ${status}`)
    }
  } catch (error) {
    console.error('Error handling subscription update:', error)
    throw error
  }
}

// Handle subscription deletion
async function handleSubscriptionDeleted(subscription: any) {
  console.log('Subscription deleted:', subscription.id)
  
  try {
    const userId = subscription.metadata?.userId
    
    if (userId && userId !== 'anonymous') {
      const db = await getConnection()
      
      // Update user subscription status to cancelled in PostgreSQL
      const updateQuery = `
        UPDATE users 
        SET subscription_status = $1,
            stripe_subscription_id = $2,
            stripe_customer_id = $3,
            subscription_plan_type = $4,
            subscription_current_period_start = $5,
            subscription_current_period_end = $6,
            subscription_cancel_at_period_end = $7,
            subscription_canceled_at = CURRENT_TIMESTAMP,
            subscription_trial_start = $8,
            subscription_trial_end = $9,
            updated_at = CURRENT_TIMESTAMP
        WHERE uid = $10
      `
      
      await db.query(updateQuery, [
        'canceled',
        subscription.id,
        subscription.customer,
        subscription.metadata?.planType,
        new Date(subscription.current_period_start * 1000),
        new Date(subscription.current_period_end * 1000),
        true,
        subscription.trial_start ? new Date(subscription.trial_start * 1000) : null,
        subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
        userId
      ])
      
      console.log(`User ${userId} subscription cancelled`)
    }
  } catch (error) {
    console.error('Error handling subscription deletion:', error)
    throw error
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
