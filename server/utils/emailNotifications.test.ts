// @ts-nocheck
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Stub console
vi.stubGlobal('console', { log: vi.fn(), error: vi.fn() } as any)

// Mock email-templates loader
vi.mock('./email-templates', () => ({
  loadEmailTemplate: vi.fn().mockResolvedValue('<p>Template</p>')
}))

import { shouldSendTrialReminder, sendTrialExpirationReminder } from './emailNotifications'

const utc = (y: number, m: number, d: number) => new Date(Date.UTC(y, m - 1, d))

beforeEach(() => {
  process.env['MAILERSEND_API_KEY'] = '' // ensure missing mailer path
  process.env['NUXT_PUBLIC_APP_URL'] = 'http://localhost:3000'
})

describe('emailNotifications', () => {
  it('shouldSendTrialReminder returns true exactly 1 day before', () => {
    const now = utc(2024, 10, 10)
    expect(shouldSendTrialReminder(utc(2024, 10, 11), now)).toBe(true)
    expect(shouldSendTrialReminder(utc(2024, 10, 12), now)).toBe(false)
    expect(shouldSendTrialReminder(utc(2024, 10, 10), now)).toBe(false)
  })

  it('sendTrialExpirationReminder skips when mailer not configured', async () => {
    const res = await sendTrialExpirationReminder({ email: 'a@b.com', displayName: 'User', trialEndDate: utc(2024, 10, 11) }, utc(2024, 10, 10))
    expect(res.sent).toBe(false)
    expect(res.skippedReason).toBe('missing_mailer')
  })

  it('sendTrialExpirationReminder skips when not due', async () => {
    const res = await sendTrialExpirationReminder({ email: 'a@b.com', displayName: 'User', trialEndDate: utc(2024, 10, 12) }, utc(2024, 10, 10))
    expect(res.sent).toBe(false)
    expect(res.skippedReason).toBe('not_due')
  })
})
