<template>
  <div class="manage-page">
    <!-- Navigation -->
    <nav-bar />

    <section class="subscription-manage">
      <div class="container">
        <!-- Header -->
        <div class="page-header">
        <h1 class="ds-text-display-lg">Gestionar Suscripción</h1>
        <p class="page-subtitle">
          Administra tu plan y método de pago
        </p>
      </div>

      <!-- Current Subscription -->
      <div class="subscription-card">
        <div class="subscription-header">
          <h2 class="ds-text-display-sm">Tu Suscripción Actual</h2>
          <div class="subscription-status" :class="subscriptionStatusClass">
            {{ subscriptionStatusText }}
          </div>
        </div>
        
        <div class="subscription-details">
          <div class="detail-row">
            <span class="detail-label">Plan:</span>
            <span class="detail-value">{{ currentSubscription.plan }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Precio:</span>
            <span class="detail-value">€{{ currentSubscription.price }} {{ currentSubscription.period }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Próximo cobro:</span>
            <span class="detail-value">{{ currentSubscription.nextBilling }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Método de pago:</span>
            <span class="detail-value">{{ currentSubscription.paymentMethod }}</span>
          </div>
        </div>
        
        <div class="subscription-actions">
          <button
            @click="viewInvoices"
            class="ds-btn-primary ds-btn-md ds-btn-icon"
          >
            <Icon name="document-text" class="ds-btn-icon-element" />
            Ver Facturas
          </button>
          <button
            @click="updatePaymentMethod"
            class="ds-btn-primary ds-btn-md ds-btn-icon"
          >
            <Icon name="credit-card" class="ds-btn-icon-element" />
            Actualizar Método de Pago
          </button>
        </div>
      </div>

      <!-- Trial Information -->
      <div v-if="isTrialActive" class="trial-card">
        <div class="trial-header">
          <Icon name="clock" class="trial-icon" />
          <h2 class="ds-text-display-sm">Período de Prueba</h2>
        </div>
        <p class="trial-description">
          Tu prueba gratuita termina el {{ trialEndDate }}. 
          Después de esta fecha, se activará tu suscripción.
        </p>
        <div class="trial-progress">
          <div class="progress-bar">
            <div 
              class="progress-fill" 
              :style="{ width: trialProgressPercent + '%' }"
            ></div>
          </div>
          <span class="progress-text">{{ trialDaysRemaining }} días restantes</span>
        </div>
      </div>

      <!-- Plan Management -->
      <div class="plan-management">
        <h2 class="ds-text-display-sm">Gestionar Plan</h2>
        
        <div class="plan-options">
          <div class="option-card">
            <h3 class="ds-text-display-xs">Cambiar Plan</h3>
            <p class="option-description">
              Actualiza a un plan diferente o cambia entre mensual y anual
            </p>
            <button
              @click="changePlan"
              class="ds-btn-primary ds-btn-md w-full"
            >
              Cambiar Plan
            </button>
          </div>
          
          <div class="option-card">
            <h3 class="ds-text-display-xs">Cancelar Suscripción</h3>
            <p class="option-description">
              Cancela tu suscripción al final del período actual
            </p>
            <button
              @click="cancelSubscription"
              class="ds-btn-danger ds-btn-md w-full"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>

      <!-- Billing History -->
      <div class="billing-history">
        <h2 class="ds-text-display-sm">Historial de Facturación</h2>
        <div class="history-list">
          <div
            v-for="invoice in billingHistory"
            :key="invoice.id"
            class="invoice-item"
          >
            <div class="invoice-info">
              <div class="invoice-date">{{ invoice.date }}</div>
              <div class="invoice-amount">€{{ invoice.amount }}</div>
              <div class="invoice-status" :class="invoice.statusClass">
                {{ invoice.status }}
              </div>
            </div>
            <button
              @click="downloadInvoice(invoice.id)"
              class="ds-btn-secondary ds-btn-sm ds-btn-icon"
            >
              <Icon name="arrow-down-tray" class="ds-btn-icon-element" />
              Descargar
            </button>
          </div>
        </div>
      </div>

      <!-- Support Section -->
      <div class="support-section">
        <h2 class="ds-text-display-sm">¿Necesitas Ayuda?</h2>
        <p class="support-description">
          Nuestro equipo de soporte está aquí para ayudarte
        </p>
        <div class="support-actions">
          <button
            @click="contactSupport"
            class="ds-btn-primary ds-btn-md ds-btn-icon"
          >
            <Icon name="question-mark-circle" class="ds-btn-icon-element" />
            Contactar Soporte
          </button>
        </div>
      </div>
      </div>
    </section>

    <!-- Footer -->
    <Footer />

    <!-- Confirmation Modal -->
    <Modal
      v-model="showCancelModal"
      title="Confirmar Cancelación"
      :show-close-button="true"
    >
      <div class="cancel-confirmation">
        <p class="confirmation-message">
          ¿Estás seguro de que quieres cancelar tu suscripción? 
          Tendrás acceso hasta el final del período actual.
        </p>
        <div class="confirmation-actions">
          <button
            @click="confirmCancel"
            class="ds-btn-danger ds-btn-md"
          >
            Sí, Cancelar
          </button>
          <button
            @click="showCancelModal = false"
            class="ds-btn-secondary ds-btn-md"
          >
            No, Mantener
          </button>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

// Page metadata
useHead({
  title: 'Gestionar Suscripción | epàlwi-rèbbo',
  meta: [
    { 
      name: 'description', 
      content: 'Administra tu suscripción y método de pago.' 
    }
  ]
})

// State
const showCancelModal = ref(false)
const buttonLoading = ref(false)

// Stores
const authStore = useAuthStore()
const subscriptionStore = useSubscriptionStore()

// Computed subscription details from real store data
const currentSubscription = computed(() => {
  const sub = subscriptionStore.userSubscription
  if (!sub) {
    return {
      plan: 'No activo',
      price: 0,
      period: '',
      nextBilling: 'No disponible',
      paymentMethod: 'No disponible'
    }
  }

  const planType = sub.planType === 'monthly' ? 'Plan Mensual' : 'Plan Anual'
  const price = sub.planType === 'monthly' ? 1 : 8.97
  const period = sub.planType === 'monthly' ? 'por mes' : 'por año'
  const nextBilling = sub.currentPeriodEnd
    ? new Date(sub.currentPeriodEnd).toLocaleDateString('es-ES')
    : 'No disponible'

  return {
    plan: planType,
    price,
    period,
    nextBilling,
    paymentMethod: 'Método de pago registrado'
  }
})

const isTrialActive = computed(() => subscriptionStore.isTrialActive)
const trialDaysRemaining = computed(() => subscriptionStore.trialDaysRemaining)
const trialEndDate = computed(() => {
  const sub = subscriptionStore.userSubscription
  return sub?.trialEnd ? new Date(sub.trialEnd).toLocaleDateString('es-ES') : '—'
})

const billingHistory = ref([] as any[])

// Computed properties
const subscriptionStatusText = computed(() => {
  const sub = subscriptionStore.userSubscription
  if (!sub) return 'No activo'
  switch (sub.status) {
    case 'trialing': return 'En Prueba'
    case 'active': return 'Activo'
    case 'canceled': return 'Cancelado'
    case 'past_due': return 'Pago Pendiente'
    default: return sub.status
  }
})

const subscriptionStatusClass = computed(() => {
  const sub = subscriptionStore.userSubscription
  if (!sub) return 'status-inactive'
  if (sub.status === 'trialing') return 'status-trial'
  if (sub.status === 'active') return 'status-active'
  if (sub.status === 'canceled') return 'status-canceled'
  return 'status-inactive'
})

const trialProgressPercent = computed(() => {
  const totalDays = 14
  const remaining = trialDaysRemaining.value || 0
  return Math.max(0, Math.min(100, ((totalDays - remaining) / totalDays) * 100))
})

// Actions
const updatePaymentMethod = async () => {
  try {
    buttonLoading.value = true
    const url = await subscriptionStore.getCustomerPortalUrl()
    if (url) window.location.href = url
  } catch (error) {
    console.error('Error opening customer portal:', error)
  } finally {
    buttonLoading.value = false
  }
}

const viewInvoices = async () => {
  await updatePaymentMethod()
}

const changePlan = () => {
  navigateTo('/subscription/plans')
}

const cancelSubscription = () => {
  showCancelModal.value = true
}

const confirmCancel = async () => {
  try {
    buttonLoading.value = true
    await subscriptionStore.cancelSubscription()
    showCancelModal.value = false
    // Refresh subscription data
    if (authStore.user?.uid) {
      await subscriptionStore.loadUserSubscription(authStore.user.uid)
    }
    // Show success message
  } catch (error) {
    console.error('Error cancelling subscription:', error)
  } finally {
    buttonLoading.value = false
  }
}

const downloadInvoice = (invoiceId: string) => {
  console.log('Invoice download requires backend implementation', invoiceId)
}

const contactSupport = () => {
  window.open('mailto:soporte@epalwi-rebbo.com', '_blank')
}


onMounted(async () => {
  if (authStore.user?.uid) {
    await subscriptionStore.loadUserSubscription(authStore.user.uid)
  }
})
</script>

<style lang="scss" scoped>
.manage-page {
  min-height: 100vh;
  background: var(--ds-background);
}

.subscription-manage {
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

.subscription-card {
  background: var(--ds-card);
  border: 1px solid var(--ds-border);
  border-radius: var(--ds-radius-lg);
  padding: var(--ds-spacing-6);
  margin-bottom: var(--ds-spacing-6);
  
  .subscription-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--ds-spacing-4);
    
    .subscription-status {
      padding: var(--ds-spacing-1) var(--ds-spacing-3);
      border-radius: var(--ds-radius-full);
      font-size: 0.875rem;
      font-weight: 500;
      
      &.status-trial {
        background: hsl(48 96% 89%);
        color: hsl(45 93% 47%);
      }
      
      &.status-active {
        background: hsl(143 85% 96%);
        color: hsl(140 100% 27%);
      }
      
      &.status-canceled {
        background: hsl(0 93% 94%);
        color: hsl(0 84% 60%);
      }
      
      &.status-inactive {
        background: var(--ds-muted);
        color: var(--ds-muted-foreground);
      }
    }
  }
  
  .subscription-details {
    margin-bottom: var(--ds-spacing-4);
    
    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--ds-spacing-3) 0;
      border-bottom: 1px solid var(--ds-border);
      
      &:last-child {
        border-bottom: none;
      }
      
      .detail-label {
        font-size: 0.875rem;
        color: var(--ds-muted-foreground);
        font-weight: 500;
      }
      
      .detail-value {
        font-size: 0.875rem;
        color: var(--ds-foreground);
        font-weight: 600;
      }
    }
  }
  
  .subscription-actions {
    display: flex;
    gap: var(--ds-spacing-2);
    flex-wrap: wrap;
    justify-content: flex-end;
  }
}

