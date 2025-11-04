# 🎨 Design System V2 Implementation Guide

## **Migration Status: Phase 1 Complete**

The new OKLCH-based design system has been successfully integrated alongside the existing system. All legacy components continue to work unchanged.

---

## **🎯 Quick Start - Using the New System**

### **CSS Classes (Ready to Use):**
```html
<!-- Typography -->
<h1 class="ds-text-display-xl">Large Display Text</h1>
<h2 class="ds-text-display-lg">Medium Display Text</h2>
<p class="ds-text-body">Body text with perfect readability</p>

<!-- Buttons -->
<button class="ds-btn-primary">Primary Action</button>
<button class="ds-btn-secondary">Secondary Action</button>
<button class="ds-btn-ghost">Ghost Button</button>

<!-- Cards -->
<div class="ds-card">
  <div class="ds-card-header">
    <h3 class="ds-card-title">Card Title</h3>
    <p class="ds-card-description">Card description</p>
  </div>
  <p>Card content goes here</p>
</div>

<!-- Forms -->
<label class="ds-form-label">Email Address</label>
<input type="email" class="ds-form-input" placeholder="Enter your email">

<!-- Layout -->
<div class="ds-container">
  <div class="ds-grid ds-grid-3 ds-space-y-4">
    <!-- Grid content -->
  </div>
</div>
```

### **Tailwind Classes (Ready to Use):**
```html
<!-- Colors -->
<div class="bg-ds-primary text-ds-primary-foreground">Primary background</div>
<div class="bg-ds-card border border-ds-border">Card with border</div>

<!-- Spacing -->
<div class="p-ds-2 m-ds-1">Padding 2rem, margin 1rem</div>
<div class="space-y-ds-1">Vertical spacing 1rem</div>

<!-- Typography -->
<h1 class="font-ds-display text-ds-l">Display heading</h1>
<p class="font-ds-sans text-ds-copy-18">Body text</p>

<!-- Shadows & Borders -->
<div class="shadow-ds-lg rounded-ds-xl">Large shadow, extra large radius</div>

<!-- Width Constraints -->
<div class="w-ds-50 max-w-ds-80">Width 50rem, max-width 80rem</div>

<!-- Responsive -->
<div class="ds-md:text-ds-m ds-lg:text-ds-l">Responsive typography</div>
```

---

## **🌟 Key Features**

### **OKLCH Color System:**
- **Better perceptual uniformity** than HSL/RGB
- **Automatic dark mode** support with `.dark` class
- **Semantic naming** for consistent theming
- **Future-proof** color format

### **Premium Typography:**
- **Neue Montreal** for sans-serif (high-quality paid font)
- **Perfectly Nineties** for display text (unique personality)
- **Webflow-inspired** sizing scale (24px-120px)
- **Perfect letter-spacing** for each size

### **Modern Spacing:**
- **rem-based** scale (0.25rem-10rem)
- **Responsive** by default
- **Consistent** across components

### **Advanced Shadows:**
- **Layered shadow** system
- **Multiple depth** levels (2xs to 2xl)
- **Consistent lighting** model

---

## **📋 Component Comparison**

| Component | Legacy | New System |
|-----------|--------|------------|
| Button | `<button class="bg-secondary">` | `<button class="ds-btn-primary">` |
| Card | Custom CSS | `<div class="ds-card">` |
| Text | `text-responsive` | `ds-text-body` |
| Container | Custom margins | `ds-container` |
| Spacing | `space-4` (8px) | `p-ds-1` (16px) |

---

## **🔄 Migration Path**

### **Phase 1: ✅ Complete**
- New design system available
- All legacy components still work
- Can use new system in new components

### **Phase 2: Selective Migration (Next)**
```bash
# Components to migrate first (high impact, low risk):
components/landing/HeroSection.vue     # Use ds-text-display-xl
components/landing/ValueProposition.vue # Use ds-card system
components/common/Button.vue           # Create ButtonV2.vue
```

### **Phase 3: Core Migration**
```bash
# Components to migrate later:
components/common/NavigationBar.vue
components/dictionary/SearchBox.vue
components/auth/LoginForm.vue
```

