<template>
  <!-- Nuxt Icon as the renderer; names are mapped below -->
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
  size?: 'sm' | 'base' | 'md' | 'lg' | 'xl' | number | string
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

// Icon name mapping from generic names to iconify collections
// Prefer heroicons; map lucide names explicitly where used
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
  'success': 'heroicons:check-circle',

  // Frequently used additional icons in the app
  'chevron-down': 'heroicons:chevron-down',
  'academic-cap': 'heroicons:academic-cap',
  'book': 'heroicons:book-open',
  'book-open': 'heroicons:book-open',
  'document-text': 'heroicons:document-text',
  'question-mark-circle': 'heroicons:question-mark-circle',
  'shield-check': 'heroicons:shield-check',
  'arrow-right-on-rectangle': 'heroicons:arrow-right-on-rectangle',
  'arrow-up': 'heroicons:arrow-up',
  'clock': 'heroicons:clock',
  'globe': 'heroicons:globe-alt',
  'moon': 'heroicons:moon',
  'wifi': 'heroicons:wifi',
  'building-library': 'heroicons:building-library',
  'swap': 'heroicons:arrows-right-left',

  // Lucide-specific names used in components
  'alert-circle': 'lucide:alert-circle',
  'alert-triangle': 'lucide:alert-triangle',
  'loader-2': 'lucide:loader-2',
  'message-circle': 'lucide:message-circle',
  'credit-card': 'lucide:credit-card',
  'log-out': 'lucide:log-out',
  'log-in': 'lucide:log-in',
  'file-text': 'lucide:file-text',
  'bar-chart-3': 'lucide:bar-chart-3'
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

const iconSize = computed(() => {
  const s = props.size as any
  if (typeof s === 'number') return `${s}px`
  if (typeof s === 'string') {
    // numeric string
    if (/^\d+$/.test(s)) return `${s}px`
    return sizeMap[s as keyof typeof sizeMap] || s
  }
  return sizeMap.base
})

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

const computedStyle = computed(() => (props.color ? { color: props.color } : {}))
</script>

<style scoped>
.nuxt-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  vertical-align: middle;
}
</style> 
