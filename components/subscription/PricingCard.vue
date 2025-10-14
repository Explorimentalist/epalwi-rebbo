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
    
    <!-- Plan CTA - Design System V2 -->
    <div class="plan-cta">
      <ButtonV2
        :variant="plan.popular ? 'primary' : 'secondary'"
        size="lg"
        :loading="loading"
        :disabled="disabled"
        full-width
        @click="handlePlanSelection"
      >
        {{ ctaText }}
      </ButtonV2>
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
  /* Design System V2 - Modern card styling */
  background: white;
  border: 1px solid var(--ds-border);
  border-radius: var(--ds-radius-2xl);
  padding: var(--ds-spacing-2); /* 2rem = 32px */
  transition: all var(--ds-duration) var(--ds-ease);
  position: relative;
  box-shadow: var(--ds-shadow-sm);
  
  /* Vertical layout on all screen sizes */
  display: flex;
  flex-direction: column;
  height: 100%; /* Ensure full height for space-between to work */
  justify-content: space-between; /* Push button to bottom */
  gap: var(--ds-spacing-1); /* 1rem = 16px between sections */
  
  &:hover {
    border-color: var(--ds-primary);
    box-shadow: var(--ds-shadow-2xl);
  }
  
  &.selected {
    border-color: var(--ds-primary);
    background: white;
    box-shadow: var(--ds-shadow-lg);
    
    /* Add a subtle glow effect for selected state */
    &::before {
      content: '';
      position: absolute;
      top: -2px;
      left: -2px;
      right: -2px;
      bottom: -2px;
      background: linear-gradient(45deg, var(--ds-primary), var(--ds-accent));
      border-radius: var(--ds-radius-2xl);
      z-index: -1;
      opacity: 0.1;
    }
  }
  
  .plan-header {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    
    .plan-title {
      font-size: 1.25rem; /* 20px */
      font-weight: var(--ds-font-weight-semibold);
      color: var(--ds-foreground);
      text-align: left;
      
      .popular-badge {
        background: var(--ds-secondary);
        color: var(--ds-secondary-foreground);
        font-size: 0.75rem; /* 12px */
        padding: var(--ds-spacing-025) var(--ds-spacing-1);
        border-radius: var(--ds-radius-md);
        margin-left: var(--ds-spacing-1);
      }
    }
  }
  
  .plan-pricing {
    display: flex;
    align-items: baseline;
    gap: var(--ds-spacing-025);
    
    .price {
      font-size: 2rem; /* 32px */
      font-weight: var(--ds-font-weight-bold);
      color: var(--ds-foreground);
      line-height: 1;
    }
    
    .period {
      font-size: 0.875rem; /* 14px */
      color: var(--ds-muted-foreground);
    }
    
    .savings {
      background: var(--ds-accent);
      color: var(--ds-accent-foreground);
      font-size: 0.75rem; /* 12px */
      padding: var(--ds-spacing-025) var(--ds-spacing-1);
      border-radius: var(--ds-radius-md);
      margin-left: var(--ds-spacing-1);
    }
  }
  
  .plan-features {
    list-style: none;
    padding: 0;
    margin: 0;
    
    .feature-item {
      display: flex;
      align-items: center;
      gap: var(--ds-spacing-05);
      margin-bottom: var(--ds-spacing-1);
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .checkmark {
        width: 16px;
        height: 16px;
        color: var(--ds-accent);
        flex-shrink: 0;
      }
      
      .feature-text {
        font-size: 1rem; /* 16px */
        color: var(--ds-foreground);
        line-height: var(--ds-line-height-normal);
      }
    }
  }
  
  .plan-cta {
    width: 100%;
    margin-top: auto;
  }
}

</style>
