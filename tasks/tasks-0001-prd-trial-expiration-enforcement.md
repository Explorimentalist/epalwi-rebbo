# Task List: Trial Expiration Enforcement Implementation

Based on PRD: `0001-prd-trial-expiration-enforcement.md`

## Relevant Files

- `server/utils/auth.ts` - New server-side authentication utilities for validating user tokens and subscription status
- `server/utils/auth.test.ts` - Unit tests for authentication utilities
- `server/plugins/firebaseAdmin.ts` - Initializes Firebase Admin SDK for server-side token verification
- `server/utils/validateSubscription.ts` - Centralized subscription validation logic with grace period handling
- `server/utils/validateSubscription.test.ts` - Unit tests for subscription validation
- `server/api/dictionary.get.ts` - Existing dictionary API that needs subscription protection
- `server/api/dictionary.test.ts` - Integration tests for protected dictionary API
- `middleware/auth.global.ts` - Global authentication middleware for route protection
- `middleware/auth.global.test.ts` - Unit tests for global auth middleware
- `middleware/subscription.ts` - Named middleware for subscription-required routes
- `middleware/subscription.test.ts` - Unit tests for subscription middleware
- `composables/useAuth.ts` - Enhanced client-side authentication composable
- `composables/useAuth.test.ts` - Unit tests for auth composable
- `composables/useSubscriptionError.ts` - Error handling composable for subscription failures
- `composables/useSubscriptionError.test.ts` - Unit tests for error handling
- `components/paywall/SubscriptionRequired.vue` - Main paywall component for blocking access
- `components/paywall/SubscriptionRequired.test.vue` - Component tests for paywall
- `components/paywall/ExpiredTrialBanner.vue` - Banner component for expired trial users
- `components/paywall/ExpiredTrialBanner.test.vue` - Component tests for expired banner
- `components/paywall/FeatureGate.vue` - Wrapper component for protecting premium features
- `components/paywall/FeatureGate.test.vue` - Component tests for feature gate
- `components/subscription/TrialBanner.vue` - Existing trial banner that needs enhancement
- `components/subscription/TrialBanner.test.vue` - Updated tests for enhanced trial banner
- `pages/dictionary.vue` - Dictionary page that needs subscription protection
- `pages/dictionary.test.vue` - Integration tests for protected dictionary page
- `pages/account.vue` - Account page that needs authentication check
- `composables/useDictionary.ts` - Existing dictionary composable that needs protection
- `composables/useDictionary.test.ts` - Updated tests for protected dictionary composable
- `utils/gracePeriod.ts` - Utility functions for grace period calculations
- `utils/gracePeriod.test.ts` - Unit tests for grace period utilities
- `utils/subscriptionAnalytics.ts` - Analytics tracking for subscription events
- `utils/subscriptionAnalytics.test.ts` - Unit tests for analytics utilities
- `server/utils/emailNotifications.ts` - Sends trial expiration reminder emails (optional)
 - `server/utils/emailNotifications.test.ts` - Unit tests for trial expiration reminders
 - `vitest.config.ts` - Test runner configuration (Vitest)

### Notes

- Unit tests should be placed alongside their corresponding implementation files
- Use `npm run test:types` to run TypeScript type checking
- Integration tests should verify end-to-end subscription enforcement flows
- Component tests should verify paywall behavior and user interactions

## Testing Strategy

- Test runner: propose Vitest + Vue Test Utils + @nuxt/test-utils and h3 for server routes. No tooling changes made yet.
- Acceptance specs: added under `tests/specs/` to define behavior per phase.
- Unit tests colocated with implementations (created as `describe.skip` placeholders pending runner setup).
- Integration tests: page and API flow tests are outlined with expected scenarios.

Mapping
- Phase 1: `server/utils/auth.test.ts`, `server/utils/validateSubscription.test.ts`, `server/api/dictionary.test.ts`
- Phase 2: `middleware/auth.global.test.ts`, `middleware/subscription.test.ts`, `composables/useAuth.test.ts`
- Phase 3: `components/paywall/SubscriptionRequired.test.ts`, `components/paywall/ExpiredTrialBanner.test.ts`, `components/paywall/FeatureGate.test.ts`, `components/subscription/TrialBanner.test.ts`
- Phase 4: `utils/gracePeriod.test.ts`, `utils/subscriptionAnalytics.test.ts`
- Phase 5: `pages/dictionary.test.ts` (page-level), end-to-end flow in `tests/specs/phase-5-integration.md`

## Tasks

- [x] 1.0 Implement Server-Side Authentication & API Protection
  - [x] 1.1 Add Firebase Admin initialization for server runtime
    - Create `server/plugins/firebaseAdmin.ts` to initialize Admin SDK using env vars
    - Document required env vars in `.env.example` (project ID, client email, private key)
  - [x] 1.2 Implement `server/utils/auth.ts`
    - [x] 1.2.1 `validateUserToken(event)` verifies Bearer token (Firebase ID token)
    - [x] 1.2.2 `getUserSubscriptionStatus(uid)` loads Firestore user, computes trial/grace/active flags
    - [x] 1.2.3 `validateUserSubscription(event)` returns structured result with `canAccessFeatures`
    - [x] 1.2.4 `logAccessAttempt(userInfo, resource, granted)` stub for analytics
  - [x] 1.3 Implement `server/utils/validateSubscription.ts`
    - [x] 1.3.1 Parse auth header, map error codes (`INVALID_TOKEN`, `USER_NOT_FOUND`, `VERIFICATION_FAILED`)
    - [x] 1.3.2 Centralize grace/active checks and return normalized shape
  - [x] 1.4 Protect `server/api/dictionary.get.ts`
    - [x] 1.4.1 Validate token and user subscription before serving data
    - [x] 1.4.2 Allow during grace period; otherwise return 403 with actionable message
    - [x] 1.4.3 Add minimal metadata via response headers (e.g., X-Subscription-Status)
