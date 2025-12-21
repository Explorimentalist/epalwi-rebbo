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
  
  .success-message {
    font-size: var(--ds-font-size-copy-16);
    color: var(--ds-foreground);
    margin-bottom: var(--ds-spacing-3);
    line-height: 1.5;
    text-align: left;
  }
  
  .success-instructions {
    font-size: var(--ds-font-size-copy-14);
    color: var(--ds-muted-foreground);
    margin-bottom: var(--ds-spacing-4);
    line-height: 1.5;
    text-align: left;
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
    margin-top: var(--ds-spacing-2);
    
    &:hover {
      background: var(--ds-primary-dark);
      box-shadow: var(--ds-shadow-md);
    }
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
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
}
</style>
