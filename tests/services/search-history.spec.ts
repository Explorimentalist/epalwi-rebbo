// @ts-nocheck
import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('~/services/indexedDB', () => {
  const store = new Map()
  return {
    indexedDBService: {
      getUserSearchHistory: vi.fn(async (uid: string) => store.get(uid) || []),
      setUserSearchHistory: vi.fn(async (uid: string, items: any[]) => { store.set(uid, items) })
    }
  }
})

vi.mock('~/services/firebase', () => ({
  getFirebaseDb: () => ({})
}))

const addDocMock = vi.fn()
const getDocsMock = vi.fn()
const collectionMock = vi.fn()
const queryMock = vi.fn()
const orderByMock = vi.fn()
const limitMock = vi.fn()

vi.mock('firebase/firestore', () => ({
  collection: (...args: any[]) => collectionMock(...args),
  addDoc: (...args: any[]) => addDocMock(...args),
  getDocs: (...args: any[]) => getDocsMock(...args),
  orderBy: (...args: any[]) => orderByMock(...args),
  limit: (...args: any[]) => limitMock(...args),
  query: (...args: any[]) => queryMock(...args)
}))

const trackMock = vi.fn()
vi.mock('~/utils/telemetry', () => ({ track: (...args: any[]) => trackMock(...args) }))

vi.stubGlobal('useAuthStore', () => ({
  user: { value: { uid: 'u1' } },
  isAuthenticated: { value: true }
}))

import { useSearchHistory } from '~/services/searchHistory'

describe('searchHistory service', () => {
  beforeEach(() => {
    addDocMock.mockReset()
    getDocsMock.mockReset()
    collectionMock.mockReset()
    queryMock.mockReset()
    orderByMock.mockReset()
    limitMock.mockReset()
  })

  it('merges remote and local by latest timestamp', async () => {
    // Remote returns an older item for same key
    getDocsMock.mockResolvedValueOnce({ forEach: (cb: any) => {
      cb({ data: () => ({ query: 'hola', language: 'español', ts: 100 }) })
    }})
    const { list, load, add } = useSearchHistory()
    // Local has newer
    await add('hola', 'español') // creates ts ~ now
    const localTs = list.value[0].ts
    await load()
    expect(list.value[0].query).toBe('hola')
    expect(list.value[0].ts).toBeGreaterThanOrEqual(localTs)
    expect(trackMock).toHaveBeenCalled()
  })

  it('adds and truncates to max size', async () => {
    const { list, add } = useSearchHistory()
    for (let i = 0; i < 60; i++) {
      await add('q' + i, 'español')
    }
    expect(list.value.length).toBeLessThanOrEqual(50)
  })
})
