/**
 * Global auth middleware
 * - Initializes the auth store once on app load
 * - Optionally guards routes that set `definePageMeta({ authRequired: true })`
 */
export default defineNuxtRouteMiddleware(async (to, from) => {
  if (import.meta.server) return

  const authStore = useAuthStore()

  // Initialize auth state once on client
  const isInitialized = (authStore as any).initialized?.value ?? false
  if (!isInitialized) {
    try {
      await authStore.initializeAuth()
    } catch (e) {
      // Non-fatal; allow navigation while auth initializes
      console.warn('Auth initialization warning:', e)
    }
  }

  // Optional protection: routes can opt-in via meta flag
  const requiresAuth = Boolean((to.meta as any)?.authRequired)
  const isAuthRoute = to.path.startsWith('/auth')
  const isLoggedIn = Boolean((authStore as any).isAuthenticated?.value)

  if (requiresAuth && !isAuthRoute && !isLoggedIn) {
    return navigateTo(`/auth/login?return=${encodeURIComponent(to.fullPath)}`)
  }
})

