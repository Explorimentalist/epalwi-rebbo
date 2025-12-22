/**
 * Unit Tests for Send Magic Link API Endpoint
 * Tests the enhanced rate limiting logic and email template functionality
 */

import { describe, test, expect, beforeEach, vi, afterEach } from 'vitest'
import type { MagicLinkRequest, MagicLinkResponse } from '~/types/auth'

// Mock dependencies
vi.mock('resend', () => {
  return {
    Resend: vi.fn().mockImplementation(() => ({
      emails: {
        send: vi.fn().mockResolvedValue({ id: 'mock-email-id' })
      }
    }))
  }
})

vi.mock('jsonwebtoken', () => ({
  default: {
    sign: vi.fn().mockReturnValue('mock-jwt-token')
  }
}))

// Mock the runtime config
vi.mock('#config', () => ({
  useRuntimeConfig: () => ({
    resendApiKey: 'mock-api-key',
    authTokenSecret: 'mock-secret'
  })
}))

describe('Send Magic Link API - Rate Limiting', () => {
  let handler: any

  beforeEach(async () => {
    // Clear module cache and reimport to reset rate limiting store
    vi.clearAllMocks()
    vi.resetModules()
    
    // Import the handler fresh for each test
    const module = await import('./send-magic-link.post.ts')
    handler = module.default
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  test('should allow first magic link request', async () => {
    const mockEvent = createMockEvent({
      email: 'test@example.com',
      redirectUrl: 'http://localhost:3000/auth/verify'
    })

    const response = await handler(mockEvent) as MagicLinkResponse

    expect(response.success).toBe(true)
    expect(response.message).toContain('Magic link sent')
    expect(response.rateLimitInfo).toEqual({
      currentCount: 1,
      maxAttempts: 5,
      resetTime: expect.any(Number)
    })
  })

  test('should track multiple requests for same email', async () => {
    const email = 'test@example.com'
    const mockEvent = createMockEvent({
      email,
      redirectUrl: 'http://localhost:3000/auth/verify'
    })

    // First request
    await handler(mockEvent)
    
    // Second request
    const response2 = await handler(mockEvent) as MagicLinkResponse

    expect(response2.success).toBe(true)
    expect(response2.rateLimitInfo?.currentCount).toBe(2)
    expect(response2.rateLimitInfo?.maxAttempts).toBe(5)
  })

  test('should enforce rate limit after 5 attempts', async () => {
    const email = 'ratelimit@example.com'
    const mockEvent = createMockEvent({
      email,
      redirectUrl: 'http://localhost:3000/auth/verify'
    })

    // Make 5 successful requests
    for (let i = 0; i < 5; i++) {
      const response = await handler(mockEvent) as MagicLinkResponse
      expect(response.success).toBe(true)
      expect(response.rateLimitInfo?.currentCount).toBe(i + 1)
    }

    // 6th request should be rate limited
    const response6 = await handler(mockEvent) as MagicLinkResponse

    expect(response6.success).toBe(false)
    expect(response6.error).toContain('Rate limit exceeded')
    expect(response6.rateLimitInfo?.currentCount).toBe(6)
    expect(response6.rateLimitInfo?.isLimited).toBe(true)
  })

  test('should allow requests for different emails independently', async () => {
    const email1 = 'user1@example.com'
    const email2 = 'user2@example.com'
    
    const event1 = createMockEvent({
      email: email1,
      redirectUrl: 'http://localhost:3000/auth/verify'
    })
    
    const event2 = createMockEvent({
      email: email2,
      redirectUrl: 'http://localhost:3000/auth/verify'
    })

    // Make 5 requests for email1
    for (let i = 0; i < 5; i++) {
      await handler(event1)
    }

    // 6th request for email1 should be blocked
    const response1 = await handler(event1) as MagicLinkResponse
    expect(response1.success).toBe(false)

    // But email2 should still work
    const response2 = await handler(event2) as MagicLinkResponse
    expect(response2.success).toBe(true)
    expect(response2.rateLimitInfo?.currentCount).toBe(1)
  })

  test('should reset rate limit after window expires', async () => {
    const email = 'reset@example.com'
    const mockEvent = createMockEvent({
      email,
      redirectUrl: 'http://localhost:3000/auth/verify'
    })

    // Mock Date.now to control time
    const originalNow = Date.now
    let mockTime = Date.now()
    
    vi.spyOn(Date, 'now').mockImplementation(() => mockTime)

    // Make 5 requests to hit the limit
    for (let i = 0; i < 5; i++) {
      await handler(mockEvent)
    }

    // 6th request should be blocked
    const blockedResponse = await handler(mockEvent) as MagicLinkResponse
    expect(blockedResponse.success).toBe(false)

    // Advance time by more than 1 hour (window period)
    mockTime += 61 * 60 * 1000 // 61 minutes

    // Request should now work again
    const response = await handler(mockEvent) as MagicLinkResponse
    expect(response.success).toBe(true)
    expect(response.rateLimitInfo?.currentCount).toBe(1)

    // Restore original Date.now
    Date.now = originalNow
  })

  test('should handle invalid email format', async () => {
    const mockEvent = createMockEvent({
      email: 'invalid-email',
      redirectUrl: 'http://localhost:3000/auth/verify'
    })

    const response = await handler(mockEvent) as MagicLinkResponse

    expect(response.success).toBe(false)
    expect(response.error).toContain('Invalid email')
  })

  test('should handle missing email', async () => {
    const mockEvent = createMockEvent({
      redirectUrl: 'http://localhost:3000/auth/verify'
    } as any)

    const response = await handler(mockEvent) as MagicLinkResponse

    expect(response.success).toBe(false)
    expect(response.error).toContain('Email is required')
  })

  test('should handle missing redirectUrl', async () => {
    const mockEvent = createMockEvent({
      email: 'test@example.com'
    } as any)

    const response = await handler(mockEvent) as MagicLinkResponse

    expect(response.success).toBe(false)
    expect(response.error).toContain('Redirect URL is required')
  })

  test('should handle Resend API errors gracefully', async () => {
    // Mock Resend to throw an error
    const { Resend } = await import('resend')
    const mockResend = new Resend()
    vi.mocked(mockResend.emails.send).mockRejectedValue(new Error('API Error'))

    const mockEvent = createMockEvent({
      email: 'test@example.com',
      redirectUrl: 'http://localhost:3000/auth/verify'
    })

    const response = await handler(mockEvent) as MagicLinkResponse

    expect(response.success).toBe(false)
    expect(response.error).toContain('Failed to send email')
  })
})

describe('Send Magic Link API - Email Template', () => {
  let handler: any

  beforeEach(async () => {
    vi.clearAllMocks()
    vi.resetModules()
    
    const module = await import('./send-magic-link.post.ts')
    handler = module.default
  })

  test('should include logo and custom typography in email template', async () => {
    const { Resend } = await import('resend')
    const mockResend = new Resend()
    const sendSpy = vi.mocked(mockResend.emails.send)

    const mockEvent = createMockEvent({
      email: 'test@example.com',
      redirectUrl: 'http://localhost:3000/auth/verify'
    })

    await handler(mockEvent)

    expect(sendSpy).toHaveBeenCalledTimes(1)
    const emailCall = sendSpy.mock.calls[0][0]

    // Check that email contains the logo SVG
    expect(emailCall.html).toContain('<svg')
    expect(emailCall.html).toContain('role="img"')
    expect(emailCall.html).toContain('aria-labelledby="logo-title"')

    // Check for custom font integration
    expect(emailCall.html).toContain('@font-face')
    expect(emailCall.html).toContain('Perfectly Nineties')

    // Check for updated messaging (no emojis)
    expect(emailCall.html).toContain('Un último paso y estas listo para encontrar la palabra que quieres')
    expect(emailCall.html).not.toContain('✨')
    expect(emailCall.html).not.toContain('⏰')
    expect(emailCall.html).not.toContain('🔐')
  })

  test('should generate valid JWT token in email link', async () => {
    const jwt = await import('jsonwebtoken')
    const signSpy = vi.mocked(jwt.default.sign)

    const mockEvent = createMockEvent({
      email: 'test@example.com',
      redirectUrl: 'http://localhost:3000/auth/verify'
    })

    await handler(mockEvent)

    expect(signSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'test@example.com',
        type: 'magic-link'
      }),
      'mock-secret',
      expect.objectContaining({
        expiresIn: '15m'
      })
    )
  })
})

/**
 * Helper function to create mock H3 event objects for testing
 */
function createMockEvent(body: Partial<MagicLinkRequest>) {
  return {
    node: {
      req: { method: 'POST' },
      res: {}
    },
    context: {},
    web: {},
    fetch: vi.fn(),
    $fetch: vi.fn(),
    waitUntil: vi.fn(),
    respondWith: vi.fn(),
    passThroughOnException: vi.fn(),
    handled: false,
    _onBeforeResponseHandlers: [],
    _onAfterResponseHandlers: [],
    _beforeResponseCalled: false,
    _afterResponseCalled: false,
    _route: {},
    readBody: vi.fn().mockResolvedValue(body)
  }
}