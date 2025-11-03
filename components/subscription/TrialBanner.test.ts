// @ts-nocheck
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import Component from './TrialBanner.vue'

vi.stubGlobal('Icon', { template: '<i />' })

describe('TrialBanner.vue', () => {
  it('shows remaining days', () => {
    const wrapper = mount(Component, { props: { daysRemaining: 5, dismissible: false }, global: { stubs: { Icon: { template: '<i />' } } } })
    expect(wrapper.text()).toContain('Prueba gratuita: 5 días restantes')
  })
})
/* @vitest-environment happy-dom */
import '@/tests/setup'
