# Release and Rollback Checklist: Stripe Subscription Sync

## Release Note Draft (8.1)

### Summary
This release fixes Stripe subscription synchronization so paid users reliably retain access.

### Changes Included
- Webhook persistence now writes to `subscriptions` table using `user_id`.
- Added/verified `GET /api/subscription` for authenticated subscription status.
- Subscription validation now checks both status and `current_period_end`.
- Added structured webhook logs with correlation fields (`requestId`, `eventId`, `eventType`, `userId`, `subscriptionId`, `outcome`).
- Added reconciliation script for previously charged users with missing/mismatched local records.

### Risk Areas
- Production environment variable misconfiguration (`STRIPE_WEBHOOK_SECRET`, `DATABASE_URL`).
- Stripe endpoint misconfiguration or event type mismatch.
- Historical subscriptions that require reconciliation.

### User Impact
- Resolves "charged but no access" mismatch.
- Improves support/debug response time due to correlated logs.

## Rollback Procedure (8.2)
1. Pause Stripe webhook endpoint deliveries (Stripe Dashboard) if errors are ongoing.
2. Roll back application deployment to last known good revision.
3. Confirm `/api/subscription` returns stable responses (no 5xx).
4. Replay missed Stripe events from Stripe Dashboard after restore.
5. Validate one paid test user end-to-end before resuming full traffic.
6. Run reconciliation dry-run to identify residual mismatches.
7. Run reconciliation live mode only if mismatch count is understood and approved.

## Post-Deploy Smoke Checklist (8.4)
- Webhook delivery returns 2xx for `checkout.session.completed`.
- Webhook delivery returns 2xx for `customer.subscription.updated`.
- `/api/subscription` returns expected status and dates for a paid user.
- Premium feature access is enabled for paid account.

## 24h Monitoring Checklist (8.5)
- No repeated webhook 5xx bursts.
- No repeated signature verification errors.
- No new "charged but no access" support reports.

## Evidence to Record
- Deployment URL/version
- Stripe event IDs used for smoke tests
- Vercel log links with matching `eventId`/`requestId`
- Reconciliation before/after counts
