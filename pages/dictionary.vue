<template>
  <div class="dictionary-page">
    <!-- Navigation Bar -->
    <NavigationBar current-page="/dictionary" />
    
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">Diccionario Español-Ndowe</h1>
        <p class="page-subtitle">
          Traduce palabras entre español y ndowe
        </p>
      </div>
      
      <!-- Language Toggle -->
      <LanguageToggle
        :current-language="(currentLanguage?.value || 'español') === 'español' ? 'spanish' : 'ndowe'"
        @language-change="handleLanguageChange"
      />
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

    <!-- Recent Searches -->
    <div v-if="recentSearches.length > 0" class="recent-searches">
      <h3 class="recent-title">Búsquedas Recientes</h3>
      <div class="recent-list">
        <button
          v-for="search in recentSearches"
          :key="search.id"
          @click="repeatSearch(search.query)"
          class="recent-item"
        >
          <Icon name="clock" class="recent-icon" />
          <span class="recent-query">{{ search.query }}</span>
          <span class="recent-time">{{ formatTimeAgo(search.timestamp) }}</span>
        </button>
      </div>
    </div>
    
    <!-- Footer -->
    <footer class="footer">
      <div class="footer-content">
        <div class="footer-section">
          <h4 class="footer-title">epàlwi-rèbbo</h4>
          <p class="footer-description">
            Preservando el idioma Ndowe para las futuras generaciones
          </p>
        </div>
        
        <div class="footer-section">
          <h4 class="footer-title">Enlaces Rápidos</h4>
          <div class="footer-links">
            <NuxtLink to="/" class="footer-link">Inicio</NuxtLink>
            <NuxtLink to="/subscription/plans" class="footer-link">Planes</NuxtLink>
            <NuxtLink to="/auth/signup" class="footer-link">Crear Cuenta</NuxtLink>
            <NuxtLink to="/auth/login" class="footer-link">Iniciar Sesión</NuxtLink>
          </div>
        </div>
        
        <div class="footer-section">
          <h4 class="footer-title">Soporte</h4>
          <div class="footer-links">
            <NuxtLink to="/help" class="footer-link">Centro de Ayuda</NuxtLink>
            <NuxtLink to="/contact" class="footer-link">Contacto</NuxtLink>
            <NuxtLink to="/privacy" class="footer-link">Privacidad</NuxtLink>
          </div>
        </div>
      </div>
      
      <div class="footer-bottom">
        <p class="footer-copyright">
          © 2024 epàlwi-rèbbo. Todos los derechos reservados.
        </p>
      </div>
    </footer>
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
  
  // Keep only last 10 searches
  if (recentSearches.value.length > 10) {
    recentSearches.value = recentSearches.value.slice(0, 10)
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
  background: var(--color-background);
  padding: var(--space-6) 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-8);
  padding: 0 var(--space-6);
  
  .header-content {
    .page-title {
      font-size: var(--font-size-3xl);
      font-weight: var(--font-weight-bold);
      color: var(--color-text);
      margin-bottom: var(--space-2);
    }
    
    .page-subtitle {
      font-size: var(--font-size-base);
      color: var(--color-text-muted);
      line-height: var(--line-height-normal);
    }
  }
}

.search-section {
  margin-bottom: var(--space-8);
  padding: 0 var(--space-6);
}

.results-section {
  padding: 0 var(--space-6);
  margin-bottom: var(--space-8);
}

.loading-state {
  text-align: center;
  padding: var(--space-12) 0;
  
  .loading-icon {
    width: 48px;
    height: 48px;
    color: var(--color-secondary);
    animation: spin 1s linear infinite;
    margin-bottom: var(--space-4);
  }
  
  .loading-text {
    font-size: var(--font-size-base);
    color: var(--color-text-muted);
  }
}

.results-grid {
  display: grid;
  gap: var(--space-6);
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: var(--space-4);
  margin-top: var(--space-6);
  
  .quick-action-button {
    height: var(--space-10);
    background: var(--color-primary);
    color: var(--color-text);
    border: 1px solid var(--color-border);
    border-radius: var(--border-radius);
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    cursor: pointer;
    transition: all 0.15s ease-in-out;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
    
    .action-icon {
      width: 16px;
      height: 16px;
    }
    
    &:hover {
      border-color: var(--color-secondary);
      color: var(--color-secondary);
    }
  }
}

.offline-banner {
  position: fixed;
  bottom: var(--space-6);
  left: 50%;
  transform: translateX(-50%);
  background: var(--color-warning);
  color: white;
  padding: var(--space-3) var(--space-4);
  border-radius: var(--border-radius);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  display: flex;
  align-items: center;
  gap: var(--space-2);
  box-shadow: var(--shadow-lg);
  z-index: var(--z-toast);
  
  .offline-icon {
    width: 16px;
    height: 16px;
  }
}

.recent-searches {
  padding: 0 var(--space-6);
  
  .recent-title {
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text);
    margin-bottom: var(--space-4);
  }
  
  .recent-list {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-3);
    
    .recent-item {
      height: var(--space-8);
      padding: 0 var(--space-4);
      background: var(--color-primary);
      color: var(--color-text);
      border: 1px solid var(--color-border);
      border-radius: var(--border-radius);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      cursor: pointer;
      transition: all 0.15s ease-in-out;
      display: flex;
      align-items: center;
      gap: var(--space-3);
      
      .recent-icon {
        width: 14px;
        height: 14px;
        color: var(--color-text-muted);
      }
      
      .recent-query {
        font-weight: var(--font-weight-medium);
      }
      
      .recent-time {
        color: var(--color-text-muted);
        font-size: var(--font-size-xs);
      }
      
      &:hover {
        border-color: var(--color-secondary);
        color: var(--color-secondary);
      }
    }
  }
}

.clear-search-button {
  height: var(--space-10);
  padding: 0 var(--space-6);
  background: var(--color-secondary);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: all 0.15s ease-in-out;
  
  &:hover {
    background: var(--color-secondary-dark);
    transform: translateY(-1px);
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Footer */
.footer {
  background: var(--color-text);
  color: white;
  padding: var(--space-12) var(--space-6) var(--space-6);
  margin-top: var(--space-16);
}

.footer-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--space-8);
  max-width: 1200px;
  margin: 0 auto var(--space-8);
}

.footer-section {
  .footer-title {
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-semibold);
    margin-bottom: var(--space-4);
  }
  
  .footer-description {
    color: rgba(255, 255, 255, 0.8);
    line-height: var(--line-height-normal);
  }
  
  .footer-links {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    
    .footer-link {
      color: rgba(255, 255, 255, 0.8);
      text-decoration: none;
      transition: color 0.15s ease-in-out;
      
      &:hover {
        color: white;
      }
    }
  }
}

.footer-bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  padding-top: var(--space-6);
  text-align: center;
  
  .footer-copyright {
    color: rgba(255, 255, 255, 0.6);
    font-size: var(--font-size-sm);
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: var(--space-4);
    text-align: center;
  }
  
  .quick-actions {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .recent-list {
    flex-direction: column;
    
    .recent-item {
      width: 100%;
      justify-content: space-between;
    }
  }
  
  .page-title {
    font-size: var(--font-size-2xl);
  }
}
</style>
