# epàlwi-rèbbo Development Plan
## Step-by-Step Implementation Guide

### Phase 1: Project Setup & Foundation (Week 1)

#### 1.1 Initial Project Structure
```bash
# Create Vue 3 PWA project
vue create epalwi-rebbo --preset pwa
cd epalwi-rebbo
npm install @vue/cli-plugin-pwa
```

#### 1.2 Dependencies Installation
```bash
# Core dependencies
npm install firebase @stripe/stripe-js vue-router@4 pinia
npm install sass @types/node vite-plugin-pwa workbox-window
npm install vue-i18n@9 fuse.js localforage

# Dev dependencies
npm install -D @types/jest @vue/test-utils cypress eslint-plugin-vue
```

#### 1.3 Project Structure
```
src/
├── assets/
│   ├── styles/
│   │   ├── _variables.scss
│   │   ├── _spacing.scss
│   │   ├── _components.scss
│   │   └── main.scss
├── components/
│   ├── common/
│   ├── auth/
│   ├── dictionary/
│   └── subscription/
├── views/
├── stores/
├── services/
├── utils/
└── types/
```

#### 1.4 Design System Implementation
Create CSS variables and utilities:
```scss
// _variables.scss
:root {
  --space-unit: 8px;
  --space-1: calc(var(--space-unit) * 0.125);
  --space-2: calc(var(--space-unit) * 0.25);
  --space-3: calc(var(--space-unit) * 0.5);
  --space-4: var(--space-unit);
  --space-5: calc(var(--space-unit) * 1.5);
  --space-6: calc(var(--space-unit) * 2);
  --space-7: calc(var(--space-unit) * 2.5);
  --space-8: calc(var(--space-unit) * 3);
  --space-9: calc(var(--space-unit) * 4);
  --space-10: calc(var(--space-unit) * 5);
  
  --color-error: #D61515;
  --color-success: #257940;
  --color-background: #F2EDEB;
  --color-primary: #FFFFFF;
  --color-secondary: #D45B41;
  --color-text: #333333;
  
  --border-radius: 8px;
  --shadow: rgba(0,0,0,0.2) 2px 2px 5px;
}
```

### Phase 2: Authentication System (Week 2)

#### 2.1 Firebase Configuration
```typescript
// services/firebase.ts
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getFunctions } from 'firebase/functions'

const firebaseConfig = {
  // Config from Firebase Console
}

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const functions = getFunctions(app)
```

#### 2.2 Auth Store with Pinia
```typescript
// stores/auth.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const isAuthenticated = computed(() => !!user.value)
  const subscriptionStatus = ref('trial')
  
  const sendMagicLink = async (email: string) => {
    // MailerSend magic link implementation
  }
  
  const verifyMagicLink = async (token: string) => {
    // JWT verification and user creation
  }
  
  return {
    user,
    isAuthenticated,
    subscriptionStatus,
    sendMagicLink,
    verifyMagicLink
  }
})
```

#### 2.3 Cloud Functions for Auth
```typescript
// functions/src/auth.ts
import { onRequest } from 'firebase-functions/v2/https'
import { MailerSend, EmailParams } from 'mailersend'

export const sendMagicLink = onRequest(async (req, res) => {
  const { email } = req.body
  const token = generateJWT(email)
  
  // Send magic link via MailerSend
  const mailerSend = new MailerSend({
    apiKey: process.env.MAILERSEND_API_KEY
  })
  
  const emailParams = new EmailParams()
    .setFrom({ email: 'noreply@epalwi-rebbo.com' })
    .setTo([{ email }])
    .setSubject('Tu enlace de acceso')
    .setTemplateId('template_id')
    .setVariables([
      { email, substitutions: [{ var: 'magic_link', value: `${process.env.APP_URL}/auth/verify?token=${token}` }] }
    ])
  
  await mailerSend.email.send(emailParams)
  res.json({ success: true })
})
```

### Phase 3: Dictionary & Search System (Week 3)

#### 3.1 Dictionary Data Structure
```typescript
// types/dictionary.ts
export interface DictionaryEntry {
  id: string
  spanish: string
  ndowe: string
  tags: string[]
  category: string
  examples?: { spanish: string; ndowe: string }[]
}

export interface SearchIndex {
  spanish: Map<string, string[]>
  ndowe: Map<string, string[]>
  trie: TrieNode
}
```

