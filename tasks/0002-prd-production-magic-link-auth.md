# PRD: Production Magic‑Link Auth (Firebase) + Preferences + Search History

## 1) Overview

We will replace the current development‑only magic link flow (custom JWT + MailerSend) with a production‑ready passwordless sign‑in using Firebase Auth “Email link” (a.k.a. magic link). After sign‑in, we will persist user preferences and search history so users keep their settings and recent searches across sessions and devices. The solution will run on Firebase (Nitro preset already set to `firebase`).

Your selections (for traceability):
- Scope: All features (Auth + Preferences + Search History)
- Runtime: Firebase Functions (Nitro preset), Application Default Credentials
- Email: Firebase Auth Email Link (not MailerSend)
- Users collection: keep `users/{uid}` schema
- Custom claims: include `role` and `subscriptionStatus`
- Redirect: honor `return=` else `/dictionary`; explicit error screen for invalid/expired tokens with “Resend link”
- Firestore Rules: out of scope here (handled later)
- Rate limiting: simple in‑memory for dev only
- Dev behavior: keep mock fallback if Admin creds absent; environment‑driven rollout
- Success metrics: Adoption/latency/errors after verify

## 2) Goals

- Provide production passwordless sign‑in with Firebase Auth email links.
- Create/update `users/{uid}` profile in Firestore on first sign‑in; set custom claims (`role`, `subscriptionStatus`).
- Persist user preferences (e.g., default language, dark mode).
- Persist search history with offline + cross‑device sync.
- Smooth UX: validate link, redirect to `return=` or `/dictionary`, and show helpful errors.
- Keep development fallback to existing mock auth when Admin credentials are missing.

## 3) User Stories

- As a user, I enter my email and receive a login link to access my account without a password.
- As a user, after clicking the link, I’m signed in and redirected to the page I intended, or to the dictionary by default.
- As a user, my app preferences (e.g., default dictionary language, dark mode) are remembered across sessions/devices.
- As a user, my recent searches appear the next time I open the app, even on another device.
- As a user, if my link is invalid/expired, I see an error with a clear path to resend the link.

## 4) Functional Requirements

Auth flow (Firebase Email Link)
1. The login page must call Firebase Auth `sendSignInLinkToEmail(email, actionCodeSettings)` to send the link.
2. `actionCodeSettings.url` must include `return` if present so redirection is preserved; `handleCodeInApp` must be `true`.
3. The verify page must detect the email link via `isSignInWithEmailLink(auth, location.href)` and complete sign‑in with `signInWithEmailLink(auth, email, location.href)`.
4. If the email is not available locally (e.g., user opened on another device), the verify page must prompt for email to complete sign‑in.
5. On first sign‑in, the client must call a backend endpoint to upsert the Firestore user profile (`users/{uid}`) and ensure custom claims (`role`, `subscriptionStatus`) are set. The client must then refresh the ID token to pick up claims.
6. Post sign‑in redirect must honor `return=` if present, else `/dictionary`.

Server (Firebase Functions / Nitro)
7. Expose `POST /api/auth/post-sign-in` to:
   - Create or update `users/{uid}` with: `email`, `displayName?`, `photoURL?`, `role`, `createdAt`, `lastLoginAt`, `trial` (start/end/daysRemaining/isExpired), `subscription.status`.
   - Set custom claims via Admin SDK: `{ role, subscriptionStatus }`.
   - Return the authoritative `UserProfile` and a flag indicating if claims changed.
8. Keep existing dev endpoints (`send-magic-link`, `verify-magic-link`) for fallback, but production path should use Firebase Auth Email Link.

Client auth store and middleware
9. Login form must save `emailForSignIn` in `localStorage` to support completing the link on the same device.
10. Verify page must handle: success, invalid link, expired link, unknown email; provide a “Resend link” action returning to `/auth/login` prefilled.
11. After successful sign‑in and server upsert/claims set, the store must be hydrated; subscription store loads user subscription data as today.
12. Redirect logic: honor `return=` stored in URL/session; fallback to `/dictionary`.
13. Development fallback: if Admin credentials are missing, retain mock behavior so local flows continue to work.

Preferences
14. Extend `users/{uid}` to include `preferences` object:
    - `preferences.defaultLanguage`: `'español' | 'ndowe'` (default `'español'`)
    - `preferences.darkMode`: `boolean` (default `false`)
    - Optional future fields (notifications, font size) are out of scope to implement now.
15. Add a small preferences service/composable:
    - `getPreferences(uid)` reads from Firestore, caches in IndexedDB for offline use.
    - `updatePreferences(uid, partial)` writes to Firestore and updates cache.
