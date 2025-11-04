<template>
  <div class="sugerencias-page">
    <nav-bar />
    
    <div class="ds-container">
      <div class="page-header">
        <h1 class="ds-text-display-lg">Sugerencias</h1>
        <p class="ds-text-body" style="color: var(--ds-muted-foreground);">
          Comparte tus comentarios y sugerencias para mejorar epàlwi-rèbbo
        </p>
      </div>
      
      <div class="feedback-content">
        <form @submit.prevent="submitFeedback" class="ds-card">
          <!-- Emoji Selection -->
          <div class="form-group">
            <label for="satisfaction" class="ds-form-label">
              ¿Cómo calificarías tu experiencia?
            </label>
            <div class="emoji-selection">
              <button
                v-for="emoji in satisfactionEmojis"
                :key="emoji.value"
                type="button"
                @click="selectedSatisfaction = emoji.value"
                :class="[
                  'emoji-btn',
                  { 'selected': selectedSatisfaction === emoji.value }
                ]"
                :title="emoji.label"
              >
                {{ emoji.emoji }}
              </button>
            </div>
          </div>

          <!-- Feedback Text -->
          <div class="form-group">
            <label for="feedback" class="ds-form-label">
              Cuéntanos más detalles
            </label>
            <textarea
              id="feedback"
              v-model="feedbackText"
              placeholder="Describe tu experiencia, problemas encontrados, o sugerencias para mejorar..."
              class="ds-form-input"
              rows="6"
              required
            ></textarea>
          </div>

          <!-- Submit Button -->
          <div class="form-actions">
            <button 
              type="submit" 
              :disabled="isSubmitting || !selectedSatisfaction || !feedbackText.trim()"
              class="ds-btn-primary"
            >
              <Icon v-if="isSubmitting" name="loader" size="sm" class="animate-spin mr-2" />
              {{ isSubmitting ? 'Enviando...' : 'Enviar Sugerencia' }}
            </button>
          </div>
        </form>

        <!-- Success Message -->
        <div v-if="showSuccess" class="success-message">
          <Icon name="check-circle" size="md" class="text-green-600" />
          <h3>¡Gracias por tu sugerencia!</h3>
          <p>Hemos recibido tus comentarios y los revisaremos pronto.</p>
        </div>

        <!-- Error Message -->
        <div v-if="errorMessage" class="error-message">
          <Icon name="alert-circle" size="md" class="text-red-600" />
          <h3>Error al enviar</h3>
          <p>{{ errorMessage }}</p>
          <button @click="errorMessage = ''" class="ds-btn-primary ds-btn-sm">Intentar de nuevo</button>
        </div>
      </div>
    </div>
    
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

useHead({
  title: 'Sugerencias | epàlwi-rèbbo',
  meta: [
    { 
      name: 'description', 
      content: 'Comparte tus comentarios y sugerencias para mejorar epàlwi-rèbbo' 
    }
  ]
})

// Form state
const selectedSatisfaction = ref('')
const feedbackText = ref('')
const isSubmitting = ref(false)
const showSuccess = ref(false)
const errorMessage = ref('')

// Satisfaction emojis from satisfied to unsatisfied
const satisfactionEmojis = [
  { value: '5', emoji: '😄', label: 'Muy satisfecho' },
  { value: '4', emoji: '😊', label: 'Satisfecho' },
  { value: '3', emoji: '😐', label: 'Neutral' },
  { value: '2', emoji: '😕', label: 'Insatisfecho' },
  { value: '1', emoji: '😞', label: 'Muy insatisfecho' }
]

// Submit feedback
const submitFeedback = async () => {
  if (!selectedSatisfaction.value || !feedbackText.value.trim()) {
    return
  }

  isSubmitting.value = true
  errorMessage.value = ''

  try {
    const response = await $fetch('/api/feedback/submit', {
      method: 'POST',
      body: {
        satisfaction: selectedSatisfaction.value,
        feedback: feedbackText.value.trim(),
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
      }
    }) as { success: boolean; error?: string }

    if (response.success) {
      showSuccess.value = true
      selectedSatisfaction.value = ''
      feedbackText.value = ''
      
      // Hide success message after 5 seconds
      setTimeout(() => {
        showSuccess.value = false
      }, 5000)
    } else {
      throw new Error(response.error || 'Error desconocido')
    }
  } catch (error: any) {
    console.error('Error submitting feedback:', error)
    errorMessage.value = error.message || 'Ha ocurrido un error. Por favor, inténtalo de nuevo.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style lang="scss" scoped>
.sugerencias-page {
  min-height: 100vh;
  background: var(--ds-background);
}

.page-header {
  text-align: center;
  margin-bottom: var(--ds-spacing-3);
  padding: var(--ds-spacing-8) var(--ds-spacing-3) 0;
}

.feedback-content {
  max-width: var(--ds-width-40);
  margin: 0 auto;
}

.form-group {
  margin-bottom: var(--ds-spacing-2);
}

.emoji-selection {
  display: flex;
  gap: var(--ds-spacing-1);
  justify-content: center;
  flex-wrap: wrap;
  margin-top: var(--ds-spacing-1);
}

.emoji-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 4rem;
  height: 4rem;
  font-size: 1.5rem;
  border: 2px solid var(--ds-border);
  border-radius: var(--ds-radius-md);
  background: var(--ds-card);
  cursor: pointer;
  transition: all var(--ds-duration) var(--ds-ease);

  &:hover {
    border-color: var(--ds-primary);
    transform: scale(1.05);
    box-shadow: var(--ds-shadow-md);
  }

  &.selected {
    border-color: var(--ds-primary);
    background: var(--ds-primary);
    color: var(--ds-primary-foreground);
    transform: scale(1.1);
    box-shadow: var(--ds-shadow-lg);
  }
}

.form-actions {
  text-align: center;
  margin-top: var(--ds-spacing-2);
}

.success-message,
.error-message {
  background: var(--ds-card);
  border: 1px solid var(--ds-border);
  border-radius: var(--ds-radius-2xl);
  padding: var(--ds-spacing-2);
  text-align: center;
  margin-top: var(--ds-spacing-2);
  box-shadow: var(--ds-shadow-sm);

  h3 {
    font-family: var(--ds-font-sans);
    font-size: var(--ds-font-size-copy-18);
    font-weight: 600;
    color: var(--ds-foreground);
    margin: var(--ds-spacing-05) 0;
  }

  p {
    font-family: var(--ds-font-sans);
    font-size: var(--ds-font-size-copy-16);
    color: var(--ds-muted-foreground);
    margin-bottom: var(--ds-spacing-05);
  }
}

.success-message {
  border-color: #22c55e;
  background: #f0fdf4;

  h3 {
    color: #15803d;
  }
}

.error-message {
  border-color: #ef4444;
  background: #fef2f2;

  h3 {
    color: #dc2626;
  }
}


@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>