/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './app.vue',
    './nuxt.config.{js,ts}'
  ],
  theme: {
    extend: {
      colors: {
        error: '#D61515',
        success: '#257940',
        background: '#F2EDEB',
        primary: '#FFFFFF',
        secondary: '#D45B41',
        text: '#333333'
      },
      spacing: {
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
        '15': '80px'   // 10 * 8px
      },
      borderRadius: {
        DEFAULT: '8px'
      },
      boxShadow: {
        DEFAULT: 'rgba(0,0,0,0.2) 2px 2px 5px'
      },
      fontFamily: {
        sans: ['Geist', 'sans-serif']
      },
      fontSize: {
        'responsive': 'clamp(16px, 1vw, 18px)',
        'heading': 'clamp(32px, 5vw, 64px)'
      }
    }
  },
  plugins: []
} 