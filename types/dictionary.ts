/**
 * Dictionary Types
 * Comprehensive TypeScript definitions for the Spanish-Ndowe dictionary system
 */

import type { Ref } from 'vue'

// =============================================================================
// CORE DICTIONARY TYPES
// =============================================================================

/**
 * Raw dictionary entry from JSON data
 */
export interface RawDictionaryEntry {
  español: string
  ndowe?: string[]
  explicación?: string[]
  ver?: string[]
}

/**
 * Enhanced dictionary entry with computed fields
 */
export interface DictionaryEntry {
  id: string
  español: string
  españolNormalized: string
  ndowe: string[]
  ndoweText: string // Flattened for search
  explicación?: string[]
  ver?: string[]
  tags: string[]
  category: string
  searchableText: string // Combined text for search
  hasTranslations: boolean
  hasExamples: boolean
  hasCrossReferences: boolean
}

/**
 * Translation example pair
 */
export interface TranslationExample {
  source: string
  target: string
}

/**
 * Bidirectional translation result for ResultCard component
 */
export interface TranslationResult {
  id: string
  sourceWord: string
  targetWord: string
  sourceLanguage: DictionaryLanguage
  targetLanguage: DictionaryLanguage
  examples?: TranslationExample[]
}

/**
 * Translation direction for ResultCard component
 */
export type TranslationDirection = 'spanish-to-ndowe' | 'ndowe-to-spanish'

/**
 * Dictionary metadata
 */
export interface DictionaryMetadata {
  name: string
  description: string
  version: string
  created: string
  total_entries: number
  language_pair: string[]
  source_files: string[]
  source_batches: number[]
  schema_version: string
  consolidation_stats: {
    total_files: number
    entries_by_batch: Array<{ batch: number; entries: number }>
    field_distribution: {
      with_ndowe: number
      with_ver: number
      with_explicacion: number
    }
  }
}

/**
 * Complete dictionary data structure
 */
export interface DictionaryData {
  metadata: DictionaryMetadata
  entries: RawDictionaryEntry[]
}

// =============================================================================
// SEARCH TYPES
// =============================================================================

/**
 * Supported dictionary languages
 */
export type DictionaryLanguage = 'español' | 'ndowe'

/**
 * Search modes
 */
export type SearchMode = 'exact' | 'fuzzy' | 'autocomplete' | 'hybrid'

/**
 * Match types for search results
 */
export type MatchType = 'exact' | 'fuzzy' | 'partial'

/**
 * Search query parameters
 */
export interface SearchQuery {
  query: string
  language: DictionaryLanguage
  mode?: SearchMode
  limit?: number
  threshold?: number
  includeExplanations?: boolean
  includeCrossReferences?: boolean
  includeEmpty?: boolean
}

/**
 * Search result with scoring and metadata
 */
export interface SearchResult {
  entry: DictionaryEntry
  score: number
  matchType: MatchType
  matchedFields: DictionaryLanguage[]
  highlightedText?: string
  // Optional UI helpers
  // If present, use this to display the source term instead of entry.español
  // e.g., "dirimir SIN anular" when a cross-reference (ver) was followed
  sourceOverride?: string
  // Cross-reference context, if the result comes via a Spanish "ver" link
  crossRefFrom?: string
  crossRefTarget?: string
}

/**
 * Autocomplete suggestion
 */
export interface AutocompleteSuggestion {
  text: string
  count: number
  language: DictionaryLanguage
  isExactMatch: boolean
}

// =============================================================================
// INDEX TYPES
// =============================================================================

/**
 * Trie node for prefix matching
 */
export interface TrieNode {
  children: Map<string, TrieNode>
  isEndOfWord: boolean
  entryIds: string[]
  count: number
}

/**
 * Search index structure
 */
export interface SearchIndex {
  // Entry mapping
  entryMap: Map<string, DictionaryEntry>
  
  // Inverted indexes for exact matching
  españolIndex: Map<string, string[]>
  ndoweIndex: Map<string, string[]>
  
  // Trie structures for autocomplete
  españolTrie: TrieNode
  ndoweTrie: TrieNode
  
  // Fuse.js index
  fuseIndex: any
  
  // Metadata
  totalEntries: number
  lastUpdated: number
}

// =============================================================================
// CACHE TYPES
// =============================================================================

