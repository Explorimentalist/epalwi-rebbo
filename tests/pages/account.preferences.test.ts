// @ts-nocheck
/* @vitest-environment happy-dom */
import '@/tests/setup'
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import AccountPage from '~/pages/account.vue'

// Mocks
const updatePreferencesMock = vi.fn()
vi.mock('~/composables/usePreferences', () => {
  const prefs = { value: { defaultLanguage: 'español', notifications: {} } }
  return {
    usePreferences: () => ({ prefs, loadPreferences: vi.fn(), updatePreferences: updatePreferencesMock })
  }
})

vi.stubGlobal('useAuthStore', () => ({ }))
vi.stubGlobal('useSubscriptionStore', () => ({ userSubscription: { value: null } }))
vi.stubGlobal('useAuth', () => ({ isInGracePeriod: { value: false }, graceDaysRemaining: { value: 0 } }))

describe('Account Preferences UI', () => {
  it('updates default language when selection changes', async () => {
    const wrapper = mount(AccountPage)
    const select = wrapper.find('.pref-select')
    await select.setValue('ndowe')
    expect(updatePreferencesMock).toHaveBeenCalledWith({ defaultLanguage: 'ndowe' })
  })
})
