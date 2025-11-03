<template>
  <div class="stripe-checkout-trigger">
    <!-- Plan Summary -->
    <div class="plan-summary">
      
      <div class="plan-details">
        <div class="plan-name">{{ selectedPlan.title }}</div>
        <div class="plan-price">€{{ selectedPlan.price }} {{ selectedPlan.period }}</div>
        
        <ul class="plan-features">
          <li 
            v-for="feature in selectedPlan.features" 
            :key="feature"
            class="feature-item"
          >
            <Icon name="check" class="checkmark" />
            {{ feature }}
          </li>
        </ul>
      </div>
    </div>
    
    <!-- Terms & Info -->
    <div class="checkout-info">
      Al continuar, serás redirigido a Stripe para completar tu pago
    </div>
    
    <!-- Stripe Checkout Button -->
    <button 
      class="checkout-button"
      :disabled="loading || !canProceed"
      @click="triggerStripeCheckout"
    >
      <Icon 
        v-if="loading" 
        name="loader-2" 
        class="loading-icon" 
      />
      {{ buttonText }}
    </button>
    
    <!-- Error Display -->
    <div 
      v-if="error" 
      class="error-message"
    >
      <Icon name="alert-circle" class="error-icon" />
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from '#imports'
import { loadStripe } from '@stripe/stripe-js'

interface PlanFeature {
  id: string
  title: string
  price: number
  period: string
  features: string[]
  priceId: string
  popular?: boolean
  savings?: number
}

interface Props {
  selectedPlan: PlanFeature
  disabled?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'checkout-started': []
  'checkout-error': [error: string]
  'checkout-success': [sessionId: string]
}>()

// Component state
const loading = ref(false)
const error = ref<string | null>(null)
const stripe = ref<any>(null)

// Computed properties
const buttonText = computed(() => {
  if (loading.value) return 'Procesando...'
  if (props.selectedPlan.period.includes('mes')) return 'Comenzar Prueba Gratuita'
  return 'Comenzar Prueba Gratuita'
})

const canProceed = computed(() => {
  return !props.disabled && props.selectedPlan.priceId
})

// Initialize Stripe
const initializeStripe = async () => {
  if (stripe.value) return stripe.value
  
  try {
    const config = useRuntimeConfig()
    const publishableKey = (config.public.stripePublishableKey || '').trim()
    
    if (!publishableKey) {
      throw new Error('Stripe publishable key not configured')
    }
    
    // Load Stripe.js (optional if we redirect via Checkout URL)
    stripe.value = await loadStripe(publishableKey)
    return stripe.value
  } catch (err) {
    console.error('Failed to initialize Stripe:', err)
    throw new Error('No se pudo inicializar el sistema de pagos')
  }
}

// Create checkout session
const route = useRoute()

const createCheckoutSession = async (): Promise<{ sessionId: string, url?: string }> => {
  try {
    const response = await $fetch('/api/stripe/create-checkout-session', {
      method: 'POST',
      body: {
        priceId: props.selectedPlan.priceId,
        planType: props.selectedPlan.period.includes('mes') ? 'monthly' : 'annual',
        successUrl: `${window.location.origin}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
        // Send the invoking page as cancel URL so Stripe's back action returns there
        cancelUrl: `${window.location.origin}${route.fullPath}`
      }
    })
    
    if (!response.sessionId) {
      throw new Error('No se pudo crear la sesión de pago')
    }
    
    return response
  } catch (err: any) {
    console.error('Failed to create checkout session:', err)
    throw new Error(err.message || 'Error al crear la sesión de pago')
  }
}

// Trigger Stripe checkout
const triggerStripeCheckout = async () => {
  if (!canProceed.value || loading.value) {
    if (!props.selectedPlan.priceId) {
      error.value = 'El plan no está configurado. Vuelve a intentarlo en unos segundos.'
    }
    return
  }
  
  try {
    loading.value = true
    error.value = null

    // Emit checkout started event
    emit('checkout-started')

    // Create checkout session
    const { sessionId, url } = await createCheckoutSession()

    if (process.dev) {
      console.log('[Stripe] Created session', sessionId, 'url?', !!url)
      console.log('[Stripe] Using priceId', props.selectedPlan.priceId)
    }

    // Prefer direct URL redirect (works even if Stripe.js init fails)
    if (url) {
      window.location.href = url
      return
    }

    // Initialize Stripe.js only if needed
    const stripeInstance = await initializeStripe()
    const { error: checkoutError } = await stripeInstance.redirectToCheckout({ sessionId })
    
    if (checkoutError) {
      throw new Error(checkoutError.message)
    }
    
    // Emit success event
    emit('checkout-success', sessionId)
    
  } catch (err: any) {
    const errorMessage = err.message || 'Error al procesar el pago'
    error.value = errorMessage
    emit('checkout-error', errorMessage)
    console.error('Checkout error:', err)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.stripe-checkout-trigger {
  background: var(--ds-card);
  border-radius: var(--ds-radius-lg);
  padding: var(--ds-spacing-3); /* 24px */
  box-shadow: var(--ds-shadow-sm);
  border: 1px solid var(--ds-border);
}

.summary-title {
  font-size: 1.125rem;
  font-weight: var(--ds-font-weight-semibold);
  color: var(--ds-foreground);
  margin-bottom: var(--ds-spacing-2); /* 16px */
  display: flex;
  align-items: center;
  gap: var(--ds-spacing-05); /* 8px */
  
  .summary-icon {
    width: 20px;
    height: 20px;
    color: var(--ds-primary);
  }
}

.plan-details {
  border-radius: var(--ds-radius);
  margin-bottom: var(--ds-spacing-3); /* 24px */
  
  .plan-name {
    font-size: 1.125rem;
    font-weight: var(--ds-font-weight-semibold);
    color: var(--ds-foreground);
    margin-bottom: var(--ds-spacing-025); /* 4px */
  }
  
  .plan-price {
    font-size: 1rem;
    color: var(--ds-primary);
    margin-bottom: var(--ds-spacing-1); /* 8px */
  }
  
  .plan-features {
    list-style: none;
    padding: 0;
    margin: 0 0 var(--ds-spacing-2) 0; /* 0 0 16px 0 */
    
    .feature-item {
      display: flex;
      align-items: center;
      gap: var(--ds-spacing-05); /* 8px */
      margin-bottom: var(--ds-spacing-05); /* 8px */
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .checkmark {
        width: 16px;
        height: 16px;
        color: var(--ds-accent);
        flex-shrink: 0;
      }
    }
  }
  
  .total-amount {
    font-size: 1.25rem;
    font-weight: var(--ds-font-weight-bold);
    color: var(--ds-primary);
    text-align: center;
    padding: var(--ds-spacing-1); /* 8px */
    background: var(--ds-card);
    border-radius: var(--ds-radius);
    border: 2px solid var(--ds-primary);
  }
}

.checkout-button {
  width: 100%;
  height: 48px; /* 48px */
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
  gap: var(--ds-spacing-05); /* 8px */
  
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

.checkout-info {
  font-size: 0.875rem;
  color: var(--ds-muted-foreground);
  text-align: center;
  line-height: var(--ds-line-height-normal);
  margin-bottom: var(--ds-spacing-1); /* 16px */
}

.error-message {
  background: hsl(var(--ds-destructive) / 0.1);
  border: 1px solid var(--ds-destructive);
  border-radius: var(--ds-radius);
  padding: var(--ds-spacing-1); /* 8px */
  color: var(--ds-destructive);
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: var(--ds-spacing-05); /* 8px */
  
  .error-icon {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

</style>
