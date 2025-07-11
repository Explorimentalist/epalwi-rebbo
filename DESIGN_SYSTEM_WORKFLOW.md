# 🎯 Design System Implementation Workflow
## Zero-Ambiguity Component Development Guide

## **📏 4px Spacing System - Industry Standard**

Our design system uses a **4px base spacing system** following modern industry best practices:

- **Base Unit:** 4px provides granular control and works perfectly with 1.5x resolution devices
- **Scale:** 0, 4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60, 64, 68, 72, 76, 80, 84, 88, 92, 96px
- **Usage:** `var(--space-0)` through `var(--space-24)` for complete flexibility
- **Benefits:** More granular control, no half-pixel rendering issues, aligns with modern design tools

**Key Mappings:**
- `--space-0`: 0px (perfect for resets)
- `--space-1`: 4px (base unit for fine spacing)
- `--space-2`: 8px (small gaps)
- `--space-3`: 12px (compact spacing)
- `--space-4`: 16px (standard padding)
- `--space-6`: 24px (medium spacing)
- `--space-8`: 32px (larger gaps)
- `--space-12`: 48px (component heights)
- `--space-16`: 64px (section spacing)
- `--space-20`: 80px (page-level spacing)

## **🚀 Development Process (Follow This Exactly)**

### **Step 1: Reference Component Specification**
Before writing any code, always check `components-specification.md` for:
- ✅ **Exact ASCII layout**
- ✅ **Precise dimensions** 
- ✅ **Required CSS classes**
- ✅ **Interactive states**

### **Step 2: Use Design System Composable**
```vue
<script setup lang="ts">
import { useDesignSystem } from '~/composables/useDesignSystem'

const { buttonClasses, getSpacing, componentSpecs } = useDesignSystem()
</script>
```

### **Step 3: Apply Exact Specifications**
```vue
<template>
  <!-- ❌ WRONG: Arbitrary dimensions -->
  <div class="search-container" style="height: 50px; padding: 15px;">
  
  <!-- ✅ CORRECT: Design system specifications -->
  <div class="search-box" :style="{ height: componentSpecs.searchBox.height }">
</template>
```

---

## **📋 Component Implementation Checklist**

For **EVERY** component, verify:

### **🎨 Visual Implementation:**
- [ ] **Exact height** matches ASCII spec
- [ ] **Precise padding/margins** using `var(--space-X)`
- [ ] **Correct border-radius** using design tokens
- [ ] **Proper shadows** using `var(--shadow-X)`
- [ ] **Consistent font sizes** using `var(--font-size-X)`

### **⚡ Interactive Behavior:**
- [ ] **Hover states** using `.interactive` class
- [ ] **Focus states** with proper outline
- [ ] **Loading states** using `.loading` class
- [ ] **Disabled states** with correct opacity
- [ ] **Touch targets** minimum 44px for mobile

### **🎯 Implementation Quality:**
- [ ] **No magic numbers** in CSS (always use variables)
- [ ] **Responsive behavior** following breakpoint system
- [ ] **Accessibility compliance** (WCAG 2.1)
- [ ] **TypeScript interfaces** for all props
- [ ] **Error handling** for all states

---

## **🔧 Real Component Examples**

### **Example 1: SearchBox Implementation**

#### ❌ **WRONG Implementation:**
```vue
<template>
  <div class="search-container">
    <input 
      type="text" 
      placeholder="Search..." 
      style="height: 45px; padding: 10px 40px 10px 50px;"
    />
    <div class="icon" style="left: 15px;">🔍</div>
  </div>
</template>
```

#### ✅ **CORRECT Implementation:**
```vue
<template>
  <div class="search-box">
    <input 
      v-model="query"
      class="search-input"
      type="text" 
      :placeholder="placeholder"
      @input="onInput"
      @focus="onFocus"
    />
    <div class="search-icon">
      <Icon name="search" :size="20" />
    </div>
    <button 
      v-if="query" 
      class="clear-button interactive"
      @click="clearSearch"
    >
      <Icon name="x" :size="16" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { useDesignSystem } from '~/composables/useDesignSystem'

interface Props {
  placeholder: string
  modelValue: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: string]
  'search': [query: string]
}>()

const { componentSpecs } = useDesignSystem()

const query = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const onInput = () => {
  emit('search', query.value)
}

const clearSearch = () => {
  query.value = ''
  emit('search', '')
}
</script>

<style scoped>
.search-box {
  position: relative;
  height: v-bind('componentSpecs.searchBox.height');
  
  .search-input {
    width: 100%;
    height: 100%;
    padding: 0 40px 0 48px;
    border: 1px solid var(--color-border);
    border-radius: var(--border-radius);
    font-size: var(--font-size-base);
    background: var(--color-input-bg);
    transition: border-color var(--transition-normal);
    
    &::placeholder {
      color: var(--color-text-light);
    }
    
    &:focus {
      outline: none;
      border-color: var(--color-border-focus);
      box-shadow: 0 0 0 3px rgba(212, 91, 65, 0.1);
    }
  }
  
  .search-icon {
    position: absolute;
    left: v-bind('componentSpecs.searchBox.iconPosition');
    top: 50%;
    transform: translateY(-50%);
    color: var(--color-text-light);
    pointer-events: none;
  }
  
  .clear-button {
    position: absolute;
    right: v-bind('componentSpecs.searchBox.clearButtonPosition');
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: var(--color-text-light);
    cursor: pointer;
    padding: var(--space-1);
    border-radius: var(--border-radius-sm);
    
    &:hover {
      color: var(--color-text);
      background: var(--color-background);
    }
  }
}
</style>
```

