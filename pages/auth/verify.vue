<template>
  <div class="auth-page">
    <div class="auth-container">
      <!-- Header -->
      <div class="auth-header">
        <h1 class="auth-title">Verificar Cuenta</h1>
        <p class="auth-subtitle">
          Verificando tu enlace mágico...
        </p>
      </div>

      <!-- Loading State -->
      <div v-if="isVerifying" class="loading-section">
        <div class="loading-spinner">
          <Icon name="loader" class="spinner-icon" />
        </div>
        <p class="loading-text">Verificando tu enlace...</p>
      </div>

      <!-- Success State -->
      <div v-else-if="isVerified" class="success-section">
        <div class="success-icon">
          <Icon name="check" class="check-icon" />
        </div>
        <h2 class="success-title">¡Cuenta Verificada!</h2>
        <p class="success-message">
          Tu cuenta ha sido verificada correctamente. 
          Serás redirigido al diccionario en unos segundos.
        </p>
        
        <!-- How it works section -->
        <div class="how-it-works">
          <h3 class="how-it-works-title">¿Cómo funciona?</h3>
          <ul class="how-it-works-list">
            <li class="how-it-works-item">
              <Icon name="mail" class="how-it-works-icon" />
              <span>Ingresa tu email</span>
            </li>
            <li class="how-it-works-item">
              <Icon name="check" class="how-it-works-icon" />
              <span>Recibe un enlace mágico</span>
            </li>
            <li class="how-it-works-item">
              <Icon name="user" class="how-it-works-icon" />
              <span>Accede sin contraseña</span>
            </li>
          </ul>
        </div>
        
        <button
          @click="goToDictionary"
          class="success-button"
        >
          Ir al Diccionario
        </button>
      </div>

      <!-- Error State -->
      <div v-else-if="verificationError" class="error-section">
        <div class="error-icon">
          <Icon name="x" class="x-icon" />
        </div>
        <h2 class="error-title">Error de Verificación</h2>
        <p class="error-message">
          {{ verificationError }}
        </p>
        <div class="error-actions">
          <button
            @click="retryVerification"
            class="retry-button"
          >
            Intentar de Nuevo
          </button>
          <NuxtLink to="/auth/login" class="login-link">
            Ir al Login
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

// Page metadata
useHead({
  title: 'Verificar Cuenta | epàlwi-rèbbo',
  meta: [
    { 
      name: 'description', 
      content: 'Verifica tu cuenta de epàlwi-rèbbo con tu enlace mágico.' 
    }
  ]
})

// State
const isVerifying = ref(true)
const isVerified = ref(false)
const verificationError = ref<string | null>(null)

// Auth store
const authStore = useAuthStore()

// Get token from URL
const route = useRoute()
const token = route.query.token as string

// Verify magic link
const verifyToken = async () => {
  if (!token) {
    verificationError.value = 'No se encontró el token de verificación'
    isVerifying.value = false
    return
  }

  try {
    const response = await authStore.verifyMagicLink(token)
    
    if (response.success) {
      isVerified.value = true
      isVerifying.value = false
      
      // Redirect to dictionary after 3 seconds
      setTimeout(() => {
        goToDictionary()
      }, 3000)
    } else {
      verificationError.value = response.error || 'Error al verificar el enlace'
      isVerifying.value = false
    }
  } catch (error: any) {
    verificationError.value = error.message || 'Error inesperado durante la verificación'
    isVerifying.value = false
  }
}

// Retry verification
const retryVerification = () => {
  isVerifying.value = true
  verificationError.value = null
  verifyToken()
}

// Go to dictionary
const goToDictionary = () => {
  navigateTo('/dictionary')
}

// Verify on mount
onMounted(() => {
  verifyToken()
})
</script>

<style lang="scss" scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-6);
  background: var(--color-background);
}

.auth-container {
  background: var(--color-primary);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-lg);
  padding: var(--space-11);
  max-width: 480px;
  width: 100%;
}

