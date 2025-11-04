/**
 * Route middleware for subscription-protected pages
 * - Requires authenticated user (login redirect if not)
 * - Allows access during grace period, but stores attempted route
 * - Blocks expired users and redirects to plans page
 */
export default defineNuxtRouteMiddleware((to, from) => {
  if (import.meta.server) return

  const authStore = useAuthStore()
  const { canAccessFeatures, isInGracePeriod } = useAuth()

  // One-shot bypass right after successful verification to avoid race on auth hydration
  try {
    const justVerified = sessionStorage.getItem('just-verified')
    if (justVerified) {
      sessionStorage.removeItem('just-verified')
      console.log('🔧 Debug: Just verified - bypassing subscription/login check once')
      return
    }
  } catch {}

  // If auth isn't initialized yet, don't redirect. Let the page render and
  // gating components (e.g., FeatureGate) handle interim states. This avoids
  // flickering redirects to /auth/login while the auth store hydrates in dev.
  // Treat missing/undefined as not initialized to avoid premature redirects
  const isInitialized = (authStore as any).initialized?.value ?? false
  if (!isInitialized) {
    try { sessionStorage.setItem('attempted-route', to.fullPath) } catch {}
    return
  }

  // In development mode, give extra time for auth state to sync after magic link verification
  // Check if we just came from auth verification
  if (import.meta.dev && from?.path === '/auth/verify') {
    console.log('🔧 Debug: Coming from auth verification - allowing navigation without subscription check')
    return
  }

  // Require login before checking subscription
  const isAuthRoute = to.path.startsWith('/auth')
  const isLoggedIn = Boolean((authStore as any).isAuthenticated?.value)
  if (!isAuthRoute && !isLoggedIn) {
    return navigateTo(`/auth/login?return=${encodeURIComponent(to.fullPath)}`)
  }

  // Grace period: allow but remember where the user wanted to go
  if (isInGracePeriod.value) {
    try {
      sessionStorage.setItem('attempted-route', to.fullPath)
    } catch {}
    return
  }

  // For offline scenarios: if we can't determine subscription status, allow access
  // This prevents blocking users when Firebase is unreachable
  const isOffline = !navigator.onLine
  if (isOffline) {
    console.log('📴 Device offline - allowing dictionary access with reduced functionality')
    return
  }

  // Expired: block and redirect to plans
  if (!canAccessFeatures.value) {
    try {
      sessionStorage.setItem('attempted-route', to.fullPath)
    } catch {}
    return navigateTo('/subscription/plans?source=access-denied')
  }
})
