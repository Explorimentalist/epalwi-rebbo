<template>
  <div class="manage-page">
    <div class="page-container">
      <!-- Header -->
      <div class="page-header">
        <h1 class="page-title">Gestionar Suscripción</h1>
        <p class="page-subtitle">
          Administra tu plan y método de pago
        </p>
      </div>

      <!-- Current Subscription -->
      <div class="subscription-card">
        <div class="subscription-header">
          <h3 class="subscription-title">Tu Suscripción Actual</h3>
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
            @click="updatePaymentMethod"
            class="action-button secondary"
          >
            <Icon name="credit-card" class="button-icon" />
            Actualizar Método de Pago
          </button>
          <button
            @click="viewInvoices"
            class="action-button tertiary"
          >
            <Icon name="document-text" class="button-icon" />
            Ver Facturas
          </button>
        </div>
      </div>

      <!-- Trial Information -->
      <div v-if="isTrialActive" class="trial-card">
        <div class="trial-header">
          <Icon name="clock" class="trial-icon" />
          <h3 class="trial-title">Período de Prueba</h3>
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
        <h3 class="management-title">Gestionar Plan</h3>
        
        <div class="plan-options">
          <div class="option-card">
            <h4 class="option-title">Cambiar Plan</h4>
            <p class="option-description">
              Actualiza a un plan diferente o cambia entre mensual y anual
            </p>
            <button
              @click="changePlan"
              class="option-button"
            >
              Cambiar Plan
            </button>
          </div>
          
          <div class="option-card">
            <h4 class="option-title">Cancelar Suscripción</h4>
            <p class="option-description">
              Cancela tu suscripción al final del período actual
            </p>
            <button
              @click="cancelSubscription"
              class="option-button danger"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>

      <!-- Billing History -->
      <div class="billing-history">
        <h3 class="history-title">Historial de Facturación</h3>
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
              class="download-button"
            >
              <Icon name="arrow-down-tray" class="download-icon" />
              Descargar
            </button>
          </div>
        </div>
      </div>

      <!-- Support Section -->
      <div class="support-section">
        <h3 class="support-title">¿Necesitas Ayuda?</h3>
        <p class="support-description">
          Nuestro equipo de soporte está aquí para ayudarte
        </p>
        <div class="support-actions">
          <button
            @click="contactSupport"
            class="support-button"
          >
            <Icon name="question-mark-circle" class="support-icon" />
            Contactar Soporte
          </button>
          <button
            @click="viewHelpCenter"
            class="support-button secondary"
          >
            <Icon name="book-open" class="support-icon" />
            Centro de Ayuda
          </button>
        </div>
      </div>
    </div>

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
            class="confirm-button danger"
          >
            Sí, Cancelar
          </button>
          <button
            @click="showCancelModal = false"
            class="confirm-button secondary"
          >
            No, Mantener
          </button>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

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

// Mock data - replace with real data from your backend
const currentSubscription = ref({
  plan: 'Plan Anual',
  price: 8.97,
  period: 'por año',
  nextBilling: '15 de Enero, 2025',
  paymentMethod: 'Tarjeta terminada en 4242'
})

const isTrialActive = ref(true)
const trialEndDate = ref('15 de Enero, 2025')
const trialDaysRemaining = ref(8)

const billingHistory = ref([
  {
    id: 'inv_001',
    date: '15 de Diciembre, 2024',
    amount: 8.97,
    status: 'Pagado',
    statusClass: 'status-paid'
  },
  {
    id: 'inv_002',
    date: '15 de Noviembre, 2024',
    amount: 8.97,
    status: 'Pagado',
    statusClass: 'status-paid'
  }
])

// Computed properties
const subscriptionStatusText = computed(() => {
  if (isTrialActive.value) return 'En Prueba'
  return 'Activo'
})

const subscriptionStatusClass = computed(() => {
  if (isTrialActive.value) return 'status-trial'
  return 'status-active'
})

const trialProgressPercent = computed(() => {
  // Assuming 14-day trial
  const totalDays = 14
  const remaining = trialDaysRemaining.value
  return ((totalDays - remaining) / totalDays) * 100
})

// Actions
const updatePaymentMethod = () => {
  // Implement payment method update
  console.log('Update payment method')
}

const viewInvoices = () => {
  // Implement invoice viewing
  console.log('View invoices')
}

const changePlan = () => {
  navigateTo('/subscription/plans')
}

const cancelSubscription = () => {
  showCancelModal.value = true
}

const confirmCancel = async () => {
  try {
    // Implement subscription cancellation
    console.log('Cancelling subscription')
    showCancelModal.value = false
    // Show success message
  } catch (error) {
    console.error('Error cancelling subscription:', error)
  }
}

