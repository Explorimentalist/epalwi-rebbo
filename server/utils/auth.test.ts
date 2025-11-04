// @ts-nocheck
import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { H3Event } from 'h3'

// Mocks for firebase-admin
let mockVerify = vi.fn()
let mockSnap: any

vi.mock('firebase-admin/auth', () => ({
  getAuth: () => ({ verifyIdToken: (t: string) => mockVerify(t) })
}))

vi.mock('firebase-admin/firestore', () => ({
  getFirestore: () => ({
    collection: () => ({
      doc: () => ({
        get: async () => mockSnap
      })
    })
  })
}))

// Provide minimal getHeader implementation used by validateUserToken
vi.mock('h3', () => ({
  getHeader: (event: any, name: string) => event?.node?.req?.headers?.[name]
}))

import { validateUserToken, getUserSubscriptionStatus } from './auth'

const makeEvent = (authorization?: string): H3Event => (
  { node: { req: { headers: authorization ? { authorization } : {} } } } as any
)

const ts = (d: Date) => ({ toDate: () => d })

beforeEach(() => {
  mockVerify = vi.fn()
  mockSnap = { exists: true, data: () => ({ createdAt: ts(new Date()) }) }
})

describe('server/utils/auth', () => {
  it('returns null for invalid token', async () => {
    mockVerify.mockRejectedValue(new Error('bad token'))
    const res = await validateUserToken(makeEvent('Bearer invalid'))
    expect(res).toBeNull()
  })

  it('extracts uid/email for valid token', async () => {
    mockVerify.mockResolvedValue({ uid: 'u1', email: 'a@b.com' })
    const res = await validateUserToken(makeEvent('Bearer valid'))
    expect(res).toEqual({ uid: 'u1', email: 'a@b.com' })
  })

  it('computes active subscription', async () => {
    mockSnap = {
      exists: true,
      data: () => ({ createdAt: ts(new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)), subscription: { status: 'active' }, email: 'a@b.com' })
    }
    const info = await getUserSubscriptionStatus('u1')
    expect(info.hasActiveSubscription).toBe(true)
    expect(info.canAccessFeatures).toBe(true)
    expect(info.subscriptionStatus).toBe('active')
  })

  it('computes trial active and grace flags', async () => {
    // Trial active: created 5 days ago
    mockSnap = { exists: true, data: () => ({ createdAt: ts(new Date(Date.now() - 5 * 86400000)) }) }
    const trialInfo = await getUserSubscriptionStatus('u1')
    expect(trialInfo.isTrialActive).toBe(true)
    expect(trialInfo.isInGracePeriod).toBe(false)

    // Grace: created 16 days ago (14 + 2)
    mockSnap = { exists: true, data: () => ({ createdAt: ts(new Date(Date.now() - 16 * 86400000)) }) }
    const graceInfo = await getUserSubscriptionStatus('u1')
    expect(graceInfo.isTrialActive).toBe(false)
    expect(graceInfo.isInGracePeriod).toBe(true)
    expect(graceInfo.canAccessFeatures).toBe(true)

    // Expired: created 20 days ago
    mockSnap = { exists: true, data: () => ({ createdAt: ts(new Date(Date.now() - 20 * 86400000)) }) }
    const expiredInfo = await getUserSubscriptionStatus('u1')
    expect(expiredInfo.isTrialActive).toBe(false)
    expect(expiredInfo.isInGracePeriod).toBe(false)
    expect(expiredInfo.canAccessFeatures).toBe(false)
    expect(expiredInfo.subscriptionStatus).toBe('expired')
  })
})
