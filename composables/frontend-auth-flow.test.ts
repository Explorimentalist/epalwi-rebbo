/**
 * Frontend Authentication Flow Integration Test
 * Tests the complete frontend authentication flow with JWT session management
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useAuthStore } from '~/stores/auth'

// Mock $fetch for API calls
const mockFetch = vi.fn()
vi.stubGlobal('$fetch', mockFetch)

// Mock sessionStorage
const mockSessionStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}
vi.stubGlobal('sessionStorage', mockSessionStorage)

// Mock window location
const mockLocation = {
  origin: 'http://localhost:3000'
}
vi.stubGlobal('window', { location: mockLocation })

describe('Frontend Authentication Flow', () => {
  let authStore: ReturnType<typeof useAuthStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    authStore = useAuthStore()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('Magic Link Authentication Flow', () => {
    it('should send magic link request successfully', async () => {
      // Mock successful magic link API response
      mockFetch.mockResolvedValue({
        success: true,
        message: 'Enlace de acceso enviado. Revisa tu correo electrónico.',
        attemptCount: 1,
        maxAttempts: 5
      })

      const email = 'test@example.com'
      const result = await authStore.sendMagicLink(email)

      // Verify API was called correctly
      expect(mockFetch).toHaveBeenCalledWith('/api/auth/send-magic-link', {
        method: 'POST',
        body: {
          email,
          redirectUrl: 'http://localhost:3000/auth/verify'
        }
      })

      // Verify response
      expect(result.success).toBe(true)
      expect(result.message).toBe('Enlace de acceso enviado. Revisa tu correo electrónico.')
    })

    it('should handle magic link verification successfully', async () => {
      const mockSessionToken = 'jwt_session_token_here'
      const mockUser = {
        uid: 'user123',
        email: 'test@example.com',
        displayName: 'Test User',
        role: 'user' as const,
        createdAt: new Date(),
        lastLoginAt: new Date(),
        subscription: {
          status: 'trial' as const
        },
        trial: {
          startDate: new Date(),
          endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          daysRemaining: 14,
          isExpired: false
        },
        preferences: {
          defaultLanguage: 'español',
          darkMode: false
        },
        emailVerified: true,
        isActive: true
      }

      // Mock successful verification response
      mockFetch.mockResolvedValue({
        success: true,
        sessionToken: mockSessionToken,
        user: mockUser,
        message: 'Autenticación exitosa'
      })

      const token = 'magic_link_jwt_token'
      const result = await authStore.verifyMagicLink(token)

      // Verify API was called correctly
      expect(mockFetch).toHaveBeenCalledWith('/api/auth/verify-magic-link', {
        method: 'POST',
        body: { token }
      })

      // Verify response
      expect(result.success).toBe(true)
      expect(result.sessionToken).toBe(mockSessionToken)
      expect(result.user).toEqual(mockUser)

      // Verify auth state is updated
      expect(authStore.isAuthenticated).toBe(true)
      expect(authStore.user?.email).toBe('test@example.com')
      expect(authStore.sessionToken).toBe(mockSessionToken)
    })

    it('should persist session data to sessionStorage', async () => {
      const mockSessionToken = 'jwt_session_token_here'
      const mockUser = {
        uid: 'user123',
        email: 'test@example.com',
        displayName: 'Test User',
        role: 'user' as const,
        createdAt: new Date(),
        lastLoginAt: new Date(),
        subscription: { status: 'trial' as const },
        trial: {
          startDate: new Date(),
          endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          daysRemaining: 14,
          isExpired: false
        },
        preferences: { defaultLanguage: 'español', darkMode: false },
        emailVerified: true,
        isActive: true
      }

      mockFetch.mockResolvedValue({
        success: true,
        sessionToken: mockSessionToken,
        user: mockUser
      })

      await authStore.verifyMagicLink('test_token')

      // Verify session storage calls
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
        'auth-session-token',
        mockSessionToken
      )
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
        'auth-user',
        JSON.stringify(mockUser)
      )
    })

    it('should restore session from sessionStorage on initialization', async () => {
      const mockSessionToken = 'stored_jwt_token'
      const mockStoredUser = {
        uid: 'user123',
        email: 'test@example.com',
        createdAt: new Date().toISOString()
      }

      // Mock sessionStorage returning stored data
      mockSessionStorage.getItem.mockImplementation((key) => {
        if (key === 'auth-session-token') return mockSessionToken
        if (key === 'auth-user') return JSON.stringify(mockStoredUser)
        return null
      })

      // Initialize auth store (simulating page reload)
      await authStore.initializeAuth()

      // Verify session is restored
      expect(authStore.sessionToken).toBe(mockSessionToken)
      expect(authStore.user?.email).toBe('test@example.com')
      expect(authStore.isAuthenticated).toBe(true)
    })
  })

  describe('Session Management', () => {
    beforeEach(() => {
      // Set up authenticated state
      authStore.user = {
        uid: 'user123',
        email: 'test@example.com',
        displayName: 'Test User',
        role: 'user',
        createdAt: new Date(),
        lastLoginAt: new Date(),
        subscription: { status: 'active' },
        trial: {
          startDate: new Date(),
          endDate: new Date(),
          daysRemaining: 0,
          isExpired: true
        },
        preferences: { defaultLanguage: 'español', darkMode: false },
        emailVerified: true,
        isActive: true
      }
      authStore.sessionToken = 'test_session_token'
    })

    it('should refresh user data successfully', async () => {
      const updatedUser = {
        ...authStore.user!,
        displayName: 'Updated User Name'
      }

      mockFetch.mockResolvedValue({
        success: true,
        user: updatedUser
      })

      await authStore.refreshUser()

      expect(mockFetch).toHaveBeenCalledWith('/api/auth/refresh', {
        method: 'GET',
        headers: {
          Authorization: 'Bearer test_session_token'
        }
      })

      expect(authStore.user?.displayName).toBe('Updated User Name')
    })

    it('should sign out and clear session data', async () => {
      mockFetch.mockResolvedValue({ success: true })

      await authStore.signOut()

      // Verify API call
      expect(mockFetch).toHaveBeenCalledWith('/api/auth/signout', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer test_session_token'
        }
      })

      // Verify state is cleared
      expect(authStore.user).toBeNull()
      expect(authStore.sessionToken).toBeNull()
      expect(authStore.isAuthenticated).toBe(false)

      // Verify sessionStorage is cleared
      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('auth-session-token')
      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('auth-user')
    })
  })

  describe('Subscription Status Computed Properties', () => {
    it('should correctly identify active subscription', () => {
      authStore.user = {
        uid: 'user123',
        email: 'test@example.com',
        displayName: 'Test User',
        role: 'user',
        createdAt: new Date(),
        lastLoginAt: new Date(),
        subscription: { status: 'active' },
        trial: {
          startDate: new Date(),
          endDate: new Date(),
          daysRemaining: 0,
          isExpired: true
        },
        preferences: { defaultLanguage: 'español', darkMode: false },
        emailVerified: true,
        isActive: true
      }

      expect(authStore.isSubscriptionActive).toBe(true)
      expect(authStore.canAccessFeatures).toBe(true)
    })

    it('should correctly identify active trial', () => {
      authStore.user = {
        uid: 'user123',
        email: 'test@example.com',
        displayName: 'Test User',
        role: 'user',
        createdAt: new Date(),
        lastLoginAt: new Date(),
        subscription: { status: 'trial' },
        trial: {
          startDate: new Date(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          daysRemaining: 7,
          isExpired: false
        },
        preferences: { defaultLanguage: 'español', darkMode: false },
        emailVerified: true,
        isActive: true
      }

      expect(authStore.isTrialActive).toBe(true)
      expect(authStore.trialDaysRemaining).toBe(7)
      expect(authStore.canAccessFeatures).toBe(true)
    })

    it('should deny access for expired trial and no subscription', () => {
      authStore.user = {
        uid: 'user123',
        email: 'test@example.com',
        displayName: 'Test User',
        role: 'user',
        createdAt: new Date(),
        lastLoginAt: new Date(),
        subscription: { status: 'trial' },
        trial: {
          startDate: new Date(),
          endDate: new Date(Date.now() - 1000),
          daysRemaining: 0,
          isExpired: true
        },
        preferences: { defaultLanguage: 'español', darkMode: false },
        emailVerified: true,
        isActive: true
      }

      expect(authStore.isTrialActive).toBe(false)
      expect(authStore.isSubscriptionActive).toBe(false)
      expect(authStore.canAccessFeatures).toBe(false)
    })
  })

  describe('Rate Limiting', () => {
    it('should track email send attempts correctly', async () => {
      const email = 'test@example.com'

      mockFetch.mockResolvedValue({
        success: true,
        message: 'Email sent'
      })

      // Send first email
      await authStore.sendMagicLink(email)
      expect(authStore.emailSendCount).toBe(1)
      expect(authStore.currentEmail).toBe(email)

      // Send second email to same address
      await authStore.sendMagicLink(email)
      expect(authStore.emailSendCount).toBe(2)

      // Send to different email (should reset counter)
      await authStore.sendMagicLink('different@example.com')
      expect(authStore.emailSendCount).toBe(1)
      expect(authStore.currentEmail).toBe('different@example.com')
    })

    it('should respect rate limiting', async () => {
      // Simulate reaching rate limit
      authStore.emailSendCount = 5
      authStore.currentEmail = 'test@example.com'

      const result = await authStore.resendMagicLink('test@example.com')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Rate limit exceeded')
      expect(mockFetch).not.toHaveBeenCalled()
    })
  })

  describe('Error Handling', () => {
    it('should handle magic link send errors gracefully', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'))

      const result = await authStore.sendMagicLink('test@example.com')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Network error')
      expect(authStore.error).toBe('Network error')
    })

    it('should handle verification errors gracefully', async () => {
      mockFetch.mockRejectedValue(new Error('Invalid token'))

      const result = await authStore.verifyMagicLink('invalid_token')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid token')
      expect(authStore.error).toBe('Invalid token')
    })

    it('should handle session restoration failures gracefully', async () => {
      mockSessionStorage.getItem.mockImplementation(() => {
        throw new Error('Storage error')
      })

      await authStore.initializeAuth()

      expect(authStore.user).toBeNull()
      expect(authStore.sessionToken).toBeNull()
      expect(authStore.initialized).toBe(true)
    })
  })
})