<template>
  <Transition name="trial-banner" appear>
    <div 
      v-if="showBanner"
      class="trial-banner"
      :class="bannerClasses"
      role="banner"
      :aria-label="bannerAriaLabel"
    >
      <!-- Banner Content -->
      <div class="trial-banner__content">
        <!-- Status Icon -->
        <Icon 
          :name="statusIcon" 
          size="base"
          class="trial-banner__icon"
        />
        
        <!-- Text Content -->
        <div class="trial-banner__text">
          <span class="trial-banner__message">
            {{ bannerMessage }}
          </span>
        </div>
      </div>
      
      <!-- Actions -->
      <div class="trial-banner__actions">
        <!-- Upgrade Button -->
        <button
          v-if="showUpgradeButton"
          class="trial-banner__cta"
          :disabled="ctaLoading"
          @click="handleUpgradeClick"
        >
          <Icon 
            v-if="ctaLoading" 
            name="loader-2" 
            size="sm" 
            class="loading"
          />
          <span v-if="!ctaLoading">{{ ctaText }}</span>
          <span v-else>{{ ctaLoadingText }}</span>
        </button>
        
        <!-- Close Button -->
        <button
          v-if="dismissible"
          class="trial-banner__close"
          type="button"
          :aria-label="closeButtonLabel"
          @click="handleDismiss"
        >
          <Icon name="x" size="base" />
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
/**
 * 🎛️ TrialBanner Component
 * Subscription trial status banner with dismissible functionality
 * Shows trial days remaining with contextual styling and upgrade CTA
 */

interface Props {
  /** Number of trial days remaining */
  daysRemaining?: number
  /** Whether banner can be dismissed */
  dismissible?: boolean
  /** Whether to show upgrade button */
  showUpgradeButton?: boolean
  /** Upgrade button text */
  ctaText?: string
  /** Loading text for CTA button */
  ctaLoadingText?: string
  /** Whether CTA button is in loading state */
  ctaLoading?: boolean
  /** Custom close button aria-label */
  closeButtonLabel?: string
  /** Force show banner (ignores dismissal) */
  forceShow?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  dismissible: true,
  showUpgradeButton: true,
  ctaText: 'Actualizar',
  ctaLoadingText: 'Cargando...',
  closeButtonLabel: 'Cerrar banner'
})

const emit = defineEmits<{
  'upgrade-click': []
  'dismiss': []
}>()

const { createComponentClasses } = useDesignSystem()

// Local storage key for dismissal
const DISMISSAL_KEY = 'trial-banner-dismissed'
const DISMISSAL_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds (standard)
const DISMISSAL_DAY_KEY = 'trial-banner-dismissed-day' // daily dismissal key for final 3 days/grace

// Reactive state
const isDismissed = ref(false)

// Check if banner was dismissed
const checkDismissalStatus = () => {
  if (!props.dismissible || props.forceShow) return false

  // Near expiration or grace period: allow only daily dismissal
  const todayKey = new Date().toISOString().slice(0, 10)
  const dismissedDay = localStorage.getItem(DISMISSAL_DAY_KEY)
  if (dismissedDay) {
    // If dismissed today, keep hidden; otherwise show again
    if (dismissedDay === todayKey) return true
    localStorage.removeItem(DISMISSAL_DAY_KEY)
  }

  // Standard dismissal fallback (7 days)
  const dismissedAt = localStorage.getItem(DISMISSAL_KEY)
  if (!dismissedAt) return false

  const dismissedTime = parseInt(dismissedAt, 10)
  const now = Date.now()

  if (Number.isFinite(dismissedTime) && (now - dismissedTime) <= DISMISSAL_DURATION) {
    return true
  }

  localStorage.removeItem(DISMISSAL_KEY)
  return false
}

// Initialize dismissal state
onMounted(() => {
  isDismissed.value = checkDismissalStatus()
})

// Computed properties
// Stores (optional): use global store values when prop not provided
const authStore = useAuthStore()
const subscriptionStore = useSubscriptionStore()
const { isInGracePeriod: graceFlag, graceDaysRemaining } = useAuth()

const effectiveDaysRemaining = computed(() => {
  if (typeof props.daysRemaining === 'number') return props.daysRemaining
  return authStore.trialDaysRemaining || subscriptionStore.trialDaysRemaining || 0
})

const showBanner = computed(() => {
  // Show during active trial or grace period
  return !isDismissed.value && (effectiveDaysRemaining.value >= 0 || graceFlag.value)
})

const bannerState = computed(() => {
  if (graceFlag.value) return 'warning'
  if (effectiveDaysRemaining.value <= 3) return 'critical'
  if (effectiveDaysRemaining.value <= 7) return 'warning'
  return 'info'
})

const statusIcon = computed(() => {
  switch (bannerState.value) {
    case 'critical': return 'alert-triangle'
    case 'warning': return 'clock'
    default: return 'info'
  }
})

const bannerMessage = computed(() => {
  if (graceFlag.value) {
    const remaining = graceDaysRemaining.value
    const elapsed = Math.max(0, 3 - remaining)
    if (elapsed <= 0) return `Tu prueba ha expirado — periodo de gracia activo (${remaining} días restantes)`
    if (elapsed === 1) return `Tu prueba expiró ayer — periodo de gracia: ${remaining} días restantes`
    return `Tu prueba expiró hace ${elapsed} días — periodo de gracia: ${remaining} días restantes`
  }

  const days = effectiveDaysRemaining.value
  if (days === 0) return 'Tu prueba gratuita expira hoy'
  if (days === 1) return 'Prueba gratuita: 1 día restante'
  return `Prueba gratuita: ${days} días restantes`
})

