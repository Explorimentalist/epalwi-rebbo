// @ts-nocheck
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Provide Nuxt runtime stubs
;(globalThis as any).defineNuxtRouteMiddleware = (fn: any) => fn

let navigateToMock = vi.fn()
vi.stubGlobal('navigateTo', (...args: any[]) => navigateToMock(...args))

let store: any
let useAuthReturn: any

vi.stubGlobal('useAuthStore', () => store)
vi.stubGlobal('useAuth', () => useAuthReturn)

let middleware: any

const makeTo = (path = '/dictionary') => ({ path, fullPath: path })

beforeEach(async () => {
  vi.resetModules()
  ;(globalThis as any).defineNuxtRouteMiddleware = (fn: any) => fn
  navigateToMock = vi.fn()
  store = { isAuthenticated: { value: true } }
  useAuthReturn = {
    canAccessFeatures: { value: true },
    isInGracePeriod: { value: false }
  }

  // Mock sessionStorage
  const storage: Record<string, string> = {}
  vi.stubGlobal('sessionStorage', {
    setItem: (k: string, v: string) => { storage[k] = v },
    getItem: (k: string) => storage[k]
  } as any)
  middleware = (await import('./subscription')).default
})

describe('middleware/subscription', () => {
  it('redirects unauthenticated users to login with return', async () => {
    store.isAuthenticated.value = false
    await middleware(makeTo('/protected'))
    expect(navigateToMock).toHaveBeenCalledWith('/auth/login?return=%2Fprotected')
  })

  it('allows grace period and stores attempted route', async () => {
    useAuthReturn.isInGracePeriod.value = true
    await middleware(makeTo('/dictionary'))
    expect(navigateToMock).not.toHaveBeenCalled()
    expect(sessionStorage.getItem('attempted-route')).toBe('/dictionary')
  })

  it('blocks expired users and redirects to plans', async () => {
    useAuthReturn.canAccessFeatures.value = false
    await middleware(makeTo('/dictionary'))
    expect(navigateToMock).toHaveBeenCalledWith('/subscription/plans?source=access-denied')
    expect(sessionStorage.getItem('attempted-route')).toBe('/dictionary')
  })

  it('does nothing when access is allowed', async () => {
    await middleware(makeTo('/dictionary'))
    expect(navigateToMock).not.toHaveBeenCalled()
  })
})
