<template>
  <div class="dictionary-page">
    <!-- Navigation Bar -->
    <nav-bar />
    
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="ds-text-display-lg">Diccionario Español-Ndowe</h1>
        <p class="page-subtitle">
          Traduce palabras entre español y ndowe
        </p>
      </div>
      
      <!-- Language Toggle -->
      <div class="language-toggle-wrapper">
        <LanguageToggle
          :current-language="(currentLanguage?.value || 'español') === 'español' ? 'spanish' : 'ndowe'"
          @language-change="handleLanguageChange"
        />
      </div>
    </div>

    <!-- Search Section -->
    <div class="search-section">
      <SearchBox
        v-model="searchQuery"
        :placeholder="dynamicSearchPlaceholder"
        :suggestions="suggestionTexts || []"
        :show-suggestions="showSuggestions"
        @search="handleSearch"
        @clear="clearSearch"
        @suggestion-select="handleSuggestionSelect"
        @focus="handleSearchFocus"
        @blur="handleSearchBlur"
      />
    </div>

    <!-- Recent Searches -->
    <div v-if="recentSearches.length > 0" class="recent-searches">
      <h4 class="ds-text-display-xs">Búsquedas Recientes</h4>
      <div class="recent-list">
        <button
          v-for="search in recentSearches"
          :key="search.id"
          @click="repeatSearch(search.query)"
          class="recent-item"
        >
          <span class="recent-query">{{ search.query }}</span>
          <span class="recent-time">{{ formatTimeAgo(search.timestamp) }}</span>
        </button>
      </div>
    </div>

    <!-- Results Section -->
    <div class="results-section">
      <!-- Loading State -->
      <div v-if="isLoading" class="loading-state">
        <Icon name="loader" class="loading-icon" />
        <p class="loading-text">Buscando...</p>
      </div>

      <!-- Results -->
      <div v-else-if="translationResults && translationResults.length > 0" class="results-grid">
        <ResultCard
          v-for="result in translationResults"
          :key="result.id"
          :entry="result"
          :translation-direction="(currentLanguage || 'español') === 'español' ? 'spanish-to-ndowe' : 'ndowe-to-spanish'"
        />
      </div>

      <!-- Empty State (After Search) -->
      <EmptyState
        v-else-if="hasSearched && (!translationResults || translationResults.length === 0)"
        icon-name="magnifying-glass"
        title="No se encontraron traducciones"
        :description="emptyStateDescription || 'No se encontraron traducciones'"
      >
        <template #default>
          <button
            @click="clearSearch"
            class="clear-search-button"
          >
            Limpiar Búsqueda
          </button>
        </template>
      </EmptyState>

      <!-- Initial State (Before Search) -->
      <EmptyState
        v-else
        icon-name="book-open"
        title="Bienvenido al Diccionario"
        description="Comienza a buscar palabras en español o ndowe para ver traducciones"
        cta-text="Iniciar Búsqueda"
        @cta-click="focusSearch"
      >
        <template #default>
          <!-- Quick Actions -->
          <div class="quick-actions">
            <button
              v-for="action in quickActions"
              :key="action.id"
              @click="performQuickAction(action)"
              class="quick-action-button"
            >
              <Icon :name="action.icon" class="action-icon" />
              {{ action.label }}
            </button>
          </div>
        </template>
      </EmptyState>
    </div>

    <!-- Offline Status -->
    <div v-if="!isOnline" class="offline-banner">
      <Icon name="wifi" class="offline-icon" />
      <span class="offline-text">Modo Offline - Datos locales</span>
    </div>
    
    <!-- Footer -->
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'

// Page metadata
useHead({
  title: 'Diccionario Español-Ndowe | epàlwi-rèbbo',
  meta: [
    { 
      name: 'description', 
      content: 'Traduce palabras entre español y ndowe con nuestro diccionario offline.' 
    }
  ]
})

