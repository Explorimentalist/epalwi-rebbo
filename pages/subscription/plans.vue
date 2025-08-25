<template>
  <div class="subscription-page">
    <div class="page-container">
      <!-- Header -->
      <div class="page-header">
        <h1 class="page-title">Elige tu Plan</h1>
        <p class="page-subtitle">
          Comienza tu prueba gratuita de 14 días. Cancela cuando quieras.
        </p>
      </div>

      <!-- Plans Grid -->
      <div class="plans-grid">
        <div
          v-for="plan in plans"
          :key="plan.id"
          class="plan-card"
          :class="{ 'popular': plan.popular }"
        >
          <!-- Popular Badge -->
          <div v-if="plan.popular" class="popular-badge">
            Más Popular
          </div>

          <!-- Plan Header -->
          <div class="plan-header">
            <h3 class="plan-title">{{ plan.title }}</h3>
            <div class="plan-price">
              <span class="price-amount">€{{ plan.price }}</span>
              <span class="price-period">{{ plan.period }}</span>
            </div>
            <div v-if="plan.savings" class="plan-savings">
              Ahorras €{{ plan.savings }}
            </div>
          </div>

          <!-- Plan Features -->
          <ul class="plan-features">
            <li
              v-for="feature in plan.features"
              :key="feature"
              class="feature-item"
            >
              <Icon name="check" class="feature-icon" />
              <span>{{ feature }}</span>
            </li>
          </ul>

          <!-- Plan Action -->
          <button
            @click="selectPlan(plan)"
            class="plan-button"
            :class="{ 'popular': plan.popular }"
          >
            {{ plan.popular ? 'Comenzar Prueba' : 'Comenzar Prueba' }}
          </button>
        </div>
      </div>

      <!-- Trial Info -->
      <div class="trial-info">
        <h3 class="trial-title">Prueba Gratuita de 14 Días</h3>
        <p class="trial-description">
          Todos los planes incluyen una prueba gratuita de 14 días. 
          No se te cobrará nada hasta que termine la prueba.
        </p>
        <ul class="trial-features">
          <li>✓ Acceso completo al diccionario</li>
          <li>✓ Búsqueda offline</li>
          <li>✓ Sin anuncios</li>
          <li>✓ Cancela cuando quieras</li>
        </ul>
      </div>

      <!-- FAQ Section -->
      <div class="faq-section">
        <h3 class="faq-title">Preguntas Frecuentes</h3>
        <div class="faq-list">
          <div class="faq-item">
            <h4 class="faq-question">¿Puedo cancelar en cualquier momento?</h4>
            <p class="faq-answer">
              Sí, puedes cancelar tu suscripción en cualquier momento desde tu cuenta.
            </p>
          </div>
          <div class="faq-item">
            <h4 class="faq-question">¿Qué pasa después de la prueba gratuita?</h4>
            <p class="faq-answer">
              Después de los 14 días, tu suscripción se activará automáticamente.
            </p>
          </div>
          <div class="faq-item">
            <h4 class="faq-question">¿Hay algún cargo oculto?</h4>
            <p class="faq-answer">
              No, solo pagas el precio mostrado. Sin cargos de instalación o cancelación.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Plan Selection Modal -->
    <Modal
      v-model="showPlanModal"
      title="Confirmar Plan"
      :show-close-button="true"
    >
      <div class="plan-confirmation">
        <div v-if="selectedPlan" class="selected-plan">
          <h3 class="selected-plan-title">{{ selectedPlan.title }}</h3>
          <div class="selected-plan-price">
            €{{ selectedPlan.price }} {{ selectedPlan.period }}
          </div>
          
          <!-- Stripe Checkout Trigger -->
          <StripeCheckoutTrigger
            :selected-plan="selectedPlan"
            @checkout-started="handleCheckoutStarted"
            @checkout-error="handleCheckoutError"
            @checkout-success="handleCheckoutSuccess"
          />
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// Page metadata
useHead({
  title: 'Planes de Suscripción | epàlwi-rèbbo',
  meta: [
    { 
      name: 'description', 
      content: 'Elige tu plan de suscripción y comienza tu prueba gratuita de 14 días.' 
    }
  ]
})

// State
const showPlanModal = ref(false)
const selectedPlan = ref<any>(null)

// Subscription store
const subscriptionStore = useSubscriptionStore()

// Get plans from store
const plans = computed(() => subscriptionStore.plans)

// Select plan
const selectPlan = (plan: any) => {
  selectedPlan.value = plan
  showPlanModal.value = true
}

// Checkout handlers
const handleCheckoutStarted = () => {
  console.log('Checkout started')
}

const handleCheckoutError = (error: string) => {
  console.error('Checkout error:', error)
  // You can show a toast notification here
}

