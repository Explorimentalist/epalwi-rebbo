<template>
  <div class="input-group">
    <!-- Top Label -->
    <label 
      v-if="label && labelPosition === 'top'" 
      :for="inputId"
      class="input-group__label"
    >
      {{ label }}<span v-if="required" class="input-group__required">*</span>
    </label>
    
    <!-- Input Wrapper -->
    <div class="input-wrapper" :class="wrapperClasses">
      <!-- Leading Icon -->
      <Icon 
        v-if="leadingIcon" 
        :name="leadingIcon"
        size="base"
        class="input-wrapper__leading-icon" 
      />
      
      <!-- Input Field -->
      <input
        :id="inputId"
        v-model="inputValue"
        :type="type"
        :placeholder="computedPlaceholder"
        :disabled="disabled || loading"
        :class="inputClasses"
        :aria-invalid="!!errorMessage"
        :aria-describedby="helperTextId"
        @blur="handleBlur"
        @focus="handleFocus"
        @input="handleInput"
      />
      
      <!-- Floating Label -->
      <label 
        v-if="label && labelPosition === 'floating'" 
        :for="inputId"
        class="input-wrapper__floating-label"
        :class="floatingLabelClasses"
      >
        {{ label }}<span v-if="required" class="input-group__required">*</span>
      </label>
      
      <!-- Trailing Icon -->
      <Icon 
        v-if="trailingIcon && !loading" 
        :name="trailingIcon" 
        size="base"
        class="input-wrapper__trailing-icon" 
      />
      
      <!-- Loading Spinner -->
      <Icon 
        v-if="loading" 
        name="loader" 
        size="base"
        class="input-wrapper__loading-icon loading" 
      />
      
      <!-- Validation Icon -->
      <Icon 
        v-if="showValidationIcon"
        :name="validationIcon"
        size="base"
        class="input-wrapper__validation-icon"
        :class="validationIconClasses"
      />
    </div>
    
    <!-- Helper Text / Error Message -->
    <div 
      v-if="helperText || errorMessage" 
      :id="helperTextId"
      class="input-group__helper"
    >
      <span v-if="!errorMessage" class="input-group__helper-text">{{ helperText }}</span>
      <span 
        v-if="errorMessage" 
        class="input-group__error-text"
        role="alert"
        aria-live="polite"
      >{{ errorMessage }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 📥 Input Component
 * Comprehensive input with validation, floating labels, and accessibility
 * Supports real-time validation and multiple visual states
 */

interface Props {
  /** Input value */
  modelValue: string
  /** Input type */
  type?: 'text' | 'email' | 'password' | 'tel' | 'url' | 'search'
  /** Input label */
  label?: string
  /** Label positioning */
  labelPosition?: 'top' | 'floating'
  /** Placeholder text */
  placeholder?: string
  /** Helper text shown below input */
  helperText?: string
  /** Error message to display */
  error?: string
  /** Whether field is required */
  required?: boolean
  /** Whether input is disabled */
  disabled?: boolean
  /** Whether input is in loading state */
  loading?: boolean
  /** Leading icon name */
  leadingIcon?: string
  /** Trailing icon name */
  trailingIcon?: string
  /** Custom validation function */
  validator?: (value: string) => string | null
  /** Show validation icons */
  showValidationIcons?: boolean
  /** Custom CSS classes */
  class?: string | string[]
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  labelPosition: 'top',
  showValidationIcons: true
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'validation-change': [isValid: boolean, error: string | null]
  'focus': [event: FocusEvent]
  'blur': [event: FocusEvent]
  'input': [event: Event]
}>()

// Reactive state
const isFocused = ref(false)
const inputId = computed(() => `input-${Math.random().toString(36).substring(7)}`)
const helperTextId = computed(() => `${inputId.value}-helper`)

// Input value handling
const inputValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// Error handling - prioritize prop error over validation
const errorMessage = computed(() => props.error || validationError.value)
const validationError = ref<string | null>(null)

// Computed properties
const hasValue = computed(() => !!inputValue.value?.trim())
const isValid = computed(() => !errorMessage.value && hasValue.value)
const computedPlaceholder = computed(() => {
  // Don't show placeholder when using floating label that's not active
  if (props.labelPosition === 'floating' && !isFocused.value && !hasValue.value) {
    return ''
  }
  return props.placeholder
})

// Validation logic
const validateInput = () => {
  if (!props.validator) {
    validationError.value = null
    return
  }
  
  const error = props.validator(inputValue.value)
  validationError.value = error
  emit('validation-change', !error, error)
}

// Real-time validation on value change
watch(inputValue, validateInput, { immediate: true })

// Event handlers
const handleFocus = (event: FocusEvent) => {
  isFocused.value = true
  emit('focus', event)
}

const handleBlur = (event: FocusEvent) => {
  isFocused.value = false
  validateInput()
  emit('blur', event)
}

const handleInput = (event: Event) => {
  emit('input', event)
}

// CSS Classes
const wrapperClasses = computed(() => {
  const classes = ['input-wrapper']
  
  if (isFocused.value) classes.push('input-wrapper--focused')
  if (errorMessage.value) classes.push('input-wrapper--error')
  if (isValid.value && hasValue.value && props.showValidationIcons) classes.push('input-wrapper--success')
  if (props.disabled) classes.push('input-wrapper--disabled')
  if (props.loading) classes.push('input-wrapper--loading')
  if (props.leadingIcon) classes.push('input-wrapper--has-leading-icon')
  if (props.trailingIcon || props.loading || showValidationIcon.value) classes.push('input-wrapper--has-trailing-icon')
  
  return classes
})

const inputClasses = computed(() => {
  const classes = ['input-field']
  
  if (props.class) {
    if (Array.isArray(props.class)) {
      classes.push(...props.class)
    } else {
      classes.push(props.class)
    }
  }
  
  return classes
})

const floatingLabelClasses = computed(() => {
  const classes = []
  
  if (isFocused.value || hasValue.value) {
    classes.push('input-wrapper__floating-label--active')
  }
  
  return classes
})

// Validation icon logic
const showValidationIcon = computed(() => {
  return props.showValidationIcons && hasValue.value && (isValid.value || errorMessage.value)
})

const validationIcon = computed(() => {
  if (errorMessage.value) return 'x'
  if (isValid.value) return 'check'
  return ''
})

const validationIconClasses = computed(() => {
  if (errorMessage.value) return ['text-red-500']
  if (isValid.value) return ['text-green-500']
  return []
})
</script>

<style scoped>
/* Modern Input Component Styling */
.input-group {
  @apply space-y-2 w-full;
}

.input-group__label {
  @apply block text-sm font-medium text-gray-800 mb-2;
}

.input-group__required {
  @apply text-red-500 ml-1;
}

.input-wrapper {
  @apply relative w-full;
}

.input-field {
  @apply w-full px-4 py-3 bg-gray-100 text-gray-800 border border-gray-300 rounded-lg transition-all duration-200 placeholder-gray-500;
  @apply focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500;
}

/* Responsive padding adjustments */
@media (min-width: 768px) {
  .input-field {
    @apply px-6 py-4;
  }
}

/* Icon positioning */
.input-wrapper--has-leading-icon .input-field {
  @apply pl-12;
}

.input-wrapper--has-trailing-icon .input-field {
  @apply pr-12;
}

.input-wrapper__leading-icon {
  @apply absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none;
}

.input-wrapper__trailing-icon,
.input-wrapper__loading-icon,
.input-wrapper__validation-icon {
  @apply absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400;
}

/* Floating label styles */
.input-wrapper__floating-label {
  @apply absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none transition-all duration-200 bg-gray-100 px-2;
}

.input-wrapper__floating-label--active {
  @apply -top-2 left-3 text-xs text-blue-600 bg-white;
}

/* Input states */
.input-wrapper--focused .input-field {
  @apply ring-2 ring-blue-500 border-blue-500 bg-white;
}

.input-wrapper--error .input-field {
  @apply border-red-500 ring-2 ring-red-200 bg-red-50;
}

.input-wrapper--success .input-field {
  @apply border-green-500 ring-2 ring-green-200;
}

.input-wrapper--disabled .input-field {
  @apply bg-gray-200 text-gray-500 cursor-not-allowed opacity-60;
}

.input-wrapper--loading .input-field {
  @apply pr-12;
}

/* Helper text and error messages */
.input-group__helper {
  @apply text-sm;
}

.input-group__helper-text {
  @apply text-gray-600;
}

.input-group__error-text {
  @apply text-red-600 font-medium;
}

/* Hover effects */
.input-field:hover:not(:disabled):not(:focus) {
  @apply border-gray-400 bg-white;
}

/* Loading animation for spinner */
.loading {
  @apply animate-spin;
}

/* Focus outline for accessibility */
.input-field:focus-visible {
  @apply outline-none ring-2 ring-blue-500 ring-offset-2;
}

/* Password input styling */
input[type="password"].input-field {
  font-family: monospace;
}

/* Search input styling */
input[type="search"].input-field {
  @apply rounded-full;
}

/* Responsive design - smaller screens */
@media (max-width: 767px) {
  .input-field {
    @apply py-3 px-4 text-base;
  }
  
  .input-wrapper__leading-icon,
  .input-wrapper__trailing-icon,
  .input-wrapper__loading-icon,
  .input-wrapper__validation-icon {
    @apply left-3 right-3;
  }
  
  .input-wrapper--has-leading-icon .input-field {
    @apply pl-10;
  }
  
  .input-wrapper--has-trailing-icon .input-field {
    @apply pr-10;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .input-field {
    @apply border-2 border-black;
  }
  
  .input-wrapper--focused .input-field {
    @apply border-blue-800 ring-blue-800;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .input-field,
  .input-wrapper__floating-label {
    @apply transition-none;
  }
}
</style> 