<template>
  <nav 
    :class="[
      'ds-navbar fixed top-0 left-0 right-0 h-16 flex items-center justify-between px-6 backdrop-blur-md transition-colors duration-300',
      { 'bg-gradient-to-b from-white to-transparent': isOverHero }
    ]" 
    style="z-index: var(--z-fixed)"
  >
    <!-- Logo -->
    <NuxtLink to="/" class="flex items-center">
      <img src="/logo.svg" alt="epàlwi-rèbbo" class="h-8 w-auto" />
    </NuxtLink>

    <!-- Desktop Navigation Items -->
    <ul class="hidden md:flex items-center gap-6">
      <li v-for="item in navItems" :key="item.label">
        <NuxtLink
          :to="item.path"
          :class="[
            'relative font-medium transition-colors',
            route.path === item.path ? 'text-secondary' : 'text-muted-foreground hover:text-foreground'
          ]"
        >
          <span class="pb-1 transition-all duration-300">
            {{ item.label }}
          </span>
        </NuxtLink>
      </li>
    </ul>

    <!-- Account Section -->
    <div class="flex items-center gap-4">
      <!-- Desktop Account Menu (Logged In) -->
      <div v-if="isAuthenticated" class="hidden md:block relative">
        <button 
          ref="dropdownTrigger"
          @click="toggleDropdown"
          @blur="handleDropdownBlur"
          class="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted transition-colors"
          aria-haspopup="true"
          :aria-expanded="isDropdownOpen"
        >
          <Icon name="user" size="sm" />
          <span class="text-sm font-medium">Mi Cuenta</span>
          <Icon 
            name="chevron-down" 
            size="sm"
            :class="`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`"
          />
        </button>
        
        <!-- Dropdown Menu -->
        <Transition
          enter-active-class="transition ease-out duration-200"
          enter-from-class="transform opacity-0 scale-95"
          enter-to-class="transform opacity-100 scale-100"
          leave-active-class="transition ease-in duration-75"
          leave-from-class="transform opacity-100 scale-100"
          leave-to-class="transform opacity-0 scale-95"
        >
          <div 
            v-if="isDropdownOpen" 
            class="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-md shadow-lg"
            style="z-index: var(--z-dropdown)"
            @click.stop
          >
            <NuxtLink 
              to="/perfil" 
              class="flex items-center gap-3 px-4 py-3 text-sm hover:bg-muted transition-colors"
            >
              <Icon name="user" size="sm" />
              Mi Perfil
            </NuxtLink>
            <NuxtLink 
              to="/subscription/manage" 
              class="flex items-center gap-3 px-4 py-3 text-sm hover:bg-muted transition-colors"
            >
              <Icon name="credit-card" size="sm" />
              Suscripción
            </NuxtLink>
            <NuxtLink 
              to="/configuracion" 
              class="flex items-center gap-3 px-4 py-3 text-sm hover:bg-muted transition-colors"
            >
              <Icon name="settings" size="sm" />
              Configuración
            </NuxtLink>
            <hr class="border-border my-1">
            <button 
              @click="handleSignOut"
              class="flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left"
            >
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
        class="hidden md:inline-flex ds-btn-primary ds-btn-md"
      >
        Iniciar sesión
      </NuxtLink>

      <!-- Mobile Hamburger Button -->
      <button 
        @click="toggleMobileMenu"
        class="md:hidden p-2 rounded-md hover:bg-muted transition-colors"
        aria-label="Abrir menú de navegación"
        :aria-expanded="isMobileMenuOpen"
      >
        <Icon name="menu" size="md" />
      </button>
    </div>

    <!-- Mobile Menu Overlay -->
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div 
        v-if="isMobileMenuOpen" 
        class="md:hidden mobile-menu-overlay bg-secondary"
        style="z-index: var(--z-dropdown)"
        @click.stop
      >
        <!-- Mobile Menu Panel -->
          <div 
            class="h-full w-full p-6"
          >
            <!-- Close Button -->
            <button 
              @click="closeMobileMenu"
              class="absolute top-4 right-4 p-2 rounded-md text-white hover:bg-white/20 transition-colors"
              aria-label="Cerrar menú"
            >
              <Icon name="x" size="md" />
            </button>

            <!-- Mobile Menu Items -->
            <div class="mt-16 space-y-4">
              <NuxtLink 
                v-for="item in navItems"
                :key="item.label"
                :to="item.path"
                @click="closeMobileMenu"
                class="flex items-center gap-3 px-4 py-4 text-white text-base font-medium transition-colors hover:bg-white/10 min-h-[48px]"
              >
                <Icon :name="item.icon" size="sm" />
                {{ item.label }}
              </NuxtLink>


              <!-- Mobile Auth Section -->
              <div v-if="isAuthenticated" class="space-y-2">
                <NuxtLink 
                  to="/perfil" 
                  @click="closeMobileMenu"
                  class="flex items-center gap-3 px-4 py-4 text-white text-base font-medium transition-colors hover:bg-white/10 min-h-[48px]"
                >
                  <Icon name="user" size="sm" />
                  Mi Perfil
                </NuxtLink>
                <NuxtLink 
                  to="/subscription/manage" 
                  @click="closeMobileMenu"
                  class="flex items-center gap-3 px-4 py-4 text-white text-base font-medium transition-colors hover:bg-white/10 min-h-[48px]"
                >
                  <Icon name="credit-card" size="sm" />
                  Suscripción
                </NuxtLink>
                <NuxtLink 
                  to="/configuracion" 
                  @click="closeMobileMenu"
                  class="flex items-center gap-3 px-4 py-4 text-white text-base font-medium transition-colors hover:bg-white/10 min-h-[48px]"
                >
                  <Icon name="settings" size="sm" />
                  Configuración
                </NuxtLink>
                <button 
                  @click="handleSignOutAndClose"
                  class="flex items-center gap-3 px-4 py-4 text-white text-base font-medium transition-colors hover:bg-white/10 w-full text-left min-h-[48px]"
                >
                  <Icon name="log-out" size="sm" />
                  Cerrar Sesión
                </button>
              </div>
              
              <!-- Mobile Login -->
              <NuxtLink 
                v-else
                to="/auth/login" 
                @click="closeMobileMenu"
                class="ds-btn-primary ds-btn-md ds-btn-icon w-full justify-center"
              >
                <Icon name="log-in" size="sm" class="ds-btn-icon-element" />
                Iniciar Sesión
              </NuxtLink>
            </div>
          </div>
      </div>
    </Transition>
  </nav>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '~/stores/auth'

