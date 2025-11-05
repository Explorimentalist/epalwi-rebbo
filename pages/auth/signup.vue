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
        <h2 class="ds-text-display-md">Crear Cuenta</h2>
        <p class="auth-subtitle">
          Comienza tu prueba gratuita de 14 días
        </p>
      </div>

            <!-- Benefits List -->
      <div class="benefits-section">
        <!-- <h3 class="benefits-title">¿Qué incluye tu cuenta?</h3> -->
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

      <!-- Terms and Conditions -->
      <div class="terms-section">
        <p class="terms-text">
          Al registrarte aceptas nuestros 
          <NuxtLink to="/terms" class="terms-link">términos y condiciones</NuxtLink>
        </p>
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

.terms-section {
  margin-bottom: var(--ds-spacing-2);
  text-align: center;
  
  .terms-text {
    font-size: var(--ds-font-size-copy-14);
    color: var(--ds-muted-foreground);
    line-height: 1.5;
    
    .terms-link {
      color: var(--ds-primary);
      text-decoration: none;
      
      &:hover {
        text-decoration: underline;
      }
    }
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

.benefits-section {
  margin-bottom: var(--ds-spacing-2);
  margin-top: var(--ds-spacing-4);
  
  .benefits-title {
    font-size: var(--ds-font-size-xs);
    font-weight: 600;
    color: var(--ds-foreground);
    margin-bottom: var(--ds-spacing-4);
    text-align: center;
  }
  
  .benefits-list {
    list-style: none;
    padding: 0;
    margin: 0;
    
    .benefit-item {
      display: flex;
      align-items: center;
      gap: var(--ds-spacing-1);
      margin-bottom: var(--ds-spacing-1);
      
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
        font-size: var(--ds-font-size-copy-16);
        color: var(--ds-foreground);
      }
    }
  }
}

.auth-footer {
  text-align: center;
  
  .terms-text {
    font-size: var(--ds-font-size-copy-14);
    color: var(--ds-muted-foreground);
    margin-bottom: var(--ds-spacing-4);
    line-height: 1.5;
    
    .terms-link {
      color: var(--ds-primary);
      text-decoration: none;
      
      &:hover {
        text-decoration: underline;
      }
    }
  }
  
  .login-link {
    font-size: var(--ds-font-size-copy-14);
    color: var(--ds-muted-foreground);
    
    .login-link-text {
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
  text-align: center;
  
  .success-message {
    font-size: var(--ds-font-size-copy-16);
    color: var(--ds-foreground);
    margin-bottom: var(--ds-spacing-4);
    line-height: 1.5;
  }
  
  .success-instructions {
    font-size: var(--ds-font-size-copy-14);
    color: var(--ds-muted-foreground);
    margin-bottom: var(--ds-spacing-6);
    line-height: 1.5;
  }
  
  .success-button {
    height: var(--ds-spacing-11);
    padding: 0 var(--ds-spacing-8);
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
    min-height: 100vh;
  }
  
  .auth-container {
    padding: var(--ds-spacing-2);
    margin: var(--ds-spacing-1);
    max-width: 100%;
    min-height: auto;
    border-radius: 0;
    box-shadow: none;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  
  .auth-header {
    margin-bottom: var(--ds-spacing-4);
    
    .auth-title {
      font-size: var(--ds-font-size-xxs);
      margin-bottom: var(--ds-spacing-1);
    }
    
    .auth-subtitle {
      font-size: var(--ds-font-size-copy-16);
      max-width: 100%;
    }
  }
  
  .benefits-section {
    margin-bottom: var(--ds-spacing-4);
    margin-top: var(--ds-spacing-2);
    
    .benefit-item {
      margin-bottom: var(--ds-spacing-2);
      
      span {
        font-size: var(--ds-font-size-copy-16);
      }
    }
  }
  
  .auth-form {
    margin-bottom: var(--ds-spacing-3);
    
    .form-group {
      margin-bottom: var(--ds-spacing-3);
    }
  }
  
  .auth-button {
    height: 52px;
    font-size: var(--ds-font-size-copy-18);
    margin-bottom: var(--ds-spacing-3);
  }
  
  .terms-section {
    margin-bottom: var(--ds-spacing-4);
  }
}
</style>
