# PRD: User Preferences (Default Language + Notifications)

## 1) Overview
Implement user preferences for epàlwi‑rèbbo with a focus on:
- Default Dictionary Language: initialize the dictionary language on first load per user preference.
- Email Notifications: user‑controlled email notification toggles.

No themes: Dark mode and theming options are intentionally out of scope per direction. Preferences live on the Account/Settings page, are persisted to Firestore when signed in, cached in IndexedDB for offline/guest use, and synced using last‑write‑wins. Offline updates are queued and applied when back online.

## 2) Goals
- Persist default language and notification preferences across sessions and devices.
- Initialize dictionary language from preference on first load (not enforced every render).
- Provide a single, clear place to manage preferences (Account page).
- Work offline and migrate guest preferences on sign‑in.

## 3) User Stories
- As a user, I set my default dictionary language so the app starts in my preferred direction.
- As a user, I can enable/disable email notifications.
- As a guest, my preference changes persist locally; when I sign in later, they are synced to my account.
- As a user with intermittent connectivity, changes I make offline are applied once I’m back online.

## 4) Functional Requirements
1. Data Model (Firestore)
   - Add `users/{uid}.preferences` with:
     - `defaultLanguage`: `'español' | 'ndowe'` (default `'español'`).
     - `notifications`: object of boolean toggles (see UI below), default false.
   - Add `users/{uid}.preferencesUpdatedAt`: server timestamp for last‑write‑wins.

2. Loading and Sync
   - On app start or when Account page opens: load preferences from IndexedDB cache, then Firestore if signed in, and cache the result.
   - On sign‑in: merge guest cache with remote using last‑write‑wins via `preferencesUpdatedAt`.

3. Updating
   - Updating a preference writes locally immediately (optimistic) and enqueues a Firestore update (if signed in). If offline, the queued write retries until success.
   - Each successful Firestore write updates `preferencesUpdatedAt`.

4. Default Language Behavior
   - Dictionary page reads preference once on mount and sets initial language only.
   - Manual user changes on the dictionary page update the preference (so next session starts with that language).

5. Notifications UI
   - Preferences live only in the Account/Settings page (`pages/account.vue`).
   - Provide at least these toggles under “Notificaciones por email”:
     - `productUpdates` (Novedades del producto)
     - `languageTips` (Consejos del idioma / contenido editorial)
   - Defaults: off.

6. Guest Behavior
   - For guests, store preferences in IndexedDB under key `guest` and use the same interface.
   - On sign‑in, migrate guest preferences to the user document using last‑write‑wins.

7. Telemetry
   - Track preference changes and migration events (no PII).

## 5) Non‑Goals (Out of Scope)
- Theme/dark mode controls or any theming mechanism.
- Additional preference categories beyond default language and notifications.
- Building notification email delivery or subscription backend flows (UI toggles only; storage only).

## 6) Design Considerations
- Reuse existing components: `Input`, toggles, labels from the design system.
- Location: Account/Settings area in `pages/account.vue`.
- Keep copy concise; Spanish labels for toggles.

## 7) Technical Considerations
- Storage & Cache
  - Firestore: `users/{uid}.preferences` and `users/{uid}.preferencesUpdatedAt`.
  - IndexedDB: `user-preferences` per UID; `guest` for unsigned.
- Merge and Conflict
  - Use last‑write‑wins by comparing `preferencesUpdatedAt` timestamps.
- Offline
  - Queue writes when offline; retry periodically or on connectivity change.
- Security
  - Future Rules: Only authenticated user can read/write their own `users/{uid}.preferences` (to be handled in a separate rules task).
- Code Touchpoints
  - `composables/usePreferences.ts`: centralize load/update/merge; add queued writes and timestamp handling.
  - `pages/account.vue`: UI for reading/writing preferences.
  - `pages/dictionary.vue`: read preference once on mount to initialize language; update on change.
  - `services/indexedDB.ts`: ensure get/set for preferences and guest key.

## 8) Success Metrics
- Preferences read/write success rate ≥ 99% (local + remote writes).
- Time to apply preference on load ≤ 300ms from app start (from cache).
- Migration success on sign‑in ≥ 95% with correct last‑write‑wins behavior.

## 9) Acceptance Tests (to implement)
- Unit
  - usePreferences: loads from cache, then merges Firestore; update writes to Firestore and cache; timestamp respected.
  - Migration: when a guest with newer `preferencesUpdatedAt` signs in, remote is updated.
- Integration
  - Dictionary page sets initial language from preference and persists user change.
  - Account page toggles update preference and are reflected on reload.
- E2E (optional later)
  - Offline toggle change queues and syncs when network restores.

## 10) Open Questions
- Confirm the exact list of notification toggles (proposed: `productUpdates`, `languageTips`).
- Confirm copy text for the Account page labels and any help text.

---

Notes:
- This PRD explicitly excludes themes/dark mode.
- Implementation should reuse existing composable and caching patterns already present in the codebase.
