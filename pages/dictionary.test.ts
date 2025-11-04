// @ts-nocheck
import { describe, it, expect, vi } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import Page from './dictionary.vue'

// Stub heavy child components
const stub = { template: '<div />' }

describe('pages/dictionary', () => {
  it('mounts with FeatureGate present and does not crash', () => {
    const wrapper = shallowMount(Page, {
      global: {
        stubs: {
          FeatureGate: { template: '<div><slot /><slot name="fallback" /></div>' },
          SubscriptionRequired: { template: '<div />' },
          SearchBox: stub,
          ResultCard: stub,
          EmptyState: stub,
          LanguageToggle: stub,
          'nav-bar': stub,
          Footer: stub,
          Icon: stub
        }
      }
    })
    expect(wrapper.exists()).toBe(true)
  })
})
/* @vitest-environment happy-dom */
import '@/tests/setup'
