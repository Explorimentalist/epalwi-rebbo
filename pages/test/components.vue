<script setup lang="ts">
import { ref, watch } from 'vue'
import LanguageToggle from '@/components/dictionary/LanguageToggle.vue'
import SearchBox from '@/components/dictionary/SearchBox.vue'
import SuggestionDropdown from '@/components/dictionary/SuggestionDropdown.vue'
import ResultCard from '@/components/dictionary/ResultCard.vue'
import NavBar from '@/components/ui/nav-bar.vue'
import PricingCard from '@/components/subscription/PricingCard.vue'

import PaymentConfirmation from '@/components/subscription/PaymentConfirmation.vue'
import { useMockAuth } from '@/composables/useMockAuth'

// Mock auth store for testing
const mockAuthStore = useMockAuth()

// Test data and states
const testStates = ref({
  inputValues: {
    name: '',
    email: 'pacodelcampo@mailinator',
    password: '',
    search: 'Casa'
  },
  modalOpen: false,
  selectedIcon: 'search',
  bannerDismissed: false,
  navigationBarTest: {
    isAuthenticated: false,
    currentPage: '/'
  }
})

// Sample validation function
const validateEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Available icons for testing
const availableIcons = [
  'search', 'menu', 'user', 'settings', 'heart', 'star', 
  'mail', 'bell', 'home', 'bookmark', 'share', 'download',
  'check', 'x', 'arrow-left', 'arrow-right', 'loader'
]

// Component status tracking
const componentStatus = ref({
  Icon: 'completed',
  Input: 'completed', 
  Modal: 'completed',
  EmptyState: 'completed',
  TrialBanner: 'completed',
  NavigationBar: 'testing',
  SearchBox: 'testing',
  SuggestionDropdown: 'testing',
  LanguageToggle: 'testing',
  ResultCard: 'completed',
  PricingCard: 'completed',

  PaymentConfirmation: 'completed'
})

// Test form state
const formData = ref({
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
  phone: '',
  website: ''
})

// Enhanced dictionary test data with language-aware functionality
const dictionaryTestData = ref({
  searchQuery: '',
  currentLanguage: 'spanish' as 'spanish' | 'ndowe',
  searchResults: [
    {
      id: '1',
      sourceWord: 'casa',
      targetWord: 'mbaddi',
      sourceLanguage: 'español' as const,
      targetLanguage: 'ndowe' as const,
      examples: [
        { source: 'Mi casa es grande', target: 'Am ndáála e woka' }
      ]
    },
    {
      id: '2',
      sourceWord: 'amigo',
      targetWord: 'amigo',
      sourceLanguage: 'español' as const,
      targetLanguage: 'ndowe' as const,
      examples: [
        { source: 'Mi mejor amigo', target: 'Am amigo e woka' },
        { source: 'Los amigos son importantes', target: 'Amigos e woka e woka' }
      ]
    },
    {
      id: '3',
      sourceWord: 'libro',
      targetWord: 'libro',
      sourceLanguage: 'español' as const,
      targetLanguage: 'ndowe' as const
    }
  ],
  suggestions: ['casa', 'casamiento', 'casado', 'casarse', 'caseta'],
  isSearching: false,
  showSuggestions: false,
  // Enhanced data for integration testing
  spanishSuggestions: {
    'cas': ['casa', 'casamiento', 'casado', 'casarse', 'caseta'],
    'am': ['amar', 'amigo', 'amable', 'amarillo', 'amor'],
    'com': ['comer', 'comida', 'compañero', 'comenzar'],
    'trab': ['trabajo', 'trabajar', 'trabajador', 'trabajoso']
  },
  ndoweSuggestions: {
    'mb': ['mbaddi', 'mboka', 'mba', 'mbale'],
    'am': ['am', 'ama', 'amigo', 'amor'],
    'wa': ['woka', 'wale', 'wamba', 'wambo'],
    'ba': ['baddi', 'boka', 'bale', 'bamba']
  }
})

// ResultCard test data for different scenarios
const resultCardTestData = ref({
  spanishToNdowe: {
    id: '1',
    sourceWord: 'casa',
    targetWord: 'mbaddi',
    sourceLanguage: 'español' as const,
    targetLanguage: 'ndowe' as const,
    examples: [
      { source: 'Mi casa es grande', target: 'Am ndáála e woka' }
    ]
  },
  ndoweToSpanish: {
    id: '2',
    sourceWord: 'mbaddi',
    targetWord: 'casa',
    sourceLanguage: 'ndowe' as const,
    targetLanguage: 'español' as const,
    examples: [
      { source: 'Am ndáála e woka', target: 'Mi casa es grande' }
    ]
  },
  multipleExamples: {
    id: '3',
    sourceWord: 'amigo',
    targetWord: 'amigo',
    sourceLanguage: 'español' as const,
    targetLanguage: 'ndowe' as const,
    examples: [
      { source: 'Mi mejor amigo', target: 'Am amigo e woka' },
      { source: 'Los amigos son importantes', target: 'Amigos e woka e woka' },
      { source: 'Hacer amigos nuevos', target: 'Woka amigo e woka' }
    ]
  },
  noExamples: {
    id: '4',
    sourceWord: 'libro',
    targetWord: 'libro',
    sourceLanguage: 'español' as const,
    targetLanguage: 'ndowe' as const
  },
  longWords: {
    id: '5',
    sourceWord: 'supercalifragilisticexpialidocious',
    targetWord: 'supercalifragilisticexpialidocious',
    sourceLanguage: 'español' as const,
    targetLanguage: 'ndowe' as const,
    examples: [
      { source: 'That word is supercalifragilisticexpialidocious', target: 'Ese palabra e supercalifragilisticexpialidocious' }
    ]
  }
})

// Form validation
const formErrors = ref({
  email: '',
  password: '',
  confirmPassword: ''
})

const validateForm = () => {
  formErrors.value.email = formData.value.email && !validateEmail(formData.value.email) 
    ? 'Please enter a valid email address' : ''
  
  formErrors.value.password = formData.value.password && formData.value.password.length < 6 
    ? 'Password must be at least 6 characters' : ''
  
  formErrors.value.confirmPassword = formData.value.confirmPassword && 
    formData.value.confirmPassword !== formData.value.password 
    ? 'Passwords do not match' : ''
}

watch(formData, validateForm, { deep: true })

// Meta for SEO
useSeoMeta({
  title: 'Component Testing - epàlwi-rèbbo',
  description: 'Interactive component testing and showcase page'
})

// Subscription test data
const subscriptionTestData = ref({
  plans: [
    {
      id: 'monthly',
      title: 'Plan Mensual',
      price: 1,
      period: 'por mes',
      features: [
        'Acceso completo al diccionario',
        'Búsqueda offline',
        'Cancela cuando quieras'
      ],
      icon: 'credit-card',
      popular: false,
      savings: 0,
      priceId: 'price_monthly'
    },
    {
      id: 'annual',
      title: 'Plan Anual',
      price: 8.97,
      period: 'por año',
      features: [
        'Acceso completo al diccionario',
        'Búsqueda offline',
        'Cancela cuando quieras',
        'Sincronización',
        'Soporte prioritario'
      ],
      icon: 'trophy',
      popular: true,
      savings: 3.03,
      priceId: 'price_annual'
    }
  ],
  selectedPlan: null as any,
  
  showPaymentConfirmation: false,
  paymentStatus: 'idle' as 'idle' | 'processing' | 'success' | 'error'
})

// Subscription methods
const handlePlanSelection = (plan: any) => {
  console.log('Plan selected:', plan)
  subscriptionTestData.value.selectedPlan = plan
  subscriptionTestData.value.showPaymentConfirmation = true
  subscriptionTestData.value.paymentStatus = 'success'
}

const handlePaymentSuccess = (paymentIntent: any) => {
  console.log('Payment success:', paymentIntent)
  subscriptionTestData.value.paymentStatus = 'success'
  subscriptionTestData.value.showPaymentConfirmation = true
}

const handlePaymentError = (error: string) => {
  console.log('Payment error:', error)
  subscriptionTestData.value.paymentStatus = 'error'
  subscriptionTestData.value.showPaymentConfirmation = true
}

const handlePaymentConfirmationClose = () => {
  subscriptionTestData.value.showPaymentConfirmation = false
  subscriptionTestData.value.paymentStatus = 'idle'
  subscriptionTestData.value.selectedPlan = null
}

const handlePaymentConfirmationAction = (action: string) => {
  console.log('Payment confirmation action:', action)
  if (action === 'go-to-dictionary') {
    // Navigate to dictionary
    handlePaymentConfirmationClose()
  } else if (action === 'view-invoice') {
    // Show invoice
    console.log('Showing invoice for plan:', subscriptionTestData.value.selectedPlan)
  }
}

const handlePaymentRetry = () => {
  subscriptionTestData.value.paymentStatus = 'idle'
  subscriptionTestData.value.showPaymentConfirmation = false
}

// Dictionary Integration Methods
const handleLanguageChange = (language: 'spanish' | 'ndowe') => {
  console.log('Language changed to:', language)
  dictionaryTestData.value.currentLanguage = language
  
  // Clear search when language changes
  dictionaryTestData.value.searchQuery = ''
  dictionaryTestData.value.suggestions = []
  dictionaryTestData.value.showSuggestions = false
  dictionaryTestData.value.isSearching = false
  dictionaryTestData.value.searchResults = []
}

