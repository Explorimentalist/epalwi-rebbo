# 🎯 Component Specifications & ASCII Layouts
## Zero-Ambiguity Implementation Guide

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