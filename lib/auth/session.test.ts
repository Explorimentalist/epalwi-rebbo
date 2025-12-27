import { describe, it, expect, beforeAll, afterAll, beforeEach, vi, type Mock } from 'vitest'
import {
  createSession,
  validateSession,
  invalidateSession,
  getSessionInfo,
  checkSubscriptionAccess,
  refreshSessionWithLatestUser,
  createSessionFromUserId,
  extendSession,
  getSessionStats,
  verifySessionWithAccess,
  type SessionInfo,
  type CreateSessionOptions
} from './session'
import { generateSessionToken, verifySessionToken } from './jwt'
import * as databaseUtils from '~/server/utils/database'
import type { UserProfile } from '~/types/auth'

// Mock database utilities
vi.mock('~/server/utils/database', () => ({
  getUserById: vi.fn(),
  updateUser: vi.fn()
}))

vi.mock('#app', () => ({
  useRuntimeConfig: vi.fn(() => ({
    jwtSecret: 'test-jwt-secret-for-testing-only-32-chars'
  }))
}))

const mockJWTSecret = 'test-jwt-secret-for-testing-only-32-chars'
const originalEnv = process.env.JWT_SECRET

beforeAll(() => {
  process.env.JWT_SECRET = mockJWTSecret
})

afterAll(() => {
  if (originalEnv) {
    process.env.JWT_SECRET = originalEnv
  } else {
    delete process.env.JWT_SECRET
  }
})

