// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  
  // TypeScript configuration
  typescript: {
    strict: true,
    typeCheck: false // Disabled for Phase 1 to avoid build issues
  },
  
  // CSS framework
  css: ['~/assets/styles/main.scss'],
  
  // Modules
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@vite-pwa/nuxt',
    '@vueuse/nuxt'
  ],
  
  // PWA Configuration
  pwa: {
    registerType: 'autoUpdate',
    workbox: {
      globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/api\./,
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'api-cache',
            cacheableResponse: {
              statuses: [0, 200]
            }
          }
        }
      ]
    },
    client: {
      installPrompt: true
    },
    manifest: {
      name: 'epàlwi-rèbbo',
      short_name: 'epàlwi-rèbbo',
      description: 'Diccionario Español-Ndowe offline',
      theme_color: '#D45B41',
      background_color: '#F2EDEB',
      display: 'standalone',
      start_url: '/',
      lang: 'es',
      icons: [
        {
          src: '/icons/icon-192x192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: '/icons/icon-512x512.png',
          sizes: '512x512',
          type: 'image/png'
        }
      ]
    }
  },
  

  
  // Build configuration
  build: {
    transpile: ['@stripe/stripe-js']
  },
  
  // Runtime config
  runtimeConfig: {
    // Private keys (only available on server-side)
    mailersendApiKey: process.env['MAILERSEND_API_KEY'] || '',
    stripeSecretKey: process.env['STRIPE_SECRET_KEY'] || '',
    stripeWebhookSecret: process.env['STRIPE_WEBHOOK_SECRET'] || '',
    googleSheetsApiKey: process.env['GOOGLE_SHEETS_API_KEY'] || '',
    
    // Public keys (exposed to client-side)
    public: {
      firebaseApiKey: process.env['NUXT_PUBLIC_FIREBASE_API_KEY'] || '',
      firebaseAuthDomain: process.env['NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN'] || '',
      firebaseProjectId: process.env['NUXT_PUBLIC_FIREBASE_PROJECT_ID'] || '',
      stripePublishableKey: process.env['NUXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'] || '',
      appUrl: process.env['NUXT_PUBLIC_APP_URL'] || 'http://localhost:3000'
    }
  },
  
  // Nitro configuration for serverless
  nitro: {
    preset: 'firebase'
  }
}) 