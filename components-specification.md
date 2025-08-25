# 🎯 Component Specifications & ASCII Layouts
## Zero-Ambiguity Implementation Guide

> **⚠️ IMPORTANT UPDATE**: The PaymentForm component has been removed and replaced with Stripe Checkout integration. This eliminates PCI compliance burden and improves security by using Stripe's pre-built, secure payment forms instead of custom payment collection.

### **🔍 SearchBox Component**

#### Specification:
- **Height:** 48px (--space-12)
- **Padding:** 0 16px 0 48px (space for search icon)
- **Border:** 1px solid --color-border
- **Focus State:** --color-border-focus with subtle shadow
- **Search Icon:** 20px, positioned 16px from left edge
- **Clear Button:** 16px, positioned 12px from right edge

#### ASCII Layout:
```
┌─────────────────────────────────────────────────────────┐ 48px height
│  🔍    Buscar en español...                        ✕   │
└─────────────────────────────────────────────────────────┘
   ↑                                                   ↑
  16px                                               12px
  from left                                        from right

├─48px─┤├──────── flexible content area ─────────┤├─28px─┤
```

#### CSS Implementation Requirements:
```scss
.search-box {
  position: relative;
  height: var(--space-12); // 48px
  
  .search-input {
    height: 100%;
    padding: 0 40px 0 48px;
    border: 1px solid var(--color-border);
    border-radius: var(--border-radius);
    font-size: var(--font-size-base);
    
    &:focus {
      border-color: var(--color-border-focus);
      box-shadow: 0 0 0 3px rgba(212, 91, 65, 0.1);
    }
  }
  
  .search-icon {
    position: absolute;
    left: var(--space-4); // 16px
    top: 50%;
    transform: translateY(-50%);
    width: 20px;
    height: 20px;
    color: var(--color-text-light);
  }
  
  .clear-button {
    position: absolute;
    right: var(--space-3); // 12px
    top: 50%;
    transform: translateY(-50%);
    width: 16px;
    height: 16px;
  }
}
```

---

### **🔄 LanguageToggle Component**

#### Specification:
- **Height:** 40px (--space-10)
- **Button Width:** Minimum 100px, flexible based on content (increased for flag + text)
- **Flag Size:** 16px × 12px (4:3 aspect ratio)
- **Gap:** 8px between flag and text (--space-2)
- **Active State:** --color-secondary background, white text
- **Inactive State:** Transparent background, --color-text
- **Border Radius:** --border-radius on container

#### ASCII Layout:
```
┌─────────────────────────────────────────────────────┐ 40px height
│  🇪🇸 Español   │   🇬🇶 Ndowe   │                   │
│  ████████████  │                │                   │ Active state (filled)
└─────────────────────────────────────────────────────┘
   ↑                     ↑
   Active              Inactive
   (filled)            (outline)

├──── 100px min ────┤├──── 100px min ────┤
   ↑        ↑           ↑        ↑
  Flag    Text        Flag    Text
 (16×12)  (8px gap)  (16×12)  (8px gap)
```

#### Flag Icon Specifications:
- **Spanish Flag:** `/icons/flag-spanish.svg` - Red-yellow-red horizontal stripes with simplified coat of arms
- **Ndowe Flag:** `/icons/flag-ndowe.svg` - Blue background with red cross, yellow stars, and tree emblem  
- **Size:** 16×12px (4:3 aspect ratio)
- **Position:** Left-aligned within button, 8px gap from text
- **Format:** Optimized SVG with simplified details for small display size
- **Colors:** Authentic flag colors, no modifications needed

#### CSS Implementation Requirements:
```scss
.language-toggle {
  display: flex;
  border-radius: var(--border-radius);
  border: 1px solid var(--color-border);
  overflow: hidden;
  
  .toggle-button {
    flex: 1;
    min-width: 100px; // Increased for flag + text
    height: var(--space-10); // 40px
    padding: 0 var(--space-4);
    border: none;
    background: transparent;
    color: var(--color-text);
    font-weight: var(--font-weight-medium);
    transition: all var(--transition-normal);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2); // 8px between flag and text
    
    &.active {
      background: var(--color-secondary);
      color: white;
    }
    
    &:hover:not(.active) {
      background: var(--color-background);
    }
    
    .flag-icon {
      width: 16px;
      height: 12px;
      flex-shrink: 0;
      border-radius: 2px; // Subtle rounding for flags
      overflow: hidden;
      
      svg {
        width: 100%;
        height: 100%;
        display: block;
      }
    }
    
    .button-text {
      font-size: var(--font-size-sm);
      line-height: 1;
    }
  }
}
```

#### Vue Implementation Example:
```vue
<template>
  <div class="language-toggle">
    <button 
      class="toggle-button"
      :class="{ active: currentLanguage === 'spanish' }"
      @click="setLanguage('spanish')"
    >
      <div class="flag-icon">
        <img src="/icons/flag-spanish.svg" alt="Spanish flag" />
      </div>
      <span class="button-text">Español</span>
    </button>
    
    <button 
      class="toggle-button"
      :class="{ active: currentLanguage === 'ndowe' }"
      @click="setLanguage('ndowe')"
    >
      <div class="flag-icon">
        <img src="/icons/flag-ndowe.svg" alt="Ndowe flag" />
      </div>
      <span class="button-text">Ndowe</span>
    </button>
  </div>
</template>

<script setup lang="ts">
interface Props {
  currentLanguage: 'spanish' | 'ndowe'
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'language-change': [language: 'spanish' | 'ndowe']
}>()

const setLanguage = (language: 'spanish' | 'ndowe') => {
  emit('language-change', language)
}
</script>
```

---

### **📇 ResultCard Component**

#### Specification:
- **Padding:** 48px (--space-11) all around
- **Border Radius:** 12px (--border-radius-lg)
- **Background:** --color-card-bg (white)
- **Shadow:** --shadow-sm, hover: --shadow-md
- **Margin Bottom:** 16px (--space-6)

#### Content Structure:
**Spanish → Ndowe Translation:**
- Source Language Label: "Español" 
- Source Word: "Casa"
- Target Language Label: "Ndowe"
- Target Word(s): "Mbaddi"
- Example Label: "Ejemplo"
- Example Sentences: "Mi casa es grande" / "Am ndáála e woka"

**Ndowe → Spanish Translation:** (Vice versa structure)

#### ASCII Layout:
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │ ← 48px padding top
│  Español                                                    │ ← Source language label
│  Casa                                                       │ ← Source word (large)
│                                                             │ ← 24px gap
│  Ndowe                                                      │ ← Target language label  
│  Mbaddi                                                     │ ← Target word (prominent)
│                                                             │ ← 24px gap
│  Ejemplo                                                    │ ← Example label
│  "Mi casa es grande"                                        │ ← Source example
│  "Am ndáála e woka"                                         │ ← Target example
│                                                             │ ← 48px padding bottom
└─────────────────────────────────────────────────────────────┘
↑                                                             ↑
48px padding left                                    48px padding right
```

#### CSS Implementation Requirements:
```scss
.result-card {
  background: var(--color-card-bg);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-sm);
  padding: var(--space-11); // 48px - doubled from original
  margin-bottom: var(--space-6);
  transition: all var(--transition-normal);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }
  
  .language-section {
    margin-bottom: var(--space-8); // 24px gap between sections
    
    &:last-of-type {
      margin-bottom: var(--space-8); // Maintain spacing before examples
    }
  }
  
  .language-label {
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    color: var(--color-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: var(--space-3);
  }
  
  .source-word {
    font-size: var(--font-size-2xl);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text);
    line-height: var(--line-height-tight);
    margin-bottom: 0;
  }
  
  .target-word {
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-medium);
    color: var(--color-secondary);
    line-height: var(--line-height-tight);
    margin-bottom: 0;
  }
  
  .example-section {
    background: var(--color-background);
    padding: var(--space-6);
    border-radius: var(--border-radius);
    border-left: 3px solid var(--color-secondary);
    
    .example-label {
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      color: var(--color-text-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: var(--space-4);
    }
    
    .example-source {
      font-size: var(--font-size-base);
      color: var(--color-text);
      margin-bottom: var(--space-3);
      line-height: var(--line-height-normal);
    }
    
    .example-target {
      font-size: var(--font-size-base);
      color: var(--color-text-muted);
      font-style: italic;
      line-height: var(--line-height-normal);
      margin-bottom: 0;
    }
  }
}
```

#### Vue Implementation Example:
```vue
<template>
  <div class="result-card">
    <!-- Source Language Section -->
    <div class="language-section">
      <div class="language-label">{{ sourceLanguageLabel }}</div>
      <div class="source-word">{{ entry.sourceWord }}</div>
    </div>
    
    <!-- Target Language Section -->
    <div class="language-section">
      <div class="language-label">{{ targetLanguageLabel }}</div>
      <div class="target-word">{{ entry.targetWord }}</div>
    </div>
    
    <!-- Examples Section -->
    <div v-if="entry.examples?.length" class="example-section">
      <div class="example-label">Ejemplo</div>
      <div 
        v-for="(example, index) in entry.examples" 
        :key="index"
        class="example-pair"
      >
        <div class="example-source">{{ example.source }}</div>
        <div class="example-target">{{ example.target }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface DictionaryEntry {
  id: string
  sourceWord: string
  targetWord: string
  examples?: {
    source: string
    target: string
  }[]
}

interface Props {
  entry: DictionaryEntry
  translationDirection: 'spanish-to-ndowe' | 'ndowe-to-spanish'
}

const props = defineProps<Props>()

const sourceLanguageLabel = computed(() => 
  props.translationDirection === 'spanish-to-ndowe' ? 'Español' : 'Ndowe'
)

const targetLanguageLabel = computed(() => 
  props.translationDirection === 'spanish-to-ndowe' ? 'Ndowe' : 'Español'
)
</script>
```

---

### **📱 NavigationBar Component**

#### Specification (Mobile):
- **Height:** 64px (--space-13)
- **Padding:** 0 24px (--space-8)
- **Background:** --color-primary with --shadow-sm
- **Logo Height:** 32px, left-aligned
- **Menu Button:** 24px, right-aligned

#### Specification (Desktop):
- **Height:** 64px (--space-13)
- **Padding:** 0 48px (--space-11)
- **Background:** --color-primary with --shadow-sm
- **Logo Height:** 32px, left-aligned
- **Navigation Items:** Horizontal list, right-aligned
- **Account Menu:** Dropdown trigger, far right

#### Navigation Items Explanation:
- **Diccionario**: Dictionary search page (main functionality) - Shows active state when on search page
- **Ayuda**: Help/FAQ page with user guides and support information  
- **Mi Cuenta**: Account management dropdown with profile, subscription, settings
- **Active State**: Items show filled background (████) when current page

#### ASCII Layout (Mobile):
```
┌─────────────────────────────────────────────┐ 64px height
│  🏠 epàlwi-rèbbo              ☰           │
└─────────────────────────────────────────────┘
   ↑                              ↑
  24px                           24px
  from left                    from right

├─24px─┤├─── flexible space ───┤├─48px─┤
```

#### ASCII Layout (Desktop):
```
┌───────────────────────────────────────────────────────────┐ 64px height
│  🏠 epàlwi-rèbbo        ████ Diccionario ████  Ayuda      👤 Mi Cuenta │
└───────────────────────────────────────────────────────────┘ (Diccionario active)
   ↑                                                                    ↑
  48px                                                                48px
  from left                                                        from right

├─48px─┤├──────── flexible content area ────────┤├─48px─┤
```

#### ASCII Layout (Desktop - Logged Out):
```
┌───────────────────────────────────────────────────────────┐ 64px height
│  🏠 epàlwi-rèbbo        ████ Diccionario ████  Ayuda      Iniciar Sesión │
└───────────────────────────────────────────────────────────┘ (Diccionario active)
   ↑                                                                      ↑
  48px                                                                  48px
  from left                                                          from right

├─48px─┤├──────── flexible content area ────────┤├─48px─┤
```

#### ASCII Layout (Mobile - Logged Out):
```
┌─────────────────────────────────────────────┐ 64px height
│  🏠 epàlwi-rèbbo              ☰           │
└─────────────────────────────────────────────┘
   ↑                              ↑
  24px                           24px
  from left                    from right

├─24px─┤├─── flexible space ───┤├─48px─┤
```

#### ASCII Layout ("Mi Cuenta" Dropdown):
```
┌───────────────────────────────────────────────────────────┐ 64px height
│  🏠 epàlwi-rèbbo        ████ Diccionario ████  Ayuda      👤 Mi Cuenta ▼ │
└───────────────────────────────────────────────────────────┘ (Diccionario active)
                                                            ┌─────────────────────┐
                                                            │  Mi Perfil          │ 48px
                                                            ├─────────────────────┤  
                                                            │  Suscripción        │ 48px
                                                            ├─────────────────────┤
                                                            │  Configuración      │ 48px
                                                            ├─────────────────────┤
                                                            │  Cerrar Sesión      │ 48px
                                                            └─────────────────────┘
                                                            ↑                     ↑
                                                          20px               20px
                                                        padding           padding
```

#### ASCII Layout (Mobile Hamburger Menu - Opened):
```
┌─────────────────────────────────────────────┐ Full viewport height
│                                         ✕   │ ← Close button (top-right)
│                                             │ ← 24px padding top
│  Diccionario                                │ ← Menu item (48px height)
│                                             │
├─────────────────────────────────────────────┤
│  Ayuda                                      │ ← Menu item (48px height)  
│                                             │
├─────────────────────────────────────────────┤
│  Mi Perfil                                  │ ← Menu item (48px height)
│                                             │
├─────────────────────────────────────────────┤
│  Suscripción                                │ ← Menu item (48px height)
│                                             │
├─────────────────────────────────────────────┤
│  Configuración                              │ ← Menu item (48px height)
│                                             │
├─────────────────────────────────────────────┤
│  Cerrar Sesión                              │ ← Menu item (48px height)
│                                             │
│                                             │ ← Flexible space
│                                             │
│                                             │
│                                             │ ← 24px padding bottom
└─────────────────────────────────────────────┘
↑                                             ↑
24px                                        24px
padding left                            padding right
```

#### CSS Implementation Requirements:
```scss
.navigation-bar {
  height: var(--space-13); // 64px
  background: var(--color-primary);
  box-shadow: var(--shadow-sm);
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: var(--z-fixed);
  
  // Mobile-first padding
  padding: 0 var(--space-8); // 24px
  
  // Desktop padding
  @media (min-width: 1024px) {
    padding: 0 var(--space-11); // 48px
  }
  
  .logo {
    height: 32px;
    display: flex;
    align-items: center;
    gap: var(--space-3);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text);
    text-decoration: none;
  }
  
  .desktop-nav {
    display: none;
    
    @media (min-width: 1024px) {
      display: flex;
      align-items: center;
      gap: var(--space-8);
    }
    
    .nav-item {
      color: var(--color-text);
      text-decoration: none;
      font-weight: var(--font-weight-medium);
      transition: color var(--transition-fast);
      
      &:hover {
        color: var(--color-secondary);
      }
    }
  }
  
  .account-dropdown {
    position: relative;
    
    .dropdown-trigger {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      background: none;
      border: none;
      color: var(--color-text);
      font-weight: var(--font-weight-medium);
      cursor: pointer;
    }
    
    .dropdown-menu {
      position: absolute;
      top: 100%;
      right: 0;
      margin-top: var(--space-3);
      background: var(--color-primary);
      border-radius: var(--border-radius-lg);
      box-shadow: var(--shadow-lg);
      min-width: 200px;
      z-index: var(--z-dropdown);
      
      .dropdown-item {
        display: block;
        width: 100%;
        padding: var(--space-5) var(--space-7); // 12px vertical, 20px horizontal  
        text-align: left;
        background: none;
        border: none;
        color: var(--color-text);
        font-weight: var(--font-weight-normal);
        transition: background var(--transition-fast);
        
        &:hover {
          background: var(--color-background);
        }
        
        &:first-child {
          border-radius: var(--border-radius-lg) var(--border-radius-lg) 0 0;
        }
        
        &:last-child {
          border-radius: 0 0 var(--border-radius-lg) var(--border-radius-lg);
        }
      }
    }
  }
  
  .hamburger-button {
    display: flex;
    background: none;
    border: none;
    width: 24px;
    height: 24px;
    cursor: pointer;
    
    @media (min-width: 1024px) {
      display: none;
    }
  }
}

