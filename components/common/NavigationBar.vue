<template>
  <nav class="navigation-bar" :class="{ 'navigation-bar--logged-in': isAuthenticated }">
    <!-- Logo Section -->
    <div class="navigation-bar__logo">
      <NuxtLink to="/" class="logo-link">
        <Icon name="home" size="md" class="logo-icon" />
        <span class="logo-text">epàlwi-rèbbo</span>
      </NuxtLink>
    </div>

    <!-- Desktop Navigation -->
    <div class="navigation-bar__desktop-nav">
        <NuxtLink 
          to="/" 
          class="nav-item"
          :class="{ 'nav-item--active': route.path === '/' }"
        >
          Inicio
        </NuxtLink>
        <NuxtLink 
          to="/dictionary" 
          class="nav-item"
          :class="{ 'nav-item--active': route.path === '/dictionary' }"
        >
          Diccionario
        </NuxtLink>
        <NuxtLink 
          to="/ayuda" 
          class="nav-item"
          :class="{ 'nav-item--active': route.path === '/ayuda' }"
        >
          Ayuda
        </NuxtLink>
    </div>

    <!-- Account Section -->
    <div class="navigation-bar__account">
      <!-- Desktop Account Menu (Logged In) -->
      <div v-if="isAuthenticated" class="account-dropdown">
        <button 
          ref="dropdownTrigger"
          class="dropdown-trigger"
          @click="toggleDropdown"
          @blur="handleDropdownBlur"
          aria-haspopup="true"
          :aria-expanded="isDropdownOpen"
        >
          <Icon name="user" size="md" class="dropdown-icon" />
          <span class="dropdown-text">Mi Cuenta</span>
          <Icon 
            name="chevron-down" 
            size="sm" 
            :class="isDropdownOpen ? 'dropdown-chevron dropdown-chevron--open' : 'dropdown-chevron'"
          />
        </button>
        
        <!-- Dropdown Menu -->
        <Transition name="dropdown">
          <div 
            v-if="isDropdownOpen" 
            class="dropdown-menu"
            @click.stop
          >
            <NuxtLink to="/perfil" class="dropdown-item">
              <Icon name="user" size="sm" />
              Mi Perfil
            </NuxtLink>
            <NuxtLink to="/suscripcion" class="dropdown-item">
              <Icon name="credit-card" size="sm" />
              Suscripción
            </NuxtLink>
            <NuxtLink to="/configuracion" class="dropdown-item">
              <Icon name="settings" size="sm" />
              Configuración
            </NuxtLink>
            <div class="dropdown-divider"></div>
            <button @click="handleSignOut" class="dropdown-item dropdown-item--danger">
              <Icon name="log-out" size="sm" />
              Cerrar Sesión
            </button>
          </div>
        </Transition>
      </div>

      <!-- Desktop Login Button (Logged Out) -->
      <NuxtLink 
        v-else 
        to="/auth/login" 
        class="login-button"
      >
        Iniciar Sesión
      </NuxtLink>

      <!-- Mobile Hamburger Button -->
      <button 
        class="hamburger-button"
        @click="toggleMobileMenu"
        aria-label="Abrir menú de navegación"
        :aria-expanded="isMobileMenuOpen"
      >
        <Icon name="menu" size="lg" />
      </button>
    </div>

    <!-- Mobile Menu Overlay -->
    <Transition name="mobile-menu">
      <div 
        v-if="isMobileMenuOpen" 
        class="mobile-menu-overlay"
        @click="closeMobileMenu"
      >
        <div class="mobile-menu" @click.stop>
          <!-- Close Button -->
          <button 
            class="mobile-menu__close"
            @click="closeMobileMenu"
            aria-label="Cerrar menú de navegación"
          >
            <Icon name="x" size="lg" />
          </button>

          <!-- Mobile Menu Items -->
          <div class="mobile-menu__items">
            <NuxtLink 
              to="/" 
              class="mobile-menu__item"
              :class="{ 'mobile-menu__item--active': route.path === '/' }"
              @click="closeMobileMenu"
            >
              <Icon name="home" size="md" />
              Inicio
            </NuxtLink>
            
            <NuxtLink 
              to="/dictionary" 
              class="mobile-menu__item"
              :class="{ 'mobile-menu__item--active': route.path === '/dictionary' }"
              @click="closeMobileMenu"
            >
              <Icon name="book" size="md" />
              Diccionario
            </NuxtLink>
            
            <NuxtLink 
              to="/ayuda" 
              class="mobile-menu__item"
              :class="{ 'mobile-menu__item--active': route.path === '/ayuda' }"
              @click="closeMobileMenu"
            >
              <Icon name="help-circle" size="md" />
              Ayuda
            </NuxtLink>

            <!-- Account Items (if logged in) -->
            <template v-if="isAuthenticated">
              <NuxtLink 
                to="/perfil" 
                class="mobile-menu__item"
                @click="closeMobileMenu"
              >
                <Icon name="user" size="md" />
                Mi Perfil
              </NuxtLink>
              
              <NuxtLink 
                to="/suscripcion" 
                class="mobile-menu__item"
                @click="closeMobileMenu"
              >
                <Icon name="credit-card" size="md" />
                Suscripción
              </NuxtLink>
              
              <NuxtLink 
                to="/configuracion" 
                class="mobile-menu__item"
                @click="closeMobileMenu"
              >
                <Icon name="settings" size="md" />
                Configuración
              </NuxtLink>
              
              <button 
                @click="handleSignOutAndClose"
                class="mobile-menu__item mobile-menu__item--danger"
              >
                <Icon name="log-out" size="md" />
                Cerrar Sesión
              </button>
            </template>

            <!-- Login Item (if logged out) -->
            <template v-else>
              <NuxtLink 
                to="/auth/login" 
                class="mobile-menu__item"
                @click="closeMobileMenu"
              >
                <Icon name="log-in" size="md" />
                Iniciar Sesión
              </NuxtLink>
            </template>
          </div>
        </div>
      </div>
    </Transition>
  </nav>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useMockAuth } from '~/composables/useMockAuth'

