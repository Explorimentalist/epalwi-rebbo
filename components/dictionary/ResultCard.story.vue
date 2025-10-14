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
  background: var(--ds-background);
  min-height: 100vh;
  padding: var(--ds-spacing-6);
}

.story-layout {
  max-width: 600px;
  margin: 0 auto;
}

.responsive-demo {
  max-width: 800px;
}

.size-label {
  font-size: 0.875rem;
  font-weight: var(--ds-font-weight-medium);
  color: var(--ds-muted-foreground);
  margin: var(--ds-spacing-4) 0 var(--ds-spacing-2) 0;
  padding: var(--ds-spacing-2) var(--ds-spacing-3);
  background: var(--ds-card);
  border-radius: var(--ds-radius);
  border: 1px solid var(--ds-border);
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
  background: var(--ds-card);
  padding: var(--ds-spacing-6);
  border-radius: var(--ds-radius);
  border: 1px solid var(--ds-border);
  margin-bottom: var(--ds-spacing-6);
}

.accessibility-info h3 {
  font-size: 1.125rem;
  font-weight: var(--ds-font-weight-semibold);
  color: var(--ds-foreground);
  margin-bottom: var(--ds-spacing-4);
}

.accessibility-info ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.accessibility-info li {
  padding: var(--ds-spacing-2) 0;
  font-size: 0.875rem;
  color: var(--ds-foreground);
  border-bottom: 1px solid var(--ds-border);
}

.accessibility-info li:last-child {
  border-bottom: none;
}

/* Focus styles for accessibility demo */
.result-card:focus-visible {
  outline: 3px solid var(--ds-ring);
  outline-offset: 4px;
}
</style>
