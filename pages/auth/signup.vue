<template>
  <div class="auth-page">
    <div class="auth-container">
      <!-- Header -->
      <div class="auth-header">
        <h1 class="auth-title">Crear Cuenta</h1>
        <p class="auth-subtitle">
          Comienza tu prueba gratuita de 14 días
        </p>
      </div>

      <!-- Signup Form -->
      <form @submit.prevent="handleSignup" class="auth-form">
        <div class="form-group">
          <Input
            v-model="form.name"
            type="text"
            label="Nombre"
            label-position="top"
            placeholder="Tu nombre completo"
            :error="errors.name"
            :required="true"
          />
        </div>
        
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

        <!-- Terms and Conditions -->
        <div class="terms-section">
          <p class="terms-text">
            Al registrarte aceptas nuestros 
            <a href="#" class="terms-link">términos y condiciones</a>
          </p>
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

      <!-- Benefits List -->
      <div class="benefits-section">
        <h3 class="benefits-title">¿Qué incluye tu cuenta?</h3>
        <ul class="benefits-list">
          <li class="benefit-item">
            <Icon name="check" class="benefit-icon" />
            <span>Acceso completo al diccionario</span>
          </li>
          <li class="benefit-item">
            <Icon name="check" class="benefit-icon" />
            <span>Búsqueda offline</span>
          </li>
          <li class="benefit-item">
            <Icon name="check" class="benefit-icon" />
            <span>Sin anuncios</span>
          </li>
          <li class="benefit-item">
            <Icon name="check" class="benefit-icon" />
            <span>Cancela cuando quieras</span>
          </li>
        </ul>
      </div>

      <!-- Login Link -->
      <div class="auth-footer">
        <p class="login-link">
          ¿Ya tienes cuenta? 
          <NuxtLink to="/auth/login" class="login-link-text">
            Iniciar Sesión
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
  title: 'Crear Cuenta | epàlwi-rèbbo',
  meta: [
    { 
      name: 'description', 
      content: 'Crea tu cuenta en epàlwi-rèbbo y comienza tu prueba gratuita de 14 días.' 
    }
  ]
})

// Form state
const form = ref({
  name: '',
  email: ''
})

const errors = ref({
  name: '',
  email: ''
})

const isLoading = ref(false)
const showSuccessModal = ref(false)

// Computed properties
const buttonText = computed(() => {
  if (isLoading.value) return 'Enviando...'
  return 'Crear Cuenta'
})

// Auth store
const authStore = useAuthStore()

// Form validation
const validateForm = () => {
  errors.value = { name: '', email: '' }
  
  if (!form.value.name) {
    errors.value.name = 'El nombre es requerido'
    return false
  }
  
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

// Handle signup
const handleSignup = async () => {
  if (!validateForm()) return
  
  try {
    isLoading.value = true
    
    const response = await authStore.sendMagicLink(form.value.email)
    
    if (response.success) {
      showSuccessModal.value = true
    } else {
      // Error is already set in the store
      console.error('Signup failed:', response.error)
    }
  } catch (error) {
    console.error('Signup error:', error)
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

.terms-section {
  margin-bottom: var(--space-6);
  text-align: center;
  
  .terms-text {
    font-size: var(--font-size-sm);
    color: var(--color-text-muted);
    line-height: var(--line-height-normal);
    
    .terms-link {
      color: var(--color-secondary);
      text-decoration: none;
      
      &:hover {
        text-decoration: underline;
      }
    }
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

.benefits-section {
  margin-bottom: var(--space-8);
  
  .benefits-title {
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text);
    margin-bottom: var(--space-6);
    text-align: center;
  }
  
  .benefits-list {
    list-style: none;
    padding: 0;
    margin: 0;
    
    .benefit-item {
      display: flex;
      align-items: center;
      gap: var(--space-4);
      margin-bottom: var(--space-4);
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .benefit-icon {
        width: 20px;
        height: 20px;
        color: var(--color-success);
        flex-shrink: 0;
      }
      
      span {
        font-size: var(--font-size-base);
        color: var(--color-text);
      }
    }
  }
}

.auth-footer {
  text-align: center;
  
  .terms-text {
    font-size: var(--font-size-sm);
    color: var(--color-text-muted);
    margin-bottom: var(--space-4);
    line-height: var(--line-height-normal);
    
    .terms-link {
      color: var(--color-secondary);
      text-decoration: none;
      
      &:hover {
        text-decoration: underline;
      }
    }
  }
  
  .login-link {
    font-size: var(--font-size-sm);
    color: var(--color-text-muted);
    
    .login-link-text {
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
