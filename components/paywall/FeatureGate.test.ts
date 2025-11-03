// @ts-nocheck
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import Component from './FeatureGate.vue'

vi.stubGlobal('Icon', { template: '<i />' })

describe('FeatureGate.vue', () => {
  it('renders slot when access is allowed', () => {
    vi.stubGlobal('useAuth', () => ({ canAccessFeatures: { value: true }, isInGracePeriod: { value: false } }))
    vi.stubGlobal('useAuthStore', () => ({ initialized: { value: true } }))
    const wrapper = mount(Component, { 
      slots: { default: '<div class="ok">ok</div>' },
      global: { stubs: { Icon: { template: '<i />' }, SubscriptionRequired: { template: '<div />' } } }
    })
    expect(wrapper.find('.ok').exists()).toBe(true)
  })

  it('renders fallback when denied', () => {
    vi.stubGlobal('useAuth', () => ({ canAccessFeatures: { value: false }, isInGracePeriod: { value: false } }))
    vi.stubGlobal('useAuthStore', () => ({ initialized: { value: true } }))
    const wrapper = mount(Component, { 
      slots: { fallback: '<div class="deny">deny</div>' },
      global: { stubs: { Icon: { template: '<i />' }, SubscriptionRequired: { template: '<div />' } } }
    })
    expect(wrapper.find('.deny').exists()).toBe(true)
  })
})
/* @vitest-environment happy-dom */
import '@/tests/setup'
