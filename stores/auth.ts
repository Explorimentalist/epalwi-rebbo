/**
 * Authentication Store
 * Pinia store for managing authentication state and actions
 */

import { defineStore } from 'pinia'
import { ref, computed, readonly } from 'vue'
import { onAuthStateChanged, signOut as firebaseSignOut, type User as FirebaseUser } from 'firebase/auth'
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { getFirebaseAuth, getFirebaseDb } from '~/services/firebase'
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
  // State
  const user = ref<UserProfile | null>(null)
  const firebaseUser = ref<FirebaseUser | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const initialized = ref(false)

  // Computed properties
  const isAuthenticated = computed(() => !!user.value)
  
  const isTrialActive = computed(() => {
    if (!user.value?.trial) return false
    return !user.value.trial.isExpired && user.value.trial.daysRemaining > 0
  })
  
  const isSubscriptionActive = computed(() => {
    return user.value?.subscription?.status === 'active'
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

  const createDefaultUserProfile = (firebaseUser: FirebaseUser): UserProfile => {
    const now = new Date()
    const trial = calculateTrialInfo(now)
    
    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email!,
      displayName: firebaseUser.displayName || undefined,
      photoURL: firebaseUser.photoURL || undefined,
      role: 'user' as UserRole,
      createdAt: new Date(now.getTime()), // Ensure plain Date object for serialization
      lastLoginAt: new Date(now.getTime()), // Ensure plain Date object for serialization
      subscription: {
        status: 'trial' as SubscriptionStatus
      },
      trial,
      emailVerified: firebaseUser.emailVerified,
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

  const verifyMagicLink = async (token: string): Promise<TokenVerificationResponse> => {
    setLoading(true)
    clearError()

    try {
      // Call the server API to verify magic link token
      const response = await $fetch<TokenVerificationResponse>('/api/auth/verify-magic-link', {
        method: 'POST',
        body: { token }
      })

      if (!response.success) {
        throw new Error(response.error || 'Invalid or expired magic link')
      }

      // If verification successful, the Firebase auth state will be updated automatically
      return response
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to verify magic link'
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

  const loadUserProfile = async (firebaseUser: FirebaseUser): Promise<UserProfile> => {
    const db = getFirebaseDb()
    const userDoc = doc(db, 'users', firebaseUser.uid)
    
    try {
      const docSnap = await getDoc(userDoc)
      
      if (docSnap.exists()) {
        const data = docSnap.data()
        
        // Update trial information - ensure dates are plain Date objects for serialization
        const createdAt = data['createdAt'].toDate() 
        const trial = calculateTrialInfo(createdAt)
        
        const userProfile: UserProfile = {
          ...data,
          uid: firebaseUser.uid,
          email: firebaseUser.email!,
          createdAt: new Date(createdAt.getTime()), // Convert to plain Date object
          lastLoginAt: new Date(), // Plain Date object
          trial,
          emailVerified: firebaseUser.emailVerified
        } as UserProfile

        // Update last login time
        await updateDoc(userDoc, {
          lastLoginAt: serverTimestamp(),
          emailVerified: firebaseUser.emailVerified
        })

        return userProfile
      } else {
        // Create new user profile
        const userProfile = createDefaultUserProfile(firebaseUser)
        
        await setDoc(userDoc, {
          ...userProfile,
          createdAt: serverTimestamp(),
          lastLoginAt: serverTimestamp()
        })

        return userProfile
      }
    } catch (err) {
      console.error('Error loading user profile:', err)
      throw err
    }
  }

  const refreshUser = async (): Promise<void> => {
    if (!firebaseUser.value) return

    try {
      setLoading(true)
      const userProfile = await loadUserProfile(firebaseUser.value)
      user.value = userProfile
    } catch (err) {
      console.error('Error refreshing user:', err)
      setError('Failed to refresh user data')
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (data: Partial<UserProfile>): Promise<void> => {
    if (!user.value) throw new Error('User not authenticated')

    try {
      setLoading(true)
      const db = getFirebaseDb()
      const userDoc = doc(db, 'users', user.value.uid)
      
      await updateDoc(userDoc, {
        ...data,
        lastLoginAt: serverTimestamp()
      })

      // Update local state
      user.value = { ...user.value, ...data }
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
      const auth = getFirebaseAuth()
      await firebaseSignOut(auth)
      
      // Clear local state
      user.value = null
      firebaseUser.value = null
      clearError()
    } catch (err) {
      console.error('Error signing out:', err)
      setError('Failed to sign out')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const deleteAccount = async (): Promise<void> => {
    if (!firebaseUser.value || !user.value) {
      throw new Error('User not authenticated')
    }

    try {
      setLoading(true)
      
      // Delete user document from Firestore
      const db = getFirebaseDb()
      const userDoc = doc(db, 'users', user.value.uid)
      await updateDoc(userDoc, {
        isActive: false,
        deletedAt: serverTimestamp()
      })

      // Delete Firebase Auth user
      await firebaseUser.value.delete()
      
      // Clear local state
      user.value = null
      firebaseUser.value = null
      clearError()
    } catch (err) {
      console.error('Error deleting account:', err)
      setError('Failed to delete account')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Initialize auth state listener
  const initializeAuth = (): Promise<void> => {
    return new Promise((resolve) => {
      const auth = getFirebaseAuth()
      
      const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
        try {
          firebaseUser.value = fbUser
          
          if (fbUser) {
            // User is signed in
            const userProfile = await loadUserProfile(fbUser)
            user.value = userProfile
          } else {
            // User is signed out
            user.value = null
          }
        } catch (err) {
          console.error('Auth state change error:', err)
          setError('Authentication error occurred')
        } finally {
          if (!initialized.value) {
            initialized.value = true
            resolve()
          }
        }
      })

      // Store unsubscribe function for cleanup
      if (process.client) {
        window.addEventListener('beforeunload', unsubscribe)
      }
    })
  }

  return {
    // State  
    user,
    isLoading,
    error,
    initialized,
    // Note: firebaseUser is intentionally excluded from the store return
    // Firebase User objects contain circular references that break SSR serialization
    
    // Computed
    isAuthenticated,
    isTrialActive,
    isSubscriptionActive,
    trialDaysRemaining,
    canAccessFeatures,
    subscriptionStatus,
    
    // Actions
    sendMagicLink,
    verifyMagicLink,
    signOut,
    refreshUser,
    updateProfile,
    deleteAccount,
    initializeAuth,
    setError,
    clearError
  }
}) 