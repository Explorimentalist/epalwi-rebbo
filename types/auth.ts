/**
 * Authentication-related types and interfaces
 */

/**
 * Subscription information
 */
export interface Subscription {
  status: 'trial' | 'active' | 'expired' | 'cancelled'
  startDate?: Date
  endDate?: Date
}

/**
 * Trial information
 */
export interface Trial {
  isExpired: boolean
  daysRemaining: number
  startDate?: Date
  endDate?: Date
}

/**
 * User preferences
 */
export interface UserPreferences {
  defaultLanguage?: string
  darkMode?: boolean
  notifications?: Record<string, boolean>
}

/**
 * User authentication state
 */
export interface User {
  uid: string
  email: string
  name?: string
  displayName?: string
  photoURL?: string
  role: 'user' | 'admin'
  subscriptionStatus: 'trial' | 'active' | 'expired' | 'cancelled'
  subscription?: Subscription
  trial?: Trial
  isActive: boolean
  emailVerified?: boolean
  preferences?: UserPreferences
  createdAt: Date
  updatedAt: Date
  lastLogin?: Date
  lastLoginAt?: Date
}

/**
 * Session data stored in browser
 */
export interface SessionData {
  user: User
  token: string
  expiresAt: number
  refreshToken?: string
}

/**
 * JWT payload for magic link tokens
 */
export interface JWTPayload {
  email: string
  iss: string
  aud: string
  iat?: number
  exp?: number
}

/**
 * Authentication request
 */
export interface AuthRequest {
  email: string
  password?: string
  token?: string
}

/**
 * Authentication response
 */
export interface AuthResponse {
  success: boolean
  user?: User
  token?: string
  message: string
  error?: string
}

/**
 * Magic link request payload
 */
export interface MagicLinkRequest {
  email: string
  redirectUrl?: string
}

/**
 * Magic link response with rate limit information
 */
export interface MagicLinkResponse {
  success: boolean
  message: string
  error?: string
  attemptCount?: number
  maxAttempts?: number
  rateLimitInfo?: {
    currentCount: number
    maxAttempts: number
    resetTime: number
    isLimited?: boolean
  }
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
  user?: User
  token?: string
  sessionToken?: string
  expiresAt?: number
  error?: string
  message?: string
}

/**
 * Subscription status
 */
export type SubscriptionStatus = 'trial' | 'active' | 'expired' | 'cancelled'

/**
 * User role
 */
export type UserRole = 'user' | 'admin'

/**
 * User profile - extended user information from database
 */
export interface UserProfile extends User {
  preferencesUpdatedAt?: Date
}

/**
 * Subscription information structure
 */
export interface SubscriptionInfo {
  status: SubscriptionStatus
  planId?: string
  planType?: 'monthly' | 'annual'
  currentPeriodStart?: Date
  currentPeriodEnd?: Date
  cancelAtPeriodEnd?: boolean
  stripeCustomerId?: string
  stripeSubscriptionId?: string
}

/**
 * Trial information structure
 */
export interface TrialInfo {
  isExpired: boolean
  daysRemaining: number
  startDate?: Date
  endDate?: Date
}

/**
 * Authentication error information
 */
export interface AuthError {
  code: string
  message: string
  statusCode?: number
}

/**
 * Authentication state for stores
 */
export interface AuthState {
  user: UserProfile | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: AuthError | null
}
