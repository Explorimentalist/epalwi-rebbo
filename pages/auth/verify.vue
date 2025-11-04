<template>
  <div class="auth-page">
    <div class="auth-container">
      <!-- Header -->
      <div class="auth-header">
        <h1 class="ds-text-display-lg">Verificar Cuenta</h1>
        <p class="auth-subtitle">
          <template v-if="isVerifying">
            Verificando tu enlace mágico...
          </template>
          <template v-else-if="isVerified">
            Tu cuenta ha sido verificada correctamente. Serás redirigido al diccionario en unos segundos.
          </template>
        </p>

        <!-- Progressive loader below subtitle (uses DS variables + easing) -->
        <div
          v-if="!verificationError"
          class="verify-progress"
          role="progressbar"
          aria-label="Progreso de verificación"
          aria-valuemin="0"
          aria-valuemax="100"
          :aria-valuenow="Math.round(progress)"
        >
          <div class="progress-track">
            <div
              class="progress-bar"
              :style="progressStyle"
            />
          </div>
        </div>
      </div>
      
      <!-- Error State -->
      <div v-if="verificationError" class="error-section">
        <div class="error-icon">
          <Icon name="x" class="x-icon" />
        </div>
        <h2 class="ds-text-display-sm">Error de Verificación</h2>
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
import { ref, onMounted, computed } from 'vue'
const config = useRuntimeConfig()

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
// Progress state (0-100)
const progress = ref(1) // Start slightly visible like the SVG reference
const progressStyle = computed(() => ({
  '--progress': `${Math.max(0, Math.min(100, progress.value))}%`,
  '--progress-duration': isVerified.value ? '5s' : '400ms',
}))

let progressTimer: number | null = null

const stopProgress = () => {
  if (progressTimer) {
    clearInterval(progressTimer)
    progressTimer = null
  }
}

// While verifying, gently advance to ~50-60% and wait
const startVerifyingProgress = () => {
  stopProgress()
  progress.value = 1
  progressTimer = window.setInterval(() => {
    if (!isVerifying.value) return
    const cap = 60
    if (progress.value < cap) {
      progress.value = Math.min(cap, progress.value + 2 + Math.random() * 2)
    }
  }, 300)
}

// After success, animate to 100% over 5s while we delay redirect
const startRedirectCountdown = () => {
  stopProgress()
  // Width transition duration handled via CSS var --progress-duration
  // Set to 100% to trigger smooth fill over 5 seconds
  progress.value = 100
}

// Auth store
const authStore = useAuthStore()

// Get token/return from URL
const route = useRoute()
const token = route.query['token'] as string