.auth-header {
  text-align: center;
  margin-bottom: var(--space-8);
  
  .auth-title {
    font-size: var(--font-size-3xl);
    font-weight: var(--font-weight-bold);
    color: var(--color-text);
    margin-bottom: var(--space-4);
  }
  
  .auth-subtitle {
    font-size: var(--font-size-lg);
    color: var(--color-text-muted);
    line-height: var(--line-height-normal);
  }
}

.loading-section {
  text-align: center;
  
  .loading-spinner {
    margin-bottom: var(--space-6);
    
    .spinner-icon {
      width: 48px;
      height: 48px;
      color: var(--color-secondary);
      animation: spin 1s linear infinite;
    }
  }
  
  .loading-text {
    font-size: var(--font-size-lg);
    color: var(--color-text-muted);
  }
}

.success-section {
  text-align: center;
  
  .success-icon {
    margin-bottom: var(--space-6);
    
    .check-icon {
      width: 48px;
      height: 48px;
      color: var(--color-success);
    }
  }
  
  .success-title {
    font-size: var(--font-size-2xl);
    font-weight: var(--font-weight-bold);
    color: var(--color-text);
    margin-bottom: var(--space-4);
  }
  
  .success-message {
    font-size: var(--font-size-base);
    color: var(--color-text-muted);
    margin-bottom: var(--space-8);
    line-height: var(--line-height-normal);
  }
  
  .how-it-works {
    margin-bottom: var(--space-8);
    
    .how-it-works-title {
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text);
      margin-bottom: var(--space-6);
      text-align: center;
    }
    
    .how-it-works-list {
      list-style: none;
      padding: 0;
      margin: 0;
      
      .how-it-works-item {
        display: flex;
        align-items: center;
        gap: var(--space-4);
        margin-bottom: var(--space-4);
        
        &:last-child {
          margin-bottom: 0;
        }
        
        .how-it-works-icon {
          width: 20px;
          height: 20px;
          color: var(--color-secondary);
          flex-shrink: 0;
        }
        
        span {
          font-size: var(--font-size-base);
          color: var(--color-text);
        }
      }
    }
  }
  
  .success-button {
    height: var(--space-11);
    padding: 0 var(--space-8);
    background: var(--color-secondary);
    color: white;
    border: none;
    border-radius: var(--border-radius);
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-semibold);
    cursor: pointer;
    transition: all 0.15s ease-in-out;
    
    &:hover {
      background: var(--color-secondary-dark);
      transform: translateY(-1px);
    }
  }
}

.error-section {
  text-align: center;
  
  .error-icon {
    margin-bottom: var(--space-6);
    
    .x-icon {
      width: 48px;
      height: 48px;
      color: var(--color-error);
    }
  }
  
  .error-title {
    font-size: var(--font-size-2xl);
    font-weight: var(--font-weight-bold);
    color: var(--color-text);
    margin-bottom: var(--space-4);
  }
  
  .error-message {
    font-size: var(--font-size-base);
    color: var(--color-text-muted);
    margin-bottom: var(--space-8);
    line-height: var(--line-height-normal);
  }
  
  .error-actions {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    
    .retry-button {
      height: var(--space-11);
      padding: 0 var(--space-8);
      background: var(--color-secondary);
      color: white;
      border: none;
      border-radius: var(--border-radius);
      font-size: var(--font-size-base);
      font-weight: var(--font-weight-semibold);
      cursor: pointer;
      transition: all 0.15s ease-in-out;
      
      &:hover {
        background: var(--color-secondary-dark);
        transform: translateY(-1px);
      }
    }
    
    .login-link {
      height: var(--space-11);
      padding: 0 var(--space-8);
      background: transparent;
      color: var(--color-secondary);
      border: 1px solid var(--color-secondary);
      border-radius: var(--border-radius);
      font-size: var(--font-size-base);
      font-weight: var(--font-weight-semibold);
      text-decoration: none;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s ease-in-out;
      
      &:hover {
        background: var(--color-secondary);
        color: white;
      }
    }
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .auth-container {
    padding: var(--space-8);
    margin: var(--space-4);
  }
  
  .auth-title {
    font-size: var(--font-size-2xl);
  }
}
</style>
