// @ts-nocheck
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Provide Nuxt runtime stubs
;(globalThis as any).defineNuxtRouteMiddleware = (fn: any) => fn

let navigateToMock = vi.fn()
vi.stubGlobal('navigateTo', (...args: any[]) => navigateToMock(...args))

let initializeAuthMock = vi.fn()
let store: any

vi.stubGlobal('useAuthStore', () => store)

let middleware: any

const makeTo = (meta: any = {}, path = '/protected'): any => ({ meta, path, fullPath: path })

beforeEach(async () => {
  vi.resetModules()
  ;(globalThis as any).defineNuxtRouteMiddleware = (fn: any) => fn
  navigateToMock = vi.fn()
  initializeAuthMock = vi.fn().mockResolvedValue(undefined)
  store = {
    initialized: { value: false },
    isAuthenticated: { value: false },
    initializeAuth: initializeAuthMock
  }
  middleware = (await import('./auth.global')).default
})

describe('middleware/auth.global', () => {
  it('initializes auth store when not initialized', async () => {
    await middleware(makeTo())
    expect(initializeAuthMock).toHaveBeenCalled()
  })

  it('redirects unauthenticated users when route requires auth', async () => {
    await middleware(makeTo({ authRequired: true }, '/account'))
    expect(navigateToMock).toHaveBeenCalledWith('/auth/login?return=%2Faccount')
  })

  it('does not redirect on /auth routes', async () => {
    await middleware(makeTo({ authRequired: true }, '/auth/login'))
    expect(navigateToMock).not.toHaveBeenCalled()
  })
})
