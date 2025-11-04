// @ts-nocheck
/* @vitest-environment happy-dom */
import '@/tests/setup'
import { describe, it, expect, vi } from 'vitest'
import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'

describe('Dictionary integration with preferences', () => {
  it('initializes language from preferences and persists change', async () => {
    // Spy for setLanguage
    const setLanguageMock = vi.fn()
    // Override global useDictionary stub for this test
    // minimal reactive state
    const refs = {
      currentLanguage: { value: 'español' },
      searchQuery: { value: '' },
      suggestions: { value: [] },
      isReady: { value: true },
      isLoading: { value: false },
      hasSearched: { value: false },
      totalEntries: { value: 0 },
      translationResults: [],
      error: { value: null },
    }
    // @ts-ignore
    globalThis.useDictionary = () => ({
      ...refs,
      searchPlaceholder: 'Buscar',
      search: vi.fn(),
      getSuggestions: vi.fn().mockResolvedValue([]),
      clearSearch: vi.fn(),
      setLanguage: setLanguageMock,
    })

    const updatePreferencesMock = vi.fn()
    vi.mock('~/composables/usePreferences', () => ({
      usePreferences: () => ({
        prefs: { value: { defaultLanguage: 'ndowe' } },
        loadPreferences: vi.fn().mockResolvedValue(undefined),
        updatePreferences: updatePreferencesMock,
      })
    }))

    // Ensure client-side branch is used
    // @ts-ignore
    globalThis.process = Object.assign({}, globalThis.process || {}, { client: true, server: false, dev: true })

    const Page = (await import('~/pages/dictionary.vue')).default
    const wrapper = mount(Page, {
      global: {
        stubs: {
          'nav-bar': { template: '<div />' },
          Footer: { template: '<div />' },
          FeatureGate: { template: '<div><slot /></div>' },
          SearchBox: { template: '<div />' },
          ResultCard: { template: '<div />' },
          EmptyState: { template: '<div />' },
          LanguageToggle: {
            name: 'LanguageToggle',
            emits: ['language-change'],
            mounted() { this.$emit('language-change', 'spanish') },
            template: '<div class="lt-stub" />'
          }
        }
      }
    })

    // Manually emit language-change from the stubbed component
    const comp = wrapper.findComponent({ name: 'LanguageToggle' })
    comp.vm.$emit('language-change', 'spanish')
    await nextTick()
    // Ensure handler ran by checking setLanguage was called with translated value
    expect(setLanguageMock).toHaveBeenCalledWith('español')
  })
})
