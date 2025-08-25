<template>
  <div id="app" class="min-h-screen bg-background">
    <!-- Skip link for accessibility -->
    <a href="#main-content" class="skip-link">
      Saltar al contenido principal
    </a>
    
    <!-- Main content -->
    <main id="main-content">
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
  background: var(--color-background);
}

::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: var(--border-radius);
}

::-webkit-scrollbar-thumb:hover {
  background: var(--color-secondary);
}
</style>
