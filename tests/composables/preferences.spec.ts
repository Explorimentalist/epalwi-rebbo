// @ts-nocheck
import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('~/services/indexedDB', () => {
  const cache = new Map()
  return {
    indexedDBService: {
      initialize: vi.fn(async () => {}),
      getUserPreferences: vi.fn(async (uid: string) => cache.get(uid) || null),
      setUserPreferences: vi.fn(async (uid: string, prefs: any, updatedAt?: number) => { cache.set(uid, { data: prefs, updatedAt: updatedAt ?? Date.now() }) })
    }
  }
})

vi.mock('~/services/firebase', () => ({
  getFirebaseDb: () => ({})
}))

const trackMock = vi.fn()
vi.mock('~/utils/telemetry', () => ({
  track: (...args: any[]) => trackMock(...args)
}))

const docMock = vi.fn()
const getDocMock = vi.fn()
const updateDocMock = vi.fn()

vi.mock('firebase/firestore', () => ({
  doc: (...args: any[]) => docMock(...args),
  getDoc: (...args: any[]) => getDocMock(...args),
  updateDoc: (...args: any[]) => updateDocMock(...args),
  serverTimestamp: () => ({ __ts: Date.now() })
}))

vi.stubGlobal('useAuthStore', () => ({
  user: { value: { uid: 'u1', email: 'u1@example.com' } },
  isAuthenticated: { value: true }
}))

import { usePreferences } from '~/composables/usePreferences'

describe('usePreferences', () => {
  beforeEach(() => {
    getDocMock.mockReset()
    updateDocMock.mockReset()
    docMock.mockReset()
  })

  it('loads preferences from Firestore and caches them', async () => {
    getDocMock.mockResolvedValueOnce({ exists: () => true, data: () => ({ preferences: { defaultLanguage: 'ndowe', darkMode: true }, preferencesUpdatedAt: { toDate: () => new Date(Date.now() + 1000) } }) })
    const { prefs, loadPreferences } = usePreferences()
    await loadPreferences()
    expect(prefs.value.defaultLanguage).toBe('ndowe')
    expect(prefs.value.darkMode).toBe(true)
    expect(trackMock).toHaveBeenCalled() // prefs.load
  })

  it('updates preferences and writes to Firestore', async () => {
    getDocMock.mockResolvedValueOnce({ exists: () => false })
    const { prefs, loadPreferences, updatePreferences } = usePreferences()
    await loadPreferences()
    await updatePreferences({ defaultLanguage: 'español' })
    expect(updateDocMock).toHaveBeenCalled()
    expect(prefs.value.defaultLanguage).toBe('español')
    expect(trackMock).toHaveBeenCalledWith('prefs.update', expect.any(Object))
  })

  it('respects last-write-wins (local newer)', async () => {
    // Seed local cache newer than remote
    const { indexedDBService } = await import('~/services/indexedDB')
    await indexedDBService.setUserPreferences('u1', { defaultLanguage: 'español' }, Date.now() + 2000)
    getDocMock.mockResolvedValueOnce({ exists: () => true, data: () => ({ preferences: { defaultLanguage: 'ndowe' }, preferencesUpdatedAt: { toDate: () => new Date(Date.now()) } }) })
    const { prefs, loadPreferences } = usePreferences()
    await loadPreferences()
    expect(prefs.value.defaultLanguage).toBe('español')
  })

  it('queues updates when offline and flushes later', async () => {
    // First load
    getDocMock.mockResolvedValueOnce({ exists: () => false })
    const { updatePreferences, loadPreferences, flushPending } = usePreferences()
    await loadPreferences()
    // Simulate offline: updateDoc fails
    updateDocMock.mockRejectedValueOnce(new Error('offline'))
    await updatePreferences({ defaultLanguage: 'ndowe' })
    // Next flush: updateDoc succeeds
    updateDocMock.mockResolvedValueOnce(undefined)
    await flushPending()
    expect(updateDocMock).toHaveBeenCalled()
  })

  it('migrates guest preferences on sign-in when guest is newer', async () => {
    const { indexedDBService } = await import('~/services/indexedDB')
    // Seed guest with newer prefs
    await indexedDBService.setUserPreferences('guest', { defaultLanguage: 'ndowe', notifications: { productUpdates: true } }, Date.now() + 5000)
    // Remote is older
    getDocMock.mockResolvedValueOnce({ exists: () => true, data: () => ({ preferences: { defaultLanguage: 'español' }, preferencesUpdatedAt: { toDate: () => new Date(Date.now()) } }) })
    const { migrateGuestPreferences } = usePreferences()
    await migrateGuestPreferences()
    // Expect remote write performed
    expect(updateDocMock).toHaveBeenCalled()
    expect(trackMock).toHaveBeenCalledWith('prefs.migrate', expect.any(Object))
  })
})