// Props
interface Props {
  currentPage?: string
}

const props = withDefaults(defineProps<Props>(), {
  currentPage: '/'
})

// Route composable - use Nuxt's useRoute
const route = useRoute()

// Auth store
const authStore = useAuthStore()

// Reactive state
const isDropdownOpen = ref(false)
const isMobileMenuOpen = ref(false)
const dropdownTrigger = ref<HTMLButtonElement>()

// Computed properties
const isAuthenticated = computed(() => authStore.isAuthenticated)
const user = computed(() => authStore.user)

// Methods
const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value
}

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
}

const closeDropdown = () => {
  isDropdownOpen.value = false
}

const handleDropdownBlur = (event: FocusEvent) => {
  // Close dropdown when focus moves outside
  if (!event.relatedTarget || !dropdownTrigger.value?.contains(event.relatedTarget as Node)) {
    closeDropdown()
  }
}

const handleSignOut = async () => {
  try {
    await authStore.signOut()
    closeDropdown()
    // Redirect to home page after sign out
    await navigateTo('/')
  } catch (error) {
    console.error('Error signing out:', error)
  }
}

const handleSignOutAndClose = async () => {
  await handleSignOut()
  closeMobileMenu()
}

// Click outside handlers
const handleClickOutside = (event: Event) => {
  if (dropdownTrigger.value && !dropdownTrigger.value.contains(event.target as Node)) {
    closeDropdown()
  }
}

// Keyboard navigation
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    closeDropdown()
    closeMobileMenu()
  }
}

// Lifecycle
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleKeydown)
})

// Watch for route changes to close mobile menu
watch(() => route.path, () => {
  closeMobileMenu()
})
</script>

