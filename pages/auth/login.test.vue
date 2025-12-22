/**
 * Component Tests for Login Page Modal Resend Functionality
 * Tests the magic link modal UI, resend functionality, and error handling
 */

<script setup lang="ts">
import { describe, test, expect, beforeEach, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import Login from './login.vue'

// Mock the auth store
const mockAuthStore = {
  sendMagicLink: vi.fn(),
  isLoading: false,
  error: null
}

// Mock useAuthStore
vi.mock('~/stores/auth', () => ({
  useAuthStore: () => mockAuthStore
}))

// Mock Nuxt composables
vi.mock('#app', () => ({
  useHead: vi.fn(),
  navigateTo: vi.fn()
}))

// Mock router
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn()
  }),
  useRoute: () => ({
    query: {}
  })
}))

// Mock components
vi.mock('~/components/Input.vue', () => ({
  default: {
    name: 'Input',
    props: ['modelValue', 'type', 'label', 'labelPosition', 'placeholder', 'error', 'required'],
    emits: ['update:modelValue'],
    template: `
      <div class="input-wrapper">
        <label v-if="label">{{ label }}</label>
        <input 
          :type="type" 
          :placeholder="placeholder"
          :value="modelValue"
          @input="$emit('update:modelValue', $event.target.value)"
          data-testid="email-input"
        />
        <span v-if="error" class="error">{{ error }}</span>
      </div>
    `
  }
}))

vi.mock('~/components/Modal.vue', () => ({
  default: {
    name: 'Modal',
    props: ['modelValue', 'title', 'showCloseButton'],
    emits: ['update:modelValue'],
    template: `
      <div v-if="modelValue" class="modal-overlay" data-testid="success-modal">
        <div class="modal-content">
          <h3>{{ title }}</h3>
          <slot />
        </div>
      </div>
    `
  }
}))

vi.mock('~/components/Icon.vue', () => ({
  default: {
    name: 'Icon',
    props: ['name'],
    template: `<span class="icon" :data-icon="name"></span>`
  }
}))

