<template>
  <p ref="container" class="paragraph">
    <template v-for="(part, i) in parts" :key="i">
      <span v-if="part.isSpace" class="space">{{ part.text }}</span>
      <span v-else class="word">
        <span class="base">{{ part.text }}</span>
        <span class="overlay" :style="{ opacity: opacityFor(part.wordIndex!) }">{{ part.text }}</span>
      </span>
    </template>
  </p>
  
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useWindowSize, useElementBounding } from '@vueuse/core'

interface Part {
  text: string
  isSpace: boolean
  wordIndex: number | null
}

interface Props {
  paragraph: string
  /** When the element top reaches this viewport ratio, progress = 0 */
  offsetStart?: number // e.g., 0.9
  /** When the element top reaches this viewport ratio, progress = 1 */
  offsetEnd?: number // e.g., 0.25
}

const props = withDefaults(defineProps<Props>(), {
  offsetStart: 0.9,
  offsetEnd: 0.25,
})

const container = ref<HTMLElement | null>(null)

// Split into tokens (words + spaces/newlines), and annotate with word indices
const parts = computed<Part[]>(() => {
  const tokens = props.paragraph.split(/(\s+)/)
  const out: Part[] = []
  let wIndex = 0
  for (const token of tokens) {
    const isSpace = /^\s+$/.test(token) || token === ''
    if (isSpace) {
      out.push({ text: token, isSpace: true, wordIndex: null })
    } else {
      out.push({ text: token, isSpace: false, wordIndex: wIndex })
      wIndex++
    }
  }
  return out
})

const wordsCount = computed(() => parts.value.reduce((acc, p) => acc + (p.isSpace ? 0 : 1), 0))

// Scroll progress mapping similar to Framer's useScroll offset ["start 0.9", "start 0.25"]
const { height: vh } = useWindowSize()
const { top } = useElementBounding(container)

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(n, max))

const progress = computed(() => {
  const startPx = vh.value * props.offsetStart
  const endPx = vh.value * props.offsetEnd
  const denom = startPx - endPx || 1
  const raw = (startPx - top.value) / denom
  return clamp(raw, 0, 1)
})

const opacityFor = (idx: number) => {
  const count = wordsCount.value || 1
  const start = idx / count
  const end = start + 1 / count
  const p = progress.value
  if (p <= start) return 0
  if (p >= end) return 1
  return (p - start) / (end - start)
}

</script>

<style scoped lang="scss">
.paragraph {
  /* Typography inherits from parent; spaces/newlines preserved */
  white-space: pre-wrap;
}

.word {
  position: relative;
  display: inline-block;
}

.overlay {
  position: absolute;
  left: 0;
  top: 0;
  color: var(--ds-foreground);
  pointer-events: none;
}

.base {
  color: var(--ds-border);
}

.space {
  white-space: pre;
}
</style>
