<template>
  <div class="cancel-page">
    <!-- Navigation Bar -->
    <nav-bar />
    
    <div class="cancel-container">

      <!-- Cancel Header -->
      <div class="cancel-header">
        <h1 class="ds-text-display-lg">Pago Cancelado</h1>
        <p class="cancel-subtitle">
          Tu proceso de pago ha sido cancelado
        </p>
      </div>

      <!-- Cancel Message -->
      <div class="cancel-message">
        <p class="message-text">
          No te preocupes, no se ha realizado ningún cargo. 
          Puedes intentar de nuevo cuando quieras.
        </p>
      </div>

      <!-- Alternative Options -->
      <div class="alternatives-section">
        <h2 class="ds-text-display-sm">¿Qué puedes hacer ahora?</h2>
        <div class="alternatives-grid">
          <div class="alternative-card">
            <h3 class="ds-text-lg ds-font-semibold">Intentar de Nuevo</h3>
            <p class="alternative-description">
              Reintenta el pago con la misma o una tarjeta diferente
            </p>
            <button
              @click="retryPayment"
              class="ds-btn-primary ds-btn-md w-full"
            >
              Intentar de Nuevo
            </button>
          </div>
          
          <div class="alternative-card">
            <h3 class="ds-text-lg ds-font-semibold">Continuar con Prueba</h3>
            <p class="alternative-description">
              Usa tu período de prueba gratuito de 14 días
            </p>
            <button
              @click="continueTrial"
              class="ds-btn-primary ds-btn-md w-full"
            >
              Continuar Prueba
            </button>
          </div>
          
          <div class="alternative-card">
            <h3 class="ds-text-lg ds-font-semibold">Obtener Ayuda</h3>
            <p class="alternative-description">
              Contacta con nuestro equipo de soporte
            </p>
            <button
              @click="contactSupport"
              class="ds-btn-primary ds-btn-md w-full"
            >
              Contactar Soporte
            </button>
          </div>
        </div>
      </div>

      <!-- FAQ Section -->
      <CancelFAQSection />

      <!-- Action Buttons -->
      <div class="action-buttons">
        <button
          @click="goToPlans"
          class="ds-btn-primary ds-btn-lg ds-btn-icon"
        >
          <Icon name="arrow-left" class="ds-btn-icon-element" />
          Volver a Planes
        </button>
        <button
          @click="goToHome"
          class="ds-btn-outline ds-btn-lg ds-btn-icon"
        >
          <Icon name="home" class="ds-btn-icon-element" />
          Ir al Inicio
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

// Page metadata
useHead({
  title: 'Pago Cancelado | epàlwi-rèbbo',
  meta: [
    { 
      name: 'description', 
      content: 'Tu proceso de pago ha sido cancelado.' 
    }
  ]
})

// Alternative actions
const retryPayment = () => {
  navigateTo('/subscription/plans')
}

const continueTrial = () => {
  navigateTo('/')
}

const contactSupport = () => {
  // You can implement contact support functionality here
  window.open('mailto:soporte@epalwi-rebbo.com', '_blank')
}

// Navigation functions
const goToPlans = () => {
  navigateTo('/subscription/plans')
}

const goToHome = () => {
  navigateTo('/')
}
</script>

<style lang="scss" scoped>
.cancel-page {
  min-height: 100vh;
  background: var(--ds-background);
  padding: var(--ds-spacing-8) 0;
}

.cancel-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 var(--ds-spacing-6);
}


.cancel-header {
  text-align: center;
  margin-bottom: var(--ds-spacing-8);
  
  .cancel-subtitle {
    color: var(--ds-muted-foreground);
    line-height: var(--ds-line-height-normal);
    font-size: 1.125rem;
  }
}

.cancel-message {
  text-align: center;
  margin-bottom: var(--ds-spacing-10);
  
  .message-text {
    color: var(--ds-muted-foreground);
    line-height: var(--ds-line-height-normal);
    max-width: 600px;
    margin: 0 auto;
    font-size: 1rem;
  }
}

.alternatives-section {
  margin-bottom: var(--ds-spacing-12);
  text-align: center;
  
  .alternatives-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: var(--ds-spacing-6);
    
    .alternative-card {
      background: var(--ds-card);
      border: 1px solid var(--ds-border);
      border-radius: var(--ds-radius-lg);
      box-shadow: var(--ds-shadow-md);
      padding: var(--ds-spacing-2);
      text-align: center;
      transition: all var(--ds-duration) var(--ds-ease);
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: var(--ds-shadow-lg);
      }
      
      
      .alternative-description {
        color: var(--ds-muted-foreground);
        margin-bottom: var(--ds-spacing-2);
        line-height: var(--ds-line-height-normal);
        font-size: 0.875rem;
      }
    }
  }
}


.action-buttons {
  display: flex;
  flex-direction: column;
  gap: var(--ds-spacing-4);
  max-width: 400px;
  margin: 0 auto;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .cancel-page {
    padding: var(--ds-spacing-4) 0;
  }
  
  .cancel-container {
    padding: 0 var(--ds-spacing-4);
  }
  
  .alternatives-grid {
    grid-template-columns: 1fr;
  }
  
}
</style>
