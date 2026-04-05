# Runbook: Stripe Subscription Reconciliation

## Purpose
Repair local `subscriptions` table records by syncing from Stripe as source of truth.

## Script
- Dry-run: `npm run reconcile:subscriptions`
- Live apply: `npm run reconcile:subscriptions:live`

The script is located at `scripts/reconcile-subscriptions.js`.

## Required Environment Variables
- `STRIPE_SECRET_KEY`
- `DATABASE_URL`

## How It Works
1. Fetches all Stripe subscriptions (`status=all`) via pagination.
2. Compares each Stripe subscription against local `subscriptions` rows.
3. Uses known mappings in this order to resolve `user_id`:
   - existing local row by `stripe_subscription_id`
   - existing local row by `stripe_customer_id`
   - `subscription.metadata.userId` if active user exists
4. Upserts local row with mapped status and period dates.

## Status Mapping
- `active`, `trialing`, `past_due` -> `active`
- `canceled` -> `cancelled`
- `unpaid`, `incomplete_expired`, `paused` -> `expired`
- `incomplete` -> `trial`

## Safety Guarantees
- Dry-run is default behavior.
- Live mode requires explicit `--live`.
- Upsert is idempotent (`ON CONFLICT (user_id) DO UPDATE`).

## Standard Procedure
1. Run dry-run and record summary output.
2. Inspect unresolved subscription IDs (if any).
3. Fix mapping issues (metadata/user mapping) where possible.
4. Run live reconciliation.
5. Re-run dry-run to verify mismatch count drops to zero or acceptable residuals.

## Rollback Notes
- Reconciliation only updates `subscriptions` rows.
- If incorrect updates are detected:
  - restore from DB backup/snapshot, or
  - replay known-correct Stripe subscriptions with corrected mapping.
- Keep dry-run and live run outputs for audit.

## Evidence to Capture
- Dry-run command output + timestamp
- Live-run command output + timestamp
- Mismatch count before and after
- Any unresolved IDs and manual disposition