.trial-card {
  background: var(--ds-card);
  border: 1px solid var(--ds-border);
  border-radius: var(--ds-radius-lg);
  padding: var(--ds-spacing-6);
  margin-bottom: var(--ds-spacing-6);
  
  .trial-header {
    display: flex;
    align-items: center;
    gap: var(--ds-spacing-3);
    margin-bottom: var(--ds-spacing-4);
    
    .trial-icon {
      width: 24px;
      height: 24px;
      color: hsl(45 93% 47%);
    }
  }
  
  .trial-description {
    font-size: 0.875rem;
    color: var(--ds-muted-foreground);
    margin-bottom: var(--ds-spacing-4);
    line-height: 1.5;
  }
  
  .trial-progress {
    .progress-bar {
      width: 100%;
      height: 8px;
      background: var(--ds-muted);
      border-radius: var(--ds-radius-full);
      overflow: hidden;
      margin-bottom: var(--ds-spacing-2);
      
      .progress-fill {
        height: 100%;
        background: hsl(45 93% 47%);
        transition: width 0.3s ease;
      }
    }
    
    .progress-text {
      font-size: 0.875rem;
      color: var(--ds-muted-foreground);
      font-weight: 500;
    }
  }
}

.plan-management {
  margin-bottom: var(--ds-spacing-6);
  
  .plan-options {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: var(--ds-spacing-4);
    
    .option-card {
      background: var(--ds-card);
      border: 1px solid var(--ds-border);
      border-radius: var(--ds-radius-lg);
      padding: var(--ds-spacing-6);
      
      .option-description {
        font-size: 0.875rem;
        color: var(--ds-muted-foreground);
        margin-bottom: var(--ds-spacing-4);
        line-height: 1.5;
      }
      
    }
  }
}

