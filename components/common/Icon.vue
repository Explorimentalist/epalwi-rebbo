<template>
  <NuxtIcon 
    :name="mappedIconName" 
    :size="iconSize"
    :class="computedClasses"
    :style="computedStyle"
  />
</template>

<script setup lang="ts">
/**
 * 🧩 Icon Component
 * Maps generic icon names to heroicons format for @nuxt/icon
 * Provides consistent icon experience across the application
 */

interface Props {
  /** Icon name (generic or heroicons format) */
  name: string
  /** Icon size using design system scale */
  size?: 'sm' | 'base' | 'md' | 'lg' | 'xl'
  /** Additional CSS classes */
  class?: string | string[]
  /** Custom color override */
  color?: string
}

const props = withDefaults(defineProps<Props>(), {
  // name is required, do not provide a default
  size: 'base',
  class: '',
  color: ''
})

// Icon name mapping from generic names to heroicons
const iconNameMap: Record<string, string> = {
  // Common icons
  'search': 'heroicons:magnifying-glass',
  'menu': 'heroicons:bars-3',
  'user': 'heroicons:user',
  'settings': 'heroicons:cog-6-tooth',
  'heart': 'heroicons:heart',
  'star': 'heroicons:star',
  'mail': 'heroicons:envelope',
  'bell': 'heroicons:bell',
  'home': 'heroicons:home',
  'bookmark': 'heroicons:bookmark',
  'share': 'heroicons:share',
  'download': 'heroicons:arrow-down-tray',
  'check': 'heroicons:check',
  'x': 'heroicons:x-mark',
  'arrow-left': 'heroicons:arrow-left',
  'arrow-right': 'heroicons:arrow-right',
  'loader': 'heroicons:arrow-path',
  'close': 'heroicons:x-mark',
  'plus': 'heroicons:plus',
  'minus': 'heroicons:minus',
  'edit': 'heroicons:pencil',
  'delete': 'heroicons:trash',
  'info': 'heroicons:information-circle',
  'warning': 'heroicons:exclamation-triangle',
  'error': 'heroicons:x-circle',
  'success': 'heroicons:check-circle'
}

// Size mapping to pixel values
const sizeMap = {
  sm: '12px',
  base: '16px', 
  md: '20px',
  lg: '24px',
  xl: '32px'
}

// Computed properties
const mappedIconName = computed(() => {
  if (!props.name) return ''
  if (props.name.includes(':')) {
    return props.name
  }
  return iconNameMap[props.name] || `heroicons:${props.name}`
})

const iconSize = computed(() => sizeMap[props.size])

const computedClasses = computed(() => {
  const classes = ['nuxt-icon']
  if (props.class) {
    if (Array.isArray(props.class)) {
      classes.push(...props.class)
    } else {
      classes.push(props.class)
    }
  }
  return classes
})

const computedStyle = computed(() => {
  return props.color ? { color: props.color } : {}
})
</script>

<style scoped>
.nuxt-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  vertical-align: middle;
}
</style> 