<template>
  <span
    v-if="!reducedMotion"
    class="typewriter"
    :class="{
      typing: phaseForView === 'typing',
      erasing: phaseForView === 'erasing',
      idle: phaseForView === 'idle'
    }"
    :style="{
      '--ch': String(charCount),
      '--type-dur': typeDuration + 'ms',
      '--erase-dur': eraseDuration + 'ms'
    } as any"
  >
    {{ currentWord }}
  </span>
  <span v-else>
    {{ currentWord }}
  </span>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'

type Phase = 'idle' | 'typing' | 'holding' | 'erasing'

interface Props {
  words?: string[]
  /** milliseconds per character when typing */
  typingMsPerChar?: number
  /** milliseconds per character when erasing */
  eraseMsPerChar?: number
  /** pause after a word is fully typed (ms) */
  holdMs?: number
  /** start at this index */
  startIndex?: number
  /** When true, the parent controls phase + index */
  controlled?: boolean
  phaseExternal?: Phase
  indexExternal?: number
}

const props = withDefaults(defineProps<Props>(), {
  words: () => ['Casa', 'Bonita', 'Luz', 'Alegria', 'Futuro', 'Brillante', 'Pueblo'],
  typingMsPerChar: 90,
  eraseMsPerChar: 60,
  holdMs: 1000,
  startIndex: 0,
  controlled: false,
  phaseExternal: 'idle',
  indexExternal: 0
})

const index = ref(props.startIndex)
const phase = ref<Phase>('typing')
const timers: number[] = []

const activeIndex = computed(() => props.controlled ? (props.indexExternal ?? 0) : index.value)
const currentWord = computed(() => props.words[activeIndex.value % props.words.length])
const charCount = computed(() => currentWord.value.length)

const typeDuration = computed(() => Math.max(1, Math.round(charCount.value * props.typingMsPerChar)))
const eraseDuration = computed(() => Math.max(1, Math.round(charCount.value * props.eraseMsPerChar)))

// Prefer CSS reduced motion; also mirror in JS for less work
const reducedMotion = typeof window !== 'undefined' && window.matchMedia
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false

const phaseForView = computed<Phase>(() => props.controlled ? (props.phaseExternal ?? 'idle') : phase.value)

function schedule(fn: () => void, delay: number) {
  const id = window.setTimeout(fn, delay)
  timers.push(id)
}

function clearTimers() {
  while (timers.length) window.clearTimeout(timers.pop()!)
}

function runCycle() {
  if (reducedMotion || props.controlled) return // render static or controlled

  phase.value = 'typing'
  schedule(() => {
    phase.value = 'holding'
    schedule(() => {
      phase.value = 'erasing'
      schedule(() => {
        index.value = (index.value + 1) % props.words.length
        // next loop
        runCycle()
      }, eraseDuration.value)
    }, props.holdMs)
  }, typeDuration.value)
}

onMounted(() => {
  runCycle()
})

onBeforeUnmount(() => {
  clearTimers()
})

// If words array changes at runtime, restart
watch(() => props.words, () => {
  clearTimers()
  index.value = 0
  runCycle()
})
</script>

<style scoped>
.typewriter {
  display: inline-block;
  /* caret */
  border-right: 2px solid currentColor;
  padding-right: 2px; /* space for caret */
  white-space: nowrap;
  overflow: hidden;
  /* Blink caret */
  animation: caret-blink 1s step-end infinite;
}

.typewriter.typing {
  animation-name: caret-blink, typing;
  animation-duration: 1s, var(--type-dur);
  animation-timing-function: step-end, steps(var(--ch));
  animation-iteration-count: infinite, 1;
  animation-fill-mode: none, forwards;
}

.typewriter.erasing {
  animation-name: caret-blink, erase;
  animation-duration: 1s, var(--erase-dur);
  animation-timing-function: step-end, steps(var(--ch));
  animation-iteration-count: infinite, 1;
  animation-fill-mode: none, forwards;
}

.typewriter.idle {
  width: 0;
  border-right-color: transparent;
}

@keyframes typing {
  from { width: 0; }
  to   { width: calc(var(--ch) * 1ch); }
}

@keyframes erase {
  from { width: calc(var(--ch) * 1ch); }
  to   { width: 0; }
}

@keyframes caret-blink {
  0%, 50% { border-color: currentColor; }
  50.1%, 100% { border-color: transparent; }
}

@media (prefers-reduced-motion: reduce) {
  .typewriter,
  .typewriter.typing,
  .typewriter.erasing {
    animation: none !important;
    border-right: none;
  }
}
</style>
