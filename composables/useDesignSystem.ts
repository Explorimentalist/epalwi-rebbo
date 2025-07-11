/**
 * 🎨 Design System Composable
 * Provides consistent design system values and utilities for all components
 * Based on 4px spacing unit system with industry-standard granular control
 */

export const useDesignSystem = () => {
  // 📏 Spacing System (4px base unit) - Industry standard for granular control
  const spacing = {
    0: 'var(--space-0)',   // 0px
    1: 'var(--space-1)',   // 4px - base unit
    2: 'var(--space-2)',   // 8px
    3: 'var(--space-3)',   // 12px
    4: 'var(--space-4)',   // 16px
    5: 'var(--space-5)',   // 20px
    6: 'var(--space-6)',   // 24px
    7: 'var(--space-7)',   // 28px
    8: 'var(--space-8)',   // 32px
    9: 'var(--space-9)',   // 36px
    10: 'var(--space-10)', // 40px
    11: 'var(--space-11)', // 44px
    12: 'var(--space-12)', // 48px
    13: 'var(--space-13)', // 52px
    14: 'var(--space-14)', // 56px
    15: 'var(--space-15)', // 60px
    16: 'var(--space-16)', // 64px
    17: 'var(--space-17)', // 68px
    18: 'var(--space-18)', // 72px
    19: 'var(--space-19)', // 76px
    20: 'var(--space-20)', // 80px
    21: 'var(--space-21)', // 84px
    22: 'var(--space-22)', // 88px
    23: 'var(--space-23)', // 92px
    24: 'var(--space-24)'  // 96px
  } as const

  const getSpacing = (level: keyof typeof spacing) => spacing[level]

  // 🎯 Component Heights
  const componentHeights = {
    input: 'var(--space-12)',      // 48px
    button: {
      small: 'var(--space-8)',     // 32px
      medium: 'var(--space-10)',   // 40px
      large: 'var(--space-12)'     // 48px
    },
    navigationBar: 'var(--space-16)', // 64px
    trialBanner: {
      desktop: 'var(--space-14)',  // 56px
      mobile: 'var(--space-18)'    // 72px
    },
    suggestionItem: 'var(--space-10)' // 40px
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
    primary: 'var(--color-primary)',
    secondary: 'var(--color-secondary)',
    background: 'var(--color-background)',
    text: 'var(--color-text)',
    textMuted: 'var(--color-text-muted)',
    border: 'var(--color-border)',
    borderFocus: 'var(--color-border-focus)',
    error: 'var(--color-error)',
    success: 'var(--color-success)'
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
      fast: 'var(--transition-fast)',     // 150ms
      normal: 'var(--transition-normal)', // 300ms
      slow: 'var(--transition-slow)'      // 500ms
    },
    easing: {
      ease: 'ease',
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out'
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