describe('Login Page - Magic Link Modal Resend Functionality', () => {
  let wrapper: any

  beforeEach(() => {
    vi.clearAllMocks()
    mockAuthStore.sendMagicLink.mockResolvedValue({
      success: true,
      message: 'Magic link sent successfully',
      attemptCount: 1,
      maxAttempts: 5
    })
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  test('should render login form with email input', () => {
    wrapper = mount(Login)

    expect(wrapper.find('[data-testid="email-input"]').exists()).toBe(true)
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="success-modal"]').exists()).toBe(false)
  })

  test('should show success modal after successful magic link send', async () => {
    wrapper = mount(Login)

    // Fill email and submit form
    const emailInput = wrapper.find('[data-testid="email-input"]')
    await emailInput.setValue('test@example.com')
    
    const submitButton = wrapper.find('button[type="submit"]')
    await submitButton.trigger('click')
    await nextTick()

    // Check that modal is displayed
    expect(wrapper.find('[data-testid="success-modal"]').exists()).toBe(true)
    expect(mockAuthStore.sendMagicLink).toHaveBeenCalledWith('test@example.com')
  })

  test('should display send count in modal', async () => {
    mockAuthStore.sendMagicLink.mockResolvedValue({
      success: true,
      message: 'Magic link sent successfully',
      attemptCount: 2,
      maxAttempts: 5
    })

    wrapper = mount(Login)

    // Fill email and submit form
    const emailInput = wrapper.find('[data-testid="email-input"]')
    await emailInput.setValue('test@example.com')
    
    await wrapper.find('button[type="submit"]').trigger('click')
    await nextTick()

    // Check send count display
    expect(wrapper.text()).toContain('Email enviado (2/5)')
  })

  test('should show spam reminder in modal', async () => {
    wrapper = mount(Login)

    // Trigger modal display
    const emailInput = wrapper.find('[data-testid="email-input"]')
    await emailInput.setValue('test@example.com')
    await wrapper.find('button[type="submit"]').trigger('click')
    await nextTick()

    // Check spam reminder text
    expect(wrapper.text()).toContain('¿No lo encuentras?')
    expect(wrapper.text()).toContain('Revisa tu carpeta de spam o correo no deseado')
  })

  test('should have resend email button in modal', async () => {
    wrapper = mount(Login)

    // Trigger modal display
    const emailInput = wrapper.find('[data-testid="email-input"]')
    await emailInput.setValue('test@example.com')
    await wrapper.find('button[type="submit"]').trigger('click')
    await nextTick()

    // Check for resend button
    const resendButton = wrapper.find('.ds-btn-secondary')
    expect(resendButton.exists()).toBe(true)
    expect(resendButton.text()).toContain('Reenviar Email')
    expect(resendButton.attributes('disabled')).toBeFalsy()
  })

  test('should call resend functionality when resend button clicked', async () => {
    wrapper = mount(Login)

    // Trigger modal display
    const emailInput = wrapper.find('[data-testid="email-input"]')
    await emailInput.setValue('test@example.com')
    await wrapper.find('button[type="submit"]').trigger('click')
    await nextTick()

    // Click resend button
    const resendButton = wrapper.find('.ds-btn-secondary')
    await resendButton.trigger('click')
    await nextTick()

    // Should call sendMagicLink again with same email
    expect(mockAuthStore.sendMagicLink).toHaveBeenCalledTimes(2)
    expect(mockAuthStore.sendMagicLink).toHaveBeenLastCalledWith('test@example.com')
  })

  test('should show loading state during resend', async () => {
    // Mock a delayed response
    let resolvePromise: any
    mockAuthStore.sendMagicLink.mockImplementation(() => 
      new Promise(resolve => {
        resolvePromise = resolve
      })
    )

    wrapper = mount(Login)

    // Trigger modal display
    const emailInput = wrapper.find('[data-testid="email-input"]')
    await emailInput.setValue('test@example.com')
    await wrapper.find('button[type="submit"]').trigger('click')

    // Resolve first call
    resolvePromise({
      success: true,
      attemptCount: 1,
      maxAttempts: 5
    })
    await nextTick()

    // Click resend button
    const resendButton = wrapper.find('.ds-btn-secondary')
    await resendButton.trigger('click')
    await nextTick()

    // Should show loading state
    expect(resendButton.text()).toContain('Reenviando...')
    expect(resendButton.attributes('disabled')).toBe('')

    // Resolve second call
    resolvePromise({
      success: true,
      attemptCount: 2,
      maxAttempts: 5
    })
    await nextTick()

    // Should return to normal state
    expect(resendButton.text()).toContain('Reenviar Email')
  })

  test('should show success message after successful resend', async () => {
    wrapper = mount(Login)

    // Setup modal
    const emailInput = wrapper.find('[data-testid="email-input"]')
    await emailInput.setValue('test@example.com')
    await wrapper.find('button[type="submit"]').trigger('click')
    await nextTick()

    // Mock successful resend
    mockAuthStore.sendMagicLink.mockResolvedValue({
      success: true,
      attemptCount: 2,
      maxAttempts: 5
    })

    // Click resend
    await wrapper.find('.ds-btn-secondary').trigger('click')
    await nextTick()

    // Check for success message
    expect(wrapper.text()).toContain('Email reenviado correctamente')
    expect(wrapper.find('.success-icon').exists()).toBe(true)
  })

  test('should update send count after resend', async () => {
    wrapper = mount(Login)

    // Setup modal with initial count
    const emailInput = wrapper.find('[data-testid="email-input"]')
    await emailInput.setValue('test@example.com')
    await wrapper.find('button[type="submit"]').trigger('click')
    await nextTick()

    expect(wrapper.text()).toContain('Email enviado (1/5)')

    // Mock resend response with updated count
    mockAuthStore.sendMagicLink.mockResolvedValue({
      success: true,
      attemptCount: 2,
      maxAttempts: 5
    })

    // Click resend
    await wrapper.find('.ds-btn-secondary').trigger('click')
    await nextTick()

    // Check updated count
    expect(wrapper.text()).toContain('Email enviado (2/5)')
  })

  test('should handle rate limit error during resend', async () => {
    wrapper = mount(Login)

    // Setup modal
    const emailInput = wrapper.find('[data-testid="email-input"]')
    await emailInput.setValue('test@example.com')
    await wrapper.find('button[type="submit"]').trigger('click')
    await nextTick()

    // Mock rate limit error
    mockAuthStore.sendMagicLink.mockResolvedValue({
      success: false,
      error: 'Rate limit exceeded. Please wait before trying again.'
    })

    // Click resend
    await wrapper.find('.ds-btn-secondary').trigger('click')
    await nextTick()

    // Check for error message
    expect(wrapper.text()).toContain('Rate limit exceeded. Please wait before trying again.')
    expect(wrapper.find('.error-icon').exists()).toBe(true)
  })

  test('should disable resend button when rate limit reached', async () => {
    mockAuthStore.sendMagicLink.mockResolvedValue({
      success: true,
      attemptCount: 5,
      maxAttempts: 5
    })

    wrapper = mount(Login)

    // Setup modal with max attempts
    const emailInput = wrapper.find('[data-testid="email-input"]')
    await emailInput.setValue('test@example.com')
    await wrapper.find('button[type="submit"]').trigger('click')
    await nextTick()

    // Check that resend button is disabled
    const resendButton = wrapper.find('.ds-btn-secondary')
    expect(resendButton.attributes('disabled')).toBe('')
    expect(resendButton.text()).toContain('Límite alcanzado')
  })

  test('should validate email before allowing submission', async () => {
    wrapper = mount(Login)

    // Try to submit without email
    await wrapper.find('button[type="submit"]').trigger('click')
    await nextTick()

    // Should show validation error and not call API
    expect(wrapper.text()).toContain('El email es requerido')
    expect(mockAuthStore.sendMagicLink).not.toHaveBeenCalled()
    expect(wrapper.find('[data-testid="success-modal"]').exists()).toBe(false)
  })

  test('should validate email format', async () => {
    wrapper = mount(Login)

    // Enter invalid email
    const emailInput = wrapper.find('[data-testid="email-input"]')
    await emailInput.setValue('invalid-email')
    
    await wrapper.find('button[type="submit"]').trigger('click')
    await nextTick()

    // Should show format error
    expect(wrapper.text()).toContain('El email no es válido')
    expect(mockAuthStore.sendMagicLink).not.toHaveBeenCalled()
  })

  test('should close modal and navigate when "Entendido" clicked', async () => {
    const mockNavigateTo = vi.fn()
    vi.mocked(require('#app').navigateTo).mockImplementation(mockNavigateTo)

    wrapper = mount(Login)

    // Setup modal
    const emailInput = wrapper.find('[data-testid="email-input"]')
    await emailInput.setValue('test@example.com')
    await wrapper.find('button[type="submit"]').trigger('click')
    await nextTick()

    // Click "Entendido" button
    const closeButton = wrapper.find('.success-button')
    expect(closeButton.exists()).toBe(true)
    await closeButton.trigger('click')
    await nextTick()

    // Should close modal and navigate
    expect(wrapper.find('[data-testid="success-modal"]').exists()).toBe(false)
    expect(mockNavigateTo).toHaveBeenCalledWith('/')
  })

  test('should hide resend success message after timeout', async () => {
    vi.useFakeTimers()
    
    wrapper = mount(Login)

    // Setup modal and resend
    const emailInput = wrapper.find('[data-testid="email-input"]')
    await emailInput.setValue('test@example.com')
    await wrapper.find('button[type="submit"]').trigger('click')
    await nextTick()

    await wrapper.find('.ds-btn-secondary').trigger('click')
    await nextTick()

    // Should show success message
    expect(wrapper.text()).toContain('Email reenviado correctamente')

    // Fast-forward time
    vi.advanceTimersByTime(3000)
    await nextTick()

    // Success message should be hidden
    expect(wrapper.text()).not.toContain('Email reenviado correctamente')

    vi.useRealTimers()
  })

  test('should hide rate limit error after timeout', async () => {
    vi.useFakeTimers()
    
    wrapper = mount(Login)

    // Setup modal
    const emailInput = wrapper.find('[data-testid="email-input"]')
    await emailInput.setValue('test@example.com')
    await wrapper.find('button[type="submit"]').trigger('click')
    await nextTick()

    // Mock error
    mockAuthStore.sendMagicLink.mockResolvedValue({
      success: false,
      error: 'Rate limit exceeded'
    })

    await wrapper.find('.ds-btn-secondary').trigger('click')
    await nextTick()

    // Should show error
    expect(wrapper.text()).toContain('Rate limit exceeded')

    // Fast-forward time
    vi.advanceTimersByTime(5000)
    await nextTick()

    // Error should be hidden
    expect(wrapper.text()).not.toContain('Rate limit exceeded')

    vi.useRealTimers()
  })
})
</script>

<template>
  <div>
    <!-- This template is required for .vue test files but the actual testing happens in the script setup -->
    <p>Component tests for login page modal resend functionality</p>
  </div>
</template>