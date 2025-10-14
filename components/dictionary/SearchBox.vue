<template>
  <div class="search-box" ref="searchBoxRef">
    <!-- Leading icon inside input (wrapped to ensure scoped styles apply) -->
    <span class="search-icon">
      <Icon name="search" size="md" />
    </span>

    <!-- Search input field -->
    <input
      ref="searchInput"
      v-model="internalValue"
      :placeholder="placeholder"
      :disabled="disabled"
      class="search-input"
      type="search"
      autocomplete="off"
      autocapitalize="off"
      autocorrect="off"
      spellcheck="false"
      role="combobox"
      :aria-expanded="showSuggestions"
      aria-haspopup="listbox"
      aria-autocomplete="list"
      @input="handleInput"
      @focus="handleFocus"
      @blur="handleBlur"
      @keydown="handleKeydown"
    />

    <!-- Trailing clear button inside input (only when there's text) -->
    <button
      v-if="internalValue && !disabled"
      type="button"
      class="clear-button"
      @click="clearSearch"
      :aria-label="clearButtonLabel"
    >
      <Icon name="x" size="base" />
    </button>

    <!-- Suggestion dropdown tethered to input -->
    <SuggestionDropdown
      ref="suggestionDropdownRef"
      :show="showSuggestions"
      :suggestions="suggestions"
      :target-element="searchInput as unknown as HTMLElement"
      @select="handleSuggestionSelect"
      @close="closeSuggestions"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'

type Language = 'spanish' | 'ndowe'

interface Props {
  modelValue: string
  placeholder?: string
  debounceMs?: number
  clearButtonLabel?: string
  disabled?: boolean
  suggestions?: string[]
  showSuggestions?: boolean
}

interface Emits {
  'update:modelValue': [value: string]
  'search': [query: string]
  'focus': [event: FocusEvent]
  'blur': [event: FocusEvent]
  'clear': []
  'keydown': [event: KeyboardEvent]
  'suggestion-select': [suggestion: string]
  'update:showSuggestions': [show: boolean]
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Buscar en español...',
  debounceMs: 300,
  clearButtonLabel: 'Limpiar búsqueda',
  disabled: false,
  suggestions: () => [],
  showSuggestions: false
})

const emit = defineEmits<Emits>()

// Exposed API of SuggestionDropdown (avoid importing type)
interface SuggestionDropdownExpose {
  handleKeyDown: (e: KeyboardEvent) => void
}

// Internal state
const searchBoxRef = ref<HTMLElement | null>(null)
const searchInput = ref<HTMLInputElement | null>(null)
const suggestionDropdownRef = ref<SuggestionDropdownExpose | null>(null)
const internalValue = ref(props.modelValue)
const isFocused = ref(false)
const debounceTimer = ref<ReturnType<typeof setTimeout> | null>(null)
const internalShowSuggestions = ref(props.showSuggestions)
const blurTimeout = ref<ReturnType<typeof setTimeout> | null>(null)

const clearBlurTimeout = () => {
  if (blurTimeout.value) {
    clearTimeout(blurTimeout.value)
    blurTimeout.value = null
  }
}

// Sync external model value
watch(() => props.modelValue, (newValue) => {
  internalValue.value = newValue
})

// Sync external showSuggestions prop
watch(() => props.showSuggestions, (newValue) => {
  internalShowSuggestions.value = newValue
})

// Reflect internal showSuggestions outwards for v-model:show-suggestions
watch(internalShowSuggestions, (newValue) => {
  emit('update:showSuggestions', newValue)
})

// Emit updates and debounced search
watch(internalValue, (newValue) => {
  emit('update:modelValue', newValue)

  if (debounceTimer.value) clearTimeout(debounceTimer.value)
  debounceTimer.value = setTimeout(() => {
    emit('search', newValue)
  }, props.debounceMs)
})

const showSuggestions = computed(() => {
  return (
    internalShowSuggestions.value &&
    props.suggestions.length > 0 &&
    isFocused.value &&
    !props.disabled
  )
})