const bannerAriaLabel = computed(() => {
  return `${bannerMessage.value}. ${props.showUpgradeButton ? 'Botón de actualización disponible.' : ''}`
})

// Event handlers
const { redirectToSubscription } = useAuth()
const handleUpgradeClick = () => {
  if (!props.ctaLoading) {
    emit('upgrade-click')
    redirectToSubscription(graceFlag.value ? 'trial-banner-grace' : 'trial-banner')
  }
}

const handleDismiss = () => {
  // In final 3 days or grace, dismiss only for the current day
  if (graceFlag.value || effectiveDaysRemaining.value <= 3) {
    localStorage.setItem(DISMISSAL_DAY_KEY, new Date().toISOString().slice(0, 10))
  } else {
    // Store dismissal timestamp (7-day suppression)
    localStorage.setItem(DISMISSAL_KEY, Date.now().toString())
  }
  isDismissed.value = true
  emit('dismiss')
}

// CSS Classes
const bannerClasses = computed(() => {
  const variants = { state: bannerState.value }
  const states = props.ctaLoading ? ['loading'] : []
  
  return createComponentClasses('trial-banner', variants, states)
})
</script>

<style scoped>
.trial-banner {
  position: sticky;
  top: 64px; /* 64px - below navigation */
  left: 0;
  right: 0;
  background: linear-gradient(135deg, var(--ds-primary), #E6613D);
  color: white;
  z-index: var(--z-sticky);
  transition: transform var(--ds-duration);
  
  /* Desktop layout */
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--ds-spacing-3); /* 24px */
  height: var(--ds-spacing-6); /* 56px */
  
  /* Mobile adjustments */
  @media (max-width: 767px) {
    flex-direction: column;
    align-items: flex-start;
    padding: var(--ds-spacing-1) var(--ds-spacing-2); /* 12px 16px */
    height: auto;
    min-height: 72px; /* 72px */
    gap: var(--ds-spacing-05); /* 4px */
  }
}

/* Banner state variants */
.trial-banner--critical {
  background: linear-gradient(135deg, var(--ds-destructive), #B91C1C);
}

.trial-banner--warning {
  background: linear-gradient(135deg, #F59E0B, #D97706);
}

.trial-banner--info {
  background: linear-gradient(135deg, var(--ds-primary), #E6613D);
}

/* Content area */
.trial-banner__content {
  display: flex;
  align-items: center;
  gap: var(--ds-spacing-1); /* 8px */
  flex: 1;
  
  @media (max-width: 767px) {
    width: 100%;
  }
}

.trial-banner__icon {
  flex-shrink: 0;
  color: rgba(255, 255, 255, 0.9);
}

.trial-banner__text {
  flex: 1;
}

.trial-banner__message {
  font-size: 0.875rem;
  font-weight: var(--ds-font-weight-medium);
  line-height: 1.4;
  
  @media (min-width: 768px) {
    font-size: 1rem;
  }
}

/* Actions area */
.trial-banner__actions {
  display: flex;
  align-items: center;
  gap: var(--ds-spacing-1); /* 8px */
  
  @media (max-width: 767px) {
    width: 100%;
    justify-content: space-between;
  }
}

/* Upgrade CTA button */
.trial-banner__cta {
  height: var(--ds-spacing-3); /* 32px */
  padding: 0 var(--ds-spacing-1); /* 12px horizontal */
  font-size: 0.875rem;
  font-weight: var(--ds-font-weight-medium);
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: var(--ds-radius);
  color: white;
  cursor: pointer;
  transition: all var(--ds-duration);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--ds-spacing-05); /* 4px */
  min-width: 80px;
  
  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.3);
    border-color: rgba(255, 255, 255, 0.5);
  }
  
  &:active:not(:disabled) {
    background: rgba(255, 255, 255, 0.15);
  }
  
  &:focus-visible {
    outline: 2px solid rgba(255, 255, 255, 0.8);
    outline-offset: 2px;
  }
  
  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
  
  @media (max-width: 767px) {
    min-width: 100px;
  }
}

/* Close button */
.trial-banner__close {
  width: var(--ds-spacing-3); /* 32px */
  height: var(--ds-spacing-3); /* 32px */
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  border-radius: var(--ds-radius);
  transition: all var(--ds-duration);
  flex-shrink: 0;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }
  
  &:focus-visible {
    outline: 2px solid rgba(255, 255, 255, 0.8);
    outline-offset: 2px;
  }
}

/* Transition animations */
.trial-banner-enter-active,
.trial-banner-leave-active {
  transition: transform var(--ds-duration), opacity var(--ds-duration);
}

.trial-banner-enter-from {
  transform: translateY(-100%);
  opacity: 0;
}

.trial-banner-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}

/* Loading state */
.trial-banner.loading .trial-banner__cta {
  cursor: not-allowed;
}

/* High contrast support */
@media (prefers-contrast: high) {
  .trial-banner {
    border-bottom: 2px solid rgba(255, 255, 255, 0.8);
  }
  
  .trial-banner__cta {
    border-width: 2px;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .trial-banner,
  .trial-banner__cta,
  .trial-banner__close {
    transition: none;
  }
  
  .trial-banner-enter-active,
  .trial-banner-leave-active {
    transition: none;
  }
}

/* Print styles */
@media print {
  .trial-banner {
    display: none;
  }
}
</style> 
