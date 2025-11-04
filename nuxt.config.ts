// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  // Disable DevTools in production builds to avoid pulling heavy, dev-only deps
  devtools: { enabled: process.env.NODE_ENV !== 'production' },
  
  // SSR configuration - disabled for debugging
  ssr: false,
  
  // TypeScript configuration
  typescript: {
    strict: true,
    typeCheck: false // Disabled for Phase 1 to avoid build issues
  },
  
  // CSS framework
  css: ['~/assets/styles/main.scss'],
  
  // Modules configuration
  // Note: Order matters - some modules depend on others being loaded first
  modules: [
    // Tailwind handled via PostCSS to avoid ESM/CJS issues
    '@pinia/nuxt',
    '@vite-pwa/nuxt',
    '@vueuse/nuxt',
    '@nuxt/icon' // Provides <NuxtIcon> component
  ],

  // Configure PostCSS explicitly so Tailwind runs without the Nuxt module
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {}
    }
  },
  
  // Icon configuration
  // Uses @iconify-json packages from devDependencies:
  // - @iconify-json/heroicons: Main icon set for UI elements
  // - @iconify-json/lucide: Additional icons for specific features
  // - @iconify-json/mdi: Material Design icons for fallback
  icon: {
    // Avoids name collision with our local components/common/Icon.vue
    componentName: 'NuxtIcon',
    size: '24px',
    class: 'icon',
    mode: 'svg',
    aliases: {
      'nuxt': 'logos:nuxt-icon',
    },
    // Server-side rendering configuration
    serverBundle: {
      collections: ['heroicons', 'lucide', 'mdi']
    },
    // Client-side configuration  
    clientBundle: {
      scan: true,
      sizeLimitKb: 256,
      // Force include commonly used icons
      icons: [
        'heroicons:magnifying-glass',
        'heroicons:bars-3', 
        'heroicons:user',
        'heroicons:cog-6-tooth',
        'heroicons:heart',
        'heroicons:star',
        'heroicons:envelope',
        'heroicons:bell',
        'heroicons:home',
        'heroicons:bookmark',
        'heroicons:share',
        'heroicons:arrow-down-tray',
        'heroicons:check',
        'heroicons:x-mark',
        'heroicons:arrow-left',
        'heroicons:arrow-right',
        'heroicons:arrow-path'
      ]
    }
  },
  
  // PWA Configuration
  pwa: {
    // Avoid terser/minify issues during SW generation
    minify: false,
    // Allow disabling PWA (eg, in CI/dev) via env
    disable: process.env.PWA_DISABLE === 'true',
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

  // Vite configuration for unhead module resolution
  vite: {
    optimizeDeps: {
      include: ['unhead', '@unhead/vue'],
      // Force pre-bundling of unhead modules to avoid runtime resolution issues
      force: process.env.VERCEL === '1'
    }
  },
  
  // Runtime config
  runtimeConfig: {
    // Private keys (only available on server-side)
    jwtSecret: process.env['JWT_SECRET'] || '',
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
      stripeMonthlyPriceId: process.env['NUXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID'] || '',
      stripeAnnualPriceId: process.env['NUXT_PUBLIC_STRIPE_ANNUAL_PRICE_ID'] || '',
      appUrl: process.env['NUXT_PUBLIC_APP_URL'] || 'http://localhost:4000',
      // Dev fallback to mock auth endpoints by default unless explicitly disabled
      devAuthMock: (process.env['NUXT_PUBLIC_DEV_AUTH_MOCK'] ?? (process.env['NODE_ENV'] !== 'production' ? 'true' : 'false')) === 'true',
      // Connect to Firebase emulators in dev only when explicitly enabled
      useFirebaseEmulators: (process.env['NUXT_PUBLIC_USE_FIREBASE_EMULATORS'] ?? 'false') === 'true'
    }
  },
  
  // Auto-imports configuration
  imports: {
    dirs: [
      'services/**',
      'composables/**',
      'utils/**'
    ]
  },
  
  // Nitro configuration for serverless
  nitro: {
    // Use the correct adapter based on the platform
    preset: process.env.VERCEL ? 'vercel' : 'firebase'
  },

  // Components auto-import configuration
  components: {
    dirs: [
      { path: '~/components', pathPrefix: false }
    ],
    global: true
  }
})
