<template>
  <div class="stripe-checkout-trigger">
    <!-- Plan Summary -->
    <div class="plan-summary">
      <h3 class="summary-title">
        <Icon name="credit-card" class="summary-icon" />
        Resumen del Plan
      </h3>
      
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
        
        <div class="total-amount">
          Total: €{{ selectedPlan.price }}
        </div>
      </div>
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
    
    <!-- Terms & Info -->
    <div class="checkout-info">
      Al continuar, serás redirigido a Stripe para completar tu pago
    </div>
    
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
    const publishableKey = config.public.stripePublishableKey
    
    if (!publishableKey) {
      throw new Error('Stripe publishable key not configured')
    }
    
    stripe.value = await loadStripe(publishableKey)
    return stripe.value
  } catch (err) {
    console.error('Failed to initialize Stripe:', err)
    throw new Error('No se pudo inicializar el sistema de pagos')
  }
}

// Create checkout session
const createCheckoutSession = async (): Promise<string> => {
  try {
    const response = await $fetch('/api/stripe/create-checkout-session', {
      method: 'POST',
      body: {
        priceId: props.selectedPlan.priceId,
        planType: props.selectedPlan.period.includes('mes') ? 'monthly' : 'annual',
        successUrl: `${window.location.origin}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/subscription/cancel`
      }
    })
    
    if (!response.sessionId) {
      throw new Error('No se pudo crear la sesión de pago')
    }
    
    return response.sessionId
  } catch (err: any) {
    console.error('Failed to create checkout session:', err)
    throw new Error(err.message || 'Error al crear la sesión de pago')
  }
}

// Trigger Stripe checkout
const triggerStripeCheckout = async () => {
  if (!canProceed.value || loading.value) return
  
  try {
    loading.value = true
    error.value = null
    
    // Emit checkout started event
    emit('checkout-started')
    
    // Initialize Stripe if needed
    const stripeInstance = await initializeStripe()
    
    // Create checkout session
    const sessionId = await createCheckoutSession()
    
    // Redirect to Stripe checkout
    const { error: checkoutError } = await stripeInstance.redirectToCheckout({
      sessionId
    })
    
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
  background: var(--color-primary);
  border-radius: var(--border-radius-lg);
  padding: var(--space-8); /* 24px */
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-border);
}

.summary-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
  margin-bottom: var(--space-6); /* 16px */
  display: flex;
  align-items: center;
  gap: var(--space-3); /* 8px */
  
  .summary-icon {
    width: 20px;
    height: 20px;
    color: var(--color-secondary);
  }
}

.plan-details {
  background: var(--color-background);
  padding: var(--space-6); /* 16px */
  border-radius: var(--border-radius);
  margin-bottom: var(--space-8); /* 24px */
  
  .plan-name {
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text);
    margin-bottom: var(--space-2); /* 4px */
  }
  
  .plan-price {
    font-size: var(--font-size-base);
    color: var(--color-text-muted);
    margin-bottom: var(--space-4); /* 8px */
  }
  
  .plan-features {
    list-style: none;
    padding: 0;
    margin: 0 0 var(--space-6) 0; /* 0 0 16px 0 */
    
    .feature-item {
      display: flex;
      align-items: center;
      gap: var(--space-3); /* 8px */
      margin-bottom: var(--space-3); /* 8px */
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .checkmark {
        width: 16px;
        height: 16px;
        color: var(--color-success);
        flex-shrink: 0;
      }
    }
  }
  
  .total-amount {
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-bold);
    color: var(--color-secondary);
    text-align: center;
    padding: var(--space-4); /* 8px */
    background: var(--color-primary);
    border-radius: var(--border-radius);
    border: 2px solid var(--color-secondary);
  }
}

.checkout-button {
  width: 100%;
  height: var(--space-11); /* 48px */
  background: var(--color-secondary);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-3); /* 8px */
  margin-bottom: var(--space-6); /* 16px */
  
  &:hover:not(:disabled) {
    background: var(--color-secondary-dark);
    transform: translateY(-1px);
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
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  text-align: center;
  line-height: var(--line-height-normal);
  margin-bottom: var(--space-6); /* 16px */
}

.error-message {
  background: var(--color-error-light);
  border: 1px solid var(--color-error);
  border-radius: var(--border-radius);
  padding: var(--space-4); /* 8px */
  color: var(--color-error);
  font-size: var(--font-size-sm);
  display: flex;
  align-items: center;
  gap: var(--space-3); /* 8px */
  
  .error-icon {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* CSS Variables for design system */
:root {
  --space-2: 4px;
  --space-3: 8px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;
  --space-11: 48px;
  
  --color-primary: #FFFFFF;
  --color-secondary: #D45B41;
  --color-secondary-dark: #B8412F;
  --color-background: #F2EDEB;
  --color-text: #333333;
  --color-text-muted: #6B7280;
  --color-border: #E5E7EB;
  --color-success: #257940;
  --color-error: #D61515;
  --color-error-light: #FEF2F2;
  
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
  
  --line-height-normal: 1.5;
  
  --border-radius: 8px;
  --border-radius-lg: 12px;
  
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  
  --transition-fast: 0.15s ease-in-out;
}
</style>
