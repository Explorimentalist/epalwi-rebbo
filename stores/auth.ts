/**
 * Authentication Store
 * Pinia store for managing authentication state and actions
 */

import { defineStore } from 'pinia'
import { ref, computed, shallowRef, readonly, nextTick } from 'vue'
import { track } from '~/utils/telemetry'
import type { 
  UserProfile, 
  AuthState, 
  MagicLinkResponse, 
  TokenVerificationResponse,
  SubscriptionStatus,
  UserRole,
  AuthError
} from '~/types/auth'

export const useAuthStore = defineStore('auth', () => {
  // State - Only serializable data for SSR
  const user = ref<UserProfile | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const initialized = ref(false)
  
  // Magic link resend state management
  const emailSendCount = ref<number>(0)
  const isResending = ref(false)
  const currentEmail = ref<string | null>(null)

  // Session token for JWT authentication
  const sessionToken = ref<string | null>(null)

  // Computed properties
  const isAuthenticated = computed(() => !!user.value)
  
  const isTrialActive = computed(() => {
    if (!user.value?.trial) return false
    return !user.value.trial.isExpired && user.value.trial.daysRemaining > 0
  })
  
  const isSubscriptionActive = computed(() => {
    if (!user.value?.subscription) return false
    return ['active', 'trialing'].includes(user.value.subscription.status)
  })
  
  const trialDaysRemaining = computed(() => {
    return user.value?.trial?.daysRemaining ?? 0
  })
  
  const canAccessFeatures = computed(() => {
    return isTrialActive.value || isSubscriptionActive.value
  })

  const subscriptionStatus = computed(() => {
    return user.value?.subscription?.status ?? 'trial'
  })

  // Resend functionality computed properties
  const canResend = computed(() => {
    return emailSendCount.value < 5 // Rate limit is 5 attempts per hour
  })

  // Helper functions
  const calculateTrialInfo = (createdAt: Date) => {
    const trialDays = 14
    const startDate = new Date(createdAt)
    const endDate = new Date(startDate.getTime() + (trialDays * 24 * 60 * 60 * 1000))
    const now = new Date()
    const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)))
    const isExpired = now > endDate

    return {
      startDate,
      endDate,
      daysRemaining,
      isExpired
    }
  }

  const createDefaultUserProfile = (email: string, uid: string): UserProfile => {
    const now = new Date()
    const trial = calculateTrialInfo(now)
    
    return {
      uid,
      email,
      displayName: undefined,
      photoURL: undefined,
      role: 'user' as UserRole,
      createdAt: now,
      lastLoginAt: now,
      subscription: {
        status: 'trial' as SubscriptionStatus
      },
      trial,
      preferences: {
        defaultLanguage: 'español',
        darkMode: false
      },
      emailVerified: true,
      isActive: true
    }
  }

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

  // Resend state management helper functions
  const resetEmailSendCount = () => {
    emailSendCount.value = 0
    currentEmail.value = null
  }

  const incrementSendCount = (email: string) => {
    if (currentEmail.value !== email) {
      // Email changed, reset counter
      emailSendCount.value = 1
      currentEmail.value = email
    } else {
      // Same email, increment counter
      emailSendCount.value += 1
    }
  }

  const sendMagicLink = async (email: string): Promise<MagicLinkResponse> => {
    setLoading(true)
    clearError()

    try {
      // Call the server API to send magic link
      const response = await $fetch<MagicLinkResponse>('/api/auth/send-magic-link', {
        method: 'POST',
        body: { 
          email,
          redirectUrl: `${window.location.origin}/auth/verify`
        }
      })

      if (!response.success) {
        throw new Error(response.error || 'Failed to send magic link')
      }

      // Track successful send
      incrementSendCount(email)
      
      return response
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to send magic link'
      setError(errorMessage)
      return {
        success: false,
        message: errorMessage,
        error: errorMessage
      }
    } finally {
      setLoading(false)
    }
  }

  const resendMagicLink = async (email?: string): Promise<MagicLinkResponse> => {
    const targetEmail = email || currentEmail.value
    
    if (!targetEmail) {
      return {
        success: false,
        message: 'No email address provided',
        error: 'No email address provided'
      }
    }

    if (!canResend.value) {
      return {
        success: false,
        message: 'Rate limit exceeded. Please wait before trying again.',
        error: 'Rate limit exceeded'
      }
    }

    isResending.value = true
    clearError()

    try {
      // Call the server API to send magic link
      const response = await $fetch<MagicLinkResponse>('/api/auth/send-magic-link', {
        method: 'POST',
        body: { 
          email: targetEmail,
          redirectUrl: `${window.location.origin}/auth/verify`
        }
      })

      if (!response.success) {
        throw new Error(response.error || 'Failed to resend magic link')
      }

      // Track successful resend
      incrementSendCount(targetEmail)
      
      return response
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to resend magic link'
      setError(errorMessage)
      return {
        success: false,
        message: errorMessage,
        error: errorMessage
      }
    } finally {
      isResending.value = false
    }
  }




  const verifyMagicLink = async (token: string): Promise<TokenVerificationResponse> => {
    setLoading(true)
    clearError()

    try {
      track('auth.verify_start')
      // Call the server API to verify magic link token
      const response = await $fetch<TokenVerificationResponse>('/api/auth/verify-magic-link', {
        method: 'POST',
        body: { token }
      })

      if (!response.success) {
        throw new Error(response.error || 'Invalid or expired magic link')
      }

      // Handle JWT session tokens
      if (response.sessionToken && response.user) {
        console.log('🔧 Debug: JWT session token received - setting user state')
        
        // In development mode, trust the trial data from the API response since it's correctly calculated
        // Only recalculate if trial data is missing or invalid
        let trial = response.user.trial
        if (!trial || !trial.endDate || !trial.startDate) {
          trial = calculateTrialInfo(response.user.createdAt)
          console.log('🔧 Debug: Recalculated trial info due to missing data:', trial)
        } else {
          // Ensure dates are proper Date objects (they may have been serialized as strings)
          trial = {
            ...trial,
            startDate: trial.startDate instanceof Date ? trial.startDate : new Date(trial.startDate),
            endDate: trial.endDate instanceof Date ? trial.endDate : new Date(trial.endDate)
          }
          // Recalculate daysRemaining and isExpired to ensure they're current
          const now = new Date()
          const daysRemaining = Math.max(0, Math.ceil((trial.endDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)))
          const isExpired = now > trial.endDate
          trial.daysRemaining = daysRemaining
          trial.isExpired = isExpired
          console.log('🔧 Debug: Using trial info from API response (dates normalized):', trial)
        }
        
        // Store session token for API requests
        sessionToken.value = response.sessionToken
        
        user.value = {
          ...response.user,
          trial
        }

        // Persist auth state across navigations
        try {
          sessionStorage.setItem('auth-session-token', response.sessionToken)
          sessionStorage.setItem('auth-user', JSON.stringify(response.user))
        } catch (e) {
          console.warn('Auth state persistence failed:', e)
        }

        // Force reactivity update by triggering change detection
        await nextTick()
        console.log('🔧 Debug: Auth state updated, isAuthenticated:', isAuthenticated.value)
      }

      track('auth.verify_success')
      return response
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to verify magic link'
      setError(errorMessage)
      track('auth.verify_error', { message: String(errorMessage).slice(0, 80) })
      return {
        success: false,
        message: errorMessage,
        error: errorMessage
      }
    } finally {
      setLoading(false)
    }
  }


  const refreshUser = async (): Promise<void> => {
    if (!user.value || !sessionToken.value) return

    try {
      setLoading(true)
      // Call API to refresh user data
      const response = await $fetch<{ success: boolean; user?: UserProfile }>('/api/auth/refresh', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${sessionToken.value}`
        }
      })
      
      if (response.success && response.user) {
        // Ensure trial data is current
        const trial = calculateTrialInfo(response.user.createdAt)
        user.value = {
          ...response.user,
          trial
        }
      }
    } catch (err) {
      console.error('Error refreshing user:', err)
      setError('Failed to refresh user data')
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (data: Partial<UserProfile>): Promise<void> => {
    if (!user.value || !sessionToken.value) throw new Error('User not authenticated')

    try {
      setLoading(true)
      
      // Call API to update user profile
      const response = await $fetch<{ success: boolean; user?: UserProfile }>('/api/auth/profile', {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${sessionToken.value}`
        },
        body: data
      })
      
      if (response.success && response.user) {
        user.value = { ...user.value, ...response.user }
      }
    } catch (err) {
      console.error('Error updating profile:', err)
      setError('Failed to update profile')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const signOut = async (): Promise<void> => {
    try {
      setLoading(true)
      
      // Call API to invalidate session if we have a token
      if (sessionToken.value) {
        try {
          await $fetch('/api/auth/signout', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${sessionToken.value}`
            }
          })
        } catch (e) {
          console.warn('Server signout failed:', e)
        }
      }
      
      // Clear local state
      user.value = null
      sessionToken.value = null
      clearError()
      
      // Clear stored auth data
      try {
        sessionStorage.removeItem('auth-session-token')
        sessionStorage.removeItem('auth-user')
      } catch {}
    } catch (err) {
      console.error('Error signing out:', err)
      setError('Failed to sign out')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const deleteAccount = async (): Promise<void> => {
    if (!user.value || !sessionToken.value) {
      throw new Error('User not authenticated')
    }

    try {
      setLoading(true)
      
      // Call API to delete account
      const response = await $fetch<{ success: boolean }>('/api/auth/delete-account', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${sessionToken.value}`
        }
      })
      
      if (response.success) {
        // Clear local state
        user.value = null
        sessionToken.value = null
        clearError()
        
        // Clear stored auth data
        try {
          sessionStorage.removeItem('auth-session-token')
          sessionStorage.removeItem('auth-user')
        } catch {}
      }
    } catch (err) {
      console.error('Error deleting account:', err)
      setError('Failed to delete account')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Initialize auth state from stored session
  const initializeAuth = (): Promise<void> => {
    return new Promise((resolve) => {
      // Only run on client-side to prevent SSR issues
      if (import.meta.server) {
        initialized.value = true
        resolve()
        return
      }

      // Guard against multiple initializations
      if (initialized.value) {
        resolve()
        return
      }

      try {
        // Try to restore auth state from sessionStorage
        const storedToken = sessionStorage.getItem('auth-session-token')
        const storedUser = sessionStorage.getItem('auth-user')
        
        if (storedToken && storedUser) {
          const parsed = JSON.parse(storedUser)
          
          // Recalculate trial information when restoring from session storage
          const trial = calculateTrialInfo(parsed.createdAt)
          console.log('🔧 Debug: Restored auth - recalculated trial info:', trial)
          
          sessionToken.value = storedToken
          user.value = {
            ...parsed,
            trial
          }
          console.log('🔧 Debug: Restored auth state for user:', parsed.email)
          
          // Load subscription data when user is restored
          try {
            import('~/stores/subscription').then(module => {
              const subscriptionStore = module.useSubscriptionStore()
              subscriptionStore.loadUserSubscription?.(parsed.uid)
            }).catch((e: unknown) => {
              console.warn('Subscription store load failed:', e)
            })
          } catch (e: unknown) {
            console.warn('Subscription store import failed:', e)
          }
        } else {
          user.value = null
          sessionToken.value = null
        }
      } catch (err) {
        console.error('Auth state restoration error:', err)
        user.value = null
        sessionToken.value = null
      } finally {
        initialized.value = true
        resolve()
      }
    })
  }

  return {
    // State - Only serializable data
    user: readonly(user),
    isLoading: readonly(isLoading),
    error: readonly(error),
    initialized: readonly(initialized),
    emailSendCount: readonly(emailSendCount),
    isResending: readonly(isResending),
    currentEmail: readonly(currentEmail),
    
    // Session token
    sessionToken: readonly(sessionToken),
    
    // Computed
    isAuthenticated,
    isTrialActive,
    isSubscriptionActive,
    trialDaysRemaining,
    canAccessFeatures,
    subscriptionStatus,
    canResend,
    
    // Actions
    sendMagicLink,
    resendMagicLink,
    verifyMagicLink,
    signOut,
    refreshUser,
    updateProfile,
    deleteAccount,
    initializeAuth,
    setError,
    clearError,
    resetEmailSendCount
  }
}) 
