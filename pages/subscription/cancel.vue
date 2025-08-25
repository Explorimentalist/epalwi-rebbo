<template>
  <div class="cancel-page">
    <div class="cancel-container">
      <!-- Cancel Icon -->
      <div class="cancel-icon">
        <Icon name="x" class="x-icon" />
      </div>

      <!-- Cancel Header -->
      <div class="cancel-header">
        <h1 class="cancel-title">Pago Cancelado</h1>
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
        <h3 class="alternatives-title">¿Qué puedes hacer ahora?</h3>
        <div class="alternatives-grid">
          <div class="alternative-card">
            <div class="alternative-icon">
              <Icon name="credit-card" class="card-icon" />
            </div>
            <h4 class="alternative-title">Intentar de Nuevo</h4>
            <p class="alternative-description">
              Reintenta el pago con la misma o una tarjeta diferente
            </p>
            <button
              @click="retryPayment"
              class="alternative-button primary"
            >
              Intentar de Nuevo
            </button>
          </div>
          
          <div class="alternative-card">
            <div class="alternative-icon">
              <Icon name="building-library" class="library-icon" />
            </div>
            <h4 class="alternative-title">Continuar con Prueba</h4>
            <p class="alternative-description">
              Usa tu período de prueba gratuito de 14 días
            </p>
            <button
              @click="continueTrial"
              class="alternative-button secondary"
            >
              Continuar Prueba
            </button>
          </div>
          
          <div class="alternative-card">
            <div class="alternative-icon">
              <Icon name="question-mark-circle" class="help-icon" />
            </div>
            <h4 class="alternative-title">Obtener Ayuda</h4>
            <p class="alternative-description">
              Contacta con nuestro equipo de soporte
            </p>
            <button
              @click="contactSupport"
              class="alternative-button tertiary"
            >
              Contactar Soporte
            </button>
          </div>
        </div>
      </div>

      <!-- Common Issues -->
      <div class="issues-section">
        <h3 class="issues-title">Problemas Comunes</h3>
        <div class="issues-list">
          <div class="issue-item">
            <h4 class="issue-question">¿Por qué se canceló mi pago?</h4>
            <p class="issue-answer">
              Los pagos pueden cancelarse por varios motivos: tarjeta rechazada, 
              fondos insuficientes, o cancelación manual.
            </p>
          </div>
          <div class="issue-item">
            <h4 class="issue-question">¿Se me cobrará algo?</h4>
            <p class="issue-answer">
              No, no se realizará ningún cargo. Solo se cobra cuando el pago es exitoso.
            </p>
          </div>
          <div class="issue-item">
            <h4 class="issue-question">¿Puedo usar otra tarjeta?</h4>
            <p class="issue-answer">
              Sí, puedes intentar con cualquier tarjeta de crédito o débito válida.
            </p>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="action-buttons">
        <button
          @click="goToPlans"
          class="primary-button"
        >
          <Icon name="arrow-left" class="button-icon" />
          Volver a Planes
        </button>
        <button
          @click="goToHome"
          class="secondary-button"
        >
          <Icon name="home" class="button-icon" />
          Ir al Inicio
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

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
  background: var(--color-background);
  padding: var(--space-8) 0;
}

.cancel-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 var(--space-6);
}

.cancel-icon {
  text-align: center;
  margin-bottom: var(--space-8);
  
  .x-icon {
    width: 80px;
    height: 80px;
    color: var(--color-error);
  }
}

.cancel-header {
  text-align: center;
  margin-bottom: var(--space-8);
  
  .cancel-title {
    font-size: var(--font-size-4xl);
    font-weight: var(--font-weight-bold);
    color: var(--color-text);
    margin-bottom: var(--space-4);
  }
  
  .cancel-subtitle {
    font-size: var(--font-size-lg);
    color: var(--color-text-muted);
    line-height: var(--line-height-normal);
  }
}

.cancel-message {
  text-align: center;
  margin-bottom: var(--space-10);
  
  .message-text {
    font-size: var(--font-size-base);
    color: var(--color-text-muted);
    line-height: var(--line-height-normal);
    max-width: 600px;
    margin: 0 auto;
  }
}

.alternatives-section {
  margin-bottom: var(--space-12);
  
  .alternatives-title {
    font-size: var(--font-size-2xl);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text);
    margin-bottom: var(--space-8);
    text-align: center;
  }
  
  .alternatives-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: var(--space-6);
    
    .alternative-card {
      background: var(--color-primary);
      border-radius: var(--border-radius-lg);
      box-shadow: var(--shadow-md);
      padding: var(--space-6);
      text-align: center;
      transition: all 0.2s ease-in-out;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-lg);
      }
      
      .alternative-icon {
        margin-bottom: var(--space-4);
        
        .card-icon,
        .library-icon,
        .help-icon {
          width: 48px;
          height: 48px;
          color: var(--color-secondary);
        }
      }
      
      .alternative-title {
        font-size: var(--font-size-lg);
        font-weight: var(--font-weight-semibold);
        color: var(--color-text);
        margin-bottom: var(--space-3);
      }
      
      .alternative-description {
        font-size: var(--font-size-sm);
        color: var(--color-text-muted);
        margin-bottom: var(--space-6);
        line-height: var(--line-height-normal);
      }
      
      .alternative-button {
        width: 100%;
        height: var(--space-10);
        border: none;
        border-radius: var(--border-radius);
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-semibold);
        cursor: pointer;
        transition: all 0.15s ease-in-out;
        
        &.primary {
          background: var(--color-secondary);
          color: white;
          
          &:hover {
            background: var(--color-secondary-dark);
            transform: translateY(-1px);
          }
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
}

.issues-section {
  margin-bottom: var(--space-10);
  
  .issues-title {
    font-size: var(--font-size-2xl);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text);
    margin-bottom: var(--space-6);
    text-align: center;
  }
  
  .issues-list {
    max-width: 800px;
    margin: 0 auto;
    
    .issue-item {
      background: var(--color-primary);
      border-radius: var(--border-radius);
      padding: var(--space-6);
      margin-bottom: var(--space-4);
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .issue-question {
        font-size: var(--font-size-lg);
        font-weight: var(--font-weight-semibold);
        color: var(--color-text);
        margin-bottom: var(--space-3);
      }
      
      .issue-answer {
        font-size: var(--font-size-base);
        color: var(--color-text-muted);
        line-height: var(--line-height-normal);
      }
    }
  }
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  
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

/* Responsive adjustments */
@media (max-width: 768px) {
  .alternatives-grid {
    grid-template-columns: 1fr;
  }
  
  .action-buttons {
    .primary-button,
    .secondary-button {
      width: 100%;
    }
  }
  
  .cancel-title {
    font-size: var(--font-size-3xl);
  }
}
</style>
