/**
 * useDictionary Composable
 * Provides real dictionary search functionality using the search services
 * Integrates with IndexedDB for offline support and SearchService for fast queries
 */

import { ref, computed, onMounted, readonly } from 'vue'
import type { 
  DictionaryEntry,
  SearchResult,
  SearchQuery,
  DictionaryLanguage,
  SearchMode,
  AutocompleteSuggestion,
  TranslationResult,
  TranslationDirection
} from '~/types/dictionary'

export const useDictionary = () => {
  // State
  const isReady = ref(false)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const currentLanguage = ref<DictionaryLanguage>('español')
  const searchQuery = ref('')
  const searchResults = ref<SearchResult[]>([])
  const suggestions = ref<AutocompleteSuggestion[]>([])
  const hasSearched = ref(false)
  const totalEntries = ref(0)
  
  // Search service instances
  let searchService: any = null
  let indexedDBService: any = null
  
  // Initialize dictionary services
  const initialize = async () => {
    // Only initialize on client side
    if (process.server) return
    
    // Guard: block initialization for expired users (no active/trial/grace)
    try {
      const { canAccessFeatures, isInGracePeriod } = useAuth()
      if (!canAccessFeatures.value && !isInGracePeriod.value) {
        error.value = 'subscription-required'
        isReady.value = false
        return
      }
    } catch (_) {
      // If auth composable is unavailable, proceed (route/middleware should still protect)
    }
    
    try {
      isLoading.value = true
      error.value = null
      
      console.log('🚀 Initializing dictionary services...')
      
      // Import services dynamically to avoid SSR issues
      const { SearchService } = await import('~/services/search')
      const { IndexedDBService } = await import('~/services/indexedDB')
      
      searchService = new SearchService()
      indexedDBService = new IndexedDBService()
      
      // Initialize IndexedDB
      await indexedDBService.initialize()
      
      // Wait for auth to be ready before loading dictionary data
      console.log('🔧 Waiting for auth initialization...')
      const authStore = useAuthStore()
      let attempts = 0
      const maxAttempts = 20 // Max 10 seconds wait (500ms * 20)
      
      while (!authStore['sessionToken'] && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 500))
        attempts++
        if (attempts % 4 === 0) { // Log every 2 seconds
          console.log(`🔧 Still waiting for auth... (${attempts}/${maxAttempts})`)
        }
      }
      
      if (authStore['sessionToken']) {
        console.log('✅ Auth ready, proceeding with dictionary load...')
      } else {
        console.warn('⚠️ Auth not ready after 10s, proceeding anyway...')
      }
      
      // Load dictionary data
      const dictionaryData = await loadDictionaryData()
      
      // Initialize search service with enhanced entries
      const enhancedEntries = await indexedDBService.getEnhancedEntries()
      await searchService.initialize(enhancedEntries)
      
      totalEntries.value = enhancedEntries.length
      isReady.value = true
      
      console.log('✅ Dictionary service initialized successfully')
      
    } catch (err: any) {
      error.value = err.message || 'Failed to initialize dictionary'
      console.error('❌ Dictionary initialization failed:', err)
    } finally {
      isLoading.value = false
    }
  }
  
  // Load dictionary data (from API or cache)
  const loadDictionaryData = async () => {
    try {
      // Guard: prevent offline/cache usage for expired users
      try {
        const { canAccessFeatures, isInGracePeriod } = useAuth()
        if (!canAccessFeatures.value && !isInGracePeriod.value) {
          throw new Error('subscription-required')
        }
      } catch (_) {
        // no-op if auth not available
      }
      // Try to get from IndexedDB first
      const cachedData = await indexedDBService.loadDictionaryData()
      if (cachedData) {
        console.log('📖 Using cached dictionary data')
        return cachedData
      }
      
      // Fallback to API (only if $fetch is available)
      if (typeof $fetch === 'function') {
        console.log('🌐 Loading dictionary data from API')
        
        // Get authentication headers
        const headers: Record<string, string> = {}
        try {
          console.log('=== TOKEN CHECK DURING DICTIONARY CALL ===')
          console.log('🔧 SessionStorage keys:', Object.keys(sessionStorage))
          
          // Read directly from sessionStorage instead of reactive store
          const sessionToken = sessionStorage.getItem('auth-session-token')
          const authUser = sessionStorage.getItem('auth-user')
          
          console.log('🔧 Token at dictionary time:', sessionToken ? `${sessionToken.substring(0, 20)}...` : 'NULL')
          console.log('🔧 User at dictionary time:', authUser ? 'PRESENT' : 'NULL')
          console.log('🔧 Token length:', sessionToken?.length || 0)
          
          if (sessionToken) {
            headers['Authorization'] = `Bearer ${sessionToken}`
            console.log('🔐 Added auth header to dictionary API request')
            console.log('🔧 Headers being sent:', Object.keys(headers))
          } else {
            console.warn('⚠️ No session token found in sessionStorage')
            console.warn('⚠️ Available storage keys:', Object.keys(sessionStorage))
          }
        } catch (e) {
          console.warn('Failed to get authentication token:', e)
        }
        
        const response = await $fetch('/api/dictionary', { headers })
        
        if (response.success && response.data) {
          // Store in IndexedDB for offline use
          await indexedDBService.storeDictionaryData(response.data)
          return response.data
        } else {
          throw new Error('Failed to load dictionary data')
        }
      } else {
        throw new Error('$fetch not available')
      }
      
    } catch (err: any) {
      console.error('❌ Failed to load dictionary data:', err)
      throw new Error('No dictionary data available')
    }
  }
  
  // Perform search
  const search = async (query: string, mode: SearchMode = 'hybrid') => {
    // Access guard: expired users get no results
    try {
      const { canAccessFeatures, isInGracePeriod } = useAuth()
      if (!canAccessFeatures.value && !isInGracePeriod.value) {
        error.value = 'subscription-required'
        searchResults.value = []
        hasSearched.value = false
        return []
      }
    } catch (_) {}

    if (!isReady.value || !searchService) {
      console.warn('Dictionary service not initialized, using fallback')
      // Return empty results instead of throwing error
      searchResults.value = []
      hasSearched.value = true
      return []
    }
    
    if (!query.trim()) {
      searchResults.value = []
      hasSearched.value = false
      return []
    }
    
    try {
      isLoading.value = true
      error.value = null
      
      const searchQuery: SearchQuery = {
        query: query.trim(),
        language: currentLanguage.value,
        mode,
        limit: 50,
        includeExplanations: true,
        includeCrossReferences: true
      }
      
      const results = await searchService.search(searchQuery)
      searchResults.value = results
      hasSearched.value = true
      
      return results
      
    } catch (err: any) {
      error.value = err.message || 'Search failed'
      searchResults.value = []
      return []
    } finally {
      isLoading.value = false
    }
  }
  
  // Get autocomplete suggestions
  const getSuggestions = async (query: string) => {
    // Access guard
    try {
      const { canAccessFeatures, isInGracePeriod } = useAuth()
      if (!canAccessFeatures.value && !isInGracePeriod.value) {
        error.value = 'subscription-required'
        suggestions.value = []
        return []
      }
    } catch (_) {}

    if (!isReady.value || !searchService || !query.trim()) {
      suggestions.value = []
      return []
    }
    
    try {
      const newSuggestions = await searchService.autocomplete(
        query.trim(), 
        currentLanguage.value
      )
      
      suggestions.value = newSuggestions
      return newSuggestions
      
    } catch (err: any) {
      console.error('❌ Autocomplete failed:', err)
      suggestions.value = []
      return []
    }
  }

  // Convert search results to translation results for ResultCard
  const getTranslationResults = computed(() => {
    return searchResults.value.map(result => {
      const entry = result.entry
      
      // Determine translation direction
      const translationDirection: TranslationDirection = 
        currentLanguage.value === 'español' ? 'spanish-to-ndowe' : 'ndowe-to-spanish'
      
      // Create translation result
      const translationResult: TranslationResult = {
        id: entry.id,
        sourceWord: currentLanguage.value === 'español' 
          ? (result.sourceOverride || entry.español) 
          : entry.ndoweText,
        targetWord: currentLanguage.value === 'español' ? entry.ndoweText : entry.español,
        sourceLanguage: currentLanguage.value,
        targetLanguage: currentLanguage.value === 'español' ? 'ndowe' : 'español',
        examples: entry.explicación?.map(exp => ({
          source: exp,
          target: exp // For now, same text in both languages
        })) || []
      }
      
      return translationResult
    })
  })
  
  // Clear search
  const clearSearch = () => {
    searchQuery.value = ''
    searchResults.value = []
    suggestions.value = []
    hasSearched.value = false
    error.value = null
  }
  
  // Change language
  const setLanguage = (language: DictionaryLanguage) => {
    currentLanguage.value = language
    clearSearch()
  }
  
  // Get search placeholder based on current language
  const searchPlaceholder = computed(() => {
    return currentLanguage.value === 'español' 
      ? 'Buscar palabra en español...' 
      : 'Buscar palabra en ndowe...'
  })
  
  // Initialize on mount
  onMounted(() => {
    initialize()
  })
  
  return {
    // State
    isReady: readonly(isReady),
    isLoading: readonly(isLoading),
    error: readonly(error),
    currentLanguage: readonly(currentLanguage),
    searchQuery,
    searchResults: readonly(searchResults),
    suggestions: readonly(suggestions),
    hasSearched: readonly(hasSearched),
    totalEntries: readonly(totalEntries),
    
    // Computed
    translationResults: getTranslationResults,
    searchPlaceholder,
    
    // Methods
    search,
    getSuggestions,
    clearSearch,
    setLanguage,
    initialize
  }
} 
