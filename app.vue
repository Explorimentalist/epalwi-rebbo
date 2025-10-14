<template>
  <div id="app" class="min-h-screen bg-background">
    <!-- Main content -->
    <main>
      <NuxtPage />
    </main>
  </div>
</template>

<script setup lang="ts">
// Meta configuration for PWA
useHead({
  title: 'epàlwi-rèbbo - Diccionario Español-Ndowe',
  meta: [
    { 
      name: 'description', 
      content: 'Diccionario offline para preservar el idioma Ndowe. Traduce entre español y ndowe sin conexión.' 
    },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { name: 'theme-color', content: '#D45B41' },
    { name: 'apple-mobile-web-app-capable', content: 'yes' },
    { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
    { name: 'apple-mobile-web-app-title', content: 'epàlwi-rèbbo' },
  ],
  link: [
    { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
    { rel: 'apple-touch-icon', href: '/icons/icon-192x192.png' },
    { rel: 'manifest', href: '/manifest.json' }
  ]
})

// PWA install prompt (simplified for Phase 1)
const showInstallPrompt = ref(false)

// Initialize authentication and subscription systems
const authStore = useAuthStore()
const subscriptionStore = useSubscriptionStore()

onMounted(async () => {
  try {
    // Initialize subscription plans with price IDs from environment
    subscriptionStore.initializePlans()
    
    // Initialize authentication listener
    await authStore.initializeAuth()
    
    console.log('✅ Application initialized successfully')
  } catch (error) {
    console.error('❌ Application initialization failed:', error)
  }
})

// Log for development
if (process.dev) {
  console.log('Application loaded in development mode')
}
</script>

<style lang="scss">
// Import global styles
@use '~/assets/styles/main.scss';

// App-specific styles
#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

// Ensure main content takes available space
main {
  flex: 1;
}

// Custom scrollbar (WebKit only)
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: var(--ds-background);
}

::-webkit-scrollbar-thumb {
  background: var(--ds-border);
  border-radius: var(--ds-radius);
}

::-webkit-scrollbar-thumb:hover {
  background: var(--ds-secondary);
}
</style>
