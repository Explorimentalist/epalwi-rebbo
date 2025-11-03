<template>
  <Teleport to="body">
    <Transition name="modal" appear>
      <div 
        v-if="modelValue"
        class="modal"
        role="dialog"
        :aria-labelledby="titleId"
        :aria-describedby="descriptionId"
        aria-modal="true"
        @click.self="handleBackdropClick"
        @keydown.esc="handleEscapeKey"
      >
        <!-- Backdrop Overlay -->
        <div 
          class="modal__overlay" 
          @click="handleBackdropClick"
        />
        
        <!-- Modal Container -->
        <div 
          ref="modalContainer"
          class="modal__container"
          :class="containerClasses"
          tabindex="-1"
        >
          <!-- Close Button -->
          <button
            v-if="showCloseButton"
            class="modal__close"
            type="button"
            :aria-label="closeButtonLabel"
            @click="closeModal"
          >
            <Icon name="x" size="base" />
          </button>
          
          <!-- Modal Header -->
          <header v-if="title || $slots.header" class="modal__header">
            <slot name="header">
              <h2 
                v-if="title"
                :id="titleId"
                class="ds-text-display-sm"
              >
                {{ title }}
              </h2>
            </slot>
          </header>
          
          <!-- Modal Content -->
          <main 
            class="modal__content"
            :id="descriptionId"
          >
            <slot />
          </main>
          
          <!-- Modal Footer -->
          <footer v-if="$slots.footer" class="modal__footer">
            <slot name="footer" />
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
/**
 * 🗃️ Modal Component
 * Accessible modal with focus management, backdrop interaction, and responsive behavior
 * Full-screen on mobile, card-style on desktop with backdrop blur
 */

interface Props {
  /** Whether modal is visible */
  modelValue: boolean
  /** Modal title */
  title?: string
  /** Modal size */
  size?: 'small' | 'medium' | 'large' | 'fullscreen'
  /** Whether to show close button */
  showCloseButton?: boolean
  /** Whether to close on backdrop click */
  closeOnBackdrop?: boolean
  /** Whether to close on Escape key */
  closeOnEscape?: boolean
  /** Custom close button aria-label */
  closeButtonLabel?: string
  /** Prevent body scroll when modal is open */
  preventBodyScroll?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'medium',
  showCloseButton: true,
  closeOnBackdrop: true,
  closeOnEscape: true,
  closeButtonLabel: 'Cerrar modal',
  preventBodyScroll: true
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'close': []
  'open': []
}>()

const { createComponentClasses } = useDesignSystem()

// Refs and reactive state
const modalContainer = ref<HTMLElement>()
const titleId = computed(() => `modal-title-${Math.random().toString(36).substring(7)}`)
const descriptionId = computed(() => `modal-description-${Math.random().toString(36).substring(7)}`)
const previousActiveElement = ref<HTMLElement | null>(null)

// Modal control methods
const closeModal = () => {
  emit('update:modelValue', false)
  emit('close')
}

// Event handlers
const handleBackdropClick = () => {
  if (props.closeOnBackdrop) {
    closeModal()
  }
}

const handleEscapeKey = () => {
  if (props.closeOnEscape) {
    closeModal()
  }
}

// Focus management
const trapFocus = (event: KeyboardEvent) => {
  if (!modalContainer.value) return
  
  const focusableElements = modalContainer.value.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )
  
  const firstElement = focusableElements[0] as HTMLElement
  const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement
  
  if (event.key === 'Tab') {
    if (event.shiftKey) {
      if (document.activeElement === firstElement) {
        event.preventDefault()
        lastElement?.focus()
      }
    } else {
      if (document.activeElement === lastElement) {
        event.preventDefault()
        firstElement?.focus()
      }
    }
  }
}

// Body scroll prevention with scrollbar compensation
const preventScroll = () => {
  if (props.preventBodyScroll) {
    // Calculate scrollbar width before hiding it
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
    
    // Only apply compensation if there's actually a scrollbar
    if (scrollbarWidth > 0) {
      // Prevent body scroll and compensate for scrollbar
      document.body.style.overflow = 'hidden'
      document.body.style.paddingRight = `${scrollbarWidth}px`
      
      // Apply compensation to all fixed positioned elements
      const fixedElements = document.querySelectorAll('nav[class*="fixed"], .fixed')
      fixedElements.forEach(el => {
        const element = el as HTMLElement
        const currentPadding = parseInt(getComputedStyle(element).paddingRight) || 0
        element.style.paddingRight = `${currentPadding + scrollbarWidth}px`
        element.setAttribute('data-modal-padding-added', scrollbarWidth.toString())
      })
    } else {
      // Just prevent scroll if no scrollbar
      document.body.style.overflow = 'hidden'
    }
  }
}

