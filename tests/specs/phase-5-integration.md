# Phase 5 — Integration: Acceptance Tests

1. Dictionary page protection
- Visiting /dictionary when expired redirects to /subscription/plans
- Visiting /dictionary in grace period allows access but shows banners
- After subscribing, user returns to stored attempted route

2. Offline behavior
- Expired users cannot load offline data; paywall shown
- Trial/active users can load offline data

3. API + client cohesion
- Client respects canAccessFeatures and avoids fetching data when blocked
