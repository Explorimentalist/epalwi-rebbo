# Phase 4 — Grace Period & Analytics: Acceptance Tests

1. utils/gracePeriod.ts
- isInGracePeriod returns true only between trialEnd and +3 days
- getGraceDaysRemaining returns ceil of remaining days, min 0
- Timezone changes do not flip results incorrectly

2. Analytics tracking
- trackPaywallView fired when paywall shown
- trackAccessDenied fired on blocked attempts
- trackTrialExpiration fired on transition to expired
- trackSubscriptionConversion fired on successful subscription
