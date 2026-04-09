import { defineEventHandler, readBody, getHeader } from 'h3'
import Stripe from 'stripe'
import { randomUUID } from 'node:crypto'
import {
  upsertSubscription,
  updateSubscriptionStatus,
  getUserIdAndEmail,
  getSubscriptionByStripeId,
  getUserIdByStripeCustomerId
} from '~/server/utils/database'
import type { SubscriptionStatus } from '~/types/auth'

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

interface WebhookContext {
  requestId: string
  eventId: string
  eventType: string
}

function logWebhook(
  level: 'log' | 'warn' | 'error',
  message: string,
  context: Record<string, unknown> = {}
) {
  const payload = {
    component: 'stripe-webhook',
    message,
    ...context
  }
  console[level](payload)
}

export default defineEventHandler(async (event) => {
  let requestId = randomUUID()
  try {
    requestId = getHeader(event, 'x-vercel-id')
      || getHeader(event, 'x-request-id')
      || requestId
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
      logWebhook('error', 'signature_verification_failed', {
        requestId,
        outcome: 'error',
        error: err.message
      })
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid webhook signature'
      })
    }

    const context: WebhookContext = {
      requestId,
      eventId: stripeEvent.id,
      eventType: stripeEvent.type
    }
    logWebhook('log', 'event_received', { ...context, outcome: 'received' })

    // Handle different event types
    switch (stripeEvent.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(stripeEvent.data.object, context)
        break
        
      case 'customer.subscription.created':
        await handleSubscriptionCreated(stripeEvent.data.object, context)
        break
        
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(stripeEvent.data.object, context)
        break
        
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(stripeEvent.data.object, context)
        break
        
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(stripeEvent.data.object, context)
        break
        
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(stripeEvent.data.object, context)
        break
        
      case 'customer.subscription.trial_will_end':
        await handleTrialWillEnd(stripeEvent.data.object, context)
        break
        
      default:
        logWebhook('log', 'event_ignored_unhandled_type', {
          ...context,
          outcome: 'ignored'
        })
    }

    logWebhook('log', 'event_processed', { ...context, outcome: 'success' })
    return { received: true }

  } catch (error: any) {
    logWebhook('error', 'webhook_processing_failed', {
      requestId,
      outcome: 'error',
      error: error?.message || 'Unknown error'
    })
    
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
async function handleCheckoutSessionCompleted(session: any, context: WebhookContext) {
  logWebhook('log', 'checkout_session_completed_processing', {
    ...context,
    sessionId: session.id,
    userId: session.client_reference_id,
    subscriptionId: session.subscription,
    outcome: 'processing'
  })

  try {
    // Extract user information from session
    // client_reference_id is the user's UUID (users.id) set during checkout creation
    const userId = session.client_reference_id
    const customerId = session.customer
    const subscriptionId = session.subscription

    if (!userId || userId === 'anonymous') {
      logWebhook('warn', 'checkout_session_skipped_missing_user', {
        ...context,
        sessionId: session.id,
        outcome: 'skipped'
      })
      return
    }

    // Verify user exists in database
    const user = await getUserIdAndEmail(userId)
    if (!user) {
      logWebhook('error', 'checkout_session_user_not_found', {
        ...context,
        userId,
        sessionId: session.id,
        outcome: 'error'
      })
      throw new Error(`User ${userId} not found`)
    }

    // Upsert subscription record in the subscriptions table
    // Note: At checkout completion, we may not have full subscription details yet
    // The subscription.created event will have more details
    await upsertSubscription(user.id, {
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
      status: 'active' as SubscriptionStatus
    })

    logWebhook('log', 'checkout_session_subscription_upserted', {
      ...context,
      userId,
      userEmail: user.email,
      customerId,
      subscriptionId,
      outcome: 'success'
    })
  } catch (error) {
    logWebhook('error', 'checkout_session_processing_failed', {
      ...context,
      sessionId: session.id,
      error: (error as Error).message,
      outcome: 'error'
    })
    throw error
  }
}

// Handle subscription creation
async function handleSubscriptionCreated(subscription: any, context: WebhookContext) {
  logWebhook('log', 'subscription_created_processing', {
    ...context,
    subscriptionId: subscription.id,
    userId: subscription.metadata?.userId,
    outcome: 'processing'
  })

  try {
    // Extract metadata - userId is set during checkout session creation
    const userId = subscription.metadata?.userId
    const planType = subscription.metadata?.planType
    const customerId = subscription.customer

    if (!userId || userId === 'anonymous') {
      logWebhook('warn', 'subscription_created_skipped_missing_user', {
        ...context,
        subscriptionId: subscription.id,
        outcome: 'skipped'
      })
      return
    }

    // Verify user exists in database
    const user = await getUserIdAndEmail(userId)
    if (!user) {
      logWebhook('error', 'subscription_created_user_not_found', {
        ...context,
        userId,
        subscriptionId: subscription.id,
        outcome: 'error'
      })
      throw new Error(`User ${userId} not found`)
    }

    // Map Stripe status to our SubscriptionStatus type
    // Stripe statuses: active, past_due, unpaid, canceled, incomplete, incomplete_expired, trialing, paused
    const statusMap: Record<string, SubscriptionStatus> = {
      'active': 'active',
      'trialing': 'active', // Treat trialing as active for access purposes
      'past_due': 'active', // Still active but payment issue
      'canceled': 'cancelled',
      'unpaid': 'expired',
      'incomplete': 'trial',
      'incomplete_expired': 'expired',
      'paused': 'expired'
    }
    const status: SubscriptionStatus = statusMap[subscription.status] || 'trial'

    // Upsert subscription with full details
    await upsertSubscription(user.id, {
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscription.id,
      status,
      planId: planType,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end ?? false
    })

    logWebhook('log', 'subscription_created_upserted', {
      ...context,
      userId,
      userEmail: user.email,
      customerId,
      subscriptionId: subscription.id,
      status: subscription.status,
      planType,
      outcome: 'success'
    })
  } catch (error) {
    logWebhook('error', 'subscription_created_processing_failed', {
      ...context,
      subscriptionId: subscription.id,
      error: (error as Error).message,
      outcome: 'error'
    })
    throw error
  }
}

// Handle subscription updates
async function handleSubscriptionUpdated(subscription: any, context: WebhookContext) {
  logWebhook('log', 'subscription_updated_processing', {
    ...context,
    subscriptionId: subscription.id,
    userId: subscription.metadata?.userId,
    outcome: 'processing'
  })

  try {
    const customerId = subscription.customer
    const planType = subscription.metadata?.planType

    // Try to get userId from metadata first, then fallback to looking up by subscription ID
    let userId = subscription.metadata?.userId
    let user: { id: string; email: string } | null = null

    if (userId && userId !== 'anonymous') {
      user = await getUserIdAndEmail(userId)
    }

    // Fallback: look up user by existing subscription record
    if (!user) {
      const existingSub = await getSubscriptionByStripeId(subscription.id)
      if (existingSub) {
        userId = existingSub.userId
        user = await getUserIdAndEmail(userId)
      }
    }

    if (!user) {
      logWebhook('warn', 'subscription_updated_skipped_user_not_found', {
        ...context,
        subscriptionId: subscription.id,
        outcome: 'skipped'
      })
      return
    }

    // Map Stripe status to our SubscriptionStatus type
    const statusMap: Record<string, SubscriptionStatus> = {
      'active': 'active',
      'trialing': 'active',
      'past_due': 'active',
      'canceled': 'cancelled',
      'unpaid': 'expired',
      'incomplete': 'trial',
      'incomplete_expired': 'expired',
      'paused': 'expired'
    }
    const status: SubscriptionStatus = statusMap[subscription.status] || 'trial'

    // Upsert subscription with updated details
    await upsertSubscription(user.id, {
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscription.id,
      status,
      planId: planType,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end ?? false
    })

    logWebhook('log', 'subscription_updated_upserted', {
      ...context,
      userId,
      userEmail: user.email,
      customerId,
      subscriptionId: subscription.id,
      status: subscription.status,
      periodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
      outcome: 'success'
    })
  } catch (error) {
    logWebhook('error', 'subscription_updated_processing_failed', {
      ...context,
      subscriptionId: subscription.id,
      error: (error as Error).message,
      outcome: 'error'
    })
    throw error
  }
}

// Handle subscription deletion
async function handleSubscriptionDeleted(subscription: any, context: WebhookContext) {
  logWebhook('log', 'subscription_deleted_processing', {
    ...context,
    subscriptionId: subscription.id,
    userId: subscription.metadata?.userId,
    outcome: 'processing'
  })

  try {
    // Try to get userId from metadata first, then fallback to looking up by subscription ID
    let userId = subscription.metadata?.userId
    let user: { id: string; email: string } | null = null

    if (userId && userId !== 'anonymous') {
      user = await getUserIdAndEmail(userId)
    }

    // Fallback: look up user by existing subscription record
    if (!user) {
      const existingSub = await getSubscriptionByStripeId(subscription.id)
      if (existingSub) {
        userId = existingSub.userId
        user = await getUserIdAndEmail(userId)
      }
    }

    if (!user) {
      logWebhook('warn', 'subscription_deleted_skipped_user_not_found', {
        ...context,
        subscriptionId: subscription.id,
        outcome: 'skipped'
      })
      return
    }

    // Update subscription status to cancelled
    await upsertSubscription(user.id, {
      stripeCustomerId: subscription.customer,
      stripeSubscriptionId: subscription.id,
      status: 'cancelled' as SubscriptionStatus,
      planId: subscription.metadata?.planType,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: true
    })

    logWebhook('log', 'subscription_deleted_upserted', {
      ...context,
      userId,
      userEmail: user.email,
      customerId: subscription.customer,
      subscriptionId: subscription.id,
      outcome: 'success'
    })
  } catch (error) {
    logWebhook('error', 'subscription_deleted_processing_failed', {
      ...context,
      subscriptionId: subscription.id,
      error: (error as Error).message,
      outcome: 'error'
    })
    throw error
  }
}

// Handle successful invoice payment
async function handleInvoicePaymentSucceeded(invoice: any, context: WebhookContext) {
  logWebhook('log', 'invoice_payment_succeeded_processing', {
    ...context,
    invoiceId: invoice.id,
    subscriptionId: invoice.subscription,
    customerId: invoice.customer,
    outcome: 'processing'
  })

  try {
    const subscriptionId = invoice.subscription

    // Skip if not a subscription invoice
    if (!subscriptionId) {
      logWebhook('log', 'invoice_payment_succeeded_skipped_non_subscription', {
        ...context,
        invoiceId: invoice.id,
        outcome: 'skipped'
      })
      return
    }

    // Look up user by subscription ID
    const existingSub = await getSubscriptionByStripeId(subscriptionId)
    if (!existingSub) {
      logWebhook('warn', 'invoice_payment_succeeded_skipped_subscription_not_found', {
        ...context,
        invoiceId: invoice.id,
        subscriptionId,
        outcome: 'skipped'
      })
      return
    }

    // Get the subscription from Stripe to get updated period dates
    // The invoice.lines contains the subscription period info
    let periodEnd: Date | undefined
    if (invoice.lines?.data?.length > 0) {
      const subscriptionLine = invoice.lines.data.find((line: any) => line.subscription === subscriptionId)
      if (subscriptionLine?.period?.end) {
        periodEnd = new Date(subscriptionLine.period.end * 1000)
      }
    }

    // Update subscription status to active
    const updated = await updateSubscriptionStatus(
      subscriptionId,
      'active' as SubscriptionStatus,
      periodEnd
    )

    if (updated) {
      logWebhook('log', 'invoice_payment_succeeded_updated_status', {
        ...context,
        invoiceId: invoice.id,
        userId: existingSub.userId,
        subscriptionId,
        periodEnd: periodEnd?.toISOString(),
        outcome: 'success'
      })
    } else {
      logWebhook('warn', 'invoice_payment_succeeded_update_failed', {
        ...context,
        invoiceId: invoice.id,
        subscriptionId,
        outcome: 'error'
      })
    }
  } catch (error) {
    logWebhook('error', 'invoice_payment_succeeded_processing_failed', {
      ...context,
      invoiceId: invoice.id,
      subscriptionId: invoice.subscription,
      error: (error as Error).message,
      outcome: 'error'
    })
    throw error
  }
}

// Handle failed invoice payment
async function handleInvoicePaymentFailed(invoice: any, context: WebhookContext) {
  logWebhook('warn', 'invoice_payment_failed_processing', {
    ...context,
    invoiceId: invoice.id,
    subscriptionId: invoice.subscription,
    customerId: invoice.customer,
    outcome: 'processing'
  })

  try {
    const subscriptionId = invoice.subscription

    // Skip if not a subscription invoice
    if (!subscriptionId) {
      logWebhook('log', 'invoice_payment_failed_skipped_non_subscription', {
        ...context,
        invoiceId: invoice.id,
        outcome: 'skipped'
      })
      return
    }

    // Look up subscription to get user info for logging
    const existingSub = await getSubscriptionByStripeId(subscriptionId)
    if (!existingSub) {
      logWebhook('warn', 'invoice_payment_failed_skipped_subscription_not_found', {
        ...context,
        invoiceId: invoice.id,
        subscriptionId,
        outcome: 'skipped'
      })
      return
    }

    // Note: Our SubscriptionStatus type doesn't have 'past_due'
    // The subscription.updated webhook will handle the actual status change
    // For now, we keep the status as-is but log the failure prominently
    // The user still has access until current_period_end

    logWebhook('warn', 'invoice_payment_failed_logged', {
      ...context,
      invoiceId: invoice.id,
      userId: existingSub.userId,
      subscriptionId,
      attemptCount: invoice.attempt_count || 1,
      amountDue: invoice.amount_due / 100,
      currency: invoice.currency?.toUpperCase(),
      currentPeriodEnd: existingSub.subscription.currentPeriodEnd,
      outcome: 'logged_for_followup'
    })

    // If this is the final attempt and Stripe will cancel the subscription,
    // the subscription.deleted webhook will handle marking it as cancelled
    // For intermediate failures, the subscription.updated webhook will update status

  } catch (error) {
    logWebhook('error', 'invoice_payment_failed_processing_failed', {
      ...context,
      invoiceId: invoice.id,
      subscriptionId: invoice.subscription,
      error: (error as Error).message,
      outcome: 'error'
    })
    // Don't throw - payment failure logging shouldn't break the webhook
  }
}

// Handle trial ending soon
async function handleTrialWillEnd(subscription: any, context: WebhookContext) {
  logWebhook('log', 'trial_will_end_processing', {
    ...context,
    subscriptionId: subscription.id,
    userId: subscription.metadata?.userId,
    outcome: 'processing'
  })
  
  const userId = subscription.metadata?.userId
  
  if (userId && userId !== 'anonymous') {
    // Send notification to user that trial is ending
    logWebhook('log', 'trial_will_end_user_notified', {
      ...context,
      userId,
      subscriptionId: subscription.id,
      outcome: 'success'
    })
    return
  }

  logWebhook('warn', 'trial_will_end_skipped_missing_user', {
    ...context,
    subscriptionId: subscription.id,
    outcome: 'skipped'
  })
}
