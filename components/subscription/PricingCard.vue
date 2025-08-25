<template>
  <div 
    class="pricing-card"
    :class="{ 
      selected: isSelected,
      'loading': loading 
    }"
  >
    <!-- Plan Header -->
    <div class="plan-header">
      <div class="plan-title">
        {{ plan.title }}
        <span v-if="plan.popular" class="popular-badge">
          Más Popular
        </span>
      </div>
    </div>
    
    <!-- Plan Pricing -->
    <div class="plan-pricing">
      <span class="price">€{{ plan.price }}</span>
      <span class="period">{{ plan.period }}</span>
      <span v-if="plan.savings" class="savings">
        Ahorras €{{ plan.savings }}
      </span>
    </div>
    
    <!-- Plan Features -->
    <ul class="plan-features">
      <li 
        v-for="feature in plan.features" 
        :key="feature"
        class="feature-item"
      >
        <Icon name="check" class="checkmark" />
        <span class="feature-text">{{ feature }}</span>
      </li>
    </ul>
    
    <!-- Plan CTA -->
    <div class="plan-cta">
      <button
        class="cta-button"
        :class="{ loading: loading }"
        :disabled="disabled || loading"
        @click="handlePlanSelection"
      >
        {{ ctaText }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface PlanFeature {
  id: string
  title: string
  price: number
  period: string
  features: string[]
  icon: string
  popular?: boolean
  savings?: number
  priceId: string
}

interface Props {
  plan: PlanFeature
  isSelected?: boolean
  loading?: boolean
  disabled?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'plan-selected': [plan: PlanFeature]
}>()

const ctaText = computed(() => {
  if (props.loading) return 'Procesando...'
  return `Elegir ${props.plan.title}`
})

const handlePlanSelection = () => {
  if (!props.loading && !props.disabled) {
    emit('plan-selected', props.plan)
  }
}
</script>

<style scoped>
.pricing-card {
  background: var(--color-primary);
  border: 2px solid var(--color-border);
  border-radius: var(--border-radius-lg);
  padding: var(--space-8); /* 24px */
  transition: all var(--transition-normal);
  position: relative;
  
  /* Vertical layout on all screen sizes */
  display: flex;
  flex-direction: column;
  height: 100%; /* Ensure full height for space-between to work */
  justify-content: space-between; /* Push button to bottom */
  gap: var(--space-6); /* 16px between sections */
  
  &:hover {
    border-color: var(--color-secondary);
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
  }
  
  &.selected {
    border-color: var(--color-secondary);
    background: var(--color-primary);
    
    /* Remove the pseudo-element that was creating the red background */
  }
  
  .plan-header {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    
    .plan-title {
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text);
      text-align: left;
      
      .popular-badge {
        background: var(--color-secondary);
        color: white;
        font-size: var(--font-size-xs);
        padding: var(--space-1) var(--space-3);
        border-radius: var(--border-radius);
        margin-left: var(--space-3);
      }
    }
  }
  
  .plan-pricing {
    display: flex;
    align-items: baseline;
    gap: var(--space-2); /* 4px between price and period */
    
    .price {
      font-size: var(--font-size-3xl);
      font-weight: var(--font-weight-bold);
      color: var(--color-text);
      line-height: 1;
    }
    
    .period {
      font-size: var(--font-size-sm);
      color: var(--color-text-muted);
    }
    
    .savings {
      background: var(--color-success);
      color: white;
      font-size: var(--font-size-xs);
      padding: var(--space-1) var(--space-3);
      border-radius: var(--border-radius);
      margin-left: var(--space-3);
    }
  }
  
  .plan-features {
    list-style: none;
    padding: 0;
    margin: 0;
    
    .feature-item {
      display: flex;
      align-items: center;
      gap: var(--space-3); /* 8px between checkmark and text */
      margin-bottom: var(--space-4); /* 16px between features */
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .checkmark {
        width: 16px;
        height: 16px;
        color: var(--color-success);
        flex-shrink: 0;
      }
      
      .feature-text {
        font-size: var(--font-size-base);
        color: var(--color-text);
        line-height: var(--line-height-normal);
      }
    }
  }
  
  .plan-cta {
    width: 100%;
    margin-top: auto; /* Push to bottom if space-between doesn't work */
    
    .cta-button {
      width: 100%;
      height: var(--space-11); /* 48px */
      background: #D45B41;
      color: white;
      border: none;
      border-radius: var(--border-radius);
      font-size: var(--font-size-base);
      font-weight: var(--font-weight-semibold);
      cursor: pointer;
      transition: all var(--transition-fast);
      
      &:hover:not(:disabled) {
        background: #B8412F;
        transform: translateY(-1px);
      }
      
      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
      
      &.loading {
        position: relative;
        color: transparent;
        
        &::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 20px;
          height: 20px;
          margin: -10px 0 0 -10px;
          border: 2px solid transparent;
          border-top-color: white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
      }
    }
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* CSS Variables for design system */
:root {
  --space-1: 2px;
  --space-2: 4px;
  --space-3: 8px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;
  --space-11: 48px;
  
  --color-primary: #FFFFFF;
  --color-secondary: #D45B41;
  --color-secondary-dark: #B8412F;
  --color-text: #333333;
  --color-text-muted: #6B7280;
  --color-border: #E5E7EB;
  --color-success: #257940;
  
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-3xl: 1.875rem;
  
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
  
  --line-height-normal: 1.5;
  
  --border-radius: 8px;
  --border-radius-lg: 12px;
  
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  
  --transition-fast: 0.15s ease-in-out;
  --transition-normal: 0.3s ease-in-out;
}
</style>
