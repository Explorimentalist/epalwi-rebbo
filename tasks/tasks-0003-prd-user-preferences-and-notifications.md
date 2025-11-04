## Relevant Files

- `types/auth.ts` - Preferences typing (notifications, preferencesUpdatedAt).
- `composables/usePreferences.ts` - Load/merge (LWW), optimistic updates with queue, guest migration, telemetry.
- `services/indexedDB.ts` - Preferences cache `{ data, updatedAt }` per uid and `guest`.
- `pages/account.vue` - Preferences section (V2) with default language + email notifications, saving/error UI.
- `pages/dictionary.vue` - Reads prefs on mount (initial language) and persists toggle changes.
- `utils/telemetry.ts` - Lightweight telemetry hook used by preferences.
- `tests/composables/preferences.spec.ts` - Unit tests for load/merge, optimistic update/queue, guest migration, telemetry.
- `tests/pages/account.preferences.test.ts` - Default language control calls updatePreferences.
- `tests/pages/account.notifications.test.ts` - Notifications toggles call updatePreferences.
- `tests/pages/account.preferences-saving.test.ts` - Saving state disables controls; error message shown.
- `tests/pages/dictionary.prefs.test.ts` - Integration: dictionary reacts to language-change and uses setLanguage.

### Notes

- Unit tests should typically be placed alongside or under `tests/` as in the repo; use Vitest (`npm run test`).
- No theming/dark mode work is in scope; only default language and notifications.

## Tasks

- [x] 1.0 Update data model for preferences
- [x] 1.1 Extend `UserPreferences` in `types/auth.ts` to include `notifications?: { productUpdates?: boolean; languageTips?: boolean }` and add optional `preferencesUpdatedAt?: Date` to `UserProfile` (typing only).
  - [x] 1.2 Ensure server upsert (post‑sign‑in) initializes defaults: `{ defaultLanguage: 'español', notifications: { productUpdates: false, languageTips: false } }` and writes `preferencesUpdatedAt` (serverTimestamp).
  - [x] 1.3 Add light docs in `ENV_SETUP_GUIDE.md` noting preferences keys and migration behavior (guest → user on sign‑in).

- [x] 2.0 Enhance usePreferences for load/merge/update with timestamp
  - [x] 2.1 Load: read from IndexedDB cache first; if signed in, fetch Firestore and merge via last‑write‑wins (compare `preferencesUpdatedAt`). Cache the merged result.
  - [x] 2.2 Update: optimistic local update; enqueue Firestore write (if signed in) and update `preferencesUpdatedAt` to now; on success, persist cache; on failure, retry with backoff until online.
  - [x] 2.3 Guest migration: on sign‑in (authStore.user change), merge `guest` cache into user doc using last‑write‑wins; clear `guest` cache after success.
  - [x] 2.4 API surface: `prefs`, `loadPreferences()`, `updatePreferences(partial)`, `isLoading`, `error` remain; add optional `migrateGuestPreferences()` for explicit calls in tests.
  - [x] 2.5 Telemetry: emit `prefs.load`, `prefs.update`, `prefs.migrate` with minimal payload (no PII).

- [x] 3.0 Add Account page UI for notifications and default language (V2 styles)
  - [x] 3.1 In `pages/account.vue`, add a "Preferencias" section using Design System V2 styles (ds‑ classes) consistent with existing V2 patterns: section title, description, spacing.
  - [x] 3.2 Default Language control: a DS V2 select or segmented control with options "Español" and "Ndowe"; binds to `prefs.defaultLanguage`; on change, call `updatePreferences({ defaultLanguage })`.
  - [x] 3.3 Notifications group: DS V2 switches for `productUpdates` and `languageTips`; labels in Spanish; bind checked state to `prefs.notifications.*`; on change, call `updatePreferences({ notifications: { ...prefs.notifications, <key>: value } })`.
  - [x] 3.4 States: show a subtle saving state (disabled controls) and error text using DS V2 tokens; keep UI responsive (optimistic) while background write proceeds.
  - [x] 3.5 Copy: concise Spanish labels and helper text (per PRD). Place within existing account settings layout without breaking responsiveness.
  - [x] 3.6 Tests (see 7.x): mount Account page, toggle controls, assert `usePreferences.updatePreferences` calls and persistence after reload.

- [ ] 4.0 Integrate preferences with dictionary initial language + persistence
  - [x] 4.1 On dictionary page mount, call `loadPreferences()` and set initial language once from `prefs.defaultLanguage` if present.
  - [x] 4.2 When user changes language via the `LanguageToggle`, persist back to preferences so next session honors it.
  - [x] 4.3 Add an integration test that stubs `usePreferences` and `useDictionary` and asserts the page handles a language-change event by calling setLanguage (and exercises the preferences hook in the mounting flow).

- [x] 5.0 Extend IndexedDB for guest + timestamped preferences
  - [x] 5.1 Store preferences keyed by UID and by `'guest'`; structure: `{ data: UserPreferences, updatedAt: number }` or store `preferencesUpdatedAt` alongside.
  - [x] 5.2 Expose `getUserPreferences(uid)` and `setUserPreferences(uid, prefs, updatedAt)` so callers can manage timestamps; keep backward compatibility with current methods.
  - [x] 5.3 Add a simple migration path in code to populate `updatedAt` if missing.

- [x] 6.0 Add telemetry hooks for preference changes/migration
  - [x] 6.1 Create `utils/telemetry.ts` with `track(event: string, payload?: Record<string, any>)` (no‑op in test/dev by default).
  - [x] 6.2 Wire calls in `usePreferences` for load/update/migrate; optionally expose a `lastEvent` for tests via injection or export.

- [x] 7.0 Tests: unit + integration per PRD acceptance criteria
  - [x] 7.1 Unit (usePreferences):
    - [x] 7.1.1 Loads from cache then merges Firestore via last‑write‑wins (newer `preferencesUpdatedAt` wins).
    - [x] 7.1.2 Optimistic updates enqueue Firestore write and update cache; retries when offline.
    - [x] 7.1.3 Guest migration updates remote when guest timestamp is newer; clears guest cache.
  - [x] 7.2 Integration (Dictionary): initializes language from preferences; changing language persists preference.
  - [x] 7.3 Integration (Account): toggling notifications and default language updates preferences and survives reload (cache + remote stubs).
  - [x] 7.4 Telemetry: verify `track` called with expected events.
