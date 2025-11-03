<template>
  <button
    @click="toggleDarkMode"
    class="dark-mode-toggle"
    :class="{ 'dark': isDarkMode }"
    type="button"
    :aria-label="isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'"
    :title="isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'"
  >
    <div class="toggle-container">
      <!-- Sun icon -->
      <div class="icon sun-icon" :class="{ active: !isDarkMode }">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="5"/>
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
        </svg>
      </div>
      
      <!-- Moon icon -->
      <div class="icon moon-icon" :class="{ active: isDarkMode }">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
        </svg>
      </div>
      
      <!-- Toggle indicator -->
      <div class="toggle-indicator" :class="{ 'moved': isDarkMode }"></div>
    </div>
  </button>
</template>

<script setup lang="ts">
interface Props {
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md'
})

// Dark mode state
const isDarkMode = ref(false)

// Initialize dark mode from localStorage and system preference
onMounted(() => {
  if (process.client) {
    // Check localStorage first
    const savedDarkMode = localStorage.getItem('darkMode')
    if (savedDarkMode !== null) {
      isDarkMode.value = savedDarkMode === 'true'
    } else {
      // Check system preference
      isDarkMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    
    // Apply initial theme
    applyTheme(isDarkMode.value)
    
    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', handleSystemThemeChange)
    
    // Cleanup listener on unmount
    onUnmounted(() => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange)
    })
  }
})

const handleSystemThemeChange = (e: MediaQueryListEvent) => {
  // Only apply system preference if user hasn't manually set a preference
  const savedDarkMode = localStorage.getItem('darkMode')
  if (savedDarkMode === null) {
    isDarkMode.value = e.matches
    applyTheme(e.matches)
  }
}

const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value
  applyTheme(isDarkMode.value)
  
  // Save preference
  if (process.client) {
    localStorage.setItem('darkMode', isDarkMode.value.toString())
  }
}

const applyTheme = (dark: boolean) => {
  if (process.client) {
    if (dark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }
}
</script>

<style scoped>
.dark-mode-toggle {
  position: relative;
  width: 56px;
  height: 28px;
  border: 1px solid var(--ds-border);
  border-radius: var(--ds-radius-2xl);
  background: var(--ds-card);
  cursor: pointer;
  transition: all var(--ds-duration) var(--ds-ease);
  padding: 2px;
  display: flex;
  align-items: center;
  outline: none;
  
  &:hover {
    border-color: var(--ds-primary);
    box-shadow: var(--ds-shadow-sm);
  }
  
  &:focus {
    outline: 2px solid var(--ds-ring);
    outline-offset: 2px;
  }
  
  &:active {
    transform: scale(0.98);
  }
}

.toggle-container {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 4px;
}

.icon {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  color: var(--ds-muted-foreground);
  transition: all var(--ds-duration) var(--ds-ease);
  
  &.active {
    color: var(--ds-primary-foreground);
  }
}

.toggle-indicator {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background: var(--ds-primary);
  border-radius: 50%;
  transition: all var(--ds-duration) var(--ds-ease);
  z-index: 1;
  
  &.moved {
    transform: translateX(28px);
  }
}

/* Size variants */
.dark-mode-toggle.sm {
  width: 44px;
  height: 22px;
  
  .icon {
    width: 16px;
    height: 16px;
  }
  
  .icon svg {
    width: 12px;
    height: 12px;
  }
  
  .toggle-indicator {
    width: 16px;
    height: 16px;
    
    &.moved {
      transform: translateX(22px);
    }
  }
}

.dark-mode-toggle.lg {
  width: 68px;
  height: 34px;
  
  .icon {
    width: 24px;
    height: 24px;
  }
  
  .icon svg {
    width: 18px;
    height: 18px;
  }
  
  .toggle-indicator {
    width: 26px;
    height: 26px;
    
    &.moved {
      transform: translateX(34px);
    }
  }
}

/* Animation for smooth theme transitions */
* {
  transition: background-color var(--ds-duration) var(--ds-ease), 
              color var(--ds-duration) var(--ds-ease),
              border-color var(--ds-duration) var(--ds-ease);
}
</style>