const downloadInvoice = (invoiceId: string) => {
  // Implement invoice download
  console.log('Download invoice:', invoiceId)
}

const contactSupport = () => {
  window.open('mailto:soporte@epalwi-rebbo.com', '_blank')
}

const viewHelpCenter = () => {
  // Navigate to help center or open in new tab
  window.open('/help', '_blank')
}
</script>

<style lang="scss" scoped>
.manage-page {
  min-height: 100vh;
  background: var(--color-background);
  padding: var(--space-8) 0;
}

.page-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 var(--space-6);
}

.page-header {
  text-align: center;
  margin-bottom: var(--space-10);
  
  .page-title {
    font-size: var(--font-size-4xl);
    font-weight: var(--font-weight-bold);
    color: var(--color-text);
    margin-bottom: var(--space-4);
  }
  
  .page-subtitle {
    font-size: var(--font-size-lg);
    color: var(--color-text-muted);
    line-height: var(--line-height-normal);
  }
}

.subscription-card {
  background: var(--color-primary);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
  padding: var(--space-8);
  margin-bottom: var(--space-8);
  
  .subscription-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-6);
    
    .subscription-title {
      font-size: var(--font-size-xl);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text);
    }
    
    .subscription-status {
      padding: var(--space-2) var(--space-4);
      border-radius: var(--border-radius-full);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-semibold);
      
      &.status-trial {
        background: var(--color-warning-light);
        color: var(--color-warning);
      }
      
      &.status-active {
        background: var(--color-success-light);
        color: var(--color-success);
      }
    }
  }
  
  .subscription-details {
    margin-bottom: var(--space-6);
    
    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--space-3) 0;
      border-bottom: 1px solid var(--color-border);
      
      &:last-child {
        border-bottom: none;
      }
      
      .detail-label {
        font-size: var(--font-size-base);
        color: var(--color-text-muted);
        font-weight: var(--font-weight-medium);
      }
      
      .detail-value {
        font-size: var(--font-size-base);
        color: var(--color-text);
        font-weight: var(--font-weight-semibold);
      }
    }
  }
  
  .subscription-actions {
    display: flex;
    gap: var(--space-4);
    
    .action-button {
      height: var(--space-10);
      padding: 0 var(--space-6);
      border: none;
      border-radius: var(--border-radius);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-semibold);
      cursor: pointer;
      transition: all 0.15s ease-in-out;
      display: flex;
      align-items: center;
      gap: var(--space-2);
      
      .button-icon {
        width: 16px;
        height: 16px;
      }
      
      &.secondary {
        background: transparent;
        color: var(--color-secondary);
        border: 1px solid var(--color-secondary);
        
        &:hover {
          background: var(--color-secondary);
          color: white;
        }
      }
      
      &.tertiary {
        background: transparent;
        color: var(--color-text-muted);
        border: 1px solid var(--color-border);
        
        &:hover {
          background: var(--color-text-muted);
          color: white;
        }
      }
    }
  }
}

.trial-card {
  background: var(--color-primary);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
  padding: var(--space-6);
  margin-bottom: var(--space-8);
  
  .trial-header {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    margin-bottom: var(--space-4);
    
    .trial-icon {
      width: 24px;
      height: 24px;
      color: var(--color-warning);
    }
    
    .trial-title {
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text);
    }
  }
  
  .trial-description {
    font-size: var(--font-size-base);
    color: var(--color-text-muted);
    margin-bottom: var(--space-4);
    line-height: var(--line-height-normal);
  }
  
  .trial-progress {
    .progress-bar {
      width: 100%;
      height: 8px;
      background: var(--color-border);
      border-radius: var(--border-radius-full);
      overflow: hidden;
      margin-bottom: var(--space-2);
      
      .progress-fill {
        height: 100%;
        background: var(--color-warning);
        transition: width 0.3s ease;
      }
    }
    
    .progress-text {
      font-size: var(--font-size-sm);
      color: var(--color-text-muted);
      font-weight: var(--font-weight-medium);
    }
  }
}

