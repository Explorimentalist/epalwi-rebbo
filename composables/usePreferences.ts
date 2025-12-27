import { ref, computed, watch } from 'vue'
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

      // Then, try API to fetch preferences
      const isSignedIn = currentUser.value?.uid && (auth as any).isAuthenticated?.value
      if (isSignedIn) {
        try {
          const response = await $fetch<{ success: boolean; preferences?: UserPreferences; updatedAt?: string }>('/api/preferences', {
            method: 'GET'
          })

          if (response.success && response.preferences) {
            const remotePrefs = response.preferences
            const remoteUpdatedAt = response.updatedAt ? new Date(response.updatedAt).getTime() : 0

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
              // Local is newer or only local exists -> ensure cache is saved
              try {
                const { indexedDBService } = await import('~/services/indexedDB')
                await indexedDBService.setUserPreferences(currentUser.value!.uid, prefs.value, localUpdatedAt || Date.now())
              } catch {}
              track('prefs.load', { source: 'cache', merged: true })
            }
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
    // Update via API if authenticated
    if (uid) {
      try {
        await $fetch('/api/preferences', {
          method: 'PATCH',
          body: { preferences: next }
        })
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
    const rest: typeof pending.value = []
    for (const item of pending.value) {
      try {
        await $fetch('/api/preferences', {
          method: 'PATCH',
          body: { preferences: item.data }
        })
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
        const response = await $fetch<{ success: boolean; preferences?: UserPreferences; updatedAt?: string }>('/api/preferences', {
          method: 'GET'
        })

        if (response.success && response.updatedAt) {
          remoteUpdatedAt = new Date(response.updatedAt).getTime()
        }
      } catch {}

      if ((guest.updatedAt ?? 0) >= remoteUpdatedAt) {
        // Guest wins -> write via API
        try {
          await $fetch('/api/preferences', {
            method: 'PATCH',
            body: { preferences: guest.data }
          })
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