// Use the real dictionary composable
const {
  isReady,
  isLoading,
  error: dictionaryError,
  currentLanguage,
  searchQuery,
  searchResults,
  suggestions,
  hasSearched,
  totalEntries,
  translationResults,
  searchPlaceholder,
  search: performSearch,
  getSuggestions,
  clearSearch: clearDictionarySearch,
  setLanguage
} = process.client ? useDictionary() : {
  isReady: ref(false),
  isLoading: ref(false),
  error: ref(null),
  currentLanguage: ref('español'),
  searchQuery: ref(''),
  searchResults: ref([]),
  suggestions: ref([]),
  hasSearched: ref(false),
  totalEntries: ref(0),
  translationResults: computed(() => []),
  searchPlaceholder: computed(() => 'Buscar palabra en español...'),
  search: async () => [],
  getSuggestions: async () => [],
  clearSearch: () => {},
  setLanguage: () => {}
}

// Local state
const isOnline = ref(true)
const showSuggestions = ref(false)
const recentSearches = ref([
  { id: 1, query: 'hola', timestamp: Date.now() - 3600000 },
  { id: 2, query: 'agua', timestamp: Date.now() - 7200000 }
])

// Quick actions
const quickActions = ref([
  { id: 'common', label: 'Palabras Comunes', icon: 'star' },
  { id: 'numbers', label: 'Números', icon: 'hashtag' },
  { id: 'colors', label: 'Colores', icon: 'paint-brush' },
  { id: 'family', label: 'Familia', icon: 'heart' }
])

// Computed properties
const emptyStateDescription = computed(() => {
  const language = currentLanguage?.value || 'español'
  if (language === 'español') {
    return 'No se encontraron traducciones para esta palabra en español'
  }
  return 'No se encontraron traducciones para esta palabra en ndowe'
})

const suggestionTexts = computed(() => {
  return suggestions?.value?.map(s => s.text) || []
})

// Dynamic search placeholder based on current language
const dynamicSearchPlaceholder = computed(() => {
  const language = currentLanguage?.value || 'español'
  console.log(`🔍 Dynamic placeholder computed for language: ${language}`)
  return language === 'español' 
    ? 'Buscar palabra en español...' 
    : 'Buscar palabra en ndowe...'
})

// Methods
const handleLanguageChange = (language: 'spanish' | 'ndowe') => {
  const newLanguage = language === 'spanish' ? 'español' : 'ndowe'
  
  console.log(`🔄 Language change requested: ${language} -> ${newLanguage}`)
  
  // Clear all search state when language changes
  clearSearch()
  showSuggestions.value = false
  
  // Update the language in the dictionary service
  setLanguage(newLanguage)
  
  // Force refresh of search suggestions if there's a current query
  if (searchQuery.value.trim().length >= 2) {
    handleSearch(searchQuery.value)
  }
  
  console.log(`✅ Language change completed: ${newLanguage}`)
}

const handleSearch = async (query: string) => {
  if (!query.trim()) {
    showSuggestions.value = false
    return
  }
  
  try {
    // ONLY get suggestions for autocomplete - DO NOT execute search
    const newSuggestions = await getSuggestions(query)
    showSuggestions.value = newSuggestions.length > 0
    
    // IMPORTANT: Do NOT call performSearch here
    // Search will only happen when user selects a suggestion
    
  } catch (err: any) {
    console.error('Search suggestions error:', err)
    showSuggestions.value = false
  }
}

const handleSuggestionSelect = async (suggestion: string) => {
  if (!suggestion.trim()) return
  
  try {
    // Set the search query to the selected suggestion
    searchQuery.value = suggestion
    showSuggestions.value = false
    
    // NOW execute the actual search with the selected suggestion - EXACT MATCH ONLY
    await performSearch(suggestion, 'exact') // Force exact match mode
    
    // Add to recent searches only after successful search
    addToRecentSearches(suggestion)
    
  } catch (err: any) {
    console.error('Suggestion search error:', err)
    // Don't add to recent searches if search failed
  }
}