.mobile-menu {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--color-primary);
  z-index: var(--z-modal);
  padding: var(--space-8); // 24px
  display: flex;
  flex-direction: column;
  
  .close-button {
    align-self: flex-end;
    background: none;
    border: none;
    width: 24px;
    height: 24px;
    cursor: pointer;
    margin-bottom: var(--space-8);
  }
  
  .menu-item {
    display: block;
    padding: var(--space-5) 0; // 12px vertical
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-medium);
    color: var(--color-text);
    text-decoration: none;
    border-bottom: 1px solid var(--color-border);
    transition: color var(--transition-fast);
    
    &:hover {
      color: var(--color-secondary);
    }
    
    &:last-child {
      border-bottom: none;
    }
  }
}
```

---

## **📱 Complete Page Layouts**
### Full User Experience Flow with All Components

### **🏠 1. Landing Page (User Not Signed Up)**

#### Mobile Layout:
```
┌─────────────────────────────────────────────┐ 
│  🏠 epàlwi-rèbbo              ☰           │ ← NavigationBar (logged out)
└─────────────────────────────────────────────┘ 64px height, 24px padding
│                                             │ ← 24px gap
│  🇪🇸 Español   │   🇬🇶 Ndowe   │           │ ← LanguageToggle (40px height)
│  ████████████  │                │           │
│                                             │ ← 16px gap  
│  ┌─────────────────────────────────────────┐ │
│  │  🔍    Buscar en español...        ✕   │ │ ← SearchBox (48px height)
│  └─────────────────────────────────────────┘ │
│                                             │ ← 32px gap
│  ┌─────────────────────────────────────────┐ │
│  │                                         │ │
│  │               📚                        │ │ ← EmptyState component
│  │         Busca una palabra               │ │ 
│  │                                         │ │
│  │    Encuentra traducciones entre         │ │
│  │       español y ndowe                   │ │
│  │                                         │ │
│  └─────────────────────────────────────────┘ │
│                                             │
│                                             │ ← Flexible space
│                                             │
└─────────────────────────────────────────────┘
```

#### Desktop Layout:
```
┌───────────────────────────────────────────────────────────────────────────────┐
│  🏠 epàlwi-rèbbo    Diccionario  Ayuda    Iniciar Sesión                      │ ← NavigationBar
└───────────────────────────────────────────────────────────────────────────────┘ 64px, 48px padding
                                                                                    ← 48px gap
                  ┌─────────────────────────────────────────────┐                 
                  │  🇪🇸 Español   │   🇬🇶 Ndowe   │           │ ← LanguageToggle
                  │  ████████████  │                │           │ (centered, 400px max)
                  └─────────────────────────────────────────────┘
                                        │                         ← 24px gap
                  ┌─────────────────────────────────────────────┐
                  │  🔍    Buscar en español...            ✕   │ ← SearchBox (600px max)
                  └─────────────────────────────────────────────┘
                                        │                         ← 48px gap
                  ┌─────────────────────────────────────────────┐
                  │                                             │
                  │                   📚                        │ ← EmptyState (800px max)
                  │             Busca una palabra               │
                  │                                             │
                  │        Encuentra traducciones entre         │
                  │           español y ndowe                   │
                  │                                             │
                  │     ┌─────────────────────────────────┐     │
                  │     │        Iniciar Sesión          │     │ ← CTA Button (large)
                  │     └─────────────────────────────────┘     │
                  │                                             │
                  └─────────────────────────────────────────────┘
```

---

### **✉️ 2. Signup Flow**

#### Mobile Signup Modal:
```
┌─────────────────────────────────────────────┐ 
│  🏠 epàlwi-rèbbo              ☰           │ ← NavigationBar
└─────────────────────────────────────────────┘
│██████████████ OVERLAY ██████████████████████│ ← Modal overlay
│██┌─────────────────────────────────────┐███│
│██│               ✕                     │███│ ← Modal close button
│██│                                     │███│ ← 24px padding
│██│         Crear Cuenta                │███│ ← Modal title
│██│                                     │███│ ← 16px gap
│██│  Ingresa tu email para comenzar     │███│ ← Description text
│██│  tu prueba gratuita de 14 días      │███│
│██│                                     │███│ ← 24px gap
│██│  ┌─────────────────────────────────┐ │███│
│██│  │  ✉️  tu@email.com              │ │███│ ← Email input (48px)
│██│  └─────────────────────────────────┘ │███│
│██│                                     │███│ ← 16px gap
│██│  ┌─────────────────────────────────┐ │███│
│██│  │        Enviar Enlace            │ │███│ ← Primary button (48px)
│██│  └─────────────────────────────────┘ │███│
│██│                                     │███│ ← 24px gap
│██│  Al registrarte aceptas nuestros   │███│ ← Terms text (small)
│██│  términos y condiciones            │███│
│██│                                     │███│ ← 24px padding
│██└─────────────────────────────────────┘███│
│██████████████████████████████████████████││
```

#### Email Sent State:
```
┌─────────────────────────────────────────────┐
│██████████████ OVERLAY ██████████████████████│
│██┌─────────────────────────────────────┐███│
│██│               ✕                     │███│
│██│                                     │███│
│██│         ✉️ Email Enviado            │███│ ← Success state
│██│                                     │███│
│██│  Te hemos enviado un enlace mágico  │███│
│██│  a tu@email.com                     │███│
│██│                                     │███│
│██│  Revisa tu bandeja de entrada y     │███│
│██│  haz clic en el enlace para         │███│
│██│  acceder a tu cuenta.               │███│
│██│                                     │███│
│██│  ┌─────────────────────────────────┐ │███│
│██│  │         Entendido               │ │███│ ← Secondary button
│██│  └─────────────────────────────────┘ │███│
│██│                                     │███│
│██└─────────────────────────────────────┘███│
│██████████████████████████████████████████││
```

#### Dedicated Signup Page:
```
┌─────────────────────────────────────────────┐
│  🏠 epàlwi-rèbbo                      ☰ │ ← NavigationBar
└─────────────────────────────────────────────┘
│                                             │ ← 48px gap
│                                             │
│           ✨ Crear Cuenta                   │ ← Page title (large)
│                                             │ ← 24px gap
│     Comienza tu prueba gratuita de 14 días │ ← Subtitle
│                                             │ ← 32px gap
│  ┌─────────────────────────────────────────┐ │
│  │  ✉️  Ingresa tu email                  │ │ ← Email input (48px)
│  └─────────────────────────────────────────┘ │
│                                             │ ← 16px gap
│  ┌─────────────────────────────────────────┐ │
│  │           Crear Cuenta                  │ │ ← Primary button (48px)
│  └─────────────────────────────────────────┘ │
│                                             │ ← 24px gap
│     ✓ Acceso completo al diccionario       │ ← Benefits list
│     ✓ Búsqueda offline                     │
│     ✓ Sin anuncios                         │
│     ✓ Cancela cuando quieras               │
│                                             │ ← 32px gap
│  Al registrarte aceptas nuestros términos  │ ← Terms (small text)
│  y condiciones de uso                      │
│                                             │ ← 24px gap
│         ¿Ya tienes cuenta?                  │ ← Login link
│           Iniciar Sesión                    │
│                                             │
└─────────────────────────────────────────────┘
```

---

### **🔑 3. Login Flow**

#### Mobile Login Modal:
```
┌─────────────────────────────────────────────┐
│██████████████ OVERLAY ██████████████████████│
│██┌─────────────────────────────────────┐███│
│██│               ✕                     │███│
│██│                                     │███│
│██│         Iniciar Sesión              │███│ ← Modal title
│██│                                     │███│
│██│  Ingresa tu email para recibir      │███│
│██│  un enlace de acceso                │███│
│██│                                     │███│
│██│  ┌─────────────────────────────────┐ │███│
│██│  │  ✉️  tu@email.com              │ │███│ ← Email input
│██│  └─────────────────────────────────┘ │███│
│██│                                     │███│
│██│  ┌─────────────────────────────────┐ │███│
│██│  │        Enviar Enlace            │ │███│ ← Primary button
│██│  └─────────────────────────────────┘ │███│
│██│                                     │███│
│██│  ¿No tienes cuenta?                 │███│
│██│  Crear Cuenta                       │███│ ← Link to signup
│██│                                     │███│
│██└─────────────────────────────────────┘███│
│██████████████████████████████████████████││
```

---

### **🏠 4. Landing Page (User Logged In)**

#### Mobile Layout (Logged In):
```
┌─────────────────────────────────────────────┐
│  🏠 epàlwi-rèbbo                      ☰ │ ← NavigationBar (logged in)
└─────────────────────────────────────────────┘
│                                             │
│  🇪🇸 Español   │   🇬🇶 Ndowe   │           │ ← LanguageToggle
│  ████████████  │                │           │
│                                             │
│  ┌─────────────────────────────────────────┐ │
│  │  🔍    Buscar en español...        ✕   │ │ ← SearchBox (focused)
│  └─────────────────────────────────────────┘ │
│                                             │
│  ┌─────────────────────────────────────────┐ │
│  │                                         │ │
│  │               📖                        │ │ ← Ready state
│  │         ¡Listo para buscar!             │ │
│  │                                         │ │
│  │       Prueba gratuita: 12 días         │ │ ← Trial banner
│  │           restantes                     │ │
│  │                                         │ │
│  │     ┌─────────────────────────────┐     │ │
│  │     │       Actualizar Ahora      │     │ │ ← Upgrade CTA
│  │     └─────────────────────────────┘     │ │
│  │                                         │ │
│  └─────────────────────────────────────────┘ │
│                                             │
└─────────────────────────────────────────────┘
```

#### Desktop Layout (Logged In):
```
┌───────────────────────────────────────────────────────────────────────────────┐
│  🏠 epàlwi-rèbbo        ████ Diccionario ████  Ayuda        👤 Mi Cuenta ▼ │ ← NavigationBar
└───────────────────────────────────────────────────────────────────────────────┘ (Diccionario active)
                                                        ┌─────────────────────┐
                  ┌─────────────────────────────────────┐ Mi Perfil          │ ← Account dropdown
                  │  🇪🇸 Español   │   🇬🇶 Ndowe   │   ├─────────────────────┤  (when opened)
                  │  ████████████  │                │   │ Suscripción        │
                  └─────────────────────────────────────┘ ├─────────────────────┤
                                        │                   │ Configuración      │
                  ┌─────────────────────────────────────┐ ├─────────────────────┤
                  │  🔍    Buscar en español...     ✕   │ │ Cerrar Sesión      │
                  └─────────────────────────────────────┘ └─────────────────────┘
                                        │
                  ┌─────────────────────────────────────┐
                  │                                     │
                  │  📊 Prueba gratuita: 12 días       │ ← Trial status banner
                  │      restantes                      │
                  │                                     │
                  │  ┌─────────────────────────────┐   │
                  │  │      Actualizar Plan       │   │ ← Upgrade button
                  │  └─────────────────────────────┘   │
                  │                                     │
                  └─────────────────────────────────────┘