const handleLanguagesSwapped = (from: 'spanish' | 'ndowe', to: 'spanish' | 'ndowe') => {
  console.log(`Languages swapped from ${from} to ${to}`)
  
  // Update current language to match the new position
  dictionaryTestData.value.currentLanguage = to
  
  // Clear search state when languages are swapped
  dictionaryTestData.value.searchQuery = ''
  dictionaryTestData.value.suggestions = []
  dictionaryTestData.value.showSuggestions = false
  dictionaryTestData.value.isSearching = false
  dictionaryTestData.value.searchResults = []
}

const handleSuggestionSelect = (suggestion: string) => {
  console.log('Selected suggestion:', suggestion)
  dictionaryTestData.value.searchQuery = suggestion
  dictionaryTestData.value.showSuggestions = false
  
  // Simulate search after selection
  handleSearch(suggestion)
}

const handleSearch = (query: string) => {
  console.log('Search with suggestions:', query)
  
  if (!query.trim()) {
    dictionaryTestData.value.suggestions = []
    dictionaryTestData.value.showSuggestions = false
    dictionaryTestData.value.searchResults = []
    return
  }
  
  // Simulate search delay
  dictionaryTestData.value.isSearching = true
  
  setTimeout(() => {
    const currentLanguage = dictionaryTestData.value.currentLanguage
    const suggestions = currentLanguage === 'spanish' 
      ? dictionaryTestData.value.spanishSuggestions
      : dictionaryTestData.value.ndoweSuggestions
    
    // Find matching suggestions
    const matchingSuggestions = Object.entries(suggestions)
      .filter(([prefix]) => query.toLowerCase().startsWith(prefix))
      .flatMap(([, words]) => words)
      .filter(word => word.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 6) // Limit to 6 suggestions
    
    dictionaryTestData.value.suggestions = matchingSuggestions
    dictionaryTestData.value.showSuggestions = matchingSuggestions.length > 0
    dictionaryTestData.value.isSearching = false
    
    // Generate search results based on the query
    generateSearchResults(query, currentLanguage)
  }, 300)
}

// New function to generate realistic search results
const generateSearchResults = (query: string, language: 'spanish' | 'ndowe') => {
  const results = []
  
  // Generate different results based on language and query
  if (language === 'spanish') {
    if (query.toLowerCase().startsWith('cas')) {
      results.push({
        id: '1',
        sourceWord: query.toLowerCase(),
        targetWord: 'mbaddi',
        sourceLanguage: 'español' as const,
        targetLanguage: 'ndowe' as const,
        examples: [
          { source: 'Mi casa es grande', target: 'Am ndáála e woka' }
        ]
      })
    } else if (query.toLowerCase().startsWith('am')) {
      results.push({
        id: '2',
        sourceWord: query.toLowerCase(),
        targetWord: 'amigo',
        sourceLanguage: 'español' as const,
        targetLanguage: 'ndowe' as const,
        examples: [
          { source: 'Mi mejor amigo', target: 'Am amigo e woka' }
        ]
      })
    } else if (query.toLowerCase().startsWith('com')) {
      results.push({
        id: '3',
        sourceWord: query.toLowerCase(),
        targetWord: 'comer',
        sourceLanguage: 'español' as const,
        targetLanguage: 'ndowe' as const,
        examples: [
          { source: 'Vamos a comer', target: 'Woka woka' }
        ]
      })
    } else {
      // Generic result for other queries
      results.push({
        id: '4',
        sourceWord: query.toLowerCase(),
        targetWord: query.toLowerCase(),
        sourceLanguage: 'español' as const,
        targetLanguage: 'ndowe' as const
      })
    }
  } else {
    // Ndowe language results
    if (query.toLowerCase().startsWith('mb')) {
      results.push({
        id: '5',
        sourceWord: query.toLowerCase(),
        targetWord: 'casa',
        sourceLanguage: 'ndowe' as const,
        targetLanguage: 'español' as const,
        examples: [
          { source: 'Am ndáála e woka', target: 'Mi casa es grande' }
        ]
      })
    } else if (query.toLowerCase().startsWith('am')) {
      results.push({
        id: '6',
        sourceWord: query.toLowerCase(),
        targetWord: 'amigo',
        sourceLanguage: 'ndowe' as const,
        targetLanguage: 'español' as const,
        examples: [
          { source: 'Am amigo e woka', target: 'Mi mejor amigo' }
        ]
      }
      )
    } else {
      // Generic result for other queries
      results.push({
        id: '7',
        sourceWord: query.toLowerCase(),
        targetWord: query.toLowerCase(),
        sourceLanguage: 'ndowe' as const,
        targetLanguage: 'español' as const
      })
    }
  }
  
  dictionaryTestData.value.searchResults = results
}

const handleSearchFocus = () => {
  if (dictionaryTestData.value.searchQuery && dictionaryTestData.value.suggestions.length > 0) {
    dictionaryTestData.value.showSuggestions = true
  }
}

const getSearchPlaceholder = () => {
  const currentLanguage = dictionaryTestData.value.currentLanguage
  return currentLanguage === 'spanish' 
    ? 'Buscar en español...' 
    : 'Buscar en ndowe...'
}

const getTranslationDirection = () => {
  return dictionaryTestData.value.currentLanguage === 'spanish' 
    ? 'spanish-to-ndowe' 
    : 'ndowe-to-spanish'
}

// Test control methods
const testSpanishSearch = () => {
  dictionaryTestData.value.currentLanguage = 'spanish'
  dictionaryTestData.value.searchQuery = 'cas'
  handleSearch('cas')
}

const testNdoweSearch = () => {
  dictionaryTestData.value.currentLanguage = 'ndowe'
  dictionaryTestData.value.searchQuery = 'mb'
  handleSearch('mb')
}

const clearAll = () => {
  dictionaryTestData.value.searchQuery = ''
  dictionaryTestData.value.suggestions = []
  dictionaryTestData.value.showSuggestions = false
  dictionaryTestData.value.isSearching = false
  dictionaryTestData.value.searchResults = []
}

const swapLanguages = () => {
  const currentLanguage = dictionaryTestData.value.currentLanguage
  const newLanguage = currentLanguage === 'spanish' ? 'ndowe' : 'spanish'
  handleLanguageChange(newLanguage)
}
</script>

