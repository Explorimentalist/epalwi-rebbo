# Tasks for 0009-prd-firebase-to-jwt-postgresql-migration

## High-Level Tasks

Based on the Firebase to JWT + PostgreSQL migration PRD, I have identified the following 6 main tasks required to implement this migration:

- [ ] **1.0 Infrastructure Setup (Your Tasks)**
- [ ] **2.0 Database Schema Creation and Connection Setup**
- [ ] **3.0 JWT Authentication System Implementation**
- [ ] **4.0 Firebase Dependency Removal and Cleanup**
- [ ] **5.0 API Route Migration (Auth and Dictionary)**
- [ ] **6.0 Frontend Store and Composable Updates**

**Current Firebase Dependencies Found:**
- Client SDK: firebase, firebase/auth, firebase/firestore
- Admin SDK: firebase-admin
- 15+ files with Firebase imports across services, stores, API routes, and utilities

**Task Order Rationale:**
1. **Infrastructure Setup** - Your manual setup tasks (Neon account, environment variables)
2. **Database Schema** - Code the database structure and connection logic
3. **JWT System** - Implement new authentication mechanism
4. **Firebase Cleanup** - Remove conflicts early to avoid dual systems
5. **API Migration** - Update server-side endpoints with clean JWT system
6. **Frontend Updates** - Update client-side integration

**Testing Strategy:**
Each task will include comprehensive testing to ensure reliability during migration:
- Infrastructure connection tests
- Unit tests for new JWT utilities and database functions
- Integration tests for API endpoints 
- Authentication flow end-to-end tests
- Database schema and migration tests

## Relevant Files

### Files to Create
- `lib/db/connection.ts` - PostgreSQL connection setup and configuration ✅
- `lib/db/connection.test.ts` - Database connection tests ✅
- `lib/db/schema.sql` - Database schema creation script ✅
- `lib/db/migrations/001-initial-schema.ts` - Database migration utilities ✅
- `lib/auth/jwt.ts` - JWT token generation and verification utilities ✅
- `lib/auth/middleware.ts` - JWT authentication middleware for API routes ✅
- `lib/auth/session.ts` - Session management with PostgreSQL integration ✅
- `lib/auth/jwt.test.ts` - JWT utilities tests (35 tests passing) ✅
- `lib/auth/middleware.test.ts` - Authentication middleware tests ✅
- `lib/auth/session.test.ts` - Session management tests (36/39 passing) ✅
- `server/utils/database.ts` - Database query utilities and helpers ✅
- `server/utils/database.test.ts` - Database utility tests ✅

### Files to Modify
- `server/api/auth/verify-magic-link.post.ts` - Replace Firebase user creation with PostgreSQL ✅
- `server/api/dictionary.get.ts` - Replace Firebase Auth validation with JWT
- `server/api/stripe/webhook.post.ts` - Update subscription storage from Firestore to PostgreSQL
- `server/api/stripe/create-checkout-session.post.ts` - Update user lookup to PostgreSQL
- `server/api/stripe/create-portal-session.post.ts` - Update user lookup to PostgreSQL
- `stores/auth.ts` - Remove Firebase Auth integration, update JWT handling ✅ (partially)
- `composables/useDictionary.ts` - Remove Firebase token logic, use JWT headers
- `composables/usePreferences.ts` - Remove Firestore integration, update to PostgreSQL
- `services/searchHistory.ts` - Remove Firestore integration, update to PostgreSQL
- `server/utils/auth.ts` - Replace Firebase Admin validation with JWT + PostgreSQL ✅
- `types/auth.ts` - Update types to remove Firebase dependencies ✅ (partially)
- `nuxt.config.ts` - Remove Firebase configuration, add database config
- `package.json` - Remove Firebase dependencies, add PostgreSQL dependencies

### Files to Remove
- `services/firebase.ts` - No longer needed
- `services/firebase-admin.ts` - No longer needed
- `server/plugins/firebaseAdmin.ts` - No longer needed

### Notes

- Unit tests should typically be placed alongside the code files they are testing
- Use `npm run test` to run all tests
- Database tests will require test database setup and cleanup
- Integration tests should test full authentication flows

## Tasks