```

---

### **🔍 5. User Performing Search**

#### Mobile Search with Autocomplete:
```
┌─────────────────────────────────────────────┐
│  🏠 epàlwi-rèbbo              ☰           │ ← NavigationBar
└─────────────────────────────────────────────┘
│                                             │
│  🇪🇸 Español   │   🇬🇶 Ndowe   │           │ ← LanguageToggle
│  ████████████  │                │           │
│                                             │
│  ┌─────────────────────────────────────────┐ │
│  │  🔍    cas|                        ✕   │ │ ← SearchBox (typing "cas")
│  └─────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────┐ │ ← SuggestionDropdown
│  │  🔍  casa                              │ │ (240px max height)
│  ├─────────────────────────────────────────┤ │ 40px per item
│  │  🔍  casamiento                        │ │
│  ├─────────────────────────────────────────┤ │
│  │  🔍  casado                            │ │
│  ├─────────────────────────────────────────┤ │
│  │  🔍  casador                           │ │
│  ├─────────────────────────────────────────┤ │
│  │  🔍  casarse                           │ │
│  ├─────────────────────────────────────────┤ │
│  │  🔍  caseta                            │ │
│  └─────────────────────────────────────────┘ │
│                                             │
│  ┌─────────────────────────────────────────┐ │
│  │               ⟲                        │ │ ← Loading state
│  │          Buscando...                    │ │ (200px min height)
│  │                                         │ │
│  └─────────────────────────────────────────┘ │
│                                             │
└─────────────────────────────────────────────┘
```

#### Desktop Search with Autocomplete:
```
┌───────────────────────────────────────────────────────────────────────────────┐
│  🏠 epàlwi-rèbbo        ████ Diccionario ████  Ayuda        👤 Mi Cuenta     │
└───────────────────────────────────────────────────────────────────────────────┘ (Diccionario active)

                  ┌─────────────────────────────────────┐
                  │  🇪🇸 Español   │   🇬🇶 Ndowe   │   │
                  │  ████████████  │                │   │
                  └─────────────────────────────────────┘
                                        │
                  ┌─────────────────────────────────────┐
                  │  🔍    cas|                     ✕   │ ← SearchBox (typing)
                  └─────────────────────────────────────┘
                  ┌─────────────────────────────────────┐ ← Dropdown suggestions
                  │  🔍  casa                          │ (centered, 600px max)
                  ├─────────────────────────────────────┤
                  │  🔍  casamiento                     │
                  ├─────────────────────────────────────┤
                  │  🔍  casado                        │
                  └─────────────────────────────────────┘
                                        │
                            ⟲ Buscando...                ← Loading indicator
```

---

### **📋 6. Search Results Page**

#### Mobile Results Layout:
```
┌─────────────────────────────────────────────┐
│  🏠 epàlwi-rèbbo              ☰           │ ← NavigationBar
└─────────────────────────────────────────────┘
│                                             │
│  🇪🇸 Español   │   🇬🇶 Ndowe   │           │ ← LanguageToggle
│  ████████████  │                │           │
│                                             │
│  ┌─────────────────────────────────────────┐ │
│  │  🔍    casa                        ✕   │ │ ← SearchBox (with results)
│  └─────────────────────────────────────────┘ │
│                                             │ ← 16px gap
│  ┌─────────────────────────────────────────┐ │
│  │                                         │ │ ← ResultCard (48px padding)
│  │  Español                                │ │ Source language label
│  │  Casa                                   │ │ Source word (large)
│  │                                         │ │ 24px gap
│  │  Ndowe                                  │ │ Target language label
│  │  Mbaddi                                 │ │ Target word (prominent)
│  │                                         │ │ 24px gap
│  │  Ejemplo                                │ │ Example label
│  │  "Mi casa es grande"                    │ │ Source example
│  │  "Am ndáála e woka"                     │ │ Target example
│  │                                         │ │
│  └─────────────────────────────────────────┘ │
│                                             │
│                                             │ ← Additional space for potential 
│                                             │   pagination/load more results
│                                             │
└─────────────────────────────────────────────┘
```

#### Desktop Results Layout:
```
┌───────────────────────────────────────────────────────────────────────────────┐
│  🏠 epàlwi-rèbbo        ████ Diccionario ████  Ayuda        👤 Mi Cuenta     │
└───────────────────────────────────────────────────────────────────────────────┘ (Diccionario active)

                  ┌─────────────────────────────────────┐
                  │  🇪🇸 Español   │   🇬🇶 Ndowe   │   │
                  │  ████████████  │                │   │
                  └─────────────────────────────────────┘
                                        │
                  ┌─────────────────────────────────────┐
                  │  🔍    casa                     ✕   │ ← SearchBox (600px max width)
                  └─────────────────────────────────────┘
                                        │ ← 16px gap
                  ┌─────────────────────────────────────┐
                  │                                     │ ← ResultCard (matches search width)
                  │  Español                            │ (48px padding, 600px max width)
                  │  Casa                               │
                  │                                     │ ← 24px gap
                  │  Ndowe                              │
                  │  Mbaddi                             │
                  │                                     │ ← 24px gap
                  │  Ejemplo                            │
                  │  "Mi casa es grande"                │
                  │  "Am ndáála e woka"                 │
                  │                                     │
                  └─────────────────────────────────────┘
                                        │
                                        │ ← Space for potential pagination/
                                        │   additional results
```

---

### **🔘 Button Component System**

#### Specification:
- **Small:** 32px height, 12px/16px padding
- **Medium:** 40px height, 16px/24px padding  
- **Large:** 48px height, 20px/32px padding

#### ASCII Layout:
```
Small (32px):
┌──────────────┐ 32px height
│   Cancel     │
└──────────────┘
├─12px─┤   ├─12px─┤

Medium (40px):
┌──────────────────┐ 40px height
│    Continue      │
└──────────────────┘
├─16px─┤      ├─16px─┤

Large (48px):
┌─────────────────────┐ 48px height
│   Upgrade Now →     │
└─────────────────────┘
├─20px─┤        ├─20px─┤
```

---

### **💬 SuggestionDropdown Component**

#### Specification:
- **Max Height:** 240px (6 items × 40px)
- **Item Height:** 40px
- **Padding:** 12px horizontal, 8px vertical per item
- **Shadow:** --shadow-lg
- **Border Radius:** --border-radius-lg

#### ASCII Layout:
```
┌─────────────────────────────────────┐
│  🔍  casa                           │ ← 40px height per item
├─────────────────────────────────────┤
│  🔍  casamiento                     │
├─────────────────────────────────────┤
│  🔍  casado                         │
├─────────────────────────────────────┤
│  🔍  casador                        │
├─────────────────────────────────────┤
│  🔍  casarse                        │
├─────────────────────────────────────┤
│  🔍  caseta                         │
└─────────────────────────────────────┘
↑                                     ↑
12px padding                    12px padding
```

---

### **⚠️ StateComponents (Loading, Error, Empty)**

#### Loading State:
```
┌─────────────────────────────────────┐ 200px min-height
│                                     │
│               ⟲                    │ ← Spinning icon
│          Cargando...                │
│                                     │
└─────────────────────────────────────┘
```

#### Error State:
```
┌─────────────────────────────────────┐
│                                     │
│               ⚠️                    │ ← Error icon (24px)
│        Error de búsqueda            │ ← Title (--font-weight-semibold)
│                                     │
│   No se pudo cargar el diccionario  │ ← Message (--color-text-muted)
│                                     │
│         [ Intentar de nuevo ]       │ ← Button
│                                     │
└─────────────────────────────────────┘
```

#### Empty State:
```
┌─────────────────────────────────────┐
│                                     │
│               📚                    │ ← Empty icon (32px)
│         No hay resultados           │ ← Title
│                                     │
│    Intenta con otra palabra         │ ← Message
│                                     │
└─────────────────────────────────────┘
```

---

## **🎯 Implementation Strategy**

### **1. Component Consistency Enforcement:**

Create a `useDesignSystem` composable:

```typescript
// composables/useDesignSystem.ts
export const useDesignSystem = () => {
  const getSpacing = (level: number) => `var(--space-${level})`
  const getSize = (size: 'sm' | 'md' | 'lg') => {
    const sizes = { sm: 'var(--space-9)', md: 'var(--space-10)', lg: 'var(--space-11)' }
    return sizes[size]
  }
  
  const buttonClasses = (variant: string, size: string) => [
    'btn',
    `btn--${variant}`,
    `btn--${size}`,
    'interactive',
    'ripple'
  ]
  
  return { getSpacing, getSize, buttonClasses }
}
```

### **2. Component Validation:**
Each component must include:
- ✅ **Exact dimensions** from specs
- ✅ **Proper spacing** using CSS variables  
- ✅ **Interactive states** using `.interactive` class
- ✅ **Loading states** using `.loading` class
- ✅ **Focus management** for accessibility
- ✅ **Responsive behavior** following breakpoints

### **3. Development Workflow:**
1. **Reference ASCII layout** before coding
2. **Use design system variables** exclusively
3. **Apply interaction classes** (`.interactive`, `.loading`)
4. **Test all states** (hover, focus, disabled, loading)
5. **Validate with specs** before marking complete

This system ensures **zero interpretation** and **consistent implementation** across your entire application.

---

## **🔄 Recent Architecture Updates**

### **Stripe Integration Changes**
- **PaymentForm.vue**: ❌ Removed (replaced by Stripe Checkout)
- **StripeCheckoutTrigger.vue**: ✅ New component for plan confirmation
- **PaymentConfirmation.vue**: ✅ Kept for post-payment UX
- **PricingCard.vue**: ✅ Kept for plan selection

### **Benefits of Stripe Checkout Integration**
1. **Security**: PCI compliance handled by Stripe
2. **Conversion**: Optimized checkout flow with higher success rates
3. **International**: Automatic currency and payment method support
4. **Maintenance**: Stripe handles compliance updates automatically
5. **User Experience**: Professional, trusted payment interface

### **Updated Subscription Flow**
```
User selects plan → StripeCheckoutTrigger appears → User clicks CTA → 
Redirect to Stripe → Complete payment → Redirect back → PaymentConfirmation shows
```

### **Component Dependencies**
- **PricingCard.vue**: Emits `plan-selected` event
- **StripeCheckoutTrigger.vue**: Listens for plan selection, triggers Stripe
- **PaymentConfirmation.vue**: Shows payment result states
- **Backend**: Creates Stripe Checkout Sessions via `/api/create-checkout-session` 

---

## **🔧 PHASE 4A: FOUNDATIONAL COMPONENTS**
### Critical Infrastructure Components

### **🧩 Icon Component System**

#### Specification:
- **Library:** Nuxt Icon v1 with Lucide collection
- **Sizes:** 12px (sm), 16px (base), 20px (md), 24px (lg), 32px (xl)
- **Stroke Width:** 1.5px (Lucide standard)
- **Color:** Inherits currentColor for theme compatibility
- **Custom Collections:** Support for flag icons and project-specific assets

#### ASCII Layout & Usage Reference:
```
Icon Size Reference:
┌─────┐ ┌──────┐ ┌────────┐ ┌─────────┐ ┌────────────┐
│ 12  │ │  16  │ │   20   │ │   24    │ │     32     │
└─────┘ └──────┘ └────────┘ └─────────┘ └────────────┘
  sm      base      md        lg          xl

Common Usage Examples:
🔍 search (16px)    ✕ close (16px)     ☰ menu (24px)    
👤 user (20px)      ⚙️ settings (16px)  📧 email (16px)
🏠 home (20px)      📊 stats (24px)     ⚠️ warning (20px)
```

---

### **🗃️ Modal/Dialog Component**

#### Specification:
- **Overlay:** Full viewport (100vw × 100vh) with backdrop blur
- **Container:** Centered, responsive max-width (480px mobile, 600px desktop)
- **Mobile Behavior:** Full height on mobile, card-style on desktop
- **Padding:** 24px mobile, 32px desktop
- **Close Methods:** Both backdrop click AND explicit close button (top-right)
- **Animation:** Fade-in overlay + slide-up content
- **Z-index:** High priority for overlay positioning

#### ASCII Layout:
```
Desktop Modal (≥768px):
┌─────────────────── 100vw ───────────────────┐ 100vh
│████████████████ OVERLAY ████████████████████│ (backdrop blur + click to close)
│███████████████████████████████████████████││
│██████████┌─────────────────────────────┐███││ 
│██████████│                           ✕ │███││ ← Close button (32×32px touch target)
│██████████│                             │███││ ← 32px padding
│██████████│         Modal Title         │███││ ← Title (text-xl, semibold)
│██████████│                             │███││ ← 16px gap
│██████████│   Modal content goes here   │███││ ← Content area (flexible)
│██████████│   with any form elements,   │███││
│██████████│   text, or other components │███││
│██████████│                             │███││ ← 24px gap
│██████████│   ┌─────────┐ ┌─────────┐   │███││
│██████████│   │ Cancel  │ │ Confirm │   │███││ ← Action buttons
│██████████│   └─────────┘ └─────────┘   │███││
│██████████│                             │███││ ← 32px padding
│██████████└─────────────────────────────┘███││
│███████████████████████████████████████████││
└─────────────────────────────────────────────┘
   ↑                                       ↑
 Max 600px width                     Centered

