<template>
  <section class="faq-section">
    <div class="faq-container">
      <h2 v-if="title" class="ds-text-display-sm">{{ title }}</h2>
      
      <div class="faq-grid">
        <div 
          v-for="(faq, index) in faqs" 
          :key="index"
          class="faq-item"
          :class="{ 'active': activeFAQ === index }"
          @click="toggleFAQ(index)"
        >
          <div class="faq-question">
            <span class="question-text">{{ faq.question }}</span>
            <Icon 
              name="heroicons:chevron-down" 
              class="chevron-icon"
              :class="{ 'rotated': activeFAQ === index }"
            />
          </div>
          
          <div 
            ref="answerRefs"
            class="faq-answer"
            :class="{ 'answer-open': activeFAQ === index }"
            :style="{ 
              maxHeight: activeFAQ === index ? (answerHeights[index] || '200px') : '0px' 
            }"
          >
            <div class="answer-content">
              <p class="answer-text">{{ faq.answer }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue'

export interface FAQ {
  question: string
  answer: string
}

interface Props {
  title?: string
  faqs: FAQ[]
}

const props = defineProps<Props>()

const activeFAQ = ref<number | null>(null)
const answerRefs = ref<HTMLElement[]>([])
const answerHeights = ref<string[]>([])

const toggleFAQ = async (index: number) => {
  activeFAQ.value = activeFAQ.value === index ? null : index
  
  // Calculate heights after DOM update
  await nextTick()
  calculateAnswerHeights()
}

const calculateAnswerHeights = () => {
  answerRefs.value.forEach((el, index) => {
    if (el) {
      const content = el.querySelector('.answer-content')
      if (content) {
        const height = content.scrollHeight
        answerHeights.value[index] = `${height + 32}px` // Add padding
      }
    }
  })
}

onMounted(() => {
  // Calculate initial heights
  calculateAnswerHeights()
})
</script>

<style lang="scss" scoped>
.faq-section {
  padding: var(--ds-spacing-4) var(--ds-spacing-3);
  background: var(--ds-background);
}

.faq-container {
  max-width: 800px;
  margin: 0 auto;
}

.faq-grid {
  display: flex;
  flex-direction: column;
  gap: var(--ds-spacing-1);
}

.faq-item {
  background: var(--ds-muted);
  border: 1px solid var(--ds-border);
  border-radius: var(--ds-radius-lg);
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0, 0.83, 0.32, 1);
  box-shadow: var(--ds-shadow-sm);

  &:hover {
    box-shadow: var(--ds-shadow-md);
    border-color: var(--ds-primary);
    background: var(--ds-card);
  }

  &.active {
    border-color: var(--ds-primary);
    box-shadow: var(--ds-shadow-md);
    background: var(--ds-card);
  }
}

.faq-question {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--ds-spacing-2);
  background: var(--ds-muted);
  transition: background-color 0.3s cubic-bezier(0, 0.83, 0.32, 1);

  .faq-item:hover &,
  .faq-item.active & {
    background: var(--ds-card);
  }
}

.question-text {
  font-family: var(--ds-font-sans);
  font-size: var(--ds-font-size-copy-18);
  font-weight: 600;
  color: var(--ds-foreground);
  margin: 0;
  padding-right: var(--ds-spacing-1);
  line-height: 1.4;
}

.chevron-icon {
  width: 24px;
  height: 24px;
  color: var(--ds-primary);
  transition: transform 0.3s cubic-bezier(0, 0.83, 0.32, 1);
  flex-shrink: 0;

  &.rotated {
    transform: rotate(180deg);
  }
}

.faq-answer {
  background: var(--ds-card);
  overflow: hidden;
  opacity: 0;
  transition: max-height 0.4s cubic-bezier(0, 0.83, 0.32, 1), 
              opacity 0.3s cubic-bezier(0, 0.83, 0.32, 1);
  
  &.answer-open {
    opacity: 1;
  }
}

.answer-content {
  padding: var(--ds-spacing-025) var(--ds-spacing-2) var(--ds-spacing-2);
}

.answer-text {
  font-size: var(--ds-font-size-copy-16);
  color: var(--ds-muted-foreground);
  line-height: var(--ds-line-height-relaxed);
  margin: 0;
  padding-top: var(--ds-spacing-025);
}

/* Responsive Design */
@media (max-width: 767px) {
  .faq-section {
    padding: var(--ds-spacing-3) var(--ds-spacing-2);
  }

  .faq-question {
    padding: var(--ds-spacing-1);
  }

  .question-text {
    font-size: var(--ds-font-size-copy-16);
    padding-right: var(--ds-spacing-05);
  }

  .answer-content {
    padding: var(--ds-spacing-025) var(--ds-spacing-1) var(--ds-spacing-1);
  }

  .chevron-icon {
    width: 20px;
    height: 20px;
  }
}

@media (max-width: 479px) {
  .question-text {
    font-size: var(--ds-font-size-copy-14);
  }

  .answer-text {
    font-size: var(--ds-font-size-copy-14);
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .faq-item,
  .faq-question,
  .faq-answer,
  .chevron-icon {
    transition: none !important;
  }
}
</style>