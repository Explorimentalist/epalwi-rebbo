/**
 * Dictionary Composable
 * Vue 3 composable providing reactive dictionary functionality
 * Integrates IndexedDB caching, search service, and network API
 */

import { ref, computed, reactive, watch, nextTick, toRef } from 'vue'
import { indexedDBService } from '~/services/indexedDB'
import { searchService } from '~/services/search'
import type { 
  DictionaryData,
  DictionaryEntry,
  SearchResult,
  SearchQuery,
  DictionaryLanguage,
  SearchMode,
  AutocompleteSuggestion,
  CacheMetadata,
  DictionaryError,
  UseDictionaryReturn,
  DictionaryApiResponse
} from '~/types/dictionary'

/**
 * Composable configuration
 */
const COMPOSABLE_CONFIG = {
  // Cache settings
  CACHE_CHECK_INTERVAL: 5 * 60 * 1000, // 5 minutes
  SEARCH_DEBOUNCE_MS: 300,
  HISTORY_MAX_ITEMS: 50,
  
  // Default search settings
  DEFAULT_SEARCH_LIMIT: 20,
  DEFAULT_SEARCH_MODE: 'hybrid' as SearchMode,
  
  // Local storage keys
  STORAGE_KEYS: {
    CURRENT_LANGUAGE: 'epalwi-current-language',
    SEARCH_HISTORY: 'epalwi-search-history',
    USER_PREFERENCES: 'epalwi-preferences'
  }
} as const

/**
 * Global state management for dictionary
 */
const globalState = reactive({
  initialized: false,
  isLoading: false,
  error: null as string | null,
  data: null as DictionaryData | null,
  entries: [] as DictionaryEntry[],
  index: null as any,
  cache: null as CacheMetadata | null
})

// Global initialization promise to prevent multiple initializations
let initializationPromise: Promise<void> | null = null

/**
 * Dictionary composable function
 */
