<template>
  <div class="auth-page">
    <!-- Logo -->
    <div class="auth-logo">
      <NuxtLink to="/">
        <img src="/logo.svg" alt="epàlwi-rèbbo" class="logo-image" />
      </NuxtLink>
    </div>
    
    <div class="auth-container">
      <!-- Header -->
      <div class="auth-header">
        <h2 class="ds-text-display-md">Iniciar Sesión</h2>
        <p class="auth-subtitle">
          Accede a tu cuenta con tu enlace mágico
        </p>
      </div>

      <!-- Login Form -->
      <form @submit.prevent="handleLogin" class="auth-form">
        <div class="form-group">
          <Input
            v-model="form.email"
            type="email"
            label="Email"
            label-position="top"
            placeholder="tu@email.com"
            :error="errors.email"
            :required="true"
          />
        </div>

        <button
          type="submit"
          class="auth-button"
          :disabled="isLoading"
          :class="{ 'loading': isLoading }"
        >
          <Icon v-if="isLoading" name="loader" class="loading-icon" />
          {{ buttonText }}
        </button>
      </form>



      <!-- Signup Link -->
      <div class="auth-footer">
        <p class="signup-link">
          ¿No tienes cuenta? 
          <NuxtLink to="/auth/signup" class="signup-link-text">
            Crear Cuenta
          </NuxtLink>
        </p>
      </div>
    </div>

    <!-- Success Modal -->
    <Modal
      v-model="showSuccessModal"
      title="Email Enviado"
      :show-close-button="false"
    >
      <div class="success-content">
        <p class="success-message">
          Te hemos enviado un enlace mágico a <strong>{{ form.email }}</strong>
        </p>
        <p class="send-count-display">
          Email enviado ({{ sendCount }}/{{ maxAttempts }})
        </p>
        <div v-if="showResendSuccess" class="resend-success-message">
          <Icon name="check-circle" class="success-icon" />
          Email reenviado correctamente
        </div>
        <div v-if="rateLimitError" class="rate-limit-error">
          <Icon name="exclamation-triangle" class="error-icon" />
          {{ rateLimitError }}
        </div>
        <p class="success-instructions">
          Revisa tu bandeja de entrada y haz clic en el enlace para acceder a tu cuenta.
        </p>
        <p class="spam-reminder">
          <strong>¿No lo encuentras?</strong> Revisa tu carpeta de spam o correo no deseado.
        </p>
        <div class="modal-actions">
          <button
            @click="handleResendEmail"
            class="ds-btn-secondary ds-btn-md"
            :disabled="isResending || sendCount >= maxAttempts"
          >
            {{ isResending ? 'Reenviando...' : sendCount >= maxAttempts ? 'Límite alcanzado' : 'Reenviar Email' }}
          </button>
          <button
            @click="closeSuccessModal"
            class="success-button"
          >
            Entendido
          </button>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
// Removed unused config and route imports

// Page metadata
useHead({
  title: 'Iniciar Sesión | epàlwi-rèbbo',
  meta: [
    { 
      name: 'description', 
      content: 'Inicia sesión en epàlwi-rèbbo con tu enlace mágico.' 
    }
  ]
})

// Form state
const form = ref({
  email: ''
})

const errors = ref({
  email: ''
})

const isLoading = ref(false)
const showSuccessModal = ref(false)
const isResending = ref(false)
const sendCount = ref(0)
const maxAttempts = ref(5)
const showResendSuccess = ref(false)
const rateLimitError = ref('')

// Computed properties
const buttonText = computed(() => {
  if (isLoading.value) return 'Enviando...'
  return 'Enviar Enlace'
})

// Auth store
const authStore = useAuthStore()

// Form validation
const validateForm = () => {
  errors.value = { email: '' }
  
  if (!form.value.email) {
    errors.value.email = 'El email es requerido'
    return false
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(form.value.email)) {
    errors.value.email = 'El email no es válido'
    return false
  }
  
  return true
}

// Handle login
const handleLogin = async () => {
  if (!validateForm()) return
  
  try {
    isLoading.value = true
    
    // Always use custom magic link system
    const response = await authStore.sendMagicLink(form.value.email)
    
    if (response.success) {
      // Update send count from response
      if (response.attemptCount) sendCount.value = response.attemptCount
      if (response.maxAttempts) maxAttempts.value = response.maxAttempts
      showSuccessModal.value = true
    } else {
      // Error is already set in the store
      console.error('Login failed:', response.error)
    }
  } catch (error) {
    console.error('Login error:', error)
  } finally {
    isLoading.value = false
  }
}

