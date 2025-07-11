/**
 * Search Service
 * Provides fast dictionary search using multiple strategies:
 * - Trie-based exact matching and autocomplete
 * - Fuse.js fuzzy search for typo tolerance
 * - Hybrid search combining both approaches
 */

import Fuse from 'fuse.js'
import type {
  DictionaryEntry,
  SearchResult,
  SearchQuery,
  SearchIndex,
  TrieNode,
  AutocompleteSuggestion,
  DictionaryLanguage,
  SearchMode,
  DictionaryError
} from '~/types/dictionary'

/**
 * Search configuration
 */
const SEARCH_CONFIG = {
  // Fuse.js configuration
  getFuseOptions(): any {
    return {
      includeScore: true,
      includeMatches: true,
      threshold: 0.3, // Lower = more strict matching
      location: 0,    // Start of string
      distance: 100,  // How far from location to search
      maxPatternLength: 32,
      minMatchCharLength: 1,
      keys: [
        { name: 'español', weight: 0.7 },
        { name: 'ndoweText', weight: 0.8 },
        { name: 'explicación', weight: 0.3 }
      ]
    }
  },
  
  // Search limits
  MAX_RESULTS: 50,
  MAX_AUTOCOMPLETE: 10,
  MIN_QUERY_LENGTH: 1,
  
  // Performance thresholds
  EXACT_MATCH_THRESHOLD: 1000, // Use trie for queries with less results
  FUZZY_THRESHOLD: 0.3
} as const

/**
 * Search service class providing multiple search strategies
 */
export class SearchService {
  private searchIndex: SearchIndex | null = null
  private fuseInstance: Fuse<DictionaryEntry> | null = null
  private initialized: boolean = false

  /**
   * Initialize the search service with dictionary entries
   */
  async initialize(entries: DictionaryEntry[]): Promise<void> {
    try {
      const startTime = Date.now()
      
      console.log(`🔍 Building search index for ${entries.length} entries...`)
      
      // Build search indexes
      this.searchIndex = this.buildSearchIndex(entries)
      
      // Initialize Fuse.js for fuzzy search
      this.fuseInstance = new Fuse(entries, SEARCH_CONFIG.getFuseOptions())
      
      this.initialized = true
      
      const duration = Date.now() - startTime
      console.log(`✅ Search index built in ${duration}ms`)
      
    } catch (error) {
      console.error('❌ Failed to initialize search service:', error)
      throw this.createError('index-error', 'Failed to build search index', error)
    }
  }

  /**
   * Perform search based on query parameters
   */
  async search(query: SearchQuery): Promise<SearchResult[]> {
    this.ensureInitialized()
    
    if (!query.query || query.query.length < SEARCH_CONFIG.MIN_QUERY_LENGTH) {
      return []
    }

    const startTime = Date.now()
    
    try {
      let results: SearchResult[]

      switch (query.mode) {
        case 'exact':
          results = this.exactSearch(query)
          break
        case 'fuzzy':
          results = this.fuzzySearch(query)
          break
        case 'autocomplete':
          results = this.autocompleteSearch(query)
          break
        case 'hybrid':
        default:
          results = this.hybridSearch(query)
          break
      }

      // Apply filters and limits
      results = this.filterResults(results, query)
      results = results.slice(0, query.limit || SEARCH_CONFIG.MAX_RESULTS)

      const duration = Date.now() - startTime
      console.log(`🔍 Search "${query.query}" returned ${results.length} results in ${duration}ms`)
      
      return results

    } catch (error) {
      console.error('❌ Search failed:', error)
      throw this.createError('invalid-query', 'Search operation failed', error)
    }
  }

  /**
   * Get autocomplete suggestions for a query
   */
  async autocomplete(query: string, language: DictionaryLanguage): Promise<AutocompleteSuggestion[]> {
    this.ensureInitialized()
    
    if (!query || query.length < SEARCH_CONFIG.MIN_QUERY_LENGTH) {
      return []
    }

    try {
      const normalizedQuery = this.normalizeText(query)
      const trie = language === 'español' ? this.searchIndex!.españolTrie : this.searchIndex!.ndoweTrie
      
      const suggestions = this.getTrieSuggestions(trie, normalizedQuery, SEARCH_CONFIG.MAX_AUTOCOMPLETE)
      
      return suggestions.map(suggestion => ({
        text: suggestion.word,
        count: suggestion.count,
        language,
        isExactMatch: suggestion.word.toLowerCase() === query.toLowerCase()
      }))
      
    } catch (error) {
      console.error('❌ Autocomplete failed:', error)
      return []
    }
  }

