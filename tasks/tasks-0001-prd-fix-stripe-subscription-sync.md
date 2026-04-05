# Tasks: Fix Stripe Subscription Synchronization

Related PRD: `tasks/0001-prd-fix-stripe-subscription-sync.md`

## Relevant Files

### Core Files to Modify
- `server/api/stripe/webhook.post.ts` - Stripe webhook handler that needs to be fixed to write to the correct table
- `server/api/subscription.get.ts` - **NEW FILE** - API endpoint for frontend to fetch subscription status
- `server/utils/auth.ts` - Contains `getUserSubscriptionStatus()` that needs to validate `currentPeriodEnd`
- `server/utils/database.ts` - Database utility functions, add new function for subscription upsert

### Test Files
- `server/api/stripe/webhook.test.ts` - **NEW FILE** - Unit tests for webhook handler
- `server/api/subscription.test.ts` - **NEW FILE** - Unit tests for subscription endpoint
- `server/utils/auth.test.ts` - **NEW FILE** - Unit tests for subscription validation logic
- `server/utils/database.test.ts` - Tests for database utility functions

### Reference Files (Read-only)
- `lib/db/schema.sql` - Reference for correct table structure
- `lib/db/schema-neon.sql` - Reference for Neon-compatible schema
- `stores/subscription.ts` - Frontend store that calls `/api/subscription` endpoint

### Notes

- The `users` table has `id` as the primary key, NOT `uid`
- The `uid` alias only exists in the `user_profiles` view
- Subscription data belongs in the `subscriptions` table, not the `users` table
- The webhook must use `user_id` foreign key to link to users
- Use `npm run test` or `npx vitest` to run tests

---

## Tasks

## Execution Order (Updated: 2026-03-06)

1. 4.0 Verify production configuration first (unblocks reliable testing).
2. 6.0 Add reconciliation/backfill safety (handles already-charged users).
3. 5.0 Run end-to-end validation against Stripe + deployed app.
4. 7.0 Add monitoring and alerting guardrails.
5. 8.0 Release + rollback checklist and post-release checks.

## Completed Build Tasks

- [x] 1.0 Fix Stripe Webhook Handler to Use Correct Database Schema ✅ COMPLETED
- [x] 2.0 Create GET /api/subscription Endpoint ✅ COMPLETED
- [x] 3.0 Fix Subscription Validation Logic in Auth Utils ✅ COMPLETED

## Remaining Delivery Tasks

- [ ] 4.0 Verify and Document Production Configuration (Vercel + Stripe)
  - [ ] 4.1 Confirm `STRIPE_WEBHOOK_SECRET` exists in Vercel Production env
  - [ ] 4.2 Confirm `DATABASE_URL` exists and points to the production Neon DB
  - [ ] 4.3 Confirm Stripe webhook endpoint URL exactly matches production route: `https://[your-domain]/api/stripe/webhook`
  - [ ] 4.4 Confirm webhook events include required event types and no disabled subscriptions events
  - [x] 4.5 Add/verify structured webhook logs in `server/api/stripe/webhook.post.ts` (event id, event type, user id, subscription id, outcome)
  - [ ] 4.6 Trigger a test Stripe webhook and verify Vercel function logs include success path
  - [x] 4.7 Update `.env.example` with all required vars and short descriptions
  - [ ] 4.8 Capture evidence links/screenshots in this task file (Vercel env page, Stripe webhook settings, test delivery result)
  - [ ] 4.9 Exit criteria: all checks pass and no signature verification errors in recent Stripe deliveries
  - Progress log (2026-03-06 UTC): Completed `4.5` by switching webhook logging to structured payloads with `eventId`, `eventType`, `userId`, `subscriptionId`, `outcome`.
  - Progress log (2026-03-06 UTC): Completed `4.7` by adding `DATABASE_URL`, `JWT_SECRET`, `RESEND_API_KEY`, `MAILERSEND_FROM_EMAIL`, and `MAILERSEND_FROM_NAME` to `.env.example`.
  - Evidence (local, 2026-03-06 UTC): `npm test -- server/api/stripe/webhook.test.ts server/api/subscription.test.ts` -> 29/29 tests passed.
  - Blocker (2026-03-06 UTC): `4.1`, `4.2`, `4.3`, `4.4`, `4.6`, `4.8` require live Vercel/Stripe dashboard access and cannot be completed from local repo-only access.
  - Evidence template (fill during dashboard checks):
    - Vercel Production env screenshot/link (`STRIPE_WEBHOOK_SECRET`): `TODO`
    - Vercel Production env screenshot/link (`DATABASE_URL`): `TODO`
    - Stripe webhook endpoint settings screenshot/link: `TODO`
    - Stripe test delivery event ID + timestamp: `TODO`
    - Vercel function log snippet showing `event_processed` with matching `eventId`: `TODO`

