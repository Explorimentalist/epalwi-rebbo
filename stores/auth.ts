/**
 * Authentication Store
 * Pinia store for managing authentication state and actions
 */

import { defineStore } from 'pinia'
import { ref, computed, shallowRef, readonly, nextTick } from 'vue'
import { track } from '~/utils/telemetry'
import { onAuthStateChanged, signOut as firebaseSignOut, sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink, type User as FirebaseUser } from 'firebase/auth'
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
  // State - Only serializable data for SSR
  const user = ref<UserProfile | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const initialized = ref(false)

  // Client-only state (not serialized) - use shallowRef for complex objects
  const firebaseUser = shallowRef<FirebaseUser | null>(null)

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

  // Production: Send Firebase Email Link
  const sendEmailLink = async (email: string, returnPath?: string): Promise<MagicLinkResponse> => {
    setLoading(true)
    clearError()

    try {
      const auth = getFirebaseAuth()
      const config = useRuntimeConfig()
      const baseUrl = (config as any)?.public?.appUrl || (process.client ? window.location.origin : '')
      const url = returnPath ? `${baseUrl}/auth/verify?return=${encodeURIComponent(returnPath)}` : `${baseUrl}/auth/verify`

      const actionCodeSettings = {
        url,
        handleCodeInApp: true
      } as any

      await sendSignInLinkToEmail(auth, email, actionCodeSettings)
      try { localStorage.setItem('emailForSignIn', email) } catch {}
      track('auth.link_sent')

      return { success: true, message: 'Email link sent' }
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to send email link'
      setError(errorMessage)
      track('auth.link_error', { message: String(errorMessage).slice(0, 60) })
      return { success: false, message: errorMessage, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Production: Complete Firebase Email Link sign-in
  const completeEmailLink = async (url: string, email?: string): Promise<{ success: boolean; message: string }> => {
    setLoading(true)
    clearError()

    try {
      track('auth.verify_start')
      const auth = getFirebaseAuth()
      const runtime = useRuntimeConfig()
      const devMock = Boolean((runtime as any)?.public?.devAuthMock)

      if (!isSignInWithEmailLink(auth, url)) {
        throw new Error('Invalid email link')
      }

      let resolvedEmail = email
      if (!resolvedEmail) {
        try { resolvedEmail = localStorage.getItem('emailForSignIn') || undefined } catch {}
      }
      if (!resolvedEmail) {
        throw new Error('email-required')
      }

      const cred = await signInWithEmailLink(auth, resolvedEmail, url)
      firebaseUser.value = cred.user as any

      // Clear stored email
      try { localStorage.removeItem('emailForSignIn') } catch {}

      // Call post-sign-in endpoint in production to upsert profile and set claims
      if (!devMock) {
        try {
          const idToken = await (cred.user as any)?.getIdToken?.(true)
          const fetcher: any = (globalThis as any).$fetch || (typeof $fetch !== 'undefined' ? ($fetch as any) : null)
          if (!fetcher) throw new Error('No $fetch available')
          const res: any = await fetcher('/api/auth/post-sign-in', {
            method: 'POST',
            headers: idToken ? { Authorization: `Bearer ${idToken}` } : undefined,
            body: { uid: (cred.user as any).uid, email: (cred.user as any).email }
          })
          if (res?.success && res?.user) {
            user.value = res.user
            if (res?.claimsUpdated && (cred.user as any)?.getIdToken) {
              try { await (cred.user as any).getIdToken(true) } catch {}
            }
          }
        } catch (e) {
          console.warn('post-sign-in call failed; falling back to client profile load', e)
        }
      }

      // Fallback to loading profile directly if user not set yet
      if (!user.value) {
        try {
          const profile = await loadUserProfile(cred.user as any)
          user.value = profile
        } catch (e) {
          console.warn('Profile load after email link sign-in failed:', e)
        }
      }

      track('auth.verify_success')
      return { success: true, message: 'Signed in with email link' }
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to complete email link sign-in'
      setError(errorMessage)
      track('auth.verify_error', { message: String(errorMessage).slice(0, 80) })
      return { success: false, message: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Helper: detect if URL is an email link
  const isEmailLink = (url: string): boolean => {
    try {
      const auth = getFirebaseAuth()
      return isSignInWithEmailLink(auth, url)
    } catch {
      return false
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

      // In development mode with mock tokens, manually set the user state
      if (import.meta.dev && response.firebaseToken?.startsWith('dev_mock_token_') && response.user) {
        console.log('🔧 Debug: Development mode - manually setting user state')
        user.value = response.user
        // Create a mock Firebase user for compatibility
        firebaseUser.value = {
          uid: response.user.uid,
          email: response.user.email,
          displayName: response.user.displayName,
          photoURL: response.user.photoURL,
          emailVerified: response.user.emailVerified,
          // Add other required Firebase User properties as needed
        } as any

        // Persist mock auth across navigations in dev so route middleware sees it
        try {
          sessionStorage.setItem('dev-auth', '1')
          sessionStorage.setItem('dev-auth-user', JSON.stringify(response.user))
        } catch (e) {
          console.warn('Dev auth persistence failed:', e)
        }

        // Force reactivity update by triggering change detection
        await nextTick()
        console.log('🔧 Debug: Auth state updated, isAuthenticated:', isAuthenticated.value)
      } else {
        // In production, Firebase auth state will be updated automatically
        console.log('🔧 Debug: Production mode - waiting for Firebase auth state update')
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

  const loadUserProfile = async (firebaseUser: FirebaseUser): Promise<UserProfile> => {
    const db = getFirebaseDb()
    const userDoc = doc(db, 'users', firebaseUser.uid)
    
    try {
      const docSnap = await getDoc(userDoc)
      
      if (docSnap.exists()) {
        const data = docSnap.data()
        
        // Update trial information
        const trial = calculateTrialInfo(data['createdAt'].toDate())
        
        // Handle subscription data from webhook updates
        let subscription = data['subscription'] || { status: 'trial' as SubscriptionStatus }
        
        // Convert Firestore timestamp strings back to dates if needed
        if (subscription.currentPeriodStart && typeof subscription.currentPeriodStart === 'string') {
          subscription.currentPeriodStart = new Date(subscription.currentPeriodStart)
        }
        if (subscription.currentPeriodEnd && typeof subscription.currentPeriodEnd === 'string') {
          subscription.currentPeriodEnd = new Date(subscription.currentPeriodEnd)
        }

        const userProfile: UserProfile = {
          ...data,
          uid: firebaseUser.uid,
          email: firebaseUser.email!,
          createdAt: data['createdAt'].toDate(),
          lastLoginAt: new Date(),
          trial,
          subscription,
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
      // Clear local artifacts (dev + email link)
      try {
        sessionStorage.removeItem('dev-auth')
        sessionStorage.removeItem('dev-auth-user')
      } catch {}
      try { localStorage.removeItem('emailForSignIn') } catch {}
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

      // Ensure we're on the client side
      if (import.meta.server) {
        initialized.value = true
        resolve()
        return
      }

      const auth = getFirebaseAuth()
      
      const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
        try {
          firebaseUser.value = fbUser
          
          if (fbUser) {
            // User is signed in
            const userProfile = await loadUserProfile(fbUser)
            user.value = userProfile

            // Load subscription data when user signs in
            try {
              const { useSubscriptionStore } = await import('~/stores/subscription')
              const subscriptionStore = useSubscriptionStore()
              await subscriptionStore.loadUserSubscription(fbUser.uid)
            } catch (e) {
              console.warn('Subscription store load failed:', e)
            }
          } else {
            // No Firebase user. In development, attempt to hydrate from a persisted mock user
            if (import.meta.dev) {
              try {
                const devAuth = sessionStorage.getItem('dev-auth')
                const persisted = sessionStorage.getItem('dev-auth-user')
                if (devAuth && persisted) {
                  const parsed = JSON.parse(persisted)
                  user.value = parsed
                  // Provide a minimal mock firebase user for downstream consumers
                  firebaseUser.value = {
                    uid: parsed.uid,
                    email: parsed.email,
                    displayName: parsed.displayName,
                    photoURL: parsed.photoURL,
                    emailVerified: parsed.emailVerified,
                  } as any
                  console.log('🔧 Debug: Restored dev auth state for user:', parsed.email)
                } else {
                  user.value = null
                }
              } catch {
                user.value = null
              }
            } else {
              // User is signed out
              user.value = null
            }
            // Clear subscription data on sign out
            try {
              const { useSubscriptionStore } = await import('~/stores/subscription')
              const subscriptionStore = useSubscriptionStore()
              subscriptionStore.updateUserSubscription(null)
            } catch (e) {
              // no-op
            }
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
      window.addEventListener('beforeunload', unsubscribe)
    })
  }

  return {
    // State - Only serializable data
    user: readonly(user),
    isLoading: readonly(isLoading),
    error: readonly(error),
    initialized: readonly(initialized),
    
    // Client-only state (not serialized)
    firebaseUser: readonly(firebaseUser),
    
    // Computed
    isAuthenticated,
    isTrialActive,
    isSubscriptionActive,
    trialDaysRemaining,
    canAccessFeatures,
    subscriptionStatus,
    
    // Actions
    sendMagicLink,
    sendEmailLink,
    completeEmailLink,
    isEmailLink,
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
