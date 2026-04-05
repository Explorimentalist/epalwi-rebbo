<template>
  <div class="success-page">
    <!-- Logo -->
    <div class="success-logo">
      <NuxtLink to="/">
        <img src="/logo.svg" alt="epàlwi-rèbbo" class="logo-image" />
      </NuxtLink>
    </div>

    <div class="success-container">
      <!-- Success Icon -->
      <div class="success-icon">
        <Icon name="check" class="check-icon" />
      </div>

      <!-- Success Header -->
      <div class="success-header">
        <h1 class="ds-text-display-lg">¡Pago Exitoso!</h1>
        <p class="success-subtitle">
          Tu suscripción ha sido activada correctamente
        </p>
      </div>

      <!-- Subscription Details -->
      <div class="subscription-details">
        <h2 class="ds-text-display-sm">Detalles de tu Suscripción</h2>
        <div class="details-grid">
          <div class="detail-item">
            <span class="detail-label">Plan:</span>
            <span class="detail-value">{{ subscriptionDetails.plan }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Estado:</span>
            <span class="detail-value" :class="subscriptionDetails.statusClass">
              {{ subscriptionDetails.status }}
            </span>
          </div>
          <div v-if="subscriptionDetails.trialInfo" class="detail-item">
            <span class="detail-label">Prueba:</span>
            <span class="detail-value status-trial">{{ subscriptionDetails.trialInfo }}</span>
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
        <h2 class="ds-text-display-sm">Próximos Pasos</h2>
        <ol class="steps-list" role="list">
          <li class="step-item">
            <span class="step-number">1</span>
            <span class="step-text">Accede al Diccionario - Comienza a usar todas las funciones del diccionario</span>
          </li>
          <li class="step-item">
            <span class="step-number">2</span>
            <span class="step-text">Descarga para Offline - Sincroniza el diccionario para uso sin internet</span>
          </li>
          <li class="step-item">
            <span class="step-number">3</span>
            <span class="step-text">Gestiona tu Cuenta - Accede a la configuración de tu suscripción</span>
          </li>
        </ol>
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
import { computed, onMounted } from 'vue'

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

// Stores
const authStore = useAuthStore()
const subscriptionStore = useSubscriptionStore()

// Computed subscription details from store
const subscriptionDetails = computed(() => {
  const sub = subscriptionStore.userSubscription
  const user = authStore.user

  if (!sub || !user) {
    return {
      plan: 'Plan Mensual',
      status: 'Activo',
      nextBilling: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('es-ES', {
        year: 'numeric', month: 'long', day: 'numeric'
      }),
      paymentMethod: 'Tarjeta terminada en ••••',
      trialInfo: null
    }
  }

  // Determine plan name
  let planName = 'Plan Mensual'
  if (sub.planType === 'annual') {
    planName = 'Plan Anual'
  } else if (sub.planType === 'monthly') {
    planName = 'Plan Mensual'
  }

  // Determine status
  let statusText = 'Activo'
  let statusClass = 'status-active'
  
  if (sub.status === 'trialing') {
    statusText = 'Prueba Gratuita'
    statusClass = 'status-trial'
  } else if (sub.status === 'active') {
    statusText = 'Activo'
    statusClass = 'status-active'
  } else if (sub.status === 'canceled') {
    statusText = 'Cancelado'
    statusClass = 'status-canceled'
  } else if (sub.status === 'past_due') {
    statusText = 'Pago Pendiente'
    statusClass = 'status-past-due'
  }

  // Billing date
  const nextBilling = sub.currentPeriodEnd
    ? new Date(sub.currentPeriodEnd).toLocaleDateString('es-ES', {
        year: 'numeric', month: 'long', day: 'numeric'
      })
    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('es-ES', {
        year: 'numeric', month: 'long', day: 'numeric'
      })

  // Trial information
  let trialInfo = null
  if (sub.status === 'trialing' && sub.trialEnd) {
    const trialEnd = new Date(sub.trialEnd)
    const daysLeft = Math.max(0, Math.ceil((trialEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    trialInfo = `${daysLeft} días de prueba restantes`
  }

  return {
    plan: planName,
    status: statusText,
    statusClass,
    nextBilling,
    paymentMethod: 'Tarjeta terminada en ••••',
    trialInfo
  }
})

// On mount: refresh user to get latest subscription state
onMounted(async () => {
  if (sessionId) {
    try {
      const sessionData = await $fetch('/api/stripe/get-session', {
        method: 'POST',
        body: { sessionId }
      })
      console.log('Payment session:', sessionData)
    } catch (error) {
      console.error('Error fetching session:', error)
    }
  }

  if (authStore.isAuthenticated) {
    await authStore.refreshUser()
    if (authStore.user?.uid) {
      await subscriptionStore.loadUserSubscription(authStore.user.uid)
    }
  }
})
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
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--ds-spacing-6);
  background: var(--ds-background);
  position: relative;
}

.success-logo {
  position: absolute;
  top: var(--ds-spacing-3);
  left: var(--ds-spacing-3);
  z-index: 10;
  
  .logo-image {
    height: 32px;
    width: auto;
  }
}

.success-container {
  background: var(--ds-card);
  border-radius: var(--ds-radius-lg);
  box-shadow: var(--ds-shadow-lg);
  padding: var(--ds-spacing-4);
  max-width: 600px;
  width: 100%;
}

.success-icon {
  text-align: center;
  margin-bottom: var(--ds-spacing-3);
  
  .check-icon {
    width: 80px;
    height: 80px;
    color: var(--ds-primary);
  }
}

.success-header {
  text-align: center;
  margin-bottom: var(--ds-spacing-4);
  
  .success-subtitle {
    font-size: var(--ds-font-size-copy-16);
    color: var(--ds-muted-foreground);
    line-height: 1.4;
    font-weight: 400;
    margin-top: var(--ds-spacing-1);
  }
}

.subscription-details {
  background: var(--ds-muted);
  border-radius: var(--ds-radius-lg);
  border: 1px solid var(--ds-border);
  padding: var(--ds-spacing-3);
  margin-bottom: var(--ds-spacing-4);
  
  h2 {
    font-size: var(--ds-font-size-copy-18);
    font-weight: 600;
    color: var(--ds-foreground);
    margin-bottom: var(--ds-spacing-3);
    text-align: center;
  }
  
  .details-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--ds-spacing-025);
    
    .detail-item {
      display: flex;
      flex-direction: column;
      gap: var(--ds-spacing-075);
      
      .detail-label {
        font-size: var(--ds-font-size-copy-14);
        color: var(--ds-muted-foreground);
        font-weight: 500;
      }
      
      .detail-value {
        font-size: var(--ds-font-size-copy-16);
        color: var(--ds-foreground);
        font-weight: 600;
        
        &.status-active {
          color: var(--ds-primary);
        }
        
        &.status-trial {
          color: var(--ds-primary);
        }
        
        &.status-canceled {
          color: var(--ds-destructive);
        }
        
        &.status-past-due {
          color: var(--ds-warning);
        }
      }
    }
  }
}