.billing-history {
  margin-bottom: var(--ds-spacing-6);
  
  .history-list {
    .invoice-item {
      background: var(--ds-card);
      border: 1px solid var(--ds-border);
      border-radius: var(--ds-radius);
      padding: var(--ds-spacing-4);
      margin-bottom: var(--ds-spacing-3);
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .invoice-info {
        display: flex;
        gap: var(--ds-spacing-4);
        align-items: center;
        
        .invoice-date {
          font-size: 0.875rem;
          color: var(--ds-muted-foreground);
        }
        
        .invoice-amount {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--ds-foreground);
        }
        
        .invoice-status {
          padding: var(--ds-spacing-1) var(--ds-spacing-2);
          border-radius: var(--ds-radius-sm);
          font-size: 0.75rem;
          font-weight: 500;
          
          &.status-paid {
            background: hsl(143 85% 96%);
            color: hsl(140 100% 27%);
          }
        }
      }
      
    }
  }
}

.support-section {
  text-align: center;
  margin-bottom: var(--ds-spacing-6);
  
  .support-description {
    font-size: 0.875rem;
    color: var(--ds-muted-foreground);
    margin-bottom: var(--ds-spacing-4);
    line-height: 1.5;
  }
  
  .support-actions {
    display: flex;
    gap: var(--ds-spacing-3);
    justify-content: center;
    flex-wrap: wrap;
    
  }
}

.cancel-confirmation {
  text-align: center;
  
  .confirmation-message {
    font-size: 0.875rem;
    color: var(--ds-foreground);
    margin-bottom: var(--ds-spacing-4);
    line-height: 1.5;
  }
  
  .confirmation-actions {
    display: flex;
    gap: var(--ds-spacing-3);
    justify-content: center;
    
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .subscription-actions,
  .confirmation-actions {
    flex-direction: column;
  }
  
  .plan-options {
    grid-template-columns: 1fr;
  }
  
  .invoice-info {
    flex-direction: column;
    align-items: flex-start !important;
    gap: var(--ds-spacing-2) !important;
  }
  
  .invoice-item {
    flex-direction: column;
    align-items: flex-start !important;
    gap: var(--ds-spacing-3);
  }
}
</style>
