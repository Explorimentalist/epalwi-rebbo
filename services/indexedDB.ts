/**
 * IndexedDB Service
 * Handles offline caching of dictionary data using localforage
 * Provides fast access to dictionary entries and metadata
 */

import localforage from 'localforage'
import type { 
  DictionaryData, 
  DictionaryEntry, 
  CacheMetadata, 
  RawDictionaryEntry,
  DictionaryError 
} from '~/types/dictionary'

/**
 * Database configuration
 */
const DB_CONFIG = {
  name: 'epalwi-dictionary',
  version: 1,
  storeName: 'dictionary-data',
  description: 'Spanish-Ndowe Dictionary Offline Storage'
}

/**
 * Storage keys
 */
const STORAGE_KEYS = {
  DICTIONARY_DATA: 'dictionary-data',
  CACHE_METADATA: 'cache-metadata',
  SEARCH_INDEX: 'search-index',
  USER_PREFERENCES: 'user-preferences'
} as const

/**
 * IndexedDB service class for dictionary data management
 */
export class IndexedDBService {
  private dictionaryStore: LocalForage
  private metadataStore: LocalForage
  private indexStore: LocalForage
  private initialized: boolean = false

  constructor() {
    // Initialize separate stores for different data types
    this.dictionaryStore = localforage.createInstance({
      ...DB_CONFIG,
      storeName: 'dictionary-entries'
    })

    this.metadataStore = localforage.createInstance({
      ...DB_CONFIG,
      storeName: 'cache-metadata'
    })

    this.indexStore = localforage.createInstance({
      ...DB_CONFIG,
      storeName: 'search-index'
    })
  }

  /**
   * Initialize the IndexedDB service
   */
  async initialize(): Promise<void> {
    try {
      // Test database connectivity
      await this.dictionaryStore.ready()
      await this.metadataStore.ready()
      await this.indexStore.ready()
      
      this.initialized = true
      console.log('🗄️ IndexedDB service initialized successfully')
    } catch (error) {
      console.error('❌ Failed to initialize IndexedDB:', error)
      throw this.createError('cache-error', 'Failed to initialize offline storage', error)
    }
  }

  /**
   * Store complete dictionary data
   */
  async storeDictionaryData(data: DictionaryData): Promise<void> {
    this.ensureInitialized()
    
    try {
      const startTime = Date.now()
      
      // Convert raw entries to enhanced entries with computed fields
      const enhancedEntries = this.enhanceEntries(data.entries)
      
      // Store the enhanced entries
      await this.dictionaryStore.setItem(STORAGE_KEYS.DICTIONARY_DATA, {
        metadata: data.metadata,
        entries: enhancedEntries
      })

      // Update cache metadata
      const cacheMetadata: CacheMetadata = {
        lastUpdated: Date.now(),
        version: `${data.metadata.version}-comma-fix-v3`, // Force cache refresh for comma fix
        entriesCount: data.metadata.total_entries,
        sizeBytes: this.estimateDataSize(data),
        indexBuilt: false,
        dataHash: 'comma-fix-v3-hash' // Force cache refresh
      }

      await this.metadataStore.setItem(STORAGE_KEYS.CACHE_METADATA, cacheMetadata)
      
      const duration = Date.now() - startTime
      console.log(`💾 Dictionary cached: ${data.metadata.total_entries} entries in ${duration}ms`)
    } catch (error) {
      console.error('❌ Failed to store dictionary data:', error)
      throw this.createError('cache-error', 'Failed to cache dictionary data', error)
    }
  }

  /**
   * Load complete dictionary data from cache
   */
  async loadDictionaryData(): Promise<DictionaryData | null> {
    this.ensureInitialized()
    
    try {
      const cachedData = await this.dictionaryStore.getItem<{
        metadata: any
        entries: DictionaryEntry[]
      }>(STORAGE_KEYS.DICTIONARY_DATA)

      if (!cachedData) {
        console.log('📭 No cached dictionary data found')
        return null
      }

      console.log(`📖 Loaded cached dictionary: ${cachedData.entries.length} entries`)
      return {
        metadata: cachedData.metadata,
        entries: cachedData.entries.map(entry => {
          const rawEntry: RawDictionaryEntry = {
            español: entry.español
          }
          if (entry.ndowe) rawEntry.ndowe = entry.ndowe
          if (entry.explicación) rawEntry.explicación = entry.explicación
          if (entry.ver) rawEntry.ver = entry.ver
          return rawEntry
        })
      }
    } catch (error) {
      console.error('❌ Failed to load dictionary data:', error)
      throw this.createError('cache-error', 'Failed to load cached dictionary', error)
    }
  }

  /**
   * Get enhanced entries for search operations
   */
  async getEnhancedEntries(): Promise<DictionaryEntry[]> {
    this.ensureInitialized()
    
    try {
      const cachedData = await this.dictionaryStore.getItem<{
        metadata: any
        entries: DictionaryEntry[]
      }>(STORAGE_KEYS.DICTIONARY_DATA)

      return cachedData?.entries || []
    } catch (error) {
      console.error('❌ Failed to get enhanced entries:', error)
      throw this.createError('cache-error', 'Failed to get enhanced entries', error)
    }
  }

  /**
   * Get cache metadata
   */
  async getCacheMetadata(): Promise<CacheMetadata | null> {
    this.ensureInitialized()
    
    try {
      return await this.metadataStore.getItem<CacheMetadata>(STORAGE_KEYS.CACHE_METADATA)
    } catch (error) {
      console.error('❌ Failed to get cache metadata:', error)
      return null
    }
  }

