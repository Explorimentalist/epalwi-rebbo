<template>
  <div class="plans-page">
    <!-- Navigation -->
    <nav-bar />

    <section class="subscription-plans">
      <div class="container">
        <!-- Header -->
        <header class="page-header">
          <h1 class="ds-text-display-sm">Elige tu Plan</h1>
          <p class="page-subtitle">
            Comienza tu prueba gratuita de 14 días. Cancela cuando quieras.
          </p>
        </header>

        <!-- Plans using shared PricingCard -->
        <div class="plans-grid">
          <PricingCard
            v-for="plan in plans"
            :key="plan.id"
            :plan="plan"
            @plan-selected="selectPlan"
          />
        </div>

        <!-- Trial banner and FAQs as shared sections -->
        <TrialBanner />
        <FAQSection />
      </div>
    </section>

    <!-- Footer -->
    <Footer />

    <!-- Plan Selection Modal -->
    <Modal
      v-model="showPlanModal"
      title="Confirmar Plan"
      :show-close-button="true"
    >
      <div class="plan-confirmation">
        <div v-if="selectedPlan" class="selected-plan">
          <h2 class="ds-text-display-xs">{{ selectedPlan.title }}</h2>
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
      content:
        'Elige tu plan de suscripción y comienza tu prueba gratuita de 14 días.'
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

// Select plan (from PricingCard)
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
}

const handleCheckoutSuccess = (sessionId: string) => {
  console.log('Checkout success:', sessionId)
  showPlanModal.value = false
  navigateTo(`/subscription/success?session_id=${sessionId}`)
}
</script>

<style lang="scss" scoped>
.plans-page {
  min-height: 100vh;
  background: var(--ds-background);
}

.subscription-plans {
  padding: var(--ds-spacing-8) var(--ds-spacing-2);
  background: var(--ds-background);
}

.container {
  max-width: 800px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: var(--ds-spacing-4);
  padding: var(--ds-spacing-8) var(--ds-spacing-3) 0;
}

.page-subtitle {
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

.plan-confirmation {
  display: flex;
  flex-direction: column;
  gap: var(--ds-spacing-1);
}

.selected-plan-price {
  color: var(--ds-muted-foreground);
}
</style>