const handleCheckoutSuccess = (sessionId: string) => {
  console.log('Checkout success:', sessionId)
  showPlanModal.value = false
  // Redirect to success page
  navigateTo(`/subscription/success?session_id=${sessionId}`)
}
</script>

<style lang="scss" scoped>
.subscription-page {
  min-height: 100vh;
  background: var(--color-background);
  padding: var(--space-8) 0;
}

.page-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-6);
}

.page-header {
  text-align: center;
  margin-bottom: var(--space-12);
  
  .page-title {
    font-size: var(--font-size-4xl);
    font-weight: var(--font-weight-bold);
    color: var(--color-text);
    margin-bottom: var(--space-4);
  }
  
  .page-subtitle {
    font-size: var(--font-size-lg);
    color: var(--color-text-muted);
    max-width: 600px;
    margin: 0 auto;
    line-height: var(--line-height-normal);
  }
}

.plans-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: var(--space-8);
  margin-bottom: var(--space-12);
}

.plan-card {
  background: var(--color-primary);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
  padding: var(--space-8);
  position: relative;
  transition: all 0.2s ease-in-out;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
  }
  
  &.popular {
    border: 2px solid var(--color-secondary);
    transform: scale(1.02);
    
    &:hover {
      transform: scale(1.02) translateY(-4px);
    }
  }
}

.popular-badge {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--color-secondary);
  color: white;
  padding: var(--space-2) var(--space-4);
  border-radius: var(--border-radius-full);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
}

.plan-header {
  text-align: center;
  margin-bottom: var(--space-6);
  
  .plan-title {
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text);
    margin-bottom: var(--space-4);
  }
  
  .plan-price {
    margin-bottom: var(--space-3);
    
    .price-amount {
      font-size: var(--font-size-4xl);
      font-weight: var(--font-weight-bold);
      color: var(--color-secondary);
    }
    
    .price-period {
      font-size: var(--font-size-base);
      color: var(--color-text-muted);
      margin-left: var(--space-2);
    }
  }
  
  .plan-savings {
    font-size: var(--font-size-sm);
    color: var(--color-success);
    font-weight: var(--font-weight-medium);
  }
}

.plan-features {
  list-style: none;
  padding: 0;
  margin: 0 0 var(--space-8) 0;
  
  .feature-item {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    margin-bottom: var(--space-3);
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .feature-icon {
      width: 20px;
      height: 20px;
      color: var(--color-success);
      flex-shrink: 0;
    }
    
    span {
      font-size: var(--font-size-base);
      color: var(--color-text);
    }
  }
}

.plan-button {
  width: 100%;
  height: var(--space-11);
  background: var(--color-secondary);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: all 0.15s ease-in-out;
  
  &:hover {
    background: var(--color-secondary-dark);
    transform: translateY(-1px);
  }
  
  &.popular {
    background: var(--color-secondary);
    
    &:hover {
      background: var(--color-secondary-dark);
    }
  }
}

.trial-info {
  background: var(--color-primary);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
  padding: var(--space-8);
  margin-bottom: var(--space-12);
  text-align: center;
  
  .trial-title {
    font-size: var(--font-size-2xl);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text);
    margin-bottom: var(--space-4);
  }
  
  .trial-description {
    font-size: var(--font-size-base);
    color: var(--color-text-muted);
    margin-bottom: var(--space-6);
    line-height: var(--line-height-normal);
  }
  
  .trial-features {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: var(--space-4);
    
    li {
      font-size: var(--font-size-base);
      color: var(--color-text);
      font-weight: var(--font-weight-medium);
    }
  }
}

.faq-section {
  .faq-title {
    font-size: var(--font-size-2xl);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text);
    margin-bottom: var(--space-8);
    text-align: center;
  }
  
  .faq-list {
    max-width: 800px;
    margin: 0 auto;
    
    .faq-item {
      background: var(--color-primary);
      border-radius: var(--border-radius);
      padding: var(--space-6);
      margin-bottom: var(--space-4);
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .faq-question {
        font-size: var(--font-size-lg);
        font-weight: var(--font-weight-semibold);
        color: var(--color-text);
        margin-bottom: var(--space-3);
      }
      
      .faq-answer {
        font-size: var(--font-size-base);
        color: var(--color-text-muted);
        line-height: var(--line-height-normal);
      }
    }
  }
}

.plan-confirmation {
  .selected-plan {
    text-align: center;
    
    .selected-plan-title {
      font-size: var(--font-size-xl);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text);
      margin-bottom: var(--space-4);
    }
    
    .selected-plan-price {
      font-size: var(--font-size-lg);
      color: var(--color-text-muted);
      margin-bottom: var(--space-6);
    }
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .plans-grid {
    grid-template-columns: 1fr;
    gap: var(--space-6);
  }
  
  .page-title {
    font-size: var(--font-size-3xl);
  }
  
  .trial-features {
    flex-direction: column;
    align-items: center;
  }
}
</style>
