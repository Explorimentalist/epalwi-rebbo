<template>
  <div class="auth-page">
    <div class="auth-container">
      <!-- Header -->
      <div class="auth-header">
        <h1 class="auth-title">Iniciar Sesión</h1>
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
      title="✉️ Email Enviado"
      :show-close-button="false"
    >
      <div class="success-content">
        <p class="success-message">
          Te hemos enviado un enlace mágico a <strong>{{ form.email }}</strong>
        </p>
        <p class="success-instructions">
          Revisa tu bandeja de entrada y haz clic en el enlace para acceder a tu cuenta.
        </p>
        <button
          @click="closeSuccessModal"
          class="success-button"
        >
          Entendido
        </button>
      </div>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

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
    
    const response = await authStore.sendMagicLink(form.value.email)
    
    if (response.success) {
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

.auth-form {
  margin-bottom: var(--space-8);
  
  .form-group {
    margin-bottom: var(--space-6);
  }
}

.auth-button {
  width: 100%;
  height: var(--space-11);
  background: var(--color-secondary);
  color: white;
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
  
  &:hover:not(:disabled) {
    background: var(--color-secondary-dark);
    transform: translateY(-1px);
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
    font-size: var(--font-size-sm);
    color: var(--color-text-muted);
    
    .signup-link-text {
      color: var(--color-secondary);
      text-decoration: none;
      font-weight: var(--font-weight-medium);
      
      &:hover {
        text-decoration: underline;
      }
    }
  }
}

.success-content {
  text-align: center;
  
  .success-message {
    font-size: var(--font-size-base);
    color: var(--color-text);
    margin-bottom: var(--space-4);
    line-height: var(--line-height-normal);
  }
  
  .success-instructions {
    font-size: var(--font-size-sm);
    color: var(--color-text-muted);
    margin-bottom: var(--space-6);
    line-height: var(--line-height-normal);
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
