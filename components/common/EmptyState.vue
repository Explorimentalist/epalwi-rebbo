<template>
  <div class="empty-state" :class="emptyStateClasses">
    <!-- Icon -->
    <div class="empty-state__icon">
      <Icon 
        :name="iconName" 
        size="xl" 
        class="empty-state__icon-graphic"
      />
    </div>
    
    <!-- Title -->
    <h3 class="empty-state__title">
      {{ title }}
    </h3>
    
    <!-- Description -->
    <p class="empty-state__description">
      {{ description }}
    </p>
    
    <!-- Call to Action Button -->
    <button 
      v-if="ctaText" 
      class="btn btn--primary empty-state__cta"
      :class="ctaButtonClasses"
      :disabled="ctaLoading"
      @click="handleCtaClick"
    >
      <Icon 
        v-if="ctaLoading" 
        name="loader-2" 
        size="base" 
        class="loading"
      />
      <span v-if="!ctaLoading">{{ ctaText }}</span>
      <span v-else>{{ ctaLoadingText || 'Cargando...' }}</span>
    </button>
    
    <!-- Additional Content Slot -->
    <div v-if="$slots.default" class="empty-state__content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 📋 EmptyState Component
 * Flexible component for displaying empty states, errors, and informational messages
 * Supports icons, titles, descriptions, and optional call-to-action buttons
 */

interface Props {
  /** Icon name for the empty state */
  iconName: string
  /** Title text */
  title: string
  /** Description text */
  description: string
  /** Call-to-action button text */
  ctaText?: string
  /** Loading text for CTA button */
  ctaLoadingText?: string
  /** Whether CTA button is in loading state */
  ctaLoading?: boolean
  /** Empty state variant for styling */
  variant?: 'default' | 'error' | 'success' | 'info'
  /** Size variant */
  size?: 'small' | 'medium' | 'large'
  /** Custom CSS classes */
  class?: string | string[]
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'medium',
  ctaLoadingText: 'Cargando...'
})

const emit = defineEmits<{
  'cta-click': []
}>()

const { createComponentClasses, componentSpecs } = useDesignSystem()

// Event handlers
const handleCtaClick = () => {
  if (!props.ctaLoading) {
    emit('cta-click')
  }
}

// CSS Classes
const emptyStateClasses = computed(() => {
  const variants = { 
    variant: props.variant,
    size: props.size
  }
  const states = props.ctaLoading ? ['loading'] : []
  
  const baseClasses = createComponentClasses('empty-state', variants, states)
  
  // Add custom classes
  if (props.class) {
    if (Array.isArray(props.class)) {
      baseClasses.push(...props.class)
    } else {
      baseClasses.push(props.class)
    }
  }
  
  return baseClasses
})

const ctaButtonClasses = computed(() => {
  const classes = []
  
  if (props.size === 'small') classes.push('btn--small')
  else if (props.size === 'large') classes.push('btn--large')
  
  return classes
})
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  max-width: var(--space-15); /* 400px max width */
  margin: 0 auto;
  padding: var(--space-11); /* 48px padding */
}

/* Size variants */
.empty-state--small {
  max-width: 300px;
  padding: var(--space-9); /* 32px */
}

.empty-state--large {
  max-width: 500px;
  padding: var(--space-12); /* 56px */
}

/* Icon */
.empty-state__icon {
  margin-bottom: var(--space-8); /* 24px gap */
  color: var(--color-text-muted);
}

.empty-state__icon-graphic {
  display: block;
}

/* Variant icon colors */
.empty-state--error .empty-state__icon {
  color: var(--color-error);
}

.empty-state--success .empty-state__icon {
  color: var(--color-success);
}

.empty-state--info .empty-state__icon {
  color: var(--color-secondary);
}

/* Title */
.empty-state__title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
  margin: 0 0 var(--space-6) 0; /* 16px gap */
  line-height: var(--line-height-tight);
}

.empty-state--small .empty-state__title {
  font-size: var(--font-size-lg);
}

.empty-state--large .empty-state__title {
  font-size: var(--font-size-2xl);
}

/* Description */
.empty-state__description {
  font-size: var(--font-size-base);
  color: var(--color-text-muted);
  margin: 0;
  line-height: var(--line-height-normal);
  max-width: 350px; /* Prevent text from being too wide */
}

.empty-state--small .empty-state__description {
  font-size: var(--font-size-sm);
  max-width: 280px;
}

.empty-state--large .empty-state__description {
  font-size: var(--font-size-lg);
  max-width: 420px;
}

/* Call to Action Button */
.empty-state__cta {
  margin-top: var(--space-8); /* 24px gap */
  min-width: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-3); /* 4px gap between icon and text */
}

.empty-state--small .empty-state__cta {
  min-width: 140px;
}

.empty-state--large .empty-state__cta {
  min-width: 180px;
}

/* Additional Content */
.empty-state__content {
  margin-top: var(--space-8); /* 24px gap */
  width: 100%;
}

/* Responsive adjustments */
@media (max-width: 767px) {
  .empty-state {
    padding: var(--space-8); /* 24px on mobile */
    max-width: none; /* Full width on mobile */
  }
  
  .empty-state--small {
    padding: var(--space-6); /* 16px */
  }
  
  .empty-state--large {
    padding: var(--space-9); /* 32px */
  }
  
  .empty-state__title {
    font-size: var(--font-size-lg);
  }
  
  .empty-state--large .empty-state__title {
    font-size: var(--font-size-xl);
  }
  
  .empty-state__description {
    font-size: var(--font-size-sm);
    max-width: none;
  }
  
  .empty-state__cta {
    width: 100%;
    min-width: auto;
  }
}

/* Loading state */
.empty-state.loading .empty-state__cta {
  cursor: not-allowed;
  opacity: 0.7;
}

/* Interactive states for CTA */
.empty-state__cta:hover:not(:disabled) {
  transform: translateY(-1px);
}

.empty-state__cta:active:not(:disabled) {
  transform: translateY(0);
}

/* Focus styles */
.empty-state__cta:focus-visible {
  outline: 2px solid var(--color-border-focus);
  outline-offset: 2px;
}

/* High contrast support */
@media (prefers-contrast: high) {
  .empty-state__icon {
    filter: contrast(1.2);
  }
  
  .empty-state__title {
    font-weight: var(--font-weight-bold);
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .empty-state__cta {
    transition: none;
  }
  
  .empty-state__cta:hover:not(:disabled) {
    transform: none;
  }
  
  .empty-state__cta:active:not(:disabled) {
    transform: none;
  }
}

/* Print styles */
@media print {
  .empty-state {
    padding: var(--space-6);
  }
  
  .empty-state__cta {
    display: none;
  }
}
</style> 