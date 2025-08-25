<template>
  <article 
    class="result-card"
    :class="{ 'has-examples': entry.examples?.length }"
    role="article"
    :aria-label="`Traducción de ${entry.sourceWord} a ${getTargetLanguageLabel}`"
  >
    <!-- Source Language Section -->
    <section class="language-section source-section">
      <div class="language-label" :data-language="entry.sourceLanguage">
        {{ getSourceLanguageLabel }}
      </div>
      <div class="source-word" :data-word="entry.sourceWord">
        {{ entry.sourceWord }}
      </div>
    </section>
    
    <!-- Target Language Section -->
    <section class="language-section target-section">
      <div class="language-label" :data-language="entry.targetLanguage">
        {{ getTargetLanguageLabel }}
      </div>
      <div class="target-word" :data-word="entry.targetWord">
        {{ entry.targetWord }}
      </div>
    </section>
    
    <!-- Examples Section (Conditional) -->
    <section 
      v-if="entry.examples?.length" 
      class="example-section"
      role="region"
      aria-label="Ejemplos de uso"
    >
      <div class="example-label">Ejemplo</div>
      <div class="examples-list">
        <div 
          v-for="(example, index) in entry.examples" 
          :key="`example-${index}`"
          class="example-pair"
          :data-index="index"
        >
          <div class="example-source" :lang="getSourceLanguageCode">
            "{{ example.source }}"
          </div>
          <div class="example-target" :lang="getTargetLanguageCode">
            "{{ example.target }}"
          </div>
        </div>
      </div>
    </section>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { TranslationResult, TranslationDirection } from '@/types/dictionary'

interface Props {
  entry: TranslationResult
  translationDirection: TranslationDirection
}

const props = defineProps<Props>()

// Computed properties for dynamic language labels
const getSourceLanguageLabel = computed(() => {
  return props.translationDirection === 'spanish-to-ndowe' ? 'Español' : 'Ndowe'
})

const getTargetLanguageLabel = computed(() => {
  return props.translationDirection === 'spanish-to-ndowe' ? 'Ndowe' : 'Español'
})

// Language codes for accessibility (lang attribute)
const getSourceLanguageCode = computed(() => {
  return props.translationDirection === 'spanish-to-ndowe' ? 'es' : 'nd'
})

const getTargetLanguageCode = computed(() => {
  return props.translationDirection === 'spanish-to-ndowe' ? 'nd' : 'es'
})
</script>

<style scoped>
.result-card {
  background: var(--color-card-bg);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-sm);
  padding: var(--space-12); /* 48px - matches spec exactly */
  margin-bottom: var(--space-6); /* 24px - matches spec exactly */
  transition: all var(--transition-normal) var(--ease-in-out);
  border: 1px solid var(--color-border);
  position: relative;
  overflow: hidden;
}

.result-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--color-border-focus);
}

.result-card:focus-within {
  outline: 2px solid var(--color-border-focus);
  outline-offset: 2px;
}

/* Language Sections */
.language-section {
  margin-bottom: var(--space-8); /* 32px gap between sections - matches spec */
}

.language-section:last-of-type {
  margin-bottom: var(--space-8); /* Maintain spacing before examples */
}

.language-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: var(--space-3); /* 12px */
  font-family: var(--font-family-base);
  line-height: var(--line-height-tight);
}

.source-word {
  font-size: var(--font-size-lg); /* Smaller: 18px-20px instead of 24px-32px */
  font-weight: var(--font-weight-medium); /* Medium weight instead of semibold */
  color: var(--color-secondary); /* Red color for search term */
  line-height: var(--line-height-tight);
  margin-bottom: 0;
  font-family: var(--font-family-base);
  word-break: break-word;
  hyphens: auto;
}

.target-word {
  font-size: var(--font-size-2xl); /* Bigger: 24px-32px instead of 20px-24px */
  font-weight: var(--font-weight-semibold); /* Semibold weight for emphasis */
  color: var(--color-text); /* Black color for translation */
  line-height: var(--line-height-tight);
  margin-bottom: 0;
  font-family: var(--font-family-base);
  word-break: break-word;
  hyphens: auto;
}

/* Examples Section */
.example-section {
  background: var(--color-background);
  padding: var(--space-6); /* 24px */
  border-radius: var(--border-radius);
  border-left: 3px solid var(--color-secondary);
  margin-top: var(--space-8); /* 32px gap from language sections */
}

.example-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: var(--space-4); /* 16px */
  font-family: var(--font-family-base);
  line-height: var(--line-height-tight);
}

.examples-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3); /* 12px between example pairs */
}

.example-pair {
  display: flex;
  flex-direction: column;
  gap: var(--space-2); /* 8px between source and target */
}

.example-source {
  font-size: var(--font-size-base);
  color: var(--color-text);
  line-height: var(--line-height-normal);
  font-family: var(--font-family-base);
  word-break: break-word;
  hyphens: auto;
}

.example-target {
  font-size: var(--font-size-base);
  color: var(--color-text-muted);
  font-style: italic;
  line-height: var(--line-height-normal);
  margin-bottom: 0;
  font-family: var(--font-family-base);
  word-break: break-word;
  hyphens: auto;
}

/* Responsive Design */
@media (max-width: 768px) {
  .result-card {
    padding: var(--space-8); /* 32px on mobile */
    margin-bottom: var(--space-4); /* 16px on mobile */
  }
  
  .language-section {
    margin-bottom: var(--space-6); /* 24px on mobile */
  }
  
  .language-section:last-of-type {
    margin-bottom: var(--space-6); /* 24px on mobile */
  }
  
  .example-section {
    margin-top: var(--space-6); /* 24px on mobile */
    padding: var(--space-4); /* 16px on mobile */
  }
  
  .source-word {
    font-size: var(--font-size-base); /* Slightly smaller on mobile but still smaller than target */
  }
  
  .target-word {
    font-size: var(--font-size-xl); /* Slightly smaller on mobile but still bigger than source */
  }
}

@media (max-width: 480px) {
  .result-card {
    padding: var(--space-6); /* 24px on small mobile */
  }
  
  .language-section {
    margin-bottom: var(--space-4); /* 16px on small mobile */
  }
  
  .example-section {
    margin-top: var(--space-4); /* 16px on small mobile */
    padding: var(--space-3); /* 12px on small mobile */
  }
  
  /* Maintain visual hierarchy on small mobile */
  .source-word {
    font-size: var(--font-size-sm); /* Even smaller on small mobile */
  }
  
  .target-word {
    font-size: var(--font-size-lg); /* Still bigger than source on small mobile */
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .result-card {
    border-width: 2px;
  }
  
  .example-section {
    border-left-width: 4px;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .result-card {
    transition: none;
  }
  
  .result-card:hover {
    transform: none;
  }
}

/* Print styles */
@media print {
  .result-card {
    box-shadow: none;
    border: 1px solid #000;
    break-inside: avoid;
    page-break-inside: avoid;
  }
  
  .result-card:hover {
    transform: none;
  }
}
</style>
