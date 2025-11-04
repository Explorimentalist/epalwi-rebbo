# Phase 3 — Paywall UI: Acceptance Tests

1. SubscriptionRequired.vue
- Renders clear message and benefits list
- Shows primary CTA to /subscription/plans
- Supports overlay and inline modes
- Emits events for analytics

2. ExpiredTrialBanner.vue
- Shows days since expiration
- Uses urgency styling (red) when expired
- Dismissible but reappears next session

3. FeatureGate.vue
- Renders slot when canAccessFeatures=true
- Renders fallback when access denied
- Handles loading state while checking

4. TrialBanner.vue enhancements
- Color-coded urgency (info/warning/critical)
- Re-show logic near expiration
- CTA wiring to plan selection
