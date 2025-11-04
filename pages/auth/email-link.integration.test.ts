import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

vi.mock('~/services/firebase', () => ({
  getFirebaseAuth: () => ({})
}))

const isSignInWithEmailLinkMock = vi.fn()
const signInWithEmailLinkMock = vi.fn()

vi.mock('firebase/auth', () => ({
  isSignInWithEmailLink: (...args: any[]) => isSignInWithEmailLinkMock(...args),
  signInWithEmailLink: (...args: any[]) => signInWithEmailLinkMock(...args)
}))

import { useAuthStore } from '~/stores/auth'

describe('Auth store - post-sign-in integration', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    isSignInWithEmailLinkMock.mockReset()
    signInWithEmailLinkMock.mockReset()

    // Runtime config: production path (no dev mock)
    // @ts-ignore
    global.useRuntimeConfig = () => ({ public: { appUrl: 'http://localhost:3000', devAuthMock: false } })

    // Local storage stub
    const mem = new Map<string, string>()
    // @ts-ignore
    global.localStorage = {
      setItem: (k: string, v: string) => { mem.set(k, v) },
      getItem: (k: string) => mem.get(k) ?? null,
      removeItem: (k: string) => { mem.delete(k) },
      clear: () => { mem.clear() }
    }

    // $fetch stub
    // @ts-ignore
    global.$fetch = vi.fn(async (_url: string, opts: any) => {
      // Require Authorization header to be present
      if (!opts?.headers?.Authorization) throw new Error('missing auth header')
      return {
        success: true,
        claimsUpdated: true,
        user: {
          uid: 'uid1',
          email: 'complete@example.com',
          role: 'user',
          createdAt: new Date(),
          lastLoginAt: new Date(),
          subscription: { status: 'trial' },
          trial: { startDate: new Date(), endDate: new Date(Date.now()+1000), daysRemaining: 1, isExpired: false },
          emailVerified: true,
          isActive: true
        }
      }
    })
  })

  it('calls post-sign-in and sets user with refreshed token', async () => {
    const store = useAuthStore()
    isSignInWithEmailLinkMock.mockReturnValueOnce(true)
    // Mock Firebase sign-in returning credential with user incl. getIdToken
    const getIdToken = vi.fn().mockResolvedValue('idtoken123')
    signInWithEmailLinkMock.mockResolvedValueOnce({ user: { uid: 'uid1', email: 'complete@example.com', emailVerified: true, getIdToken } })
    localStorage.setItem('emailForSignIn', 'complete@example.com')

    const res = await store.completeEmailLink('http://localhost/auth/verify?oobCode=abc')
    expect(res.success).toBe(true)
    // @ts-ignore
    expect(global.$fetch).toHaveBeenCalled()
    // First call before POST (to send Authorization), second call when claimsUpdated=true
    expect(getIdToken).toHaveBeenCalledTimes(2)
    expect(getIdToken).toHaveBeenCalledWith(true)
  })
})
