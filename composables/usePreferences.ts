import { ref, computed, watch } from 'vue'
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { getFirebaseDb } from '~/services/firebase'
import type { UserPreferences } from '~/types/auth'
import { track } from '~/utils/telemetry'

const DEFAULT_PREFS: UserPreferences = {
  defaultLanguage: 'español',
  darkMode: false
}

export const usePreferences = () => {
  const auth = useAuthStore()
  const prefs = ref<UserPreferences>({ ...DEFAULT_PREFS })
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const pending = ref<Array<{ uid: string, data: UserPreferences }>>([])
  const pendingCount = computed(() => pending.value.length)

  const isAuthenticated = computed(() => (auth as any).isAuthenticated?.value ?? false)
  const currentUser = computed(() => (auth as any).user?.value ?? null)

  const loadPreferences = async (): Promise<UserPreferences> => {
    error.value = null

    try {
      isLoading.value = true
      const uid = currentUser.value?.uid || 'guest'

      // First, try cache
      try {
        const { indexedDBService } = await import('~/services/indexedDB')
        const cached = await indexedDBService.getUserPreferences(uid)
        if (cached?.data) {
          prefs.value = { ...DEFAULT_PREFS, ...cached.data }
        } else {
          prefs.value = { ...DEFAULT_PREFS }
        }
      } catch {}

      // Then, try Firestore
      const isSignedIn = currentUser.value?.uid && (auth as any).isAuthenticated?.value
      if (isSignedIn) {
        try {
          const db = getFirebaseDb()
          const userRef = doc(db, 'users', currentUser.value!.uid)
          const snap = await getDoc(userRef)
          const data: any = snap.exists() ? snap.data() : null
          const remotePrefs = data?.preferences || null
          let remoteUpdatedAt = 0
          try {
            const ts = data?.preferencesUpdatedAt
            if (ts?.toDate) remoteUpdatedAt = ts.toDate().getTime()
            else if (typeof ts === 'number') remoteUpdatedAt = ts
          } catch {}

          // Load local updatedAt
          let localUpdatedAt = 0
          try {
            const { indexedDBService } = await import('~/services/indexedDB')
            const cached = await indexedDBService.getUserPreferences(currentUser.value!.uid)
            localUpdatedAt = cached?.updatedAt ?? 0
          } catch {}

          // Last-write-wins
          if (remotePrefs && remoteUpdatedAt >= localUpdatedAt) {
            prefs.value = { ...DEFAULT_PREFS, ...remotePrefs }
            try {
              const { indexedDBService } = await import('~/services/indexedDB')
              await indexedDBService.setUserPreferences(currentUser.value!.uid, prefs.value, remoteUpdatedAt)
            } catch {}
            track('prefs.load', { source: 'remote', merged: true })
          } else {
            // Local is newer or only local exists -> ensure cache is saved; Firestore update is handled in updatePreferences
            try {
              const { indexedDBService } = await import('~/services/indexedDB')
              await indexedDBService.setUserPreferences(currentUser.value!.uid, prefs.value, localUpdatedAt || Date.now())
            } catch {}
            track('prefs.load', { source: 'cache', merged: true })
          }
        } catch {}
      } else {
        // guest cache already loaded; ensure it is persisted with timestamp
        try {
          const { indexedDBService } = await import('~/services/indexedDB')
          await indexedDBService.setUserPreferences('guest', prefs.value, Date.now())
        } catch {}
        track('prefs.load', { source: 'guest' })
      }

      return prefs.value
    } catch (e: any) {
      error.value = e?.message || 'Failed to load preferences'
      return prefs.value
    } finally {
      isLoading.value = false
    }
  }

  const updatePreferences = async (partial: Partial<UserPreferences>) => {
    error.value = null
    const uid = currentUser.value?.uid
    const next = { ...prefs.value, ...partial }
    prefs.value = next

    track('prefs.update', { keys: Object.keys(partial) })
    // Update Firestore if authenticated
    if (uid) {
      try {
        const db = getFirebaseDb()
        const userRef = doc(db, 'users', uid)
        await updateDoc(userRef, { preferences: next, preferencesUpdatedAt: serverTimestamp() })
      } catch (e) {
        // Enqueue for retry (offline or transient failure)
        try { pending.value.push({ uid, data: next }) } catch {}
      }

      // Update cache
      try {
        const { indexedDBService } = await import('~/services/indexedDB')
        await indexedDBService.setUserPreferences(uid, next, Date.now())
      } catch {}
    }
  }

  const flushPending = async () => {
    if (!pending.value.length) return
    const db = getFirebaseDb()
    const rest: typeof pending.value = []
    for (const item of pending.value) {
      try {
        const userRef = doc(db, 'users', item.uid)
        await updateDoc(userRef, { preferences: item.data, preferencesUpdatedAt: serverTimestamp() })
      } catch {
        rest.push(item)
      }
    }
    pending.value = rest
  }

  const migrateGuestPreferences = async () => {
    try {
      const uid = currentUser.value?.uid
      if (!uid) return
      const { indexedDBService } = await import('~/services/indexedDB')
      const guest = await indexedDBService.getUserPreferences('guest')
      if (!guest || !guest.data) return

      // Fetch remote timestamp
      let remoteUpdatedAt = 0
      try {
        const db = getFirebaseDb()
        const userRef = doc(db, 'users', uid)
        const snap = await getDoc(userRef)
        const data: any = snap.exists() ? snap.data() : null
        const ts = data?.preferencesUpdatedAt
        if (ts?.toDate) remoteUpdatedAt = ts.toDate().getTime()
        else if (typeof ts === 'number') remoteUpdatedAt = ts
      } catch {}

      if ((guest.updatedAt ?? 0) >= remoteUpdatedAt) {
        // Guest wins -> write to Firestore
        try {
          const db = getFirebaseDb()
          const userRef = doc(db, 'users', uid)
          await updateDoc(userRef, { preferences: guest.data, preferencesUpdatedAt: serverTimestamp() })
          // Update local cache for user
          await indexedDBService.setUserPreferences(uid, guest.data, guest.updatedAt ?? Date.now())
        } catch {}
        track('prefs.migrate', { strategy: 'guest-wins' })
      }

      // Clear guest cache to avoid reapplying
      try { await indexedDBService.setUserPreferences('guest', {}, 0) } catch {}
    } catch {}
  }

  // Auto-migrate when a user signs in
  if (process.client) {
    watch(() => currentUser.value?.uid, (newUid, oldUid) => {
      if (newUid && !oldUid) migrateGuestPreferences()
    })
  }

  return {
    prefs,
    isLoading,
    error,
    isAuthenticated,
    currentUser,
    loadPreferences,
    updatePreferences,
    flushPending,
    migrateGuestPreferences,
    pendingCount
  }
}
