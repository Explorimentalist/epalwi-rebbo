#!/usr/bin/env node

const { Pool } = require('pg')
const Stripe = require('stripe')

const args = new Set(process.argv.slice(2))
const isLive = args.has('--live')
const isDryRun = !isLive

const stripeSecretKey = process.env.STRIPE_SECRET_KEY
const databaseUrl = process.env.DATABASE_URL

if (!stripeSecretKey) {
  console.error('Missing STRIPE_SECRET_KEY')
  process.exit(1)
}

if (!databaseUrl) {
  console.error('Missing DATABASE_URL')
  process.exit(1)
}

const stripe = new Stripe(stripeSecretKey, { apiVersion: '2025-08-27.basil' })
const pool = new Pool({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false }
})

function mapStripeStatus(stripeStatus) {
  switch (stripeStatus) {
    case 'active':
    case 'trialing':
    case 'past_due':
      return 'active'
    case 'canceled':
      return 'cancelled'
    case 'unpaid':
    case 'incomplete_expired':
    case 'paused':
      return 'expired'
    case 'incomplete':
    default:
      return 'trial'
  }
}

function dateFromUnix(value) {
  if (!value) return null
  return new Date(value * 1000)
}

function valuesEqualDate(left, right) {
  if (!left && !right) return true
  if (!left || !right) return false
  return new Date(left).getTime() === new Date(right).getTime()
}

function pickPlanId(subscription) {
  return subscription?.metadata?.planType || subscription?.items?.data?.[0]?.price?.id || null
}

async function fetchAllStripeSubscriptions() {
  const subscriptions = []
  let startingAfter

  while (true) {
    const page = await stripe.subscriptions.list({
      status: 'all',
      limit: 100,
      ...(startingAfter ? { starting_after: startingAfter } : {})
    })

    subscriptions.push(...page.data)

    if (!page.has_more) break
    startingAfter = page.data[page.data.length - 1]?.id
    if (!startingAfter) break
  }

  return subscriptions
}

async function main() {
  const client = await pool.connect()

  try {
    console.log(`[reconcile-subscriptions] Mode: ${isDryRun ? 'DRY-RUN' : 'LIVE'}`)

    const [localSubsResult, usersResult] = await Promise.all([
      client.query(`
        SELECT user_id, stripe_customer_id, stripe_subscription_id, status,
               plan_id, current_period_start, current_period_end, cancel_at_period_end
        FROM subscriptions
      `),
      client.query('SELECT id FROM users WHERE is_active = true')
    ])

    const userIds = new Set(usersResult.rows.map((row) => row.id))
    const localBySubscriptionId = new Map()
    const localByCustomerId = new Map()

    for (const row of localSubsResult.rows) {
      if (row.stripe_subscription_id) localBySubscriptionId.set(row.stripe_subscription_id, row)
      if (row.stripe_customer_id) localByCustomerId.set(row.stripe_customer_id, row)
    }

    const stripeSubscriptions = await fetchAllStripeSubscriptions()

    let inspected = 0
    let alreadyInSync = 0
    let wouldUpsert = 0
    let appliedUpserts = 0
    let unresolved = 0
    const unresolvedIds = []

    for (const subscription of stripeSubscriptions) {
      inspected += 1

      const localBySub = localBySubscriptionId.get(subscription.id)
      const localByCustomer = localByCustomerId.get(subscription.customer)

      const mappedStatus = mapStripeStatus(subscription.status)
      // For trialing subscriptions current_period_start/end may be undefined; fall back to trial dates
      const currentPeriodStart = dateFromUnix(subscription.current_period_start || subscription.trial_start)
      const currentPeriodEnd = dateFromUnix(subscription.current_period_end || subscription.trial_end)
      const cancelAtPeriodEnd = Boolean(subscription.cancel_at_period_end)
      const planId = pickPlanId(subscription)

      const hasSameData = localBySub
        && localBySub.status === mappedStatus
        && localBySub.plan_id === planId
        && valuesEqualDate(localBySub.current_period_start, currentPeriodStart)
        && valuesEqualDate(localBySub.current_period_end, currentPeriodEnd)
        && Boolean(localBySub.cancel_at_period_end) === cancelAtPeriodEnd

      if (hasSameData) {
        alreadyInSync += 1
        continue
      }

      const metadataUserId = subscription?.metadata?.userId
      let userId = localBySub?.user_id
        || localByCustomer?.user_id
        || (metadataUserId && userIds.has(metadataUserId) ? metadataUserId : null)

      // 4th fallback: look up by Stripe customer email.
      // Recovers subscriptions created with userId = 'authenticated-user' in metadata
      // (a placeholder that was never replaced with the real user ID).
      if (!userId) {
        try {
          const customer = await stripe.customers.retrieve(subscription.customer)
          if (customer && !customer.deleted && customer.email) {
            const emailResult = await client.query(
              'SELECT id FROM users WHERE email = $1 AND is_active = true',
              [customer.email]
            )
            if (emailResult.rows.length > 0) {
              userId = emailResult.rows[0].id
              console.log(`  [email-fallback] Resolved ${subscription.id} via customer email ${customer.email}`)
            }
          }
        } catch (_) {
          // customer lookup failed — subscription remains unresolved
        }
      }

      if (!userId) {
        unresolved += 1
        unresolvedIds.push(subscription.id)
        continue
      }

      wouldUpsert += 1

      if (isDryRun) continue

      await client.query(
        `INSERT INTO subscriptions
           (user_id, stripe_customer_id, stripe_subscription_id, status, plan_id,
            current_period_start, current_period_end, cancel_at_period_end)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (user_id)
         DO UPDATE SET
           stripe_customer_id = COALESCE(EXCLUDED.stripe_customer_id, subscriptions.stripe_customer_id),
           stripe_subscription_id = COALESCE(EXCLUDED.stripe_subscription_id, subscriptions.stripe_subscription_id),
           status = EXCLUDED.status,
           plan_id = COALESCE(EXCLUDED.plan_id, subscriptions.plan_id),
           current_period_start = COALESCE(EXCLUDED.current_period_start, subscriptions.current_period_start),
           current_period_end = COALESCE(EXCLUDED.current_period_end, subscriptions.current_period_end),
           cancel_at_period_end = EXCLUDED.cancel_at_period_end,
           updated_at = CURRENT_TIMESTAMP`,
        [
          userId,
          subscription.customer || null,
          subscription.id,
          mappedStatus,
          planId,
          currentPeriodStart,
          currentPeriodEnd,
          cancelAtPeriodEnd
        ]
      )

      appliedUpserts += 1
    }

    console.log('[reconcile-subscriptions] Summary')
    console.log(`  Stripe subscriptions inspected: ${inspected}`)
    console.log(`  Already in sync: ${alreadyInSync}`)
    console.log(`  ${isDryRun ? 'Would upsert' : 'Applied upserts'}: ${isLive ? appliedUpserts : wouldUpsert}`)
    console.log(`  Unresolved (missing user mapping): ${unresolved}`)

    if (unresolvedIds.length > 0) {
      console.log('  Unresolved subscription IDs:')
      for (const id of unresolvedIds.slice(0, 20)) {
        console.log(`    - ${id}`)
      }
      if (unresolvedIds.length > 20) {
        console.log(`    ... and ${unresolvedIds.length - 20} more`)
      }
    }

    if (isDryRun) {
      console.log('[reconcile-subscriptions] Dry-run complete. Use --live to apply updates.')
    }
  } finally {
    client.release()
    await pool.end()
  }
}

main().catch((error) => {
  console.error('[reconcile-subscriptions] Failed:', error)
  process.exit(1)
})
