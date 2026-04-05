// @ts-nocheck
import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { H3Event } from 'h3'

// Mock JWT verification
let mockVerifySessionToken = vi.fn()

vi.mock('~/lib/auth/jwt', () => ({
  verifySessionToken: (token: string) => mockVerifySessionToken(token),
  extractBearerToken: (header: string | undefined) => {
    if (!header) return null
    const match = header.match(/^Bearer\s+(.+)$/i)
    return match ? match[1] : null
  }
}))

// Provide minimal getHeader implementation used by validateUserToken
vi.mock('h3', () => ({
  getHeader: (event: any, name: string) => event?.node?.req?.headers?.[name]
}))

// Mock database functions
vi.mock('./database', () => ({
  getUserById: vi.fn()
}))

import { validateUserToken, getUserSubscriptionStatus } from './auth'
import { getUserById } from './database'

const makeEvent = (authorization?: string): H3Event => (
  { node: { req: { headers: authorization ? { authorization } : {} } } } as any
)

beforeEach(() => {
  mockVerifySessionToken = vi.fn()
  
  // Reset getUserById mock
  vi.mocked(getUserById).mockReset()
})

describe('server/utils/auth', () => {
  it('returns null for invalid token', async () => {
    mockVerifySessionToken.mockImplementation(() => {
      throw new Error('Invalid session token')
    })
    const res = await validateUserToken(makeEvent('Bearer invalid'))
    expect(res).toBeNull()
  })

  it('extracts uid/email for valid token', async () => {
    mockVerifySessionToken.mockReturnValue({ uid: 'u1', email: 'a@b.com' })
    const res = await validateUserToken(makeEvent('Bearer valid'))
    expect(res).toEqual({ uid: 'u1', email: 'a@b.com' })
  })

  it('computes active subscription with valid currentPeriodEnd', async () => {
    // Active subscription with future currentPeriodEnd
    const mockUser = {
      uid: 'u1',
      email: 'a@b.com',
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      subscription: {
        status: 'active',
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
      },
      trial: null
    }
    vi.mocked(getUserById).mockResolvedValue(mockUser as any)

    const info = await getUserSubscriptionStatus('u1')
    expect(info.hasActiveSubscription).toBe(true)
    expect(info.canAccessFeatures).toBe(true)
    expect(info.subscriptionStatus).toBe('active')
  })

  it('treats subscription with status active but past currentPeriodEnd as expired', async () => {
    // Subscription status says active but period has ended - this is the BUG we fixed!
    const mockUser = {
      uid: 'u1',
      email: 'expired-by-date@example.com',
      createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), // Created 45 days ago
      subscription: {
        status: 'active', // Status says active...
        currentPeriodEnd: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // ...but period ended yesterday
      },
      trial: null
    }
    vi.mocked(getUserById).mockResolvedValue(mockUser as any)

    const info = await getUserSubscriptionStatus('u1')
    expect(info.hasActiveSubscription).toBe(false) // Must be false!
    expect(info.canAccessFeatures).toBe(false) // No access
    expect(info.subscriptionStatus).toBe('expired') // Should show as expired
  })

  it('handles subscription with trialing status and valid period', async () => {
    const mockUser = {
      uid: 'u1',
      email: 'trialing@example.com',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      subscription: {
        status: 'trialing',
        currentPeriodEnd: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000) // 11 days left
      },
      trial: {
        startDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000)
      }
    }
    vi.mocked(getUserById).mockResolvedValue(mockUser as any)

    const info = await getUserSubscriptionStatus('u1')
    expect(info.hasActiveSubscription).toBe(true)
    expect(info.subscriptionStatus).toBe('active')
    expect(info.canAccessFeatures).toBe(true)
  })

  it('handles subscription with status active but no currentPeriodEnd gracefully', async () => {
    // Edge case: status is active but no period end date (shouldn't happen but be defensive)
    const mockUser = {
      uid: 'u1',
      email: 'no-period@example.com',
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      subscription: {
        status: 'active'
        // No currentPeriodEnd - defensive handling
      },
      trial: null
    }
    vi.mocked(getUserById).mockResolvedValue(mockUser as any)

    const info = await getUserSubscriptionStatus('u1')
    // Without a valid period end, we can't confirm subscription is active
    expect(info.hasActiveSubscription).toBe(false)
    // But trial may still be active
    expect(info.isTrialActive).toBe(true) // 10 days < 14 day trial
    expect(info.canAccessFeatures).toBe(true) // Can access via trial
  })

  it('handles PostgreSQL date strings for currentPeriodEnd', async () => {
    // PostgreSQL returns dates as ISO strings
    const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    const mockUser = {
      uid: 'u1',
      email: 'datestring@example.com',
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      subscription: {
        status: 'active',
        currentPeriodEnd: futureDate.toISOString() // String instead of Date object
      },
      trial: null
    }
    vi.mocked(getUserById).mockResolvedValue(mockUser as any)

    const info = await getUserSubscriptionStatus('u1')
    expect(info.hasActiveSubscription).toBe(true) // Should correctly parse string
    expect(info.subscriptionStatus).toBe('active')
  })

  it('computes trial active and grace flags', async () => {
    // Trial active: created 5 days ago
    const trialUser = {
      uid: 'u1',
      email: 'a@b.com',
      createdAt: new Date(Date.now() - 5 * 86400000),
      trial: null,
      subscription: null
    }
    vi.mocked(getUserById).mockResolvedValue(trialUser as any)
    const trialInfo = await getUserSubscriptionStatus('u1')
    expect(trialInfo.isTrialActive).toBe(true)
    expect(trialInfo.isInGracePeriod).toBe(false)

    // Grace: created 16 days ago (14 + 2)
    const graceUser = {
      uid: 'u1',
      email: 'a@b.com',
      createdAt: new Date(Date.now() - 16 * 86400000),
      trial: null,
      subscription: null
    }
    vi.mocked(getUserById).mockResolvedValue(graceUser as any)
    const graceInfo = await getUserSubscriptionStatus('u1')
    expect(graceInfo.isTrialActive).toBe(false)
    expect(graceInfo.isInGracePeriod).toBe(true)
    expect(graceInfo.canAccessFeatures).toBe(true)

    // Expired: created 20 days ago
    const expiredUser = {
      uid: 'u1',
      email: 'a@b.com',
      createdAt: new Date(Date.now() - 20 * 86400000),
      trial: null,
      subscription: null
    }
    vi.mocked(getUserById).mockResolvedValue(expiredUser as any)
    const expiredInfo = await getUserSubscriptionStatus('u1')
    expect(expiredInfo.isTrialActive).toBe(false)
    expect(expiredInfo.isInGracePeriod).toBe(false)
    expect(expiredInfo.canAccessFeatures).toBe(false)
    expect(expiredInfo.subscriptionStatus).toBe('expired')
  })
})