describe('Session Management', () => {
  let mockGetUserById: Mock
  let mockUpdateUser: Mock

  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUserById = vi.mocked(databaseUtils.getUserById)
    mockUpdateUser = vi.mocked(databaseUtils.updateUser)
  })

  const createMockUser = (overrides: Partial<UserProfile> = {}): UserProfile => ({
    uid: 'test-user-123',
    email: 'test@example.com',
    displayName: 'Test User',
    photoURL: undefined,
    role: 'user',
    emailVerified: true,
    isActive: true,
    createdAt: new Date(),
    lastLoginAt: new Date(),
    subscription: {
      status: 'trial'
    },
    trial: {
      startDate: new Date(),
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      daysRemaining: 14,
      isExpired: false
    },
    preferences: {
      defaultLanguage: 'español',
      darkMode: false,
      notifications: {
        productUpdates: true,
        languageTips: true
      }
    },
    ...overrides
  })

  describe('createSession', () => {
    it('should create session with valid user', async () => {
      const user = createMockUser()
      mockUpdateUser.mockResolvedValue(undefined)

      const session = await createSession(user)

      expect(session.token).toBeDefined()
      expect(session.user).toEqual(user)
      expect(session.expiresAt).toBeInstanceOf(Date)
      expect(session.expiresAt.getTime()).toBeGreaterThan(Date.now())
      expect(mockUpdateUser).toHaveBeenCalledWith(user.uid, { lastLoginAt: expect.any(Date) })
    })

    it('should create session with custom expiration', async () => {
      const user = createMockUser()
      mockUpdateUser.mockResolvedValue(undefined)

      const session = await createSession(user, { expiresIn: '1h' })

      expect(session.token).toBeDefined()
      expect(session.user).toEqual(user)
      
      // Verify token has correct expiration
      const payload = verifySessionToken(session.token)
      const now = Math.floor(Date.now() / 1000)
      const oneHourFromNow = now + 60 * 60
      expect(payload.exp).toBeGreaterThan(now)
      expect(payload.exp).toBeLessThan(oneHourFromNow + 60) // Allow 1 minute tolerance
    })

    it('should create extended session with remember=true', async () => {
      const user = createMockUser()
      mockUpdateUser.mockResolvedValue(undefined)

      const session = await createSession(user, { remember: true })

      expect(session.token).toBeDefined()
      
      // Verify token has 30-day expiration
      const payload = verifySessionToken(session.token)
      const now = Math.floor(Date.now() / 1000)
      const thirtyDaysFromNow = now + (30 * 24 * 60 * 60)
      expect(payload.exp).toBeGreaterThan(now)
      expect(payload.exp).toBeLessThan(thirtyDaysFromNow + 60) // Allow 1 minute tolerance
    })

    it('should handle database update errors gracefully', async () => {
      const user = createMockUser()
      mockUpdateUser.mockRejectedValue(new Error('Database error'))

      await expect(createSession(user)).rejects.toThrow('Database error')
    })
  })

  describe('validateSession', () => {
    it('should validate valid session token', async () => {
      const user = createMockUser()
      const token = generateSessionToken({
        uid: user.uid,
        email: user.email,
        role: user.role,
        subscriptionStatus: user.subscription.status
      })

      mockGetUserById.mockResolvedValue(user)

      const result = await validateSession(token)

      expect(result.valid).toBe(true)
      expect(result.user).toEqual(user)
      expect(result.token).toBeDefined()
      expect(result.needsRefresh).toBeDefined()
      expect(mockGetUserById).toHaveBeenCalledWith(user.uid)
    })

    it('should invalidate session when user not found', async () => {
      const user = createMockUser()
      const token = generateSessionToken({
        uid: user.uid,
        email: user.email,
        role: user.role,
        subscriptionStatus: user.subscription.status
      })

      mockGetUserById.mockResolvedValue(null)

      const result = await validateSession(token)

      expect(result.valid).toBe(false)
      expect(result.error).toBe('User not found')
      expect(result.user).toBeUndefined()
    })

    it('should invalidate session when user is inactive', async () => {
      const user = createMockUser({ isActive: false })
      const token = generateSessionToken({
        uid: user.uid,
        email: user.email,
        role: user.role,
        subscriptionStatus: user.subscription.status
      })

      mockGetUserById.mockResolvedValue(user)

      const result = await validateSession(token)

      expect(result.valid).toBe(false)
      expect(result.error).toBe('Account is inactive')
    })

    it('should handle invalid JWT tokens', async () => {
      const invalidToken = 'invalid.jwt.token'

      const result = await validateSession(invalidToken)

      expect(result.valid).toBe(false)
      expect(result.error).toBeDefined()
      expect(mockGetUserById).not.toHaveBeenCalled()
    })

    it('should detect when session needs refresh', async () => {
      const user = createMockUser()
      // Create token that expires in 23 hours (within 24-hour refresh window)
      const token = generateSessionToken({
        uid: user.uid,
        email: user.email,
        role: user.role,
        subscriptionStatus: user.subscription.status
      }, { expiresIn: '23h' })

      mockGetUserById.mockResolvedValue(user)

      const result = await validateSession(token)

      expect(result.valid).toBe(true)
      expect(result.needsRefresh).toBe(true)
      expect(result.token).not.toBe(token) // Should be refreshed
    })

    it('should handle database errors during validation', async () => {
      const user = createMockUser()
      const token = generateSessionToken({
        uid: user.uid,
        email: user.email,
        role: user.role,
        subscriptionStatus: user.subscription.status
      })

      mockGetUserById.mockRejectedValue(new Error('Database connection failed'))

      const result = await validateSession(token)

      expect(result.valid).toBe(false)
      expect(result.error).toBe('Database connection failed')
    })
  })

  describe('invalidateSession', () => {
    it('should update user last activity on session invalidation', async () => {
      const user = createMockUser()
      mockUpdateUser.mockResolvedValue(undefined)

      await invalidateSession(user)

      expect(mockUpdateUser).toHaveBeenCalledWith(user.uid, { lastLoginAt: expect.any(Date) })
    })

    it('should handle database errors during invalidation', async () => {
      const user = createMockUser()
      mockUpdateUser.mockRejectedValue(new Error('Update failed'))

      await expect(invalidateSession(user)).rejects.toThrow('Update failed')
    })
  })

  describe('getSessionInfo', () => {
    it('should return session info for valid token', async () => {
      const user = createMockUser()
      const token = generateSessionToken({
        uid: user.uid,
        email: user.email,
        role: user.role,
        subscriptionStatus: user.subscription.status
      })

      mockGetUserById.mockResolvedValue(user)

      const sessionInfo = await getSessionInfo(token)

      expect(sessionInfo).toBeDefined()
      expect(sessionInfo!.token).toBeDefined()
      expect(sessionInfo!.user).toEqual(user)
      expect(sessionInfo!.expiresAt).toBeInstanceOf(Date)
    })

    it('should return null for invalid session', async () => {
      const user = createMockUser()
      const token = generateSessionToken({
        uid: user.uid,
        email: user.email,
        role: user.role,
        subscriptionStatus: user.subscription.status
      })

      mockGetUserById.mockResolvedValue(null)

      const sessionInfo = await getSessionInfo(token)

      expect(sessionInfo).toBeNull()
    })

    it('should return null for invalid token', async () => {
      const sessionInfo = await getSessionInfo('invalid.token')
      expect(sessionInfo).toBeNull()
    })
  })

  describe('checkSubscriptionAccess', () => {
    it('should grant access for active subscription', () => {
      const user = createMockUser({
        subscription: { status: 'active' }
      })

      const access = checkSubscriptionAccess(user)

      expect(access.hasAccess).toBe(true)
      expect(access.reason).toBe('active_subscription')
    })

    it('should grant access for valid trial', () => {
      const user = createMockUser({
        trial: {
          startDate: new Date(),
          endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          daysRemaining: 14,
          isExpired: false
        }
      })

      const access = checkSubscriptionAccess(user)

      expect(access.hasAccess).toBe(true)
      expect(access.reason).toBe('trial_active')
      expect(access.daysRemaining).toBe(14)
    })

    it('should deny access for expired trial', () => {
      const user = createMockUser({
        subscription: { status: 'trial' },
        trial: {
          startDate: new Date(),
          endDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
          daysRemaining: 0,
          isExpired: true
        }
      })

      const access = checkSubscriptionAccess(user)

      expect(access.hasAccess).toBe(false)
      expect(access.reason).toBe('expired')
    })

    it('should deny access for cancelled subscription', () => {
      const user = createMockUser({
        subscription: { status: 'cancelled' },
        trial: {
          startDate: new Date(),
          endDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
          daysRemaining: 0,
          isExpired: true
        }
      })

      const access = checkSubscriptionAccess(user)

      expect(access.hasAccess).toBe(false)
      expect(access.reason).toBe('cancelled')
    })
  })

  describe('refreshSessionWithLatestUser', () => {
    it('should refresh session with updated user data', async () => {
      const user = createMockUser()
      const token = generateSessionToken({
        uid: user.uid,
        email: user.email,
        role: user.role,
        subscriptionStatus: user.subscription.status
      })

      // Mock updated user with active subscription
      const updatedUser = createMockUser({
        subscription: { status: 'active' }
      })

      mockGetUserById.mockResolvedValue(updatedUser)
      mockUpdateUser.mockResolvedValue(undefined)

      const newSession = await refreshSessionWithLatestUser(token)

      expect(newSession).toBeDefined()
      expect(newSession!.user.subscription.status).toBe('active')
      expect(mockGetUserById).toHaveBeenCalledWith(user.uid)
    })

    it('should return null for inactive user', async () => {
      const user = createMockUser()
      const token = generateSessionToken({
        uid: user.uid,
        email: user.email,
        role: user.role,
        subscriptionStatus: user.subscription.status
      })

      const inactiveUser = createMockUser({ isActive: false })
      mockGetUserById.mockResolvedValue(inactiveUser)

      const newSession = await refreshSessionWithLatestUser(token)

      expect(newSession).toBeNull()
    })

    it('should return null for invalid token', async () => {
      const newSession = await refreshSessionWithLatestUser('invalid.token')
      expect(newSession).toBeNull()
    })
  })

  describe('createSessionFromUserId', () => {
    it('should create session from user ID', async () => {
      const user = createMockUser()
      mockGetUserById.mockResolvedValue(user)
      mockUpdateUser.mockResolvedValue(undefined)

      const session = await createSessionFromUserId(user.uid)

      expect(session).toBeDefined()
      expect(session!.user).toEqual(user)
      expect(session!.token).toBeDefined()
      expect(mockGetUserById).toHaveBeenCalledWith(user.uid)
    })

    it('should return null for non-existent user', async () => {
      mockGetUserById.mockResolvedValue(null)

      const session = await createSessionFromUserId('non-existent-id')

      expect(session).toBeNull()
    })

    it('should return null for inactive user', async () => {
      const inactiveUser = createMockUser({ isActive: false })
      mockGetUserById.mockResolvedValue(inactiveUser)

      const session = await createSessionFromUserId(inactiveUser.uid)

      expect(session).toBeNull()
    })
  })

  describe('extendSession', () => {
    it('should extend session for valid user', async () => {
      const user = createMockUser()
      const token = generateSessionToken({
        uid: user.uid,
        email: user.email,
        role: user.role,
        subscriptionStatus: user.subscription.status
      })

      mockGetUserById.mockResolvedValue(user)
      mockUpdateUser.mockResolvedValue(undefined)

      const extendedSession = await extendSession(token)

      expect(extendedSession).toBeDefined()
      expect(extendedSession!.token).not.toBe(token) // Should be new token
      expect(extendedSession!.user).toEqual(user)

      // Verify extended expiration (30 days)
      const payload = verifySessionToken(extendedSession!.token)
      const now = Math.floor(Date.now() / 1000)
      const thirtyDaysFromNow = now + (30 * 24 * 60 * 60)
      expect(payload.exp).toBeGreaterThan(now)
      expect(payload.exp).toBeLessThan(thirtyDaysFromNow + 60)
    })

    it('should return null for invalid token', async () => {
      const extendedSession = await extendSession('invalid.token')
      expect(extendedSession).toBeNull()
    })

    it('should return null for inactive user', async () => {
      const user = createMockUser({ isActive: false })
      const token = generateSessionToken({
        uid: user.uid,
        email: user.email,
        role: user.role,
        subscriptionStatus: user.subscription.status
      })

      mockGetUserById.mockResolvedValue(user)

      const extendedSession = await extendSession(token)

      expect(extendedSession).toBeNull()
    })
  })

  describe('getSessionStats', () => {
    it('should return user-specific stats when userId provided', async () => {
      const user = createMockUser()
      mockGetUserById.mockResolvedValue(user)

      const stats = await getSessionStats(user.uid)

      expect(stats.lastLogin).toEqual(user.lastLoginAt)
      expect(stats.sessionCount).toBeDefined()
      expect(mockGetUserById).toHaveBeenCalledWith(user.uid)
    })

    it('should return general stats when no userId provided', async () => {
      const stats = await getSessionStats()

      expect(stats.userCount).toBeDefined()
      expect(stats.sessionCount).toBeDefined()
    })

    it('should handle database errors gracefully', async () => {
      mockGetUserById.mockRejectedValue(new Error('Database error'))

      const stats = await getSessionStats('invalid-id')

      expect(stats.lastLogin).toBeUndefined()
      expect(stats.sessionCount).toBe(1) // Fallback value
    })
  })

  describe('verifySessionWithAccess', () => {
    it('should verify session and check access for user with active subscription', async () => {
      const user = createMockUser({
        subscription: { status: 'active' }
      })
      const token = generateSessionToken({
        uid: user.uid,
        email: user.email,
        role: user.role,
        subscriptionStatus: user.subscription.status
      })

      mockGetUserById.mockResolvedValue(user)

      const result = await verifySessionWithAccess(token)

      expect(result.user).toEqual(user)
      expect(result.hasAccess).toBe(true)
      expect(result.accessReason).toBe('active_subscription')
      expect(result.error).toBeUndefined()
    })

    it('should verify session and check access for user with valid trial', async () => {
      const user = createMockUser()
      const token = generateSessionToken({
        uid: user.uid,
        email: user.email,
        role: user.role,
        subscriptionStatus: user.subscription.status
      })

      mockGetUserById.mockResolvedValue(user)

      const result = await verifySessionWithAccess(token)

      expect(result.user).toEqual(user)
      expect(result.hasAccess).toBe(true)
      expect(result.accessReason).toBe('trial_active')
    })

    it('should deny access for user with expired trial', async () => {
      const user = createMockUser({
        subscription: { status: 'trial' },
        trial: {
          startDate: new Date(),
          endDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
          daysRemaining: 0,
          isExpired: true
        }
      })
      const token = generateSessionToken({
        uid: user.uid,
        email: user.email,
        role: user.role,
        subscriptionStatus: user.subscription.status
      })

      mockGetUserById.mockResolvedValue(user)

      const result = await verifySessionWithAccess(token)

      expect(result.user).toEqual(user)
      expect(result.hasAccess).toBe(false)
      expect(result.accessReason).toBe('expired')
    })

    it('should handle invalid session', async () => {
      const result = await verifySessionWithAccess('invalid.token')

      expect(result.user).toBeUndefined()
      expect(result.hasAccess).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  describe('Edge Cases and Error Handling', () => {
    it('should handle user with undefined subscription', () => {
      const user = createMockUser({
        subscription: undefined as any
      })

      expect(() => checkSubscriptionAccess(user)).not.toThrow()
    })

    it('should handle user with undefined trial', () => {
      const user = createMockUser({
        trial: undefined as any
      })

      expect(() => checkSubscriptionAccess(user)).not.toThrow()
    })

    it('should handle concurrent session operations', async () => {
      const user = createMockUser()
      mockGetUserById.mockResolvedValue(user)
      mockUpdateUser.mockResolvedValue(undefined)

      // Create multiple sessions concurrently
      const promises = Array.from({ length: 5 }, () => createSession(user))
      const sessions = await Promise.all(promises)

      expect(sessions).toHaveLength(5)
      sessions.forEach(session => {
        expect(session.token).toBeDefined()
        expect(session.user).toEqual(user)
      })
    })

    it('should handle very long session durations', async () => {
      const user = createMockUser()
      mockUpdateUser.mockResolvedValue(undefined)

      const session = await createSession(user, { expiresIn: '365d' })

      expect(session.token).toBeDefined()
      expect(session.expiresAt.getTime()).toBeGreaterThan(Date.now())
    })
  })
})