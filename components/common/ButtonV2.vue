<template>
  <button 
    :class="buttonClasses"
    :disabled="disabled || loading"
    @click="handleClick"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'link'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
  fullWidth?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  loading: false,
  disabled: false,
  fullWidth: false
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const buttonClasses = computed(() => {
  const baseClasses = ['ds-btn-' + props.variant]
  const sizeClasses = ['ds-btn-' + props.size]
  const widthClass = props.fullWidth ? ['w-full'] : []
  const loadingClass = props.loading ? ['ds-btn-loading'] : []

  return [
    ...baseClasses,
    ...sizeClasses,
    ...widthClass,
    ...loadingClass
  ]
})

const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>

<style scoped>
/* ButtonV2 now uses pure CSS classes from Design System V2 */
/* All styling is handled by ds-btn-* classes in _design-system-v2.scss */
</style>