#### 3.2 IndexedDB Service
```typescript
// services/indexedDB.ts
import localforage from 'localforage'

export class DictionaryDB {
  private db: LocalForage
  
  constructor() {
    this.db = localforage.createInstance({
      name: 'epalwi-dictionary',
      storeName: 'entries'
    })
  }
  
  async loadDictionary(): Promise<DictionaryEntry[]> {
    const cached = await this.db.getItem<DictionaryEntry[]>('dictionary')
    if (cached) return cached
    
    // Fetch from network and cache
    const response = await fetch('/api/dictionary')
    const data = await response.json()
    await this.db.setItem('dictionary', data)
    return data
  }
  
  async buildSearchIndex(entries: DictionaryEntry[]): Promise<SearchIndex> {
    // Build trie and inverted index for fast search
  }
}
```

#### 3.3 Search Service
```typescript
// services/search.ts
import Fuse from 'fuse.js'

export class SearchService {
  private fuse: Fuse<DictionaryEntry>
  private index: SearchIndex
  
  constructor(entries: DictionaryEntry[]) {
    this.fuse = new Fuse(entries, {
      keys: ['spanish', 'ndowe'],
      threshold: 0.3,
      includeScore: true
    })
    this.index = this.buildIndex(entries)
  }
  
  search(query: string, language: 'spanish' | 'ndowe'): DictionaryEntry[] {
    // Combine exact matches from trie with fuzzy matches from Fuse
  }
  
  autocomplete(query: string, language: 'spanish' | 'ndowe'): string[] {
    // Return suggestions from trie
  }
}
```

### Phase 4: UI Components (Week 4)

#### 4.1 Base Components
```vue
<!-- components/common/BaseButton.vue -->
<template>
  <button
    :class="[
      'btn',
      `btn--${variant}`,
      `btn--${size}`,
      { 'btn--loading': loading }
    ]"
    :disabled="disabled || loading"
    @click="$emit('click', $event)"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
interface Props {
  variant: 'primary' | 'secondary' | 'ghost'
  size: 'small' | 'medium' | 'large'
  loading?: boolean
  disabled?: boolean
}

defineProps<Props>()
defineEmits<{
  click: [event: MouseEvent]
}>()
</script>
```

#### 4.2 Dictionary Components
```vue
<!-- components/dictionary/SearchBox.vue -->
<template>
  <div class="search-box">
    <input
      v-model="query"
      :placeholder="placeholder"
      class="search-input"
      @input="onInput"
      @focus="showSuggestions = true"
    />
    
    <div v-if="showSuggestions && suggestions.length" class="suggestions">
      <div
        v-for="suggestion in suggestions"
        :key="suggestion"
        class="suggestion-item"
        @click="selectSuggestion(suggestion)"
      >
        {{ suggestion }}
      </div>
    </div>
  </div>
</template>
```

#### 4.3 Language Toggle
```vue
<!-- components/dictionary/LanguageToggle.vue -->
<template>
  <div class="language-toggle">
    <button
      :class="['toggle-btn', { active: currentLanguage === 'spanish' }]"
      @click="setLanguage('spanish')"
    >
      Español
    </button>
    <button
      :class="['toggle-btn', { active: currentLanguage === 'ndowe' }]"
      @click="setLanguage('ndowe')"
    >
      Ndowe
    </button>
  </div>
</template>
```

### Phase 5: Stripe Integration (Week 5)

#### 5.1 Stripe Products & Prices Setup
**Required Stripe Dashboard Configuration:**

1. **Monthly Plan**
   - Product: "epàlwi-rèbbo Monthly"
   - Price: €1.00/month (recurring)
   - Price ID: `price_monthly_xxx`

2. **Annual Plan** 
   - Product: "epàlwi-rèbbo Annual"
   - Price: €8.97/year (recurring)
   - Price ID: `price_annual_xxx`

3. **Free Trial Configuration**
   - 14-day trial period for all new subscriptions
   - Trial ends automatically, converts to paid subscription

#### 5.2 Subscription Service
```typescript
// services/subscription.ts
import { loadStripe } from '@stripe/stripe-js'

export class SubscriptionService {
  private stripe = loadStripe(process.env.VUE_APP_STRIPE_PUBLIC_KEY!)
  
  async createCheckoutSession(priceId: string): Promise<void> {
    const stripe = await this.stripe
    const { sessionId } = await this.callCloudFunction('createCheckoutSession', {
      priceId,
      userId: this.auth.currentUser?.uid
    })
    
    await stripe?.redirectToCheckout({ sessionId })
  }
  
  async createPortalSession(): Promise<void> {
    const { url } = await this.callCloudFunction('createPortalSession', {
      userId: this.auth.currentUser?.uid
    })
    window.location.href = url
  }
}
```