Mobile Modal (<768px):
┌─────────────────────┐ 100vw
│                   ✕ │ ← Close button (top-right, 24px padding)
│                     │ ← 24px padding all around
│    Modal Title      │ ← Title (text-lg on mobile)
│                     │ ← 16px gap
│ Modal content goes  │ ← Content area
│ here with form      │
│ elements and text   │
│                     │ ← 24px gap
│ ┌─────────────────┐ │
│ │ Cancel          │ │ ← Stacked buttons on mobile
│ └─────────────────┘ │ ← 8px gap between buttons
│ ┌─────────────────┐ │
│ │ Confirm         │ │
│ └─────────────────┘ │
│                     │ ← 24px padding
└─────────────────────┘ 100vh (full height)
```

---

### **📋 EmptyState Component**

#### Specification:
- **Purpose:** Display when no content is available (search results, landing page)
- **Icon Size:** 48px for primary illustration
- **Spacing:** 24px between icon and title, 16px between title and description
- **Text Hierarchy:** text-xl semibold title, text-base muted description
- **Optional CTA:** Primary button below description (24px gap)
- **Max Width:** 400px to prevent text from being too wide

#### ASCII Layout:
```
┌─────────────────────────────────────┐ 400px max width
│                                     │ ← 48px padding top
│                 📚                  │ ← 48px icon (centered)
│                                     │ ← 24px gap
│         No hay resultados           │ ← Title (text-xl, font-semibold)
│                                     │ ← 16px gap
│    Intenta con una palabra          │ ← Description (text-base, text-muted)
│         diferente                   │
│                                     │ ← 24px gap (if CTA present)
│     ┌─────────────────────────┐     │
│     │    Buscar de nuevo      │     │ ← Optional CTA (primary button)
│     └─────────────────────────┘     │
│                                     │ ← 48px padding bottom
└─────────────────────────────────────┘

EmptyState Variants:
┌─────────────────────────────────────┐
│                 📚                  │ ← Dictionary search empty
│         Busca una palabra           │
│    Encuentra traducciones entre     │
│       español y ndowe              │
│     ┌─────────────────────────┐     │
│     │    Iniciar búsqueda     │     │
│     └─────────────────────────┘     │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│                 ⚠️                   │ ← Error state
│        Error de búsqueda            │
│   No se pudo cargar el diccionario  │
│     ┌─────────────────────────┐     │
│     │   Intentar de nuevo     │     │
│     └─────────────────────────┘     │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│                 ✉️                   │ ← Email sent confirmation
│        Email enviado                │
│  Revisa tu bandeja de entrada para  │
│     acceder a tu cuenta             │
│     ┌─────────────────────────┐     │
│     │       Entendido         │     │
│     └─────────────────────────┘     │
└─────────────────────────────────────┘
```

---

### **🎛️ TrialBanner Component**

#### Specification:
- **Height:** 56px desktop, 72px mobile (when text stacks)
- **Background:** Gradient or accent color with subtle transparency
- **Content:** Trial days remaining + upgrade CTA button
- **Dismissible:** Close button on right (remembers dismissal for 7 days)
- **Responsive:** Horizontal layout desktop, stacked mobile
- **Animation:** Slide down from top when shown, slide up when dismissed

#### ASCII Layout:
```
Desktop TrialBanner (≥768px):
┌─────────────────────────────────────────────────────────────┐ 56px height
│  📊 Prueba gratuita: 12 días restantes  [ Actualizar ] ✕   │
└─────────────────────────────────────────────────────────────┘
   ↑                                        ↑             ↑
  24px                                   Button        Close
  padding                              (32px height)   (16px)
  
├─24px─┤├────── flexible text area ──────┤├─100px─┤├─32px─┤├─24px─┤

Mobile TrialBanner (<768px):
┌─────────────────────────────────────────┐ 72px height
│  📊 Prueba gratuita: 12 días restantes │ ← Text line 1 (16px padding)
│      [ Actualizar ]                  ✕ │ ← CTA button + close (16px padding)
└─────────────────────────────────────────┘
   ↑                                   ↑
  16px padding                       16px
  
Banner States:
🔴 Critical (≤3 days): Red background, urgent messaging
🟡 Warning (4-7 days): Yellow background, reminder messaging  
🟢 Info (8+ days): Blue background, informational messaging
```

---

### **📥 Input Component**

#### Specification:
- **Height:** 48px (consistent with SearchBox and buttons)
- **Padding:** 16px horizontal, appropriate vertical centering
- **States:** Default, focus, error, success, disabled, loading
- **Label:** Floating label or top-positioned (configurable)
- **Validation:** Real-time validation with immediate error display
- **Helper Text:** Support for hint text and error messages
- **Icons:** Optional leading/trailing icons (16px size)

#### ASCII Layout:
```
Input with Floating Label (Focus State):
┌─────────────────────────────────────────┐ 48px height
│ Email                               ⚠️  │ ← Floating label (top) + trailing icon
│ tu@email.com|                          │ ← Input text with cursor
└─────────────────────────────────────────┘ ← Focus border (blue)
                                           ← 8px gap
El email no es válido                     ← Error message (red, real-time)

Input with Top Label:
Email *                                   ← Label with required asterisk (12px above)
┌─────────────────────────────────────────┐ 48px height
│ 📧 tu@email.com|                       │ ← Leading icon + input text
└─────────────────────────────────────────┘
                                           ← 8px gap
Introduce tu dirección de email           ← Helper text (muted, optional)

Input States Visual Reference:
┌─────────────────────────────────────────┐ Default
│ Placeholder text...                     │ (gray border)
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐ Focus
│ Active input text|                      │ (blue border + shadow)
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐ Error
│ Invalid input text                      │ (red border)
└─────────────────────────────────────────┘
⚠️ Error message appears immediately

┌─────────────────────────────────────────┐ Success
│ Valid input text                      ✅ │ (green border + check icon)
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐ Disabled
│ Disabled input text                     │ (gray background, reduced opacity)
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐ Loading
│ Processing...                        ⟲  │ (spinner icon, disabled state)
└─────────────────────────────────────────┘
```

---

### **💳 PricingCard Component**

#### Specification:
- **Purpose**: Display individual subscription plan with pricing, features, and CTA
- **Layout**: Card-based design with clear hierarchy and prominent CTA
- **Responsive**: Stack vertically on mobile, horizontal on desktop
- **States**: Default, hover, selected, loading, disabled
- **Animation**: Subtle hover effects and selection states

#### ASCII Layout:
```
Mobile Layout (Stacked):
┌─────────────────────────────────────────┐
│                                         │ ← 24px padding
│  💎 Plan Mensual                        │ ← Plan icon + title (24px gap)
│                                         │ ← 16px gap
│  €1                                     │ ← Price (large, prominent)
│  por mes                                │ ← Price period (smaller)
│                                         │ ← 24px gap
│  ✓ Acceso completo al diccionario      │ ← Feature list (16px between items)
│  ✓ Búsqueda offline                     │
│  ✓ Sin anuncios                         │
│  ✓ Cancela cuando quieras               │
│                                         │ ← 24px gap
│  ┌─────────────────────────────────────┐ │
│  │        Elegir Plan Mensual          │ │ ← Primary CTA button (48px height)
│  └─────────────────────────────────────┘ │
│                                         │ ← 24px padding
└─────────────────────────────────────────┘

Desktop Layout (Vertical - Same as Mobile):
┌─────────────────────────────────────────────────────────────────────────────┐
│  💎 Plan Mensual                                                           │ ← Plan header
│                                                                             │
│  €1                                                                         │ ← Price
│  por mes                                                                    │ ← Period
│                                                                             │
│  ✓ Acceso completo al diccionario                                          │ ← Features
│  ✓ Búsqueda offline                                                         │
│  ✓ Sin anuncios                                                             │
│  ✓ Cancela cuando quieras                                                   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                Elegir Plan Mensual                                   │   │ ← CTA button
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘

Selected State (Annual Plan):
┌─────────────────────────────────────────────────────────────────────────────┐
│  🏆 Plan Anual ★ Más Popular        €8.97 por año                         │ ← Popular badge
│                                         │                                 │
│  ✓ Acceso completo al diccionario      │ ┌─────────────────────────────┐   │
│  ✓ Búsqueda offline                     │ │   Elegir Plan Anual        │   │
│  ✓ Sin anuncios                         │ │     (25% descuento)        │   │
│  ✓ Cancela cuando quieras               │ └─────────────────────────────┘   │
│  ✓ Ahorras €3.03 al año                 │                                 │
│                                         │                                 │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### CSS Implementation Requirements:
```scss
.pricing-card {
  background: var(--color-primary);
  border: 2px solid var(--color-border);
  border-radius: var(--border-radius-lg);
  padding: var(--space-8); // 24px
  transition: all var(--transition-normal);
  position: relative;
  
  // Vertical layout on all screen sizes
  display: flex;
  flex-direction: column;
  gap: var(--space-6); // 16px between sections
  
  &:hover {
    border-color: var(--color-secondary);
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
  }
  
  &.selected {
    border-color: var(--color-secondary);
    background: linear-gradient(135deg, var(--color-primary) 0%, rgba(212, 91, 65, 0.05) 100%);
    
    &::before {
      content: '';
      position: absolute;
      top: -2px;
      left: -2px;
      right: -2px;
      bottom: -2px;
      background: linear-gradient(135deg, var(--color-secondary), var(--color-secondary);
      border-radius: var(--border-radius-lg);
      z-index: -1;
    }
  }
  
  .plan-header {
    display: flex;
    align-items: center;
    gap: var(--space-4); // 8px between icon and title
    
    .plan-icon {
      width: 24px;
      height: 24px;
      color: var(--color-secondary);
    }
    
    .plan-title {
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text);
      
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
    gap: var(--space-2); // 4px between price and period
    
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
      gap: var(--space-3); // 8px between checkmark and text
      margin-bottom: var(--space-4); // 16px between features
      
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
    
    .cta-button {
      width: 100%;
      height: var(--space-11); // 48px
      background: var(--color-secondary);
      color: white;
      border: none;
      border-radius: var(--border-radius);
      font-size: var(--font-size-base);
      font-weight: var(--font-weight-semibold);
      cursor: pointer;
      transition: all var(--transition-fast);
      
      &:hover:not(:disabled) {
        background: var(--color-secondary-dark);
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
```

#### Vue Implementation Example:
```vue
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
      <div class="plan-icon">
        <Icon :name="plan.icon" size="lg" />
      </div>
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
```

---

### **📊 FeatureComparison Component**

#### Specification:
- **Purpose**: Compare trial vs paid features to encourage upgrade conversion
- **Layout**: Table-like comparison with clear visual hierarchy
- **Responsive**: Stack on mobile, horizontal on desktop
- **States**: Default, expanded (mobile), collapsed (mobile)
- **Animation**: Smooth expand/collapse for mobile experience

