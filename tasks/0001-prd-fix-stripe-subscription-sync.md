# PRD: Fix Stripe Subscription Synchronization

Related task tracker: `tasks/tasks-0001-prd-fix-stripe-subscription-sync.md`

## 1. Introduction/Overview

Users are being charged by Stripe but the app shows their subscription as expired. The data flow between Stripe webhooks and the database is completely broken due to schema mismatches, missing API endpoints, and incorrect SQL queries.

**The Problem:** When Stripe processes a payment and sends a webhook event, the webhook handler attempts to update columns that don't exist on the `users` table (subscription data should go to the separate `subscriptions` table). Additionally, the SQL queries use `uid` instead of `id`, causing zero rows to match. Finally, there's no `/api/subscription` endpoint for the frontend to fetch subscription status.

**The Goal:** Ensure that when a user pays for a subscription, their payment status is correctly stored in the database and displayed in the app.

---

## 2. Goals

1. **Fix webhook data persistence**: Stripe webhook events must correctly write subscription data to the `subscriptions` table
2. **Create subscription API endpoint**: Frontend must be able to fetch current subscription status
3. **Fix subscription validation logic**: Backend must correctly validate subscriptions using both `status` AND `currentPeriodEnd`
4. **Verify production configuration**: Ensure `STRIPE_WEBHOOK_SECRET` is correctly configured in Vercel

---

## 3. User Stories

1. **As a paying subscriber**, I want my subscription status to be correctly reflected in the app so that I can access premium dictionary features after payment.

2. **As a subscriber**, I want to see my current billing period and next renewal date so that I understand my subscription status.

3. **As a user whose payment renews**, I want the app to automatically recognize my continued subscription so that I don't lose access.

---

## 4. Functional Requirements

### 4.1 Webhook Handler Fixes

- **FR-1**: The webhook handler MUST insert/update records in the `subscriptions` table (not the `users` table)
- **FR-2**: The webhook handler MUST use `user_id` foreign key to link subscriptions to users
- **FR-3**: The webhook handler MUST correctly look up users by `id` column (not `uid`)
- **FR-4**: The webhook handler MUST store: `stripe_customer_id`, `stripe_subscription_id`, `status`, `plan_id`, `current_period_start`, `current_period_end`, `cancel_at_period_end`
- **FR-5**: The webhook handler MUST handle these Stripe events: `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_succeeded`, `invoice.payment_failed`

### 4.2 Subscription API Endpoint

- **FR-6**: Create `GET /api/subscription` endpoint that returns the authenticated user's subscription status
- **FR-7**: The endpoint MUST return: `status`, `planType`, `currentPeriodStart`, `currentPeriodEnd`, `cancelAtPeriodEnd`, `stripeSubscriptionId`
- **FR-8**: The endpoint MUST require authentication via JWT token
- **FR-9**: The endpoint MUST return appropriate error responses for unauthenticated requests

### 4.3 Subscription Validation Logic

- **FR-10**: Subscription validation MUST check both `status` field AND `currentPeriodEnd` date
- **FR-11**: A subscription with `status = 'active'` but `currentPeriodEnd < now` MUST be treated as expired
- **FR-12**: The `canAccessFeatures` computed property MUST correctly reflect the validated subscription state

### 4.4 User Lookup Fixes

- **FR-13**: When looking up users by their ID, queries MUST use the `id` column on the `users` table
- **FR-14**: Queries that need the `uid` alias MUST query the `user_profiles` view instead

---

## 5. Non-Goals (Out of Scope)

- Changing the Stripe checkout flow (it works correctly)
- Migrating to a different payment provider
- Adding new subscription tiers or pricing changes
- Building a full subscription management UI
- Implementing subscription upgrade/downgrade flows
- Adding email notifications for subscription events

---

## 6. Design Considerations

No UI changes required. This is a backend data synchronization fix. The existing frontend components will work correctly once they receive proper data from the API.

---

## 7. Technical Considerations

### Database Schema
The existing schema has the correct structure:
- `users` table: Core user data with `id` as primary key
- `subscriptions` table: Subscription data with `user_id` foreign key
- `user_profiles` view: Joins all tables and aliases `id` as `uid`

### Key Files to Modify
- `server/api/stripe/webhook.post.ts` - Fix to use correct table and columns
- `server/utils/auth.ts` - Fix subscription validation logic
- `server/api/subscription.get.ts` - New file to create

### Environment Variables
- Verify `STRIPE_WEBHOOK_SECRET` is set in Vercel dashboard
- Verify `DATABASE_URL` is correctly configured

### Data Migration
Consider whether existing users who were charged need their subscription data backfilled manually.

---

## 8. Success Metrics

1. **100%** of Stripe webhook events successfully processed (no 500 errors in Stripe dashboard)
2. **100%** of paying users see "active" subscription status in the app
3. **Zero** support tickets about "charged but no access"
4. Webhook response time under **2 seconds**

---

## 9. Open Questions

1. Should we add a manual "sync subscription" button as a fallback for users?
2. Do we need to backfill subscription data for users who were already charged?
3. Should we add logging/monitoring for webhook failures?
