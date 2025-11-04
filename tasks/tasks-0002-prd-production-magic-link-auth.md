## Relevant Files

- `pages/auth/login.vue` - Login form; will send Firebase Email Link and store `emailForSignIn`.
- `pages/auth/verify.vue` - Completes Email Link sign-in, handles errors, and redirects.
- `stores/auth.ts` - Pinia auth store; add production email-link actions, post‑sign‑in call, token refresh, and cleanup.
- `middleware/auth.global.ts` - Initializes auth on app load; keep behavior stable.
- `middleware/subscription.ts` - Route guard; ensure no pre‑init redirects and honor attempted route.
- `services/firebase.ts` - Firebase initialization; ensure correct behavior between dev emulators and production.
- `server/api/auth/post-sign-in.post.ts` - New endpoint to upsert user profile and set custom claims via Admin SDK.
- `stores/subscription.ts` - Loads subscription data after sign‑in; no major changes but ensure sequence.
- `types/auth.ts` - Extend `UserProfile` with `preferences` structure.
- `composables/usePreferences.ts` - New; read/write preferences (Firestore + cache) and expose to UI.
- `services/searchHistory.ts` - New; manage recent searches (Firestore subcollection + IndexedDB) and sync.
- `services/indexedDB.ts` - Extend with preferences and search history storage instances/utilities.
- `pages/dictionary.vue` - Use preferences for default language and service‑backed recent searches.
- `pages/account.vue` - Wire settings toggles to preferences service (dark mode, default language).
- `utils/telemetry.ts` - New; light event logger for success metrics.
- `nuxt.config.ts` - Ensure runtime config values for action URL; optional feature flag for dev fallback.
- `ENV_SETUP_GUIDE.md` - Add steps to enable Firebase Email Link, configure domains, and env values.
- `tests/auth/email-link.spec.ts` - Unit/integration tests for email link flows (client store + verify view).
- `tests/services/search-history.spec.ts` - Tests for merge/dedupe and storage.
- `tests/composables/preferences.spec.ts` - Tests for read/write preferences and caching.

### Notes

- This repo uses Vitest. Run tests with `npm run test` or `npx vitest`.
- Place tests under `tests/` or alongside files where a co-located pattern exists.
- For Firebase Admin in local development, keep mock fallback; production deploy uses ADC.

## Tasks

- [x] 1.0 Implement Firebase Email Link sign-in (client)
  - [x] 1.1 Add action URL handling: derive from `useRuntimeConfig().public.appUrl` + `/auth/verify` and include `return` param when present.
  - [x] 1.2 Add `sendEmailLink(email)` in `stores/auth.ts` using `sendSignInLinkToEmail(auth, email, actionCodeSettings)`; save `emailForSignIn` to `localStorage`.
  - [x] 1.3 Update `pages/auth/login.vue` to call the new store action; show success modal; keep dev mock path behind an env flag.
  - [x] 1.4 Add `completeEmailLink(url, email?)` in `stores/auth.ts` using `isSignInWithEmailLink` and `signInWithEmailLink`.
  - [x] 1.5 Update `pages/auth/verify.vue` to prompt for email when missing, then call `completeEmailLink`; handle success/error states and timer.
  - [x] 1.6 On success, call server `POST /api/auth/post-sign-in`; then refresh ID token if claims changed; load profile + subscription.
  - [x] 1.7 Redirect: honor `return=` if present; else use `/dictionary`; fall back to attempted-route from session.
  - [x] 1.8 Keep development fallback (current custom JWT endpoints) if a `NUXT_PUBLIC_DEV_AUTH_MOCK` flag is true or Admin unavailable.