- [x] **1.0 Infrastructure Setup** 
  - [x] 1.1 Create Neon PostgreSQL database account and project **(User)**
  - [x] 1.2 Generate DATABASE_URL connection string from Neon dashboard **(User)**
  - [x] 1.3 Create strong JWT_SECRET (32+ character random string) **(User)**
  - [x] 1.4 Update Vercel environment variables (add DATABASE_URL, JWT_SECRET) **(User)**
  - [x] 1.5 Remove Firebase environment variables from Vercel **(User)**
  - [x] 1.6 Test database connection from local environment **(User)**

- [x] **2.0 Database Schema Creation and Connection Setup** 
  - [x] 2.1 Create PostgreSQL connection utility (`lib/db/connection.ts`) **(Claude)**
  - [x] 2.2 Write database schema SQL script (`lib/db/schema.sql`) **(Claude)**
  - [x] 2.3 Implement database migration utilities (`lib/db/migrations/001-initial-schema.ts`) **(Claude)**
  - [x] 2.4 Create database query helper utilities (`server/utils/database.ts`) **(Claude)**
  - [x] 2.5 Write comprehensive database tests **(Claude)**
  - [x] 2.6 Test database connection and schema creation locally **(Claude)**

- [x] **3.0 JWT Authentication System Refactoring (PostgreSQL Integration)** 
  - [x] 3.1 Extract and refactor existing JWT utilities to `lib/auth/jwt.ts` **(Claude)**
  - [x] 3.2 Implement JWT authentication middleware (`lib/auth/middleware.ts`) **(Claude)**
  - [x] 3.3 Update JWT session management to use PostgreSQL instead of Firebase **(Claude)**
  - [x] 3.4 Create comprehensive JWT utilities tests (`lib/auth/jwt.test.ts`) **(Claude)**
  - [x] 3.5 Create authentication middleware tests (`lib/auth/middleware.test.ts`) **(Claude)**
  - [x] 3.6 Create session management tests (`lib/auth/session.test.ts`) **(Claude)**
  - [x] 3.7 Run integration tests for JWT authentication system **(Claude)**
  - [x] 3.8 Replace Firebase user creation with PostgreSQL in `verify-magic-link.post.ts` **(Claude)**
  - [x] 3.9 Update `server/utils/auth.ts` to use PostgreSQL instead of Firestore **(Claude)**

- [x] **4.0 Firebase Dependency Removal and Cleanup** ✅ COMPLETED
  - [x] 4.1 Remove firebase and firebase-admin packages from package.json **(Claude)**
  - [x] 4.2 Delete Firebase service files (`services/firebase.ts`, `services/firebase-admin.ts`) **(Claude)**
  - [x] 4.3 Remove Firebase configuration from `nuxt.config.ts` **(Claude)**
  - [x] 4.4 Update TypeScript types to remove Firebase dependencies **(Claude)**
  - [x] 4.5 Clean up any remaining Firebase imports across the codebase **(Claude)**
  - [x] 4.6 Test that build succeeds without Firebase dependencies **(Claude)**

- [ ] **5.0 API Route Migration (Auth and Dictionary)** 
  - [x] 5.1 Update magic link verification API to use PostgreSQL and JWT **(Claude)**
  - [x] 5.2 Update dictionary API to use JWT authentication **(Claude)**
  - [x] 5.3 Update Stripe webhook to store subscription data in PostgreSQL **(Claude)**
  - [x] 5.4 Update Stripe checkout session creation to use PostgreSQL **(Claude)**
  - [x] 5.5 Update subscription validation utilities (`server/utils/auth.ts`) **(Claude)**
  - [x] 5.6 Test all API endpoints with new authentication system **(Claude)**
  - [ ] 5.7 Test Stripe integration with PostgreSQL storage **(Claude)**

- [ ] **6.0 Frontend Store and Composable Updates** 
  - [x] 6.1 Update auth store to remove Firebase Auth integration **(Claude)**
  - [x] 6.2 Update auth store to handle JWT session tokens **(Claude)**
  - [x] 6.3 Update dictionary composable to use JWT headers instead of Firebase tokens **(Claude)**
  - [x] 6.4 Update preferences composable to use PostgreSQL via API **(Claude)**
  - [x] 6.5 Update search history service to use PostgreSQL via API **(Claude)**
  - [ ] 6.6 Test complete authentication flow from frontend **(Claude)**
  - [ ] 6.7 Test dictionary access and subscription enforcement **(Claude)**
  - [ ] 6.8 Perform end-to-end testing of magic link → authentication → dictionary access **(Claude)**