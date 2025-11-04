// @ts-nocheck
/* @vitest-environment happy-dom */
import '@/tests/setup'
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import AccountPage from '~/pages/account.vue'

// Deferred helper
const deferred = () => {
  let res, rej
  const p = new Promise((r, j) => { res = r; rej = j })
  // @ts-ignore
  p.resolve = res; p.reject = rej
  return p
}

// Shared mutable mocks
const state = {
  prefs: { value: { defaultLanguage: 'español', notifications: { productUpdates: false, languageTips: false } } },
  errorRef: { value: null },
  updatePreferencesMock: vi.fn()
}

vi.mock('~/composables/usePreferences', () => ({
  usePreferences: () => ({ prefs: state.prefs, error: state.errorRef, loadPreferences: vi.fn(), updatePreferences: state.updatePreferencesMock })
}))

describe('Account Preferences - Saving state and error', () => {
  it('disables controls while saving and shows error text on failure', async () => {
    const d = deferred()
    state.updatePreferencesMock = vi.fn(() => d)
    state.prefs.value = { defaultLanguage: 'español', notifications: { productUpdates: false, languageTips: false } }
    state.errorRef.value = null

    const wrapper = mount((await import('~/pages/account.vue')).default)
    const select = wrapper.find('.pref-select')
    // Trigger change -> saving true
    await select.setValue('ndowe')
    expect(state.updatePreferencesMock).toHaveBeenCalled()
    expect((select.element as HTMLSelectElement).disabled).toBe(true)

    // Simulate error state (without throwing)
    state.errorRef.value = 'Fallo de red'
    // Resolve the pending update to end saving state
    // @ts-ignore
    d.resolve()
    await Promise.resolve()
    await Promise.resolve()
    expect(wrapper.find('.pref-error').exists()).toBe(true)
  })
})
