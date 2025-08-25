<template>
  <Teleport to="body">
    <div
      v-if="show && suggestions.length > 0"
      ref="dropdownRef"
      class="suggestion-dropdown"
      :style="dropdownStyle"
      @mousedown.prevent="handleMouseDown"
    >
      <div
        v-for="(suggestion, index) in suggestions"
        :key="suggestion"
        :ref="(el) => setItemRef(el, index)"
        class="suggestion-item"
        :class="{ 'suggestion-item--active': index === activeIndex }"
        role="option"
        :aria-selected="index === activeIndex"
        @click="selectSuggestion(suggestion)"
        @mouseenter="setActiveIndex(index)"
      >
        <Icon name="search" size="base" class="suggestion-icon" />
        <span class="suggestion-text">{{ suggestion }}</span>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'

interface Props {
  show: boolean
  suggestions: string[]
  targetElement?: HTMLElement | null
  maxHeight?: number
  itemHeight?: number
}

interface Emits {
  'select': [suggestion: string]
  'close': []
}

const props = withDefaults(defineProps<Props>(), {
  maxHeight: 240, // 6 items × 40px
  itemHeight: 40,
  targetElement: null
})

const emit = defineEmits<Emits>()

// Refs
const dropdownRef = ref<HTMLElement>()
const activeIndex = ref(-1)
const itemRefs = ref<(HTMLElement | null)[]>([])

// Position calculation
const dropdownStyle = ref<Record<string, string>>({})

// Set item refs for keyboard navigation
const setItemRef = (el: HTMLElement | null, index: number) => {
  if (itemRefs.value) {
    itemRefs.value[index] = el
  }
}

// Calculate dropdown position
const calculatePosition = () => {
  if (!props.targetElement || !dropdownRef.value) return
  
  const targetRect = props.targetElement.getBoundingClientRect()
  const dropdownRect = dropdownRef.value.getBoundingClientRect()
  const viewportHeight = window.innerHeight
  const viewportWidth = window.innerWidth
  
  // Calculate height needed
  const neededHeight = Math.min(props.suggestions.length * props.itemHeight, props.maxHeight)
  
  // Determine if dropdown should appear above or below
  const spaceBelow = viewportHeight - targetRect.bottom
  const spaceAbove = targetRect.top
  const showAbove = spaceBelow < neededHeight && spaceAbove > spaceBelow
  
  // Calculate horizontal position
  let left = targetRect.left
  const maxLeft = viewportWidth - dropdownRect.width
  if (left > maxLeft) {
    left = maxLeft
  }
  if (left < 0) {
    left = 0
  }
  
  // Calculate vertical position
  let top: number
  if (showAbove) {
    top = targetRect.top - neededHeight
  } else {
    top = targetRect.bottom
  }
  
  // Ensure dropdown doesn't go off screen
  if (top < 0) {
    top = 0
  }
  if (top + neededHeight > viewportHeight) {
    top = viewportHeight - neededHeight
  }
  
  dropdownStyle.value = {
    position: 'fixed',
    top: `${top}px`,
    left: `${left}px`,
    width: `${targetRect.width}px`,
    maxHeight: `${props.maxHeight}px`,
    zIndex: 'var(--z-dropdown)'
  }
}

// Watch for changes that require repositioning
watch([() => props.show, () => props.suggestions], async () => {
  if (props.show && props.suggestions.length > 0) {
    await nextTick()
    calculatePosition()
    activeIndex.value = -1
  }
}, { immediate: true })

// Handle window resize
const handleResize = () => {
  if (props.show) {
    calculatePosition()
  }
}

// Handle clicks outside dropdown
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as Node
  if (dropdownRef.value && !dropdownRef.value.contains(target)) {
    emit('close')
  }
}

// Prevent dropdown from losing focus on mousedown
const handleMouseDown = (event: MouseEvent) => {
  event.preventDefault()
}

// Selection handlers
const selectSuggestion = (suggestion: string) => {
  emit('select', suggestion)
}

const setActiveIndex = (index: number) => {
  activeIndex.value = index
}

