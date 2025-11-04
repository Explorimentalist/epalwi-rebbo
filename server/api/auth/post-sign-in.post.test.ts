// @ts-nocheck
import { describe, it, expect } from 'vitest'

// h3 stubs
;(globalThis as any).defineEventHandler = (fn: any) => fn
;(globalThis as any).assertMethod = (event: any, method: string) => {
  if (event.method !== method) throw (globalThis as any).createError({ statusCode: 405, statusMessage: 'Method Not Allowed' })
}
;(globalThis as any).readBody = async (event: any) => event.body
;(globalThis as any).getHeader = (event: any, name: string) => event.node?.req?.headers?.[name.toLowerCase()]
;(globalThis as any).createError = (obj: any) => Object.assign(new Error(obj.statusMessage || 'Error'), obj)
;(globalThis as any).useRuntimeConfig = () => ({ public: { devAuthMock: true } })

const makeEvent = (body: any = {}) => ({ method: 'POST', body, node: { req: { headers: {} } } })

describe('POST /api/auth/post-sign-in (dev mock)', () => {
  it('returns success and a user profile when devAuthMock=true', async () => {
    const handler = (await import('./post-sign-in.post')).default
    const res = await handler(makeEvent({ uid: 'dev_uid_1', email: 'test@example.com' }))
    expect(res.success).toBe(true)
    expect(res.user.uid).toBe('dev_uid_1')
    expect(res.user.email).toBe('test@example.com')
    expect(res.user.subscription.status).toBe('trial')
    expect(res.user.preferences.defaultLanguage).toBe('español')
    expect(res.user.preferences.notifications.productUpdates).toBe(false)
    expect(res.user.preferences.notifications.languageTips).toBe(false)
    expect(res.user.preferencesUpdatedAt).toBeInstanceOf(Date)
  })
})
