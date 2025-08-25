<template>
  <div class="language-toggle">
    <!-- Left Language Button (Position 1) -->
    <button 
      class="toggle-button"
      :class="{ active: currentLanguage === leftLanguage }"
      type="button"
      :aria-label="`Idioma en posición izquierda: ${getLanguageLabel(leftLanguage)}`"
      disabled
    >
      <div class="flag-icon">
        <img :src="getFlagSrc(leftLanguage)" :alt="`${getLanguageLabel(leftLanguage)} flag`" />
      </div>
      <span class="button-text">{{ getLanguageLabel(leftLanguage) }}</span>
    </button>
    
    <!-- Language Swap Button -->
    <button
      class="swap-button"
      @click="swapLanguagePositions"
      type="button"
      :aria-label="`Intercambiar posiciones de idiomas`"
      title="Intercambiar idiomas"
    >
      <div class="swap-icon">
        <Icon name="swap" size="sm" />
      </div>
    </button>
    
    <!-- Right Language Button (Position 2) -->
    <button 
      class="toggle-button"
      :class="{ active: currentLanguage === rightLanguage }"
      type="button"
      :aria-label="`Idioma en posición derecha: ${getLanguageLabel(rightLanguage)}`"
      disabled
    >
      <div class="flag-icon">
        <img :src="getFlagSrc(rightLanguage)" :alt="`${getLanguageLabel(rightLanguage)} flag`" />
      </div>
      <span class="button-text">{{ getLanguageLabel(rightLanguage) }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'

interface Props {
  currentLanguage: 'spanish' | 'ndowe'
  spanishLabel?: string
  ndoweLabel?: string
}

interface Emits {
  'language-change': [language: 'spanish' | 'ndowe']
  'languages-swapped': [from: 'spanish' | 'ndowe', to: 'spanish' | 'ndowe']
}

const props = withDefaults(defineProps<Props>(), {
  spanishLabel: 'Español',
  ndoweLabel: 'Ndowe'
})

const emit = defineEmits<Emits>()

// Track which language is in which position
const leftLanguage = ref<'spanish' | 'ndowe'>('spanish')
const rightLanguage = ref<'spanish' | 'ndowe'>('ndowe')

// Initialize positions based on current language
onMounted(() => {
  // If current language is ndowe, swap positions initially
  if (props.currentLanguage === 'ndowe') {
    leftLanguage.value = 'ndowe'
    rightLanguage.value = 'spanish'
  }
})

// Computed properties for dynamic content
const getLanguageLabel = (language: 'spanish' | 'ndowe') => {
  return language === 'spanish' ? props.spanishLabel : props.ndoweLabel
}

const getFlagSrc = (language: 'spanish' | 'ndowe') => {
  return language === 'spanish' ? '/icons/flag-spanish.svg' : '/icons/flag-ndowe.svg'
}

// Language selection is disabled - only position swapping works

// Swap the positions of the languages (this is the key functionality)
const swapLanguagePositions = () => {
  const temp = leftLanguage.value
  leftLanguage.value = rightLanguage.value
  rightLanguage.value = temp
  
  // Emit the swap event with the new positions
  emit('languages-swapped', rightLanguage.value, leftLanguage.value)
  
  // If the current active language was swapped, update it
  if (props.currentLanguage === leftLanguage.value) {
    emit('language-change', rightLanguage.value)
  } else if (props.currentLanguage === rightLanguage.value) {
    emit('language-change', leftLanguage.value)
  }
}

// Watch for external language changes to update positions if needed
watch(() => props.currentLanguage, (newLanguage) => {
  // Only update positions if the new language isn't in either position
  if (newLanguage !== leftLanguage.value && newLanguage !== rightLanguage.value) {
    // This shouldn't happen in normal usage, but handle it gracefully
    if (newLanguage === 'spanish') {
      leftLanguage.value = 'spanish'
      rightLanguage.value = 'ndowe'
    } else {
      leftLanguage.value = 'ndowe'
      rightLanguage.value = 'spanish'
    }
  }
})
</script>

<style scoped>
.language-toggle {
  display: flex;
  border-radius: var(--border-radius);
  border: 1px solid var(--color-border);
  overflow: hidden;
  background: var(--color-primary);
  position: relative;
}

.toggle-button {
  flex: 1;
  min-width: 100px; /* Increased for flag + text */
  height: var(--space-10); /* 40px */
  padding: 0 var(--space-4);
  border: none;
  background: transparent;
  color: var(--color-text);
  font-weight: var(--font-weight-medium);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2); /* 8px between flag and text */
  cursor: pointer;
  font-family: var(--font-family-base);
  font-size: var(--font-size-sm);
  line-height: var(--line-height-normal);
}

.toggle-button.active {
  background: var(--color-secondary);
  color: white;
}

.toggle-button:focus {
  outline: 2px solid var(--color-border-focus);
  outline-offset: -2px;
}

.toggle-button:disabled {
  cursor: default;
  opacity: 1; /* Keep full opacity for visual clarity */
}

/* Language Swap Button */
.swap-button {
  width: 32px; /* Fixed width for the swap button */
  height: var(--space-10); /* 40px - same as toggle buttons */
  border: none;
  background: transparent;
  color: var(--color-text-light);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 2;
}

.swap-button:focus {
  outline: 2px solid var(--color-border-focus);
  outline-offset: -2px;
}

.swap-icon {
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.flag-icon {
  width: 16px;
  height: 12px;
  flex-shrink: 0;
  border-radius: 2px; /* Subtle rounding for flags */
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.flag-icon img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}

.button-text {
  font-size: var(--font-size-sm);
  line-height: 1;
  font-weight: var(--font-weight-medium);
}

/* Responsive adjustments */
@media (max-width: 480px) {
  .toggle-button {
    min-width: 80px;
    padding: 0 var(--space-3);
    gap: var(--space-1);
  }
  
  .button-text {
    font-size: var(--font-size-xs);
  }
  
  .swap-button {
    width: 28px; /* Slightly smaller on mobile */
  }
  
  .swap-icon {
    width: 14px;
    height: 14px;
  }
}

/* Clean, minimal design without hover effects */
</style>