// Keyboard navigation
const navigateUp = () => {
  if (activeIndex.value > 0) {
    activeIndex.value--
  } else {
    activeIndex.value = props.suggestions.length - 1
  }
  scrollToActiveItem()
}

const navigateDown = () => {
  if (activeIndex.value < props.suggestions.length - 1) {
    activeIndex.value++
  } else {
    activeIndex.value = 0
  }
  scrollToActiveItem()
}

const selectActive = () => {
  if (activeIndex.value >= 0 && activeIndex.value < props.suggestions.length) {
    selectSuggestion(props.suggestions[activeIndex.value])
  }
}

const scrollToActiveItem = () => {
  nextTick(() => {
    const activeItem = itemRefs.value[activeIndex.value]
    if (activeItem && dropdownRef.value) {
      const dropdownEl = dropdownRef.value
      const itemTop = activeItem.offsetTop
      const itemBottom = itemTop + activeItem.offsetHeight
      const dropdownTop = dropdownEl.scrollTop
      const dropdownBottom = dropdownTop + dropdownEl.clientHeight
      
      if (itemTop < dropdownTop) {
        dropdownEl.scrollTop = itemTop
      } else if (itemBottom > dropdownBottom) {
        dropdownEl.scrollTop = itemBottom - dropdownEl.clientHeight
      }
    }
  })
}

// Handle keyboard events from parent
const handleKeyDown = (event: KeyboardEvent) => {
  if (!props.show || props.suggestions.length === 0) return
  
  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      navigateDown()
      break
    case 'ArrowUp':
      event.preventDefault()
      navigateUp()
      break
    case 'Enter':
      event.preventDefault()
      selectActive()
      break
    case 'Escape':
      event.preventDefault()
      emit('close')
      break
  }
}

// Lifecycle
onMounted(() => {
  window.addEventListener('resize', handleResize, { passive: true })
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  document.removeEventListener('click', handleClickOutside)
})

// Expose methods to parent
defineExpose({
  handleKeyDown,
  navigateUp,
  navigateDown,
  selectActive
})
</script>

<style scoped>
.suggestion-dropdown {
  background: var(--color-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-lg);
  overflow-y: auto;
  min-width: 200px;
}

.suggestion-item {
  display: flex;
  align-items: center;
  gap: var(--space-3); /* 12px */
  height: 40px;
  padding: var(--space-2) var(--space-3); /* 8px 12px */
  cursor: pointer;
  transition: all var(--transition-fast) var(--ease-in-out);
  color: var(--color-text);
  border-bottom: 1px solid var(--color-border);
  user-select: none;
}

.suggestion-item:last-child {
  border-bottom: none;
}

.suggestion-item:hover,
.suggestion-item--active {
  background: var(--color-background);
}

.suggestion-item--active {
  background: rgba(212, 91, 65, 0.1);
  color: var(--color-secondary);
}

.suggestion-icon {
  color: var(--color-text-light);
  flex-shrink: 0;
}

.suggestion-item--active .suggestion-icon {
  color: var(--color-secondary);
}

.suggestion-text {
  font-size: var(--font-size-base);
  line-height: var(--line-height-normal);
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  flex: 1;
}

/* Scrollbar styling */
.suggestion-dropdown::-webkit-scrollbar {
  width: 4px;
}

.suggestion-dropdown::-webkit-scrollbar-track {
  background: transparent;
}

.suggestion-dropdown::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 2px;
}

.suggestion-dropdown::-webkit-scrollbar-thumb:hover {
  background: var(--color-text-light);
}

/* Focus styles for accessibility */
.suggestion-item:focus {
  outline: 2px solid var(--color-border-focus);
  outline-offset: -2px;
}

/* Animation for dropdown appearance */
.suggestion-dropdown {
  animation: dropdown-appear var(--transition-fast) var(--ease-out);
}

@keyframes dropdown-appear {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .suggestion-dropdown {
    min-width: 0;
    border-radius: var(--border-radius);
  }
  
  .suggestion-item {
    padding: var(--space-3) var(--space-4); /* 12px 16px on mobile */
    height: 44px; /* Slightly taller for better touch targets */
  }
}
</style>