<template>
  <div class="min-h-screen bg-[#F2EDEB] text-gray-800">
    <!-- Enhanced Navigation Bar with Glow Effects -->
    <div class="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
      <EnhancedNavBar />
    </div>
    
    <!-- Original NavigationBar Component -->
    <NavigationBar />
    
    <!-- Header -->
    <div class="bg-white shadow-sm border-b">
      <div class="container mx-auto px-4 py-6">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 class="text-3xl font-bold text-gray-800">Component Testing</h1>
            <p class="text-gray-600 mt-2">Interactive showcase of all Phase 4A components</p>
          </div>
          <div class="flex flex-col sm:flex-row gap-4">
            <NuxtLink to="/" class="text-[#D45B41] hover:underline text-center">
              ← Back to Dictionary
            </NuxtLink>
            <NuxtLink to="/test" class="text-[#D45B41] hover:underline text-center">
              ← Phase 3 Tests
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <div class="container mx-auto px-4 py-8 mt-16">
      <!-- NavigationBar Component (Fixed Position) -->
      <div class="mb-8">
        <h2 class="text-2xl font-semibold mb-4">📱 NavigationBar Component</h2>
        <div class="bg-gray-100 rounded-lg p-4 border-2 border-dashed border-gray-300">
          <p class="text-sm text-gray-600 mb-4 text-center">
            The NavigationBar is positioned fixed at the top of the page. 
            Scroll up to see it in action, or use the test controls below.
          </p>
          
          <!-- Test Controls -->
          <div class="flex flex-wrap justify-center gap-4 mb-4">
            <button 
              @click="() => { mockAuthStore.isAuthenticated = !mockAuthStore.isAuthenticated }"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              {{ mockAuthStore.isAuthenticated ? 'Log Out' : 'Log In' }}
            </button>
            
            <button 
              @click="testStates.navigationBarTest.currentPage = testStates.navigationBarTest.currentPage === '/' ? '/ayuda' : '/'"
              class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              Toggle Page: {{ testStates.navigationBarTest.currentPage === '/' ? 'Home' : 'Ayuda' }}
            </button>
          </div>

          <!-- Component Status -->
          <div class="flex justify-center">
            <div class="grid grid-cols-2 gap-6 text-sm">
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full" :class="mockAuthStore.isAuthenticated ? 'bg-green-500' : 'bg-gray-400'"></span>
                <span class="text-gray-600">Auth:</span>
                <span class="font-medium">{{ mockAuthStore.isAuthenticated ? 'Logged In' : 'Logged Out' }}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full" :class="testStates.navigationBarTest.currentPage === '/' ? 'bg-blue-500' : 'bg-green-500'"></span>
                <span class="text-gray-600">Page:</span>
                <span class="font-medium">{{ testStates.navigationBarTest.currentPage === '/' ? 'Home' : 'Ayuda' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Component Status Overview -->
      <div class="mb-8">
        <h2 class="text-2xl font-semibold mb-4">📊 Component Status Overview</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div 
            v-for="(status, component) in componentStatus" 
            :key="component"
            class="bg-white rounded-lg p-4 shadow-sm border"
          >
            <div class="flex items-center justify-between">
              <h3 class="font-medium">{{ component }}</h3>
              <span 
                class="px-2 py-1 text-xs rounded-full"
                :class="status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'"
              >
                {{ status }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Icon Component Testing -->
      <div class="mb-12">
        <h2 class="text-2xl font-semibold mb-6">🧩 Icon Component</h2>
        
        <!-- Size Variants -->
        <div class="bg-white rounded-lg p-6 shadow-sm border mb-6">
          <h3 class="text-lg font-medium mb-4">Size Variants</h3>
          <div class="flex items-center gap-6 flex-wrap">
            <div class="flex flex-col items-center gap-2">
              <Icon name="search" size="sm" />
              <span class="text-xs">sm (12px)</span>
            </div>
            <div class="flex flex-col items-center gap-2">
              <Icon name="search" size="base" />
              <span class="text-xs">base (16px)</span>
            </div>
            <div class="flex flex-col items-center gap-2">
              <Icon name="search" size="md" />
              <span class="text-xs">md (20px)</span>
            </div>
            <div class="flex flex-col items-center gap-2">
              <Icon name="search" size="lg" />
              <span class="text-xs">lg (24px)</span>
            </div>
            <div class="flex flex-col items-center gap-2">
              <Icon name="search" size="xl" />
              <span class="text-xs">xl (32px)</span>
            </div>
          </div>
        </div>

        <!-- Icon Gallery -->
        <div class="bg-white rounded-lg p-6 shadow-sm border mb-6">
          <h3 class="text-lg font-medium mb-4">Icon Gallery</h3>
          <div class="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4">
            <div 
              v-for="iconName in availableIcons" 
              :key="iconName"
              class="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              @click="testStates.selectedIcon = iconName"
            >
              <Icon :name="iconName" size="md" class="text-gray-700" />
              <span class="text-xs text-center text-gray-600">{{ iconName }}</span>
            </div>
          </div>
        </div>

        <!-- Interactive Icon Test -->
        <div class="bg-white rounded-lg p-6 shadow-sm border">
          <h3 class="text-lg font-medium mb-4">Interactive Test</h3>
          <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
            <label class="font-medium text-gray-800">Selected Icon:</label>
            <select 
              v-model="testStates.selectedIcon" 
              class="px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option v-for="icon in availableIcons" :key="icon" :value="icon">
                {{ icon }}
              </option>
            </select>
            <div class="flex items-center gap-2">
              <Icon :name="testStates.selectedIcon" size="md" class="text-blue-600" />
              <span class="text-sm text-gray-600">← Live Preview</span>
            </div>
          </div>
          <div class="p-4 bg-gray-100 rounded-lg">
            <code class="text-sm text-gray-800">
              &lt;Icon name="{{ testStates.selectedIcon }}" size="md" /&gt;
            </code>
          </div>
        </div>
      </div>

      <!-- Input Component Testing -->
      <div class="mb-12">
        <h2 class="text-2xl font-semibold mb-6">📝 Input Component</h2>
        
        <!-- Modern Form Layout - Responsive Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Basic Inputs -->
          <div class="bg-gray-100 rounded-lg p-6 space-y-4">
            <h3 class="text-lg font-medium text-gray-800 mb-4">Basic Input</h3>
            <Input
              v-model="testStates.inputValues.name"
              label="Full Name"
              placeholder="Enter your full name"
            />
            <p class="text-sm text-gray-600">Value: {{ testStates.inputValues.name || 'Empty' }}</p>
          </div>

          <!-- Email Input with Validation -->
          <div class="bg-gray-100 rounded-lg p-6 space-y-4">
            <h3 class="text-lg font-medium text-gray-800 mb-4">Email with Validation</h3>
            <Input
              v-model="testStates.inputValues.email"
              label="Email Address"
              type="email"
              placeholder="Enter your email"
              :error="testStates.inputValues.email && !validateEmail(testStates.inputValues.email) ? 'Please enter a valid email' : ''"
              :show-validation-icons="true"
            />
            <p class="text-sm text-gray-600">
              Valid: {{ testStates.inputValues.email ? validateEmail(testStates.inputValues.email) ? '✅' : '❌' : 'N/A' }}
            </p>
          </div>

          <!-- Password Input -->
          <div class="bg-gray-100 rounded-lg p-6 space-y-4">
            <h3 class="text-lg font-medium text-gray-800 mb-4">Password Input</h3>
            <Input
              v-model="testStates.inputValues.password"
              label="Password"
              type="password"
              placeholder="Enter your password"
            />
            <p class="text-sm text-gray-600">Length: {{ testStates.inputValues.password.length }}</p>
          </div>

          <!-- Search with Icon -->
          <div class="bg-gray-100 rounded-lg p-6 space-y-4">
            <h3 class="text-lg font-medium text-gray-800 mb-4">Search with Icon</h3>
            <Input
              v-model="testStates.inputValues.search"
              label="Search Dictionary"
              type="search"
              placeholder="Search for a word..."
            />
            <p class="text-sm text-gray-600">Value: {{ testStates.inputValues.search || 'Empty' }}</p>
          </div>
        </div>

        <!-- Complete Form Example -->
        <div class="mt-8">
          <div class="bg-gray-100 rounded-lg p-6 space-y-4">
            <h3 class="text-lg font-medium text-gray-800 mb-6">Input States Demo</h3>
            
            <!-- Two-column layout on desktop, single column on mobile -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-4">
                <Input
                  v-model="formData.fullName"
                  label="Full Name"
                  placeholder="Enter your full name"
                  required
                />
                
                <Input
                  v-model="formData.email"
                  label="Email Address"
                  type="email"
                  placeholder="your.email@example.com"
                  :error="formErrors.email"
                  required
                />
                
                <Input
                  v-model="formData.phone"
                  label="Phone Number"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  helper-text="We'll never share your phone number"
                />
              </div>
              
              <div class="space-y-4">
                <Input
                  v-model="formData.password"
                  label="Password"
                  type="password"
                  placeholder="Create a strong password"
                  :error="formErrors.password"
                  required
                />
                
                <Input
                  v-model="formData.confirmPassword"
                  label="Confirm Password"
                  type="password"
                  placeholder="Repeat your password"
                  :error="formErrors.confirmPassword"
                  required
                />
                
                <Input
                  v-model="formData.website"
                  label="Website (Optional)"
                  type="url"
                  placeholder="https://yourwebsite.com"
                  helper-text="Personal or business website"
                />
              </div>
            </div>
            
            <!-- Form Actions -->
            <div class="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-200">
              <button class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                Submit Form
              </button>
              <button class="px-6 py-3 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Component Testing -->
      <div class="mb-12">
        <h2 class="text-2xl font-semibold mb-6">🪟 Modal Component</h2>
        
        <div class="bg-white rounded-lg p-6 shadow-sm border">
          <h3 class="text-lg font-medium mb-4">Interactive Modal</h3>
          <button 
            @click="testStates.modalOpen = true"
            class="px-6 py-3 bg-[#D45B41] text-white rounded-lg hover:bg-[#B8412F] transition-colors focus:ring-2 focus:ring-[#D45B41] focus:ring-offset-2"
          >
            Open Modal
          </button>
          
          <Modal v-model="testStates.modalOpen">
            <div class="bg-gray-100 p-6 space-y-4">
              <h3 class="text-xl font-semibold text-gray-800">Test Modal</h3>
              <p class="text-gray-600">This is a responsive modal component with proper accessibility features.</p>
              
              <div class="space-y-4">
                <Input
                  v-model="testStates.inputValues.name"
                  label="Your Name"
                  placeholder="Enter your name"
                />
                
                <div class="flex flex-col sm:flex-row gap-3">
                  <button 
                    @click="testStates.modalOpen = false"
                    class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Save Changes
                  </button>
                  <button 
                    @click="testStates.modalOpen = false"
                    class="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </Modal>
        </div>
      </div>

      <!-- EmptyState Component Testing -->
      <div class="mb-12">
        <h2 class="text-2xl font-semibold mb-6">🔍 EmptyState Component</h2>
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Default Empty State -->
          <div class="bg-white rounded-lg p-6 shadow-sm border">
            <h3 class="text-lg font-medium mb-4">Default Empty State</h3>
            <EmptyState 
              iconName="search"
              title="No results found"
              description="Try adjusting your search terms"
            />
          </div>

          <!-- Custom Empty State -->
          <div class="bg-white rounded-lg p-6 shadow-sm border">
            <h3 class="text-lg font-medium mb-4">Custom Empty State</h3>
            <EmptyState 
              iconName="loader"
              title="Dictionary Loading..."
              description="Please wait while we prepare your content"
              :show-action="false"
            />
          </div>
        </div>
      </div>

      <!-- TrialBanner Component Testing -->
      <div class="mb-12">
        <h2 class="text-2xl font-semibold mb-6">🎯 TrialBanner Component</h2>
        
        <div class="bg-white rounded-lg p-6 shadow-sm border">
          <h3 class="text-lg font-medium mb-4">Trial Banner</h3>
          <TrialBanner :days-remaining="14" />
          
          <div class="mt-4 p-4 bg-gray-50 rounded-lg">
            <p class="text-sm text-gray-600 mb-2">Test Controls:</p>
            <button 
              @click="() => { 
                if (process.client) localStorage.removeItem('trial-banner-dismissed'); 
                testStates.bannerDismissed = false; 
                $forceUpdate(); 
              }"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              Reset Banner
            </button>
          </div>
        </div>
      </div>

      <!-- NavigationBar Component Testing -->
      <div class="mb-12">
        <h2 class="text-2xl font-semibold mb-6">📱 NavigationBar Component</h2>
        
        <div class="bg-white rounded-lg p-6 shadow-sm border mb-6">
          <h3 class="text-lg font-medium mb-4">Navigation Bar Demo</h3>
          <p class="text-gray-600 mb-4">The NavigationBar is positioned fixed at the top. Scroll down to see it in action.</p>
          
          <!-- Test Controls -->
          <div class="flex flex-wrap gap-4 mb-6">
            <button 
              @click="() => { mockAuthStore.isAuthenticated = !mockAuthStore.isAuthenticated }"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {{ mockAuthStore.isAuthenticated ? 'Log Out' : 'Log In' }}
            </button>
            
            <button 
              @click="testStates.navigationBarTest.currentPage = testStates.navigationBarTest.currentPage === '/' ? '/ayuda' : '/'"
              class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Toggle Page: {{ testStates.navigationBarTest.currentPage === '/' ? 'Home' : 'Ayuda' }}
            </button>
          </div>

          <!-- Component Status -->
          <div class="p-4 bg-gray-50 rounded-lg">
            <h4 class="text-sm font-medium text-gray-800 mb-3">Component Status</h4>
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full" :class="mockAuthStore.isAuthenticated ? 'bg-green-500' : 'bg-gray-400'"></span>
                <span class="text-gray-600">Authentication:</span>
                <span class="font-medium">{{ mockAuthStore.isAuthenticated ? 'Logged In' : 'Logged Out' }}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full" :class="testStates.navigationBarTest.currentPage === '/' ? 'bg-blue-500' : 'bg-green-500'"></span>
                <span class="text-gray-600">Current Page:</span>
                <span class="font-medium">{{ testStates.navigationBarTest.currentPage === '/' ? 'Home' : 'Ayuda' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Responsive Testing -->
        <div class="bg-white rounded-lg p-6 shadow-sm border mb-6">
          <h3 class="text-lg font-medium mb-4">Responsive Behavior Testing</h3>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- Mobile Layout -->
            <div class="space-y-4">
              <h4 class="text-sm font-medium text-gray-800 text-center">📱 Mobile (≤768px)</h4>
              <div class="border-2 border-blue-200 rounded-lg p-4 max-w-sm mx-auto">
                <div class="text-xs text-gray-500 mb-2">Hamburger menu, stacked layout</div>
                <div class="h-16 bg-gray-100 rounded flex items-center justify-between px-6">
                  <div class="flex items-center gap-3">
                    <div class="w-6 h-6 bg-blue-500 rounded"></div>
                    <span class="text-sm font-medium">epàlwi-rèbbo</span>
                  </div>
                  <div class="w-6 h-6 bg-gray-400 rounded"></div>
                </div>
              </div>
            </div>
            
            <!-- Tablet Layout -->
            <div class="space-y-4">
              <h4 class="text-sm font-medium text-gray-800 text-center">💻 Tablet (768px-1024px)</h4>
              <div class="border-2 border-green-200 rounded-lg p-4 max-w-md mx-auto">
                <div class="text-xs text-gray-500 mb-2">Hamburger menu, wider layout</div>
                <div class="h-16 bg-gray-100 rounded flex items-center justify-between px-8">
                  <div class="flex items-center gap-3">
                    <div class="w-6 h-6 bg-blue-500 rounded"></div>
                    <span class="text-sm font-medium">epàlwi-rèbbo</span>
                  </div>
                  <div class="w-6 h-6 bg-gray-400 rounded"></div>
                </div>
              </div>
            </div>
            
            <!-- Desktop Layout -->
            <div class="space-y-4">
              <h4 class="text-sm font-medium text-gray-800 text-center">🖥️ Desktop (≥1024px)</h4>
              <div class="border-2 border-purple-200 rounded-lg p-4 max-w-lg mx-auto">
                <div class="text-xs text-gray-500 mb-2">Full navigation, account dropdown</div>
                <div class="h-16 bg-gray-100 rounded flex items-center justify-between px-12">
                  <div class="flex items-center gap-3">
                    <div class="w-6 h-6 bg-blue-500 rounded"></div>
                    <span class="text-sm font-medium">epàlwi-rèbbo</span>
                  </div>
                  <div class="flex items-center gap-6">
                    <span class="text-xs text-gray-600">Diccionario</span>
                    <span class="text-xs text-gray-600">Ayuda</span>
                    <span class="text-xs text-gray-600">Mi Cuenta</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Feature Testing -->
        <div class="bg-white rounded-lg p-6 shadow-sm border">
          <h3 class="text-lg font-medium mb-4">Feature Testing</h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Authentication States -->
            <div class="space-y-4">
              <h4 class="text-sm font-medium text-gray-800">🔐 Authentication States</h4>
              
              <div class="space-y-3">
                <div class="p-3 bg-gray-50 rounded-lg">
                  <div class="flex items-center gap-2 mb-2">
                    <span class="w-2 h-2 rounded-full bg-red-500"></span>
                    <span class="text-sm font-medium">Logged Out</span>
                  </div>
                  <div class="text-xs text-gray-600 space-y-1">
                    <p>• Shows "Iniciar Sesión" button on desktop</p>
                    <p>• Shows hamburger menu on mobile</p>
                    <p>• No account dropdown</p>
                  </div>
                </div>
                
                <div class="p-3 bg-gray-50 rounded-lg">
                  <div class="flex items-center gap-2 mb-2">
                    <span class="w-2 h-2 rounded-full bg-green-500"></span>
                    <span class="text-sm font-medium">Logged In</span>
                  </div>
                  <div class="text-xs text-gray-600 space-y-1">
                    <p>• Shows "Mi Cuenta" dropdown on desktop</p>
                    <p>• Account menu items in mobile menu</p>
                    <p>• Sign out functionality</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Navigation Features -->
            <div class="space-y-4">
              <h4 class="text-sm font-medium text-gray-800">🧭 Navigation Features</h4>
              
              <div class="space-y-3">
                <div class="p-3 bg-blue-50 rounded-lg">
                  <div class="flex items-center gap-2 mb-2">
                    <span class="text-blue-600">✓</span>
                    <span class="text-sm font-medium">Active Page Highlighting</span>
                  </div>
                  <div class="text-xs text-blue-700">
                    Current page shows filled background
                  </div>
                </div>
                
                <div class="p-3 bg-green-50 rounded-lg">
                  <div class="flex items-center gap-2 mb-2">
                    <span class="text-green-600">✓</span>
                    <span class="text-sm font-medium">Responsive Design</span>
                  </div>
                  <div class="text-xs text-green-700">
                    Adapts to mobile, tablet, and desktop
                  </div>
                </div>
                
                <div class="p-3 bg-purple-50 rounded-lg">
                  <div class="flex items-center gap-2 mb-2">
                    <span class="text-purple-600">✓</span>
                    <span class="text-sm font-medium">Accessibility</span>
                  </div>
                  <div class="text-xs text-purple-700">
                    ARIA labels, keyboard navigation, focus management
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Test Instructions -->
          <div class="mt-6 p-4 bg-yellow-50 rounded-lg">
            <h4 class="text-sm font-medium text-yellow-800 mb-3">🧪 Testing Instructions</h4>
            <div class="text-sm text-yellow-700 space-y-2">
              <p><strong>1. Responsive Testing:</strong> Resize your browser window to see mobile/desktop variants</p>
              <p><strong>2. Authentication Testing:</strong> Use the "Log In/Out" button to test different states</p>
              <p><strong>3. Navigation Testing:</strong> Click navigation items to see active states</p>
              <p><strong>4. Mobile Menu:</strong> On mobile, click the hamburger menu to open the slide-out menu</p>
              <p><strong>5. Account Dropdown:</strong> On desktop when logged in, click "Mi Cuenta" to see the dropdown</p>
              <p><strong>6. Keyboard Navigation:</strong> Use Tab to navigate and Escape to close menus</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Phase 4B: Dictionary Components -->
      <div class="mb-12">
        <h2 class="text-2xl font-semibold mb-6">🔍 Phase 4B: Dictionary Components</h2>

        <!-- LanguageToggle Testing -->
        <div class="bg-white rounded-lg p-6 shadow-sm border mb-6">
          <h3 class="text-lg font-medium mb-4">LanguageToggle Component</h3>
          <div class="max-w-md">
            <LanguageToggle
              :current-language="dictionaryTestData.currentLanguage"
              @language-change="(language) => {
                console.log('Language changed to:', language)
                dictionaryTestData.currentLanguage = language
              }"
              @languages-swapped="(from, to) => {
                console.log(`Languages swapped from ${from} to ${to}`)
                // You can add additional logic here like updating search direction
                // or clearing previous search results when languages change
              }"
            />
          </div>
          <div class="mt-4 space-y-2 text-sm">
            <p class="text-gray-600">
              <span class="font-medium">Current Language:</span> 
              <span class="font-medium text-blue-600">{{ dictionaryTestData.currentLanguage }}</span>
            </p>
            <p class="text-gray-600">
              <span class="font-medium">Instructions:</span> Click on either language button to toggle, or use the ↔️ swap button to exchange language positions
            </p>
            <p class="text-gray-600">
              <span class="font-medium">Features:</span> Active state highlighting, flag icons, position-swapping arrow button, responsive design
            </p>
            <p class="text-gray-600">
              <span class="font-medium">UX Pattern:</span> Google Translate style - the arrow button physically swaps the positions of languages
            </p>
            <p class="text-gray-600">
              <span class="font-medium">Current Positions:</span> 
              <span class="font-medium text-blue-600">Left: {{ dictionaryTestData.currentLanguage === 'spanish' ? 'Spanish' : 'Ndowe' }}</span> | 
              <span class="font-medium text-green-600">Right: {{ dictionaryTestData.currentLanguage === 'spanish' ? 'Ndowe' : 'Spanish' }}</span>
            </p>
          </div>
        </div>

        <!-- SearchBox + SuggestionDropdown Integration -->
        <div class="bg-white rounded-lg p-6 shadow-sm border mb-6">
          <h3 class="text-lg font-medium mb-4">SearchBox with Live Suggestions</h3>
          <div class="max-w-md">
            <SearchBox
              v-model="dictionaryTestData.searchQuery"
              placeholder="Type 'cas' to see suggestions..."
              :suggestions="dictionaryTestData.suggestions"
              :show-suggestions="dictionaryTestData.showSuggestions"
              @update:show-suggestions="dictionaryTestData.showSuggestions = $event"
              @suggestion-select="(suggestion) => {
                console.log('Selected suggestion:', suggestion)
                dictionaryTestData.searchQuery = suggestion
              }"
              @search="(query) => {
                console.log('Search with suggestions:', query)
                if (query.toLowerCase().startsWith('cas')) {
                  dictionaryTestData.suggestions = ['casa', 'casamiento', 'casado', 'casarse', 'caseta']
                  dictionaryTestData.showSuggestions = true
                } else if (query.toLowerCase().startsWith('am')) {
                  dictionaryTestData.suggestions = ['amar', 'amigo', 'amable', 'amarillo']
                  dictionaryTestData.showSuggestions = true
                } else {
                  dictionaryTestData.suggestions = []
                  dictionaryTestData.showSuggestions = false
                }
              }"
              @focus="() => {
                if (dictionaryTestData.searchQuery && dictionaryTestData.suggestions.length > 0) {
                  dictionaryTestData.showSuggestions = true
                }
              }"
            />
          </div>
          <div class="mt-4 space-y-2 text-sm">
            <p class="text-gray-600">
              <span class="font-medium">Instructions:</span> Type "cas" or "am" to see dynamic suggestions
            </p>
            <p class="text-gray-600">
              <span class="font-medium">Current suggestions:</span> 
              {{ dictionaryTestData.suggestions.join(', ') || 'None' }}
            </p>
            <p class="text-gray-600">
              <span class="font-medium">Showing suggestions:</span> 
              <span :class="dictionaryTestData.showSuggestions ? 'text-green-600' : 'text-red-600'">
                {{ dictionaryTestData.showSuggestions ? 'Yes' : 'No' }}
              </span>
            </p>
            <p class="text-gray-600">
              <span class="font-medium">Keyboard Navigation:</span> ↑↓ to navigate, Enter to select, Esc to close
            </p>
          </div>
        </div>
      </div>

      <!-- Dictionary Integration Testing -->
      <div class="mb-12">
        <h2 class="text-2xl font-semibold mb-6">🔗 Dictionary Integration Testing</h2>
        <p class="text-gray-600 mb-6">Testing how LanguageToggle and SearchBox work together as a cohesive dictionary interface</p>

        <!-- Complete Dictionary Interface -->
        <div class="bg-white rounded-lg p-6 shadow-sm border mb-6">
          <h3 class="text-lg font-medium mb-4">Complete Dictionary Interface</h3>
          
          <!-- Mobile Layout Simulation -->
          <div class="max-w-md mx-auto mb-8">
            <h4 class="text-sm font-medium text-gray-600 mb-3 text-center">📱 Mobile Layout (≤768px)</h4>
            <div class="space-y-4">
              <!-- Language Toggle -->
              <div class="flex justify-center">
                <LanguageToggle
                  :current-language="dictionaryTestData.currentLanguage"
                  @language-change="handleLanguageChange"
                  @languages-swapped="handleLanguagesSwapped"
                />
              </div>
              
              <!-- Search Box -->
              <div class="w-full">
                <SearchBox
                  v-model="dictionaryTestData.searchQuery"
                  :placeholder="getSearchPlaceholder()"
                  :suggestions="dictionaryTestData.suggestions"
                  :show-suggestions="dictionaryTestData.showSuggestions"
                  @update:show-suggestions="dictionaryTestData.showSuggestions = $event"
                  @suggestion-select="handleSuggestionSelect"
                  @search="handleSearch"
                  @focus="handleSearchFocus"
                />
              </div>
            </div>
          </div>

          <!-- Desktop Layout Simulation -->
          <div class="max-w-2xl mx-auto">
            <h4 class="text-sm font-medium text-gray-600 mb-3 text-center">💻 Desktop Layout (≥768px)</h4>
            <div class="flex flex-col items-center space-y-6">
              <!-- Language Toggle -->
              <div class="w-full max-w-md">
                <LanguageToggle
                  :current-language="dictionaryTestData.currentLanguage"
                  @language-change="handleLanguageChange"
                  @languages-swapped="handleLanguagesSwapped"
                />
              </div>
              
              <!-- Search Box -->
              <div class="w-full max-w-lg">
                <SearchBox
                  v-model="dictionaryTestData.searchQuery"
                  :placeholder="getSearchPlaceholder()"
                  :suggestions="dictionaryTestData.suggestions"
                  :show-suggestions="dictionaryTestData.showSuggestions"
                  @update:show-suggestions="dictionaryTestData.showSuggestions = $event"
                  @suggestion-select="handleSuggestionSelect"
                  @search="handleSearch"
                  @focus="handleSearchFocus"
                />
              </div>
            </div>
          </div>

          <!-- Integration Status Panel -->
          <div class="mt-8 p-4 bg-gray-50 rounded-lg">
            <h4 class="text-sm font-medium text-gray-800 mb-3">🔍 Integration Status</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div class="space-y-2">
                <div class="flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full" :class="dictionaryTestData.currentLanguage === 'spanish' ? 'bg-green-500' : 'bg-blue-500'"></span>
                  <span class="font-medium">Active Language:</span>
                  <span class="text-blue-600">{{ dictionaryTestData.currentLanguage === 'spanish' ? 'Spanish' : 'Ndowe' }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full" :class="dictionaryTestData.searchQuery ? 'bg-green-500' : 'bg-gray-400'"></span>
                  <span class="font-medium">Search Query:</span>
                  <span class="text-gray-600">{{ dictionaryTestData.searchQuery || 'None' }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full" :class="dictionaryTestData.showSuggestions ? 'bg-green-500' : 'bg-gray-400'"></span>
                  <span class="font-medium">Suggestions:</span>
                  <span class="text-gray-600">{{ dictionaryTestData.suggestions.length }} items</span>
                </div>
              </div>
              <div class="space-y-2">
                <div class="flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full" :class="dictionaryTestData.isSearching ? 'bg-yellow-500' : 'bg-gray-400'"></span>
                  <span class="font-medium">Search State:</span>
                  <span class="text-gray-600">{{ dictionaryTestData.isSearching ? 'Searching...' : 'Idle' }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full" :class="getTranslationDirection() === 'spanish-to-ndowe' ? 'bg-green-500' : 'bg-blue-500'"></span>
                  <span class="font-medium">Direction:</span>
                  <span class="text-gray-600">{{ getTranslationDirection() === 'spanish-to-ndowe' ? 'Spanish → Ndowe' : 'Ndowe → Spanish' }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full" :class="dictionaryTestData.searchQuery && dictionaryTestData.suggestions.length > 0 ? 'bg-green-500' : 'bg-gray-400'"></span>
                  <span class="font-medium">Integration:</span>
                  <span class="text-gray-600">{{ dictionaryTestData.searchQuery && dictionaryTestData.suggestions.length > 0 ? 'Active' : 'Waiting' }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Test Controls -->
          <div class="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 class="text-sm font-medium text-blue-800 mb-3">🧪 Test Controls</h4>
            <div class="flex flex-wrap gap-3">
              <button 
                @click="testSpanishSearch"
                class="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
              >
                Test Spanish Search
              </button>
              <button 
                @click="testNdoweSearch"
                class="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
              >
                Test Ndowe Search
              </button>
              <button 
                @click="clearAll"
                class="px-3 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
              >
                Clear All
              </button>
              <button 
                @click="swapLanguages"
                class="px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
              >
                Swap Languages
              </button>
            </div>
          </div>

          <!-- Integration Features Demo -->
          <div class="mt-6 p-4 bg-green-50 rounded-lg">
            <h4 class="text-sm font-medium text-green-800 mb-3">✨ Integration Features</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div class="space-y-2">
                <div class="flex items-center gap-2">
                  <span class="text-green-600">✓</span>
                  <span>Dynamic placeholder based on language</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-green-600">✓</span>
                  <span>Language-aware search suggestions</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-green-600">✓</span>
                  <span>Coordinated state management</span>
                </div>
              </div>
              <div class="space-y-2">
                <div class="flex items-center gap-2">
                  <span class="text-green-600">✓</span>
                  <span>Responsive layout adaptation</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-green-600">✓</span>
                  <span>Keyboard navigation support</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-green-600">✓</span>
                  <span>Accessibility compliance</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ResultCard Component Testing -->
      <div class="mb-12">
        <h2 class="text-2xl font-semibold mb-6">📇 ResultCard Component Testing</h2>
        <p class="text-gray-600 mb-6">Testing the ResultCard component with different translation scenarios and integration patterns</p>

        <!-- Basic ResultCard Demonstrations -->
        <div class="bg-white rounded-lg p-6 shadow-sm border mb-6">
          <h3 class="text-lg font-medium mb-4">Basic ResultCard Variations</h3>
          
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Spanish to Ndowe -->
            <div class="space-y-4">
              <h4 class="text-sm font-medium text-gray-800">Spanish → Ndowe</h4>
              <ResultCard
                :entry="resultCardTestData.spanishToNdowe"
                translation-direction="spanish-to-ndowe"
              />
            </div>

            <!-- Ndowe to Spanish -->
            <div class="space-y-4">
              <h4 class="text-sm font-medium text-gray-800">Ndowe → Spanish</h4>
              <ResultCard
                :entry="resultCardTestData.ndoweToSpanish"
                translation-direction="ndowe-to-spanish"
              />
            </div>
          </div>
        </div>

        <!-- Advanced ResultCard Scenarios -->
        <div class="bg-white rounded-lg p-6 shadow-sm border mb-6">
          <h3 class="text-lg font-medium mb-4">Advanced Scenarios</h3>
          
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Multiple Examples -->
            <div class="space-y-4">
              <h4 class="text-sm font-medium text-gray-800">Multiple Examples</h4>
              <ResultCard
                :entry="resultCardTestData.multipleExamples"
                translation-direction="spanish-to-ndowe"
              />
            </div>

            <!-- No Examples -->
            <div class="space-y-4">
              <h4 class="text-sm font-medium text-gray-800">No Examples</h4>
              <ResultCard
                :entry="resultCardTestData.noExamples"
                translation-direction="spanish-to-ndowe"
              />
            </div>
          </div>

          <!-- Long Words -->
          <div class="mt-6">
            <h4 class="text-sm font-medium text-gray-800 mb-4">Long Words & Text Wrapping</h4>
            <ResultCard
              :entry="resultCardTestData.longWords"
              translation-direction="spanish-to-ndowe"
            />
          </div>
        </div>

        <!-- ResultCard Integration with Search -->
        <div class="bg-white rounded-lg p-6 shadow-sm border mb-6">
          <h3 class="text-lg font-medium mb-4">Search Integration Demo</h3>
          <p class="text-gray-600 mb-4">Demonstrating how ResultCard integrates with the search system</p>
          
          <div class="space-y-6">
            <!-- Search Interface -->
            <div class="max-w-md mx-auto">
              <LanguageToggle
                :current-language="dictionaryTestData.currentLanguage"
                @language-change="handleLanguageChange"
                @languages-swapped="handleLanguagesSwapped"
              />
            </div>
            
            <div class="max-w-lg mx-auto">
              <SearchBox
                v-model="dictionaryTestData.searchQuery"
                :placeholder="getSearchPlaceholder()"
                :suggestions="dictionaryTestData.suggestions"
                :show-suggestions="dictionaryTestData.showSuggestions"
                @update:show-suggestions="dictionaryTestData.showSuggestions = $event"
                @suggestion-select="handleSuggestionSelect"
                @search="handleSearch"
                @focus="handleSearchFocus"
              />
            </div>

            <!-- Search Results Display -->
            <div class="space-y-4">
              <h4 class="text-sm font-medium text-gray-800 text-center">Search Results</h4>
              
              <div v-if="dictionaryTestData.searchResults.length > 0" class="space-y-4">
                <ResultCard
                  v-for="result in dictionaryTestData.searchResults"
                  :key="result.id"
                  :entry="result"
                  :translation-direction="getTranslationDirection()"
                />
              </div>
              
              <div v-else class="text-center text-gray-500 py-8">
                <p>No search results yet. Try searching for a word above.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- ResultCard Responsive Testing -->
        <div class="bg-white rounded-lg p-6 shadow-sm border mb-6">
          <h3 class="text-lg font-medium mb-4">Responsive Behavior Testing</h3>
          <p class="text-gray-600 mb-4">Test how ResultCard adapts to different screen sizes</p>
          
          <div class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div class="space-y-2">
                <div class="text-sm font-medium text-gray-800 text-center">Desktop (≥1024px)</div>
                <div class="border-2 border-blue-200 rounded-lg p-2">
                  <ResultCard
                    :entry="resultCardTestData.spanishToNdowe"
                    translation-direction="spanish-to-ndowe"
                  />
                </div>
              </div>
              
              <div class="space-y-2">
                <div class="text-sm font-medium text-gray-800 text-center">Tablet (≥768px)</div>
                <div class="border-2 border-green-200 rounded-lg p-2 max-w-md mx-auto">
                  <ResultCard
                    :entry="resultCardTestData.spanishToNdowe"
                    translation-direction="spanish-to-ndowe"
                  />
                </div>
              </div>
              
              <div class="space-y-2">
                <div class="text-sm font-medium text-gray-800 text-center">Mobile (≤480px)</div>
                <div class="border-2 border-purple-200 rounded-lg p-2 max-w-sm mx-auto">
                  <ResultCard
                    :entry="resultCardTestData.spanishToNdowe"
                    translation-direction="spanish-to-ndowe"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ResultCard Accessibility Testing -->
        <div class="bg-white rounded-lg p-6 shadow-sm border">
          <h3 class="text-lg font-medium mb-4">Accessibility Features</h3>
          <p class="text-gray-600 mb-4">Testing accessibility compliance and screen reader support</p>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-4">
              <h4 class="text-sm font-medium text-gray-800">Semantic Structure</h4>
              <div class="p-4 bg-gray-50 rounded-lg text-sm space-y-2">
                <div class="flex items-center gap-2">
                  <span class="text-green-600">✓</span>
                  <span>Article tag with proper role</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-green-600">✓</span>
                  <span>Section tags for content organization</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-green-600">✓</span>
                  <span>Proper heading hierarchy</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-green-600">✓</span>
                  <span>ARIA labels and descriptions</span>
                </div>
              </div>
            </div>
            
            <div class="space-y-4">
              <h4 class="text-sm font-medium text-gray-800">Language Support</h4>
              <div class="p-4 bg-gray-50 rounded-lg text-sm space-y-2">
                <div class="flex items-center gap-2">
                  <span class="text-green-600">✓</span>
                  <span>Lang attributes for screen readers</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-green-600">✓</span>
                  <span>Bidirectional text support</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-green-600">✓</span>
                  <span>Proper text direction handling</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-green-600">✓</span>
                  <span>Keyboard navigation support</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Interactive Accessibility Test -->
          <div class="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 class="text-sm font-medium text-blue-800 mb-3">Interactive Test</h4>
            <p class="text-sm text-blue-700 mb-3">Tab to this ResultCard and use arrow keys to test focus management:</p>
            
            <ResultCard
              :entry="resultCardTestData.spanishToNdowe"
              translation-direction="spanish-to-ndowe"
              tabindex="0"
              class="focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            />
          </div>
        </div>
      </div>

      <!-- Real-World Integration Demo -->
      <div class="mb-12">
        <h2 class="text-2xl font-semibold mb-6">🌍 Real-World Integration Demo</h2>
        <p class="text-gray-600 mb-6">Demonstrating how the integrated components handle real user scenarios and edge cases</p>

        <!-- User Journey Simulation -->
        <div class="bg-white rounded-lg p-6 shadow-sm border mb-6">
          <h3 class="text-lg font-medium mb-4">👤 User Journey Simulation</h3>
          
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Journey Steps -->
            <div class="space-y-4">
              <h4 class="text-sm font-medium text-gray-800">Journey Steps</h4>
              <div class="space-y-3">
                <div class="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <span class="w-6 h-6 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                  <div>
                    <p class="text-sm font-medium text-blue-800">User lands on page</p>
                    <p class="text-xs text-blue-600">Default: Spanish → Ndowe, empty search</p>
                  </div>
                </div>
                
                <div class="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                  <span class="w-6 h-6 bg-green-500 text-white text-xs rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                  <div>
                    <p class="text-sm font-medium text-green-800">User types "cas"</p>
                    <p class="text-xs text-green-600">Shows Spanish suggestions, placeholder updates</p>
                  </div>
                </div>
                
                <div class="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                  <span class="w-6 h-6 bg-yellow-500 text-white text-xs rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                  <div>
                    <p class="text-sm font-medium text-yellow-800">User swaps languages</p>
                    <p class="text-xs text-yellow-600">Now Ndowe → Spanish, search clears, placeholder changes</p>
                  </div>
                </div>
                
                <div class="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                  <span class="w-6 h-6 bg-purple-500 text-white text-xs rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">4</span>
                  <div>
                    <p class="text-sm font-medium text-purple-800">User types "mb"</p>
                    <p class="text-xs text-purple-600">Shows Ndowe suggestions, different word set</p>
                  </div>
                </div>
                
                <div class="flex items-start gap-3 p-3 bg-indigo-50 rounded-lg">
                  <span class="w-6 h-6 bg-indigo-500 text-white text-xs rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">5</span>
                  <div>
                    <p class="text-sm font-medium text-indigo-800">User selects suggestion</p>
                    <p class="text-xs text-indigo-600">Search executes, ResultCard appears below</p>
                  </div>
                </div>
                
                <div class="flex items-start gap-3 p-3 bg-emerald-50 rounded-lg">
                  <span class="w-6 h-6 bg-emerald-500 text-white text-xs rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">6</span>
                  <div>
                    <p class="text-sm font-medium text-emerald-800">Results update in real-time</p>
                    <p class="text-xs text-emerald-600">Language changes, search clears, new results</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Live Demo -->
            <div class="space-y-4">
              <h4 class="text-sm font-medium text-gray-800">Live Demo</h4>
              <div class="p-4 bg-gray-50 rounded-lg">
                <!-- Compact Language Toggle -->
                <div class="flex justify-center mb-4">
                  <LanguageToggle
                    :current-language="dictionaryTestData.currentLanguage"
                    @language-change="handleLanguageChange"
                    @languages-swapped="handleLanguagesSwapped"
                  />
                </div>
                
                <!-- Compact Search Box -->
                <div class="w-full">
                  <SearchBox
                    v-model="dictionaryTestData.searchQuery"
                    :placeholder="getSearchPlaceholder()"
                    :suggestions="dictionaryTestData.suggestions"
                    :show-suggestions="dictionaryTestData.showSuggestions"
                    @update:show-suggestions="dictionaryTestData.showSuggestions = $event"
                    @suggestion-select="handleSuggestionSelect"
                    @search="handleSearch"
                    @focus="handleSearchFocus"
                  />
                </div>
                
                <!-- Quick Actions -->
                <div class="flex gap-2 mt-3">
                  <button 
                    @click="testSpanishSearch"
                    class="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                  >
                    Test Spanish
                  </button>
                  <button 
                    @click="testNdoweSearch"
                    class="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                  >
                    Test Ndowe
                  </button>
                  <button 
                    @click="swapLanguages"
                    class="px-2 py-1 bg-purple-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                  >
                    Swap
                  </button>
                </div>
              </div>
              
              <!-- Real-Time Search Results -->
              <div class="mt-6">
                <h4 class="text-sm font-medium text-gray-800 mb-3">🔍 Live Search Results</h4>
                
                <!-- Loading State -->
                <div v-if="dictionaryTestData.isSearching" class="p-4 bg-blue-50 rounded-lg text-center">
                  <div class="flex items-center justify-center gap-2 text-blue-600">
                    <div class="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span class="text-sm">Buscando...</span>
                  </div>
                </div>
                
                <!-- Search Results -->
                <div v-else-if="dictionaryTestData.searchResults.length > 0" class="space-y-4">
                  <div class="text-xs text-gray-500 text-center mb-2">
                    Mostrando {{ dictionaryTestData.searchResults.length }} resultado(s) para "{{ dictionaryTestData.searchQuery }}"
                  </div>
                  
                  <ResultCard
                    v-for="result in dictionaryTestData.searchResults"
                    :key="result.id"
                    :entry="result"
                    :translation-direction="getTranslationDirection()"
                  />
                </div>
                
                <!-- Empty State -->
                <div v-else-if="dictionaryTestData.searchQuery && !dictionaryTestData.isSearching" class="p-4 bg-gray-50 rounded-lg text-center">
                  <div class="text-gray-500">
                    <p class="text-sm">No se encontraron resultados para "{{ dictionaryTestData.searchQuery }}"</p>
                    <p class="text-xs mt-1">Intenta con otra palabra o cambia el idioma</p>
                  </div>
                </div>
                
                <!-- Initial State -->
                <div v-else class="p-4 bg-gray-50 rounded-lg text-center">
                  <div class="text-gray-500">
                    <p class="text-sm">Escribe una palabra arriba para ver resultados</p>
                    <p class="text-xs mt-1">Los resultados aparecerán aquí en tiempo real</p>
                  </div>
                </div>
              </div>
              
              <!-- Integration Status -->
              <div class="mt-4 p-3 bg-gray-100 rounded-lg">
                <h5 class="text-xs font-medium text-gray-700 mb-2">📊 Estado de la Integración</h5>
                <div class="grid grid-cols-2 gap-2 text-xs">
                  <div class="flex items-center gap-1">
                    <span class="w-2 h-2 rounded-full" :class="dictionaryTestData.currentLanguage === 'spanish' ? 'bg-green-500' : 'bg-blue-500'"></span>
                    <span class="text-gray-600">Idioma:</span>
                    <span class="font-medium">{{ dictionaryTestData.currentLanguage === 'spanish' ? 'ES' : 'ND' }}</span>
                  </div>
                  <div class="flex items-center gap-1">
                    <span class="w-2 h-2 rounded-full" :class="dictionaryTestData.searchQuery ? 'bg-green-500' : 'bg-gray-400'"></span>
                    <span class="text-gray-600">Búsqueda:</span>
                    <span class="font-medium">{{ dictionaryTestData.searchQuery || 'vacía' }}</span>
                  </div>
                  <div class="flex items-center gap-1">
                    <span class="w-2 h-2 rounded-full" :class="dictionaryTestData.suggestions.length > 0 ? 'bg-green-500' : 'bg-gray-400'"></span>
                    <span class="text-gray-600">Sugerencias:</span>
                    <span class="font-medium">{{ dictionaryTestData.suggestions.length }}</span>
                  </div>
                  <div class="flex items-center gap-1">
                    <span class="w-2 h-2 rounded-full" :class="dictionaryTestData.searchResults.length > 0 ? 'bg-green-500' : 'bg-gray-400'"></span>
                    <span class="text-gray-600">Resultados:</span>
                    <span class="font-medium">{{ dictionaryTestData.searchResults.length }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Edge Cases & Error Handling -->
        <div class="bg-white rounded-lg p-6 shadow-sm border mb-6">
          <h3 class="text-lg font-medium mb-4">⚠️ Edge Cases & Error Handling</h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Rapid Language Switching -->
            <div class="p-4 bg-yellow-50 rounded-lg">
              <h4 class="text-sm font-medium text-yellow-800 mb-2">🔄 Rapid Language Switching</h4>
              <p class="text-xs text-yellow-700 mb-3">Test rapid language changes to ensure state consistency</p>
              <div class="flex gap-2">
                <button 
                  @click="() => { handleLanguageChange('spanish'); if (process.client) setTimeout(() => handleLanguageChange('ndowe'), 100); }"
                  class="px-3 py-1 bg-yellow-600 text-white text-xs rounded hover:bg-yellow-700 transition-colors"
                >
                  Fast Switch
                </button>
                <button 
                  @click="() => { swapLanguages(); if (process.client) setTimeout(() => swapLanguages(), 200); }"
                  class="px-3 py-1 bg-yellow-600 text-white text-xs rounded hover:bg-yellow-700 transition-colors"
                >
                  Fast Swap
                </button>
              </div>
            </div>

            <!-- Search State Persistence -->
            <div class="p-4 bg-blue-50 rounded-lg">
              <h4 class="text-sm font-medium text-blue-800 mb-2">💾 Search State Persistence</h4>
              <p class="text-xs text-blue-700 mb-3">Verify search state is properly managed during language changes</p>
              <div class="space-y-2 text-xs">
                <div class="flex justify-between">
                  <span>Search Query:</span>
                  <span class="font-mono">{{ dictionaryTestData.searchQuery || 'empty' }}</span>
                </div>
                <div class="flex justify-between">
                  <span>Suggestions:</span>
                  <span class="font-mono">{{ dictionaryTestData.suggestions.length }}</span>
                </div>
                <div class="flex justify-between">
                  <span>Language:</span>
                  <span class="font-mono">{{ dictionaryTestData.currentLanguage }}</span>
                </div>
              </div>
            </div>

            <!-- Keyboard Navigation Stress Test -->
            <div class="p-4 bg-green-50 rounded-lg">
              <h4 class="text-sm font-medium text-green-800 mb-2">⌨️ Keyboard Navigation</h4>
              <p class="text-xs text-green-700 mb-3">Test keyboard interactions with suggestions open</p>
              <div class="text-xs space-y-1">
                <p>• Type to open suggestions</p>
                <p>• ↑↓ to navigate</p>
                <p>• Enter to select</p>
                <p>• Esc to close</p>
                <p>• Tab to move focus</p>
              </div>
            </div>

            <!-- Responsive Behavior -->
            <div class="p-4 bg-purple-50 rounded-lg">
              <h4 class="text-sm font-medium text-purple-800 mb-2">📱 Responsive Behavior</h4>
              <p class="text-xs text-purple-700 mb-3">Test layout adaptation across screen sizes</p>
              <div class="text-xs space-y-1">
                <p>• Mobile: Stacked layout</p>
                <p>• Tablet: Centered layout</p>
                <p>• Desktop: Horizontal layout</p>
                <p>• Touch targets: 48px min</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Performance Metrics -->
        <div class="bg-white rounded-lg p-6 shadow-sm border">
          <h3 class="text-lg font-medium mb-4">📊 Performance Metrics</h3>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- Search Response Time -->
            <div class="p-4 bg-gray-50 rounded-lg text-center">
              <div class="text-2xl font-bold text-blue-600 mb-1">
                {{ dictionaryTestData.isSearching ? '...' : '300ms' }}
              </div>
              <div class="text-sm text-gray-600">Search Response</div>
              <div class="text-xs text-gray-500 mt-1">Target: &lt;500ms</div>
            </div>

            <!-- State Updates -->
            <div class="p-4 bg-gray-50 rounded-lg text-center">
              <div class="text-2xl font-bold text-green-600 mb-1">
                {{ dictionaryTestData.showSuggestions ? 'Active' : 'Idle' }}
              </div>
              <div class="text-sm text-gray-600">Suggestions State</div>
              <div class="text-xs text-gray-500 mt-1">Real-time updates</div>
            </div>

            <!-- Language Switch -->
            <div class="p-4 bg-gray-50 rounded-lg text-center">
              <div class="text-2xl font-bold text-purple-600 mb-1">
                {{ dictionaryTestData.currentLanguage === 'spanish' ? 'ES→ND' : 'ND→ES' }}
              </div>
              <div class="text-sm text-gray-600">Translation Direction</div>
              <div class="text-xs text-gray-500 mt-1">Instant switching</div>
            </div>
          </div>

          <!-- Performance Notes -->
          <div class="mt-4 p-3 bg-blue-50 rounded-lg">
            <h4 class="text-sm font-medium text-blue-800 mb-2">🚀 Performance Notes</h4>
            <div class="text-xs text-blue-700 space-y-1">
              <p>• Debounced search (300ms) prevents excessive API calls</p>
              <p>• State updates are batched for smooth UI updates</p>
              <p>• Language switching clears search state for consistency</p>
              <p>• Suggestions are filtered client-side for instant feedback</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Integration Architecture & Patterns -->
      <div class="mb-12">
        <h2 class="text-2xl font-semibold mb-6">🏗️ Integration Architecture & Patterns</h2>
        <p class="text-gray-600 mb-6">Understanding the architectural decisions and coordination patterns that make the integrated dictionary interface work seamlessly</p>

        <!-- Component Coordination -->
        <div class="bg-white rounded-lg p-6 shadow-sm border mb-6">
          <h3 class="text-lg font-medium mb-4">🔗 Component Coordination Patterns</h3>
          
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- State Management -->
            <div class="space-y-4">
              <h4 class="text-sm font-medium text-gray-800">State Management</h4>
              <div class="space-y-3">
                <div class="p-3 bg-blue-50 rounded-lg">
                  <h5 class="text-sm font-medium text-blue-800 mb-2">Centralized State</h5>
                  <p class="text-xs text-blue-700">Single source of truth for language, search, and suggestions</p>
                  <code class="text-xs text-blue-600 block mt-1">dictionaryTestData.currentLanguage</code>
                </div>
                
                <div class="p-3 bg-green-50 rounded-lg">
                  <h5 class="text-sm font-medium text-green-800 mb-2">Coordinated Updates</h5>
                  <p class="text-xs text-green-700">Language changes trigger cascading state updates</p>
                  <code class="text-xs text-green-600 block mt-1">handleLanguageChange() → clearSearch()</code>
                </div>
                
                <div class="p-3 bg-yellow-50 rounded-lg">
                  <h5 class="text-sm font-medium text-yellow-800 mb-2">Event-Driven Communication</h5>
                  <p class="text-xs text-yellow-700">Components communicate via events, not direct references</p>
                  <code class="text-xs text-yellow-600 block mt-1">@language-change, @languages-swapped</code>
                </div>
              </div>
            </div>

            <!-- Data Flow -->
            <div class="space-y-4">
              <h4 class="text-sm font-medium text-gray-800">Data Flow</h4>
              <div class="space-y-3">
                <div class="p-3 bg-purple-50 rounded-lg">
                  <h5 class="text-sm font-medium text-purple-800 mb-2">Unidirectional Flow</h5>
                  <p class="text-xs text-purple-700">Data flows down, events flow up (Vue 3 pattern)</p>
                  <code class="text-xs text-purple-600 block mt-1">props → template → events → methods</code>
                </div>
                
                <div class="p-3 bg-indigo-50 rounded-lg">
                  <h5 class="text-sm font-medium text-indigo-800 mb-2">Reactive Updates</h5>
                  <p class="text-xs text-indigo-700">Vue's reactivity system handles UI updates automatically</p>
                  <code class="text-xs text-indigo-600 block mt-1">ref() + computed() + watch()</code>
                </div>
                
                <div class="p-3 bg-pink-50 rounded-lg">
                  <h5 class="text-sm font-medium text-pink-800 mb-2">Debounced Operations</h5>
                  <p class="text-xs text-pink-700">Search operations are debounced to prevent excessive calls</p>
                  <code class="text-xs text-pink-600 block mt-1">setTimeout() + clearTimeout()</code>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Subscription Components Testing -->
      <div class="mb-12">
        <h2 class="text-2xl font-semibold mb-6">💳 Subscription Components</h2>
        
        <!-- PricingCard Components -->
        <div class="bg-white rounded-lg p-6 shadow-sm border mb-6">
          <h3 class="text-lg font-medium mb-4">PricingCard Components</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PricingCard
              v-for="plan in subscriptionTestData.plans"
              :key="plan.id"
              :plan="plan"
              :is-selected="subscriptionTestData.selectedPlan?.id === plan.id"
              @plan-selected="handlePlanSelection"
            />
          </div>
          
          <div class="mt-4 p-3 bg-blue-50 rounded-lg">
            <h5 class="text-sm font-medium text-blue-800 mb-2">Interactive Features</h5>
            <p class="text-xs text-blue-700">Click on plans to select them and trigger the payment flow</p>
          </div>
        </div>
        

        
        <!-- PaymentConfirmation Component -->
        <div v-if="subscriptionTestData.showPaymentConfirmation" class="bg-white rounded-lg p-6 shadow-sm border mb-6">
          <h3 class="text-lg font-medium mb-4">PaymentConfirmation Component</h3>
          <PaymentConfirmation
            :is-visible="subscriptionTestData.showPaymentConfirmation"
            :status-type="subscriptionTestData.paymentStatus"
            :plan-details="subscriptionTestData.paymentStatus === 'success' ? {
              name: subscriptionTestData.selectedPlan?.title || '',
              price: `€${subscriptionTestData.selectedPlan?.price || 0} ${subscriptionTestData.selectedPlan?.period || ''}`,
              nextBilling: '15 de enero 2025'
            } : undefined"
            :error-details="subscriptionTestData.paymentStatus === 'error' ? {
              code: 'PAYMENT_FAILED',
              suggestion: 'Verifica que tu tarjeta tenga fondos suficientes y que la información sea correcta.'
            } : undefined"
            :primary-action="subscriptionTestData.paymentStatus === 'success' ? {
              text: 'Ir al Diccionario',
              action: 'go-to-dictionary'
            } : subscriptionTestData.paymentStatus === 'error' ? {
              text: 'Intentar de Nuevo',
              action: 'retry'
            } : undefined"
            @primary-action="(action) => action === 'retry' ? handlePaymentRetry() : handlePaymentConfirmationAction(action)"
            :secondary-action="subscriptionTestData.paymentStatus === 'success' ? {
              text: 'Ver Factura',
              action: 'view-invoice'
            } : subscriptionTestData.paymentStatus === 'error' ? {
              text: 'Cancelar',
              action: 'cancel'
            } : undefined"
            @close="handlePaymentConfirmationClose"
            @secondary-action="(action) => action === 'cancel' ? handlePaymentConfirmationClose() : handlePaymentConfirmationAction(action)"
          />
          
          <div class="mt-4 p-3 bg-purple-50 rounded-lg">
            <h5 class="text-sm font-medium text-purple-800 mb-2">Modal States</h5>
            <p class="text-xs text-purple-700">The modal shows different content based on payment status: success, error, or processing.</p>
          </div>
        </div>
        
        <!-- Test Controls -->
        <div class="bg-white rounded-lg p-6 shadow-sm border mb-6">
          <h3 class="text-lg font-medium mb-4">Test Controls</h3>
          <div class="flex flex-wrap gap-4">
            <button 
              @click="() => { subscriptionTestData.selectedPlan = null; subscriptionTestData.showPaymentConfirmation = false; }"
              class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
            >
              Reset Flow
            </button>
            
            <button 
              @click="() => { subscriptionTestData.paymentStatus = 'processing'; subscriptionTestData.showPaymentConfirmation = true; }"
              class="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm"
            >
              Show Processing State
            </button>
            
            <button 
              @click="() => { subscriptionTestData.paymentStatus = 'error'; subscriptionTestData.showPaymentConfirmation = true; }"
              class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
            >
              Show Error State
            </button>
          </div>
        </div>
      </div>

      <!-- Design System Preview -->
      <div class="mb-12">
        <h2 class="text-2xl font-semibold mb-6">🎨 Design System Preview</h2>
        
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Color Palette -->
          <div class="bg-white rounded-lg p-6 shadow-sm border">
            <h3 class="text-lg font-medium mb-4">Color Palette</h3>
            <div class="space-y-3">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 bg-[#D45B41] rounded"></div>
                <span class="text-sm">Primary (#D45B41)</span>
              </div>
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 bg-[#F2EDEB] border rounded"></div>
                <span class="text-sm">Background (#F2EDEB)</span>
              </div>
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 bg-gray-800 rounded"></div>
                <span class="text-sm">Text (gray-800)</span>
              </div>
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 bg-gray-100 border rounded"></div>
                <span class="text-sm">Form BG (gray-100)</span>
              </div>
            </div>
          </div>

          <!-- Spacing System -->
          <div class="bg-white rounded-lg p-6 shadow-sm border">
            <h3 class="text-lg font-medium mb-4">8px Spacing System</h3>
            <div class="space-y-2">
              <div class="flex items-center gap-3">
                <div class="w-4 h-4 bg-blue-500"></div>
                <span class="text-sm">space-4 (16px)</span>
              </div>
              <div class="flex items-center gap-3">
                <div class="w-6 h-6 bg-blue-500"></div>
                <span class="text-sm">space-6 (24px)</span>
              </div>
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 bg-blue-500"></div>
                <span class="text-sm">space-8 (32px)</span>
              </div>
            </div>
          </div>

          <!-- Typography -->
          <div class="bg-white rounded-lg p-6 shadow-sm border">
            <h3 class="text-lg font-medium mb-4">Typography</h3>
            <div class="space-y-2">
              <p class="text-3xl font-bold">Heading (3xl)</p>
              <p class="text-lg font-medium">Subheading (lg)</p>
              <p class="text-base">Body text (base)</p>
              <p class="text-sm text-gray-600">Caption (sm)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Additional responsive utilities */
.container {
  max-width: 1200px;
}

/* Custom scrollbar for better UX */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #D45B41;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #B8412F;
}

/* Focus styles for accessibility */
button:focus-visible,
select:focus-visible {
  outline: 2px solid #3B82F6;
  outline-offset: 2px;
}

/* Smooth transitions for all interactive elements */
button,
select,
input {
  transition: all 0.2s ease-in-out;
}
</style> 