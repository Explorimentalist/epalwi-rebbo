/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './composables/**/*.{js,ts,vue}',
    './stores/**/*.{js,ts,vue}',
    './services/**/*.{js,ts}',
    './utils/**/*.{js,ts}',
    './app.vue',
    './nuxt.config.{js,ts}'
  ],
  theme: {
    extend: {
      colors: {
        // Legacy colors - keep for existing components
        error: '#D61515',
        success: '#257940',
        background: '#F2EDEB',
        primary: '#FFFFFF',
        secondary: '#D45B41',
        text: '#333333',
        
        // Design System V2 - OKLCH semantic colors
        'ds-background': 'var(--ds-background)',
        'ds-foreground': 'var(--ds-foreground)',
        'ds-card': 'var(--ds-card)',
        'ds-card-foreground': 'var(--ds-card-foreground)',
        'ds-popover': 'var(--ds-popover)',
        'ds-popover-foreground': 'var(--ds-popover-foreground)',
        'ds-primary': 'var(--ds-primary)',
        'ds-primary-dark': 'var(--ds-primary-dark)',
        'ds-primary-foreground': 'var(--ds-primary-foreground)',
        'ds-secondary': 'var(--ds-secondary)',
        'ds-secondary-foreground': 'var(--ds-secondary-foreground)',
        'ds-muted': 'var(--ds-muted)',
        'ds-muted-foreground': 'var(--ds-muted-foreground)',
        'ds-accent': 'var(--ds-accent)',
        'ds-accent-foreground': 'var(--ds-accent-foreground)',
        'ds-destructive': 'var(--ds-destructive)',
        'ds-destructive-foreground': 'var(--ds-destructive-foreground)',
        'ds-border': 'var(--ds-border)',
        'ds-input': 'var(--ds-input)',
        'ds-ring': 'var(--ds-ring)',
        
        // Chart colors
        'ds-chart-1': 'var(--ds-chart-1)',
        'ds-chart-2': 'var(--ds-chart-2)',
        'ds-chart-3': 'var(--ds-chart-3)',
        'ds-chart-4': 'var(--ds-chart-4)',
        'ds-chart-5': 'var(--ds-chart-5)',
        
        // Sidebar colors
        'ds-sidebar': 'var(--ds-sidebar)',
        'ds-sidebar-foreground': 'var(--ds-sidebar-foreground)',
        'ds-sidebar-primary': 'var(--ds-sidebar-primary)',
        'ds-sidebar-primary-foreground': 'var(--ds-sidebar-primary-foreground)',
        'ds-sidebar-accent': 'var(--ds-sidebar-accent)',
        'ds-sidebar-accent-foreground': 'var(--ds-sidebar-accent-foreground)',
        'ds-sidebar-border': 'var(--ds-sidebar-border)',
        'ds-sidebar-ring': 'var(--ds-sidebar-ring)',
        
        // ShadCN-style aliases (for compatibility)
        'foreground': 'var(--ds-foreground)',
        'muted': 'var(--ds-muted)',
        'muted-foreground': 'var(--ds-muted-foreground)',
        'card': 'var(--ds-card)',
        'card-foreground': 'var(--ds-card-foreground)',
        'border': 'var(--ds-border)',
        'input': 'var(--ds-input)',
        'ring': 'var(--ds-ring)'
      },
      spacing: {
        // Legacy spacing - keep for existing components
        '1': '1px',    // 0.125 * 8px
        '2': '2px',    // 0.25 * 8px
        '3': '4px',    // 0.5 * 8px
        '4': '8px',    // base unit
        '5': '12px',   // 1.5 * 8px
        '6': '16px',   // 2 * 8px
        '7': '20px',   // 2.5 * 8px
        '8': '24px',   // 3 * 8px
        '9': '32px',   // 4 * 8px
        '10': '40px',  // 5 * 8px
        '11': '48px',  // 6 * 8px
        '12': '56px',  // 7 * 8px
        '13': '64px',  // 8 * 8px
        '14': '72px',  // 9 * 8px
        '15': '80px',  // 10 * 8px
        
        // Design System V2 - rem-based spacing
        'ds-025': 'var(--ds-spacing-025)',
        'ds-05': 'var(--ds-spacing-05)',
        'ds-1': 'var(--ds-spacing-1)',
        'ds-2': 'var(--ds-spacing-2)',
        'ds-3': 'var(--ds-spacing-3)',
        'ds-4': 'var(--ds-spacing-4)',
        'ds-5': 'var(--ds-spacing-5)',
        'ds-6': 'var(--ds-spacing-6)',
        'ds-7': 'var(--ds-spacing-7)',
        'ds-8': 'var(--ds-spacing-8)',
        'ds-9': 'var(--ds-spacing-9)',
        'ds-10': 'var(--ds-spacing-10)'
      },
      borderRadius: {
        // Legacy border radius
        DEFAULT: '8px',
        
        // Design System V2 - modern radius scale
        'ds-sm': 'var(--ds-radius-sm)',
        'ds': 'var(--ds-radius)',
        'ds-md': 'var(--ds-radius-md)',
        'ds-lg': 'var(--ds-radius-lg)',
        'ds-xl': 'var(--ds-radius-xl)',
        'ds-2xl': 'var(--ds-radius-2xl)'
      },
      boxShadow: {
        // Legacy shadow
        DEFAULT: 'rgba(0,0,0,0.2) 2px 2px 5px',
        
        // Design System V2 - layered shadow system
        'ds-2xs': 'var(--ds-shadow-2xs)',
        'ds-xs': 'var(--ds-shadow-xs)',
        'ds-sm': 'var(--ds-shadow-sm)',
        'ds': 'var(--ds-shadow)',
        'ds-md': 'var(--ds-shadow-md)',
        'ds-lg': 'var(--ds-shadow-lg)',
        'ds-xl': 'var(--ds-shadow-xl)',
        'ds-2xl': 'var(--ds-shadow-2xl)'
      },
      fontFamily: {
        // Legacy font
        sans: ['Geist', 'sans-serif'],
        
        // Design System V2 - premium font stack
        'ds-sans': 'var(--ds-font-sans)',
        'ds-serif': 'var(--ds-font-serif)',
        'ds-mono': 'var(--ds-font-mono)',
        'ds-display': 'var(--ds-font-display)'
      },
      fontSize: {
        // Legacy typography
        'responsive': 'clamp(16px, 1vw, 18px)',
        'heading': 'clamp(32px, 5vw, 64px)',
        
        // Design System V2 - Webflow scale
        'ds-copy-12': 'var(--ds-font-size-copy-12)',
        'ds-copy-14': 'var(--ds-font-size-copy-14)',
        'ds-copy-16': 'var(--ds-font-size-copy-16)',
        'ds-copy-18': 'var(--ds-font-size-copy-18)',
        'ds-xxs': 'var(--ds-font-size-xxs)',
        'ds-xs': 'var(--ds-font-size-xs)',
        'ds-s': 'var(--ds-font-size-s)',
        'ds-m': 'var(--ds-font-size-m)',
        'ds-l': 'var(--ds-font-size-l)'
      },
      
      // Design System V2 - Additional utilities
      width: {
        'ds-15': 'var(--ds-width-15)',
        'ds-20': 'var(--ds-width-20)',
        'ds-25': 'var(--ds-width-25)',
        'ds-30': 'var(--ds-width-30)',
        'ds-35': 'var(--ds-width-35)',
        'ds-40': 'var(--ds-width-40)',
        'ds-45': 'var(--ds-width-45)',
        'ds-50': 'var(--ds-width-50)',
        'ds-55': 'var(--ds-width-55)',
        'ds-60': 'var(--ds-width-60)',
        'ds-65': 'var(--ds-width-65)',
        'ds-70': 'var(--ds-width-70)',
        'ds-75': 'var(--ds-width-75)',
        'ds-80': 'var(--ds-width-80)',
        'ds-100': 'var(--ds-width-100)'
      },
      
      // Animation timing
      transitionDuration: {
        'ds': 'var(--ds-duration)'
      },
      
      transitionTimingFunction: {
        'ds-ease': 'var(--ds-ease)'
      },
      
      // Breakpoints as Tailwind screens
      screens: {
        'ds-sm': '479px',
        'ds-md': '767px', 
        'ds-lg': '991px',
        'ds-xl': '1440px',
        'ds-2xl': '1920px'
      }
    }
  },
  plugins: []
}
