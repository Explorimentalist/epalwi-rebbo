// @ts-nocheck
import { describe, it, expect, vi } from 'vitest'

vi.stubGlobal('console', { log: vi.fn() } as any)

import { trackPaywallView, trackAccessDenied, trackTrialExpiration, trackSubscriptionConversion } from './subscriptionAnalytics'

describe('utils/subscriptionAnalytics', () => {
  it('tracks paywall views and conversions', () => {
    trackPaywallView('paywall', 'dictionary')
    trackSubscriptionConversion('annual', 'paywall')
    expect((console as any).log).toHaveBeenCalled()
  })

  it('tracks access denied and trial expiration', () => {
    trackAccessDenied('/api/dictionary', 'EXPIRED')
    trackTrialExpiration('user_1')
    expect((console as any).log).toHaveBeenCalled()
  })
})
