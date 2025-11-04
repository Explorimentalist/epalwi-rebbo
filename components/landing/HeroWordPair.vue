<template>
  <div
    class="hero-word-pair flex flex-col items-start gap-8"
    :class="containerClass"
  >
    <span class="hero-word-pair__label ds-text-display-xs" :style="labelStyle">
      {{ label }}
    </span>
    <template v-if="words && words.length">
      <span class="hero-word-pair__text" :class="textClass" :style="textStyle">
        <TypewriterText 
          :words="words"
          :controlled="controlled"
          :phase-external="phase"
          :index-external="index"
          :typing-ms-per-char="typingMsPerChar"
          :erase-ms-per-char="eraseMsPerChar"
        />
      </span>
    </template>
    <template v-else>
      <span class="hero-word-pair__text" :class="textClass" :style="textStyle">
        {{ text }}
      </span>
    </template>
  </div>
  
</template>

<script setup lang="ts">
import { computed } from 'vue'
import TypewriterText from '~/components/common/TypewriterText.vue'
interface Props {
  /** Small heading above the word (e.g., "Español") */
  label?: string
  /** The large word to display (e.g., "Casa") */
  text?: string
  /** Optional: cycle through words using CSS typewriter */
  words?: string[]
  /** Optional: align text; default "left" */
  align?: 'left' | 'center' | 'right'
  /** Optional: compact spacing for tighter stacks */
  dense?: boolean
  /** Control the internal typewriter manually */
  controlled?: boolean
  phase?: 'idle' | 'typing' | 'holding' | 'erasing'
  index?: number
  typingMsPerChar?: number
  eraseMsPerChar?: number
}

const props = withDefaults(defineProps<Props>(), {
  label: 'Español',
  text: 'Casa',
  align: 'left',
  dense: false,
  controlled: false,
  phase: 'idle',
  index: 0,
  typingMsPerChar: 90,
  eraseMsPerChar: 60
})

const containerClass = computed(() => {
  return [
    props.dense ? 'gap-6' : 'gap-8',
    props.align === 'center' ? 'items-center text-center' : '',
    props.align === 'right' ? 'items-end text-right' : ''
  ]
})

// The label in the design uses a warm cream (#FBEAE3).
// We keep it token-friendly and easy to tweak later.
const labelStyle = {
  color: '#FBEAE3'
} as const

const textClass = computed(() => [
  // 36px/47px from the spec – not present in DS scale yet
  // Use arbitrary size with clean leading; color pulled from design
  'text-[36px] leading-[47px]',
  'text-white'
])

const textStyle = {
  fontFamily: 'var(--ds-font-sans)'
} as const
</script>

<style scoped lang="scss">
.hero-word-pair {
  // Motion-safe subtle entrance; actual typewriter will be added later
  animation: ds-fadeIn var(--ds-duration) var(--ds-ease);
}

/* Accessibility: respect reduced motion */
@media (prefers-reduced-motion: reduce) {
  .hero-word-pair { animation: none; }
}
</style>