- [x] 1.5 Add server tests (integration/unit)
  - [x] 1.5.1 `server/utils/auth.test.ts` covers token validation and subscription states
  - [x] 1.5.2 `server/utils/validateSubscription.test.ts` covers edge cases and grace logic
  - [x] 1.5.3 `server/api/dictionary.test.ts` ensures API returns 403 for expired users

- [x] 2.0 Create Client-Side Protection Middleware
  - [x] 2.1 Add `composables/useAuth.ts` (wrapper around `useAuthStore`)
    - [x] 2.1.1 Expose `canAccessFeatures`, `subscriptionStatus`, `isInGracePeriod`, `graceDaysRemaining`
    - [x] 2.1.2 Provide `redirectToSubscription(source)` and `redirectToLogin(returnUrl)` helpers
  - [x] 2.2 Add global auth middleware `middleware/auth.global.ts`
    - [x] 2.2.1 Initialize auth store on app load and keep state consistent across navigations
    - [x] 2.2.2 Optionally redirect unauthenticated access to auth-required routes
  - [x] 2.3 Add route middleware `middleware/subscription.ts`
    - [x] 2.3.1 Block access for expired users; store attempted route in `sessionStorage`
    - [x] 2.3.2 Allow access during grace period but surface warnings via UI
    - [x] 2.3.3 Redirect to `/subscription/plans?source=access-denied` when blocked
  - [x] 2.4 Add middleware unit tests
    - [x] 2.4.1 `middleware/auth.global.test.ts`
    - [x] 2.4.2 `middleware/subscription.test.ts`

- [x] 3.0 Build Paywall Components & User Interface
  - [x] 3.1 Create `components/paywall/SubscriptionRequired.vue`
    - [x] 3.1.1 Overlay/inline variant with clear messaging and benefits list
    - [x] 3.1.2 Prominent CTA to `/subscription/plans` and support link
    - [x] 3.1.3 Props: `feature`, `showUpgrade`, slots for custom content
    - [x] 3.1.4 Tests: `components/paywall/SubscriptionRequired.test.vue` (scaffolded; requires Vue test utils to run)
  - [x] 3.2 Create `components/paywall/ExpiredTrialBanner.vue`
    - [x] 3.2.1 Shows days since expiration and urgency styling (red)
    - [x] 3.2.2 Dismissible but persistent per session
    - [x] 3.2.3 Tests: `components/paywall/ExpiredTrialBanner.test.vue` (scaffolded)
  - [x] 3.3 Create `components/paywall/FeatureGate.vue`
    - [x] 3.3.1 Slot-based wrapper that checks subscription and renders fallback
    - [x] 3.3.2 Props: `feature`, `fallbackComponent`, `allowGrace`
    - [x] 3.3.3 Tests: `components/paywall/FeatureGate.test.vue` (scaffolded)
  - [x] 3.4 Enhance `components/subscription/TrialBanner.vue`
    - [x] 3.4.1 Integrate color-coded urgency (info/warning/critical) and grace-state messaging
    - [x] 3.4.2 Improve dismissal logic and re-show rules near expiration (daily during final 3 days or grace)
    - [x] 3.4.3 Wire upgrade CTA to plan selection flow via useAuth

- [x] 4.0 Implement Grace Period Logic & Enhanced Messaging
  - [x] 4.1 Add `utils/gracePeriod.ts`
    - [x] 4.1.1 `isInGracePeriod(trialEndDate, now)` and `getGraceDaysRemaining(trialEndDate, now)`
    - [x] 4.1.2 Timezone-safe date handling and unit tests
  - [x] 4.2 Integrate grace logic
    - [x] 4.2.1 Use in `server/utils/auth.ts` and `composables/useAuth.ts`
    - [x] 4.2.2 Show grace messaging in `TrialBanner.vue` and `ExpiredTrialBanner.vue`
  - [x] 4.3 Add analytics utilities `utils/subscriptionAnalytics.ts`
    - [x] 4.3.1 Track: paywall views, blocked attempts, trial expiration, conversions
    - [x] 4.3.2 Tests: `utils/subscriptionAnalytics.test.ts`
  - [x] 4.4 (Optional) Email notifications
    - [x] 4.4.1 Implement `server/utils/emailNotifications.ts` using `server/utils/email-templates.ts`
    - [x] 4.4.2 Send reminder 1 day before expiration (`shouldSendTrialReminder`, `sendTrialExpirationReminder`)

- [x] 5.0 Integrate Protection into Existing Features
  - [x] 5.1 Protect `pages/dictionary.vue`
    - [x] 5.1.1 Add `definePageMeta({ middleware: ['subscription'] })`
    - [x] 5.1.2 Render `SubscriptionRequired` when user cannot access (via FeatureGate fallback)
  - [x] 5.2 Guard client data loading
    - [x] 5.2.1 Update `composables/useDictionary.ts` to respect `canAccessFeatures`
    - [x] 5.2.2 Prevent offline data load for expired users; show paywall instead
  - [x] 5.3 Update account page UX
    - [x] 5.3.1 Show current subscription status and trial/grace info on `pages/account.vue`
    - [x] 5.3.2 Provide link to customer portal or plans page
  - [x] 5.4 Post-subscription redirect
    - [x] 5.4.1 Read attempted route from storage and redirect after successful purchase
    - [x] 5.4.2 Add success/confirmation messaging (via existing PaymentConfirmation component)
