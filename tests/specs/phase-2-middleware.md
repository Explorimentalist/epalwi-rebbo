# Phase 2 — Client Middleware: Acceptance Tests

1. Global auth middleware
- Initializes auth store once on app load
- Persists auth state across navigations
- Redirects unauthenticated users when accessing auth-required routes

2. Subscription route middleware
- Allows access for active/trial users
- Allows access in grace period but stores attempted route
- Blocks expired users, stores attempted route, redirects to /subscription/plans

3. Composable `useAuth`
- Exposes canAccessFeatures, subscriptionStatus, isInGracePeriod, graceDaysRemaining
- redirectToSubscription adds source param; redirectToLogin adds return param
