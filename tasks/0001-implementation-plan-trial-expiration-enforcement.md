# Implementation Plan: Trial Expiration Enforcement

## Overview
This document provides the detailed technical implementation plan for the Trial Expiration Enforcement feature as defined in `0001-prd-trial-expiration-enforcement.md`.

## Development Phases

### Phase 1: Authentication Utilities & Server-Side Protection (Week 1)

#### 1.1 Server-Side Authentication Utilities
**File**: `server/utils/auth.ts`
```typescript
// Create utilities for validating user authentication and subscription status
// - validateUserToken(): Verify Firebase JWT tokens
// - getUserSubscriptionStatus(): Get user subscription from Firestore
// - hasActiveSubscription(): Check if user has valid subscription or trial
// - isInGracePeriod(): Check if user is in 1-3 day grace period
```

#### 1.2 API Protection Implementation
**File**: `server/api/dictionary.get.ts` (MODIFY)
```typescript
// Before: Open access to dictionary data
// After: Subscription-protected with proper error handling
// - Add authentication header validation
// - Check subscription status before serving data
// - Return 403 with subscription-required message for expired users
// - Implement graceful fallback for verification failures
```

#### 1.3 Subscription Validation Utility
**File**: `server/utils/validateSubscription.ts`
```typescript
// Centralized subscription validation logic
// - parseAuthToken(): Extract user info from request
// - checkTrialStatus(): Calculate trial expiration and grace period
// - checkPaidSubscription(): Validate active Stripe subscription
// - logAccessAttempt(): Track attempts for analytics
```

### Phase 2: Client-Side Protection & Middleware (Week 2)

#### 2.1 Authentication Composable
**File**: `composables/useAuth.ts`
```typescript
// Client-side authentication state management
// - isAuthenticated: Check if user is logged in
// - canAccessFeatures: Check if user can access premium features
// - subscriptionStatus: Get current subscription state
// - trialInfo: Get trial days remaining and expiration status
// - gracePeriodInfo: Get grace period status and remaining days
```

#### 2.2 Global Authentication Middleware
**File**: `middleware/auth.global.ts`
```typescript
// Global middleware for authentication checks
// - Run on every route change
// - Redirect unauthenticated users to /auth/login
// - Initialize auth store on app load
// - Handle authentication state persistence
```

#### 2.3 Subscription-Required Middleware
**File**: `middleware/subscription.ts`
```typescript
// Named middleware for subscription-protected routes
// - Check if user has active subscription or trial
// - Handle grace period logic (allow access with warnings)
// - Redirect expired users to /subscription/plans
// - Store attempted route for post-subscription redirect
```

### Phase 3: Paywall Components & User Interface (Week 3)

#### 3.1 Main Paywall Component
**File**: `components/paywall/SubscriptionRequired.vue`
```vue
<!-- Primary paywall component for blocking access -->
<!-- Props: feature (string), showUpgrade (boolean) -->
<!-- Features:
  - Clear messaging about subscription requirement
  - Prominent "Subscribe Now" CTA button
  - Feature benefits list
  - Support contact link
  - Responsive design for mobile/desktop
-->
```

#### 3.2 Expired Trial Banner
**File**: `components/paywall/ExpiredTrialBanner.vue`
```vue
<!-- Banner for users with expired trials -->
<!-- Features:
  - Shows days since expiration
  - Grace period messaging
  - Urgent upgrade prompts
  - Dismissible but persistent
  - Color-coded urgency (red for expired)
-->
```

#### 3.3 Feature Gate Wrapper
**File**: `components/paywall/FeatureGate.vue`
```vue
<!-- Wrapper component for protecting premium features -->
<!-- Props: feature (string), fallbackComponent (string) -->
<!-- Features:
  - Slot-based content protection
  - Automatic subscription checking
  - Fallback content for expired users
  - Loading states during verification
-->
```

#### 3.4 Enhanced Trial Banner
**File**: `components/subscription/TrialBanner.vue` (MODIFY)
```vue
<!-- Enhance existing trial banner with:
  - Grace period messaging
  - Color-coded urgency levels
  - Enhanced dismissal logic
  - Email notification opt-in
  - Better mobile responsiveness
-->
```

### Phase 4: Route Protection & Component Guards (Week 4)

#### 4.1 Dictionary Page Protection
**File**: `pages/dictionary.vue` (MODIFY)
```vue
<!-- Add subscription protection:
  - Use subscription middleware
  - Show paywall overlay for expired users
  - Maintain search history for returning subscribers
  - Handle offline state for expired users
-->
```

#### 4.2 Dictionary Composable Protection
**File**: `composables/useDictionary.ts` (MODIFY)
```typescript
// Add subscription validation to dictionary functions:
// - Check subscription before API calls
// - Block offline data access for expired users
// - Show appropriate error messages
// - Preserve user data for future subscription
```

#### 4.3 Account Page Protection
**File**: `pages/account.vue` (MODIFY)
```vue
<!-- Ensure account page requires authentication:
  - Use auth middleware
  - Show login prompt for unauthenticated users
  - Display subscription status clearly
  - Provide upgrade options for expired trials
-->
```

### Phase 5: Grace Period Logic & Enhanced Messaging (Week 5)