// Route composable
const route = useRoute()

// Reactive state
const isDropdownOpen = ref(false)
const isMobileMenuOpen = ref(false)
const dropdownTrigger = ref<HTMLButtonElement>()
const isOverHero = ref(true) // Start as true for hero section

// Auth store - use proper SSR pattern
const authStore = useAuthStore()
// Pull booleans as refs to avoid nested computed truthiness
const { isAuthenticated } = storeToRefs(authStore)

// Navigation items with paths and icons
const navItems = computed(() => [
  { label: 'Inicio', path: '/', icon: 'home' },
  ...(isAuthenticated.value ? [{ label: 'Diccionario', path: '/dictionary', icon: 'book' }] : []),
  { label: 'Sugerencias', path: '/sugerencias', icon: 'message-circle' },
])

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

// Scroll detection for hero section
const handleScroll = () => {
  const heroHeight = window.innerHeight // Assume hero section is full viewport height
  isOverHero.value = window.scrollY < heroHeight
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
  window.addEventListener('scroll', handleScroll, { passive: true })
  // Initialize scroll state
  handleScroll()
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleKeydown)
  window.removeEventListener('scroll', handleScroll)
})

// Watch for route changes to close mobile menu
watch(() => route.path, () => {
  closeMobileMenu()
})
</script>

<style scoped>
/* Remove focus outlines from navigation links */
nav a:focus,
nav button:focus {
  outline: none;
  box-shadow: none;
}

/* Remove any default link styling that might cause borders */
nav a {
  text-decoration: none;
}

nav a:focus-visible {
  outline: none;
}

/* Ensure mobile menu covers full screen */
.mobile-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  height: 100dvh; /* For better mobile browser support */
}
</style>
