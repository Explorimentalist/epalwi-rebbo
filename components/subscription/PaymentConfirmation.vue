<template>
  <div 
    v-if="isVisible"
    class="payment-confirmation"
    @click="handleBackdropClick"
  >
    <div class="confirmation-modal" @click.stop>
      <!-- Modal Header -->
      <div class="modal-header">
        <button 
          v-if="showCloseButton"
          class="close-button"
          @click="handleClose"
        >
          <Icon name="x" class="close-icon" />
        </button>
      </div>
      
      <!-- Modal Content -->
      <div class="modal-content">
        <!-- Status Icon -->
        <div 
          class="status-icon"
          :class="statusType"
        >
          <Icon 
            :name="statusIcon" 
            :size="48"
          />
        </div>
        
        <!-- Status Title -->
        <div class="status-title">
          {{ statusTitle }}
        </div>
        
        <!-- Status Message -->
        <div class="status-message">
          {{ statusMessage }}
        </div>
        
        <!-- Plan Details (Success State) -->
        <div 
          v-if="statusType === 'success' && planDetails"
          class="plan-details"
        >
          <div class="plan-name">{{ planDetails.name }}</div>
          <div class="plan-price">{{ planDetails.price }}</div>
          <div class="next-billing">
            Próximo cobro: {{ planDetails.nextBilling }}
          </div>
        </div>
        
        <!-- Error Details (Error State) -->
        <div 
          v-if="statusType === 'error' && errorDetails"
          class="error-details"
        >
          <div class="error-code">{{ errorDetails.code }}</div>
          <div class="error-suggestion">{{ errorDetails.suggestion }}</div>
        </div>
        
        <!-- Cancellation Alternatives (Cancelled State) -->
        <div 
          v-if="statusType === 'cancelled'"
          class="cancellation-alternatives"
        >
          <h4 class="alternatives-title">Alternativas de Pago:</h4>
          <div class="alternatives-list">
            <div class="alternative-item">
              <Icon name="credit-card" class="alternative-icon" />
              <div class="alternative-content">
                <div class="alternative-title">Intentar de Nuevo</div>
                <div class="alternative-description">Reintenta el pago con la misma tarjeta</div>
              </div>
            </div>
            <div class="alternative-item">
              <Icon name="credit-card" class="alternative-icon" />
              <div class="alternative-content">
                <div class="alternative-title">Otra Tarjeta</div>
                <div class="alternative-description">Usa una tarjeta diferente</div>
              </div>
            </div>
            <div class="alternative-item">
              <Icon name="building-library" class="alternative-icon" />
              <div class="alternative-content">
                <div class="alternative-title">Continuar con Prueba</div>
                <div class="alternative-description">Usa tu período de prueba gratuito</div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Processing Indicator (Processing State) -->
        <div 
          v-if="statusType === 'processing'"
          class="processing-indicator"
        >
          <div class="processing-text">
            {{ processingText }}
          </div>
        </div>
        
        <!-- Action Buttons -->
        <div class="action-buttons">
          <button
            v-if="primaryAction"
            class="action-button primary"
            :disabled="statusType === 'processing'"
            @click="handlePrimaryAction"
          >
            {{ primaryAction.text }}
          </button>
          
          <button
            v-if="secondaryAction"
            class="action-button secondary"
            :disabled="statusType === 'processing'"
            @click="handleSecondaryAction"
          >
            {{ secondaryAction.text }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface PlanDetails {
  name: string
  price: string
  nextBilling: string
}

interface ErrorDetails {
  code: string
  suggestion: string
}

interface Action {
  text: string
  action: string
}

interface Props {
  isVisible: boolean
  statusType: 'success' | 'error' | 'processing' | 'cancelled'
  planDetails?: PlanDetails
  errorDetails?: ErrorDetails
  primaryAction?: Action
  secondaryAction?: Action
  showCloseButton?: boolean
  processingText?: string
}

const props = withDefaults(defineProps<Props>(), {
  showCloseButton: true,
  processingText: 'Procesando tu pago... Por favor, espera.'
})

const emit = defineEmits<{
  'close': []
  'primary-action': [action: string]
  'secondary-action': [action: string]
}>()

// Computed properties
const statusIcon = computed(() => {
  switch (props.statusType) {
    case 'success': return 'check-circle'
    case 'error': return 'alert-circle'
    case 'processing': return 'loader-2'
    case 'cancelled': return 'x-circle'
    default: return 'info'
  }
})

const statusTitle = computed(() => {
  switch (props.statusType) {
    case 'success': return '¡Éxito!'
    case 'error': return 'Error'
    case 'processing': return 'Procesando...'
    case 'cancelled': return 'Pago Cancelado'
    default: return 'Información'
  }
})

const statusMessage = computed(() => {
  switch (props.statusType) {
    case 'success': return 'Tu suscripción ha sido activada correctamente'
    case 'error': return 'No se pudo procesar tu pago. Por favor, inténtalo de nuevo.'
    case 'processing': return 'Estamos procesando tu pago. Esto puede tomar unos momentos.'
    case 'cancelled': return 'Tu pago fue cancelado. Aquí tienes alternativas para continuar.'
    default: return ''
  }
})

// Event handlers
const handleClose = () => {
  emit('close')
}

const handleBackdropClick = () => {
  if (props.showCloseButton) {
    emit('close')
  }
}

const handlePrimaryAction = () => {
  if (props.primaryAction) {
    emit('primary-action', props.primaryAction.action)
  }
}

const handleSecondaryAction = () => {
  if (props.secondaryAction) {
    emit('secondary-action', props.secondaryAction.action)
  }
}
</script>

<style scoped>
.payment-confirmation {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal);
  padding: var(--ds-spacing-3); /* 24px */
  
  .confirmation-modal {
    background: var(--ds-card);
    border-radius: var(--ds-radius-lg);
    box-shadow: var(--ds-shadow-lg);
    max-width: 480px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    position: relative;
    
    /* Mobile: full height */
    @media (max-width: 767px) {
      max-height: 100vh;
      border-radius: 0;
      margin: 0;
    }
    
    .modal-header {
      position: relative;
      padding: var(--ds-spacing-3); /* 24px */
      text-align: center;
      border-bottom: 1px solid var(--ds-border);
      
      .close-button {
        position: absolute;
        top: var(--ds-spacing-2); /* 16px */
        right: var(--ds-spacing-2); /* 16px */
        width: 32px;
        height: 32px;
        background: none;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: var(--ds-radius);
        transition: background var(--ds-duration);
        
        &:hover {
          background: var(--ds-background);
        }
        
        .close-icon {
          width: 20px;
          height: 20px;
          color: var(--ds-muted-foreground);
        }
      }
    }
    
    .modal-content {
      padding: var(--ds-spacing-3); /* 24px */
      
      .status-icon {
        width: 48px;
        height: 48px;
        margin: 0 auto var(--ds-spacing-3); /* 0 auto, 24px below */
        display: flex;
        align-items: center;
        justify-content: center;
        
        &.success {
          color: var(--ds-accent);
        }
        
        &.error {
          color: var(--ds-destructive);
        }
        
        &.processing {
          color: var(--ds-primary);
          animation: spin 1s linear infinite;
        }
      }
      
      .status-title {
        font-size: 1.25rem;
        font-weight: var(--ds-font-weight-semibold);
        color: var(--ds-foreground);
        text-align: center;
        margin-bottom: var(--ds-spacing-2); /* 16px */
      }
      
      .status-message {
        font-size: 1rem;
        color: var(--ds-muted-foreground);
        text-align: center;
        line-height: var(--ds-line-height-normal);
        margin-bottom: var(--ds-spacing-3); /* 24px */
      }
      
      .plan-details {
        background: var(--ds-background);
        padding: var(--ds-spacing-2); /* 16px */
        border-radius: var(--ds-radius);
        margin-bottom: var(--ds-spacing-3); /* 24px */
        text-align: center;
        
        .plan-name {
          font-size: 1.125rem;
          font-weight: var(--ds-font-weight-semibold);
          color: var(--ds-foreground);
          margin-bottom: var(--ds-spacing-025); /* 4px */
        }
        
        .plan-price {
          font-size: 1rem;
          color: var(--ds-muted-foreground);
          margin-bottom: var(--ds-spacing-1); /* 8px */
        }
        
        .next-billing {
          font-size: 0.875rem;
          color: var(--ds-muted-foreground);
          font-style: italic;
        }
      }
      
      .action-buttons {
        display: flex;
        flex-direction: column;
        gap: var(--ds-spacing-1); /* 8px between buttons */
        
        /* Desktop: horizontal layout */
        @media (min-width: 768px) {
          flex-direction: row;
          justify-content: center;
          
          .action-button {
            min-width: 160px;
          }
        }
        
        .action-button {
          height: 48px; /* 48px */
          padding: 0 var(--ds-spacing-3); /* 0 vertical, 24px horizontal */
          border: none;
          border-radius: var(--ds-radius);
          font-size: 1rem;
          font-weight: var(--ds-font-weight-semibold);
          cursor: pointer;
          transition: all var(--ds-duration);
          
          &.primary {
            background: var(--ds-primary);
            color: white;
            
            &:hover:not(:disabled) {
              background: var(--ds-primary-dark);
            }
          }
          
          &.secondary {
            background: transparent;
            color: var(--ds-foreground);
            border: 1px solid var(--ds-border);
            
            &:hover:not(:disabled) {
              background: var(--ds-background);
              border-color: var(--ds-primary);
            }
          }
          
          &:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }
        }
      }
      
      .error-details {
        background: hsl(var(--ds-destructive) / 0.1);
        border: 1px solid var(--ds-destructive);
        border-radius: var(--ds-radius);
        padding: var(--ds-spacing-2); /* 16px */
        margin-bottom: var(--ds-spacing-3); /* 24px */
        
        .error-code {
          font-family: monospace;
          font-size: 0.875rem;
          color: var(--ds-destructive);
          background: hsl(var(--ds-destructive) / 0.05);
          padding: var(--ds-spacing-025) var(--ds-spacing-1); /* 4px vertical, 8px horizontal */
          border-radius: var(--ds-radius);
          display: inline-block;
          margin-bottom: var(--ds-spacing-1); /* 8px */
        }
        
        .error-suggestion {
          font-size: 0.875rem;
          color: var(--ds-muted-foreground);
          line-height: var(--ds-line-height-normal);
        }
      }
      
      .cancellation-alternatives {
        background: var(--ds-background);
        border: 1px solid var(--ds-border);
        border-radius: var(--ds-radius);
        padding: var(--ds-spacing-2); /* 16px */
        margin-bottom: var(--ds-spacing-3); /* 24px */
        
        .alternatives-title {
          font-size: 1rem;
          font-weight: var(--ds-font-weight-semibold);
          color: var(--ds-foreground);
          margin-bottom: var(--ds-spacing-1); /* 8px */
          text-align: center;
        }
        
        .alternatives-list {
          display: flex;
          flex-direction: column;
          gap: var(--ds-spacing-1); /* 8px between items */
          
          .alternative-item {
            display: flex;
            align-items: center;
            gap: var(--ds-spacing-1); /* 8px between icon and content */
            padding: var(--ds-spacing-1); /* 8px */
            background: var(--ds-card);
            border-radius: var(--ds-radius);
            border: 1px solid var(--ds-border);
            transition: all var(--ds-duration);
            
            &:hover {
              border-color: var(--ds-primary);
              background: var(--ds-background);
            }
            
            .alternative-icon {
              width: 20px;
              height: 20px;
              color: var(--ds-primary);
              flex-shrink: 0;
            }
            
            .alternative-content {
              flex: 1;
              
              .alternative-title {
                font-size: 0.875rem;
                font-weight: var(--ds-font-weight-semibold);
                color: var(--ds-foreground);
                margin-bottom: var(--ds-spacing-025); /* 2px */
              }
              
              .alternative-description {
                font-size: 0.75rem;
                color: var(--ds-muted-foreground);
                line-height: var(--ds-line-height-normal);
              }
            }
          }
        }
      }
      
      .processing-indicator {
        text-align: center;
        margin-bottom: var(--ds-spacing-3); /* 24px */
        
        .processing-text {
          font-size: 1rem;
          color: var(--ds-muted-foreground);
          margin-top: var(--ds-spacing-1); /* 8px */
        }
      }
    }
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Responsive adjustments */
@media (max-width: 767px) {
  .payment-confirmation {
    padding: 0;
    
    .confirmation-modal {
      border-radius: 0;
      max-height: 100vh;
      
      .modal-header {
        padding: var(--ds-spacing-2); /* 16px */
      }
      
      .modal-content {
        padding: var(--ds-spacing-2); /* 16px */
      }
    }
  }
}

</style>