.plan-management {
  margin-bottom: var(--space-8);
  
  .management-title {
    font-size: var(--font-size-2xl);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text);
    margin-bottom: var(--space-6);
  }
  
  .plan-options {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: var(--space-6);
    
    .option-card {
      background: var(--color-primary);
      border-radius: var(--border-radius-lg);
      box-shadow: var(--shadow-md);
      padding: var(--space-6);
      
      .option-title {
        font-size: var(--font-size-lg);
        font-weight: var(--font-weight-semibold);
        color: var(--color-text);
        margin-bottom: var(--space-3);
      }
      
      .option-description {
        font-size: var(--font-size-sm);
        color: var(--color-text-muted);
        margin-bottom: var(--space-6);
        line-height: var(--line-height-normal);
      }
      
      .option-button {
        width: 100%;
        height: var(--space-10);
        border: none;
        border-radius: var(--border-radius);
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-semibold);
        cursor: pointer;
        transition: all 0.15s ease-in-out;
        
        &:hover {
          transform: translateY(-1px);
        }
        
        &.danger {
          background: var(--color-error);
          color: white;
          
          &:hover {
            background: var(--color-error-dark);
          }
        }
      }
    }
  }
}

.billing-history {
  margin-bottom: var(--space-8);
  
  .history-title {
    font-size: var(--font-size-2xl);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text);
    margin-bottom: var(--space-6);
  }
  
  .history-list {
    .invoice-item {
      background: var(--color-primary);
      border-radius: var(--border-radius);
      padding: var(--space-4);
      margin-bottom: var(--space-4);
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .invoice-info {
        display: flex;
        gap: var(--space-6);
        align-items: center;
        
        .invoice-date {
          font-size: var(--font-size-sm);
          color: var(--color-text-muted);
        }
        
        .invoice-amount {
          font-size: var(--font-size-base);
          font-weight: var(--font-weight-semibold);
          color: var(--color-text);
        }
        
        .invoice-status {
          padding: var(--space-1) var(--space-3);
          border-radius: var(--border-radius-sm);
          font-size: var(--font-size-xs);
          font-weight: var(--font-weight-medium);
          
          &.status-paid {
            background: var(--color-success-light);
            color: var(--color-success);
          }
        }
      }
      
      .download-button {
        height: var(--space-8);
        padding: 0 var(--space-4);
        background: transparent;
        color: var(--color-secondary);
        border: 1px solid var(--color-secondary);
        border-radius: var(--border-radius);
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-medium);
        cursor: pointer;
        transition: all 0.15s ease-in-out;
        display: flex;
        align-items: center;
        gap: var(--space-2);
        
        &:hover {
          background: var(--color-secondary);
          color: white;
        }
        
        .download-icon {
          width: 16px;
          height: 16px;
        }
      }
    }
  }
}

.support-section {
  text-align: center;
  
  .support-title {
    font-size: var(--font-size-2xl);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text);
    margin-bottom: var(--space-4);
  }
  
  .support-description {
    font-size: var(--font-size-base);
    color: var(--color-text-muted);
    margin-bottom: var(--space-6);
    line-height: var(--line-height-normal);
  }
  
  .support-actions {
    display: flex;
    gap: var(--space-4);
    justify-content: center;
    
    .support-button {
      height: var(--space-10);
      padding: 0 var(--space-6);
      border: none;
      border-radius: var(--border-radius);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-semibold);
      cursor: pointer;
      transition: all 0.15s ease-in-out;
      display: flex;
      align-items: center;
      gap: var(--space-2);
      
      .support-icon {
        width: 16px;
        height: 16px;
      }
      
      &:hover {
        transform: translateY(-1px);
      }
      
      &.secondary {
        background: transparent;
        color: var(--color-secondary);
        border: 1px solid var(--color-secondary);
        
        &:hover {
          background: var(--color-secondary);
          color: white;
        }
      }
    }
  }
}

.cancel-confirmation {
  text-align: center;
  
  .confirmation-message {
    font-size: var(--font-size-base);
    color: var(--color-text);
    margin-bottom: var(--space-6);
    line-height: var(--line-height-normal);
  }
  
  .confirmation-actions {
    display: flex;
    gap: var(--space-4);
    justify-content: center;
    
    .confirm-button {
      height: var(--space-10);
      padding: 0 var(--space-6);
      border: none;
      border-radius: var(--border-radius);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-semibold);
      cursor: pointer;
      transition: all 0.15s ease-in-out;
      
      &:hover {
        transform: translateY(-1px);
      }
      
      &.danger {
        background: var(--color-error);
        color: white;
        
        &:hover {
          background: var(--color-error-dark);
        }
      }
      
      &.secondary {
        background: transparent;
        color: var(--color-text-muted);
        border: 1px solid var(--color-border);
        
        &:hover {
          background: var(--color-text-muted);
          color: white;
        }
      }
    }
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .subscription-actions {
    flex-direction: column;
  }
  
  .plan-options {
    grid-template-columns: 1fr;
  }
  
  .support-actions {
    flex-direction: column;
  }
  
  .confirmation-actions {
    flex-direction: column;
  }
  
  .page-title {
    font-size: var(--font-size-3xl);
  }
}
</style>