// Handlers
const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  internalValue.value = target.value
  if (target.value && props.suggestions.length > 0) {
    internalShowSuggestions.value = true
  }
}

const handleFocus = (event: FocusEvent) => {
  clearBlurTimeout()
  isFocused.value = true
  emit('focus', event)
  if (internalValue.value && props.suggestions.length > 0) {
    internalShowSuggestions.value = true
  }
}

const handleBlur = (event: FocusEvent) => {
  // Allow click on dropdown before closing
  clearBlurTimeout()
  blurTimeout.value = setTimeout(() => {
    isFocused.value = false
    internalShowSuggestions.value = false
    blurTimeout.value = null
  }, 150)
  emit('blur', event)
}

const handleKeydown = (event: KeyboardEvent) => {
  if (showSuggestions.value && suggestionDropdownRef.value) {
    const handled = ['ArrowDown', 'ArrowUp', 'Enter', 'Escape']
    if (handled.includes(event.key)) {
      suggestionDropdownRef.value.handleKeyDown(event)
      return
    }
  }
  emit('keydown', event)
}

const handleSuggestionSelect = (suggestion: string) => {
  clearBlurTimeout()
  internalValue.value = suggestion
  internalShowSuggestions.value = false
  emit('suggestion-select', suggestion)
  nextTick(() => searchInput.value?.focus())
}

const closeSuggestions = () => {
  internalShowSuggestions.value = false
}

const clearSearch = () => {
  clearBlurTimeout()
  internalValue.value = ''
  internalShowSuggestions.value = false
  emit('clear')
  nextTick(() => searchInput.value?.focus())
}

// Expose methods to parent
const focus = () => searchInput.value?.focus()
const blur = () => searchInput.value?.blur()
const select = () => searchInput.value?.select()
const showSuggestionsMethod = () => {
  if (props.suggestions.length > 0) internalShowSuggestions.value = true
}
const hideSuggestions = () => { internalShowSuggestions.value = false }

defineExpose({ focus, blur, select, showSuggestions: showSuggestionsMethod, hideSuggestions })
</script>

<style scoped>
.search-box {
  position: relative;
  height: 48px;
  width: 100%;
  background: white;
  border: 1px solid var(--ds-border);
  border-radius: var(--ds-radius);
  transition: all var(--ds-duration) var(--ds-ease);
}

.search-box:focus-within {
  border-color: var(--ds-ring);
  box-shadow: 0 0 0 3px rgba(212, 91, 65, 0.1);
}

.search-input {
  width: 100%;
  height: 100%;
  padding: 0 40px 0 48px;
  border: none;
  background: transparent;
  font-size: 1rem;
  font-family: var(--ds-font-sans);
  color: var(--ds-foreground);
  line-height: var(--ds-line-height-normal);
  transition: all var(--ds-duration) var(--ds-ease);
  outline: none;
}

.search-input::placeholder {
  color: var(--ds-muted-foreground);
}

.search-input:focus { /* focus visuals handled by container via :focus-within */ }

.search-input:disabled {
  background: var(--ds-background);
  color: var(--ds-muted-foreground);
  cursor: not-allowed;
  opacity: 0.6;
}

.search-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  color: var(--ds-muted-foreground);
  pointer-events: none;
  z-index: 2;
}

.clear-button {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: var(--ds-muted-foreground);
  cursor: pointer;
  border-radius: var(--ds-radius-sm);
  transition: all var(--ds-duration) var(--ds-ease);
  z-index: 2;
}

.clear-button:hover {
  color: var(--ds-foreground);
  background: var(--ds-background);
}

.clear-button:focus {
  outline: 2px solid var(--ds-ring);
  outline-offset: 1px;
}

.clear-button:active {
  transform: translateY(-50%) scale(0.95);
}

/* Remove default search input styling in WebKit browsers */
.search-input::-webkit-search-decoration,
.search-input::-webkit-search-cancel-button,
.search-input::-webkit-search-results-button,
.search-input::-webkit-search-results-decoration {
  -webkit-appearance: none;
}

/* Firefox specific */
.search-input[type="search"] {
  -moz-appearance: textfield;
}
</style>
