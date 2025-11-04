// @ts-nocheck
import { describe, it, expect, vi } from 'vitest'

// Provide minimal h3 runtime globals used by the handler
;(globalThis as any).defineEventHandler = (fn: any) => fn
;(globalThis as any).getMethod = (event: any) => event.method
;(globalThis as any).setHeader = (event: any, name: string, value: string) => {
  event.resHeaders = event.resHeaders || {}
  event.resHeaders[name] = value
}
;(globalThis as any).setResponseStatus = (event: any, code: number) => {
  event.status = code
}
;(globalThis as any).getHeader = (event: any, name: string) => {
  return event.node?.req?.headers?.[name.toLowerCase()]
}
;(globalThis as any).createError = (obj: any) => Object.assign(new Error(obj.statusMessage || 'Error'), obj)

// Mock enforceSubscription to simulate expired user path
vi.mock('~/server/utils/validateSubscription', () => ({
  enforceSubscription: () => {
    throw (globalThis as any).createError({ statusCode: 403, statusMessage: 'Subscription required', data: { errorCode: 'SUBSCRIPTION_EXPIRED' } })
  }
}))

let handler: any

const makeEvent = (): any => ({ method: 'GET', node: { req: { headers: {} } }, resHeaders: {} })

describe('GET /api/dictionary', () => {
  it('returns 403 for expired users (blocked by enforceSubscription)', async () => {
    handler = (await import('./dictionary.get')).default
    await expect(handler(makeEvent())).rejects.toMatchObject({ statusCode: 403 })
  })
})
