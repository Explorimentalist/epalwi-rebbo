// @ts-nocheck
/* @vitest-environment happy-dom */
import '@/tests/setup'
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'

const flushPendingMock = vi.fn()
const loadHistoryMock = vi.fn()

vi.mock('~/composables/usePreferences', () => ({
  usePreferences: () => ({ prefs: { value: {} }, error: { value: null }, pendingCount: { value: 3 }, loadPreferences: vi.fn(), updatePreferences: vi.fn(), flushPending: flushPendingMock })
}))

vi.mock('~/services/searchHistory', () => ({
  useSearchHistory: () => ({ load: loadHistoryMock })
}))

vi.stubGlobal('useAuthStore', () => ({}))
vi.stubGlobal('useSubscriptionStore', () => ({ userSubscription: { value: null } }))
vi.stubGlobal('useAuth', () => ({ isInGracePeriod: { value: false }, graceDaysRemaining: { value: 0 } }))

describe('Account Sync Now', () => {
  it('calls flushPending and load on click', async () => {
    const Page = (await import('~/pages/account.vue')).default
    const wrapper = mount(Page)
    const btn = wrapper.find('.sync-button')
    await btn.trigger('click')
    // Allow any promises to resolve
    await Promise.resolve(); await Promise.resolve()
    expect(flushPendingMock).toHaveBeenCalled()
    expect(loadHistoryMock).toHaveBeenCalled()
    // Badge should reflect pending count
    expect(wrapper.find('.pending-badge').text()).toBe('3')
    // Toast should become visible
    expect(wrapper.find('.sync-toast').exists()).toBeTruthy()
  })
})
