// @ts-nocheck
/* @vitest-environment happy-dom */
import '@/tests/setup'
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import AccountPage from '~/pages/account.vue'

// Mocks
const updatePreferencesMock = vi.fn()
const prefs = { value: { defaultLanguage: 'español', notifications: { productUpdates: false, languageTips: false } } }
vi.mock('~/composables/usePreferences', () => ({
  usePreferences: () => ({ prefs, loadPreferences: vi.fn(), updatePreferences: updatePreferencesMock })
}))

vi.stubGlobal('useAuthStore', () => ({ }))
vi.stubGlobal('useSubscriptionStore', () => ({ userSubscription: { value: null } }))
vi.stubGlobal('useAuth', () => ({ isInGracePeriod: { value: false }, graceDaysRemaining: { value: 0 } }))

describe('Account Preferences - Notifications', () => {
  it('updates product updates toggle', async () => {
    const wrapper = mount(AccountPage)
    const cb = wrapper.find('.notif-product')
    await cb.setValue(true)
    expect(updatePreferencesMock).toHaveBeenCalledWith({ notifications: { productUpdates: true, languageTips: false } })
  })

  it('updates language tips toggle', async () => {
    const wrapper = mount(AccountPage)
    const cb = wrapper.find('.notif-tips')
    await cb.setValue(true)
    // Since productUpdates may still be false in prefs, the merged object should include languageTips true
    expect(updatePreferencesMock).toHaveBeenCalledWith({ notifications: expect.objectContaining({ languageTips: true }) })
  })
})

