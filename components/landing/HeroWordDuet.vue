<template>
  <div>
    <HeroWordPair
      :label="aLabel"
      :words="aWords"
      :controlled="true"
      :phase="aPhase"
      :index="pairIndex"
      :typing-ms-per-char="typingMsPerChar"
      :erase-ms-per-char="eraseMsPerChar"
    />
    <HeroWordPair
      :label="bLabel"
      :words="bWords"
      :controlled="true"
      :phase="bPhase"
      :index="pairIndex"
      :typing-ms-per-char="typingMsPerChar"
      :erase-ms-per-char="eraseMsPerChar"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import HeroWordPair from './HeroWordPair.vue'

type Phase = 'idle' | 'typing' | 'holding' | 'erasing'

interface Props {
  aLabel?: string
  aWords: string[]
  bLabel?: string
  bWords: string[]
  typingMsPerChar?: number
  eraseMsPerChar?: number
  leadHoldMs?: number      // pause after A types before B starts
  pairHoldMs?: number      // pause after both typed before erase
}

const props = withDefaults(defineProps<Props>(), {
  aLabel: 'Español',
  bLabel: 'Ndowéÿé',
  typingMsPerChar: 90,
  eraseMsPerChar: 60,
  leadHoldMs: 250,
  pairHoldMs: 900
})

const pairIndex = ref(0)
const aPhase = ref<Phase>('idle')
const bPhase = ref<Phase>('idle')
const timers: number[] = []

const reducedMotion = typeof window !== 'undefined' && window.matchMedia
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false

function clearTimers() { while (timers.length) clearTimeout(timers.pop()!) }
function wait(ms: number) { return new Promise<void>(resolve => timers.push(window.setTimeout(resolve, ms))) }

function durationFor(word: string, perChar: number) {
  return Math.max(1, Math.round(word.length * perChar))
}

async function runDuet() {
  if (reducedMotion) {
    aPhase.value = 'holding'
    bPhase.value = 'holding'
    return
  }

  const len = Math.min(props.aWords.length, props.bWords.length)
  while (true) {
    for (let i = 0; i < len; i++) {
      pairIndex.value = i

      const aWord = props.aWords[i]
      const bWord = props.bWords[i]
      const aType = durationFor(aWord, props.typingMsPerChar)
      const bType = durationFor(bWord, props.typingMsPerChar)
      const aErase = durationFor(aWord, props.eraseMsPerChar)
      const bErase = durationFor(bWord, props.eraseMsPerChar)

      // A types
      aPhase.value = 'typing'
      bPhase.value = 'idle'
      await wait(aType)

      // hold, then B types
      aPhase.value = 'holding'
      await wait(props.leadHoldMs)
      bPhase.value = 'typing'
      await wait(bType)

      // both visible
      bPhase.value = 'holding'
      await wait(props.pairHoldMs)

      // erase A then B
      aPhase.value = 'erasing'
      await wait(aErase)
      bPhase.value = 'erasing'
      await wait(bErase)
    }
  }
}

onMounted(() => { runDuet() })
onBeforeUnmount(() => { clearTimers() })

watch(() => [props.aWords, props.bWords], () => {
  clearTimers()
  pairIndex.value = 0
  runDuet()
})
</script>

<style scoped>
/* No layout styles here; container classes are provided by parent. */
</style>

