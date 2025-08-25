/**
 * Mock Authentication Composable
 * Provides mock authentication state for testing components
 */

import { ref, computed } from 'vue'

export const useMockAuth = () => {
  // Mock state
  const mockUser = ref({
    uid: 'mock-user-123',
    email: 'test@example.com',
    displayName: 'Test User',
    role: 'user',
    createdAt: new Date(),
    lastLoginAt: new Date(),
    subscription: {
      status: 'trial'
    },
    trial: {
      startDate: new Date(),
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      daysRemaining: 12,
      isExpired: false
    },
    emailVerified: true,
    isActive: true
  })

  const isAuthenticated = ref(false)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Computed properties
  const user = computed(() => isAuthenticated.value ? mockUser.value : null)
  
  const isTrialActive = computed(() => {
    if (!isAuthenticated.value) return false
    return !mockUser.value.trial.isExpired && mockUser.value.trial.daysRemaining > 0
  })
  
  const isSubscriptionActive = computed(() => {
    return isAuthenticated.value && mockUser.value.subscription.status === 'active'
  })
  
  const trialDaysRemaining = computed(() => {
    return isAuthenticated.value ? mockUser.value.trial.daysRemaining : 0
  })
  
  const canAccessFeatures = computed(() => {
    return isTrialActive.value || isSubscriptionActive.value
  })

  const subscriptionStatus = computed(() => {
    return isAuthenticated.value ? mockUser.value.subscription.status : 'trial'
  })

  // Actions
  const signIn = async (email: string) => {
    isLoading.value = true
    error.value = null
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    try {
      isAuthenticated.value = true
      return { success: true, message: 'Signed in successfully' }
    } catch (err) {
      error.value = 'Failed to sign in'
      return { success: false, error: 'Failed to sign in' }
    } finally {
      isLoading.value = false
    }
  }

  const signOut = async () => {
    isLoading.value = true
    error.value = null
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300))
    
    try {
      isAuthenticated.value = false
      return { success: true, message: 'Signed out successfully' }
    } catch (err) {
      error.value = 'Failed to sign out'
      return { success: false, error: 'Failed to sign out' }
    } finally {
      isLoading.value = false
    }
  }

  const sendMagicLink = async (email: string) => {
    isLoading.value = true
    error.value = null
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    try {
      return { success: true, message: 'Magic link sent successfully' }
    } catch (err) {
      error.value = 'Failed to send magic link'
      return { success: false, error: 'Failed to send magic link' }
    } finally {
      isLoading.value = false
    }
  }

  const verifyMagicLink = async (token: string) => {
    isLoading.value = true
    error.value = null
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800))
    
    try {
      isAuthenticated.value = true
      return { success: true, message: 'Magic link verified successfully' }
    } catch (err) {
      error.value = 'Failed to verify magic link'
      return { success: false, error: 'Failed to verify magic link' }
    } finally {
      isLoading.value = false
    }
  }

  const refreshUser = async () => {
    if (!isAuthenticated.value) return
    
    isLoading.value = true
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 400))
    
    try {
      // Update last login time
      mockUser.value.lastLoginAt = new Date()
    } catch (err) {
      error.value = 'Failed to refresh user data'
    } finally {
      isLoading.value = false
    }
  }

  const updateProfile = async (data: any) => {
    if (!isAuthenticated.value) throw new Error('User not authenticated')
    
    isLoading.value = true
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 600))
    
    try {
      // Update mock user data
      Object.assign(mockUser.value, data)
      return { success: true, message: 'Profile updated successfully' }
    } catch (err) {
      error.value = 'Failed to update profile'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const deleteAccount = async () => {
    if (!isAuthenticated.value) throw new Error('User not authenticated')
    
    isLoading.value = true
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    try {
      isAuthenticated.value = false
      return { success: true, message: 'Account deleted successfully' }
    } catch (err) {
      error.value = 'Failed to delete account'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const setError = (message: string | null) => {
    error.value = message
  }

  const clearError = () => {
    error.value = null
  }

  const setLoading = (loading: boolean) => {
    isLoading.value = loading
  }

  // Initialize auth state listener (mock)
  const initializeAuth = (): Promise<void> => {
    return new Promise((resolve) => {
      // Simulate initialization delay
      setTimeout(() => {
        resolve()
      }, 100)
    })
  }

  return {
    // State
    user: readonly(user),
    firebaseUser: readonly(computed(() => null)), // Mock doesn't have Firebase user
    isLoading: readonly(isLoading),
    error: readonly(error),
    initialized: readonly(computed(() => true)),
    
    // Computed
    isAuthenticated,
    isTrialActive,
    isSubscriptionActive,
    trialDaysRemaining,
    canAccessFeatures,
    subscriptionStatus,
    
    // Actions
    signIn,
    signOut,
    sendMagicLink,
    verifyMagicLink,
    refreshUser,
    updateProfile,
    deleteAccount,
    initializeAuth,
    setError,
    clearError
  }
}
