# Technical Specifications: Trial Expiration Enforcement

## Component Specifications

### 1. Server-Side Authentication Utilities

#### 1.1 `server/utils/auth.ts`

```typescript
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'
import type { H3Event } from 'h3'

export interface UserSubscriptionInfo {
  uid: string
  email: string
  hasActiveSubscription: boolean
  isTrialActive: boolean
  isInGracePeriod: boolean
  graceDaysRemaining: number
  trialDaysRemaining: number
  subscriptionStatus: 'trial' | 'active' | 'expired' | 'cancelled'
  canAccessFeatures: boolean
}

export interface AuthValidationResult {
  success: boolean
  user?: UserSubscriptionInfo
  error?: string
  errorCode?: 'INVALID_TOKEN' | 'USER_NOT_FOUND' | 'SUBSCRIPTION_EXPIRED' | 'VERIFICATION_FAILED'
}

/**
 * Extract and validate Firebase JWT token from request headers
 */
export async function validateUserToken(event: H3Event): Promise<{ uid: string; email: string } | null> {
  const authHeader = getHeader(event, 'authorization')
  if (!authHeader?.startsWith('Bearer ')) return null
  
  const token = authHeader.substring(7)
  try {
    const decodedToken = await getAuth().verifyIdToken(token)
    return { uid: decodedToken.uid, email: decodedToken.email! }
  } catch (error) {
    console.error('Token validation failed:', error)
    return null
  }
}

/**
 * Get comprehensive user subscription status from Firestore
 */
export async function getUserSubscriptionStatus(uid: string): Promise<UserSubscriptionInfo> {
  const db = getFirestore()
  const userDoc = await db.collection('users').doc(uid).get()
  
  if (!userDoc.exists) {
    throw new Error('User not found')
  }
  
  const userData = userDoc.data()!
  const now = new Date()
  
  // Calculate trial status
  const trialEndDate = userData.trial?.endDate?.toDate() || new Date(userData.createdAt.toDate().getTime() + 14 * 24 * 60 * 60 * 1000)
  const trialDaysRemaining = Math.max(0, Math.ceil((trialEndDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)))
  const isTrialActive = trialDaysRemaining > 0
  
  // Calculate grace period (3 days after trial expiration)
  const gracePeriodEndDate = new Date(trialEndDate.getTime() + 3 * 24 * 60 * 60 * 1000)
  const graceDaysRemaining = Math.max(0, Math.ceil((gracePeriodEndDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)))
  const isInGracePeriod = !isTrialActive && graceDaysRemaining > 0
  
  // Check paid subscription status
  const hasActiveSubscription = userData.subscription?.status === 'active'
  
  return {
    uid,
    email: userData.email,
    hasActiveSubscription,
    isTrialActive,
    isInGracePeriod,
    graceDaysRemaining,
    trialDaysRemaining,
    subscriptionStatus: userData.subscription?.status || 'trial',
    canAccessFeatures: hasActiveSubscription || isTrialActive || isInGracePeriod
  }
}

/**
 * Main authentication validation function with graceful error handling
 */
export async function validateUserSubscription(event: H3Event): Promise<AuthValidationResult> {
  try {
    // Extract user from token
    const tokenData = await validateUserToken(event)
    if (!tokenData) {
      return { success: false, error: 'Invalid or missing authentication token', errorCode: 'INVALID_TOKEN' }
    }
    
    // Get subscription status
    const userInfo = await getUserSubscriptionStatus(tokenData.uid)
    
    return { success: true, user: userInfo }
    
  } catch (error: any) {
    console.error('Subscription validation failed:', error)
    
    // Graceful fallback - allow access but log for review
    if (error.message === 'User not found') {
      return { success: false, error: 'User not found', errorCode: 'USER_NOT_FOUND' }
    }
    
    return { success: false, error: 'Verification temporarily unavailable', errorCode: 'VERIFICATION_FAILED' }
  }
}

/**
 * Log access attempts for analytics
 */
export async function logAccessAttempt(userInfo: UserSubscriptionInfo, resource: string, granted: boolean) {
  // Implementation for analytics logging
  console.log(`Access ${granted ? 'granted' : 'denied'} for user ${userInfo.uid} to ${resource}`)
}
```