- [ ] 5.0 Execute End-to-End Subscription Validation
  - [ ] 5.1 Create a fresh test account in production or staging (document email/user id)
  - [ ] 5.2 Complete checkout with Stripe test card `4242 4242 4242 4242`
  - [ ] 5.3 Verify Stripe shows successful webhook deliveries for checkout + subscription events
  - [ ] 5.4 Verify database `subscriptions` row is created/updated for the test user
  - [ ] 5.5 Verify `GET /api/subscription` returns expected shape + values
  - [ ] 5.6 Verify premium feature access in UI is enabled immediately after payment
  - [ ] 5.7 Trigger renewal scenario (`invoice.payment_succeeded`) and verify `current_period_end` updates
  - [ ] 5.8 Trigger failure scenario (`invoice.payment_failed`) and verify app state degrades safely
  - [ ] 5.9 Document exact timestamps and request IDs for the full flow
  - [ ] 5.10 Exit criteria: no mismatch between Stripe status, DB status, API response, and UI access

- [ ] 6.0 Add Data Reconciliation/Backfill for Previously Charged Users (Missing in original task list)
  - [x] 6.1 Create a script to find users with Stripe customers/subscriptions but missing local `subscriptions` rows
  - [x] 6.2 For each mismatch, upsert local `subscriptions` from Stripe source of truth
  - [x] 6.3 Add dry-run mode and idempotent behavior
  - [x] 6.4 Add script usage docs (`how to run`, required env vars, rollback notes)
  - [x] 6.5 Run dry-run in production and record mismatch count
  - [x] 6.6 Run live reconciliation and capture before/after counts
  - [x] 6.7 Exit criteria: mismatch count is zero (or all residual cases explicitly documented)
  - Progress log (2026-03-06 UTC): Added `scripts/reconcile-subscriptions.js` (dry-run default, `--live` apply mode, idempotent upsert).
  - Progress log (2026-03-06 UTC): Added npm scripts `reconcile:subscriptions` and `reconcile:subscriptions:live`.
  - Progress log (2026-03-06 UTC): Added runbook `tasks/0001-reconciliation-runbook-stripe-subscriptions.md`.
  - Progress log (2026-04-05 UTC): Added email-based 4th fallback to reconcile script — recovers subscriptions with broken `userId: 'authenticated-user'` metadata by looking up user via Stripe customer email.
  - Progress log (2026-04-05 UTC): Added trialing subscription period date handling (`trial_start`/`trial_end` fallback).
  - Progress log (2026-04-05 UTC): Applied production DB migration — `ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_user_id_key UNIQUE (user_id)`. This fixes the silent `42P10` error in `upsertSubscription` that prevented ALL webhook events from persisting.
  - Evidence (2026-04-05 UTC): Dry-run: 2 subscriptions inspected, 1 already in sync, 1 would upsert (brianoko@gmail.com via email fallback), 0 unresolved.
  - Evidence (2026-04-05 UTC): Live run: 1 upsert applied (brianoko@gmail.com). 0 unresolved.
  - Evidence (2026-04-05 UTC): Carlos (cendje@gmail.com) manually recovered via direct DB insert from Stripe source of truth.

