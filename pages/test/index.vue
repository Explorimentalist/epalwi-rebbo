  <template>
  <div class="test-page">
    <div class="container mx-auto p-6">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-3xl font-bold">Phase 3 Testing Dashboard</h1>
        <NuxtLink 
          to="/test/components"
          class="px-4 py-2 bg-[#D45B41] text-white rounded-lg hover:bg-[#B8412F] transition-colors"
        >
          📝 Component Testing →
        </NuxtLink>
      </div>
    
      <!-- API Test Section -->
      <section class="mb-8 p-4 border rounded-lg">
        <h2 class="text-xl font-semibold mb-4">📡 API Endpoint Test</h2>
        <div class="space-y-2">
          <button 
            @click="testApi" 
            :disabled="apiLoading"
            class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {{ apiLoading ? 'Testing...' : 'Test Dictionary API' }}
          </button>
          <div v-if="apiResult" class="mt-2">
            <p class="font-semibold">API Status: 
              <span :class="apiResult.success ? 'text-green-600' : 'text-red-600'">
                {{ apiResult.success ? '✅ Success' : '❌ Failed' }}
              </span>
            </p>
            <p v-if="apiResult.data">Entries: {{ apiResult.data.metadata?.total_entries || 'N/A' }}</p>
            <p v-if="apiResult.error" class="text-red-600">Error: {{ apiResult.error }}</p>
          </div>
        </div>
      </section>

      <!-- IndexedDB Test Section -->
      <section class="mb-8 p-4 border rounded-lg">
        <h2 class="text-xl font-semibold mb-4">💾 IndexedDB Service Test</h2>
        <div class="space-y-2">
          <button 
            @click="testIndexedDB" 
            :disabled="indexedDBLoading"
            class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            {{ indexedDBLoading ? 'Testing...' : 'Test IndexedDB' }}
          </button>
          <div v-if="indexedDBResult" class="mt-2">
            <p class="font-semibold">IndexedDB Status: 
              <span :class="indexedDBResult.success ? 'text-green-600' : 'text-red-600'">
                {{ indexedDBResult.success ? '✅ Success' : '❌ Failed' }}
              </span>
            </p>
            <p v-if="indexedDBResult.entriesCount">Cached Entries: {{ indexedDBResult.entriesCount }}</p>
            <p v-if="indexedDBResult.cacheValid !== undefined">
              Cache Valid: 
              <span :class="indexedDBResult.cacheValid ? 'text-green-600' : 'text-orange-600'">
                {{ indexedDBResult.cacheValid ? '✅ Yes' : '🔄 No (needs refresh)' }}
              </span>
            </p>
            <p v-if="indexedDBResult.error" class="text-red-600">Error: {{ indexedDBResult.error }}</p>
          </div>
        </div>
      </section>

      <!-- Search Service Test Section -->
      <section class="mb-8 p-4 border rounded-lg">
        <h2 class="text-xl font-semibold mb-4">🔍 Search Service Test</h2>
        <div class="space-y-4">
          <div class="flex gap-2">
            <input 
              v-model="searchQuery"
              placeholder="Enter search term (e.g., casa, hola)"
              class="flex-1 px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
            >
            <select v-model="searchLanguage" class="px-3 py-2 border rounded">
              <option value="spanish">Español</option>
              <option value="ndowe">Ndowe</option>
            </select>
            <button 
              @click="testSearch" 
              :disabled="searchLoading || !searchQuery"
              class="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
            >
              {{ searchLoading ? 'Searching...' : 'Search' }}
            </button>
          </div>
          
          <div v-if="searchResults" class="mt-4">
            <p class="font-semibold">Search Results: {{ searchResults.length }} found</p>
            <div v-if="searchResults.length > 0" class="mt-2 space-y-2 max-h-64 overflow-y-auto">
              <div 
                v-for="result in searchResults.slice(0, 5)" 
                :key="result.entry.id"
                class="p-2 bg-gray-50 rounded text-sm"
              >
                <strong>{{ result.entry.español }}</strong> → 
                <span class="text-blue-600">{{ result.entry.ndowe?.join(', ') || 'No translation' }}</span>
                <div v-if="result.score" class="text-xs text-gray-500">Score: {{ result.score?.toFixed(3) }}</div>
              </div>
            </div>
          </div>
          
          <div v-if="searchError" class="text-red-600">
            Error: {{ searchError }}
          </div>
        </div>
      </section>

      <!-- Dictionary Composable Test Section -->
      <section class="mb-8 p-4 border rounded-lg">
        <h2 class="text-xl font-semibold mb-4">🎯 Dictionary Composable Test</h2>
        <div class="space-y-2">
          <button 
            @click="testComposable" 
            :disabled="composableLoading"
            class="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50"
          >
            {{ composableLoading ? 'Testing...' : 'Test useDictionary Composable' }}
          </button>
          <div v-if="composableResult" class="mt-2">
            <p class="font-semibold">Composable Status: 
              <span :class="composableResult.success ? 'text-green-600' : 'text-red-600'">
                {{ composableResult.success ? '✅ Success' : '❌ Failed' }}
              </span>
            </p>
            <p v-if="composableResult.isReady">Ready: {{ composableResult.isReady }}</p>
            <p v-if="composableResult.entriesCount">Total Entries: {{ composableResult.entriesCount }}</p>
            <p v-if="composableResult.currentLanguage">Current Language: {{ composableResult.currentLanguage }}</p>
            <p v-if="composableResult.error" class="text-red-600">Error: {{ composableResult.error }}</p>
          </div>
        </div>
      </section>

      <!-- Performance Test Section -->
      <section class="mb-8 p-4 border rounded-lg">
        <h2 class="text-xl font-semibold mb-4">⚡ Performance Test</h2>
        <div v-if="performanceResults" class="space-y-2 text-sm">
          <p><strong>API Response Time:</strong> {{ performanceResults.apiTime }}ms</p>
          <p><strong>IndexedDB Init Time:</strong> {{ performanceResults.indexedDBTime }}ms</p>
          <p><strong>Search Time:</strong> {{ performanceResults.searchTime }}ms</p>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DictionaryApiResponse, DictionaryEntry, SearchResult, SearchQuery } from '~/types/dictionary'