<style scoped lang="scss">
.navigation-bar {
  height: var(--space-16); // 64px
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
  padding: 0 var(--space-6); // 24px
  
  // Desktop padding
  @media (min-width: 1024px) {
    padding: 0 var(--space-12); // 48px
  }

  // Logo Section
  &__logo {
    .logo-link {
      display: flex;
      align-items: center;
      gap: var(--space-3); // 12px
      text-decoration: none;
      color: var(--color-text);
      font-weight: var(--font-weight-semibold);
      
      .logo-icon {
        color: var(--color-secondary);
      }
      
      .logo-text {
        font-size: var(--font-size-lg);
        letter-spacing: -0.02em;
      }
    }
  }

  // Desktop Navigation
  &__desktop-nav {
    display: none;
    
    @media (min-width: 1024px) {
      display: flex;
      align-items: center;
      gap: var(--space-8); // 32px
    }
    
    .nav-item {
      color: var(--color-text);
      text-decoration: none;
      font-weight: var(--font-weight-medium);
      font-size: var(--font-size-base);
      padding: var(--space-3) var(--space-4); // 12px 16px
      border-radius: var(--border-radius);
      transition: all var(--transition-normal);
      position: relative;
      
      &:hover {
        color: var(--color-secondary);
        background: var(--color-background);
      }
      
      &--active {
        background: var(--color-secondary);
        color: white;
        
        &:hover {
          background: var(--color-secondary);
          color: white;
        }
      }
    }
  }

  // Account Section
  &__account {
    display: flex;
    align-items: center;
    gap: var(--space-4); // 16px
  }
}

// Account Dropdown
.account-dropdown {
  position: relative;
  display: none;
  
  @media (min-width: 1024px) {
    display: block;
  }
  
  .dropdown-trigger {
    display: flex;
    align-items: center;
    gap: var(--space-3); // 12px
    background: none;
    border: none;
    color: var(--color-text);
    font-weight: var(--font-weight-medium);
    font-size: var(--font-size-base);
    cursor: pointer;
    padding: var(--space-2) var(--space-3); // 8px 12px
    border-radius: var(--border-radius);
    transition: all var(--transition-normal);
    
    &:hover {
      background: var(--color-background);
    }
    
    .dropdown-icon {
      color: var(--color-text-muted);
    }
    
    .dropdown-chevron {
      transition: transform var(--transition-normal);
      
      &--open {
        transform: rotate(180deg);
      }
    }
  }
  
  .dropdown-menu {
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: var(--space-3); // 12px
    background: var(--color-primary);
    border-radius: var(--border-radius-lg);
    box-shadow: var(--shadow-lg);
    min-width: 200px;
    z-index: var(--z-dropdown);
    border: 1px solid var(--color-border);
    
    .dropdown-item {
      display: flex;
      align-items: center;
      gap: var(--space-3); // 12px
      width: 100%;
      padding: var(--space-5) var(--space-7); // 12px 20px
      text-align: left;
      background: none;
      border: none;
      color: var(--color-text);
      font-weight: var(--font-weight-normal);
      font-size: var(--font-size-base);
      text-decoration: none;
      transition: background var(--transition-fast);
      cursor: pointer;
      
      &:hover {
        background: var(--color-background);
      }
      
      &:first-child {
        border-radius: var(--border-radius-lg) var(--border-radius-lg) 0 0;
      }
      
      &:last-child {
        border-radius: 0 0 var(--border-radius-lg) var(--border-radius-lg);
      }
      
      &--danger {
        color: var(--color-error);
        
        &:hover {
          background: #fef2f2;
        }
      }
    }
    
    .dropdown-divider {
      height: 1px;
      background: var(--color-border);
      margin: var(--space-2) 0; // 8px
    }
  }
}

// Login Button
.login-button {
  display: none;
  
  @media (min-width: 1024px) {
    display: inline-flex;
    align-items: center;
    padding: var(--space-3) var(--space-6); // 12px 24px
    background: var(--color-secondary);
    color: white;
    text-decoration: none;
    font-weight: var(--font-weight-medium);
    border-radius: var(--border-radius);
    transition: all var(--transition-normal);
    
    &:hover {
      background: #b8412f;
      transform: translateY(-1px);
    }
  }
}

