/**
 * 🎨 Design System Composable
 * Provides consistent design system values and utilities for all components
 * Based on 4px spacing unit system with industry-standard granular control
 */

export const useDesignSystem = () => {
  // 📏 Spacing System (rem-based V2) - Modern scalable system
  const spacing = {
    0: 'var(--ds-spacing-0)',
    1: 'var(--ds-spacing-025)',
    2: 'var(--ds-spacing-05)',
    3: 'var(--ds-spacing-075)',
    4: 'var(--ds-spacing-1)',
    5: 'var(--ds-spacing-125)',
    6: 'var(--ds-spacing-15)',
    7: 'var(--ds-spacing-175)',
    8: 'var(--ds-spacing-2)',
    9: 'var(--ds-spacing-225)',
    10: 'var(--ds-spacing-25)',
    11: 'var(--ds-spacing-275)',
    12: 'var(--ds-spacing-3)',
    13: 'var(--ds-spacing-325)',
    14: 'var(--ds-spacing-35)',
    15: 'var(--ds-spacing-375)',
    16: 'var(--ds-spacing-4)',
    17: 'var(--ds-spacing-425)',
    18: 'var(--ds-spacing-45)',
    19: 'var(--ds-spacing-475)',
    20: 'var(--ds-spacing-5)',
    21: 'var(--ds-spacing-525)',
    22: 'var(--ds-spacing-55)',
    23: 'var(--ds-spacing-575)',
    24: 'var(--ds-spacing-6)'
  } as const

  const getSpacing = (level: keyof typeof spacing) => spacing[level]

  // 🎯 Component Heights
  const componentHeights = {
    input: 'var(--ds-spacing-3)',
    button: {
      small: 'var(--ds-spacing-2)',
      medium: 'var(--ds-spacing-25)',
      large: 'var(--ds-spacing-3)'
    },
    navigationBar: 'var(--ds-spacing-4)',
    trialBanner: {
      desktop: 'var(--ds-spacing-35)',
      mobile: 'var(--ds-spacing-45)'
    },
    suggestionItem: 'var(--ds-spacing-25)'
  } as const

  // 🧩 Icon System
  const iconSizes = {
    sm: 12,
    base: 16,
    md: 20,
    lg: 24,
    xl: 32
  } as const

  const getIconSize = (size: keyof typeof iconSizes) => iconSizes[size]

  // 🔘 Button Classes Generator
  const buttonClasses = (variant: 'primary' | 'secondary' | 'ghost', size: 'small' | 'medium' | 'large') => [
    'btn',
    `btn--${variant}`,
    `btn--${size}`,
    'interactive',
    'ripple'
  ]

  // 📱 Component Specifications
  const componentSpecs = {
    searchBox: {
      height: componentHeights.input,
      paddingLeft: spacing[12],  // 48px for icon space
      paddingRight: spacing[4],  // 16px
      iconLeft: spacing[4],      // 16px from left
      clearRight: spacing[3]     // 12px from right
    },
    
    languageToggle: {
      height: componentHeights.button.medium,
      minWidth: '100px',
      flagSize: { width: 16, height: 12 },
      gap: spacing[2] // 8px between flag and text
    },
    
    resultCard: {
      padding: spacing[12],      // 48px all around
      marginBottom: spacing[4],  // 16px
      sectionGap: spacing[6],    // 24px between sections
      labelGap: spacing[1]       // 4px below labels
    },
    
    navigationBar: {
      height: componentHeights.navigationBar,
      padding: {
        mobile: spacing[6],   // 24px
        desktop: spacing[12]  // 48px
      },
      logoHeight: '32px'
    },
    
    modal: {
      padding: {
        mobile: spacing[6],   // 24px
        desktop: spacing[8]   // 32px
      },
      maxWidth: {
        mobile: '100%',
        desktop: '600px'
      },
      closeButtonSize: '32px'
    },
    
    emptyState: {
      maxWidth: '400px',
      iconSize: iconSizes.xl,   // 32px
      iconGap: spacing[6],      // 24px
      titleGap: spacing[4],     // 16px
      ctaGap: spacing[6],       // 24px
      padding: spacing[12]      // 48px
    },
    
    trialBanner: {
      height: componentHeights.trialBanner,
      padding: {
        mobile: spacing[4],   // 16px
        desktop: spacing[6]   // 24px
      },
      buttonHeight: componentHeights.button.small,
      closeSize: spacing[4]   // 16px
    },
    
    input: {
      height: componentHeights.input,
      padding: spacing[4],    // 16px horizontal
      iconSize: iconSizes.base,
      labelGap: spacing[3],   // 12px above
      helperGap: spacing[1]   // 4px below
    },
    
    suggestionDropdown: {
      maxHeight: '240px', // 6 items × 40px
      itemHeight: componentHeights.suggestionItem,
      itemPadding: spacing[3], // 12px horizontal
      shadow: 'var(--shadow-lg)',
      borderRadius: 'var(--border-radius-lg)'
    }
  } as const

  // 🎨 Color Utilities
  const colors = {
    primary: 'var(--ds-primary)',
    secondary: 'var(--ds-secondary)',
    background: 'var(--ds-background)',
    text: 'var(--ds-foreground)',
    textMuted: 'var(--ds-muted-foreground)',
    border: 'var(--ds-border)',
    borderFocus: 'var(--ds-ring)',
    error: 'var(--ds-destructive)',
    success: 'var(--ds-success)'
  } as const

  // 🌊 Interaction States
  const interactionClasses = {
    interactive: 'interactive',
    loading: 'loading',
    disabled: 'disabled',
    focus: 'focus-visible',
    hover: 'hover'
  } as const

  // 📐 Responsive Breakpoints
  const breakpoints = {
    mobile: '(max-width: 767px)',
    tablet: '(min-width: 768px) and (max-width: 1023px)', 
    desktop: '(min-width: 1024px)',
    tabletUp: '(min-width: 768px)'
  } as const

  // 🎭 Animation Presets
  const animations = {
    transition: {
      fast: 'var(--ds-duration)',
      normal: 'var(--ds-duration)',
      slow: 'var(--ds-duration)'
    },
    easing: {
      ease: 'var(--ds-ease)',
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'var(--ds-ease)'
    }
  } as const

  // 🔍 Validation Utilities
  const validators = {
    email: (value: string): string | null => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!value) return 'El email es requerido'
      if (!emailRegex.test(value)) return 'El email no es válido'
      return null
    },
    
    required: (value: string): string | null => {
      if (!value?.trim()) return 'Este campo es requerido'
      return null
    },
    
    minLength: (min: number) => (value: string): string | null => {
      if (value && value.length < min) return `Mínimo ${min} caracteres`
      return null
    }
  } as const

  // 🏗️ Component Factory Utilities
  const createComponentClasses = (
    base: string,
    variants: Record<string, string> = {},
    states: string[] = []
  ) => {
    const classes = [base]
    
    // Add variant classes
    Object.entries(variants).forEach(([key, value]) => {
      if (value) classes.push(`${base}--${value}`)
    })
    
    // Add state classes  
    states.forEach(state => {
      if (state) classes.push(state)
    })
    
    return classes.filter(Boolean)
  }

  return {
    // Core values
    spacing,
    getSpacing,
    componentHeights,
    iconSizes,
    getIconSize,
    colors,
    breakpoints,
    animations,
    
    // Component specifications
    componentSpecs,
    
    // Utilities
    buttonClasses,
    interactionClasses,
    validators,
    createComponentClasses
  }
} 