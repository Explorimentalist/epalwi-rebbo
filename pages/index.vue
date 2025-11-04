<template>
  <div class="landing-page">
    <!-- Navigation Bar -->
    <nav-bar />
    
    <!-- Hero Section -->
    <HeroSection 
      @primary-cta="handlePrimaryCTA"
      @secondary-cta="handleSecondaryCTA"
    />
    
    <!-- Value Proposition Section (Replaces Features) -->
    <ValueProposition />
    
    <!-- How It Works Section -->
    <HowItWorks />
    
    <!-- Social Proof & Trust Section -->
    <SocialProof />
    
    <!-- Subscription Plans Section -->
    <section class="subscription-plans">
      <h2 class="ds-text-display-sm">
        Elige tu Plan
      </h2>
      <p class="subscription-plans-subtitle">
        Comienza tu prueba gratuita de 14 días. Cancela cuando quieras.
      </p>
      
      <div class="plans-grid">
        <PricingCard
          v-for="plan in plans"
          :key="plan.id"
          :plan="plan"
          @plan-selected="handlePlanSelection"
        />
      </div>
    </section>
    
    <!-- FAQs Section -->
    <FAQSection />

    <!-- Plan Selection Modal (same flow as /subscription/plans) -->
    <Modal
      v-model="showPlanModal"
      title="Confirmar Plan"
      :show-close-button="true"
    >
      <div class="plan-confirmation">
        <div v-if="selectedPlan" class="selected-plan">
          <StripeCheckoutTrigger
            :selected-plan="selectedPlan"
            @checkout-started="handleCheckoutStarted"
            @checkout-error="handleCheckoutError"
            @checkout-success="handleCheckoutSuccess"
          />
        </div>
      </div>
    </Modal>
    
    <!-- Installation Prompt (PWA) -->
    <section v-if="showInstallPrompt" class="install-prompt">
      <div class="install-card">
        <Icon name="download" class="install-icon" />
        <h2 class="ds-text-display-xs">¡Instala la aplicación!</h2>
        <p class="install-description">
          Instala epàlwi-rèbbo en tu dispositivo para acceso rápido y función offline.
        </p>
        <button 
          @click="installApp"
          class="install-button"
        >
          <Icon name="download" class="button-icon" />
          Instalar Aplicación
        </button>
      </div>
    </section>
    
    <!-- Footer -->
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

// Page metadata
useHead({
  title: 'Diccionario Español-Ndowe | epàlwi-rèbbo',
  meta: [
    { 
      name: 'description', 
      content: 'Diccionario offline español-ndowe para preservar el idioma. Funciona sin internet.' 
    }
  ]
})

// Auth store for conditional rendering - only access on client side
const authStore = process.client ? useAuthStore() : null

// PWA Installation (simplified for Phase 1)
const showInstallPrompt = ref(false)

// Install app function (placeholder)
const installApp = async () => {
  // Will be implemented in Phase 7
  console.log('PWA installation will be implemented in Phase 7')
}

// Subscription plans from store (for correct price IDs)
const subscriptionStore = useSubscriptionStore()
const plans = computed(() => subscriptionStore.plans)

// Plan modal state
const showPlanModal = ref(false)
const selectedPlan = ref<any>(null)

// Handle plan selection -> open modal
const handlePlanSelection = (plan: any) => {
  selectedPlan.value = plan
  showPlanModal.value = true
}

// Checkout handlers
const handleCheckoutStarted = () => {
  console.log('Checkout started')
}

const handleCheckoutError = (error: string) => {
  console.error('Checkout error:', error)
}

const handleCheckoutSuccess = (sessionId: string) => {
  console.log('Checkout success:', sessionId)
  showPlanModal.value = false
  navigateTo(`/subscription/success?session_id=${sessionId}`)
}

// Handle primary CTA (free trial)
const handlePrimaryCTA = () => {
  // Navigate to signup or subscription page
  navigateTo('/auth/signup')
}

// Handle secondary CTA (view dictionary)
const handleSecondaryCTA = () => {
  // Navigate to dictionary page
  navigateTo('/dictionary')
}


// Log for development
onMounted(() => {
  if (process.dev) {
    console.log('Landing page mounted')
    console.log('Auth state:', authStore?.isAuthenticated)
  }
})
</script>

<style lang="scss" scoped>
.landing-page {
  animation: fadeIn 0.6s ease-out;
  min-height: 100vh;
}

/* Removed hero and features styles - now using components */



/* Subscription Plans Section */
.subscription-plans {
  padding: var(--ds-spacing-8) var(--ds-spacing-2);
  background: var(--ds-background);
}

.subscription-plans h2 {
  text-align: center;
  margin-bottom: var(--ds-spacing-1);
}

.subscription-plans-subtitle {
  font-size: 1.125rem; /* 18px */
  color: var(--ds-muted-foreground);
  text-align: center;
  margin-bottom: var(--ds-spacing-6);
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.plans-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--ds-spacing-4);
  max-width: 800px;
  margin: 0 auto var(--ds-spacing-6);
}



/* Install Prompt */
.install-prompt {
  padding: var(--ds-spacing-6) var(--ds-spacing-2);
  background: var(--ds-background);
}

.install-card {
  background: var(--ds-primary);
  color: var(--ds-primary-foreground);
  border-radius: var(--ds-radius-lg);
  padding: var(--ds-spacing-4);
  text-align: center;
  max-width: 500px;
  margin: 0 auto;
}

.install-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto var(--ds-spacing-1);
}

.install-card h2 {
  margin-bottom: var(--ds-spacing-1);
}

.install-description {
  margin-bottom: var(--ds-spacing-2);
  line-height: var(--ds-line-height-normal);
}

.install-button {
  height: 48px;
  padding: 0 var(--ds-spacing-2);
  background: var(--ds-card);
  color: var(--ds-primary);
  border: none;
  border-radius: var(--ds-radius);
  font-size: 1rem; /* 16px */
  font-weight: var(--ds-font-weight-semibold);
  cursor: pointer;
  transition: all var(--ds-duration) var(--ds-ease);
  display: flex;
  align-items: center;
  gap: var(--ds-spacing-05);
  margin: 0 auto;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: var(--ds-shadow-md);
  }
  
  .button-icon {
    width: 16px;
    height: 16px;
  }
}





/* Responsive Design */
@media (max-width: 768px) {
  .plans-grid {
    grid-template-columns: 1fr;
  }
  
  .footer-content {
    grid-template-columns: 1fr;
    text-align: center;
  }
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.1;
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    opacity: 0.2;
    transform: translate(-50%, -50%) scale(1.1);
  }
}
</style> 
