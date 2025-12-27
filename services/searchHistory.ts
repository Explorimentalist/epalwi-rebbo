import { ref } from 'vue'
import { track } from '~/utils/telemetry'

export type SearchLang = 'español' | 'ndowe'
export interface SearchHistoryItem {
  query: string
  language: SearchLang
  ts: number
}

const MAX_ITEMS = 50

export const useSearchHistory = () => {
  const auth = useAuthStore()
  const list = ref<SearchHistoryItem[]>([])
  const hasSearchedBefore = ref(false)

  const keyFor = (item: SearchHistoryItem) => `${item.language}:${item.query}`

  const load = async () => {
    const uid = (auth as any).user?.value?.uid || 'guest'
    // local cache
    try {
      const { indexedDBService } = await import('~/services/indexedDB')
      const cached = await indexedDBService.getUserSearchHistory(uid)
      if (cached && Array.isArray(cached)) list.value = cached
    } catch {}

    // Has searched flag (UI)
    try { hasSearchedBefore.value = Boolean(localStorage.getItem('dictionary-has-searched')) } catch {}

    // Remote merge if signed-in
    const isSignedIn = Boolean((auth as any).isAuthenticated?.value)
    if (isSignedIn) {
      try {
        // Fetch search history from API
        const response = await $fetch<{ success: boolean; searches: SearchHistoryItem[] }>('/api/search-history', {
          method: 'GET'
        })

        if (response.success && response.searches) {
          const remote = response.searches

          // Merge local + remote by newest timestamp
          const map = new Map<string, SearchHistoryItem>()
          for (const it of [...remote, ...list.value]) {
            const k = keyFor(it)
            const prev = map.get(k)
            if (!prev || prev.ts < it.ts) map.set(k, it)
          }
          list.value = Array.from(map.values()).sort((a, b) => b.ts - a.ts).slice(0, MAX_ITEMS)
          track('history.merged', { count: list.value.length })

          // Persist cache
          try {
            const { indexedDBService } = await import('~/services/indexedDB')
            await indexedDBService.setUserSearchHistory(uid, list.value)
          } catch {}
        }
      } catch (e) {
        // ignore remote failures
      }
    }
  }

  const add = async (queryText: string, language: SearchLang) => {
    const item: SearchHistoryItem = { query: queryText, language, ts: Date.now() }
    // Dedupe in list
    const existingIdx = list.value.findIndex(x => x.query === item.query && x.language === item.language)
    if (existingIdx >= 0) list.value.splice(existingIdx, 1)
    list.value.unshift(item)
    if (list.value.length > MAX_ITEMS) list.value = list.value.slice(0, MAX_ITEMS)

    // Save flag
    try { localStorage.setItem('dictionary-has-searched', 'true') } catch {}
    hasSearchedBefore.value = true

    // Persist local
    try {
      const uid = (auth as any).user?.value?.uid || 'guest'
      const { indexedDBService } = await import('~/services/indexedDB')
      await indexedDBService.setUserSearchHistory(uid, list.value)
    } catch {}

    // Persist remote if signed-in
    const isSignedIn = Boolean((auth as any).isAuthenticated?.value)
    if (isSignedIn) {
      try {
        await $fetch('/api/search-history', {
          method: 'POST',
          body: item
        })
      } catch {}
    }
  }

  const clear = async () => {
    list.value = []
    try {
      const uid = (auth as any).user?.value?.uid || 'guest'
      const { indexedDBService } = await import('~/services/indexedDB')
      await indexedDBService.setUserSearchHistory(uid, list.value)
    } catch {}
  }

  return { list, hasSearchedBefore, load, add, clear }
}
