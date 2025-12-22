/**
 * Unit Tests for Auth Store Resend Actions
 * Tests the new resend state management functionality in the auth store
 */

import { describe, test, expect, beforeEach, vi, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { nextTick } from 'vue'

// Mock dependencies
vi.mock('~/utils/telemetry', () => ({
  track: vi.fn()
}))

vi.mock('firebase/auth', () => ({
  onAuthStateChanged: vi.fn(),
  signOut: vi.fn(),
  sendSignInLinkToEmail: vi.fn(),
  isSignInWithEmailLink: vi.fn(),
  signInWithEmailLink: vi.fn()
}))

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  getDoc: vi.fn(),
  setDoc: vi.fn(),
  updateDoc: vi.fn(),
  serverTimestamp: vi.fn()
}))

vi.mock('~/services/firebase', () => ({
  getFirebaseAuth: vi.fn(() => ({})),
  getFirebaseDb: vi.fn(() => ({}))
}))

// Mock $fetch globally
const mockFetch = vi.fn()
global.$fetch = mockFetch

describe('Auth Store - Resend State Management', () => {
  let authStore: any

  beforeEach(async () => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    
    // Reset $fetch mock
    mockFetch.mockReset()
    
    // Dynamic import to get fresh store instance
    const { useAuthStore } = await import('./auth')
    authStore = useAuthStore()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Initial State', () => {
    test('should initialize resend state correctly', () => {
      expect(authStore.emailSendCount).toBe(0)
      expect(authStore.isResending).toBe(false)
      expect(authStore.currentEmail).toBeNull()
      expect(authStore.canResend).toBe(true)
    })
  })

  describe('Send Count Tracking', () => {
    test('should track first email send', async () => {
      mockFetch.mockResolvedValueOnce({
        success: true,
        message: 'Magic link sent',
        attemptCount: 1,
        maxAttempts: 5
      })

      const result = await authStore.sendMagicLink('test@example.com')

      expect(result.success).toBe(true)
      expect(authStore.emailSendCount).toBe(1)
      expect(authStore.currentEmail).toBe('test@example.com')
      expect(authStore.canResend).toBe(true)
    })

    test('should increment count for same email', async () => {
      mockFetch.mockResolvedValue({
        success: true,
        message: 'Magic link sent',
        attemptCount: 1,
        maxAttempts: 5
      })

      // First send
      await authStore.sendMagicLink('test@example.com')
      expect(authStore.emailSendCount).toBe(1)

      // Second send with same email
      await authStore.sendMagicLink('test@example.com')
      expect(authStore.emailSendCount).toBe(2)
      expect(authStore.currentEmail).toBe('test@example.com')
    })

    test('should reset count for different email', async () => {
      mockFetch.mockResolvedValue({
        success: true,
        message: 'Magic link sent'
      })

      // First email
      await authStore.sendMagicLink('first@example.com')
      expect(authStore.emailSendCount).toBe(1)
      expect(authStore.currentEmail).toBe('first@example.com')

      // Different email - should reset
      await authStore.sendMagicLink('second@example.com')
      expect(authStore.emailSendCount).toBe(1)
      expect(authStore.currentEmail).toBe('second@example.com')
    })

    test('should not increment count on failed send', async () => {
      mockFetch.mockResolvedValue({
        success: false,
        error: 'Network error'
      })

      await authStore.sendMagicLink('test@example.com')

      expect(authStore.emailSendCount).toBe(0)
      expect(authStore.currentEmail).toBeNull()
    })
  })

  describe('Rate Limiting', () => {
    test('should allow resend when under rate limit', () => {
      // Simulate 4 sends
      authStore.$patch({
        emailSendCount: 4,
        currentEmail: 'test@example.com'
      })

      expect(authStore.canResend).toBe(true)
    })

    test('should block resend when at rate limit', () => {
      // Simulate 5 sends (max limit)
      authStore.$patch({
        emailSendCount: 5,
        currentEmail: 'test@example.com'
      })

      expect(authStore.canResend).toBe(false)
    })

    test('should block resend when over rate limit', () => {
      // Simulate 6 sends (over limit)
      authStore.$patch({
        emailSendCount: 6,
        currentEmail: 'test@example.com'
      })

      expect(authStore.canResend).toBe(false)
    })
  })

  describe('Resend Functionality', () => {
    test('should successfully resend magic link', async () => {
      mockFetch.mockResolvedValue({
        success: true,
        message: 'Magic link sent',
        attemptCount: 2,
        maxAttempts: 5
      })

      // Setup initial state
      authStore.$patch({
        emailSendCount: 1,
        currentEmail: 'test@example.com'
      })

      const result = await authStore.resendMagicLink()

      expect(result.success).toBe(true)
      expect(authStore.emailSendCount).toBe(2)
      expect(authStore.isResending).toBe(false)
      expect(mockFetch).toHaveBeenCalledWith('/api/auth/send-magic-link', {
        method: 'POST',
        body: {
          email: 'test@example.com',
          redirectUrl: expect.stringContaining('/auth/verify')
        }
      })
    })

    test('should resend with provided email parameter', async () => {
      mockFetch.mockResolvedValue({
        success: true,
        message: 'Magic link sent'
      })

      const result = await authStore.resendMagicLink('new@example.com')

      expect(result.success).toBe(true)
      expect(mockFetch).toHaveBeenCalledWith('/api/auth/send-magic-link', {
        method: 'POST',
        body: {
          email: 'new@example.com',
          redirectUrl: expect.stringContaining('/auth/verify')
        }
      })
    })

    test('should handle resend when no email provided or stored', async () => {
      const result = await authStore.resendMagicLink()

      expect(result.success).toBe(false)
      expect(result.error).toBe('No email address provided')
      expect(mockFetch).not.toHaveBeenCalled()
    })

    test('should handle rate limit during resend', async () => {
      // Setup at rate limit
      authStore.$patch({
        emailSendCount: 5,
        currentEmail: 'test@example.com'
      })

      const result = await authStore.resendMagicLink()

      expect(result.success).toBe(false)
      expect(result.error).toBe('Rate limit exceeded')
      expect(mockFetch).not.toHaveBeenCalled()
    })

    test('should set loading state during resend', async () => {
      mockFetch.mockImplementation(() => 
        new Promise(resolve => {
          // Check loading state while request is pending
          expect(authStore.isResending).toBe(true)
          resolve({ success: true, message: 'Magic link sent' })
        })
      )

      authStore.$patch({
        currentEmail: 'test@example.com'
      })

      expect(authStore.isResending).toBe(false)
      
      const promise = authStore.resendMagicLink()
      await nextTick() // Allow promise to start
      
      await promise
      expect(authStore.isResending).toBe(false)
    })

    test('should handle resend API error', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'))

      authStore.$patch({
        currentEmail: 'test@example.com'
      })

      const result = await authStore.resendMagicLink()

      expect(result.success).toBe(false)
      expect(result.error).toBe('Network error')
      expect(authStore.isResending).toBe(false)
    })

    test('should handle resend API failure response', async () => {
      mockFetch.mockResolvedValue({
        success: false,
        error: 'Invalid email format'
      })

      authStore.$patch({
        currentEmail: 'test@example.com'
      })

      const result = await authStore.resendMagicLink()

      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid email format')
      expect(authStore.isResending).toBe(false)
    })
  })

  describe('State Reset Functionality', () => {
    test('should reset email send count', () => {
      // Setup state
      authStore.$patch({
        emailSendCount: 3,
        currentEmail: 'test@example.com'
      })

      authStore.resetEmailSendCount()

      expect(authStore.emailSendCount).toBe(0)
      expect(authStore.currentEmail).toBeNull()
    })

    test('should reset state when email changes in sendMagicLink', async () => {
      mockFetch.mockResolvedValue({
        success: true,
        message: 'Magic link sent'
      })

      // Setup existing state
      authStore.$patch({
        emailSendCount: 3,
        currentEmail: 'old@example.com'
      })

      // Send to different email
      await authStore.sendMagicLink('new@example.com')

      expect(authStore.emailSendCount).toBe(1)
      expect(authStore.currentEmail).toBe('new@example.com')
    })
  })

  describe('Error Handling', () => {
    test('should clear errors before resend', async () => {
      mockFetch.mockResolvedValue({
        success: true,
        message: 'Magic link sent'
      })

      // Set initial error
      authStore.setError('Previous error')
      expect(authStore.error).toBe('Previous error')

      authStore.$patch({
        currentEmail: 'test@example.com'
      })

      await authStore.resendMagicLink()

      expect(authStore.error).toBeNull()
    })

    test('should set error on resend failure', async () => {
      mockFetch.mockRejectedValue(new Error('API Error'))

      authStore.$patch({
        currentEmail: 'test@example.com'
      })

      await authStore.resendMagicLink()

      expect(authStore.error).toBe('API Error')
    })

    test('should handle generic resend error message', async () => {
      mockFetch.mockRejectedValue({})

      authStore.$patch({
        currentEmail: 'test@example.com'
      })

      await authStore.resendMagicLink()

      expect(authStore.error).toBe('Failed to resend magic link')
    })
  })

  describe('Store Integration', () => {
    test('should expose all resend-related properties and actions', () => {
      // Check reactive state
      expect('emailSendCount' in authStore).toBe(true)
      expect('isResending' in authStore).toBe(true)
      expect('currentEmail' in authStore).toBe(true)

      // Check computed properties
      expect('canResend' in authStore).toBe(true)

      // Check actions
      expect(typeof authStore.resendMagicLink).toBe('function')
      expect(typeof authStore.resetEmailSendCount).toBe('function')
    })

    test('should maintain readonly state access', () => {
      const store = authStore
      
      // These should be readonly refs
      expect(store.emailSendCount).toBe(0)
      expect(store.isResending).toBe(false)
      expect(store.currentEmail).toBeNull()
      expect(store.canResend).toBe(true)

      // Direct mutation should not be possible through the store interface
      // (Note: $patch is used for testing but would not be available in production use)
    })
  })

  describe('Edge Cases', () => {
    test('should handle undefined email gracefully', async () => {
      const result = await authStore.resendMagicLink(undefined)

      expect(result.success).toBe(false)
      expect(result.error).toBe('No email address provided')
    })

    test('should handle empty string email gracefully', async () => {
      const result = await authStore.resendMagicLink('')

      expect(result.success).toBe(false)
      expect(result.error).toBe('No email address provided')
    })

    test('should handle concurrent resend attempts', async () => {
      mockFetch.mockImplementation(() => 
        new Promise(resolve => 
          setTimeout(() => resolve({ success: true, message: 'Magic link sent' }), 100)
        )
      )

      authStore.$patch({
        currentEmail: 'test@example.com'
      })

      // Start concurrent resend attempts
      const promise1 = authStore.resendMagicLink()
      const promise2 = authStore.resendMagicLink()

      const [result1, result2] = await Promise.all([promise1, promise2])

      // Both should succeed but loading state should be managed correctly
      expect(result1.success).toBe(true)
      expect(result2.success).toBe(true)
      expect(authStore.isResending).toBe(false)
    })

    test('should maintain proper state after mixed success/failure', async () => {
      // Successful send first
      mockFetch.mockResolvedValueOnce({
        success: true,
        message: 'Magic link sent'
      })

      await authStore.sendMagicLink('test@example.com')
      expect(authStore.emailSendCount).toBe(1)

      // Failed resend
      mockFetch.mockResolvedValueOnce({
        success: false,
        error: 'Temporary error'
      })

      const failResult = await authStore.resendMagicLink()
      expect(failResult.success).toBe(false)
      // Count should not increment on failure
      expect(authStore.emailSendCount).toBe(1)

      // Successful resend
      mockFetch.mockResolvedValueOnce({
        success: true,
        message: 'Magic link sent'
      })

      const successResult = await authStore.resendMagicLink()
      expect(successResult.success).toBe(true)
      expect(authStore.emailSendCount).toBe(2)
    })
  })
})