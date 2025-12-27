/**
 * Subscription Store
 * Pinia store for managing subscription state and Stripe operations
 */

import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { 
  SubscriptionPlan, 
  UserSubscription, 
  PlanType,
  SubscriptionStatus 
} from '~/types/subscription'

export const useSubscriptionStore = defineStore('subscription', () => {
  // State
  const plans = ref<SubscriptionPlan[]>([
    {
      id: 'monthly',
      title: 'Plan Mensual',
      price: 1,
      period: 'por mes',
      features: [
        'Acceso completo al diccionario',
        'Búsqueda offline',
        'Sin anuncios',
        'Cancela cuando quieras'
      ],
      priceId: '', // Will be set from environment
      trialDays: 14
    },
    {
      id: 'annual',
      title: 'Plan Anual',
      price: 8.97,
      period: 'por año',
      features: [
        'Acceso completo al diccionario',
        'Búsqueda offline',
        'Sin anuncios',
        'Cancela cuando quieras',
        'Ahorras €3.03 al año'
      ],
      priceId: '', // Will be set from environment
      popular: true,
      savings: 3.03,
      trialDays: 14
    }
  ])
  
  const selectedPlan = ref<SubscriptionPlan | null>(null)
  const userSubscription = ref<UserSubscription | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Computed properties
  const hasActiveSubscription = computed(() => {
    if (!userSubscription.value) return false
    return ['active', 'trialing'].includes(userSubscription.value.status)
  })
  
  const isTrialActive = computed(() => {
    if (!userSubscription.value) return false
    return userSubscription.value.status === 'trialing'
  })
  
  const trialDaysRemaining = computed(() => {
    if (!userSubscription.value?.trialEnd) return 0
    const now = new Date()
    const trialEnd = new Date(userSubscription.value.trialEnd)
    const diffTime = trialEnd.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return Math.max(0, diffDays)
  })
  
  const nextBillingDate = computed(() => {
    if (!userSubscription.value?.currentPeriodEnd) return null
    return new Date(userSubscription.value.currentPeriodEnd)
  })
  
  const canCancel = computed(() => {
    if (!userSubscription.value) return false
    return ['active', 'trialing'].includes(userSubscription.value.status)
  })

  // Actions
  const setError = (message: string | null) => {
    error.value = message
  }

  const clearError = () => {
    error.value = null
  }

  const setLoading = (loading: boolean) => {
    isLoading.value = loading
  }

  const selectPlan = (plan: SubscriptionPlan) => {
    selectedPlan.value = plan
    clearError()
  }

  const clearSelectedPlan = () => {
    selectedPlan.value = null
    clearError()
  }

  const updateUserSubscription = (subscription: UserSubscription | null) => {
    userSubscription.value = subscription
  }

  const loadUserSubscription = async (userId: string) => {
    if (!userId) return
    
    try {
      setLoading(true)
      clearError()
      
      // Check network connectivity first
      if (!navigator.onLine) {
        console.log('📴 Device is offline, skipping subscription load')
        setLoading(false)
        return
      }
      
      // Fetch subscription data from API
      const response = await $fetch<{ success: boolean; subscription?: UserSubscription }>('/api/subscription', {
        method: 'GET'
      })

      if (response.success && response.subscription) {
        const sub = response.subscription

        const toDate = (v: any): Date | undefined => {
          if (!v) return undefined
          if (typeof v === 'string' || typeof v === 'number') return new Date(v)
          return v as Date
        }

        updateUserSubscription({
          status: sub.status,
          stripeSubscriptionId: sub.stripeSubscriptionId,
          stripeCustomerId: sub.stripeCustomerId,
          planType: sub.planType,
          currentPeriodStart: toDate(sub.currentPeriodStart),
          currentPeriodEnd: toDate(sub.currentPeriodEnd),
          cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
          trialStart: toDate(sub.trialStart),
          trialEnd: toDate(sub.trialEnd)
        } as UserSubscription)
      }
      
    } catch (err: any) {
      // Handle API errors gracefully
      if (err.statusCode === 401 || err.message?.includes('unauthorized')) {
        console.log('📴 Firebase is offline, subscription data unavailable')
        // Don't show error to user for offline state
        setLoading(false)
        return
      }
      
      const errorMessage = err.message || 'Failed to load subscription'
      setError(errorMessage)
      console.error('Error loading subscription:', err)
    } finally {
      setLoading(false)
    }
  }

  const cancelSubscription = async () => {
    if (!userSubscription.value?.stripeSubscriptionId) {
      setError('No subscription to cancel')
      return
    }
    
    try {
      setLoading(true)
      clearError()
      
      // Call backend to cancel subscription
      const response = await $fetch('/api/stripe/cancel-subscription', {
        method: 'POST',
        body: {
          subscriptionId: userSubscription.value.stripeSubscriptionId
        }
      })
      
      if (response.success) {
        // Update local state
        if (userSubscription.value) {
          userSubscription.value.status = 'canceled'
          userSubscription.value.cancelAtPeriodEnd = true
        }
      }
      
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to cancel subscription'
      setError(errorMessage)
      console.error('Error canceling subscription:', err)
    } finally {
      setLoading(false)
    }
  }

  const reactivateSubscription = async () => {
    if (!userSubscription.value?.stripeSubscriptionId) {
      setError('No subscription to reactivate')
      return
    }
    
    try {
      setLoading(true)
      clearError()
      
      // Call backend to reactivate subscription
      const response = await $fetch('/api/stripe/reactivate-subscription', {
        method: 'POST',
        body: {
          subscriptionId: userSubscription.value.stripeSubscriptionId
        }
      })
      
      if (response.success) {
        // Update local state
        if (userSubscription.value) {
          userSubscription.value.status = 'active'
          userSubscription.value.cancelAtPeriodEnd = false
        }
      }
      
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to reactivate subscription'
      setError(errorMessage)
      console.error('Error reactivating subscription:', err)
    } finally {
      setLoading(false)
    }
  }

  const getCustomerPortalUrl = async () => {
    try {
      setLoading(true)
      clearError()
      
      const response = await $fetch('/api/stripe/create-portal-session', {
        method: 'POST'
      })
      
      if (response.url) {
        return response.url
      } else {
        throw new Error('No portal URL received')
      }
      
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to get customer portal URL'
      setError(errorMessage)
      console.error('Error getting portal URL:', err)
      return null
    } finally {
      setLoading(false)
    }
  }

  // Initialize plans with Stripe price IDs from environment
  const initializePlans = () => {
    const config = useRuntimeConfig()
    
    // Set Stripe price IDs from environment variables
    // You'll need to add these to your .env file
    const monthlyPriceId = config.public.stripeMonthlyPriceId
    const annualPriceId = config.public.stripeAnnualPriceId
    
    if (monthlyPriceId) {
      const monthlyPlan = plans.value.find(p => p.id === 'monthly')
      if (monthlyPlan) {
        monthlyPlan.priceId = monthlyPriceId
      }
    }
    
    if (annualPriceId) {
      const annualPlan = plans.value.find(p => p.id === 'annual')
      if (annualPlan) {
        annualPlan.priceId = annualPriceId
      }
    }
  }

  // Keep subscription state in sync with auth user changes
  const startAuthSubscriptionSync = async () => {
    if (import.meta.server) return
    try {
      const { useAuthStore } = await import('~/stores/auth')
      const authStore = useAuthStore()
      watch(
        () => authStore.user,
        async (newUser) => {
          if (newUser?.uid) {
            await loadUserSubscription(newUser.uid)
          } else {
            updateUserSubscription(null)
          }
        },
        { immediate: false }
      )
    } catch (e) {
      // optional sync
    }
  }

  // Start sync on client
  startAuthSubscriptionSync()

  // Post-subscription redirect: when status flips to active, return user to attempted route
  if (import.meta.client) {
    watch(
      () => userSubscription.value?.status,
      (newStatus, oldStatus) => {
        if (newStatus === 'active' && oldStatus !== 'active') {
          try {
            const path = sessionStorage.getItem('attempted-route')
            if (path) {
              sessionStorage.removeItem('attempted-route')
              navigateTo(path)
            }
          } catch {
            // ignore
          }
        }
      }
    )
  }

  return {
    // State
    plans: readonly(plans),
    selectedPlan: readonly(selectedPlan),
    userSubscription: readonly(userSubscription),
    isLoading: readonly(isLoading),
    error: readonly(error),
    
    // Computed
    hasActiveSubscription,
    isTrialActive,
    trialDaysRemaining,
    nextBillingDate,
    canCancel,
    
    // Actions
    selectPlan,
    clearSelectedPlan,
    updateUserSubscription,
    loadUserSubscription,
    cancelSubscription,
    reactivateSubscription,
    getCustomerPortalUrl,
    initializePlans,
    setError,
    clearError,
    setLoading
  }
})
