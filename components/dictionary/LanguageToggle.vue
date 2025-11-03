<template>
  <div
    ref="containerRef"
    class="ds-toggle-group"
    role="group"
    aria-label="Seleccionar dirección de traducción"
  >
    <!-- Sliding indicator (animated) -->
    <div
      class="ds-toggle-indicator"
      :style="indicatorStyle"
      aria-hidden="true"
    />

    <!-- Left: Español -->
    <button
      ref="leftRef"
      class="ds-toggle-segment"
      :class="{ active: isSpanish }"
      type="button"
      @click="selectLanguage('spanish')"
      :aria-pressed="isSpanish"
      aria-label="Español como idioma de origen"
    >
      <span class="ds-toggle-label">{{ spanishLabel }}</span>
    </button>

    <!-- Separator "a" -->
    <span class="ds-toggle-separator" aria-hidden="true">a</span>

    <!-- Right: Ndowe -->
    <button
      ref="rightRef"
      class="ds-toggle-segment"
      :class="{ active: !isSpanish }"
      type="button"
      @click="selectLanguage('ndowe')"
      :aria-pressed="!isSpanish"
      aria-label="Ndowe como idioma de origen"
    >
      <span class="ds-toggle-label">{{ ndoweLabel }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'

type Lang = 'spanish' | 'ndowe'

interface Props {
  currentLanguage: Lang
  spanishLabel?: string
  ndoweLabel?: string
}

interface Emits {
  'language-change': [language: Lang]
}

const props = withDefaults(defineProps<Props>(), {
  spanishLabel: 'Español',
  ndoweLabel: 'Ndowe'
})

const emit = defineEmits<Emits>()

const containerRef = ref<HTMLElement | null>(null)
const leftRef = ref<HTMLElement | null>(null)
const rightRef = ref<HTMLElement | null>(null)

const isSpanish = computed(() => props.currentLanguage === 'spanish')

// Indicator positioning state
const indicatorX = ref(0)
const indicatorW = ref(0)

const measure = () => {
  const el = isSpanish.value ? leftRef.value : rightRef.value
  if (!el) return
  const parent = containerRef.value
  const rect = el.getBoundingClientRect()
  const parentRect = parent?.getBoundingClientRect()
  if (parentRect) {
    indicatorX.value = rect.left - parentRect.left
    indicatorW.value = rect.width
  }
}

// Update on mount, prop change, and resize
onMounted(() => {
  nextTick(() => measure())
  window.addEventListener('resize', measure)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', measure)
})

watch(isSpanish, async () => {
  await nextTick()
  measure()
})

const indicatorStyle = computed(() => ({
  transform: `translateX(${indicatorX.value}px)`,
  width: `${indicatorW.value}px`
}))

const selectLanguage = (lang: Lang) => {
  if (lang !== props.currentLanguage) emit('language-change', lang)
}
</script>

<style scoped>
/* No component-specific styles needed: using V2 global classes */
</style>