#### 1.2 `server/api/dictionary.get.ts` (Modified)

```typescript
import { validateUserSubscription, logAccessAttempt } from '~/server/utils/auth'

export default defineEventHandler(async (event): Promise<DictionaryApiResponse> => {
  try {
    // Validate user subscription
    const authResult = await validateUserSubscription(event)
    
    if (!authResult.success) {
      // Handle different error scenarios
      if (authResult.errorCode === 'VERIFICATION_FAILED') {
        // Graceful fallback - allow access but log for review
        console.warn('Subscription verification failed, allowing access with fallback')
      } else {
        throw createError({
          statusCode: 401,
          statusMessage: 'Authentication required',
          data: { error: authResult.error, code: authResult.errorCode }
        })
      }
    }
    
    // Check feature access
    if (authResult.user && !authResult.user.canAccessFeatures) {
      await logAccessAttempt(authResult.user, 'dictionary', false)
      
      throw createError({
        statusCode: 403,
        statusMessage: 'Subscription required',
        data: { 
          error: 'Your trial has expired. Subscribe to continue using the dictionary.',
          subscriptionStatus: authResult.user.subscriptionStatus,
          graceDaysRemaining: authResult.user.graceDaysRemaining
        }
      })
    }
    
    // Log successful access
    if (authResult.user) {
      await logAccessAttempt(authResult.user, 'dictionary', true)
    }
    
    // Existing dictionary logic...
    const data = await getDictionaryData()
    
    return {
      success: true,
      data,
      userInfo: authResult.user ? {
        canAccessFeatures: authResult.user.canAccessFeatures,
        subscriptionStatus: authResult.user.subscriptionStatus,
        trialDaysRemaining: authResult.user.trialDaysRemaining
      } : undefined
    }
    
  } catch (error) {
    // Enhanced error handling...
    console.error('Dictionary API error:', error)
    throw error
  }
})
```

### 2. Client-Side Protection Components

#### 2.1 `composables/useAuth.ts`

```typescript
import { computed, ref } from 'vue'

export interface ClientUserInfo {
  canAccessFeatures: boolean
  subscriptionStatus: string
  trialDaysRemaining: number
  graceDaysRemaining: number
  isInGracePeriod: boolean
}

export const useAuth = () => {
  const authStore = useAuthStore()
  
  // Enhanced computed properties
  const canAccessFeatures = computed(() => {
    return authStore.canAccessFeatures
  })
  
  const subscriptionStatus = computed(() => {
    return authStore.subscriptionStatus
  })
  
  const isInGracePeriod = computed(() => {
    const user = authStore.user
    if (!user?.trial) return false
    
    const now = new Date()
    const trialEndDate = new Date(user.trial.endDate)
    const gracePeriodEndDate = new Date(trialEndDate.getTime() + 3 * 24 * 60 * 60 * 1000)
    
    return now > trialEndDate && now <= gracePeriodEndDate
  })
  
  const graceDaysRemaining = computed(() => {
    if (!isInGracePeriod.value) return 0
    
    const user = authStore.user
    const now = new Date()
    const trialEndDate = new Date(user!.trial.endDate)
    const gracePeriodEndDate = new Date(trialEndDate.getTime() + 3 * 24 * 60 * 60 * 1000)
    
    return Math.max(0, Math.ceil((gracePeriodEndDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)))
  })
  
  const shouldShowUpgradePrompt = computed(() => {
    return !canAccessFeatures.value || isInGracePeriod.value
  })
  
  // Navigation helpers
  const redirectToSubscription = (source: string = 'general') => {
    navigateTo(`/subscription/plans?source=${source}`)
  }
  
  const redirectToLogin = (returnUrl: string = '/') => {
    navigateTo(`/auth/login?return=${encodeURIComponent(returnUrl)}`)
  }
  
  return {
    // State
    canAccessFeatures,
    subscriptionStatus,
    isInGracePeriod,
    graceDaysRemaining,
    shouldShowUpgradePrompt,
    
    // Actions
    redirectToSubscription,
    redirectToLogin
  }
}
```