  /**
   * Check if dictionary is cached and up to date
   */
  async isCacheValid(requiredVersion?: string): Promise<boolean> {
    try {
      const metadata = await this.getCacheMetadata()
      
      if (!metadata) return false
      
      // Check version if provided
      if (requiredVersion && metadata.version !== requiredVersion) {
        console.log(`🔄 Cache version mismatch: ${metadata.version} !== ${requiredVersion}`)
        return false
      }
      
      // Check if cache is not too old (24 hours)
      const maxAge = 24 * 60 * 60 * 1000 // 24 hours
      const isNotExpired = (Date.now() - metadata.lastUpdated) < maxAge
      
      if (!isNotExpired) {
        console.log('🕐 Cache expired')
        return false
      }
      
      return true
    } catch (error) {
      console.error('❌ Failed to validate cache:', error)
      return false
    }
  }

  /**
   * Store search index data
   */
  async storeSearchIndex(indexData: any): Promise<void> {
    this.ensureInitialized()
    
    try {
      await this.indexStore.setItem(STORAGE_KEYS.SEARCH_INDEX, {
        data: indexData,
        timestamp: Date.now()
      })

      // Update cache metadata to indicate index is built
      const metadata = await this.getCacheMetadata()
      if (metadata) {
        metadata.indexBuilt = true
        await this.metadataStore.setItem(STORAGE_KEYS.CACHE_METADATA, metadata)
      }

      console.log('🔍 Search index cached successfully')
    } catch (error) {
      console.error('❌ Failed to store search index:', error)
      throw this.createError('index-error', 'Failed to cache search index', error)
    }
  }

  /**
   * Load search index data
   */
  async loadSearchIndex(): Promise<any | null> {
    this.ensureInitialized()
    
    try {
      const indexData = await this.indexStore.getItem<{
        data: any
        timestamp: number
      }>(STORAGE_KEYS.SEARCH_INDEX)

      if (!indexData) {
        console.log('🔍 No cached search index found')
        return null
      }

      console.log('🔍 Loaded cached search index')
      return indexData.data
    } catch (error) {
      console.error('❌ Failed to load search index:', error)
      return null
    }
  }

  /**
   * Clear all cached data
   */
  async clearCache(): Promise<void> {
    this.ensureInitialized()
    
    try {
      await Promise.all([
        this.dictionaryStore.clear(),
        this.metadataStore.clear(),
        this.indexStore.clear()
      ])
      
      console.log('🧹 Cache cleared successfully')
    } catch (error) {
      console.error('❌ Failed to clear cache:', error)
      throw this.createError('cache-error', 'Failed to clear cache', error)
    }
  }

  /**
   * Get storage usage statistics
   */
  async getStorageStats(): Promise<{
    dictionaryEntries: number
    metadataItems: number
    indexItems: number
    estimatedSizeBytes: number
  }> {
    this.ensureInitialized()
    
    try {
      const [dictLength, metaLength, indexLength] = await Promise.all([
        this.dictionaryStore.length(),
        this.metadataStore.length(),
        this.indexStore.length()
      ])

      const metadata = await this.getCacheMetadata()
      const estimatedSize = metadata?.sizeBytes || 0

      return {
        dictionaryEntries: dictLength,
        metadataItems: metaLength,
        indexItems: indexLength,
        estimatedSizeBytes: estimatedSize
      }
    } catch (error) {
      console.error('❌ Failed to get storage stats:', error)
      return {
        dictionaryEntries: 0,
        metadataItems: 0,
        indexItems: 0,
        estimatedSizeBytes: 0
      }
    }
  }

  /**
   * Enhance raw dictionary entries with computed fields
   */
  private enhanceEntries(rawEntries: RawDictionaryEntry[]): DictionaryEntry[] {
    return rawEntries.map((entry, index) => ({
      id: `entry-${index}`,
      español: entry.español,
      españolNormalized: this.normalizeText(entry.español),
      ndowe: entry.ndowe || [],
      ndoweText: entry.ndowe?.join(', ') || '', // Use commas instead of spaces
      explicación: entry.explicación || [],
      ver: entry.ver || [],
      tags: [], // Default empty tags
      category: 'general', // Default category
      searchableText: `${entry.español} ${entry.ndowe?.join(', ') || ''} ${entry.explicación?.join(' ') || ''}`,
      hasTranslations: Boolean(entry.ndowe?.length),
      hasExamples: Boolean(entry.explicación?.length),
      hasCrossReferences: Boolean(entry.ver?.length)
    }))
  }

  /**
   * Normalize text for consistent searching
   */
  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/[^\w\s]/g, '') // Remove special characters
      .trim()
  }

  /**
   * Estimate data size in bytes
   */
  private estimateDataSize(data: DictionaryData): number {
    try {
      return new Blob([JSON.stringify(data)]).size
    } catch {
      // Fallback estimation
      return data.entries.length * 150 // Average ~150 bytes per entry
    }
  }

  /**
   * Ensure service is initialized
   */
  private ensureInitialized(): void {
    if (!this.initialized) {
      throw this.createError('cache-error', 'IndexedDB service not initialized')
    }
  }

  /**
   * Create standardized error objects
   */
  private createError(code: DictionaryError['code'], message: string, originalError?: any): DictionaryError {
    return {
      name: 'IndexedDBError',
      message,
      code,
      originalError,
      timestamp: Date.now()
    }
  }
}

// Export singleton instance
export const indexedDBService = new IndexedDBService() 