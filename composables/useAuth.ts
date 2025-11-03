/**
 * useAuth composable
 * Lightweight wrapper around the auth store that exposes
 * convenience computed values and navigation helpers.
 */
import { computed } from 'vue'
import { isInGracePeriod as isInGracePeriodUtil, getGraceDaysRemaining as getGraceDaysRemainingUtil } from '~/utils/gracePeriod'

export const useAuth = () => {
  const authStore = useAuthStore()
  const route = import.meta.client ? useRoute() : ({} as any)

  const isAuthenticated = computed(() => authStore.isAuthenticated)
  const canAccessFeatures = computed(() => authStore.canAccessFeatures)
  const subscriptionStatus = computed(() => authStore.subscriptionStatus)
  const trialDaysRemaining = computed(() => authStore.trialDaysRemaining)

  // Grace period: 3 days after trial end (via utils)
  const isInGracePeriod = computed(() => {
    const user = (authStore as any).user?.value || null
    if (!user?.trial?.endDate) return false
    return isInGracePeriodUtil(new Date(user.trial.endDate))
  })

  const graceDaysRemaining = computed(() => {
    if (!isInGracePeriod.value) return 0
    const user = (authStore as any).user?.value
    return getGraceDaysRemainingUtil(new Date(user.trial.endDate))
  })

  const shouldShowUpgradePrompt = computed(() => {
    return !canAccessFeatures.value || isInGracePeriod.value
  })

  const redirectToSubscription = (source: string = 'general') => {
    return navigateTo(`/subscription/plans?source=${encodeURIComponent(source)}`)
  }

  const redirectToLogin = (returnUrl?: string) => {
    const target = returnUrl || (route?.fullPath || '/')
    return navigateTo(`/auth/login?return=${encodeURIComponent(target)}`)
  }

  return {
    // state
    isAuthenticated,
    canAccessFeatures,
    subscriptionStatus,
    trialDaysRemaining,
    isInGracePeriod,
    graceDaysRemaining,
    shouldShowUpgradePrompt,

    // actions
    redirectToSubscription,
    redirectToLogin
  }
}