#### 2.2 `middleware/subscription.ts`

```typescript
export default defineNuxtRouteMiddleware((to) => {
  // Only run on client side
  if (process.server) return
  
  const authStore = useAuthStore()
  const { canAccessFeatures, isInGracePeriod } = useAuth()
  
  // Check if user is authenticated
  if (!authStore.isAuthenticated) {
    return navigateTo(`/auth/login?return=${encodeURIComponent(to.fullPath)}`)
  }
  
  // Allow access during grace period but store the attempted route
  if (isInGracePeriod.value) {
    // Store attempted route for post-subscription redirect
    sessionStorage.setItem('attempted-route', to.fullPath)
    // Allow access but user will see grace period warnings
    return
  }
  
  // Block access for expired users
  if (!canAccessFeatures.value) {
    // Store attempted route for post-subscription redirect
    sessionStorage.setItem('attempted-route', to.fullPath)
    return navigateTo('/subscription/plans?source=access-denied')
  }
})
```

#### 2.3 `components/paywall/SubscriptionRequired.vue`

```vue
<template>
  <div class="subscription-paywall">
    <div class="paywall-overlay" @click="handleOverlayClick">
      <div class="paywall-content" @click.stop>
        <!-- Header -->
        <div class="paywall-header">
          <Icon :name="headerIcon" class="paywall-icon" />
          <h2 class="ds-text-display-sm">{{ headerTitle }}</h2>
          <p class="paywall-subtitle">{{ headerSubtitle }}</p>
        </div>
        
        <!-- Feature Benefits -->
        <div class="paywall-benefits">
          <h3 class="ds-text-display-xs">¿Por qué suscribirse?</h3>
          <ul class="benefits-list">
            <li v-for="benefit in benefits" :key="benefit" class="benefit-item">
              <Icon name="check" class="benefit-icon" />
              {{ benefit }}
            </li>
          </ul>
        </div>
        
        <!-- Pricing -->
        <div class="paywall-pricing">
          <div class="pricing-options">
            <div 
              v-for="plan in plans" 
              :key="plan.id"
              class="pricing-option"
              :class="{ active: selectedPlan?.id === plan.id }"
              @click="selectedPlan = plan"
            >
              <div class="plan-name">{{ plan.title }}</div>
              <div class="plan-price">€{{ plan.price }} {{ plan.period }}</div>
              <div v-if="plan.savings" class="plan-savings">Ahorra {{ plan.savings }}%</div>
            </div>
          </div>
        </div>
        
        <!-- Actions -->
        <div class="paywall-actions">
          <button 
            class="subscribe-button"
            :disabled="!selectedPlan || loading"
            @click="handleSubscribe"
          >
            <Icon v-if="loading" name="loader-2" class="loading-icon" />
            {{ loading ? 'Procesando...' : 'Comenzar Suscripción' }}
          </button>
          
          <button 
            v-if="allowDismiss"
            class="dismiss-button"
            @click="handleDismiss"
          >
            {{ dismissText }}
          </button>
        </div>
        
        <!-- Support -->
        <div class="paywall-support">
          <p class="support-text">
            ¿Necesitas ayuda? 
            <a href="mailto:support@epalwi-rebbo.com" class="support-link">
              Contacta soporte
            </a>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  feature?: string
  allowDismiss?: boolean
  dismissText?: string
  showBenefits?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  feature: 'esta función',
  allowDismiss: false,
  dismissText: 'Recordar más tarde',
  showBenefits: true
})

const emit = defineEmits<{
  dismiss: []
  subscribe: [planId: string]
}>()

// State
const loading = ref(false)
const selectedPlan = ref(null)

// Get subscription plans
const subscriptionStore = useSubscriptionStore()
const plans = computed(() => subscriptionStore.plans)

// Dynamic content based on props
const headerIcon = computed(() => {
  if (props.feature.includes('diccionario')) return 'book-open'
  if (props.feature.includes('offline')) return 'wifi-off'
  return 'lock'
})

const headerTitle = computed(() => {
  const { isInGracePeriod, graceDaysRemaining } = useAuth()
  
  if (isInGracePeriod.value) {
    return `Período de gracia: ${graceDaysRemaining.value} días restantes`
  }
  return 'Suscripción Requerida'
})

const headerSubtitle = computed(() => {
  const { isInGracePeriod } = useAuth()
  
  if (isInGracePeriod.value) {
    return 'Tu prueba gratuita ha expirado. Suscríbete para mantener el acceso completo.'
  }
  return `Para acceder a ${props.feature}, necesitas una suscripción activa.`
})

const benefits = computed(() => [
  'Acceso completo al diccionario español-ndowe',
  'Funcionalidad offline sin restricciones',
  'Búsquedas ilimitadas y rápidas',
  'Soporte prioritario al cliente',
  'Actualizaciones automáticas del contenido'
])

// Actions
const handleSubscribe = async () => {
  if (!selectedPlan.value || loading.value) return
  
  loading.value = true
  try {
    emit('subscribe', selectedPlan.value.id)
    // Navigation will be handled by parent component
  } catch (error) {
    console.error('Subscription error:', error)
  } finally {
    loading.value = false
  }
}

const handleDismiss = () => {
  emit('dismiss')
}

const handleOverlayClick = () => {
  if (props.allowDismiss) {
    handleDismiss()
  }
}

// Auto-select first plan
onMounted(() => {
  if (plans.value.length > 0) {
    selectedPlan.value = plans.value[0]
  }
})
</script>

<style scoped>
.subscription-paywall {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: var(--ds-spacing-2);
}

.paywall-overlay {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.paywall-content {
  background: var(--ds-card);
  border-radius: var(--ds-radius-lg);
  padding: var(--ds-spacing-4);
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--ds-shadow-lg);
}

.paywall-header {
  text-align: center;
  margin-bottom: var(--ds-spacing-3);
  
  .paywall-icon {
    width: 48px;
    height: 48px;
    color: var(--ds-primary);
    margin-bottom: var(--ds-spacing-1);
  }
  
  h2 {
    margin-bottom: var(--ds-spacing-05);
  }
  
  .paywall-subtitle {
    color: var(--ds-muted-foreground);
    line-height: var(--ds-line-height-normal);
  }
}

.paywall-benefits {
  margin-bottom: var(--ds-spacing-3);
  
  h3 {
    margin-bottom: var(--ds-spacing-1);
  }
  
  .benefits-list {
    list-style: none;
    padding: 0;
    margin: 0;
    
    .benefit-item {
      display: flex;
      align-items: center;
      gap: var(--ds-spacing-05);
      margin-bottom: var(--ds-spacing-05);
      
      .benefit-icon {
        width: 16px;
        height: 16px;
        color: var(--ds-accent);
        flex-shrink: 0;
      }
    }
  }
}

.paywall-pricing {
  margin-bottom: var(--ds-spacing-3);
  
  .pricing-options {
    display: grid;
    gap: var(--ds-spacing-1);
    
    .pricing-option {
      border: 1px solid var(--ds-border);
      border-radius: var(--ds-radius);
      padding: var(--ds-spacing-1);
      cursor: pointer;
      transition: all var(--ds-duration);
      
      &.active {
        border-color: var(--ds-primary);
        background: var(--ds-primary-background);
      }
      
      .plan-name {
        font-weight: var(--ds-font-weight-semibold);
        margin-bottom: var(--ds-spacing-025);
      }
      
      .plan-price {
        color: var(--ds-primary);
        font-weight: var(--ds-font-weight-medium);
      }
      
      .plan-savings {
        font-size: 0.875rem;
        color: var(--ds-accent);
        font-weight: var(--ds-font-weight-medium);
      }
    }
  }
}

.paywall-actions {
  display: flex;
  flex-direction: column;
  gap: var(--ds-spacing-1);
  margin-bottom: var(--ds-spacing-2);
  
  .subscribe-button {
    width: 100%;
    height: 48px;
    background: var(--ds-primary);
    color: white;
    border: none;
    border-radius: var(--ds-radius);
    font-size: 1rem;
    font-weight: var(--ds-font-weight-semibold);
    cursor: pointer;
    transition: all var(--ds-duration);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--ds-spacing-05);
    
    &:hover:not(:disabled) {
      background: var(--ds-primary-dark);
    }
    
    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    
    .loading-icon {
      width: 20px;
      height: 20px;
      animation: spin 1s linear infinite;
    }
  }
  
  .dismiss-button {
    height: 40px;
    background: transparent;
    color: var(--ds-muted-foreground);
    border: 1px solid var(--ds-border);
    border-radius: var(--ds-radius);
    font-size: 0.875rem;
    cursor: pointer;
    transition: all var(--ds-duration);
    
    &:hover {
      background: var(--ds-muted);
    }
  }
}

.paywall-support {
  text-align: center;
  
  .support-text {
    font-size: 0.875rem;
    color: var(--ds-muted-foreground);
    
    .support-link {
      color: var(--ds-primary);
      text-decoration: none;
      
      &:hover {
        text-decoration: underline;
      }
    }
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .paywall-content {
    margin: var(--ds-spacing-1);
    padding: var(--ds-spacing-3);
  }
}
</style>
```