### **Example 2: Button Implementation**

#### ❌ **WRONG Implementation:**
```vue
<template>
  <button class="my-button" @click="onClick">
    {{ label }}
  </button>
</template>

<style>
.my-button {
  padding: 10px 20px;
  background: #D45B41;
  color: white;
  border: none;
  border-radius: 6px;
}
</style>
```

#### ✅ **CORRECT Implementation:**
```vue
<template>
  <button 
    :class="buttonClasses(variant, size)"
    :disabled="disabled || loading"
    @click="onClick"
  >
    <span v-if="!loading">{{ label }}</span>
  </button>
</template>

<script setup lang="ts">
import { useDesignSystem } from '~/composables/useDesignSystem'

interface Props {
  label: string
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'small' | 'medium' | 'large'
  loading?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'medium',
  loading: false,
  disabled: false
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const { buttonClasses } = useDesignSystem()

const onClick = (event: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>
```

---

## **⚠️ Common Mistakes to Avoid**

### **1. Using Magic Numbers**
```scss
// ❌ WRONG
.component {
  padding: 24px;
  margin: 16px;
  height: 48px;
}

// ✅ CORRECT  
.component {
  padding: var(--space-6);
  margin: var(--space-4);
  height: var(--space-12);
}
```

### **2. Inconsistent Interactive States**
```scss
// ❌ WRONG
.button:hover {
  background: #C04132; /* arbitrary color */
  transform: scale(1.05); /* arbitrary scale */
}

// ✅ CORRECT
.button {
  @extend .interactive; /* Uses design system states */
}
```

### **3. Missing Accessibility**
```vue
<!-- ❌ WRONG -->
<div @click="toggleMenu">Menu</div>

<!-- ✅ CORRECT -->
<button 
  class="menu-button interactive"
  :aria-expanded="isMenuOpen"
  @click="toggleMenu"
>
  Menu
</button>
```

### **4. Hardcoded Breakpoints**
```scss
// ❌ WRONG
@media (max-width: 768px) {
  .component { /* styles */ }
}

// ✅ CORRECT
@media (max-width: 640px) { /* Using design system breakpoints */
  .component { /* styles */ }
}
```

---

## **🎯 Validation Process**

Before marking a component complete:

### **1. Visual Validation:**
- [ ] Component matches ASCII layout exactly
- [ ] All dimensions use design system variables
- [ ] Interactive states work correctly
- [ ] Responsive behavior is consistent

### **2. Code Quality:**
- [ ] No hardcoded values in CSS
- [ ] TypeScript interfaces are complete
- [ ] Error handling is implemented
- [ ] Accessibility attributes are present

### **3. Testing:**
- [ ] All interactive states tested
- [ ] Mobile responsiveness verified
- [ ] Keyboard navigation works
- [ ] Screen reader compatibility checked

---

## **🔄 Design System Updates**

When updating the design system:

### **1. Update Core Variables:**
```scss
// assets/styles/_variables.scss
:root {
  --space-25: 100px; /* New spacing level */
}
```

### **2. Update Composable:**
```typescript
// composables/useDesignSystem.ts
const validateSpacing = (level: number): boolean => level >= 0 && level <= 24 // Updated range
```

### **3. Update Component Specs:**
```markdown
# components-specification.md
## New Component
- Height: 56px (--space-14)
- Padding: 20px (--space-5)
```

### **4. Verify All Components:**
- [ ] Run design system validation
- [ ] Update affected components
- [ ] Test visual consistency
- [ ] Update documentation

---

## **📊 Success Metrics**

### **Developer Experience:**
- ⚡ **Faster development** with pre-defined patterns
- 🎯 **Zero interpretation** needed for implementation
- 🔄 **Consistent results** across different developers
- 🚀 **Reduced debugging** time for UI issues

### **Design Consistency:**
- 📐 **Pixel-perfect** implementation matching designs
- 🎨 **Consistent spacing** throughout application
- ⚡ **Uniform interactions** across all components
- 📱 **Predictable responsive** behavior

### **Maintenance:**
- 🔧 **Easy updates** through centralized variables
- 📝 **Clear documentation** for all components
- ✅ **Automated validation** through composables
- 🎯 **Single source of truth** for design decisions

---

**🎯 Remember: The design system is your single source of truth. When in doubt, always reference the specifications and use the provided utilities.** 