export function useDictionary(): UseDictionaryReturn {
  // Reactive state
  const currentLanguage = ref<DictionaryLanguage>('español')
  const searchHistory = ref<string[]>([])
  const lastSearchQuery = ref<string>('')
  const lastSearchResults = ref<SearchResult[]>([])
  
  // Search debounce timer
  let searchDebounceTimer: NodeJS.Timeout | null = null

  // Computed values
  const isReady = computed(() => globalState.initialized && !globalState.isLoading)
  const hasData = computed(() => Boolean(globalState.data?.entries?.length))
  const errorMessage = computed(() => globalState.error)
  const totalEntries = computed(() => globalState.entries?.length || 0)

  /**
   * Initialize the dictionary system
   */
  const initialize = async (): Promise<void> => {
    // Return existing initialization promise if already initializing
    if (initializationPromise) {
      return initializationPromise
    }

    initializationPromise = performInitialization()
    return initializationPromise
  }

  /**
   * Perform the actual initialization
   */
  const performInitialization = async (): Promise<void> => {
    // Prevent duplicate loading, but allow cache revalidation
    if (globalState.isLoading) return

    try {
      globalState.isLoading = true
      globalState.error = null

      console.log('🚀 Initializing dictionary system...')

      // Initialize IndexedDB service
      await indexedDBService.initialize()

      // Load user preferences (only on first initialization)
      if (!globalState.initialized) {
        loadUserPreferences()
      }

      // Always get current API version to check cache validity
      let currentApiVersion: string | null = null
      try {
        const apiResponse = await $fetch<DictionaryApiResponse>('/api/dictionary')
        currentApiVersion = apiResponse?.version || null
        console.log(`🔍 Current API version: ${currentApiVersion}`)
      } catch (error) {
        console.warn('⚠️ Could not fetch API version for cache validation')
      }

      // Try to load from cache first
      const cachedData = await indexedDBService.loadDictionaryData()
      const cacheMetadata = await indexedDBService.getCacheMetadata()

      // Always check cache validity, even if already initialized
      if (cachedData && cacheMetadata && await indexedDBService.isCacheValid(currentApiVersion ?? undefined)) {
        console.log('📖 Using cached dictionary data')
        await setupDictionaryData(cachedData, cacheMetadata, true)
      } else {
        if (globalState.initialized) {
          console.log('🔄 Cache invalid - refreshing dictionary data...')
        } else {
          console.log('🌐 Loading dictionary from network...')
        }
        await loadFromNetwork()
      }

      globalState.initialized = true
      globalState.isLoading = false

      console.log('✅ Dictionary system initialized successfully')

    } catch (error) {
      globalState.isLoading = false
      globalState.error = error instanceof Error ? error.message : 'Initialization failed'
      console.error('❌ Dictionary initialization failed:', error)
      throw error
    }
  }

  /**
   * Load dictionary data from network
   */
  const loadFromNetwork = async (): Promise<DictionaryData> => {
    try {
      const response = await $fetch<DictionaryApiResponse>('/api/dictionary')
      
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to load dictionary')
      }

      const data = response.data

      // Cache the data for offline use
      await indexedDBService.storeDictionaryData(data)
      const cacheMetadata = await indexedDBService.getCacheMetadata()

      // Setup with fresh data
      await setupDictionaryData(data, cacheMetadata, false)

      console.log(`✅ Dictionary loaded from network: ${data.metadata.total_entries} entries`)
      return data

    } catch (error) {
      console.error('❌ Failed to load from network:', error)
      throw createError('network-error', 'Failed to load dictionary from server', error)
    }
  }

  /**
   * Setup dictionary data and search index
   */
  const setupDictionaryData = async (
    data: DictionaryData, 
    cacheMetadata: CacheMetadata | null,
    fromCache: boolean
  ): Promise<void> => {
    globalState.data = data
    globalState.cache = cacheMetadata

    // Get enhanced entries for search
    const enhancedEntries = await indexedDBService.getEnhancedEntries()
    globalState.entries = enhancedEntries

    // Initialize search service
    await searchService.initialize(enhancedEntries)

    // Cache search index if loaded from network
    if (!fromCache && cacheMetadata && !cacheMetadata.indexBuilt) {
      const indexStats = searchService.getIndexStats()
      if (indexStats) {
        await indexedDBService.storeSearchIndex(indexStats)
      }
    }

    console.log(`📚 Dictionary ready: ${enhancedEntries.length} searchable entries`)
  }

  /**
   * Perform search with debouncing
   */
  const search = async (query: SearchQuery): Promise<SearchResult[]> => {
    if (!globalState.initialized) {
      await initialize()
    }

    try {
      const results = await searchService.search(query)
      
      // Add to search history if it's a meaningful query
      if (query.query.length >= 2) {
        addToHistory(query.query)
      }

      lastSearchQuery.value = query.query
      lastSearchResults.value = results

      return results

    } catch (error) {
      console.error('❌ Search failed:', error)
      throw createError('invalid-query', 'Search operation failed', error)
    }
  }

  /**
   * Quick search with sensible defaults
   */
  const quickSearch = async (query: string): Promise<SearchResult[]> => {
    return search({
      query,
      language: currentLanguage.value,
      mode: COMPOSABLE_CONFIG.DEFAULT_SEARCH_MODE,
      limit: COMPOSABLE_CONFIG.DEFAULT_SEARCH_LIMIT
    })
  }

  /**
   * Get autocomplete suggestions
   */
  const autocomplete = async (query: string, language: DictionaryLanguage): Promise<AutocompleteSuggestion[]> => {
    if (!globalState.initialized) {
      await initialize()
    }

    try {
      return await searchService.autocomplete(query, language)
    } catch (error) {
      console.error('❌ Autocomplete failed:', error)
      return []
    }
  }

  /**
   * Get specific entry by ID
   */
  const getEntry = async (id: string): Promise<DictionaryEntry | null> => {
    if (!globalState.initialized) {
      await initialize()
    }

    return globalState.entries.find(entry => entry.id === id) || null
  }

  /**
   * Refresh dictionary data
   */
  const refresh = async (): Promise<void> => {
    try {
      globalState.isLoading = true
      globalState.error = null

      // Clear cache and reload from network
      await indexedDBService.clearCache()
      await loadFromNetwork()

      globalState.isLoading = false
      console.log('🔄 Dictionary refreshed successfully')

    } catch (error) {
      globalState.isLoading = false
      globalState.error = error instanceof Error ? error.message : 'Refresh failed'
      throw error
    }
  }

  /**
   * Get cache information
   */
  const getCacheInfo = async (): Promise<CacheMetadata | null> => {
    return await indexedDBService.getCacheMetadata()
  }

  /**
   * Toggle between languages
   */
  const toggleLanguage = (): void => {
    currentLanguage.value = currentLanguage.value === 'español' ? 'ndowe' : 'español'
    saveUserPreferences()
  }

  /**
   * Add query to search history
   */
  const addToHistory = (query: string): void => {
    const normalizedQuery = query.trim().toLowerCase()
    
    if (!normalizedQuery || normalizedQuery.length < 2) return

    // Remove if already exists
    const existingIndex = searchHistory.value.indexOf(normalizedQuery)
    if (existingIndex > -1) {
      searchHistory.value.splice(existingIndex, 1)
    }

    // Add to beginning
    searchHistory.value.unshift(normalizedQuery)

    // Limit history size
    if (searchHistory.value.length > COMPOSABLE_CONFIG.HISTORY_MAX_ITEMS) {
      searchHistory.value = searchHistory.value.slice(0, COMPOSABLE_CONFIG.HISTORY_MAX_ITEMS)
    }

    saveSearchHistory()
  }

  /**
   * Clear search history
   */
  const clearHistory = (): void => {
    searchHistory.value = []
    saveSearchHistory()
  }

  /**
   * Load user preferences from localStorage
   */
  const loadUserPreferences = (): void => {
    try {
      // Load current language
      const savedLanguage = localStorage.getItem(COMPOSABLE_CONFIG.STORAGE_KEYS.CURRENT_LANGUAGE)
      if (savedLanguage === 'español' || savedLanguage === 'ndowe') {
        currentLanguage.value = savedLanguage
      }

      // Load search history
      const savedHistory = localStorage.getItem(COMPOSABLE_CONFIG.STORAGE_KEYS.SEARCH_HISTORY)
      if (savedHistory) {
        searchHistory.value = JSON.parse(savedHistory)
      }

    } catch (error) {
      console.warn('⚠️ Failed to load user preferences:', error)
    }
  }

  /**
   * Save user preferences to localStorage
   */
  const saveUserPreferences = (): void => {
    try {
      localStorage.setItem(COMPOSABLE_CONFIG.STORAGE_KEYS.CURRENT_LANGUAGE, currentLanguage.value)
    } catch (error) {
      console.warn('⚠️ Failed to save user preferences:', error)
    }
  }

  /**
   * Save search history to localStorage
   */
  const saveSearchHistory = (): void => {
    try {
      localStorage.setItem(
        COMPOSABLE_CONFIG.STORAGE_KEYS.SEARCH_HISTORY, 
        JSON.stringify(searchHistory.value)
      )
    } catch (error) {
      console.warn('⚠️ Failed to save search history:', error)
    }
  }

  /**
   * Create standardized error objects
   */
  const createError = (code: DictionaryError['code'], message: string, originalError?: any): DictionaryError => {
    const error = new Error(message) as DictionaryError
    error.code = code
    error.timestamp = Date.now()
    if (originalError) {
      error.originalError = originalError
    }
    return error
  }

  // Watch for language changes
  watch(currentLanguage, saveUserPreferences)

  // Auto-initialize on first use
  nextTick(() => {
    if (process.client && !globalState.initialized && !initializationPromise) {
      initialize().catch(error => {
        console.error('❌ Auto-initialization failed:', error)
      })
    }
  })

  // Return the composable interface  
  return {
    // State
    isReady,
    isLoading: toRef(globalState, 'isLoading'),
    error: ref(null as DictionaryError | null),
    currentLanguage,
    totalEntries,
    
    // Methods
    initialize,
    search,
    autocomplete: async (query: string, language: DictionaryLanguage = 'español') => {
      return await autocomplete(query, language)
    },
    setLanguage: (language: DictionaryLanguage) => {
      currentLanguage.value = language
    },
    clearCache: async () => {
      await indexedDBService.clearCache()
    },
    getStats: async () => {
      return {
        totalEntries: globalState.entries.length,
        españolEntries: globalState.entries.length,
        ndoweEntries: globalState.entries.filter(e => e.ndowe.length > 0).length,
        entriesWithExplanations: globalState.entries.filter(e => e.explicación?.length).length,
        entriesWithCrossReferences: globalState.entries.filter(e => e.ver?.length).length,
        averageTranslationsPerEntry: globalState.entries.reduce((sum, e) => sum + e.ndowe.length, 0) / globalState.entries.length,
        indexSizeBytes: 0,
        cacheSizeBytes: 0
      }
    },
    
    // Data
    searchHistory: ref([]),
    preferences: ref({
      defaultLanguage: 'español' as DictionaryLanguage,
      searchMode: 'hybrid' as SearchMode,
      maxResults: 20,
      enableAutocomplete: true,
      enableFuzzySearch: true,
      showExplanations: true,
      showCrossReferences: true,
      theme: 'light' as 'light' | 'dark' | 'auto'
    })
  }
} 