.next-steps {
  background: #ffffff;
  border-radius: var(--ds-radius-lg);
  border: 1px solid var(--ds-border);
  padding: var(--ds-spacing-3);
  margin-bottom: var(--ds-spacing-4);
  
  h2 {
    font-size: var(--ds-font-size-copy-18);
    font-weight: 600;
    color: var(--ds-foreground);
    margin-bottom: var(--ds-spacing-3);
    text-align: center;
  }
  
  .steps-list {
    width: 100%;
    margin: 0;
    list-style: none;
    padding: 0;
    counter-reset: step-counter;
    
    .step-item {
      box-sizing: border-box;
      display: flex;
      flex-direction: row;
      align-items: center;
      padding: 16px 32px;
      gap: 34px;
      position: relative;
      width: 100%;
      height: 94px;
      border-bottom: 2px solid #D45B41;
      animation: fadeInUp 0.8s var(--ds-ease) both;
      transition: transform var(--ds-duration) var(--ds-ease);
      cursor: pointer;
      overflow: hidden;
      
      &::before {
        content: '';
        position: absolute;
        top: 100%;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: #D45B41;
        transition: top 0.2s cubic-bezier(0, 0.83, 0.32, 1);
        z-index: 1;
      }
      
      &:last-child {
        border-bottom: none;
      }
      
      .step-number {
        flex: none;
        order: 0;
        flex-grow: 0;
        width: auto;
        height: auto;
        font-family: 'Geist', var(--ds-font-sans);
        font-style: normal;
        font-weight: 400;
        font-size: var(--ds-font-size-xs);
        line-height: 1.2;
        text-align: center;
        color: #D45B41;
        background: none;
        border-radius: 0;
        box-shadow: none;
        transition: color 0.2s cubic-bezier(0, 0.83, 0.32, 1);
        position: relative;
        z-index: 2;
        display: flex;
        align-items: center;
        min-width: 20px;
      }
      
      .step-text {
        flex: none;
        order: 1;
        flex-grow: 0;
        height: auto;
        font-family: 'Geist', var(--ds-font-sans);
        font-style: normal;
        font-weight: 400;
        font-size: var(--ds-font-size-xs);
        line-height: 1.2;
        text-align: left;
        color: #D45B41;
        margin-top: 0;
        display: flex;
        align-items: center;
        transition: color 0.2s cubic-bezier(0, 0.83, 0.32, 1);
        position: relative;
        z-index: 2;
      }
      
      &:hover {
        transform: translateX(4px);
        
        &::before {
          top: 0;
        }
        
        .step-number {
          color: #ffffff;
        }
        
        .step-text {
          color: #ffffff;
        }
      }
    }
  }
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: var(--ds-spacing-2);
  margin-bottom: var(--ds-spacing-4);
  
  .primary-button,
  .secondary-button {
    height: 48px;
    border: none;
    border-radius: var(--ds-radius);
    font-size: var(--ds-font-size-copy-16);
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s ease-in-out;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--ds-spacing-2);
    text-decoration: none;
    
    .button-icon {
      width: 20px;
      height: 20px;
    }
  }
  
  .primary-button {
    background: var(--ds-primary);
    color: white;
    
    &:hover {
      background: var(--ds-primary-dark);
      box-shadow: var(--ds-shadow-md);
    }
  }
  
  .secondary-button {
    background: transparent;
    color: var(--ds-primary);
    border: 1px solid var(--ds-border);
    
    &:hover {
      background: var(--ds-muted);
    }
  }
}

