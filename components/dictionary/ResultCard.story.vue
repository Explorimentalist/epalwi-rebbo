<template>
  <div class="story-container">
    <Story title="Dictionary/ResultCard" :layout="{ type: 'padded' }">
      <Variant title="Spanish to Ndowe Translation">
        <div class="story-layout">
          <ResultCard
            :entry="spanishToNdoweEntry"
            translation-direction="spanish-to-ndowe"
          />
        </div>
      </Variant>

      <Variant title="Ndowe to Spanish Translation">
        <div class="story-layout">
          <ResultCard
            :entry="ndoweToSpanishEntry"
            translation-direction="ndowe-to-spanish"
          />
        </div>
      </Variant>

      <Variant title="With Multiple Examples">
        <div class="story-layout">
          <ResultCard
            :entry="multipleExamplesEntry"
            translation-direction="spanish-to-ndowe"
          />
        </div>
      </Variant>

      <Variant title="Without Examples">
        <div class="story-layout">
          <ResultCard
            :entry="noExamplesEntry"
            translation-direction="spanish-to-ndowe"
          />
        </div>
      </Variant>

      <Variant title="Long Words">
        <div class="story-layout">
          <ResultCard
            :entry="longWordsEntry"
            translation-direction="spanish-to-ndowe"
          />
        </div>
      </Variant>

      <Variant title="Responsive Behavior">
        <div class="story-layout responsive-demo">
          <div class="size-label">Desktop (≥768px)</div>
          <ResultCard
            :entry="spanishToNdoweEntry"
            translation-direction="spanish-to-ndowe"
            class="desktop-size"
          />
          
          <div class="size-label">Mobile (≤768px)</div>
          <ResultCard
            :entry="spanishToNdoweEntry"
            translation-direction="spanish-to-ndowe"
            class="mobile-size"
          />
          
          <div class="size-label">Small Mobile (≤480px)</div>
          <ResultCard
            :entry="spanishToNdoweEntry"
            translation-direction="spanish-to-ndowe"
            class="small-mobile-size"
          />
        </div>
      </Variant>

      <Variant title="Accessibility Features">
        <div class="story-layout">
          <div class="accessibility-info">
            <h3>Accessibility Features Demonstrated:</h3>
            <ul>
              <li>✅ Semantic HTML with &lt;article&gt; and &lt;section&gt; tags</li>
              <li>✅ Proper ARIA labels and roles</li>
              <li>✅ Language attributes for screen readers</li>
              <li>✅ Focus management and keyboard navigation</li>
              <li>✅ High contrast mode support</li>
              <li>✅ Reduced motion support</li>
            </ul>
          </div>
          
          <ResultCard
            :entry="spanishToNdoweEntry"
            translation-direction="spanish-to-ndowe"
            tabindex="0"
          />
        </div>
      </Variant>
    </Story>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ResultCard from './ResultCard.vue'
import type { TranslationResult } from '@/types/dictionary'

// Sample data for different scenarios
const spanishToNdoweEntry: TranslationResult = {
  id: '1',
  sourceWord: 'casa',
  targetWord: 'mbaddi',
  sourceLanguage: 'español',
  targetLanguage: 'ndowe',
  examples: [
    {
      source: 'Mi casa es grande',
      target: 'Am ndáála e woka'
    }
  ]
}

const ndoweToSpanishEntry: TranslationResult = {
  id: '2',
  sourceWord: 'mbaddi',
  targetWord: 'casa',
  sourceLanguage: 'ndowe',
  targetLanguage: 'español',
  examples: [
    {
      source: 'Am ndáála e woka',
      target: 'Mi casa es grande'
    }
  ]
}

const multipleExamplesEntry: TranslationResult = {
  id: '3',
  sourceWord: 'amigo',
  targetWord: 'amigo',
  sourceLanguage: 'español',
  targetLanguage: 'ndowe',
  examples: [
    {
      source: 'Mi mejor amigo',
      target: 'Am amigo e woka'
    },
    {
      source: 'Los amigos son importantes',
      target: 'Amigos e woka e woka'
    },
    {
      source: 'Hacer amigos nuevos',
      target: 'Woka amigo e woka'
    }
  ]
}

const noExamplesEntry: TranslationResult = {
  id: '4',
  sourceWord: 'libro',
  targetWord: 'libro',
  sourceLanguage: 'español',
  targetLanguage: 'ndowe'
}

const longWordsEntry: TranslationResult = {
  id: '5',
  sourceWord: 'supercalifragilisticexpialidocious',
  targetWord: 'supercalifragilisticexpialidocious',
  sourceLanguage: 'español',
  targetLanguage: 'ndowe',
  examples: [
    {
      source: 'That word is supercalifragilisticexpialidocious',
      target: 'Ese palabra e supercalifragilisticexpialidocious'
    }
  ]
}
</script>

<style scoped>
.story-container {
  background: var(--color-background);
  min-height: 100vh;
  padding: var(--space-6);
}

.story-layout {
  max-width: 600px;
  margin: 0 auto;
}

.responsive-demo {
  max-width: 800px;
}

.size-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-muted);
  margin: var(--space-4) 0 var(--space-2) 0;
  padding: var(--space-2) var(--space-3);
  background: var(--color-primary);
  border-radius: var(--border-radius);
  border: 1px solid var(--color-border);
}

/* Responsive size demonstrations */
.desktop-size {
  /* Default size - no changes needed */
}

.mobile-size {
  max-width: 400px;
  margin: 0 auto;
}

.small-mobile-size {
  max-width: 300px;
  margin: 0 auto;
}

.accessibility-info {
  background: var(--color-primary);
  padding: var(--space-6);
  border-radius: var(--border-radius);
  border: 1px solid var(--color-border);
  margin-bottom: var(--space-6);
}

.accessibility-info h3 {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
  margin-bottom: var(--space-4);
}

.accessibility-info ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.accessibility-info li {
  padding: var(--space-2) 0;
  font-size: var(--font-size-sm);
  color: var(--color-text);
  border-bottom: 1px solid var(--color-border);
}

.accessibility-info li:last-child {
  border-bottom: none;
}

/* Focus styles for accessibility demo */
.result-card:focus-visible {
  outline: 3px solid var(--color-border-focus);
  outline-offset: 4px;
}
</style>
