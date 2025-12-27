import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

vi.mock('~/services/firebase', () => ({
  getFirebaseAuth: () => ({})
}))

const sendSignInLinkToEmailMock = vi.fn()
const isSignInWithEmailLinkMock = vi.fn()
const signInWithEmailLinkMock = vi.fn()

vi.mock('firebase/auth', () => ({
  sendSignInLinkToEmail: (...args: any[]) => sendSignInLinkToEmailMock(...args),
  isSignInWithEmailLink: (...args: any[]) => isSignInWithEmailLinkMock(...args),
  signInWithEmailLink: (...args: any[]) => signInWithEmailLinkMock(...args)
}))

const trackMock = vi.fn()
vi.mock('~/utils/telemetry', () => ({ track: (...args: any[]) => trackMock(...args) }))
import { useAuthStore } from '~/stores/auth'

describe.skip('Auth store - Firebase Email Link (deprecated - replaced by JWT magic links)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    sendSignInLinkToEmailMock.mockReset()
    isSignInWithEmailLinkMock.mockReset()
    signInWithEmailLinkMock.mockReset()
    // Minimal runtime config and storage stubs
    // @ts-ignore
    global.useRuntimeConfig = () => ({ public: { appUrl: 'http://localhost:3000', devAuthMock: true } })
    const mem = new Map<string, string>()
    // @ts-ignore
    global.localStorage = {
      setItem: (k: string, v: string) => { mem.set(k, v) },
      getItem: (k: string) => mem.get(k) ?? null,
      removeItem: (k: string) => { mem.delete(k) },
      clear: () => { mem.clear() }
    }
  })

  it('sends email link and stores email', async () => {
    const store = useAuthStore()
    sendSignInLinkToEmailMock.mockResolvedValueOnce(undefined)

    const res = await store.sendEmailLink('test@example.com', '/dictionary')
    expect(res.success).toBe(true)
    expect(sendSignInLinkToEmailMock).toHaveBeenCalled()
    const [, , settings] = sendSignInLinkToEmailMock.mock.calls[0]
    expect(settings.url).toContain('/auth/verify')
    expect(settings.url).toContain('return=%2Fdictionary')
    expect(localStorage.getItem('emailForSignIn')).toBe('test@example.com')
    expect(trackMock).toHaveBeenCalled()
  })

  it('completes email link with stored email', async () => {
    const store = useAuthStore()
    isSignInWithEmailLinkMock.mockReturnValueOnce(true)
    // Mock Firebase sign-in returning credential with user
    signInWithEmailLinkMock.mockResolvedValueOnce({ user: { uid: 'uid1', email: 'test@example.com', emailVerified: true } })
    localStorage.setItem('emailForSignIn', 'test@example.com')

    const res = await store.completeEmailLink('http://localhost/auth/verify?oobCode=abc')
    expect(res.success).toBe(true)
    expect(signInWithEmailLinkMock).toHaveBeenCalled()
    expect(localStorage.getItem('emailForSignIn')).toBeNull()
    expect(trackMock).toHaveBeenCalled()
  })

  it('errors when no email available to complete link', async () => {
    const store = useAuthStore()
    isSignInWithEmailLinkMock.mockReturnValueOnce(true)
    const res = await store.completeEmailLink('http://localhost/auth/verify?oobCode=abc')
    expect(res.success).toBe(false)
    expect(res.message).toBeTruthy()
  })
})
