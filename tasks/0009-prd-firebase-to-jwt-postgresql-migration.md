# 0009-prd-firebase-to-jwt-postgresql-migration

## Introduction/Overview

This feature involves a complete migration from Firebase (Authentication, Firestore) to a JWT-based authentication system with PostgreSQL database. The current Firebase implementation suffers from connectivity issues (WebChannel SID errors), complex deployment requirements, potential high costs at scale, and user ID consistency problems. This migration will replace all Firebase dependencies with a simpler, more reliable JWT + PostgreSQL architecture using Neon (free tier) and Vercel, maintaining all existing authentication features while solving current reliability issues.

**Goal:** Replace Firebase entirely with JWT authentication and PostgreSQL database to achieve better reliability, simpler deployment, lower costs, and consistent user management.

## Goals

1. **Eliminate Firebase Dependencies:** Remove all Firebase SDKs (client and admin) from the codebase
2. **Maintain Authentication Features:** Preserve magic link authentication, trial period tracking, and subscription management
3. **Improve Reliability:** Solve current WebChannel SID errors and authentication failures
4. **Reduce Costs:** Start with £0/month architecture using free tiers (Neon + Vercel)
5. **Simplify Deployment:** Remove need for Firebase credentials and complex service configurations
6. **Ensure Data Consistency:** Implement consistent user ID generation (no mock/real Firebase ID splits)
7. **Maintain API Compatibility:** Keep existing API endpoints working with minimal frontend changes

## User Stories

1. **As a new user**, I want to receive a magic link email and authenticate successfully without Firebase connectivity errors, so I can access the dictionary reliably.

2. **As an authenticated user**, I want my trial period and subscription status to be tracked consistently, so my access permissions work correctly.

3. **As a returning user**, I want my authentication to work regardless of Firebase service status, so I have reliable access to paid features.

4. **As a subscriber**, I want my Stripe payments to properly update my access permissions, so I maintain uninterrupted dictionary access.

5. **As a developer**, I want simple deployment without Firebase credentials management, so I can deploy updates without authentication infrastructure complexity.

## Functional Requirements

### Authentication System
1. **The system must accept magic link tokens** and verify them using JWT validation (maintaining existing flow).
2. **The system must generate consistent user IDs** using database auto-increment or UUIDs (no Firebase dependency).
3. **The system must create user profiles** in PostgreSQL with email, trial dates, and subscription status.
4. **The system must generate JWT session tokens** for API authentication after successful magic link verification.
5. **The system must validate JWT tokens** for all protected API endpoints (replacing Firebase ID token validation).

### Database Schema
6. **The system must implement a users table** with fields: id, email, created_at, trial_end_date, is_active.
7. **The system must implement a subscriptions table** with fields: user_id, stripe_customer_id, stripe_subscription_id, status, current_period_end.
8. **The system must implement proper foreign key relationships** between users and subscriptions.
9. **The system must include database indexes** on email, stripe_customer_id for performance.

### API Compatibility
10. **The system must maintain existing API endpoints** (/api/auth/verify-magic-link, /api/dictionary, etc.).
11. **The system must return compatible response formats** for frontend components (user profile structure).
12. **The system must handle trial period calculations** exactly as current Firebase implementation.
13. **The system must integrate with Stripe webhooks** updating PostgreSQL instead of Firestore.

### Dictionary Access Control
14. **The system must authenticate dictionary API requests** using JWT tokens in Authorization headers.
15. **The system must validate user subscription status** by querying PostgreSQL user/subscription data.
16. **The system must enforce trial period expiration** preventing access after trial ends.
17. **The system must allow access during grace periods** as per existing business logic.

## Non-Goals (Out of Scope)

1. **Real-time features:** No WebSocket connections or live data synchronization
2. **Firebase hosting migration:** Continue using Vercel for hosting
3. **Email service changes:** Keep existing MailerSend integration
4. **Frontend component changes:** Maintain existing Vue components and stores
5. **Stripe integration changes:** Keep existing Stripe checkout and webhook logic
6. **PWA functionality changes:** Maintain offline dictionary features and service worker
7. **Social authentication:** Only email-based magic link authentication
8. **Data analytics migration:** Firebase Analytics can remain if used elsewhere

## Design Considerations

### Database Provider
- **Primary:** Neon PostgreSQL (free tier: 3GB storage, 1 database)
- **Backup:** Any PostgreSQL-compatible service for future scalability

### JWT Implementation
- **Token Type:** Stateless JWT with user ID and permissions claims
- **Expiration:** 7-day access tokens with refresh token rotation
- **Security:** HMAC-SHA256 signing with environment variable secret

### API Changes
- **Minimal Changes:** Existing endpoints keep same URLs and request/response formats
- **Header Changes:** Replace Firebase ID tokens with JWT Bearer tokens
- **Error Handling:** Maintain same error response structures for frontend compatibility

## Technical Considerations

### Dependencies to Remove
- firebase (client SDK)
- firebase-admin (server SDK)
- All Firebase-related imports and configurations

### Dependencies to Add
- pg (PostgreSQL driver)
- jsonwebtoken (JWT handling)
- @types/jsonwebtoken (TypeScript definitions)

### Environment Variables
- **Remove:** All FIREBASE_* environment variables
- **Add:** DATABASE_URL, JWT_SECRET
- **Keep:** Stripe, email service, and other non-Firebase variables

### Migration Scripts
- Database schema creation scripts
- Environment variable update guide
- Deployment configuration updates

## Success Metrics

1. **Reliability:** Zero authentication failures due to Firebase connectivity (target: 99.9% auth success rate)
2. **Performance:** API response times under 200ms (faster than current Firebase calls)
3. **Cost Reduction:** £0 monthly cost until 100+ active users (vs current Firebase costs)
4. **Deployment Simplicity:** Single environment file deployment (no Firebase service account keys)
5. **User Experience:** Seamless magic link authentication with no user-facing changes
6. **Developer Experience:** Reduced deployment complexity and easier debugging

## Open Questions

1. **JWT Secret Management:** Should we implement automatic JWT secret rotation for enhanced security?
2. **Database Connection Pooling:** Do we need connection pooling configuration for Neon free tier?
3. **Monitoring:** What monitoring should we implement for the new authentication system?
4. **Rate Limiting:** Should we implement API rate limiting at the JWT validation level?
5. **Backup Strategy:** What backup/restore procedures should we establish for PostgreSQL?
6. **Error Logging:** How should we handle and log authentication errors in the new system?

---

**Next Steps:** 
1. Review and approve this PRD
2. Create implementation tasks based on functional requirements
3. Set up development database and test environment
4. Begin implementation with authentication system migration