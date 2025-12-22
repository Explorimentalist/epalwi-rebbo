<template>
  <section class="how-it-works">
    <div class="how-container">
      <h2 class="ds-text-display-sm">
        {{ title }}
      </h2>
      
      <ol class="steps-list" role="list">
        <li 
          v-for="(step, index) in steps" 
          :key="index"
          class="step-item"
          :style="{ animationDelay: `${index * 0.15}s` }"
        >
          <span class="step-number" :aria-label="`Paso ${index + 1}`">
            {{ index + 1 }}
          </span>
          <span class="step-text">{{ step }}</span>
        </li>
      </ol>
    </div>
  </section>
</template>

<script setup lang="ts">
interface Props {
  title?: string
  steps?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Cómo Funciona',
  steps: () => [
    'Apreta al boton "Iniciar Sesión".',
    'Ve a la pestaña "Diccionario".',
    'Elige de qué idioma a qué idioma traducir.',
    'Introduce tu palabra.',
    'Lee, aprende y disfruta.'
  ]
})
</script>

<style lang="scss" scoped>
.how-it-works {
  padding: var(--ds-spacing-10) var(--ds-spacing-2);
  background: #ffffff;
  
  .how-container {
    max-width: 1200px;
    margin: 0 auto;
  }
  
  .steps-list {
    width: 100%;
    margin: 0;
    list-style: none;
    padding: 0;
    counter-reset: step-counter;
    
    .step-item {
      box-sizing: border-box;
      display: flex;
      flex-direction: row;
      align-items: center;
      padding: 16px 32px;
      gap: 34px;
      position: relative;
      width: 100%;
      height: 94px;
      border-bottom: 2px solid #D45B41;
      animation: fadeInUp 0.8s var(--ds-ease) both;
      transition: transform var(--ds-duration) var(--ds-ease);
      cursor: pointer;
      overflow: hidden;
      
      &::before {
        content: '';
        position: absolute;
        top: 100%;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: #D45B41;
        transition: top 0.2s cubic-bezier(0, 0.83, 0.32, 1);
        z-index: 1;
      }
      
      &:last-child {
        border-bottom: none;
      }
      
      .step-number {
        flex: none;
        order: 0;
        flex-grow: 0;
        width: auto;
        height: auto;
        font-family: 'Geist', var(--ds-font-sans);
        font-style: normal;
        font-weight: 400;
        font-size: var(--ds-font-size-xs);
        line-height: 1.2;
        text-align: center;
        color: #D45B41;
        background: none;
        border-radius: 0;
        box-shadow: none;
        transition: color 0.2s cubic-bezier(0, 0.83, 0.32, 1);
        position: relative;
        z-index: 2;
        display: flex;
        align-items: center;
        min-width: 20px;
      }
      
      .step-text {
        flex: none;
        order: 1;
        flex-grow: 0;
        height: auto;
        font-family: 'Geist', var(--ds-font-sans);
        font-style: normal;
        font-weight: 400;
        font-size: var(--ds-font-size-xs);
        line-height: 1.2;
        text-align: left;
        color: #D45B41;
        margin-top: 0;
        display: flex;
        align-items: center;
        transition: color 0.2s cubic-bezier(0, 0.83, 0.32, 1);
        position: relative;
        z-index: 2;
      }
      
      &:hover {
        transform: translateX(4px);
        
        &::before {
          top: 0;
        }
        
        .step-number {
          color: #ffffff;
        }
        
        .step-text {
          color: #ffffff;
        }
      }
    }
  }
}

/* Responsive Design */
@media (max-width: 767px) {
  .how-it-works {
    padding: var(--ds-spacing-8) var(--ds-spacing-2);
    
    .steps-list {
      .step-item {
        padding: 12px 16px;
        gap: 20px;
        height: auto;
        min-height: 70px;
        align-items: flex-start;
        
        .step-number {
          font-size: 28px;
          line-height: 40px;
          height: auto;
          width: auto;
          margin-top: 4px;
          align-self: flex-start;
        }
        
        .step-text {
          font-size: 28px;
          line-height: 40px;
          height: auto;
          flex: 1;
          white-space: normal;
          word-wrap: break-word;
          overflow-wrap: break-word;
        }
        
        &:hover {
          transform: translateX(2px);
          
          .step-number,
          .step-text {
            color: #ffffff;
          }
        }
      }
    }
  }
}

@media (max-width: 479px) {
  .how-it-works {
    .steps-list {
      .step-item {
        padding: 8px 12px;
        gap: 16px;
        height: auto;
        min-height: 60px;
        align-items: flex-start;
        
        .step-number {
          font-size: 24px;
          line-height: 36px;
          height: auto;
          width: auto;
          margin-top: 2px;
          align-self: flex-start;
        }
        
        .step-text {
          font-size: 24px;
          line-height: 36px;
          height: auto;
          flex: 1;
          white-space: normal;
          word-wrap: break-word;
          overflow-wrap: break-word;
        }
      }
    }
  }
}

/* Animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .section-title,
  .step-item {
    animation: none !important;
  }
  
  .step-item:hover {
    transform: none !important;
    
    &::before {
      transition: none !important;
    }
  }
  
  .step-item::before {
    transition: none !important;
  }
}
</style>