- [ ] 7.0 Add Monitoring and Alerting Guardrails (Missing in original task list)
  - [x] 7.1 Define webhook error signal (5xx rate, signature failures, processing exceptions)
  - [ ] 7.2 Configure alert destination and threshold (email/Slack/pager)
  - [x] 7.3 Add correlation IDs in webhook logs for incident tracing
  - [x] 7.4 Add one operational dashboard/query for: total events, failed events, retry count
  - [ ] 7.5 Perform one forced-failure test to verify alert fires
  - [ ] 7.6 Exit criteria: alert tested and dashboard available to on-call owner
  - Progress log (2026-03-06 UTC): Added monitoring runbook `tasks/0001-webhook-monitoring-and-alerting-runbook.md` covering error signals, dashboard/query blueprint, thresholds, and forced-failure test plan.
  - Progress log (2026-03-06 UTC): Added `requestId` correlation ID to structured webhook logs in `server/api/stripe/webhook.post.ts`.
  - Evidence (local, 2026-03-06 UTC): `npm test -- server/api/stripe/webhook.test.ts` -> 16/16 tests passed.
  - Blocker (2026-03-06 UTC): `7.2`, `7.5`, `7.6` require Vercel/Stripe alerting and dashboard access to configure and validate.

- [ ] 8.0 Release and Rollback Checklist (Missing in original task list)
  - [x] 8.1 Prepare release note summarizing schema, webhook, and subscription API behavior
  - [x] 8.2 Define rollback steps (disable endpoint, revert deployment, replay events, verify recovery)
  - [ ] 8.3 Deploy during a low-traffic window
  - [ ] 8.4 Run post-deploy smoke tests: webhook delivery, `/api/subscription`, premium feature access
  - [ ] 8.5 Monitor for 24h and confirm no new "charged but no access" reports
  - [ ] 8.6 Exit criteria: stable metrics + no critical support incidents in monitoring window
  - Progress log (2026-03-06 UTC): Added release + rollback checklist `tasks/0001-release-and-rollback-checklist.md`.
  - Blocker (2026-03-06 UTC): `8.3`, `8.4`, `8.5`, `8.6` require deployment window execution and production monitoring access.

- [ ] 9.0 Documentation Hygiene and Task Source of Truth (Missing in original task list)
  - [ ] 9.1 Keep this file (`tasks/tasks-0001-prd-fix-stripe-subscription-sync.md`) as the single execution tracker
  - [x] 9.2 Cross-link PRD file and this tasks file at the top of each document
  - [x] 9.3 Add final "Completed On" section with UTC timestamps for each major task block
  - [ ] 9.4 Exit criteria: future contributors can determine current status from one file without ambiguity
  - Progress log (2026-03-06 UTC): Added cross-links in `tasks/0001-prd-fix-stripe-subscription-sync.md` and this task file.
  - Progress log (2026-03-06 UTC): Added `Completed On (UTC)` section with completion timestamps.

---

## Completed On (UTC)

- `1.0` completed: 2026-03-06 (historical implementation completed before this tracking pass)
- `2.0` completed: 2026-03-06 (historical implementation completed before this tracking pass)
- `3.0` completed: 2026-03-06 (historical implementation completed before this tracking pass)
- `4.5` completed: 2026-03-06
- `4.7` completed: 2026-03-06
- `6.1` - `6.4` completed: 2026-03-06
- `6.5` - `6.7` completed: 2026-04-05 (0 unresolved; email fallback added; UNIQUE constraint applied to production DB)
- `7.1`, `7.3`, `7.4` completed: 2026-03-06
- `8.1`, `8.2` completed: 2026-03-06
- `9.2` completed: 2026-03-06

Note: Where exact original commit timestamps are not captured in this file, completion date reflects tracker update date.

---

## Testing Strategy Summary

| Task | Test Type | What It Validates |
|------|-----------|-------------------|
| 1.x | Unit + Integration | Webhook correctly writes to `subscriptions` table |
| 2.x | Unit | API endpoint authentication and response shape |
| 3.x | Unit | Subscription validation logic with edge cases |
| 4.x | Manual | Production environment configuration |
| 5.x | E2E | Complete user journey from payment to access |

---

## Definition of Done

- [ ] All unit/integration tests pass in CI and locally
- [ ] Webhook events in Stripe Dashboard show 200 responses (no persistent failures)
- [ ] Reconciliation script dry-run and live-run are documented with results
- [ ] A test user can complete checkout and immediately access premium features
- [ ] Database contains correct subscription data after webhook processing
- [ ] `/api/subscription` response matches database and UI behavior
- [ ] Alerting is configured and tested for webhook failures
- [ ] Rollback steps are documented and validated
- [ ] This task file includes completion timestamps and evidence links