// Handle resend email
const handleResendEmail = async () => {
  if (!form.value.email) return
  
  try {
    isResending.value = true
    rateLimitError.value = '' // Clear any previous errors
    
    // Call the same API endpoint with current email
    const response = await authStore.sendMagicLink(form.value.email)
    
    if (response.success) {
      // Update send count from response
      if (response.attemptCount) sendCount.value = response.attemptCount
      if (response.maxAttempts) maxAttempts.value = response.maxAttempts
      
      // Show success confirmation
      showResendSuccess.value = true
      setTimeout(() => {
        showResendSuccess.value = false
      }, 3000) // Hide after 3 seconds
    } else {
      // Handle API response errors
      rateLimitError.value = response.error || 'Error al reenviar email'
      setTimeout(() => {
        rateLimitError.value = ''
      }, 5000) // Hide error after 5 seconds
    }
  } catch (error: any) {
    // Handle rate limiting and other errors
    if (error?.status === 429 || error?.statusCode === 429) {
      // Rate limiting error - extract user-friendly message
      rateLimitError.value = error?.data?.statusMessage || error?.statusMessage || 'Has alcanzado el límite de intentos. Inténtalo más tarde.'
    } else {
      rateLimitError.value = 'Error al reenviar email. Inténtalo nuevamente.'
    }
    
    setTimeout(() => {
      rateLimitError.value = ''
    }, 5000) // Hide error after 5 seconds
  } finally {
    isResending.value = false
  }
}

// Close success modal
const closeSuccessModal = () => {
  showSuccessModal.value = false
  // Redirect to home page
  navigateTo('/')
}
</script>

<style lang="scss" scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--ds-spacing-6);
  background: var(--ds-background);
  position: relative;
}

.auth-logo {
  position: absolute;
  top: var(--ds-spacing-3);
  left: var(--ds-spacing-3);
  z-index: 10;
  
  .logo-image {
    height: 32px;
    width: auto;
  }
}

.auth-container {
  background: var(--ds-card);
  border-radius: var(--ds-radius-lg);
  box-shadow: var(--ds-shadow-lg);
  padding: var(--ds-spacing-3);
  max-width: 420px;
  width: 100%;
}

.auth-header {
  text-align: center;
  margin-bottom: var(--ds-spacing-3);
  
  .auth-title {
    font-size: var(--ds-font-size-xs);
    font-weight: 700;
    color: var(--ds-foreground);
    margin-bottom: var(--ds-spacing-075);
    letter-spacing: -0.02em;
  }
  
  .auth-subtitle {
    font-size: var(--ds-font-size-copy-16);
    color: var(--ds-muted-foreground);
    line-height: 1.4;
    font-weight: 400;
    max-width: 300px;
    margin: 0 auto;
  }
}

.auth-form {
  margin-bottom: var(--ds-spacing-25);
  
  .form-group {
    margin-bottom: var(--ds-spacing-2);
  }
  
  // Override Input component label spacing to 8px
  :deep(.input-group__label) {
    margin-bottom: 8px;
  }
}

.auth-button {
  width: 100%;
  height: 48px;
  background: var(--ds-primary);
  color: white;
  border: none;
  border-radius: var(--ds-radius);
  font-size: var(--ds-font-size-copy-16);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease-in-out;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--ds-spacing-3);
  margin-bottom: 12px;
  
  &:hover:not(:disabled) {
    background: var(--ds-primary-dark);
    box-shadow: var(--ds-shadow-md);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  &.loading {
    position: relative;
    color: transparent;
    
    .loading-icon {
      position: absolute;
      width: 20px;
      height: 20px;
      animation: spin 1s linear infinite;
    }
  }
}



.auth-footer {
  text-align: center;
  
  .signup-link {
    font-size: var(--ds-font-size-copy-14);
    color: var(--ds-muted-foreground);
    
    .signup-link-text {
      color: var(--ds-primary);
      text-decoration: none;
      font-weight: 500;
      
      &:hover {
        text-decoration: underline;
      }
    }
  }
}

