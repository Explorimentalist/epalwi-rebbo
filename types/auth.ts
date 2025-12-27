/**
 * Authentication Types
 * TypeScript definitions for the authentication system
 */

/**
 * Subscription status types
 */
export type SubscriptionStatus = 'trial' | 'active' | 'expired' | 'cancelled'

/**
 * User role types
 */
export type UserRole = 'user' | 'admin'

/**
 * Trial information
 */
export interface TrialInfo {
  startDate: Date
  endDate: Date
  daysRemaining: number
  isExpired: boolean
}

/**
 * Subscription information
 */
export interface SubscriptionInfo {
  status: SubscriptionStatus
  planId?: string
  currentPeriodStart?: Date
  currentPeriodEnd?: Date
  cancelAtPeriodEnd?: boolean
  stripeCustomerId?: string
  stripeSubscriptionId?: string
}

/**
 * User preferences
 */
export interface UserPreferences {
  defaultLanguage: 'español' | 'ndowe'
  // Theme intentionally out of scope; keep optional for backward compatibility
  darkMode?: boolean
  notifications?: {
    productUpdates?: boolean
    languageTips?: boolean
  }
}

/**
 * Extended user profile
 */
export interface UserProfile {
  uid: string
  email: string
  displayName?: string | undefined
  photoURL?: string | undefined
  role: UserRole
  createdAt: Date
  lastLoginAt: Date
  subscription: SubscriptionInfo
  trial: TrialInfo
  preferences?: UserPreferences
  preferencesUpdatedAt?: Date
  emailVerified: boolean
  isActive: boolean
}

/**
 * Authentication state
 */
export interface AuthState {
  user: UserProfile | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  initialized: boolean
}

/**
 * Magic link request payload
 */
export interface MagicLinkRequest {
  email: string
  redirectUrl?: string
}

/**
 * Magic link response
 */
export interface MagicLinkResponse {
  success: boolean
  message: string
  error?: string
  attemptCount?: number
  maxAttempts?: number
}

/**
 * Token verification payload
 */
export interface TokenVerificationPayload {
  token: string
  email: string
}

/**
 * Token verification response
 */
export interface TokenVerificationResponse {
  success: boolean
  user?: UserProfile
  error?: string
  message: string
  sessionToken?: string
  expiresAt?: Date
}

/**
 * Auth error types
 */
export type AuthErrorCode = 
  | 'invalid-email'
  | 'user-not-found'
  | 'too-many-requests'
  | 'invalid-token'
  | 'expired-token'
  | 'network-error'
  | 'unknown-error'

/**
 * Auth error interface
 */
export interface AuthError {
  code: AuthErrorCode
  message: string
  details?: string
}

/**
 * Authentication actions
 */
export interface AuthActions {
  signInWithMagicLink: (email: string) => Promise<MagicLinkResponse>
  verifyMagicLink: (token: string) => Promise<TokenVerificationResponse>
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
  updateProfile: (data: Partial<UserProfile>) => Promise<void>
  deleteAccount: () => Promise<void>
}

/**
 * Authentication composable return type
 */
export interface UseAuthReturn extends AuthState, AuthActions {
  // Additional computed properties
  isTrialActive: ComputedRef<boolean>
  isSubscriptionActive: ComputedRef<boolean>
  trialDaysRemaining: ComputedRef<number>
  canAccessFeatures: ComputedRef<boolean>
}

/**
 * JWT payload structure
 */
export interface JWTPayload {
  email: string
  iat: number
  exp: number
  iss: string
  aud: string
}

/**
 * Email template variables
 */
export interface EmailTemplateVariables {
  magic_link: string
  user_email: string
  app_name: string
  expires_in: string
}

/**
 * MailerSend email parameters
 */
export interface MailerSendParams {
  from: {
    email: string
    name?: string
  }
  to: Array<{
    email: string
    name?: string
  }>
  subject: string
  template_id?: string
  variables?: Array<{
    email: string
    substitutions: Array<{
      var: string
      value: string
    }>
  }>
}


/**
 * Utility type for creating new users
 */
export type CreateUserData = Omit<UserProfile, 'uid' | 'createdAt' | 'lastLoginAt' | 'trial' | 'subscription'> & {
  subscription?: Partial<SubscriptionInfo>
  trial?: Partial<TrialInfo>
}

/**
 * Utility type for updating users
 */
export type UpdateUserData = Partial<Omit<UserProfile, 'uid' | 'createdAt'>> 
