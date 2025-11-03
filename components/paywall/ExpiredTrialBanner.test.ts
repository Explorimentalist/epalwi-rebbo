// @ts-nocheck
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import Component from './ExpiredTrialBanner.vue'

vi.stubGlobal('Icon', { template: '<i />' })

describe('ExpiredTrialBanner.vue', () => {
  it('shows message for days since expiration', () => {
    const wrapper = mount(Component, { props: { daysSinceExpiration: 2 }, global: { stubs: { Icon: { template: '<i />' } } } })
    expect(wrapper.text()).toContain('hace 2 días')
  })
})
/* @vitest-environment happy-dom */
import '@/tests/setup'
