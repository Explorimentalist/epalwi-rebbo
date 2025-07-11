<template>
  <div 
    v-if="hasCustomIcon"
    :class="['custom-icon', ...computedClasses]"
    :style="{ ...computedStyle, fontSize: `${iconSize}px` }"
    v-html="customIconSvg"
  />
  <NuxtIcon 
    v-else
    :name="iconName" 
    :size="iconSize"
    :class="computedClasses"
    :style="computedStyle"
  />
</template>

<script setup lang="ts">
/**
 * 🧩 Icon Component
 * Foundation component using Nuxt Icon v1 with local icon collections
 * Uses heroicons and lucide collections for reliable offline performance
 */

interface Props {
  /** Icon name (heroicons, lucide, or fallback SVG) */
  name: string
  /** Icon size using design system scale */
  size?: 'sm' | 'base' | 'md' | 'lg' | 'xl'
  /** Additional CSS classes */
  class?: string | string[]
  /** Custom color override */
  color?: string
  /** Whether icon should inherit text color */
  inheritColor?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'base',
  inheritColor: true
})

const { iconSizes, createComponentClasses } = useDesignSystem()

// Icon mapping to heroicons (using local collections)
const iconMapping = {
  search: 'heroicons:magnifying-glass',
  menu: 'heroicons:bars-3',
  user: 'heroicons:user',
  settings: 'heroicons:cog-6-tooth',
  heart: 'heroicons:heart',
  star: 'heroicons:star',
  mail: 'heroicons:envelope',
  bell: 'heroicons:bell',
  home: 'heroicons:home',
  bookmark: 'heroicons:bookmark',
  share: 'heroicons:share',
  download: 'heroicons:arrow-down-tray',
  check: 'heroicons:check',
  x: 'heroicons:x-mark',
  'arrow-left': 'heroicons:arrow-left',
  'arrow-right': 'heroicons:arrow-right',
  loader: 'lucide:loader-2'
}

// SVG fallbacks for absolute reliability (only for critical icons)
const svgFallbacks = {
  search: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>',
  menu: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>',
  user: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" /></svg>'
}

// Determine if we should use custom SVG fallback (for development reliability)
const hasCustomIcon = computed(() => {
  return process.dev && !!(svgFallbacks[props.name as keyof typeof svgFallbacks])
})

// Map icon name to collection format
const iconName = computed(() => {
  // Use mapped icon name or default to heroicons
  return iconMapping[props.name as keyof typeof iconMapping] || `heroicons:${props.name}`
})

// Get custom SVG for fallback rendering
const customIconSvg = computed(() => {
  return svgFallbacks[props.name as keyof typeof svgFallbacks] || ''
})

// Get numeric size
const iconSize = computed(() => iconSizes[props.size])

// Generate component classes
const computedClasses = computed(() => {
  const baseClasses = createComponentClasses(
    'icon',
    { size: props.size },
    props.inheritColor ? ['icon--inherit-color'] : []
  )
  
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

// Custom styling for color override
const computedStyle = computed(() => {
  if (!props.color) return undefined
  
  return {
    color: props.color
  }
})
</script>

<style scoped>
.icon,
.custom-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: color var(--transition-fast);
}

.icon--inherit-color,
.custom-icon {
  color: currentColor;
}

.custom-icon svg {
  width: 100%;
  height: 100%;
  display: block;
}

/* Size-specific adjustments */
.icon--sm,
.custom-icon {
  min-width: 12px;
  min-height: 12px;
}

.icon--base {
  min-width: 16px;
  min-height: 16px;
}

.icon--md {
  min-width: 20px;
  min-height: 20px;
}

.icon--lg {
  min-width: 24px;
  min-height: 24px;
}

.icon--xl {
  min-width: 32px;
  min-height: 32px;
}

/* Interactive states */
.icon.interactive,
.custom-icon.interactive {
  cursor: pointer;
  
  &:hover {
    color: var(--color-secondary);
  }
  
  &:focus-visible {
    outline: 2px solid var(--color-border-focus);
    outline-offset: 2px;
    border-radius: var(--border-radius);
  }
}

/* Loading state */
.icon.loading,
.custom-icon.loading {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style> 