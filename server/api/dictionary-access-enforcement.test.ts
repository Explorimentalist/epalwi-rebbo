/**
 * Dictionary Access and Subscription Enforcement Tests
 * Tests that dictionary access is properly controlled by subscription status
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import type { H3Event } from 'h3'

// Mock database connection
const mockQuery = vi.fn()
const mockDb = { query: mockQuery }

vi.mock('~/lib/db/connection', () => ({
  getConnection: vi.fn(() => Promise.resolve(mockDb))
}))

// Mock JWT utilities
const mockVerifyToken = vi.fn()
vi.mock('~/lib/auth/jwt', () => ({
  verifyToken: mockVerifyToken
}))

// Mock H3 utilities
const mockGetHeader = vi.fn()
const mockCreateError = vi.fn()
const mockSetHeader = vi.fn()
const mockGetMethod = vi.fn()
const mockSetResponseStatus = vi.fn()

vi.mock('h3', () => ({
  getHeader: mockGetHeader,
  createError: mockCreateError,
  setHeader: mockSetHeader,
  getMethod: mockGetMethod,
  setResponseStatus: mockSetResponseStatus
}))

// Mock file system for dictionary loading
const mockReadFile = vi.fn()
vi.mock('fs/promises', () => ({
  readFile: mockReadFile
}))

// Import after mocks
import { validateSubscription, enforceSubscription } from '~/server/utils/validateSubscription'

describe('Dictionary Access and Subscription Enforcement', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCreateError.mockImplementation((options) => {
      const error = new Error(options.statusMessage) as any
      error.statusCode = options.statusCode
      error.statusMessage = options.statusMessage
      error.data = options.data
      return error
    })
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('Subscription Status Validation', () => {
    it('should grant access to users with active subscription', async () => {
      // Mock valid JWT token
      mockGetHeader.mockReturnValue('Bearer valid_jwt_token')
      mockVerifyToken.mockResolvedValue({
        valid: true,
        payload: { email: 'user@example.com', iat: Date.now() / 1000 }
      })

      // Mock user with active subscription
      mockQuery.mockResolvedValue({
        rows: [{
          uid: 'user123',
          email: 'user@example.com',
          subscription_status: 'active',
          subscription_current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          trial_end: null,
          is_active: true
        }]
      })

      const mockEvent = {} as H3Event
      const result = await validateSubscription(mockEvent)

      expect(result.ok).toBe(true)
      expect(result.reason).toBe('OK')
      expect(result.statusCode).toBe(200)
      expect(result.user?.hasActiveSubscription).toBe(true)
    })

    it('should grant access to users with valid trial', async () => {
      // Mock valid JWT token
      mockGetHeader.mockReturnValue('Bearer valid_jwt_token')
      mockVerifyToken.mockResolvedValue({
        valid: true,
        payload: { email: 'trial@example.com', iat: Date.now() / 1000 }
      })

      // Mock user with active trial
      mockQuery.mockResolvedValue({
        rows: [{
          uid: 'user456',
          email: 'trial@example.com',
          subscription_status: 'trial',
          subscription_current_period_end: null,
          trial_end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          is_active: true
        }]
      })

      const mockEvent = {} as H3Event
      const result = await validateSubscription(mockEvent)

      expect(result.ok).toBe(true)
      expect(result.reason).toBe('OK')
      expect(result.statusCode).toBe(200)
      expect(result.user?.isTrialActive).toBe(true)
    })

    it('should grant grace period access to recently expired users', async () => {
      // Mock valid JWT token
      mockGetHeader.mockReturnValue('Bearer valid_jwt_token')
      mockVerifyToken.mockResolvedValue({
        valid: true,
        payload: { email: 'grace@example.com', iat: Date.now() / 1000 }
      })

      // Mock user in grace period (expired 2 days ago)
      const expiredDate = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      mockQuery.mockResolvedValue({
        rows: [{
          uid: 'user789',
          email: 'grace@example.com',
          subscription_status: 'past_due',
          subscription_current_period_end: expiredDate,
          trial_end: null,
          is_active: true
        }]
      })

      const mockEvent = {} as H3Event
      const result = await validateSubscription(mockEvent, { allowGrace: true })

      expect(result.ok).toBe(true)
      expect(result.reason).toBe('GRACE')
      expect(result.statusCode).toBe(200)
      expect(result.user?.isInGracePeriod).toBe(true)
    })

    it('should deny access to users with expired subscription and trial', async () => {
      // Mock valid JWT token
      mockGetHeader.mockReturnValue('Bearer valid_jwt_token')
      mockVerifyToken.mockResolvedValue({
        valid: true,
        payload: { email: 'expired@example.com', iat: Date.now() / 1000 }
      })

      // Mock user with expired subscription and trial (expired 20 days ago)
      const longExpiredDate = new Date(Date.now() - 20 * 24 * 60 * 60 * 1000)
      mockQuery.mockResolvedValue({
        rows: [{
          uid: 'user999',
          email: 'expired@example.com',
          subscription_status: 'canceled',
          subscription_current_period_end: longExpiredDate,
          trial_end: longExpiredDate,
          is_active: true
        }]
      })

      const mockEvent = {} as H3Event
      const result = await validateSubscription(mockEvent)

      expect(result.ok).toBe(false)
      expect(result.reason).toBe('EXPIRED')
      expect(result.statusCode).toBe(403)
      expect(result.errorCode).toBe('SUBSCRIPTION_EXPIRED')
    })

    it('should deny access for invalid JWT tokens', async () => {
      // Mock invalid JWT token
      mockGetHeader.mockReturnValue('Bearer invalid_jwt_token')
      mockVerifyToken.mockResolvedValue({
        valid: false,
        error: 'Invalid signature'
      })

      const mockEvent = {} as H3Event
      const result = await validateSubscription(mockEvent)

      expect(result.ok).toBe(false)
      expect(result.reason).toBe('INVALID_TOKEN')
      expect(result.statusCode).toBe(401)
      expect(result.errorCode).toBe('INVALID_TOKEN')
    })

    it('should deny access when user is not found', async () => {
      // Mock valid JWT token
      mockGetHeader.mockReturnValue('Bearer valid_jwt_token')
      mockVerifyToken.mockResolvedValue({
        valid: true,
        payload: { email: 'notfound@example.com', iat: Date.now() / 1000 }
      })

      // Mock user not found in database
      mockQuery.mockResolvedValue({ rows: [] })

      const mockEvent = {} as H3Event
      const result = await validateSubscription(mockEvent)

      expect(result.ok).toBe(false)
      expect(result.reason).toBe('USER_NOT_FOUND')
      expect(result.statusCode).toBe(404)
      expect(result.errorCode).toBe('USER_NOT_FOUND')
    })
  })

  describe('Dictionary API Access Control', () => {
    it('should allow dictionary access for active subscriber', async () => {
      // Mock successful subscription validation
      mockGetHeader.mockReturnValue('Bearer valid_jwt_token')
      mockVerifyToken.mockResolvedValue({
        valid: true,
        payload: { email: 'subscriber@example.com', iat: Date.now() / 1000 }
      })

      mockQuery.mockResolvedValue({
        rows: [{
          uid: 'sub123',
          email: 'subscriber@example.com',
          subscription_status: 'active',
          subscription_current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          is_active: true
        }]
      })

      // Mock dictionary file loading
      const mockDictionaryData = {
        metadata: {
          name: 'Spanish-Ndowe Dictionary',
          version: '1.1',
          total_entries: 1000
        },
        entries: [
          { id: '1', español: 'hola', ndowe: 'nanga' },
          { id: '2', español: 'adiós', ndowe: 'vá-dá' }
        ]
      }
      mockReadFile.mockResolvedValue(JSON.stringify(mockDictionaryData))

      const mockEvent = {} as H3Event
      
      // Verify that enforceSubscription would not throw
      const userInfo = await enforceSubscription(mockEvent)
      expect(userInfo.hasActiveSubscription).toBe(true)
    })

    it('should block dictionary access for expired users', async () => {
      // Mock expired user validation
      mockGetHeader.mockReturnValue('Bearer valid_jwt_token')
      mockVerifyToken.mockResolvedValue({
        valid: true,
        payload: { email: 'expired@example.com', iat: Date.now() / 1000 }
      })

      mockQuery.mockResolvedValue({
        rows: [{
          uid: 'exp123',
          email: 'expired@example.com',
          subscription_status: 'canceled',
          subscription_current_period_end: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          trial_end: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          is_active: true
        }]
      })

      const mockEvent = {} as H3Event
      
      // Verify that enforceSubscription throws error
      await expect(enforceSubscription(mockEvent)).rejects.toThrow()
      expect(mockCreateError).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 403,
          statusMessage: 'Subscription required'
        })
      )
    })
  })

  describe('Subscription Status Edge Cases', () => {
    it('should handle users with trialing status correctly', async () => {
      mockGetHeader.mockReturnValue('Bearer valid_jwt_token')
      mockVerifyToken.mockResolvedValue({
        valid: true,
        payload: { email: 'trialing@example.com', iat: Date.now() / 1000 }
      })

      mockQuery.mockResolvedValue({
        rows: [{
          uid: 'trial123',
          email: 'trialing@example.com',
          subscription_status: 'trialing',
          subscription_trial_end: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
          is_active: true
        }]
      })

      const mockEvent = {} as H3Event
      const result = await validateSubscription(mockEvent)

      expect(result.ok).toBe(true)
      expect(result.user?.isTrialActive).toBe(true)
    })

    it('should handle users with past_due status in grace period', async () => {
      mockGetHeader.mockReturnValue('Bearer valid_jwt_token')
      mockVerifyToken.mockResolvedValue({
        valid: true,
        payload: { email: 'pastdue@example.com', iat: Date.now() / 1000 }
      })

      mockQuery.mockResolvedValue({
        rows: [{
          uid: 'past123',
          email: 'pastdue@example.com',
          subscription_status: 'past_due',
          subscription_current_period_end: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          is_active: true
        }]
      })

      const mockEvent = {} as H3Event
      const result = await validateSubscription(mockEvent, { allowGrace: true })

      expect(result.ok).toBe(true)
      expect(result.reason).toBe('GRACE')
      expect(result.user?.isInGracePeriod).toBe(true)
    })

    it('should handle database connection errors gracefully', async () => {
      mockGetHeader.mockReturnValue('Bearer valid_jwt_token')
      mockVerifyToken.mockResolvedValue({
        valid: true,
        payload: { email: 'dbtest@example.com', iat: Date.now() / 1000 }
      })

      // Mock database error
      mockQuery.mockRejectedValue(new Error('Connection failed'))

      const mockEvent = {} as H3Event
      const result = await validateSubscription(mockEvent)

      expect(result.ok).toBe(false)
      expect(result.reason).toBe('VERIFICATION_FAILED')
      expect(result.statusCode).toBe(503)
    })

    it('should handle missing authorization header', async () => {
      mockGetHeader.mockReturnValue(null) // No auth header

      const mockEvent = {} as H3Event
      const result = await validateSubscription(mockEvent)

      expect(result.ok).toBe(false)
      expect(result.reason).toBe('INVALID_TOKEN')
      expect(result.statusCode).toBe(401)
    })

    it('should handle malformed authorization header', async () => {
      mockGetHeader.mockReturnValue('InvalidFormat token_here') // Wrong format

      const mockEvent = {} as H3Event
      const result = await validateSubscription(mockEvent)

      expect(result.ok).toBe(false)
      expect(result.reason).toBe('INVALID_TOKEN')
    })
  })

  describe('Access Logging', () => {
    it('should log successful access attempts', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      mockGetHeader.mockReturnValue('Bearer valid_jwt_token')
      mockVerifyToken.mockResolvedValue({
        valid: true,
        payload: { email: 'logger@example.com', iat: Date.now() / 1000 }
      })

      mockQuery.mockResolvedValue({
        rows: [{
          uid: 'log123',
          email: 'logger@example.com',
          subscription_status: 'active',
          subscription_current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          is_active: true
        }]
      })

      const mockEvent = {} as H3Event
      await validateSubscription(mockEvent, { resource: '/api/dictionary' })

      // Verify access attempt would be logged (we can't test actual logging due to mocks)
      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })

    it('should log blocked access attempts', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      mockGetHeader.mockReturnValue('Bearer valid_jwt_token')
      mockVerifyToken.mockResolvedValue({
        valid: true,
        payload: { email: 'blocked@example.com', iat: Date.now() / 1000 }
      })

      mockQuery.mockResolvedValue({
        rows: [{
          uid: 'block123',
          email: 'blocked@example.com',
          subscription_status: 'canceled',
          subscription_current_period_end: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          is_active: true
        }]
      })

      const mockEvent = {} as H3Event
      await validateSubscription(mockEvent, { resource: '/api/dictionary' })

      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })
  })
})