---

## **🎨 Design Tokens Reference**

### **Colors (CSS Variables):**
```css
/* Light mode */
--ds-background: oklch(0.95 0.02 45)  /* #F3EEEC */
--ds-foreground: oklch(0.25 0 0)       /* #333333 */
--ds-primary: oklch(0.65 0.15 25)      /* #D45B41 */
--ds-card: oklch(0.98 0.01 45)
--ds-border: oklch(0.88 0.02 45)

/* Dark mode automatically applied with .dark class */
```

### **Typography Scale:**
```css
--ds-font-size-copy-12: 12px    /* Extra small text */
--ds-font-size-copy-14: 14px    /* Small body text */
--ds-font-size-copy-16: 16px    /* Body text */
--ds-font-size-copy-18: 18px    /* Large body text */
--ds-font-size-xxs: 24px        /* Small headings */
--ds-font-size-xs: 32px         /* Medium headings */
--ds-font-size-s: 48px          /* Large headings */
--ds-font-size-m: 64px          /* Display text */
--ds-font-size-l: 120px         /* Hero text */
```

### **Spacing Scale:**
```css
--ds-spacing-025: 0.25rem  /* 4px */
--ds-spacing-05: 0.5rem    /* 8px */
--ds-spacing-1: 1rem       /* 16px */
--ds-spacing-2: 2rem       /* 32px */
--ds-spacing-3: 3rem       /* 48px */
/* ... up to 10rem (160px) */
```

---

## **🚀 Example: Creating a New Component**

### **Before (Legacy System):**
```vue
<template>
  <div class="card bg-primary p-6 shadow">
    <h2 class="text-heading text-secondary mb-4">Card Title</h2>
    <p class="text-responsive text-text">Card content</p>
    <button class="bg-secondary text-primary px-4 py-2 rounded">Action</button>
  </div>
</template>

<style scoped>
.card {
  border-radius: var(--border-radius);
}
</style>
```

### **After (New System):**
```vue
<template>
  <div class="ds-card">
    <div class="ds-card-header">
      <h2 class="ds-card-title">Card Title</h2>
      <p class="ds-card-description">Optional description</p>
    </div>
    <p class="ds-text-body">Card content with perfect typography</p>
    <button class="ds-btn-primary">Action</button>
  </div>
</template>

<!-- No custom CSS needed! -->
```

### **Benefits:**
- ✅ **Consistent** design automatically
- ✅ **Dark mode** support built-in  
- ✅ **Responsive** typography
- ✅ **Better accessibility** (focus states, color contrast)
- ✅ **Modern animations** (hover effects, transitions)

---

## **🔍 Troubleshooting**

### **"My component looks different"**
- Check if you're mixing legacy and new classes
- Use either all legacy OR all new system classes
- Example: Don't mix `bg-primary` with `ds-text-body`

### **"Fonts not loading"**
- Neue Montreal and Perfectly Nineties are commercial fonts
- Add font files to `/public/fonts/` 
- Update CSS with proper `@font-face` declarations

### **"Dark mode not working"**
- Add `class="dark"` to `<html>` element
- Or use Nuxt dark mode module
- New system automatically switches variables

### **"Colors look wrong"**
- OKLCH requires modern browsers (95%+ support)
- Fallbacks included for older browsers
- Test in target browsers

---

## **📈 Performance Impact**

### **Bundle Size:**
- ✅ **CSS Variables**: Minimal runtime impact
- ⚠️ **Temporary increase**: Both systems loaded (~15KB extra)
- ✅ **Future reduction**: Legacy system will be removed

### **Runtime Performance:**
- ✅ **CSS Variables**: Native browser optimization
- ✅ **Modern shadows**: GPU-accelerated
- ✅ **OKLCH colors**: Better color math

---

## **🎯 Next Steps**

1. **Test the new system** in a new component
2. **Migrate landing page** components first (high visibility)
3. **Create ButtonV2.vue** with new system
4. **Add dark mode toggle** to test color switching
5. **Gather user feedback** on new visual style

**The new design system is ready for production use! 🚀**