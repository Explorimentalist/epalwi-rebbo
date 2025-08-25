/**
 * Subscription Types
 * TypeScript definitions for subscription and payment system
 */

/**
 * Subscription plan types
 */
export type PlanType = 'monthly' | 'annual'

/**
 * Subscription status types
 */
export type SubscriptionStatus = 
  | 'trial' 
  | 'active' 
  | 'past_due' 
  | 'canceled' 
  | 'unpaid' 
  | 'incomplete' 
  | 'incomplete_expired' 
  | 'trialing'

/**
 * Stripe subscription object
 */
export interface StripeSubscription {
  id: string
  status: SubscriptionStatus
  current_period_start: number
  current_period_end: number
  trial_start?: number
  trial_end?: number
  cancel_at_period_end: boolean
  canceled_at?: number
  customer: string
  metadata: Record<string, string>
}

/**
 * Stripe checkout session
 */
export interface StripeCheckoutSession {
  id: string
  object: 'checkout.session'
  amount_total: number
  currency: string
  customer: string
  customer_email?: string
  payment_status: 'paid' | 'unpaid' | 'no_payment_required'
  status: 'open' | 'complete' | 'expired'
  subscription?: string
  url?: string
  client_reference_id?: string
  metadata: Record<string, string>
}

/**
 * Subscription plan configuration
 */
export interface SubscriptionPlan {
  id: string
  title: string
  price: number
  period: string
  features: string[]
  priceId: string // Stripe Price ID
  popular?: boolean
  savings?: number
  trialDays: number
}

/**
 * User subscription information
 */
export interface UserSubscription {
  status: SubscriptionStatus
  planId?: string
  planType?: PlanType
  currentPeriodStart?: Date
  currentPeriodEnd?: Date
  trialStart?: Date
  trialEnd?: Date
  cancelAtPeriodEnd?: boolean
  stripeCustomerId?: string
  stripeSubscriptionId?: string
  lastPaymentDate?: Date
  nextBillingDate?: Date
}

/**
 * Checkout session request
 */
export interface CreateCheckoutSessionRequest {
  priceId: string
  planType: PlanType
  successUrl: string
  cancelUrl: string
  userId?: string
}

/**
 * Checkout session response
 */
export interface CreateCheckoutSessionResponse {
  sessionId: string
  url?: string
}

/**
 * Subscription update request
 */
export interface UpdateSubscriptionRequest {
  userId: string
  subscriptionId: string
  status: SubscriptionStatus
  planType?: PlanType
  customerId?: string
}

/**
 * Webhook event types
 */
export type WebhookEventType = 
  | 'checkout.session.completed'
  | 'customer.subscription.created'
  | 'customer.subscription.updated'
  | 'customer.subscription.deleted'
  | 'invoice.payment_succeeded'
  | 'invoice.payment_failed'
  | 'customer.subscription.trial_will_end'

/**
 * Webhook event
 */
export interface WebhookEvent {
  id: string
  type: WebhookEventType
  data: {
    object: StripeSubscription | StripeCheckoutSession | any
  }
  created: number
}

/**
 * Payment method information
 */
export interface PaymentMethod {
  id: string
  type: 'card'
  card: {
    brand: string
    last4: string
    exp_month: number
    exp_year: number
  }
  billing_details: {
    name?: string
    email?: string
    address?: {
      country?: string
      state?: string
      city?: string
      line1?: string
      line2?: string
      postal_code?: string
    }
  }
}

/**
 * Invoice information
 */
export interface Invoice {
  id: string
  amount_paid: number
  currency: string
  status: 'paid' | 'open' | 'void' | 'uncollectible'
  subscription: string
  customer: string
  created: number
  due_date?: number
  payment_intent?: string
}