### 3. Enhanced Dictionary Integration

#### 3.1 `composables/useDictionary.ts` (Modified Protection Logic)

```typescript
// Add to existing useDictionary composable:

const { canAccessFeatures, isInGracePeriod, redirectToSubscription } = useAuth()

// Modify the search function:
const search = async (query: string, mode: SearchMode = 'hybrid') => {
  // Check subscription before performing search
  if (!canAccessFeatures.value && !isInGracePeriod.value) {
    redirectToSubscription('dictionary-search')
    return []
  }
  
  if (!isReady.value || !searchService) {
    console.warn('Dictionary service not initialized')
    return []
  }
  
  try {
    isLoading.value = true
    error.value = null
    
    // Show grace period warning during search
    if (isInGracePeriod.value) {
      // Could emit an event or show a toast warning
      console.warn('Searching during grace period - subscription required soon')
    }
    
    const searchQuery: SearchQuery = {
      query: query.trim(),
      language: currentLanguage.value,
      mode,
      limit: 50,
      includeExplanations: true,
      includeCrossReferences: true
    }
    
    const results = await searchService.search(searchQuery)
    searchResults.value = results
    hasSearched.value = true
    
    return results
    
  } catch (err: any) {
    // Enhanced error handling for subscription issues
    if (err.status === 403) {
      redirectToSubscription('api-access-denied')
      error.value = 'Suscripción requerida para continuar'
    } else {
      error.value = err.message || 'Search failed'
    }
    searchResults.value = []
    return []
  } finally {
    isLoading.value = false
  }
}

// Add subscription checking for offline access:
const loadDictionaryData = async () => {
  // Check subscription before loading offline data
  if (!canAccessFeatures.value) {
    throw new Error('Subscription required for offline access')
  }
  
  // Existing logic...
}
```

This comprehensive technical specification provides detailed implementation guidance for all major components of the trial expiration enforcement system. Each component is designed to work together seamlessly while maintaining the existing user experience for subscribed users.