/**
 * Cache metadata for IndexedDB
 */
export interface CacheMetadata {
  version: string
  lastUpdated: number
  entriesCount: number
  sizeBytes: number
  indexBuilt: boolean
  dataHash: string
}

// =============================================================================
// API TYPES
// =============================================================================

/**
 * Dictionary API response
 */
export interface DictionaryApiResponse {
  success: boolean
  data?: DictionaryData
  cached?: boolean
  version?: string
  error?: string
}

// =============================================================================
// ERROR TYPES
// =============================================================================

/**
 * Dictionary error codes
 */
export type DictionaryErrorCode = 
  | 'network-error'
  | 'cache-error'
  | 'index-error'
  | 'invalid-query'
  | 'not-found'
  | 'initialization-error'

/**
 * Dictionary error structure
 */
export interface DictionaryError {
  name: string
  message: string
  code: DictionaryErrorCode
  originalError?: any
  timestamp: number
}

// =============================================================================
// SERVICE TYPES
// =============================================================================

/**
 * Dictionary service status
 */
export interface DictionaryStatus {
  isReady: boolean
  isLoading: boolean
  error?: DictionaryError
  entriesCount: number
  lastUpdated?: number
}

/**
 * Search options for the dictionary service
 */
export interface SearchOptions {
  language?: DictionaryLanguage
  mode?: SearchMode
  limit?: number
  includeExplanations?: boolean
  includeCrossReferences?: boolean
}

/**
 * Dictionary statistics
 */
export interface DictionaryStats {
  totalEntries: number
  españolEntries: number
  ndoweEntries: number
  entriesWithExplanations: number
  entriesWithCrossReferences: number
  averageTranslationsPerEntry: number
  indexSizeBytes: number
  cacheSizeBytes: number
}

// =============================================================================
// USER PREFERENCES
// =============================================================================

/**
 * User preferences for dictionary usage
 */
export interface DictionaryPreferences {
  defaultLanguage: DictionaryLanguage
  searchMode: SearchMode
  maxResults: number
  enableAutocomplete: boolean
  enableFuzzySearch: boolean
  showExplanations: boolean
  showCrossReferences: boolean
  theme: 'light' | 'dark' | 'auto'
}

/**
 * Search history entry
 */
export interface SearchHistoryEntry {
  id: string
  query: string
  language: DictionaryLanguage
  timestamp: number
  resultsCount: number
}

/**
 * Return type for useDictionary composable
 */
export interface UseDictionaryReturn {
  // State
  isReady: Ref<boolean>
  isLoading: Ref<boolean>
  error: Ref<DictionaryError | null>
  currentLanguage: Ref<DictionaryLanguage>
  totalEntries: Ref<number>
  
  // Methods
  initialize: () => Promise<void>
  search: (query: SearchQuery) => Promise<SearchResult[]>
  autocomplete: (query: string, language?: DictionaryLanguage) => Promise<AutocompleteSuggestion[]>
  setLanguage: (language: DictionaryLanguage) => void
  clearCache: () => Promise<void>
  getStats: () => Promise<DictionaryStats | null>
  
  // Data
  searchHistory: Ref<SearchHistoryEntry[]>
  preferences: Ref<DictionaryPreferences>
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

/**
 * Common response type for async operations
 */
export interface ServiceResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  timestamp: number
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page: number
  limit: number
  offset: number
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> extends ServiceResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// =============================================================================
// TYPE GUARDS
// =============================================================================

/**
 * Type guard for DictionaryEntry
 */
export function isDictionaryEntry(obj: any): obj is DictionaryEntry {
  return obj && 
    typeof obj.id === 'string' &&
    typeof obj.español === 'string' &&
    Array.isArray(obj.ndowe)
}

/**
 * Type guard for SearchResult
 */
export function isSearchResult(obj: any): obj is SearchResult {
  return obj && 
    isDictionaryEntry(obj.entry) &&
    typeof obj.score === 'number' &&
    typeof obj.matchType === 'string'
}

/**
 * Type guard for DictionaryError
 */
export function isDictionaryError(obj: any): obj is DictionaryError {
  return obj && 
    typeof obj.name === 'string' &&
    typeof obj.message === 'string' &&
    typeof obj.code === 'string' &&
    typeof obj.timestamp === 'number'
} 