- [x] 2.0 Add post-sign-in upsert endpoint (server, Admin SDK)
  - [x] 2.1 Create `server/api/auth/post-sign-in.post.ts` using Firebase Admin (ADC); verify caller by ID token (Authorization: Bearer).
  - [x] 2.2 Upsert `users/{uid}` with: `email`, `displayName?`, `photoURL?`, `role`, `createdAt`, `lastLoginAt`, `subscription.status`, `trial` (compute if new), and default `preferences`.
  - [x] 2.3 Determine `subscriptionStatus` from user doc (fallback to `'trial'` initially).
  - [x] 2.4 Set custom claims `{ role, subscriptionStatus }`; return `{ user, claimsUpdated: boolean }`.
  - [x] 2.5 Defensive dev mode: if Admin not initialized, return success with a no‑op and log a warning.
  - [x] 2.6 Add minimal error handling with meaningful status codes and messages.

- [x] 3.0 Integrate auth store + middleware with production path and redirects
  - [x] 3.1 In `stores/auth.ts`, wire post‑sign‑in call and ID token refresh; then call existing `loadUserProfile` and subscription loader.
  - [x] 3.2 Ensure `signOut()` clears `localStorage.emailForSignIn`, dev session keys, and any cached preferences/history (optional separate task).
  - [x] 3.3 Confirm `middleware/subscription.ts` waits for `initialized` and stores `attempted-route` only when needed.
  - [x] 3.4 Verify `middleware/auth.global.ts` initializes once and doesn't interfere with email link verification.
  - [x] 3.5 Guard emulator connections to avoid noisy CORS errors in production.

- [x] 4.0 Persist user preferences (Firestore + IndexedDB) and wire to UI
  - [x] 4.1 Extend `types/auth.ts` `UserProfile` with `preferences`:
        `{ defaultLanguage: 'español' | 'ndowe', darkMode: boolean }`.
  - [x] 4.2 Add `composables/usePreferences.ts` with `getPreferences`, `updatePreferences`, and reactive state.
  - [x] 4.3 Extend `services/indexedDB.ts` to add a `user-preferences` store with get/set helpers.
  - [x] 4.4 In `pages/dictionary.vue`, read `defaultLanguage` on mount and set dictionary language; update preference when user toggles.
  - [x] 4.5 In `pages/account.vue` (or settings), wire toggles to `usePreferences` and persist changes.

- [x] 5.0 Persist search history with sync (Firestore subcollection + IndexedDB)
  - [x] 5.1 Create `services/searchHistory.ts` with APIs: `add(query, language)`, `list()`, `mergeLocalWithRemote(limit=50)`; de‑dupe by `query+language` preferring latest `ts`.
  - [x] 5.2 Extend `services/indexedDB.ts` with a `search-history` store and helpers.
  - [x] 5.3 On sign‑in, call `mergeLocalWithRemote`; on app start, load history from remote if online else local.
  - [x] 5.4 Replace component‑local `recentSearches` in `pages/dictionary.vue` with service‑backed data and add a "Clear history" action.
  - [x] 5.5 Add minimal unit tests for merge/dedupe logic.

- [x] 6.0 Instrument telemetry and success metrics (verify conversion, errors, latency)
  - [x] 6.1 Add `utils/telemetry.ts` with a `track(event, payload)` function (console or no‑op in dev).
  - [x] 6.2 Emit events: `auth.link_sent`, `auth.verify_start`, `auth.verify_success`, `auth.verify_error`, `auth.redirect`, `prefs.updated`, `history.merged`.
  - [x] 6.3 Capture timing from verify page load to authenticated state; log/track to console/dev telemetry.

- [ ] 7.0 Enable/Configure Firebase Auth provider and env rollout (docs + config)
  - [x] 7.1 Update `ENV_SETUP_GUIDE.md` with steps to enable Email Link, add authorized domains, and configure action URL.
  - [x] 7.2 Ensure `nuxt.config.ts` exposes `public.appUrl` and optional `public.devAuthMock` flag.
  - [x] 7.3 Document environment behavior: production uses Email Link; dev can toggle mock fallback if Admin is unavailable.
  - [x] 7.4 Add a quick verification checklist in the guide (send link, cross‑device, invalid link, redirect with return=, preferences saved, history synced).
