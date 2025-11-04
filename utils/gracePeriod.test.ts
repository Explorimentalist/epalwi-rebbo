// @ts-nocheck
import { describe, it, expect } from 'vitest'
import { isInGracePeriod, getGraceDaysRemaining } from './gracePeriod'

const utc = (y: number, m: number, d: number, hh = 0, mm = 0, ss = 0) => new Date(Date.UTC(y, m - 1, d, hh, mm, ss))

describe('utils/gracePeriod', () => {
  it('isInGracePeriod: true only between trialEnd and +3 days (inclusive at end)', () => {
    const trialEnd = utc(2024, 10, 1, 12)
    // Before trial end
    expect(isInGracePeriod(trialEnd, utc(2024, 10, 1, 11))).toBe(false)
    // Just after trial end
    expect(isInGracePeriod(trialEnd, utc(2024, 10, 1, 13))).toBe(true)
    // Within grace
    expect(isInGracePeriod(trialEnd, utc(2024, 10, 3, 23))).toBe(true)
    // Exactly at grace end (3 days later)
    expect(isInGracePeriod(trialEnd, utc(2024, 10, 4, 12))).toBe(true)
    // After grace end
    expect(isInGracePeriod(trialEnd, utc(2024, 10, 4, 12, 0, 1))).toBe(false)
  })

  it('getGraceDaysRemaining: ceil and min 0', () => {
    const trialEnd = utc(2024, 10, 1, 12)
    // Right after trial end: almost 3 days -> ceil to 3
    expect(getGraceDaysRemaining(trialEnd, utc(2024, 10, 1, 12, 0, 1))).toBe(3)
    // ~2.1 days remaining -> ceil 3
    expect(getGraceDaysRemaining(trialEnd, utc(2024, 10, 2, 8))).toBe(3)
    // ~1.4 days remaining -> ceil 2
    expect(getGraceDaysRemaining(trialEnd, utc(2024, 10, 3, 2))).toBe(2)
    // Just before grace end -> 1
    expect(getGraceDaysRemaining(trialEnd, utc(2024, 10, 4, 11, 59, 59))).toBe(1)
    // After grace end -> 0
    expect(getGraceDaysRemaining(trialEnd, utc(2024, 10, 4, 12, 0, 1))).toBe(0)
  })

  it('timezone-safe comparisons using UTC construction', () => {
    const trialEnd = utc(2024, 1, 31, 23)
    // Construct now with utc to avoid local DST shifts affecting logic
    const withinGrace = utc(2024, 2, 2, 12)
    const afterGrace = utc(2024, 2, 4, 0)
    expect(isInGracePeriod(trialEnd, withinGrace)).toBe(true)
    expect(isInGracePeriod(trialEnd, afterGrace)).toBe(false)
  })
})
