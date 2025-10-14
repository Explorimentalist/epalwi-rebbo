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
  background: var(--ds-card);
  border-radius: var(--ds-radius-lg);
  box-shadow: var(--ds-shadow-sm);
  padding: var(--ds-spacing-5); /* 48px - matches spec exactly */
  margin-bottom: var(--ds-spacing-2); /* 24px - matches spec exactly */
  transition: all var(--ds-duration) var(--ds-ease);
  border: 1px solid var(--ds-border);
  position: relative;
  overflow: hidden;
}

.result-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--ds-shadow-md);
  border-color: var(--ds-ring);
}

.result-card:focus-within {
  outline: 2px solid var(--ds-ring);
  outline-offset: 2px;
}

/* Language Sections */
.language-section {
  margin-bottom: var(--ds-spacing-3); /* 32px gap between sections - matches spec */
}

.language-section:last-of-type {
  margin-bottom: var(--ds-spacing-3); /* Maintain spacing before examples */
}

.language-label {
  font-size: 0.875rem;
  font-weight: var(--ds-font-weight-medium);
  color: var(--ds-muted-foreground);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: var(--ds-spacing-05); /* 12px */
  font-family: var(--ds-font-sans);
  line-height: var(--ds-line-height-tight);
}

.source-word {
  font-size: 1.125rem; /* Smaller: 18px-20px instead of 24px-32px */
  font-weight: var(--ds-font-weight-medium); /* Medium weight instead of semibold */
  color: var(--ds-primary); /* Red color for search term */
  line-height: var(--ds-line-height-tight);
  margin-bottom: 0;
  font-family: var(--ds-font-sans);
  word-break: break-word;
  hyphens: auto;
}

.target-word {
  font-size: 1.5rem; /* Bigger: 24px-32px instead of 20px-24px */
  font-weight: var(--ds-font-weight-semibold); /* Semibold weight for emphasis */
  color: var(--ds-foreground); /* Black color for translation */
  line-height: var(--ds-line-height-tight);
  margin-bottom: 0;
  font-family: var(--ds-font-sans);
  word-break: break-word;
  hyphens: auto;
}

/* Examples Section */
.example-section {
  background: var(--ds-background);
  padding: var(--ds-spacing-2); /* 24px */
  border-radius: var(--ds-radius);
  border-left: 3px solid var(--ds-primary);
  margin-top: var(--ds-spacing-3); /* 32px gap from language sections */
}

.example-label {
  font-size: 0.875rem;
  font-weight: var(--ds-font-weight-medium);
  color: var(--ds-muted-foreground);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: var(--ds-spacing-1); /* 16px */
  font-family: var(--ds-font-sans);
  line-height: var(--ds-line-height-tight);
}

.examples-list {
  display: flex;
  flex-direction: column;
  gap: var(--ds-spacing-05); /* 12px between example pairs */
}

.example-pair {
  display: flex;
  flex-direction: column;
  gap: var(--ds-spacing-025); /* 8px between source and target */
}

.example-source {
  font-size: 1rem;
  color: var(--ds-foreground);
  line-height: var(--ds-line-height-normal);
  font-family: var(--ds-font-sans);
  word-break: break-word;
  hyphens: auto;
}

.example-target {
  font-size: 1rem;
  color: var(--ds-muted-foreground);
  font-style: italic;
  line-height: var(--ds-line-height-normal);
  margin-bottom: 0;
  font-family: var(--ds-font-sans);
  word-break: break-word;
  hyphens: auto;
}

/* Responsive Design */
@media (max-width: 768px) {
  .result-card {
    padding: var(--ds-spacing-3); /* 32px on mobile */
    margin-bottom: var(--ds-spacing-1); /* 16px on mobile */
  }
  
  .language-section {
    margin-bottom: var(--ds-spacing-2); /* 24px on mobile */
  }
  
  .language-section:last-of-type {
    margin-bottom: var(--ds-spacing-2); /* 24px on mobile */
  }
  
  .example-section {
    margin-top: var(--ds-spacing-2); /* 24px on mobile */
    padding: var(--ds-spacing-1); /* 16px on mobile */
  }
  
  .source-word {
    font-size: 1rem; /* Slightly smaller on mobile but still smaller than target */
  }
  
  .target-word {
    font-size: 1.25rem; /* Slightly smaller on mobile but still bigger than source */
  }
}

@media (max-width: 480px) {
  .result-card {
    padding: var(--ds-spacing-2); /* 24px on small mobile */
  }
  
  .language-section {
    margin-bottom: var(--ds-spacing-1); /* 16px on small mobile */
  }
  
  .example-section {
    margin-top: var(--ds-spacing-1); /* 16px on small mobile */
    padding: var(--ds-spacing-05); /* 12px on small mobile */
  }
  
  /* Maintain visual hierarchy on small mobile */
  .source-word {
    font-size: 0.875rem; /* Even smaller on small mobile */
  }
  
  .target-word {
    font-size: 1.125rem; /* Still bigger than source on small mobile */
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
