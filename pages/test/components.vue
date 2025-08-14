<script setup lang="ts">
import { ref, watch } from 'vue'

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
  bannerDismissed: false
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
  TrialBanner: 'completed'
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
</script>

<template>
  <div class="min-h-screen bg-[#F2EDEB] text-gray-800">
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

    <div class="container mx-auto px-4 py-8">
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
              <AppIcon name="search" size="sm" />
              <span class="text-xs">sm (12px)</span>
            </div>
            <div class="flex flex-col items-center gap-2">
              <AppIcon name="search" size="base" />
              <span class="text-xs">base (16px)</span>
            </div>
            <div class="flex flex-col items-center gap-2">
              <AppIcon name="search" size="md" />
              <span class="text-xs">md (20px)</span>
            </div>
            <div class="flex flex-col items-center gap-2">
              <AppIcon name="search" size="lg" />
              <span class="text-xs">lg (24px)</span>
            </div>
            <div class="flex flex-col items-center gap-2">
              <AppIcon name="search" size="xl" />
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
              <AppIcon :name="iconName" size="md" class="text-gray-700" />
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
              <AppIcon :name="testStates.selectedIcon" size="md" class="text-blue-600" />
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
              leading-icon="user"
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
              leading-icon="mail"
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
              leading-icon="settings"
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
              leading-icon="search"
              trailing-icon="x"
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
                  leading-icon="user"
                  required
                />
                
                <Input
                  v-model="formData.email"
                  label="Email Address"
                  type="email"
                  placeholder="your.email@example.com"
                  leading-icon="mail"
                  :error="formErrors.email"
                  required
                />
                
                <Input
                  v-model="formData.phone"
                  label="Phone Number"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  leading-icon="bell"
                  helper-text="We'll never share your phone number"
                />
              </div>
              
              <div class="space-y-4">
                <Input
                  v-model="formData.password"
                  label="Password"
                  type="password"
                  placeholder="Create a strong password"
                  leading-icon="settings"
                  :error="formErrors.password"
                  required
                />
                
                <Input
                  v-model="formData.confirmPassword"
                  label="Confirm Password"
                  type="password"
                  placeholder="Repeat your password"
                  leading-icon="check"
                  :error="formErrors.confirmPassword"
                  required
                />
                
                <Input
                  v-model="formData.website"
                  label="Website (Optional)"
                  type="url"
                  placeholder="https://yourwebsite.com"
                  leading-icon="share"
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
                  leading-icon="user"
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
              title="No results found"
              description="Try adjusting your search terms"
            />
          </div>

          <!-- Custom Empty State -->
          <div class="bg-white rounded-lg p-6 shadow-sm border">
            <h3 class="text-lg font-medium mb-4">Custom Empty State</h3>
            <EmptyState 
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
          <TrialBanner />
          
          <div class="mt-4 p-4 bg-gray-50 rounded-lg">
            <p class="text-sm text-gray-600 mb-2">Test Controls:</p>
            <button 
              @click="() => { 
                localStorage.removeItem('trial-banner-dismissed'); 
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