const handleSearchFocus = () => {
  if (searchQuery.value.trim().length >= 2) {
    showSuggestions.value = true
  }
}

const handleSearchBlur = () => {
  // Delay hiding suggestions to allow for clicks
  setTimeout(() => {
    showSuggestions.value = false
  }, 200)
}

const clearSearch = () => {
  clearDictionarySearch()
  showSuggestions.value = false
}

const focusSearch = () => {
  // Focus the search input
  const searchInput = document.querySelector('.search-input') as HTMLInputElement
  if (searchInput) {
    searchInput.focus()
  }
}

const performQuickAction = (action: any) => {
  // Implement quick actions using proper suggestion selection flow
  console.log('Performing action:', action)
  
  // Set search query and trigger suggestion selection for quick actions
  switch (action.id) {
    case 'common':
      searchQuery.value = 'hola'
      handleSuggestionSelect('hola') // Use suggestion selection with exact search
      break
    case 'numbers':
      searchQuery.value = 'uno'
      handleSuggestionSelect('uno') // Use suggestion selection with exact search
      break
    case 'colors':
      searchQuery.value = 'rojo'
      handleSuggestionSelect('rojo') // Use suggestion selection with exact search
      break
    case 'family':
      searchQuery.value = 'madre'
      handleSuggestionSelect('madre') // Use suggestion selection with exact search
      break
  }
}

const addToRecentSearches = (query: string) => {
  const existingIndex = recentSearches.value.findIndex(s => s.query === query)
  if (existingIndex > -1) {
    recentSearches.value.splice(existingIndex, 1)
  }
  
  recentSearches.value.unshift({
    id: Date.now(),
    query,
    timestamp: Date.now()
  })
  
  // Keep only last 5 searches
  if (recentSearches.value.length > 5) {
    recentSearches.value = recentSearches.value.slice(0, 5)
  }
}

const repeatSearch = (query: string) => {
  searchQuery.value = query
  // Use suggestion selection flow for recent searches with exact search
  handleSuggestionSelect(query)
}