#### 5.1 Grace Period Calculator
**File**: `utils/gracePeriod.ts`
```typescript
// Grace period calculation utilities:
// - calculateGracePeriod(): Determine if user is in grace period
// - getGraceDaysRemaining(): Days left in grace period
// - shouldShowGraceWarning(): When to show grace period messages
// - getGraceMessage(): Contextual messaging for grace period
```

#### 5.2 Enhanced Error Handling
**File**: `composables/useSubscriptionError.ts`
```typescript
// Subscription error handling composable:
// - handleVerificationFailure(): Graceful fallback logic
// - retrySubscriptionCheck(): Automatic retry mechanism
// - logSubscriptionError(): Error tracking for analytics
// - showUserFriendlyError(): User-friendly error messages
```

#### 5.3 Email Notification Integration
**File**: `server/utils/emailNotifications.ts`
```typescript
// Email notification system for trial expiration:
// - scheduleTrialExpirationEmail(): Send email 24hrs before expiration
// - sendGracePeriodWarning(): Email during grace period
// - sendSubscriptionConfirmation(): Welcome email for new subscribers
```

### Phase 6: Testing & Monitoring (Week 6)

#### 6.1 Unit Tests
**Files**: `tests/unit/auth.test.ts`, `tests/unit/subscription.test.ts`
```typescript
// Comprehensive test coverage:
// - Authentication utilities
// - Subscription validation logic
// - Grace period calculations
// - Paywall component behavior
// - API protection mechanisms
```

#### 6.2 Integration Tests
**Files**: `tests/integration/subscriptionFlow.test.ts`
```typescript
// End-to-end subscription flow testing:
// - Trial expiration scenarios
// - Grace period behavior
// - Subscription upgrade flow
// - Offline access restrictions
// - Error handling scenarios
```

#### 6.3 Analytics Implementation
**File**: `utils/subscriptionAnalytics.ts`
```typescript
// Analytics tracking for subscription events:
// - trackTrialExpiration(): Track when trials expire
// - trackPaywallView(): Track paywall impressions
// - trackSubscriptionConversion(): Track successful upgrades
// - trackAccessDenied(): Track blocked access attempts
```

## File Structure Summary

```
├── server/
│   ├── api/
│   │   └── dictionary.get.ts (MODIFY)
│   └── utils/
│       ├── auth.ts (NEW)
│       ├── validateSubscription.ts (NEW)
│       └── emailNotifications.ts (NEW)
├── middleware/
│   ├── auth.global.ts (NEW)
│   └── subscription.ts (NEW)
├── composables/
│   ├── useAuth.ts (NEW)
│   ├── useSubscriptionError.ts (NEW)
│   └── useDictionary.ts (MODIFY)
├── components/
│   ├── paywall/
│   │   ├── SubscriptionRequired.vue (NEW)
│   │   ├── ExpiredTrialBanner.vue (NEW)
│   │   └── FeatureGate.vue (NEW)
│   └── subscription/
│       └── TrialBanner.vue (MODIFY)
├── pages/
│   ├── dictionary.vue (MODIFY)
│   └── account.vue (MODIFY)
├── utils/
│   ├── gracePeriod.ts (NEW)
│   └── subscriptionAnalytics.ts (NEW)
└── tests/
    ├── unit/
    │   ├── auth.test.ts (NEW)
    │   └── subscription.test.ts (NEW)
    └── integration/
        └── subscriptionFlow.test.ts (NEW)
```

## Implementation Priority

### High Priority (Must Have)
1. Server-side API protection (`server/utils/auth.ts`, `server/api/dictionary.get.ts`)
2. Basic paywall component (`components/paywall/SubscriptionRequired.vue`)
3. Route protection middleware (`middleware/subscription.ts`)
4. Dictionary page protection (`pages/dictionary.vue`)

### Medium Priority (Should Have)
5. Grace period logic (`utils/gracePeriod.ts`)
6. Enhanced trial banner (`components/subscription/TrialBanner.vue`)
7. Feature gate wrapper (`components/paywall/FeatureGate.vue`)
8. Error handling (`composables/useSubscriptionError.ts`)

### Lower Priority (Nice to Have)
9. Email notifications (`server/utils/emailNotifications.ts`)
10. Analytics tracking (`utils/subscriptionAnalytics.ts`)
11. Comprehensive testing suite
12. Advanced error recovery mechanisms

## Deployment Strategy

### Development Environment
1. Test with mock subscription data
2. Verify all protection mechanisms work
3. Test grace period behavior manually
4. Validate paywall user experience

### Staging Environment
1. Test with real Stripe subscription data
2. Verify webhook integration
3. Test email notification delivery
4. Performance testing under load

### Production Rollout
1. **Phase 1**: Deploy server-side protection (low user impact)
2. **Phase 2**: Deploy client-side middleware (moderate impact)
3. **Phase 3**: Deploy paywall components (high visibility)
4. **Phase 4**: Enable email notifications and analytics

## Success Metrics Tracking

### Technical Metrics
- API protection effectiveness: 0% unauthorized access
- Page load performance: <100ms additional latency
- Error rate: <1% subscription verification failures
- Uptime: 99.9% availability during rollout

### Business Metrics
- Subscription conversion rate: 15-25% improvement
- Revenue impact: 20%+ increase in MRR
- User satisfaction: Maintain 4.5+ app rating
- Support impact: <5% increase in tickets

This implementation plan provides a comprehensive roadmap for enforcing trial expiration while maintaining excellent user experience and protecting business value.