.welcome-message {
  text-align: center;
  padding: var(--ds-spacing-3);
  background: var(--ds-muted);
  border-radius: var(--ds-radius);
  border-left: 4px solid var(--ds-primary);
  
  .welcome-text {
    font-size: var(--ds-font-size-copy-14);
    color: var(--ds-muted-foreground);
    line-height: 1.5;
    font-style: italic;
  }
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .success-page {
    padding: var(--ds-spacing-2);
  }
  
  .success-container {
    padding: var(--ds-spacing-2);
    margin: var(--ds-spacing-1);
  }
  
  .subscription-details {
    .details-grid {
      grid-template-columns: 1fr;
      gap: var(--ds-spacing-025);
    }
  }
  
  .next-steps {
    .steps-list {
      .step-item {
        padding: 12px 16px;
        gap: 20px;
        height: auto;
        min-height: 70px;
        align-items: flex-start;
        
        .step-number {
          font-size: 28px;
          line-height: 40px;
          height: auto;
          width: auto;
          margin-top: 4px;
          align-self: flex-start;
        }
        
        .step-text {
          font-size: 28px;
          line-height: 40px;
          height: auto;
          flex: 1;
          white-space: normal;
          word-wrap: break-word;
          overflow-wrap: break-word;
        }
        
        &:hover {
          transform: translateX(2px);
          
          .step-number,
          .step-text {
            color: #ffffff;
          }
        }
      }
    }
  }
  
  .action-buttons {
    .primary-button,
    .secondary-button {
      width: 100%;
      height: 44px;
      font-size: var(--ds-font-size-copy-15);
    }
  }
  
  .success-icon .check-icon {
    width: 60px;
    height: 60px;
  }
}

/* Extra small screens */
@media (max-width: 480px) {
  .next-steps {
    .steps-list {
      .step-item {
        padding: 8px 12px;
        gap: 16px;
        height: auto;
        min-height: 60px;
        align-items: flex-start;
        
        .step-number {
          font-size: 24px;
          line-height: 36px;
          height: auto;
          width: auto;
          margin-top: 2px;
          align-self: flex-start;
        }
        
        .step-text {
          font-size: 24px;
          line-height: 36px;
          height: auto;
          flex: 1;
          white-space: normal;
          word-wrap: break-word;
          overflow-wrap: break-word;
        }
      }
    }
  }
}

/* Animations */
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

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .step-item {
    animation: none !important;
  }
  
  .step-item:hover {
    transform: none !important;
    
    &::before {
      transition: none !important;
    }
  }
  
  .step-item::before {
    transition: none !important;
  }
}
</style>