  /**
   * Get search index statistics
   */
  getIndexStats(): {
    totalEntries: number
    españolWords: number
    ndoweWords: number
    indexSizeBytes: number
  } | null {
    if (!this.searchIndex) return null

    return {
      totalEntries: this.searchIndex.entryMap.size,
      españolWords: this.searchIndex.españolIndex.size,
      ndoweWords: this.searchIndex.ndoweIndex.size,
      indexSizeBytes: this.estimateIndexSize()
    }
  }

  /**
   * Exact search using trie structure
   */
  private exactSearch(query: SearchQuery): SearchResult[] {
    const normalizedQuery = this.normalizeText(query.query)
    const index = query.language === 'español' 
      ? this.searchIndex!.españolIndex 
      : this.searchIndex!.ndoweIndex

    const entryIds = index.get(normalizedQuery) || []
    
    return entryIds.map(id => {
      const entry = this.searchIndex!.entryMap.get(id)!
      return {
        entry,
        score: 1.0, // Perfect match
        matchType: 'exact' as const,
        matchedFields: [query.language]
      }
    })
  }

  /**
   * Fuzzy search using Fuse.js
   */
  private fuzzySearch(query: SearchQuery): SearchResult[] {
    const fuseResults = this.fuseInstance!.search(query.query)
    
    return fuseResults
      .filter(result => (result.score || 0) <= (query.threshold || SEARCH_CONFIG.FUZZY_THRESHOLD))
      .map(result => {
        const matchedFields: DictionaryLanguage[] = []
        
        // Determine which fields matched
        if (result.matches) {
          for (const match of result.matches) {
            if (match.key === 'español') matchedFields.push('español')
            if (match.key === 'ndoweText') matchedFields.push('ndowe')
          }
        }

        return {
          entry: result.item,
          score: 1 - (result.score || 0), // Invert score (higher = better)
          matchType: 'fuzzy' as const,
          matchedFields
        }
      })
  }

  /**
   * Autocomplete search for partial matches
   */
  private autocompleteSearch(query: SearchQuery): SearchResult[] {
    const normalizedQuery = this.normalizeText(query.query)
    const trie = query.language === 'español' 
      ? this.searchIndex!.españolTrie 
      : this.searchIndex!.ndoweTrie

    const suggestions = this.getTrieSuggestions(trie, normalizedQuery, SEARCH_CONFIG.MAX_RESULTS)
    
    return suggestions.flatMap(suggestion => {
      const entryIds = query.language === 'español'
        ? this.searchIndex!.españolIndex.get(suggestion.word) || []
        : this.searchIndex!.ndoweIndex.get(suggestion.word) || []

      return entryIds.map(id => {
        const entry = this.searchIndex!.entryMap.get(id)!
        const isExact = suggestion.word === normalizedQuery
        
        return {
          entry,
          score: isExact ? 1.0 : 0.8,
          matchType: 'partial' as const,
          matchedFields: [query.language]
        }
      })
    })
  }

  /**
   * Hybrid search combining exact and fuzzy approaches
   */
  private hybridSearch(query: SearchQuery): SearchResult[] {
    // Start with exact matches
    const exactResults = this.exactSearch(query)
    
    // If we have enough exact matches, return them
    if (exactResults.length >= 10) {
      return exactResults
    }

    // Add fuzzy matches for better coverage
    const fuzzyResults = this.fuzzySearch(query)
    
    // Combine and deduplicate results
    const combinedResults = new Map<string, SearchResult>()
    
    // Add exact matches first (higher priority)
    for (const result of exactResults) {
      combinedResults.set(result.entry.id, result)
    }
    
    // Add fuzzy matches if not already present
    for (const result of fuzzyResults) {
      if (!combinedResults.has(result.entry.id)) {
        combinedResults.set(result.entry.id, result)
      }
    }

    // Sort by score (descending)
    return Array.from(combinedResults.values())
      .sort((a, b) => b.score - a.score)
  }

  /**
   * Filter search results based on query parameters
   */
  private filterResults(results: SearchResult[], query: SearchQuery): SearchResult[] {
    return results.filter(result => {
      // Filter out entries without translations if requested
      if (!query.includeEmpty && !result.entry.hasTranslations) {
        return false
      }
      
      return true
    })
  }