const formatTimeAgo = (timestamp: number) => {
  const now = Date.now()
  const diff = now - timestamp
  
  if (diff < 60000) return 'Ahora'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`
  return `${Math.floor(diff / 86400000)}d`
}

// Watch for search query changes to show/hide suggestions
watch(searchQuery, async (newQuery) => {
  if (newQuery.trim().length >= 2) {
    try {
      // Only get suggestions, don't execute search
      const newSuggestions = await getSuggestions(newQuery)
      showSuggestions.value = newSuggestions.length > 0
    } catch (err) {
      showSuggestions.value = false
    }
  } else {
    showSuggestions.value = false
  }
})

// Watch for language changes to ensure proper synchronization
watch(currentLanguage, (newLanguage, oldLanguage) => {
  if (newLanguage && oldLanguage && newLanguage !== oldLanguage) {
    console.log(`🔄 Language changed from ${oldLanguage} to ${newLanguage}`)
    // Force placeholder update
    showSuggestions.value = false
  }
})

// On mount
onMounted(() => {
  // Check online status
  isOnline.value = navigator.onLine
  
  window.addEventListener('online', () => {
    isOnline.value = true
  })
  
  window.addEventListener('offline', () => {
    isOnline.value = false
  })
})
</script>

<style lang="scss" scoped>
.dictionary-page {
  min-height: 100vh;
  background: var(--ds-background);
  /* Padding-top now handled globally in app.vue */
}

.page-header {
  max-width: 800px;
  margin: 0 auto var(--ds-spacing-6);
  padding: var(--ds-spacing-8) var(--ds-spacing-3) 0;
  text-align: center;
  
  .header-content {
    margin-bottom: var(--ds-spacing-3);
    
    .page-title,
    h1 {
      margin-bottom: var(--ds-spacing-075);
      text-align: center;
    }
    
    .page-subtitle {
      font-size: 1rem;
      color: var(--ds-muted-foreground);
      line-height: var(--ds-line-height-normal);
    }
  }
  
  .language-toggle-wrapper {
    display: flex;
    justify-content: center;
    width: 100%;
  }
}


.search-section {
  max-width: 600px;
  margin: 0 auto var(--ds-spacing-3);
  padding: 0 var(--ds-spacing-3);
}

.recent-searches + .results-section {
  margin-top: var(--ds-spacing-3);
}

.results-section {
  max-width: 600px;
  margin: 0 auto var(--ds-spacing-3);
  padding: 0 var(--ds-spacing-3);
}

.loading-state {
  text-align: center;
  padding: 48px 0;
  
  .loading-icon {
    width: 48px;
    height: 48px;
    color: var(--ds-primary);
    animation: spin 1s linear infinite;
    margin-bottom: 16px;
  }
  
  .loading-text {
    font-size: 1rem;
    color: var(--ds-muted-foreground);
  }
}

.results-grid {
  display: grid;
  gap: 24px;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  margin-top: 24px;
  
  .quick-action-button {
    height: 40px;
    background: var(--ds-card);
    color: var(--ds-foreground);
    border: 1px solid var(--ds-border);
    border-radius: var(--ds-radius);
    font-size: 0.875rem;
    font-weight: var(--ds-font-weight-medium);
    cursor: pointer;
    transition: all var(--ds-duration);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    
    .action-icon {
      width: 16px;
      height: 16px;
    }
    
    &:hover {
      border-color: var(--ds-primary);
      color: var(--ds-primary);
    }
  }
}

.offline-banner {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  background: #f59e0b;
  color: white;
  padding: 12px 16px;
  border-radius: var(--ds-radius);
  font-size: 0.875rem;
  font-weight: var(--ds-font-weight-medium);
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: var(--ds-shadow-lg);
  z-index: 1000;
  
  .offline-icon {
    width: 16px;
    height: 16px;
  }
}

.recent-searches {
  max-width: 600px;
  margin: 0 auto var(--ds-spacing-3);
  padding: 0 var(--ds-spacing-3);
  
  h4 {
    margin-bottom: 16px;
  }
  
  .recent-list {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    
    .recent-item {
      height: 32px;
      padding: 0 16px;
      background: var(--ds-card);
      color: var(--ds-foreground);
      border: 1px solid var(--ds-border);
      border-radius: var(--ds-radius);
      font-size: 0.875rem;
      font-weight: var(--ds-font-weight-medium);
      cursor: pointer;
      transition: all var(--ds-duration);
      display: flex;
      align-items: center;
      gap: 12px;
      
      .recent-query {
        font-weight: var(--ds-font-weight-medium);
      }
      
      .recent-time {
        color: var(--ds-muted-foreground);
        font-size: 0.75rem;
      }
      
      &:hover {
        border-color: var(--ds-primary);
        color: var(--ds-primary);
      }
    }
  }
}

.clear-search-button {
  height: 40px;
  padding: 0 24px;
  background: var(--ds-primary);
  color: white;
  border: none;
  border-radius: var(--ds-radius);
  font-size: 1rem;
  font-weight: var(--ds-font-weight-semibold);
  cursor: pointer;
  transition: all var(--ds-duration);
  
  &:hover {
    background: hsl(var(--ds-primary-dark));
    transform: translateY(-1px);
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .page-header {
    padding: 24px 16px 0;
  }
  
  .search-section,
  .results-section,
  .recent-searches {
    padding: 0 16px;
  }
  
  .quick-actions {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .recent-list {
    justify-content: flex-start;
    
    .recent-item {
      flex: 0 0 auto;
    }
  }
  
  .page-title {
    font-size: 1.5rem;
  }
}
</style>

