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
/**
 * 🎛️ TrialBanner Component
 * Subscription trial status banner with dismissible functionality
 * Shows trial days remaining with contextual styling and upgrade CTA
 */

interface Props {
  /** Number of trial days remaining */
  daysRemaining: number
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
const DISMISSAL_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds

// Reactive state
const isDismissed = ref(false)

// Check if banner was dismissed
const checkDismissalStatus = () => {
  if (!props.dismissible || props.forceShow) return false
  
  const dismissedAt = localStorage.getItem(DISMISSAL_KEY)
  if (!dismissedAt) return false
  
  const dismissedTime = parseInt(dismissedAt, 10)
  const now = Date.now()
  
  // Check if 7 days have passed
  if (now - dismissedTime > DISMISSAL_DURATION) {
    localStorage.removeItem(DISMISSAL_KEY)
    return false
  }
  
  return true
}

// Initialize dismissal state
onMounted(() => {
  isDismissed.value = checkDismissalStatus()
})

// Computed properties
const showBanner = computed(() => {
  return !isDismissed.value && props.daysRemaining >= 0
})

const bannerState = computed(() => {
  if (props.daysRemaining <= 3) return 'critical'
  if (props.daysRemaining <= 7) return 'warning'
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
  const days = props.daysRemaining
  
  if (days === 0) {
    return 'Tu prueba gratuita expira hoy'
  } else if (days === 1) {
    return 'Prueba gratuita: 1 día restante'
  } else {
    return `Prueba gratuita: ${days} días restantes`
  }
})

const bannerAriaLabel = computed(() => {
  return `${bannerMessage.value}. ${props.showUpgradeButton ? 'Botón de actualización disponible.' : ''}`
})

// Event handlers
const handleUpgradeClick = () => {
  if (!props.ctaLoading) {
    emit('upgrade-click')
  }
}

const handleDismiss = () => {
  // Store dismissal timestamp
  localStorage.setItem(DISMISSAL_KEY, Date.now().toString())
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
  top: var(--space-13); /* 64px - below navigation */
  left: 0;
  right: 0;
  background: linear-gradient(135deg, var(--color-secondary), #E6613D);
  color: white;
  z-index: var(--z-sticky);
  transition: transform var(--transition-normal);
  
  /* Desktop layout */
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--space-8); /* 24px */
  height: var(--space-12); /* 56px */
  
  /* Mobile adjustments */
  @media (max-width: 767px) {
    flex-direction: column;
    align-items: flex-start;
    padding: var(--space-5) var(--space-6); /* 12px 16px */
    height: auto;
    min-height: var(--space-14); /* 72px */
    gap: var(--space-3); /* 4px */
  }
}

/* Banner state variants */
.trial-banner--critical {
  background: linear-gradient(135deg, var(--color-error), #B91C1C);
}

.trial-banner--warning {
  background: linear-gradient(135deg, #F59E0B, #D97706);
}

.trial-banner--info {
  background: linear-gradient(135deg, var(--color-secondary), #E6613D);
}

/* Content area */
.trial-banner__content {
  display: flex;
  align-items: center;
  gap: var(--space-4); /* 8px */
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
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  line-height: 1.4;
  
  @media (min-width: 768px) {
    font-size: var(--font-size-base);
  }
}

/* Actions area */
.trial-banner__actions {
  display: flex;
  align-items: center;
  gap: var(--space-4); /* 8px */
  
  @media (max-width: 767px) {
    width: 100%;
    justify-content: space-between;
  }
}

/* Upgrade CTA button */
.trial-banner__cta {
  height: var(--space-9); /* 32px */
  padding: 0 var(--space-5); /* 12px horizontal */
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: var(--border-radius);
  color: white;
  cursor: pointer;
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-3); /* 4px */
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
  width: var(--space-9); /* 32px */
  height: var(--space-9); /* 32px */
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  border-radius: var(--border-radius);
  transition: all var(--transition-fast);
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
  transition: transform var(--transition-normal), opacity var(--transition-normal);
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