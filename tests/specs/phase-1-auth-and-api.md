# Phase 1 — Auth & API Protection: Acceptance Tests

1. Auth token validation
- Reject missing/invalid Bearer token with errorCode=INVALID_TOKEN
- Accept valid Firebase ID token and expose uid/email

2. Subscription status computation
- Trial active: canAccessFeatures=true, trialDaysRemaining>0
- Grace period: trial expired; graceDaysRemaining>0; canAccessFeatures=true
- Expired: no trial/grace; hasActiveSubscription=false; canAccessFeatures=false
- Active subscription: status=active; canAccessFeatures=true

3. Dictionary API protection
- GET /api/dictionary with active subscription returns 200 and data
- GET with trial active returns 200 and data
- GET within grace returns 200 and data + flag for grace
- GET expired returns 403 with actionable message and errorCode=SUBSCRIPTION_EXPIRED
- Verification failure returns 503-like error with errorCode=VERIFICATION_FAILED

4. Logging
- Access granted/denied attempts are logged via logAccessAttempt