const restoreScroll = () => {
  if (props.preventBodyScroll) {
    document.body.style.overflow = ''
    document.body.style.paddingRight = ''
    
    // Restore all fixed elements that had padding added
    const fixedElements = document.querySelectorAll('[data-modal-padding-added]')
    fixedElements.forEach(el => {
      const element = el as HTMLElement
      const addedPadding = parseInt(element.getAttribute('data-modal-padding-added') || '0')
      const currentPadding = parseInt(getComputedStyle(element).paddingRight) || 0
      const originalPadding = currentPadding - addedPadding
      
      element.style.paddingRight = originalPadding > 0 ? `${originalPadding}px` : ''
      element.removeAttribute('data-modal-padding-added')
    })
  }
}

// Modal lifecycle
watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    previousActiveElement.value = document.activeElement as HTMLElement
    preventScroll()
    
    nextTick(() => {
      modalContainer.value?.focus()
      document.addEventListener('keydown', trapFocus)
    })
  } else {
    restoreScroll()
    document.removeEventListener('keydown', trapFocus)
    
    nextTick(() => {
      previousActiveElement.value?.focus()
    })
  }
})

// Cleanup on unmount
onUnmounted(() => {
  restoreScroll()
  document.removeEventListener('keydown', trapFocus)
})

// CSS Classes
const containerClasses = computed(() => {
  const variants = { size: props.size }
  return createComponentClasses('modal__container', variants, [])
})
</script>

<style scoped>
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: var(--z-modal);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

@media (max-width: 767px) {
  .modal {
    align-items: stretch;
    padding: 0;
  }
}

.modal__overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  cursor: pointer;
}

.modal__container {
  position: relative;
  background: var(--ds-card);
  border-radius: var(--ds-radius-lg);
  box-shadow: var(--ds-shadow-xl);
  max-height: 90vh;
  overflow-y: auto;
  z-index: 1;
  outline: none;
  
  /* Mobile-first styling */
  width: 100%;
  height: 100vh;
  padding: var(--ds-spacing-3);
  border-radius: 0;
  max-height: none;
}

@media (min-width: 768px) {
  .modal__container {
    width: auto;
    height: auto;
    max-height: 90vh;
    padding: var(--ds-spacing-3);
    border-radius: var(--ds-radius-lg);
  }
  
  .modal__container--small {
    max-width: 400px;
    min-width: 320px;
  }
  
  .modal__container--medium {
    max-width: 600px;
    min-width: 480px;
  }
  
  .modal__container--large {
    max-width: 800px;
    min-width: 600px;
  }
}

.modal__close {
  position: absolute;
  top: var(--ds-spacing-1);
  right: var(--ds-spacing-1);
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  border-radius: var(--ds-radius);
  color: var(--ds-muted-foreground);
  transition: all var(--ds-duration);
  z-index: 2;
}

.modal__close:hover {
  background: var(--ds-background);
  color: var(--ds-foreground);
}

@media (min-width: 768px) {
  .modal__close {
    top: var(--ds-spacing-1);
    right: var(--ds-spacing-1);
  }
}

.modal__header {
  margin-bottom: var(--ds-spacing-2);
  padding-right: 48px;
}

.modal__title {
  font-size: 1.125rem;
  font-weight: var(--ds-font-weight-semibold);
  color: var(--ds-foreground);
  margin: 0;
  line-height: var(--ds-line-height-tight);
}

@media (min-width: 768px) {
  .modal__title {
    font-size: 1.25rem;
  }
}

.modal__content {
  flex: 1;
  color: var(--ds-foreground);
  line-height: var(--ds-line-height-normal);
}

.modal__footer {
  margin-top: var(--ds-spacing-3);
  display: flex;
  gap: var(--ds-spacing-1);
  justify-content: flex-end;
}

@media (max-width: 767px) {
  .modal__footer {
    flex-direction: column;
  }
}

/* Transition animations */
.modal-enter-active,
.modal-leave-active {
  transition: opacity var(--ds-duration);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal__container,
.modal-leave-active .modal__container {
  transition: transform var(--ds-duration);
}

.modal-enter-from .modal__container {
  transform: translateY(20px) scale(0.95);
}

.modal-leave-to .modal__container {
  transform: translateY(-20px) scale(0.95);
}

@media (max-width: 767px) {
  .modal-enter-from .modal__container,
  .modal-leave-to .modal__container {
    transform: translateY(100%);
  }
}
</style>