16. UI: Provide hooks on the dictionary and settings views to read/apply preferences on mount and to persist changes.

Search history
17. Store recent searches both locally (IndexedDB) and in Firestore for signed‑in users.
    - Firestore path: `users/{uid}/searches/{autoId}` with fields `{ query: string, language: 'español'|'ndowe', ts: number }`.
18. Maintain last N (e.g., 50) items per user; eviction policy: remove oldest beyond N during sync.
19. Sync strategy:
    - On sign‑in: merge local IndexedDB history into Firestore (dedupe by `query` + `language`, keep latest `ts`).
    - On app start: load from Firestore if online, else from IndexedDB; write‑through to both during session.
20. Dictionary page must render “Búsquedas Recientes” from the unified history service (not component‑local state).

Error handling and rate limiting
21. Show a dedicated verify error screen with: reason, “Resend link”, and link back to `/auth/login`.
22. Keep simple in‑memory rate limiting on the login request in dev builds; production relies on Firebase’s own controls.

Telemetry and metrics
23. Emit client events (console or light analytics hook) for: send‑link request, verify start/success/failure, redirect target, and sync results.
24. Capture timing from click on magic link to authenticated state (target < 5s on average, given network variability).

## 5) Non‑Goals

- Firestore Security Rules changes (to be handled in a separate task).
- Stripe integration changes; subscription logic remains as is.
- Broad settings beyond the listed preferences.
- Admin console/management UI.

## 6) Design Considerations

- Reuse existing auth pages (`/auth/login`, `/auth/verify`).
- Login: copy updates to reflect “email link” and that the link may be used on the same or another device.
- Verify: final success state remains; error state adds “Resend link”.
- Preferences: leverage existing design system toggles/inputs in the Settings/Account view and the Dictionary view’s language toggle.
- Search history: keep the present “Búsquedas Recientes” block but source data from the new history service.

## 7) Technical Considerations

Firebase setup
- Enable “Email link (passwordless)” provider in Firebase Auth.
- Configure authorized domains and action URL (e.g., `https://<your-domain>/auth/verify`).
- Ensure Application Default Credentials (ADC) available to Firebase Functions for Admin SDK.

Endpoints
- New: `POST /api/auth/post-sign-in` (server)
  - Input: `{ uid: string }` (server infers claims/subscription from Firestore/existing rules or initial defaults)
  - Behavior: upsert user doc; set claims; return `{ user, claimsUpdated }`.
- Dev fallback: keep `/api/auth/send-magic-link` and `/api/auth/verify-magic-link` for local mock mode.

Client changes
- Login: replace server “send magic link” with Firebase client `sendSignInLinkToEmail`; store `emailForSignIn` in `localStorage`.
- Verify: use `isSignInWithEmailLink` + `signInWithEmailLink`; if no email found locally, prompt user for email.
- After sign‑in: call `/api/auth/post-sign-in`; if `claimsUpdated`, force refresh ID token.
- Update Pinia auth store to support the new production path while retaining dev fallback.

Data model
- `users/{uid}` keeps current fields and adds `preferences` (see FR‑14).
- Search history: `users/{uid}/searches/{autoId}` as defined in FR‑17.

Sync and offline
- IndexedDB remains the cache for dictionary and becomes cache for preferences and search history.
- Implement simple conflict resolution for history by preferring the latest timestamp.

Redirect behavior
- Parse `return=` from action link URL, store in session during verify, and navigate to it post sign‑in; else `/dictionary`.

Environment and rollout
- Environment‑driven: production uses Firebase Email Link; dev can fall back to mock endpoints if Admin is not configured.

## 8) Success Metrics

- M1: Percentage of verify flows that result in an authenticated Firebase session within 5 seconds (target ≥ 95%).
- M2: Verify failure/error rate (target < 2% excluding user‑initiated cancellations).
- M3: Post‑verify navigation to intended route (`return=`) vs fallback; track distribution.
- M4: Preferences and search history persistence success (no errors during read/write on sign‑in and app start).

## 9) Open Questions

1. Firebase Auth email templates: confirm sender name/branding (“epàlwi‑rèbbo”) and localized content (ES).
2. Maximum number of search history items to retain in Firestore (default suggested: 50). Is this acceptable?
3. Preferences: any additional fields needed now (e.g., text size, notifications) or keep scope minimal?
4. Should we migrate existing dev mock users into real Firebase users at some point, or treat them as ephemeral?
5. Domain setup: final production hostname(s) to add to Firebase Auth authorized domains?

---

This PRD focuses on clear, implementable requirements for a junior developer. Follow‑up tasks can split implementation into phases: (A) Email Link Auth, (B) Preferences, (C) Search History, (D) Telemetry polish, (E) Security Rules.