#### ASCII Layout:
```
Mobile Layout (Collapsed):
┌─────────────────────────────────────────┐
│                                         │ ← 24px padding
│  🔍 Compara Planes                      │ ← Title (24px gap)
│                                         │ ← 16px gap
│  ┌─────────────────────────────────────┐ │
│  │  Gratis (14 días)    Premium       │ │ ← Plan headers (collapsed)
│  │  ████████████        ████████████   │ │
│  └─────────────────────────────────────┘ │
│                                         │ ← 16px gap
│  [ Ver todas las diferencias ]          │ ← Expand button (24px gap)
│                                         │ ← 24px padding
└─────────────────────────────────────────┘

Mobile Layout (Expanded):
┌─────────────────────────────────────────┐
│                                         │ ← 24px padding
│  🔍 Compara Planes                      │ ← Title (24px gap)
│                                         │ ← 16px gap
│  ┌─────────────────────────────────────┐ │
│  │  Gratis (14 días)    Premium       │ │ ← Plan headers
│  │  ████████████        ████████████   │ │
│  └─────────────────────────────────────┘ │
│                                         │ ← 16px gap
│  ✓ Búsquedas ilimitadas                │ ← Feature comparison rows
│  ✗ Búsquedas ilimitadas                │
│                                         │ ← 8px gap
│  ✓ Acceso offline                      │ ← Feature comparison rows
│  ✗ Acceso offline                      │
│                                         │ ← 8px gap
│  ✓ Sin anuncios                         │ ← Feature comparison rows
│  ✗ Con anuncios                         │
│                                         │ ← 8px gap
│  ✓ Sincronización                      │ ← Feature comparison rows
│  ✗ Sin sincronización                  │
│                                         │ ← 16px gap
│  [ Ocultar diferencias ]                │ ← Collapse button (24px gap)
│                                         │ ← 24px padding
└─────────────────────────────────────────┘

Desktop Layout (Always Expanded):
┌─────────────────────────────────────────────────────────────────────────────┐
│  🔍 Compara Planes                                                         │ ← Title (48px gap)
│                                                                             │
│  ┌─────────────────────────────────────┬─────────────────────────────────┐ │
│  │  Gratis (14 días)                  │  Premium                        │ │ ← Plan headers
│  │  ██████████████████████████████████ │  ████████████████████████████████ │ │
│  ├─────────────────────────────────────┼─────────────────────────────────┤ │
│  │  ✓ Búsquedas ilimitadas            │  ✓ Búsquedas ilimitadas          │ │ ← Feature rows
│  ├─────────────────────────────────────┼─────────────────────────────────┤ │
│  │  ✗ Acceso offline                  │  ✓ Acceso offline                │ │
│  ├─────────────────────────────────────┼─────────────────────────────────┤ │
│  │  ✗ Sin anuncios                     │  ✓ Sin anuncios                 │ │
│  ├─────────────────────────────────────┼─────────────────────────────────┤ │
│  │  ✗ Sincronización                  │  ✓ Sincronización                │ │
│  ├─────────────────────────────────────┼─────────────────────────────────┤ │
│  │  ✗ Soporte prioritario              │  ✓ Soporte prioritario          │ │
│  └─────────────────────────────────────┴─────────────────────────────────┘ │
│                                                                             │
│  ┌─────────────────────────────────────┐                                   │ ← CTA section
│  │        Actualizar Ahora             │                                   │ (48px gap)
│  └─────────────────────────────────────┘                                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### CSS Implementation Requirements:
```scss
.feature-comparison {
  background: var(--color-primary);
  border-radius: var(--border-radius-lg);
  padding: var(--space-8); // 24px
  box-shadow: var(--shadow-sm);
  
  .comparison-header {
    text-align: center;
    margin-bottom: var(--space-8); // 24px
    
    .comparison-title {
      font-size: var(--font-size-xl);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-3); // 8px between icon and text
      
      .comparison-icon {
        width: 20px;
        height: 20px;
        color: var(--color-secondary);
      }
    }
  }
  
  .comparison-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: var(--space-8); // 24px
    
    // Mobile: hide table, show mobile layout
    @media (max-width: 767px) {
      display: none;
    }
    
    .plan-header {
      text-align: center;
      padding: var(--space-6); // 16px
      border-bottom: 2px solid var(--color-border);
      
      .plan-name {
        font-size: var(--font-size-lg);
        font-weight: var(--font-weight-semibold);
        color: var(--color-text);
        margin-bottom: var(--space-2); // 4px
      }
      
      .plan-badge {
        display: inline-block;
        background: var(--color-secondary);
        color: white;
        font-size: var(--font-size-xs);
        padding: var(--space-1) var(--space-3);
        border-radius: var(--border-radius);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
    }
    
    .feature-row {
      border-bottom: 1px solid var(--color-border-light);
      
      &:last-child {
        border-bottom: none;
      }
      
      .feature-name {
        padding: var(--space-5) var(--space-6); // 12px vertical, 16px horizontal
        font-size: var(--font-size-base);
        color: var(--color-text);
        font-weight: var(--font-weight-medium);
      }
      
      .feature-status {
        text-align: center;
        padding: var(--space-5) var(--space-6);
        
        .status-icon {
          width: 20px;
          height: 20px;
          
          &.available {
            color: var(--color-success);
          }
          
          &.unavailable {
            color: var(--color-error);
          }
        }
      }
    }
  }
  
  .mobile-comparison {
    // Desktop: hide mobile layout
    @media (min-width: 768px) {
      display: none;
    }
    
    .mobile-plan-headers {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-4); // 8px between columns
      margin-bottom: var(--space-6); // 16px
      
      .mobile-plan-header {
        text-align: center;
        padding: var(--space-5); // 12px
        background: var(--color-background);
        border-radius: var(--border-radius);
        
        .mobile-plan-name {
          font-size: var(--font-size-base);
          font-weight: var(--font-weight-semibold);
          color: var(--color-text);
          margin-bottom: var(--space-2); // 4px
        }
        
        .mobile-plan-badge {
          display: inline-block;
          background: var(--color-secondary);
          color: white;
          font-size: var(--font-size-xs);
          padding: var(--space-1) var(--space-3);
          border-radius: var(--border-radius);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
      }
    }
    
    .mobile-features {
      display: none; // Hidden by default on mobile
      
      &.expanded {
        display: block;
      }
      
      .mobile-feature-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: var(--space-4); // 8px between columns
        padding: var(--space-4) 0; // 8px vertical
        border-bottom: 1px solid var(--color-border-light);
        
        &:last-child {
          border-bottom: none;
        }
        
        .mobile-feature-name {
          font-size: var(--font-size-sm);
          color: var(--color-text-muted);
          font-weight: var(--font-weight-medium);
        }
        
        .mobile-feature-status {
          text-align: center;
          
          .mobile-status-icon {
            width: 16px;
            height: 16px;
            
            &.available {
              color: var(--color-success);
            }
            
            &.unavailable {
              color: var(--color-error);
            }
          }
        }
      }
    }
    
    .mobile-toggle {
      width: 100%;
      background: none;
      border: 1px solid var(--color-border);
      border-radius: var(--border-radius);
      padding: var(--space-4) var(--space-6); // 8px vertical, 16px horizontal
      font-size: var(--font-size-base);
      color: var(--color-text);
      cursor: pointer;
      transition: all var(--transition-fast);
      
      &:hover {
        border-color: var(--color-secondary);
        background: var(--color-background);
      }
      
      .toggle-icon {
        width: 16px;
        height: 16px;
        margin-left: var(--space-3); // 8px
        transition: transform var(--transition-fast);
        
        &.expanded {
          transform: rotate(180deg);
        }
      }
    }
  }
  
  .comparison-cta {
    text-align: center;
    
    .cta-button {
      height: var(--space-11); // 48px
      padding: 0 var(--space-11); // 0 horizontal, 48px vertical
      background: var(--color-secondary);
      color: white;
      border: none;
      border-radius: var(--border-radius);
      font-size: var(--font-size-base);
      font-weight: var(--font-weight-semibold);
      cursor: pointer;
      transition: all var(--transition-fast);
      
      &:hover:not(:disabled) {
        background: var(--color-secondary-dark);
        transform: translateY(-1px);
      }
      
      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }
  }
}
```

#### Vue Implementation Example:
```vue
<template>
  <div class="feature-comparison">
    <!-- Comparison Header -->
    <div class="comparison-header">
      <div class="comparison-title">
        <Icon name="bar-chart-3" class="comparison-icon" />
        Compara Planes
      </div>
    </div>
    
    <!-- Desktop Comparison Table -->
    <table class="comparison-table">
      <thead>
        <tr>
          <th class="plan-header">
            <div class="plan-name">Gratis (14 días)</div>
            <div class="plan-badge">Trial</div>
          </th>
          <th class="plan-header">
            <div class="plan-name">Premium</div>
            <div class="plan-badge">Recomendado</div>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr 
          v-for="feature in features" 
          :key="feature.id"
          class="feature-row"
        >
          <td class="feature-name">{{ feature.name }}</td>
          <td class="feature-status">
            <Icon 
              :name="feature.trial ? 'check' : 'x'" 
              class="status-icon"
              :class="feature.trial ? 'available' : 'unavailable'"
            />
          </td>
          <td class="feature-status">
            <Icon 
              :name="feature.premium ? 'check' : 'x'" 
              class="status-icon"
              :class="feature.premium ? 'available' : 'unavailable'"
            />
          </td>
        </tr>
      </tbody>
    </table>
    
    <!-- Mobile Comparison -->
    <div class="mobile-comparison">
      <div class="mobile-plan-headers">
        <div class="mobile-plan-header">
          <div class="mobile-plan-name">Gratis (14 días)</div>
          <div class="mobile-plan-badge">Trial</div>
        </div>
        <div class="mobile-plan-header">
          <div class="mobile-plan-name">Premium</div>
          <div class="mobile-plan-badge">Recomendado</div>
        </div>
      </div>
      
      <div 
        class="mobile-features"
        :class="{ expanded: isExpanded }"
      >
        <div 
          v-for="feature in features" 
          :key="feature.id"
          class="mobile-feature-row"
        >
          <div class="mobile-feature-name">{{ feature.name }}</div>
          <div class="mobile-feature-status">
            <Icon 
              :name="feature.trial ? 'check' : 'x'" 
              class="mobile-status-icon"
              :class="feature.trial ? 'available' : 'unavailable'"
            />
          </div>
          <div class="mobile-feature-status">
            <Icon 
              :name="feature.premium ? 'check' : 'x'" 
              class="mobile-status-icon"
              :class="feature.premium ? 'available' : 'unavailable'"
            />
          </div>
        </div>
      </div>
      
      <button 
        class="mobile-toggle"
        @click="toggleExpanded"
      >
        {{ toggleText }}
        <Icon 
          name="chevron-down" 
          class="toggle-icon"
          :class="{ expanded: isExpanded }"
        />
      </button>
    </div>
    
    <!-- Comparison CTA -->
    <div class="comparison-cta">
      <button
        class="cta-button"
        :disabled="disabled"
        @click="handleUpgrade"
      >
        Actualizar Ahora
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Feature {
  id: string
  name: string
  trial: boolean
  premium: boolean
}

interface Props {
  features: Feature[]
  disabled?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'upgrade': []
}>()

const isExpanded = ref(false)

const toggleText = computed(() => 
  isExpanded ? 'Ocultar diferencias' : 'Ver todas las diferencias'
)

const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value
}

const handleUpgrade = () => {
  if (!props.disabled) {
    emit('upgrade')
  }
}
</script>
```

---

## **✅ Implementation Strategy for Phase 4A**

### **Component Priority Order:**
1. **Icon Component** - Foundation for all other components
2. **Input Component** - Required for forms (signup/login)
3. **Modal Component** - Required for auth flows
4. **EmptyState Component** - Required for landing page
5. **TrialBanner Component** - Required for subscription flows

### **Dependencies Setup:**
```bash
# Install Nuxt Icon v1 with Lucide
npx nuxi@latest module add icon
```

### **⚡ Performance Strategy**

Each component built with:
- ✅ **Zero magic numbers** - All dimensions use design system variables
- ✅ **Interactive states** - Hover, focus, disabled properly implemented
- ✅ **TypeScript interfaces** - Complete type safety
- ✅ **Accessibility** - WCAG 2.1 compliant
- ✅ **Real-time validation** - Immediate user feedback
- ✅ **Responsive design** - Mobile-first implementation 
```

---

### **💳 PaymentForm Component**

#### Specification:
- **Purpose**: Stripe payment form for subscription completion
- **Layout**: Clean form with card input, billing details, and confirmation
- **Responsive**: Single column on mobile, two columns on desktop
- **States**: Default, loading, validation errors, success
- **Integration**: Stripe Elements for secure payment processing (confirmed integration)
- **Validation**: Real-time card validation and error display

