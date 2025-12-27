// @ts-nocheck
import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { H3Event } from 'h3'

// Mock JWT verification
let mockVerifySessionToken = vi.fn()

vi.mock('~/lib/auth/jwt', () => ({
  verifySessionToken: (token: string) => mockVerifySessionToken(token)
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

  it('computes active subscription', async () => {
    const mockUser = {
      uid: 'u1',
      email: 'a@b.com',
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      subscription: { status: 'active' },
      trial: null
    }
    vi.mocked(getUserById).mockResolvedValue(mockUser as any)
    
    const info = await getUserSubscriptionStatus('u1')
    expect(info.hasActiveSubscription).toBe(true)
    expect(info.canAccessFeatures).toBe(true)
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