// Test state
const apiLoading = ref(false)
const apiResult = ref<any>(null)

const indexedDBLoading = ref(false)  
const indexedDBResult = ref<any>(null)

const searchQuery = ref('casa')
const searchLanguage = ref<'spanish' | 'ndowe'>('spanish')
const searchLoading = ref(false)
const searchResults = ref<SearchResult[]>([])
const searchError = ref('')

const composableLoading = ref(false)
const composableResult = ref<any>(null)

const performanceResults = ref<any>(null)

// Test API endpoint
async function testApi() {
  apiLoading.value = true
  const startTime = performance.now()
  
  try {
    const response = await $fetch<DictionaryApiResponse>('/api/dictionary')
    const endTime = performance.now()
    
    apiResult.value = response
    
    if (!performanceResults.value) performanceResults.value = {}
    performanceResults.value.apiTime = Math.round(endTime - startTime)
    
  } catch (error) {
    apiResult.value = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  } finally {
    apiLoading.value = false
  }
}

// Test IndexedDB service
async function testIndexedDB() {
  indexedDBLoading.value = true
  const startTime = performance.now()
  
  try {
    // Import the IndexedDB service
    const { indexedDBService } = await import('~/services/indexedDB')
    
    // Test initialization (correct method name)
    await indexedDBService.initialize()
    
    // Test cache metadata and validation
    const cacheMetadata = await indexedDBService.getCacheMetadata()
    const isValid = await indexedDBService.isCacheValid()
    
    // Get enhanced entries count
    const enhancedEntries = await indexedDBService.getEnhancedEntries()
    
    const endTime = performance.now()
    
    indexedDBResult.value = {
      success: true,
      entriesCount: enhancedEntries.length,
      cacheValid: isValid,
      lastUpdate: cacheMetadata?.lastUpdated ? new Date(cacheMetadata.lastUpdated).toLocaleString() : 'N/A',
      cacheSize: cacheMetadata?.sizeBytes || 0
    }
    
    if (!performanceResults.value) performanceResults.value = {}
    performanceResults.value.indexedDBTime = Math.round(endTime - startTime)
    
  } catch (error) {
    indexedDBResult.value = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  } finally {
    indexedDBLoading.value = false
  }
}

// Test search service
async function testSearch() {
  searchLoading.value = true
  searchError.value = ''
  const startTime = performance.now()
  
  try {
    // Import the search service
    const { searchService } = await import('~/services/search')
    
    // Perform search with proper SearchQuery object
    const searchQueryObj: SearchQuery = {
      query: searchQuery.value,
      language: searchLanguage.value === 'spanish' ? 'español' : 'ndowe',
      mode: 'hybrid',
      limit: 10
    }
    
    const results = await searchService.search(searchQueryObj)
    
    const endTime = performance.now()
    
    searchResults.value = results
    
    if (!performanceResults.value) performanceResults.value = {}
    performanceResults.value.searchTime = Math.round(endTime - startTime)
    
  } catch (error) {
    searchError.value = error instanceof Error ? error.message : 'Unknown error'
    searchResults.value = []
  } finally {
    searchLoading.value = false
  }
}

// Test dictionary composable
async function testComposable() {
  composableLoading.value = true
  
  try {
    // Import and use the dictionary composable
    const { useDictionary } = await import('~/composables/useDictionary')
    const { isReady, search, currentLanguage, totalEntries, initialize } = useDictionary()
    
    // Test initialization (correct method name)
    await initialize()
    
    // Test search functionality with proper SearchQuery
    const searchQueryObj: SearchQuery = {
      query: 'casa',
      language: 'español',
      mode: 'hybrid',
      limit: 5
    }
    
    const testResults = await search(searchQueryObj)
    
    composableResult.value = {
      success: true,
      isReady: isReady.value,
      entriesCount: totalEntries.value,
      currentLanguage: currentLanguage.value,
      searchResults: testResults.slice(0, 3) // Show first 3 results
    }
    
  } catch (error) {
    composableResult.value = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  } finally {
    composableLoading.value = false
  }
}

// Auto-run some tests on mount
onMounted(() => {
  testApi()
  testIndexedDB()
})
</script>

<style scoped>
.test-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}
</style> 