// Verify magic link
const t0 = (typeof performance !== 'undefined' ? performance.now() : Date.now())
// Small helper: wait briefly for auth state to hydrate before navigating
const waitForAuth = async (timeoutMs: number = 4000): Promise<boolean> => {
  const start = Date.now()
  // Guard if store exposes a ref
  const hasAuth = () => Boolean((authStore as any)?.isAuthenticated?.value)
  if (hasAuth()) return true
  while (Date.now() - start < timeoutMs) {
    await new Promise(r => setTimeout(r, 125))
    if (hasAuth()) return true
  }
  return hasAuth()
}
const verifyToken = async () => {
  if (!token) {
    // Try Firebase Email Link flow if enabled
    const useEmailLink = !Boolean((config as any).public?.devAuthMock)
    if (useEmailLink && authStore.isEmailLink(window.location.href)) {
      try {
        const emailFromParam = (route.query['email'] as string) || undefined
        const res = await authStore.completeEmailLink(window.location.href, emailFromParam)
        if (res.success) {
          isVerified.value = true
          isVerifying.value = false
          // Start countdown + progress fill
          startRedirectCountdown()
          setTimeout(() => { goToDictionary() }, 5000)
          return
        }
        verificationError.value = res.message || 'Error al verificar el enlace'
      } catch (e: any) {
        verificationError.value = e?.message || 'Error al verificar el enlace'
      }
      isVerifying.value = false
      return
    } else {
      verificationError.value = 'No se encontró el token de verificación'
      isVerifying.value = false
      return
    }
  }

  try {
    const response = await authStore.verifyMagicLink(token)
    
    if (response.success) {
      isVerified.value = true
      isVerifying.value = false
      // Smoothly fill bar and redirect after 5 seconds
      startRedirectCountdown()
      setTimeout(() => {
        goToDictionary()
      }, 5000)
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

// Go to dictionary or last attempted/return route (dev-friendly)
const goToDictionary = async () => {
  // Prefer explicit return query, then attempted route, then dictionary
  const returnParam = (route.query['return'] as string) || ''
  let target = returnParam || '/dictionary'
  try {
    const attempted = sessionStorage.getItem('attempted-route')
    if (!returnParam && attempted) {
      target = attempted
      sessionStorage.removeItem('attempted-route')
    }
  } catch {}

  // Mark that we just verified to allow a one-shot bypass in route middleware
  try { sessionStorage.setItem('just-verified', '1') } catch {}

  // Give auth a brief moment to hydrate before navigating (production only)
  if (!import.meta.dev) {
    await waitForAuth(4000)
  }

  try {
    const t1 = (typeof performance !== 'undefined' ? performance.now() : Date.now())
    const ms = Math.round(t1 - t0)
    // Track redirect + timing
    const { track } = require('~/utils/telemetry')
    track('auth.verify_timing', { ms })
    track('auth.redirect', { to: target })
  } catch {}
  
  // In development mode, force a page reload to ensure middleware sees the auth state
  if (import.meta.dev) {
    console.log('🔧 Debug: Development mode - forcing page reload to sync auth state')
    window.location.href = target
  } else {
    await navigateTo(target)
  }
}

// Verify on mount
onMounted(() => {
  startVerifyingProgress()
  verifyToken()
})
</script>

<style lang="scss" scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--ds-spacing-6);
  background: var(--ds-background);
}

.auth-container {
  background: var(--ds-card);
  border-radius: var(--ds-radius-lg);
  box-shadow: var(--ds-shadow-lg);
  /* Align with other auth pages */
  padding: var(--ds-spacing-3);
  max-width: 420px;
  width: 100%;
}

.auth-header {
  text-align: center;
  margin-bottom: var(--ds-spacing-3);
  
  .auth-subtitle {
    font-size: var(--ds-font-size-copy-16);
    color: var(--ds-muted-foreground);
    line-height: 1.4;
    font-weight: 400;
    max-width: 300px;
    margin: 0 auto;
  }

  /* Progressive loader */
  .verify-progress {
    margin-top: var(--ds-spacing-1);
  }
  .progress-track {
    width: 100%;
    max-width: 325px; /* matches reference */
    height: 18px;
    margin: 0 auto;
    background: var(--ds-muted);
    border: 1px solid var(--ds-border);
    border-radius: var(--ds-radius);
    overflow: hidden;
    box-shadow: inset 0 1px 0 hsl(0 0% 100% / 0.25);
  }
  .progress-bar {
    height: 100%;
    width: var(--progress, 0%);
    background: var(--ds-primary);
    transition: width var(--progress-duration, var(--ds-duration)) var(--ds-ease-emphasized);
    will-change: width;
  }
}


.error-section {
  text-align: center;
  
  .error-icon {
    margin-bottom: var(--ds-spacing-2);
    
    .x-icon {
      width: 48px;
      height: 48px;
      color: var(--ds-destructive);
      background: var(--ds-card);
      border: 2px solid var(--ds-destructive);
      border-radius: 50%;
      padding: 8px;
    }
  }
  
  .error-message {
    font-size: var(--ds-font-size-copy-16);
    color: var(--ds-muted-foreground);
    margin-bottom: var(--ds-spacing-3);
    line-height: 1.5;
  }
  
  .error-actions {
    display: flex;
    flex-direction: column;
    /* Replace undefined token with valid spacing */
    gap: var(--ds-spacing-05);
    
    .retry-button {
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
    
    .login-link {
      width: 100%;
      height: 48px;
      background: transparent;
      color: var(--ds-primary);
      border: 1px solid var(--ds-border);
      border-radius: var(--ds-radius);
      font-size: var(--ds-font-size-copy-16);
      font-weight: 500;
      text-decoration: none;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s ease-in-out;
      
      &:hover {
        background: var(--ds-muted);
        text-decoration: underline;
      }
    }
  }
}


/* Responsive adjustments */
@media (max-width: 640px) {
  /* Align mobile spacing with other auth pages */
  .auth-page { 
    padding: var(--ds-spacing-2); 
  }
  .auth-container {
    padding: var(--ds-spacing-2);
    margin: var(--ds-spacing-1);
  }
}
</style>