#### 5.3 Subscription Cloud Functions
```typescript
// functions/src/subscription.ts
import { stripe } from './stripe-config'
import { onRequest } from 'firebase-functions/v2/https'

export const createCheckoutSession = onRequest(async (req, res) => {
  const { priceId, userId } = req.body
  
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.APP_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.APP_URL}/subscription/cancel`,
    client_reference_id: userId,
    subscription_data: {
      trial_period_days: 14,
      billing_mode: { type: 'flexible' }
    }
  })
  
  res.json({ sessionId: session.id })
})

export const createPortalSession = onRequest(async (req, res) => {
  const { customerId } = req.body
  
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.APP_URL}/subscription/manage`
  })
  
  res.json({ url: session.url })
})

export const handleWebhook = onRequest(async (req, res) => {
  const sig = req.headers['stripe-signature']
  const event = stripe.webhooks.constructEvent(
    req.body,
    sig,
    process.env.STRIPE_WEBHOOK_SECRET!
  )
  
  // Handle subscription events
  switch (event.type) {
    case 'checkout.session.completed':
      await updateUserSubscription(event.data.object)
      break
    case 'invoice.paid':
      await updateUserSubscription(event.data.object)
      break
    case 'invoice.payment_failed':
      await handlePaymentFailure(event.data.object)
      break
    case 'customer.subscription.updated':
      await updateUserSubscription(event.data.object)
      break
    case 'customer.subscription.deleted':
      await cancelUserSubscription(event.data.object)
      break
  }
  
  res.json({ received: true })
})
```

#### 5.4 Subscription Components Integration
**PricingCard.vue** - Displays plans and triggers Stripe Checkout
**PaymentConfirmation.vue** - Shows post-payment status and subscription details

**Simplified Payment Flow:**
1. User selects plan in PricingCard.vue
2. Component calls backend to create Stripe Checkout Session
3. User redirected to Stripe Checkout (handles all payment details)
4. Stripe redirects back to success page
5. PaymentConfirmation.vue displays subscription status
6. Webhook updates user subscription status in database

### Phase 6: Feedback System (Week 6)

#### 6.1 Feedback Form Component
```vue
<!-- components/feedback/FeedbackForm.vue -->
<template>
  <form @submit.prevent="submitFeedback" class="feedback-form">
    <div class="form-group">
      <label for="entry-id">Entrada del diccionario</label>
      <input
        id="entry-id"
        v-model="form.entryId"
        type="text"
        readonly
        class="form-control"
      />
    </div>
    
    <div class="form-group">
      <label for="feedback-type">Tipo de comentario</label>
      <select id="feedback-type" v-model="form.type" class="form-control">
        <option value="correction">Corrección</option>
        <option value="suggestion">Sugerencia</option>
        <option value="addition">Adición</option>
      </select>
    </div>
    
    <div class="form-group">
      <label for="message">Mensaje</label>
      <textarea
        id="message"
        v-model="form.message"
        rows="4"
        class="form-control"
        required
      ></textarea>
    </div>
    
    <BaseButton
      type="submit"
      variant="primary"
      :loading="isSubmitting"
    >
      Enviar comentario
    </BaseButton>
  </form>
</template>
```

#### 6.2 Google Sheets Integration
```typescript
// services/feedback.ts
export class FeedbackService {
  async submitFeedback(feedback: FeedbackData): Promise<void> {
    const response = await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(feedback)
    })
    
    if (!response.ok) {
      throw new Error('Error al enviar comentario')
    }
  }
}
```

### Phase 7: PWA & Service Worker (Week 7)

#### 7.1 Service Worker Configuration
```typescript
// public/sw.js
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { StaleWhileRevalidate, CacheFirst } from 'workbox-strategies'

precacheAndRoute(self.__WB_MANIFEST)
cleanupOutdatedCaches()

// Cache API responses
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new StaleWhileRevalidate({
    cacheName: 'api-cache',
    plugins: [{
      cacheWillUpdate: async ({ response }) => {
        return response.status === 200 ? response : null
      }
    }]
  })
)

// Cache dictionary data
registerRoute(
  ({ url }) => url.pathname.includes('/dictionary'),
  new CacheFirst({
    cacheName: 'dictionary-cache',
    plugins: [{
      cacheExpiration: {
        maxEntries: 50,
        maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
      }
    }]
  })
)
```

#### 7.2 PWA Manifest
```json
{
  "name": "epàlwi-rèbbo",
  "short_name": "epàlwi-rèbbo",
  "description": "Diccionario Español-Ndowe",
  "theme_color": "#D45B41",
  "background_color": "#F2EDEB",
  "display": "standalone",
  "start_url": "/",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### Phase 8: Testing & Deployment (Week 8)

#### 8.1 Unit Tests
```typescript
// tests/unit/auth.spec.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { useAuthStore } from '@/stores/auth'

describe('Auth Store', () => {
  it('should handle magic link flow', async () => {
    const store = useAuthStore()
    await store.sendMagicLink('test@example.com')
    expect(store.user).toBeTruthy()
  })
})
```

#### 8.2 E2E Tests
```typescript
// cypress/e2e/dictionary.cy.ts
describe('Dictionary Search', () => {
  it('should search and display results', () => {
    cy.visit('/')
    cy.get('[data-cy=search-input]').type('casa')
    cy.get('[data-cy=search-results]').should('contain', 'casa')
    cy.get('[data-cy=language-toggle]').click()
    cy.get('[data-cy=search-input]').should('have.attr', 'placeholder').and('contain', 'Ndowe')
  })
})
```

#### 8.3 Firebase Deployment
```bash
# Deploy to Firebase
firebase init hosting
firebase init functions
firebase deploy --only hosting,functions
```

### Phase 9: Monitoring & Analytics

#### 9.1 Error Tracking
```typescript
// services/analytics.ts
import { getAnalytics, logEvent } from 'firebase/analytics'

export class AnalyticsService {
  private analytics = getAnalytics()
  
  trackSearch(query: string, language: string, resultsCount: number) {
    logEvent(this.analytics, 'search', {
      search_term: query,
      language,
      results_count: resultsCount
    })
  }
  
  trackSubscription(plan: string, method: string) {
    logEvent(this.analytics, 'purchase', {
      currency: 'EUR',
      value: plan === 'monthly' ? 1 : 8.97,
      items: [{ item_id: plan, item_name: `Subscription ${plan}` }]
    })
  }
}
```

## Product Requirements Summary

### Core Features
- **Language Toggle**: ÍNdowe ↔ Español
- **Offline Search**: IndexedDB + trie/inverted index for fast lookup
- **Result Cards**: Translations with tags and examples
- **Magic Link Auth**: MailerSend + JWT + HttpOnly cookies
- **Stripe Subscriptions**: 14-day trial → €1/month or €8.97/year
- **Offline Dictionary**: Service Worker caching with delta sync
- **Feedback System**: Google Sheets integration with email alerts

### Subscription Flow
1. **Trial Period**: 14 days free access for new users
2. **Payment Options**: €1/month or €8.97/year (annual savings)
3. **Stripe Integration**: Checkout Sessions for secure payments
4. **Customer Portal**: Manage subscriptions and payment methods
5. **Webhook Handling**: Real-time subscription status updates

### Technical Architecture
- **Frontend**: Vue 3 PWA with TypeScript
- **Backend**: Firebase Functions + Firestore
- **Payments**: Stripe with webhook integration
- **Email**: MailerSend for magic links
- **Storage**: IndexedDB for offline dictionary
- **Caching**: Service Worker with Workbox

### Release Checklist

- [ ] All core features implemented and tested
- [ ] PWA installable with proper manifest
- [ ] Service worker caching dictionary data
- [ ] Auth flow with magic links working
- [ ] Stripe subscription flow tested (trial → payment)
- [ ] Feedback mechanism functional
- [ ] PWA installable, offline, responsive
- [ ] Error handling and logs in place
- [ ] KPI hooks embedded
- [ ] Stripe webhooks configured and tested
- [ ] Customer portal accessible
- [ ] Subscription lifecycle events handled

### Post-Launch Optimization

1. **Performance Monitoring**
   - Core Web Vitals tracking
   - Search performance metrics
   - Subscription conversion rates

2. **User Feedback Integration**
   - Regular dictionary updates
   - Feature request prioritization
   - Bug fix cycles

3. **Growth Features**
   - Audio pronunciation
   - Flashcard system
   - Admin dashboard
   - Push notifications

This development plan follows a systematic approach, ensuring each phase builds upon the previous one while maintaining code quality and user experience standards. The Stripe integration follows best practices using Checkout Sessions instead of custom payment forms, reducing PCI compliance burden and improving security. 