.success-content {
  padding: var(--ds-spacing-2) 0;
  max-height: 80vh;
  overflow-y: auto;
  
  .success-message {
    font-size: var(--ds-font-size-copy-16);
    color: var(--ds-foreground);
    margin-bottom: var(--ds-spacing-15);
    line-height: 1.5;
    text-align: left;
  }
  
  .send-count-display {
    font-size: var(--ds-font-size-copy-14);
    color: var(--ds-muted-foreground);
    margin-bottom: var(--ds-spacing-3);
    text-align: left;
    font-weight: 500;
    background: var(--ds-muted);
    padding: var(--ds-spacing-15) var(--ds-spacing-2);
    border-radius: var(--ds-radius);
  }
  
  .resend-success-message {
    display: flex;
    align-items: center;
    gap: var(--ds-spacing-15);
    font-size: var(--ds-font-size-copy-14);
    color: var(--ds-success-foreground);
    background: var(--ds-success-light);
    border: 1px solid var(--ds-success);
    padding: var(--ds-spacing-15) var(--ds-spacing-2);
    border-radius: var(--ds-radius);
    margin-bottom: var(--ds-spacing-3);
    font-weight: 500;
    animation: fadeInSlide 0.3s ease-out;
    
    .success-icon {
      width: 16px;
      height: 16px;
      color: var(--ds-success);
    }
  }
  
  .rate-limit-error {
    display: flex;
    align-items: flex-start;
    gap: var(--ds-spacing-15);
    font-size: var(--ds-font-size-copy-14);
    color: var(--ds-destructive-foreground);
    background: var(--ds-destructive-light);
    border: 1px solid var(--ds-destructive);
    padding: var(--ds-spacing-15) var(--ds-spacing-2);
    border-radius: var(--ds-radius);
    margin-bottom: var(--ds-spacing-3);
    font-weight: 500;
    line-height: 1.4;
    animation: fadeInSlide 0.3s ease-out;
    
    .error-icon {
      width: 16px;
      height: 16px;
      color: var(--ds-destructive);
      flex-shrink: 0;
      margin-top: 2px; // Align with first line of text
    }
  }
  
  .success-instructions {
    font-size: var(--ds-font-size-copy-14);
    color: var(--ds-muted-foreground);
    margin-bottom: var(--ds-spacing-2);
    line-height: 1.5;
    text-align: left;
  }
  
  .spam-reminder {
    font-size: var(--ds-font-size-copy-14);
    color: var(--ds-muted-foreground);
    margin-bottom: var(--ds-spacing-4);
    line-height: 1.5;
    text-align: left;
    padding: var(--ds-spacing-15) var(--ds-spacing-2);
    background: var(--ds-warning-light);
    border-left: 3px solid var(--ds-warning);
    border-radius: var(--ds-radius);
    
    strong {
      color: var(--ds-foreground);
    }
  }
  
  .modal-actions {
    display: flex;
    flex-direction: column;
    gap: var(--ds-spacing-2);
    margin-top: var(--ds-spacing-2);
  }
  
  .success-button {
    width: 100%;
    height: 48px;
    background: var(--ds-primary);
    color: white;
    border: none;
    border-radius: var(--ds-radius);
    font-size: var(--ds-font-size-copy-16);
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s ease-in-out;
    
    &:hover {
      background: var(--ds-primary-dark);
      box-shadow: var(--ds-shadow-md);
    }
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes fadeInSlide {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .auth-page {
    padding: var(--ds-spacing-2);
  }
  
  .auth-container {
    padding: var(--ds-spacing-2);
    margin: var(--ds-spacing-1);
  }
  
  .auth-title {
    font-size: var(--ds-font-size-xxs);
  }
  
  // Modal content adjustments for mobile
  .success-content {
    padding: var(--ds-spacing-15) 0;
    
    .success-message,
    .success-instructions {
      font-size: var(--ds-font-size-copy-14);
    }
    
    .send-count-display,
    .resend-success-message,
    .rate-limit-error {
      font-size: var(--ds-font-size-copy-13);
      padding: var(--ds-spacing-1) var(--ds-spacing-15);
    }
    
    .spam-reminder {
      font-size: var(--ds-font-size-copy-13);
      padding: var(--ds-spacing-1) var(--ds-spacing-15);
    }
    
    .modal-actions {
      gap: var(--ds-spacing-15);
      
      .success-button {
        height: 44px;
        font-size: var(--ds-font-size-copy-15);
      }
      
      // Design System V2 button adjustments for mobile
      .ds-btn-secondary {
        height: 40px;
        font-size: var(--ds-font-size-copy-14);
        padding: 0 var(--ds-spacing-15);
      }
    }
  }
}

// Extra small screens
@media (max-width: 480px) {
  .success-content {
    .success-message {
      font-size: var(--ds-font-size-copy-15);
      margin-bottom: var(--ds-spacing-1);
    }
    
    .send-count-display,
    .resend-success-message,
    .rate-limit-error,
    .spam-reminder,
    .success-instructions {
      font-size: var(--ds-font-size-copy-12);
      margin-bottom: var(--ds-spacing-2);
    }
    
    .modal-actions {
      .success-button,
      .ds-btn-secondary {
        height: 40px;
        font-size: var(--ds-font-size-copy-14);
      }
    }
  }
}
</style>
