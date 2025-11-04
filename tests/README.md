Test scaffolding for Trial Expiration Enforcement

Status
- No test runner configured yet. These files define acceptance criteria and skipped unit tests for a test-first workflow.

Recommended stack
- Vitest for unit/integration tests
- @vue/test-utils for component tests
- @nuxt/test-utils for Nuxt pages/middleware
- h3 + unjs test helpers for server route handlers

Install (upon approval)
1) npm i -D vitest @vitest/ui @vue/test-utils @nuxt/test-utils happy-dom @testing-library/vue
2) Add "test" script: "vitest --run" and optional UI script
3) Configure `vitest.config.ts` with `environment: 'happy-dom'`
4) Add Nuxt test utils setup if doing page-level tests

Structure
- Colocated unit tests (e.g., server/utils/auth.test.ts)
- Component tests under component dirs (e.g., components/paywall/*.test.ts)
- Acceptance specs under tests/specs/ with detailed scenarios

Execution
- Until tooling is set up, these tests serve as formalized acceptance criteria.