// Hamburger Button
.hamburger-button {
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  width: 24px;
  height: 24px;
  cursor: pointer;
  color: var(--color-text);
  transition: color var(--transition-fast);
  
  @media (min-width: 1024px) {
    display: none;
  }
  
  &:hover {
    color: var(--color-secondary);
  }
}

// Mobile Menu Overlay
.mobile-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--color-overlay);
  z-index: var(--z-modal-backdrop);
  display: flex;
  align-items: center;
  justify-content: center;
}

// Mobile Menu
.mobile-menu {
  background: var(--color-primary);
  height: 100vh;
  width: 100vw;
  padding: var(--space-8); // 32px
  display: flex;
  flex-direction: column;
  position: relative;
  
  &__close {
    position: absolute;
    top: var(--space-6); // 24px from top
    right: var(--space-6); // 24px from right
    background: none;
    border: none;
    width: 32px;
    height: 32px;
    cursor: pointer;
    color: var(--color-text);
    transition: all var(--transition-fast);
    border-radius: var(--border-radius);
    
    &:hover {
      color: var(--color-secondary);
      background: var(--color-background);
    }
  }
  
  &__items {
    display: flex;
    flex-direction: column;
    gap: var(--space-4); // 16px between items
    margin-top: var(--space-16); // 64px from top for close button space
    align-items: center;
    justify-content: center;
    flex: 1;
  }
  
  &__item {
    display: flex;
    align-items: center;
    gap: var(--space-4); // 16px
    padding: var(--space-6) var(--space-8); // 16px vertical, 32px horizontal
    font-size: var(--font-size-xl); // Larger text for mobile
    font-weight: var(--font-weight-medium);
    color: var(--color-text);
    text-decoration: none;
    transition: all var(--transition-fast);
    border-radius: var(--border-radius-lg);
    min-width: 280px; // Consistent width for all items
    justify-content: flex-start;
    
    &:hover {
      color: var(--color-secondary);
    }
    
    &--active {
      color: var(--color-secondary);
      font-weight: var(--font-weight-semibold);
      background: var(--color-secondary);
      color: white;
      
      &:hover {
        background: var(--color-secondary);
        color: white;
      }
    }
    
    &--danger {
      color: var(--color-error);
      
      &:hover {
        color: white;
        background: var(--color-error);
      }
    }
  }
  
  &__divider {
    display: none; // Removed dividers for Mawal style
  }
}

// Transitions
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all var(--transition-normal);
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.mobile-menu-enter-active,
.mobile-menu-leave-active {
  transition: all var(--transition-normal);
}

.mobile-menu-enter-from,
.mobile-menu-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

// Responsive adjustments
@media (max-width: 480px) {
  .navigation-bar {
    padding: 0 var(--space-4); // 16px
    
    &__logo .logo-link .logo-text {
      font-size: var(--font-size-base);
    }
  }
  
  .mobile-menu {
    padding: var(--space-6); // 24px
    
    &__items {
      margin-top: var(--space-12); // 48px from top
      gap: var(--space-3); // 12px between items
    }
    
    &__item {
      min-width: 240px; // Smaller width on very small screens
      padding: var(--space-5) var(--space-6); // 12px vertical, 24px horizontal
      font-size: var(--font-size-lg); // Slightly smaller text
    }
  }
}

// Focus management for accessibility
.navigation-bar {
  .nav-item:focus-visible,
  .dropdown-trigger:focus-visible,
  .hamburger-button:focus-visible,
  .mobile-menu__item:focus-visible {
    outline: 2px solid var(--color-border-focus);
    outline-offset: 2px;
  }
}

// High contrast mode support
@media (prefers-contrast: high) {
  .navigation-bar {
    border-bottom: 2px solid var(--color-text);
  }
  
  .dropdown-menu {
    border: 2px solid var(--color-text);
  }
  
  .mobile-menu__item {
    border: 2px solid var(--color-text);
  }
}

// Reduced motion support
@media (prefers-reduced-motion: reduce) {
  .navigation-bar *,
  .dropdown-menu,
  .mobile-menu {
    transition: none !important;
    animation: none !important;
  }
}
</style>
