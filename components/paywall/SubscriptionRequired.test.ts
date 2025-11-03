// @ts-nocheck
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import Component from './SubscriptionRequired.vue'

vi.stubGlobal('Icon', { template: '<i />' })

describe('SubscriptionRequired.vue', () => {
  it('renders default title and CTA', () => {
    const wrapper = mount(Component, {
      props: { feature: 'Diccionario' },
      global: { stubs: { Icon: { template: '<i />' } } }
    })
    expect(wrapper.text()).toContain('Suscripción requerida')
    expect(wrapper.text()).toContain('Suscribirse ahora')
  })
})
/* @vitest-environment happy-dom */
import '@/tests/setup'
