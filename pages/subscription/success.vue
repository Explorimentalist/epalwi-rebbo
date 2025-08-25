<template>
  <div class="success-page">
    <div class="success-container">
      <!-- Success Icon -->
      <div class="success-icon">
        <Icon name="check" class="check-icon" />
      </div>

      <!-- Success Header -->
      <div class="success-header">
        <h1 class="success-title">¡Pago Exitoso!</h1>
        <p class="success-subtitle">
          Tu suscripción ha sido activada correctamente
        </p>
      </div>

      <!-- Subscription Details -->
      <div class="subscription-details">
        <h3 class="details-title">Detalles de tu Suscripción</h3>
        <div class="details-grid">
          <div class="detail-item">
            <span class="detail-label">Plan:</span>
            <span class="detail-value">{{ subscriptionDetails.plan }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Estado:</span>
            <span class="detail-value status-active">Activo</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Próximo cobro:</span>
            <span class="detail-value">{{ subscriptionDetails.nextBilling }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Método de pago:</span>
            <span class="detail-value">{{ subscriptionDetails.paymentMethod }}</span>
          </div>
        </div>
      </div>

      <!-- Next Steps -->
      <div class="next-steps">
        <h3 class="steps-title">Próximos Pasos</h3>
        <div class="steps-list">
          <div class="step-item">
            <div class="step-number">1</div>
            <div class="step-content">
              <h4 class="step-title">Accede al Diccionario</h4>
              <p class="step-description">
                Comienza a usar todas las funciones del diccionario
              </p>
            </div>
          </div>
          <div class="step-item">
            <div class="step-number">2</div>
            <div class="step-content">
              <h4 class="step-title">Descarga para Offline</h4>
              <p class="step-description">
                Sincroniza el diccionario para uso sin internet
              </p>
            </div>
          </div>
          <div class="step-item">
            <div class="step-number">3</div>
            <div class="step-content">
              <h4 class="step-title">Gestiona tu Cuenta</h4>
              <p class="step-description">
                Accede a la configuración de tu suscripción
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="action-buttons">
        <button
          @click="goToDictionary"
          class="primary-button"
        >
          <Icon name="book-open" class="button-icon" />
          Ir al Diccionario
        </button>
        <button
          @click="goToAccount"
          class="secondary-button"
        >
          <Icon name="user" class="button-icon" />
          Mi Cuenta
        </button>
      </div>

      <!-- Welcome Message -->
      <div class="welcome-message">
        <p class="welcome-text">
          ¡Bienvenido a epàlwi-rèbbo! Estamos emocionados de que formes parte 
          de nuestra comunidad dedicada a preservar el idioma Ndowe.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

// Page metadata
useHead({
  title: 'Pago Exitoso | epàlwi-rèbbo',
  meta: [
    { 
      name: 'description', 
      content: 'Tu suscripción ha sido activada correctamente.' 
    }
  ]
})

// Route
const route = useRoute()
const sessionId = route.query.session_id as string

// Subscription details (mock data - replace with real data from Stripe)
const subscriptionDetails = ref({
  plan: 'Plan Anual',
  nextBilling: '15 de Enero, 2025',
  paymentMethod: 'Tarjeta terminada en 4242'
})

// On mount
onMounted(() => {
  if (sessionId) {
    // You can fetch subscription details from Stripe here
    console.log('Session ID:', sessionId)
  }
})

// Navigation functions
const goToDictionary = () => {
  navigateTo('/dictionary')
}

const goToAccount = () => {
  navigateTo('/account')
}
</script>

<style lang="scss" scoped>
.success-page {
  min-height: 100vh;
  background: var(--color-background);
  padding: var(--space-8) 0;
}

.success-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 var(--space-6);
}

.success-icon {
  text-align: center;
  margin-bottom: var(--space-8);
  
  .check-icon {
    width: 80px;
    height: 80px;
    color: var(--color-success);
  }
}

.success-header {
  text-align: center;
  margin-bottom: var(--space-10);
  
  .success-title {
    font-size: var(--font-size-4xl);
    font-weight: var(--font-weight-bold);
    color: var(--color-text);
    margin-bottom: var(--space-4);
  }
  
  .success-subtitle {
    font-size: var(--font-size-lg);
    color: var(--color-text-muted);
    line-height: var(--line-height-normal);
  }
}

.subscription-details {
  background: var(--color-primary);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
  padding: var(--space-8);
  margin-bottom: var(--space-10);
  
  .details-title {
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text);
    margin-bottom: var(--space-6);
    text-align: center;
  }
  
  .details-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--space-6);
    
    .detail-item {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
      
      .detail-label {
        font-size: var(--font-size-sm);
        color: var(--color-text-muted);
        font-weight: var(--font-weight-medium);
      }
      
      .detail-value {
        font-size: var(--font-size-base);
        color: var(--color-text);
        font-weight: var(--font-weight-semibold);
        
        &.status-active {
          color: var(--color-success);
        }
      }
    }
  }
}

.next-steps {
  margin-bottom: var(--space-10);
  
  .steps-title {
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text);
    margin-bottom: var(--space-6);
    text-align: center;
  }
  
  .steps-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
    
    .step-item {
      display: flex;
      align-items: flex-start;
      gap: var(--space-4);
      
      .step-number {
        width: 32px;
        height: 32px;
        background: var(--color-secondary);
        color: white;
        border-radius: var(--border-radius-full);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-bold);
        flex-shrink: 0;
      }
      
      .step-content {
        flex: 1;
        
        .step-title {
          font-size: var(--font-size-lg);
          font-weight: var(--font-weight-semibold);
          color: var(--color-text);
          margin-bottom: var(--space-2);
        }
        
        .step-description {
          font-size: var(--font-size-base);
          color: var(--color-text-muted);
          line-height: var(--line-height-normal);
        }
      }
    }
  }
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  margin-bottom: var(--space-10);
  
  .primary-button,
  .secondary-button {
    height: var(--space-11);
    border: none;
    border-radius: var(--border-radius);
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-semibold);
    cursor: pointer;
    transition: all 0.15s ease-in-out;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-3);
    text-decoration: none;
    
    .button-icon {
      width: 20px;
      height: 20px;
    }
  }
  
  .primary-button {
    background: var(--color-secondary);
    color: white;
    
    &:hover {
      background: var(--color-secondary-dark);
      transform: translateY(-1px);
    }
  }
  
  .secondary-button {
    background: transparent;
    color: var(--color-secondary);
    border: 1px solid var(--color-secondary);
    
    &:hover {
      background: var(--color-secondary);
      color: white;
    }
  }
}

.welcome-message {
  text-align: center;
  
  .welcome-text {
    font-size: var(--font-size-base);
    color: var(--color-text-muted);
    line-height: var(--line-height-normal);
    font-style: italic;
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .details-grid {
    grid-template-columns: 1fr;
  }
  
  .action-buttons {
    .primary-button,
    .secondary-button {
      width: 100%;
    }
  }
  
  .success-title {
    font-size: var(--font-size-3xl);
  }
}
</style>
