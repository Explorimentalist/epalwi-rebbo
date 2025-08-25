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
  padding: var(--space-8); /* 24px */
  
  .confirmation-modal {
    background: var(--color-primary);
    border-radius: var(--border-radius-lg);
    box-shadow: var(--shadow-lg);
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
      padding: var(--space-8); /* 24px */
      text-align: center;
      border-bottom: 1px solid var(--color-border-light);
      
      .close-button {
        position: absolute;
        top: var(--space-6); /* 16px */
        right: var(--space-6); /* 16px */
        width: 32px;
        height: 32px;
        background: none;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: var(--border-radius);
        transition: background var(--transition-fast);
        
        &:hover {
          background: var(--color-background);
        }
        
        .close-icon {
          width: 20px;
          height: 20px;
          color: var(--color-text-muted);
        }
      }
    }
    
    .modal-content {
      padding: var(--space-8); /* 24px */
      
      .status-icon {
        width: 48px;
        height: 48px;
        margin: 0 auto var(--space-8); /* 0 auto, 24px below */
        display: flex;
        align-items: center;
        justify-content: center;
        
        &.success {
          color: var(--color-success);
        }
        
        &.error {
          color: var(--color-error);
        }
        
        &.processing {
          color: var(--color-secondary);
          animation: spin 1s linear infinite;
        }
      }
      
      .status-title {
        font-size: var(--font-size-xl);
        font-weight: var(--font-weight-semibold);
        color: var(--color-text);
        text-align: center;
        margin-bottom: var(--space-6); /* 16px */
      }
      
      .status-message {
        font-size: var(--font-size-base);
        color: var(--color-text-muted);
        text-align: center;
        line-height: var(--line-height-normal);
        margin-bottom: var(--space-8); /* 24px */
      }
      
      .plan-details {
        background: var(--color-background);
        padding: var(--space-6); /* 16px */
        border-radius: var(--border-radius);
        margin-bottom: var(--space-8); /* 24px */
        text-align: center;
        
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
        
        .next-billing {
          font-size: var(--font-size-sm);
          color: var(--color-text-muted);
          font-style: italic;
        }
      }
      
      .action-buttons {
        display: flex;
        flex-direction: column;
        gap: var(--space-4); /* 8px between buttons */
        
        /* Desktop: horizontal layout */
        @media (min-width: 768px) {
          flex-direction: row;
          justify-content: center;
          
          .action-button {
            min-width: 160px;
          }
        }
        
        .action-button {
          height: var(--space-11); /* 48px */
          padding: 0 var(--space-8); /* 0 vertical, 24px horizontal */
          border: none;
          border-radius: var(--border-radius);
          font-size: var(--font-size-base);
          font-weight: var(--font-weight-semibold);
          cursor: pointer;
          transition: all var(--transition-fast);
          
          &.primary {
            background: var(--color-secondary);
            color: white;
            
            &:hover:not(:disabled) {
              background: var(--color-secondary-dark);
              transform: translateY(-1px);
            }
          }
          
          &.secondary {
            background: transparent;
            color: var(--color-text);
            border: 1px solid var(--color-border);
            
            &:hover:not(:disabled) {
              background: var(--color-background);
              border-color: var(--color-secondary);
            }
          }
          
          &:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }
        }
      }
      
      .error-details {
        background: var(--color-error-light);
        border: 1px solid var(--color-error);
        border-radius: var(--border-radius);
        padding: var(--space-6); /* 16px */
        margin-bottom: var(--space-8); /* 24px */
        
        .error-code {
          font-family: monospace;
          font-size: var(--font-size-sm);
          color: var(--color-error);
          background: var(--color-error-lighter);
          padding: var(--space-2) var(--space-4); /* 4px vertical, 8px horizontal */
          border-radius: var(--border-radius);
          display: inline-block;
          margin-bottom: var(--space-4); /* 8px */
        }
        
        .error-suggestion {
          font-size: var(--font-size-sm);
          color: var(--color-text-muted);
          line-height: var(--line-height-normal);
        }
      }
      
      .cancellation-alternatives {
        background: var(--color-background);
        border: 1px solid var(--color-border);
        border-radius: var(--border-radius);
        padding: var(--space-6); /* 16px */
        margin-bottom: var(--space-8); /* 24px */
        
        .alternatives-title {
          font-size: var(--font-size-base);
          font-weight: var(--font-weight-semibold);
          color: var(--color-text);
          margin-bottom: var(--space-4); /* 8px */
          text-align: center;
        }
        
        .alternatives-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-4); /* 8px between items */
          
          .alternative-item {
            display: flex;
            align-items: center;
            gap: var(--space-4); /* 8px between icon and content */
            padding: var(--space-4); /* 8px */
            background: var(--color-primary);
            border-radius: var(--border-radius);
            border: 1px solid var(--color-border-light);
            transition: all var(--transition-fast);
            
            &:hover {
              border-color: var(--color-secondary);
              background: var(--color-background);
            }
            
            .alternative-icon {
              width: 20px;
              height: 20px;
              color: var(--color-secondary);
              flex-shrink: 0;
            }
            
            .alternative-content {
              flex: 1;
              
              .alternative-title {
                font-size: var(--font-size-sm);
                font-weight: var(--font-weight-semibold);
                color: var(--color-text);
                margin-bottom: var(--space-1); /* 2px */
              }
              
              .alternative-description {
                font-size: var(--font-size-xs);
                color: var(--color-text-muted);
                line-height: var(--line-height-normal);
              }
            }
          }
        }
      }
      
      .processing-indicator {
        text-align: center;
        margin-bottom: var(--space-8); /* 24px */
        
        .processing-text {
          font-size: var(--font-size-base);
          color: var(--color-text-muted);
          margin-top: var(--space-4); /* 8px */
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
        padding: var(--space-6); /* 16px */
      }
      
      .modal-content {
        padding: var(--space-6); /* 16px */
      }
    }
  }
}

/* CSS Variables for design system */
:root {
  --space-2: 4px;
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
  --color-border-light: #F3F4F6;
  --color-success: #257940;
  --color-error: #D61515;
  --color-error-light: #FEF2F2;
  --color-error-lighter: #FEE2E2;
  
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  
  --font-weight-semibold: 600;
  
  --line-height-normal: 1.5;
  
  --border-radius: 8px;
  --border-radius-lg: 12px;
  
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  
  --transition-fast: 0.15s ease-in-out;
  
  --z-modal: 1000;
}
</style>