#### ASCII Layout:
```
Mobile Layout (Single Column):
┌─────────────────────────────────────────┐
│                                         │ ← 24px padding
│  💳 Información de Pago                 │ ← Title (24px gap)
│                                         │ ← 16px gap
│  ┌─────────────────────────────────────┐ │
│  │  🏠 Dirección de Facturación        │ │ ← Section header (16px gap)
│  │                                     │ │
│  │  Nombre completo *                  │ │ ← Input field (16px gap)
│  │  ┌─────────────────────────────────┐ │
│  │  │ Juan Pérez                      │ │ ← Text input (48px height)
│  │  └─────────────────────────────────┘ │
│  │                                     │ │
│  │  Email *                            │ │ ← Input field (16px gap)
│  │  ┌─────────────────────────────────┐ │
│  │  │ juan@email.com                  │ │ ← Email input (48px height)
│  │  └─────────────────────────────────┘ │
│  │                                     │ │
│  │  País *                             │ │ ← Input field (16px gap)
│  │  ┌─────────────────────────────────┐ │
│  │  │ España ▼                        │ │ ← Select dropdown (48px height)
│  │  └─────────────────────────────────┘ │
│  └─────────────────────────────────────┘ │
│                                         │ ← 24px gap
│  ┌─────────────────────────────────────┐ │
│  │  💳 Detalles de la Tarjeta          │ │ ← Section header (16px gap)
│  │                                     │ │
│  │  Número de tarjeta *                │ │ ← Input field (16px gap)
│  │  ┌─────────────────────────────────┐ │
│  │  │ 4242 4242 4242 4242            │ │ ← Stripe card input (48px height)
│  │  └─────────────────────────────────┘ │
│  │                                     │ │
│  │  ┌─────────────┐ ┌─────────────────┐ │ ← Two-column layout
│  │  │ Fecha *     │ │ CVC *           │ │
│  │  │ ┌─────────┐ │ │ ┌─────────────┐ │ │
│  │  │ │ 12/25   │ │ │ │ 123         │ │ │
│  │  │ └─────────┘ │ │ └─────────────┘ │ │
│  │  └─────────────┘ └─────────────────┘ │
│  └─────────────────────────────────────┘ │
│                                         │ ← 24px gap
│  ┌─────────────────────────────────────┐ │
│  │  📋 Resumen de Suscripción          │ │ ← Section header (16px gap)
│  │                                     │ │
│  │  Plan Anual                         │ │ ← Plan details (16px gap)
│  │  €8.97 por año                      │ │
│  │  ✓ Acceso completo al diccionario  │ │
│  │  ✓ Búsqueda offline                 │ │
│  │  ✓ Sin anuncios                     │ │
│  │                                     │ │
│  │  ┌─────────────────────────────────┐ │
│  │  │ Total: €8.97                    │ │ ← Total amount (prominent)
│  │  └─────────────────────────────────┘ │
│  └─────────────────────────────────────┘ │
│                                         │ ← 24px gap
│  ┌─────────────────────────────────────┐ │
│  │        Confirmar Pago               │ │ ← Primary CTA (48px height)
│  └─────────────────────────────────────┘ │
│                                         │ ← 16px gap
│  Al confirmar, aceptas nuestros        │ ← Terms text (small)
│  términos y condiciones de pago         │
│                                         │ ← 24px padding
└─────────────────────────────────────────┘

Desktop Layout (Two Columns):
┌─────────────────────────────────────────────────────────────────────────────┐
│  💳 Información de Pago                                                 │ ← Title (48px gap)
│                                                                             │
│  ┌─────────────────────────────────────┐ ┌─────────────────────────────────┐ │
│  │  🏠 Dirección de Facturación        │ │  💳 Detalles de la Tarjeta        │ │ ← Two columns
│  │                                     │ │                                     │
│  │  Nombre completo *                  │ │  Número de tarjeta *                │ │
│  │  ┌─────────────────────────────────┐ │  ┌─────────────────────────────────┐ │
│  │  │ Juan Pérez                      │ │  │ 4242 4242 4242 4242            │ │
│  │  └─────────────────────────────────┘ │  └─────────────────────────────────┘ │
│  │                                     │ │                                     │
│  │  Email *                            │ │  ┌─────────────┐ ┌─────────────────┐ │
│  │  ┌─────────────────────────────────┐ │ │  Fecha *     │ │ CVC *           │ │
│  │  │ juan@email.com                  │ │ │ ┌─────────┐ │ │ ┌─────────────┐ │ │
│  │  └─────────────────────────────────┘ │ │ │ 12/25   │ │ │ │ 123         │ │ │
│  │                                     │ │ │ └─────────┘ │ │ └─────────────┘ │ │
│  │  País *                             │ │ └─────────────┘ └─────────────────┘ │
│  │  ┌─────────────────────────────────┐ │ │                                     │
│  │  │ España ▼                        │ │ │                                     │
│  │  └─────────────────────────────────┘ │ │                                     │
│  └─────────────────────────────────────┘ └─────────────────────────────────────┘ │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │  📋 Resumen de Suscripción                                              │ │ ← Full-width section
│  │                                                                         │
│  │  Plan Anual                    €8.97 por año                            │
│  │  ✓ Acceso completo al diccionario  ✓ Búsqueda offline                   │
│  │  ✓ Sin anuncios                     ✓ Sincronización                    │
│  │                                                                         │
│  │  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │  │ Total: €8.97                                                        │ │
│  │  └─────────────────────────────────────────────────────────────────────┘ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                    Confirmar Pago                                       │ │ ← Centered CTA
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  Al confirmar, aceptas nuestros términos y condiciones de pago             │ ← Terms text
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### CSS Implementation Requirements:
```scss
.payment-form {
  background: var(--color-primary);
  border-radius: var(--border-radius-lg);
  padding: var(--space-8); // 24px
  box-shadow: var(--shadow-sm);
  
  .form-header {
    text-align: center;
    margin-bottom: var(--space-8); // 24px
    
    .form-title {
      font-size: var(--font-size-xl);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-3); // 8px between icon and text
      
      .form-icon {
        width: 20px;
        height: 20px;
        color: var(--color-secondary);
      }
    }
  }
  
  .form-sections {
    display: grid;
    gap: var(--space-8); // 24px between sections
    
    // Mobile: single column, Desktop: two columns
    grid-template-columns: 1fr;
    
    @media (min-width: 1024px) {
      grid-template-columns: 1fr 1fr;
      gap: var(--space-11); // 48px between columns
    }
  }
  
  .form-section {
    .section-header {
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text);
      margin-bottom: var(--space-6); // 16px
      display: flex;
      align-items: center;
      gap: var(--space-3); // 8px between icon and text
      
      .section-icon {
        width: 20px;
        height: 20px;
        color: var(--color-secondary);
      }
    }
    
    .form-group {
      margin-bottom: var(--space-6); // 16px between form groups
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .form-label {
        display: block;
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-medium);
        color: var(--color-text);
        margin-bottom: var(--space-3); // 8px below label
        
        .required {
          color: var(--color-error);
          margin-left: var(--space-1); // 2px
        }
      }
      
      .form-input {
        width: 100%;
        height: var(--space-11); // 48px
        padding: 0 var(--space-6); // 0 vertical, 16px horizontal
        border: 1px solid var(--color-border);
        border-radius: var(--border-radius);
        font-size: var(--font-size-base);
        color: var(--color-text);
        background: var(--color-primary);
        transition: all var(--transition-fast);
        
        &:focus {
          outline: none;
          border-color: var(--color-secondary);
          box-shadow: 0 0 0 3px rgba(212, 91, 65, 0.1);
        }
        
        &.error {
          border-color: var(--color-error);
        }
        
        &.success {
          border-color: var(--color-success);
        }
      }
      
      .form-select {
        @extend .form-input;
        cursor: pointer;
        background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
        background-position: right var(--space-4) center;
        background-repeat: no-repeat;
        background-size: 16px;
        padding-right: var(--space-11); // 48px to avoid text overlap with arrow
      }
      
      .form-error {
        color: var(--color-error);
        font-size: var(--font-size-sm);
        margin-top: var(--space-2); // 4px above error
        display: flex;
        align-items: center;
        gap: var(--space-2); // 4px between icon and text
        
        .error-icon {
          width: 16px;
          height: 16px;
        }
      }
    }
    
    .card-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-4); // 8px between columns
    }
  }
  
  .subscription-summary {
    grid-column: 1 / -1; // Full width on all screen sizes
    
    .summary-header {
      @extend .form-section .section-header;
    }
    
    .plan-details {
      background: var(--color-background);
      padding: var(--space-6); // 16px
      border-radius: var(--border-radius);
      margin-bottom: var(--space-6); // 16px
      
      .plan-name {
        font-size: var(--font-size-lg);
        font-weight: var(--font-weight-semibold);
        color: var(--color-text);
        margin-bottom: var(--space-2); // 4px
      }
      
      .plan-price {
        font-size: var(--font-size-base);
        color: var(--color-text-muted);
        margin-bottom: var(--space-4); // 8px
      }
      
      .plan-features {
        list-style: none;
        padding: 0;
        margin: 0;
        
        .feature-item {
          display: flex;
          align-items: center;
          gap: var(--space-3); // 8px between checkmark and text
          margin-bottom: var(--space-3); // 8px between features
          
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
            font-size: var(--font-size-sm);
            color: var(--color-text-muted);
          }
        }
      }
    }
    
    .total-amount {
      background: var(--color-secondary);
      color: white;
      padding: var(--space-6); // 16px
      border-radius: var(--border-radius);
      text-align: center;
      font-size: var(--font-size-xl);
      font-weight: var(--font-weight-bold);
    }
  }
  
  .form-actions {
    grid-column: 1 / -1; // Full width
    text-align: center;
    margin-top: var(--space-8); // 24px above actions
    
    .submit-button {
      height: var(--space-11); // 48px
      padding: 0 var(--space-11); // 0 vertical, 48px horizontal
      background: var(--color-secondary);
      color: white;
      border: none;
      border-radius: var(--border-radius);
      font-size: var(--font-size-base);
      font-weight: var(--font-weight-semibold);
      cursor: pointer;
      transition: all var(--transition-fast);
      min-width: 200px;
      
      &:hover:not(:disabled) {
        background: var(--color-secondary-dark);
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
    
    .terms-text {
      font-size: var(--font-size-sm);
      color: var(--color-text-muted);
      margin-top: var(--space-4); // 8px above terms
      line-height: var(--line-height-normal);
    }
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

#### Vue Implementation Example:
```vue
<template>
  <form @submit.prevent="handleSubmit" class="payment-form">
    <!-- Form Header -->
    <div class="form-header">
      <div class="form-title">
        <Icon name="credit-card" class="form-icon" />
        Información de Pago
      </div>
    </div>
    
    <div class="form-sections">
      <!-- Billing Information -->
      <div class="form-section">
        <div class="section-header">
          <Icon name="home" class="section-icon" />
          Dirección de Facturación
        </div>
        
        <div class="form-group">
          <label class="form-label">
            Nombre completo <span class="required">*</span>
          </label>
          <input
            v-model="form.fullName"
            type="text"
            class="form-input"
            :class="{ error: errors.fullName }"
            placeholder="Juan Pérez"
            required
          />
          <div v-if="errors.fullName" class="form-error">
            <Icon name="alert-circle" class="error-icon" />
            {{ errors.fullName }}
          </div>
        </div>
        
        <div class="form-group">
          <label class="form-label">
            Email <span class="required">*</span>
          </label>
          <input
            v-model="form.email"
            type="email"
            class="form-input"
            :class="{ error: errors.email }"
            placeholder="juan@email.com"
            required
          />
          <div v-if="errors.email" class="form-error">
            <Icon name="alert-circle" class="error-icon" />
            {{ errors.email }}
          </div>
        </div>
        
        <div class="form-group">
          <label class="form-label">
            País <span class="required">*</span>
          </label>
          <select
            v-model="form.country"
            class="form-select"
            :class="{ error: errors.country }"
            required
          >
            <option value="">Seleccionar país</option>
            <option value="ES">España</option>
            <option value="MX">México</option>
            <option value="AR">Argentina</option>
            <option value="CO">Colombia</option>
          </select>
          <div v-if="errors.country" class="form-error">
            <Icon name="alert-circle" class="error-icon" />
            {{ errors.country }}
          </div>
        </div>
      </div>
      
      <!-- Card Details -->
      <div class="form-section">
        <div class="section-header">
          <Icon name="credit-card" class="section-icon" />
          Detalles de la Tarjeta
        </div>
        
        <div class="form-group">
          <label class="form-label">
            Número de tarjeta <span class="required">*</span>
          </label>
          <div
            ref="cardElement"
            class="form-input"
            :class="{ error: errors.card }"
          ></div>
          <div v-if="errors.card" class="form-error">
            <Icon name="alert-circle" class="error-icon" />
            {{ errors.card }}
          </div>
        </div>
        
        <div class="card-row">
          <div class="form-group">
            <label class="form-label">
              Fecha <span class="required">*</span>
            </label>
            <div
              ref="expiryElement"
              class="form-input"
              :class="{ error: errors.expiry }"
            ></div>
            <div v-if="errors.expiry" class="form-error">
              <Icon name="alert-circle" class="error-icon" />
              {{ errors.expiry }}
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label">
              CVC <span class="required">*</span>
            </label>
            <div
              ref="cvcElement"
              class="form-input"
              :class="{ error: errors.cvc }"
            ></div>
            <div v-if="errors.cvc" class="form-error">
              <Icon name="alert-circle" class="error-icon" />
              {{ errors.cvc }}
            </div>
          </div>
        </div>
      </div>
      
      <!-- Subscription Summary -->
      <div class="subscription-summary">
        <div class="summary-header">
          <Icon name="file-text" class="section-icon" />
          Resumen de Suscripción
        </div>
        
        <div class="plan-details">
          <div class="plan-name">{{ selectedPlan.title }}</div>
          <div class="plan-price">€{{ selectedPlan.price }} {{ selectedPlan.period }}</div>
          <ul class="plan-features">
            <li 
              v-for="feature in selectedPlan.features" 
              :key="feature"
              class="feature-item"
            >
              <Icon name="check" class="checkmark" />
              <span class="feature-text">{{ feature }}</span>
            </li>
          </ul>
        </div>
        
        <div class="total-amount">
          Total: €{{ selectedPlan.price }}
        </div>
      </div>
      
      <!-- Form Actions -->
      <div class="form-actions">
        <button
          type="submit"
          class="submit-button"
          :class="{ loading: isSubmitting }"
          :disabled="isSubmitting || !isFormValid"
        >
          {{ submitText }}
        </button>
        
        <div class="terms-text">
          Al confirmar, aceptas nuestros términos y condiciones de pago
        </div>
      </div>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { loadStripe } from '@stripe/stripe-js'

interface Plan {
  id: string
  title: string
  price: number
  period: string
  features: string[]
  priceId: string
}

interface Props {
  selectedPlan: Plan
  disabled?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'payment-success': [paymentIntent: any]
  'payment-error': [error: string]
}>()

// Form state
const form = ref({
  fullName: '',
  email: '',
  country: ''
})

const errors = ref({
  fullName: '',
  email: '',
  country: '',
  card: '',
  expiry: '',
  cvc: ''
})

const isSubmitting = ref(false)

// Stripe elements
const stripe = ref<any>(null)
const cardElement = ref<HTMLElement>()
const expiryElement = ref<HTMLElement>()
const cvcElement = ref<HTMLElement>()

// Form validation
const isFormValid = computed(() => {
  return form.value.fullName && 
         form.value.email && 
         form.value.country &&
         !Object.values(errors.value).some(error => error)
})

const submitText = computed(() => {
  if (isSubmitting.value) return 'Procesando...'
  return 'Confirmar Pago'
})

// Initialize Stripe
onMounted(async () => {
  stripe.value = await loadStripe(process.env.NUXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
  
  if (stripe.value && cardElement.value && expiryElement.value && cvcElement.value) {
    const elements = stripe.value.elements()
    
    // Create card elements
    const card = elements.create('cardNumber')
    const expiry = elements.create('cardExpiry')
    const cvc = elements.create('cardCvc')
    
    // Mount elements
    card.mount(cardElement.value)
    expiry.mount(expiryElement.value)
    cvc.mount(cvcElement.value)
    
    // Handle validation
    card.on('change', (event: any) => {
      if (event.error) {
        errors.value.card = event.error.message
      } else {
        errors.value.card = ''
      }
    })
  }
})

// Handle form submission
const handleSubmit = async () => {
  if (!stripe.value || !isFormValid.value) return
  
  isSubmitting.value = true
  
  try {
    // Create payment method
    const { paymentMethod, error } = await stripe.value.createPaymentMethod({
      type: 'card',
      card: cardElement.value,
      billing_details: {
        name: form.value.fullName,
        email: form.value.email,
        address: {
          country: form.value.country
        }
      }
    })
    
    if (error) {
      throw new Error(error.message)
    }
    
    // Create checkout session
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        priceId: props.selectedPlan.priceId,
        paymentMethodId: paymentMethod.id
      })
    })
    
    const { sessionId } = await response.json()
    
    // Redirect to Stripe checkout
    const { error: checkoutError } = await stripe.value.redirectToCheckout({
      sessionId
    })
    
    if (checkoutError) {
      throw new Error(checkoutError.message)
    }
    
    emit('payment-success', { sessionId })
    
  } catch (error: any) {
    emit('payment-error', error.message)
  } finally {
    isSubmitting.value = false
  }
}
</script>
```

---

### **✅ PaymentConfirmation Component**

#### Specification:
- **Purpose**: Display payment success/failure states with clear next steps
- **Layout**: Modal overlay with centered confirmation content
- **States**: Success, error, processing, timeout
- **Responsive**: Mobile-first design with proper touch targets
- **Animation**: Fade-in overlay with slide-up content
- **Actions**: Success redirect, error retry, timeout refresh

#### ASCII Layout:
```
Success State Modal:
┌─────────────────── 100vw ───────────────────┐ 100vh
│████████████████ OVERLAY ████████████████████│ (backdrop blur + click to close)
│███████████████████████████████████████████││
│██████████┌─────────────────────────────┐███││ 
│██████████│                           ✕ │███││ ← Close button (32×32px touch target)
│██████████│                             │███││ ← 32px padding
│██████████│         🎉 ¡Éxito!          │███││ ← Success icon + title (32px gap)
│██████████│                             │███││ ← 16px gap
│██████████│   Tu suscripción ha sido    │███││ ← Success message (16px gap)
│██████████│   activada correctamente    │███││
│██████████│                             │███││ ← 24px gap
│██████████│  ┌─────────────────────────┐ │███││
│██████████│  │    Plan Anual           │ │███││ ← Plan details (16px gap)
│██████████│  │    €8.97 por año        │ │███││
│██████████│  │    Próximo cobro:       │ │███││
│██████████│  │    15 de enero 2025     │ │███││
│██████████│  └─────────────────────────┘ │███││
│██████████│                             │███││ ← 24px gap
│██████████│  ┌─────────────────────────┐ │███││
│██████████│  │      Ir al Diccionario  │ │███││ ← Primary CTA (48px height)
│██████████│  └─────────────────────────┘ │███││
│██████████│                             │███││ ← 16px gap
│██████████│  ┌─────────────────────────┐ │███││
│██████████│  │    Ver Factura          │ │███││ ← Secondary CTA (48px height)
│██████████│  └─────────────────────────┘ │███││
│██████████│                             │███││ ← 32px padding
│██████████└─────────────────────────────┘███││
│███████████████████████████████████████████││
└─────────────────────────────────────────────┘
   ↑                                       ↑
 Max 480px width                     Centered

Error State Modal:
┌─────────────────── 100vw ───────────────────┐ 100vh
│████████████████ OVERLAY ████████████████████│
│███████████████████████████████████████████││
│██████████┌─────────────────────────────┐███││ 
│██████████│                           ✕ │███││
│██████████│                             │███││
│██████████│         ⚠️ Error            │███││ ← Error icon + title
│██████████│                             │███││
│██████████│   No se pudo procesar tu    │███││ ← Error message
│██████████│   pago. Por favor,          │███││
│██████████│   inténtalo de nuevo.      │███││
│██████████│                             │███││
│██████████│  ┌─────────────────────────┐ │███││
│██████████│  │    Intentar de Nuevo    │ │███││ ← Primary CTA (retry)
│██████████│  └─────────────────────────┘ │███││
│██████████│                             │███││
│██████████│  ┌─────────────────────────┐ │███││
│██████████│  │        Cancelar         │ │███││ ← Secondary CTA (close)
│██████████│  └─────────────────────────┘ │███││
│██████████│                             │███││
│██████████└─────────────────────────────┘███││
│███████████████████████████████████████████││
└─────────────────────────────────────────────┘

Processing State Modal:
┌─────────────────── 100vw ───────────────────┐ 100vh
│████████████████ OVERLAY ████████████████████│
│███████████████████████████████████████████││
│██████████┌─────────────────────────────┐███││ 
│██████████│                             │███││
│██████████│                             │███││
│██████████│         ⟲                    │███││ ← Spinning icon
│██████████│                             │███││
│██████████│   Procesando tu pago...     │███││ ← Processing message
│██████████│   Por favor, espera.        │███││
│██████████│                             │███││
│██████████│  ┌─────────────────────────┐ │███││
│██████████│  │      Cancelar           │ │███││ ← Cancel button (disabled)
│██████████│  └─────────────────────────┘ │███││
│██████████│                             │███││
│██████████└─────────────────────────────┘███││
│███████████████████████████████████████████││
└─────────────────────────────────────────────┘

Mobile Layout (Full Height):
┌─────────────────────┐ 100vw
│                   ✕ │ ← Close button (top-right, 24px padding)
│                     │ ← 24px padding all around
│                     │ ← 48px gap
│         🎉          │ ← Success icon (48px, centered)
│                     │ ← 24px gap
│      ¡Éxito!       │ ← Title (text-xl, semibold)
│                     │ ← 16px gap
│ Tu suscripción ha   │ ← Success message (text-base)
│ sido activada       │
│ correctamente       │
│                     │ ← 24px gap
│ ┌─────────────────┐ │
│ │   Plan Anual    │ │ ← Plan details card
│ │   €8.97/año     │ │
│ │ Próximo cobro:  │ │
│ │ 15 enero 2025   │ │
│ └─────────────────┘ │
│                     │ ← 24px gap
│ ┌─────────────────┐ │
│ │ Ir al Diccionario│ │ ← Primary CTA (full width)
│ └─────────────────┘ │
│                     │ ← 16px gap
│ ┌─────────────────┐ │
│ │  Ver Factura    │ │ ← Secondary CTA (full width)
│ └─────────────────┘ │
│                     │ ← 24px padding
└─────────────────────┘ 100vh
```

#### CSS Implementation Requirements:
```scss
.payment-confirmation {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal);
  padding: var(--space-8); // 24px
  
  .confirmation-modal {
    background: var(--color-primary);
    border-radius: var(--border-radius-lg);
    box-shadow: var(--shadow-lg);
    max-width: 480px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    position: relative;
    
    // Mobile: full height
    @media (max-width: 767px) {
      max-height: 100vh;
      border-radius: 0;
      margin: 0;
    }
    
    .modal-header {
      position: relative;
      padding: var(--space-8); // 24px
      text-align: center;
      border-bottom: 1px solid var(--color-border-light);
      
      .close-button {
        position: absolute;
        top: var(--space-6); // 16px
        right: var(--space-6); // 16px
        width: 32px;
        height: 32px;
        background: none;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: var(--border-radius);
        transition: background var(--transition-fast);
        
        &:hover {
          background: var(--color-background);
        }
        
        .close-icon {
          width: 20px;
          height: 20px;
          color: var(--color-text-muted);
        }
      }
    }
    
    .modal-content {
      padding: var(--space-8); // 24px
      
      .status-icon {
        width: 48px;
        height: 48px;
        margin: 0 auto var(--space-8); // 0 auto, 24px below
        display: flex;
        align-items: center;
        justify-content: center;
        
        &.success {
          color: var(--color-success);
        }
        
        &.error {
          color: var(--color-error);
        }
        
        &.processing {
          color: var(--color-secondary);
          animation: spin 1s linear infinite;
        }
      }
      
      .status-title {
        font-size: var(--font-size-xl);
        font-weight: var(--font-weight-semibold);
        color: var(--color-text);
        text-align: center;
        margin-bottom: var(--space-6); // 16px
      }
      
      .status-message {
        font-size: var(--font-size-base);
        color: var(--color-text-muted);
        text-align: center;
        line-height: var(--line-height-normal);
        margin-bottom: var(--space-8); // 24px
      }
      
      .plan-details {
        background: var(--color-background);
        padding: var(--space-6); // 16px
        border-radius: var(--border-radius);
        margin-bottom: var(--space-8); // 24px
        text-align: center;
        
        .plan-name {
          font-size: var(--font-size-lg);
          font-weight: var(--font-weight-semibold);
          color: var(--color-text);
          margin-bottom: var(--space-2); // 4px
        }
        
        .plan-price {
          font-size: var(--font-size-base);
          color: var(--color-text-muted);
          margin-bottom: var(--space-4); // 8px
        }
        
        .next-billing {
          font-size: var(--font-size-sm);
          color: var(--color-text-muted);
          font-style: italic;
        }
      }
      
      .action-buttons {
        display: flex;
        flex-direction: column;
        gap: var(--space-4); // 8px between buttons
        
        // Desktop: horizontal layout
        @media (min-width: 768px) {
          flex-direction: row;
          justify-content: center;
          
          .action-button {
            min-width: 160px;
          }
        }
        
        .action-button {
          height: var(--space-11); // 48px
          padding: 0 var(--space-8); // 0 vertical, 24px horizontal
          border: none;
          border-radius: var(--border-radius);
          font-size: var(--font-size-base);
          font-weight: var(--font-weight-semibold);
          cursor: pointer;
          transition: all var(--transition-fast);
          
          &.primary {
            background: var(--color-secondary);
            color: white;
            
            &:hover:not(:disabled) {
              background: var(--color-secondary-dark);
              transform: translateY(-1px);
            }
          }
          
          &.secondary {
            background: transparent;
            color: var(--color-text);
            border: 1px solid var(--color-border);
            
            &:hover:not(:disabled) {
              background: var(--color-background);
              border-color: var(--color-secondary);
            }
          }
          
          &:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }
        }
      }
      
      .error-details {
        background: var(--color-error-light);
        border: 1px solid var(--color-error);
        border-radius: var(--border-radius);
        padding: var(--space-6); // 16px
        margin-bottom: var(--space-8); // 24px
        
        .error-code {
          font-family: monospace;
          font-size: var(--font-size-sm);
          color: var(--color-error);
          background: var(--color-error-lighter);
          padding: var(--space-2) var(--space-4); // 4px vertical, 8px horizontal
          border-radius: var(--border-radius);
          display: inline-block;
          margin-bottom: var(--space-4); // 8px
        }
        
        .error-suggestion {
          font-size: var(--font-size-sm);
          color: var(--color-text-muted);
          line-height: var(--line-height-normal);
        }
      }
      
      .processing-indicator {
        text-align: center;
        margin-bottom: var(--space-8); // 24px
        
        .processing-text {
          font-size: var(--font-size-base);
          color: var(--color-text-muted);
          margin-top: var(--space-4); // 8px
        }
      }
    }
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

// Responsive adjustments
@media (max-width: 767px) {
  .payment-confirmation {
    padding: 0;
    
    .confirmation-modal {
      border-radius: 0;
      max-height: 100vh;
      
      .modal-header {
        padding: var(--space-6); // 16px
      }
      
      .modal-content {
        padding: var(--space-6); // 16px
      }
    }
  }
}
```

#### Vue Implementation Example:
```vue
<template>
  <div 
    v-if="isVisible"
    class="payment-confirmation"
    @click="handleBackdropClick"
  >
    <div class="confirmation-modal" @click.stop>
      <!-- Modal Header -->
      <div class="modal-header">
        <button 
          v-if="showCloseButton"
          class="close-button"
          @click="handleClose"
        >
          <Icon name="x" class="close-icon" />
        </button>
      </div>
      
      <!-- Modal Content -->
      <div class="modal-content">
        <!-- Status Icon -->
        <div 
          class="status-icon"
          :class="statusType"
        >
          <Icon 
            :name="statusIcon" 
            :size="48"
          />
        </div>
        
        <!-- Status Title -->
        <div class="status-title">
          {{ statusTitle }}
        </div>
        
        <!-- Status Message -->
        <div class="status-message">
          {{ statusMessage }}
        </div>
        
        <!-- Plan Details (Success State) -->
        <div 
          v-if="statusType === 'success' && planDetails"
          class="plan-details"
        >
          <div class="plan-name">{{ planDetails.name }}</div>
          <div class="plan-price">{{ planDetails.price }}</div>
          <div class="next-billing">
            Próximo cobro: {{ planDetails.nextBilling }}
          </div>
        </div>
        
        <!-- Error Details (Error State) -->
        <div 
          v-if="statusType === 'error' && errorDetails"
          class="error-details"
        >
          <div class="error-code">{{ errorDetails.code }}</div>
          <div class="error-suggestion">{{ errorDetails.suggestion }}</div>
        </div>
        
        <!-- Processing Indicator (Processing State) -->
        <div 
          v-if="statusType === 'processing'"
          class="processing-indicator"
        >
          <div class="processing-text">
            {{ processingText }}
          </div>
        </div>
        
        <!-- Action Buttons -->
        <div class="action-buttons">
          <button
            v-if="primaryAction"
            class="action-button primary"
            :disabled="statusType === 'processing'"
            @click="handlePrimaryAction"
          >
            {{ primaryAction.text }}
          </button>
          
          <button
            v-if="secondaryAction"
            class="action-button secondary"
            :disabled="statusType === 'processing'"
            @click="handleSecondaryAction"
          >
            {{ secondaryAction.text }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface PlanDetails {
  name: string
  price: string
  nextBilling: string
}

interface ErrorDetails {
  code: string
  suggestion: string
}

interface Action {
  text: string
  action: string
}

interface Props {
  isVisible: boolean
  statusType: 'success' | 'error' | 'processing'
  planDetails?: PlanDetails
  errorDetails?: ErrorDetails
  primaryAction?: Action
  secondaryAction?: Action
  showCloseButton?: boolean
  processingText?: string
}

const props = withDefaults(defineProps<Props>(), {
  showCloseButton: true,
  processingText: 'Procesando tu pago... Por favor, espera.'
})

const emit = defineEmits<{
  'close': []
  'primary-action': [action: string]
  'secondary-action': [action: string]
}>()

// Computed properties
const statusIcon = computed(() => {
  switch (props.statusType) {
    case 'success': return 'check-circle'
    case 'error': return 'alert-circle'
    case 'processing': return 'loader-2'
    default: return 'info'
  }
})

const statusTitle = computed(() => {
  switch (props.statusType) {
    case 'success': return '¡Éxito!'
    case 'error': return 'Error'
    case 'processing': return 'Procesando...'
    default: return 'Información'
  }
})

const statusMessage = computed(() => {
  switch (props.statusType) {
    case 'success': return 'Tu suscripción ha sido activada correctamente'
    case 'error': return 'No se pudo procesar tu pago. Por favor, inténtalo de nuevo.'
    case 'processing': return 'Estamos procesando tu pago. Esto puede tomar unos momentos.'
    default: return ''
  }
})

// Event handlers
const handleClose = () => {
  emit('close')
}

const handleBackdropClick = () => {
  if (props.showCloseButton) {
    emit('close')
  }
}

const handlePrimaryAction = () => {
  if (props.primaryAction) {
    emit('primary-action', props.primaryAction.action)
  }
}

const handleSecondaryAction = () => {
  if (props.secondaryAction) {
    emit('secondary-action', props.secondaryAction.action)
  }
}
</script>
```

---

### **💳 7. Subscription Page (Payment Flow)**

#### Mobile Layout:
```
┌─────────────────────────────────────────────┐ 
│  🏠 epàlwi-rèbbo              ☰           │ ← NavigationBar (logged in)
└─────────────────────────────────────────────┘ 64px height, 24px padding
│                                             │ ← 24px gap
│  💎 Actualizar Suscripción                  │ ← Page title (large, 48px gap)
│                                             │ ← 16px gap
│  Tu prueba gratuita ha expirado.           │ ← Subtitle (24px gap)
│  Elige un plan para continuar.              │
│                                             │ ← 32px gap
│  ┌─────────────────────────────────────────┐ │
│  │  💎 Plan Mensual                        │ │ ← PricingCard (Monthly)
│  │                                         │ │
│  │  €1                                     │ │
│  │  por mes                                │ │
│  │                                         │ │
│  │  ✓ Acceso completo al diccionario      │ │
│  │  ✓ Búsqueda offline                     │ │
│  │  ✓ Sin anuncios                         │ │
│  │  ✓ Cancela cuando quieras               │ │
│  │                                         │ │
│  │  ┌─────────────────────────────────────┐ │ │
│  │  │        Elegir Plan Mensual          │ │ │ ← CTA button
│  │  └─────────────────────────────────────┘ │ │
│  └─────────────────────────────────────────┘ │
│                                             │ ← 16px gap
│  ┌─────────────────────────────────────────┐ │
│  │  🏆 Plan Anual ★ Más Popular            │ │ ← PricingCard (Annual)
│  │                                         │ │
│  │  €8.97                                  │ │
│  │  por año                                │ │
│  │                                         │ │
│  │  ✓ Acceso completo al diccionario      │ │
│  │  ✓ Búsqueda offline                     │ │
│  │  ✓ Sin anuncios                         │ │
│  │  ✓ Cancela cuando quieras               │ │
│  │  ✓ Ahorras €3.03 al año                 │ │
│  │                                         │ │
│  │  ┌─────────────────────────────────────┐ │ │
│  │  │        Elegir Plan Anual            │ │ │ ← CTA button
│  │  └─────────────────────────────────────┘ │ │
│  └─────────────────────────────────────────┘ │
│                                             │ ← 32px gap
│                                             │ ← 32px gap
│  ┌─────────────────────────────────────────┐ │
│  │  💳 Confirmar Suscripción               │ │ ← Stripe Checkout Trigger (shown after plan selection)
│  │                                         │ │
│  │  📋 Resumen del Plan                    │ │
│  │  Plan Anual                    €8.97/año│ │
│  │  ✓ Acceso completo al diccionario      │ │
│  │  ✓ Búsqueda offline                     │ │
│  │  ✓ Sin anuncios                         │ │
│  │  ✓ Ahorras €3.03 al año                 │ │
│  │                                         │ │
│  │  ┌─────────────────────────────────────┐ │ │
│  │  │ Total: €8.97                        │ │ │
│  │  └─────────────────────────────────────┘ │ │
│  │                                         │ │
│  │  ┌─────────────────────────────────────┐ │ │
│  │  │      Comenzar Prueba Gratuita       │ │ │ ← Stripe Checkout trigger
│  │  └─────────────────────────────────────┘ │ │
│  │                                         │ │
│  │  Al continuar, serás redirigido a      │ │
│  │  Stripe para completar tu pago          │ │
│  └─────────────────────────────────────────┘ │
│                                             │
└─────────────────────────────────────────────┘
```

#### Desktop Layout:
```
┌───────────────────────────────────────────────────────────────────────────────┐
│  🏠 epàlwi-rèbbo        ████ Diccionario ████  Ayuda        👤 Mi Cuenta     │ ← NavigationBar
└───────────────────────────────────────────────────────────────────────────────┘ (Diccionario active)
                                                        ┌─────────────────────┐
                                                        │ Mi Perfil          │ ← Account dropdown
                                                        ├─────────────────────┤  (when opened)
                                                        │ Suscripción        │
                                                        ├─────────────────────┤
                                                        │ Configuración      │
                                                        ├─────────────────────┤
                                                        │ Cerrar Sesión      │
                                                        └─────────────────────┘
                                                                                    ← 48px gap
                  💎 Actualizar Suscripción                                        │ ← Page title (centered, 48px gap)
                                                                                    ← 16px gap
              Tu prueba gratuita ha expirado.                                     │ ← Subtitle (centered, 24px gap)
              Elige un plan para continuar.                                       │
                                                                                    ← 48px gap
┌─────────────────────────────────────┐ ┌─────────────────────────────────────┐   │
│  💎 Plan Mensual                    │ │  🏆 Plan Anual ★ Más Popular        │   │ ← PricingCards side by side
│                                     │ │                                     │   │ (400px max width each)
│  €1                                 │ │  €8.97                              │   │
│  por mes                            │ │  por año                             │   │
│                                     │ │                                     │   │
│  ✓ Acceso completo al diccionario  │ │  ✓ Acceso completo al diccionario    │   │
│  ✓ Búsqueda offline                 │ │  ✓ Búsqueda offline                 │   │
│  ✓ Sin anuncios                     │ │  ✓ Sin anuncios                     │   │
│  ✓ Cancela cuando quieras           │ │  ✓ Cancela cuando quieras           │   │
│                                     │ │  ✓ Ahorras €3.03 al año             │   │
│  ┌─────────────────────────────────┐ │ │                                     │   │
│  │      Elegir Plan Mensual        │ │ │  ┌─────────────────────────────────┐ │   │
│  └─────────────────────────────────┘ │ │ │        Elegir Plan Anual          │ │   │
└─────────────────────────────────────┘ │ │  └─────────────────────────────────┘ │   │
                                        │ └─────────────────────────────────────┘   │
                                        │                                         ← 48px gap
                                                                                    ← 48px gap
                  ┌─────────────────────────────────────────────────────────────┐   │
                  │  💳 Confirmar Suscripción                                   │   │ ← Stripe Checkout Trigger (centered, 600px max)
                  │                                                             │   │
                  │  ┌─────────────────────────────────────┐ ┌─────────────────┐ │   │
                  │  │  🏠 Dirección de Facturación        │ │  💳 Detalles    │ │   │ ← Two-column layout
                  │  │                                     │ │  de la Tarjeta   │ │   │
                  │  │  Nombre completo *                  │ │                 │ │   │
                  │  │  ┌─────────────────────────────────┐ │ │                 │ │   │
                  │  │  │ Juan Pérez                      │ │ │                 │ │   │
                  │  │  └─────────────────────────────────┘ │ │                 │ │   │
                  │  │                                     │ │                 │ │   │
                  │  │  Email *                            │ │                 │ │   │
                  │  │  ┌─────────────────────────────────┐ │ │                 │ │   │
                  │  │  │ juan@email.com                  │ │ │                 │ │   │
                  │  │  └─────────────────────────────────┘ │ │                 │ │   │
                  │  │                                     │ │                 │ │   │
                  │  │  País *                             │ │                 │ │   │
                  │  │  ┌─────────────────────────────────┐ │ │                 │ │   │
                  │  │  │ España ▼                        │ │ │                 │ │   │
                  │  │  └─────────────────────────────────┘ │ │                 │ │   │
                  │  └─────────────────────────────────────┘ └─────────────────┘ │   │
                  │                                                             │   │
                  │  📋 Resumen de Suscripción                                  │   │
                  │  ┌─────────────────────────────────────────────────────┐   │   │
                  │  │ Plan Anual                    €8.97 por año        │   │   │
                  │  │ ✓ Acceso completo al diccionario  ✓ Búsqueda offline│   │   │
                  │  │ ✓ Sin anuncios                     ✓ Sincronización  │   │   │
                  │  │                                                         │   │
                  │  │ ┌─────────────────────────────────────────────────┐ │   │   │
                  │  │ │ Total: €8.97                                    │ │   │   │
                  │  │ └─────────────────────────────────────────────────┘ │   │   │
                  │  └─────────────────────────────────────────────────────┘   │   │
                  │                                                             │   │
                  │  ┌─────────────────────────────────────────────────────┐   │   │
                  │  │                Confirmar Pago                       │   │   │ ← Submit button
                  │  └─────────────────────────────────────────────────────┘   │   │
                  │                                                             │   │
                  │  Al confirmar, aceptas nuestros términos y condiciones     │   │
                  │  de pago                                                   │   │
                  └─────────────────────────────────────────────────────────────┘   │
```

#### Payment Confirmation Modal (Overlay):
```
┌─────────────────── 100vw ───────────────────┐ 100vh
│████████████████ OVERLAY ████████████████████│ (backdrop blur + click to close)
│███████████████████████████████████████████││
│██████████┌─────────────────────────────┐███││ 
│██████████│                           ✕ │███││ ← Close button
│██████████│                             │███││
│██████████│         🎉 ¡Éxito!          │███││ ← Success state
│██████████│                             │███││
│██████████│   Tu suscripción ha sido    │███││
│██████████│   activada correctamente    │███││
│██████████│                             │███││
│██████████│  ┌─────────────────────────┐ │███││
│██████████│  │    Plan Anual           │ │███││ ← Plan details
│██████████│  │    €8.97 por año        │ │███││
│██████████│  │    Próximo cobro:       │ │███││
│██████████│  │    15 de enero 2025     │ │███││
│██████████│  └─────────────────────────┘ │███││
│██████████│                             │███││
│██████████│  ┌─────────────────────────┐ │███││
│██████████│  │      Ir al Diccionario  │ │███││ ← Primary CTA
│██████████│  └─────────────────────────┘ │███││
│██████████│                             │███││
│██████████│  ┌─────────────────────────┐ │███││
│██████████│  │    Ver Factura          │ │███││ ← Secondary CTA
│██████████│  └─────────────────────────┘ │███││
│██████████│                             │███││
│██████████└─────────────────────────────┘███││
│███████████████████████████████████████████││
└─────────────────────────────────────────────┘
   ↑                                       ↑
 Max 480px width                     Centered
```

#### User Flow States:
```
1. **Initial State**: User sees pricing cards (vertical layout)
2. **Plan Selection**: User clicks on a plan, Stripe Checkout Trigger appears
3. **Checkout Initiation**: User clicks "Comenzar Prueba Gratuita", redirects to Stripe
4. **Stripe Checkout**: User completes payment on Stripe's secure platform
5. **Success Redirect**: Stripe redirects back to success page with session ID
6. **PaymentConfirmation**: Shows success state with subscription details
7. **Completion**: User redirected to dictionary or shown invoice
```

#### Component Integration:
```
SubscriptionPage.vue
├── NavigationBar.vue (logged in state)
├── PageHeader.vue (title + subtitle)
├── PricingSection.vue
│   ├── PricingCard.vue (Monthly plan)
│   └── PricingCard.vue (Annual plan)
├── StripeCheckoutTrigger.vue (hidden initially, shown after plan selection)
└── PaymentConfirmation.vue (modal overlay for payment states)
```

#### Responsive Behavior:
- **Mobile (<768px)**: Single column layout, full-height modals
- **Tablet (768px-1024px)**: Two-column pricing, centered forms
- **Desktop (>1024px)**: Side-by-side pricing, two-column payment form

#### Conversion Optimization Features:
- **Annual plan highlighting**: "Más Popular" badge + savings calculation
- **Social proof**: "Join X families preserving Ndowe"
- **Risk reversal**: "Cancel anytime" messaging
- **Urgency**: Trial expiration messaging

---

// ... existing code ...