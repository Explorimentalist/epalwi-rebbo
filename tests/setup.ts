// Global test setup for component/page tests
import { vi } from 'vitest'

// Stub Nuxt navigate and route helpers
vi.stubGlobal('navigateTo', vi.fn())
vi.stubGlobal('useRoute', () => ({ fullPath: '/', path: '/' }))

// Stub design system dependent global Icon component
// When mounting components, we can register a dumb Icon
vi.stubGlobal('Icon', {})

// Provide minimal useAuth defaults for components that call it
vi.stubGlobal('useAuth', () => ({
  isInGracePeriod: { value: false },
  graceDaysRemaining: { value: 0 },
  canAccessFeatures: { value: true },
  redirectToSubscription: vi.fn(),
  redirectToLogin: vi.fn()
}))

// Provide minimal useAuthStore for FeatureGate readiness
vi.stubGlobal('useAuthStore', () => ({ initialized: { value: true } }))
vi.stubGlobal('useSubscriptionStore', () => ({ trialDaysRemaining: { value: 0 }, userSubscription: { value: null }, getCustomerPortalUrl: vi.fn() }))

// Nuxt definePageMeta stub
vi.stubGlobal('definePageMeta', () => undefined)
vi.stubGlobal('useHead', () => undefined)

// Minimal runtime config for tests
vi.stubGlobal('useRuntimeConfig', () => ({ public: { appUrl: 'http://localhost:3000', devAuthMock: true } }))

// Design system stub
vi.stubGlobal('useDesignSystem', () => ({
  createComponentClasses: () => 'trial-banner'
}))

// Stub useDictionary composable used in pages/dictionary
vi.stubGlobal('useDictionary', () => ({
  isReady: { value: true },
  isLoading: { value: false },
  error: { value: null },
  currentLanguage: { value: 'español' },
  searchQuery: { value: '' },
  searchResults: { value: [] },
  suggestions: { value: [] },
  hasSearched: { value: false },
  totalEntries: { value: 0 },
  translationResults: [],
  searchPlaceholder: 'Buscar palabra en español...',
  search: vi.fn(),
  getSuggestions: vi.fn(),
  clearSearch: vi.fn(),
  setLanguage: vi.fn(),
  initialize: vi.fn()
}))
