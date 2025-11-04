// @ts-nocheck
import { describe, it, expect, vi } from 'vitest'

vi.mock('./auth', () => {
  return {
    validateUserSubscription: (event: any) => mockAuthResult,
    logAccessAttempt: vi.fn()
  }
})

import { validateSubscription, enforceSubscription } from './validateSubscription'

let mockAuthResult: any
const makeEvent = () => ({}) as any

describe('server/utils/validateSubscription', () => {
  it('maps INVALID_TOKEN', async () => {
    mockAuthResult = { success: false, errorCode: 'INVALID_TOKEN' }
    const res = await validateSubscription(makeEvent())
    expect(res.ok).toBe(false)
    expect(res.statusCode).toBe(401)
    expect(res.reason).toBe('INVALID_TOKEN')
  })

  it('allows grace period when allowed', async () => {
    mockAuthResult = { success: true, user: { hasActiveSubscription: false, isTrialActive: false, isInGracePeriod: true, canAccessFeatures: true, subscriptionStatus: 'trial' } }
    const res = await validateSubscription(makeEvent(), { allowGrace: true })
    expect(res.ok).toBe(true)
    expect(res.reason).toBe('GRACE')
  })

  it('blocks expired users', async () => {
    mockAuthResult = { success: true, user: { hasActiveSubscription: false, isTrialActive: false, isInGracePeriod: false, canAccessFeatures: false, subscriptionStatus: 'expired' } }
    await expect(validateSubscription(makeEvent())).resolves.toMatchObject({ ok: false, statusCode: 403, reason: 'EXPIRED' })
    await expect(enforceSubscription(makeEvent())).rejects.toMatchObject({ statusCode: 403 })
  })
})