  /**
   * Build comprehensive search index
   */
  private buildSearchIndex(entries: DictionaryEntry[]): SearchIndex {
    const searchIndex: SearchIndex = {
      españolTrie: this.createTrieNode(),
      ndoweTrie: this.createTrieNode(),
      españolIndex: new Map(),
      ndoweIndex: new Map(),
      fuseIndex: null, // Will be set later
      entryMap: new Map(),
      normalizedMap: new Map()
    }

    // Build entry map and process each entry
    for (const entry of entries) {
      searchIndex.entryMap.set(entry.id, entry)
      
      // Index Spanish words
      this.indexWords(entry.españolNormalized, entry.id, searchIndex.españolTrie, searchIndex.españolIndex)
      
      // Index Ndowe words
      if (entry.ndoweText) {
        const normalizedNdowe = this.normalizeText(entry.ndoweText)
        this.indexWords(normalizedNdowe, entry.id, searchIndex.ndoweTrie, searchIndex.ndoweIndex)
      }
    }

    return searchIndex
  }

  /**
   * Index words in both trie and inverted index
   */
  private indexWords(
    text: string, 
    entryId: string, 
    trie: TrieNode, 
    invertedIndex: Map<string, string[]>
  ): void {
    const words = text.split(/\s+/).filter(word => word.length > 0)
    
    for (const word of words) {
      // Add to trie
      this.addToTrie(trie, word, entryId)
      
      // Add to inverted index
      if (!invertedIndex.has(word)) {
        invertedIndex.set(word, [])
      }
      if (!invertedIndex.get(word)!.includes(entryId)) {
        invertedIndex.get(word)!.push(entryId)
      }
    }
  }

  /**
   * Add word to trie structure
   */
  private addToTrie(root: TrieNode, word: string, entryId: string): void {
    let current = root
    
    for (const char of word) {
      if (!current.children.has(char)) {
        current.children.set(char, this.createTrieNode())
      }
      current = current.children.get(char)!
    }
    
    current.isEndOfWord = true
    if (!current.entryIds.includes(entryId)) {
      current.entryIds.push(entryId)
    }
  }

  /**
   * Get autocomplete suggestions from trie
   */
  private getTrieSuggestions(
    root: TrieNode, 
    prefix: string, 
    maxSuggestions: number
  ): Array<{ word: string; count: number }> {
    // Navigate to prefix node
    let current = root
    for (const char of prefix) {
      if (!current.children.has(char)) {
        return [] // Prefix not found
      }
      current = current.children.get(char)!
    }

    // Collect all words with this prefix
    const suggestions: Array<{ word: string; count: number }> = []
    this.collectWords(current, prefix, suggestions, maxSuggestions)
    
    // Sort by frequency (count) and alphabetically
    return suggestions
      .sort((a, b) => b.count - a.count || a.word.localeCompare(b.word))
      .slice(0, maxSuggestions)
  }

  /**
   * Recursively collect words from trie
   */
  private collectWords(
    node: TrieNode, 
    currentWord: string, 
    suggestions: Array<{ word: string; count: number }>,
    maxSuggestions: number
  ): void {
    if (suggestions.length >= maxSuggestions) return

    if (node.isEndOfWord) {
      suggestions.push({
        word: currentWord,
        count: node.entryIds.length
      })
    }

    // Visit children
    for (const [char, childNode] of node.children) {
      this.collectWords(childNode, currentWord + char, suggestions, maxSuggestions)
    }
  }

  /**
   * Create a new trie node
   */
  private createTrieNode(): TrieNode {
    return {
      isEndOfWord: false,
      entryIds: [],
      children: new Map(),
      count: 0
    }
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
   * Estimate search index size in bytes
   */
  private estimateIndexSize(): number {
    if (!this.searchIndex) return 0
    
    let size = 0
    
    // Estimate trie size
    size += this.estimateTrieSize(this.searchIndex.españolTrie)
    size += this.estimateTrieSize(this.searchIndex.ndoweTrie)
    
    // Estimate inverted index size
    for (const [key, values] of this.searchIndex.españolIndex) {
      size += key.length * 2 + values.length * 10 // Rough estimate
    }
    
    for (const [key, values] of this.searchIndex.ndoweIndex) {
      size += key.length * 2 + values.length * 10
    }
    
    return size
  }

  /**
   * Estimate trie size recursively
   */
  private estimateTrieSize(node: TrieNode): number {
    let size = 16 + node.entryIds.length * 10 // Base node size
    
    for (const childNode of node.children.values()) {
      size += this.estimateTrieSize(childNode)
    }
    
    return size
  }

  /**
   * Ensure service is initialized
   */
  private ensureInitialized(): void {
    if (!this.initialized) {
      throw this.createError('index-error', 'Search service not initialized')
    }
  }

  /**
   * Create standardized error objects
   */
  private createError(code: DictionaryError['code'], message: string, originalError?: any): DictionaryError {
    return {
      code,
      message,
      details: originalError?.message || originalError?.toString()
    }
  }
}

// Export singleton instance
export const searchService = new SearchService() 