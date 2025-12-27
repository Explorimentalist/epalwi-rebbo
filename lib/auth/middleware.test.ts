import { describe, it, expect, beforeAll, afterAll, beforeEach, vi, type Mock } from 'vitest'
import type { H3Event } from 'h3'
import { getHeader, createError } from 'h3'
import {
  authenticateRequest,
  requireAuth,
  requireAdmin,
  requireActiveSubscription,
  optionalAuth,
  getAuthenticatedUser,
  setAuthenticatedUser,
  hasPermission,
  canAccessPremiumFeatures,
  devAuthFallback,
  authenticateWithFallback,
  type AuthenticatedUser,
  type AuthMiddlewareOptions
} from './middleware'
import { generateSessionToken } from './jwt'
import { getUserById } from '~/server/utils/database'
import type { UserProfile } from '~/types/auth'

// Mock dependencies
vi.mock('~/server/utils/database', () => ({
  getUserById: vi.fn()
}))

vi.mock('h3', () => ({
  getHeader: vi.fn(),
  createError: vi.fn((options) => new Error(`${options.statusCode}: ${options.statusMessage}`))
}))

vi.mock('#app', () => ({
  useRuntimeConfig: vi.fn(() => ({
    jwtSecret: 'test-jwt-secret-for-testing-only-32-chars',
    public: { devAuthMock: false }
  }))
}))

const mockJWTSecret = 'test-jwt-secret-for-testing-only-32-chars'
const originalEnv = process.env.JWT_SECRET

beforeAll(() => {
  process.env.JWT_SECRET = mockJWTSecret
})

afterAll(() => {
  if (originalEnv) {
    process.env.JWT_SECRET = originalEnv
  } else {
    delete process.env.JWT_SECRET
  }
})

describe('Authentication Middleware', () => {
  let mockEvent: H3Event
  let mockGetHeader: Mock
  let mockGetUserById: Mock
  let mockCreateError: Mock

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks()
    
    // Setup mock H3Event
    mockEvent = {
      context: {}
    } as H3Event
    
    // Setup mock functions
    mockGetHeader = vi.mocked(getHeader)
    mockGetUserById = vi.mocked(getUserById)
    mockCreateError = vi.mocked(createError)
  })

  const createMockUser = (overrides: Partial<UserProfile> = {}): UserProfile => ({
    uid: 'test-user-123',
    email: 'test@example.com',
    displayName: 'Test User',
    photoURL: undefined,
    role: 'user',
    emailVerified: true,
    isActive: true,
    createdAt: new Date(),
    lastLoginAt: new Date(),
    subscription: {
      status: 'trial'
    },
    trial: {
      startDate: new Date(),
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      daysRemaining: 14,
      isExpired: false
    },
    preferences: {
      defaultLanguage: 'español',
      darkMode: false,
      notifications: {
        productUpdates: true,
        languageTips: true
      }
    },
    ...overrides
  })

  describe('authenticateRequest', () => {
    it('should authenticate valid JWT token', async () => {
      const user = createMockUser()
      const token = generateSessionToken({
        uid: user.uid,
        email: user.email,
        role: user.role,
        subscriptionStatus: user.subscription.status
      })

      mockGetHeader.mockReturnValue(`Bearer ${token}`)
      mockGetUserById.mockResolvedValue(user)

      const result = await authenticateRequest(mockEvent)

      expect(result.success).toBe(true)
      expect(result.user).toBeDefined()
      expect(result.user!.uid).toBe(user.uid)
      expect(result.user!.email).toBe(user.email)
      expect(mockGetUserById).toHaveBeenCalledWith(user.uid)
    })

    it('should fail when no token provided and required=true', async () => {
      mockGetHeader.mockReturnValue(undefined)

      const result = await authenticateRequest(mockEvent, { required: true })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Authentication token required')
      expect(result.errorCode).toBe('MISSING_TOKEN')
    })

    it('should succeed when no token provided and required=false', async () => {
      mockGetHeader.mockReturnValue(undefined)

      const result = await authenticateRequest(mockEvent, { required: false })

      expect(result.success).toBe(true)
      expect(result.user).toBeUndefined()
    })

    it('should fail with invalid JWT token', async () => {
      mockGetHeader.mockReturnValue('Bearer invalid.jwt.token')

      const result = await authenticateRequest(mockEvent)

      expect(result.success).toBe(false)
      expect(result.errorCode).toBe('INVALID_TOKEN')
    })

    it('should fail when user not found in database', async () => {
      const user = createMockUser()
      const token = generateSessionToken({
        uid: user.uid,
        email: user.email,
        role: user.role,
        subscriptionStatus: user.subscription.status
      })

      mockGetHeader.mockReturnValue(`Bearer ${token}`)
      mockGetUserById.mockResolvedValue(null)

      const result = await authenticateRequest(mockEvent)

      expect(result.success).toBe(false)
      expect(result.error).toBe('User not found')
      expect(result.errorCode).toBe('USER_NOT_FOUND')
    })

    it('should fail when user is inactive', async () => {
      const user = createMockUser({ isActive: false })
      const token = generateSessionToken({
        uid: user.uid,
        email: user.email,
        role: user.role,
        subscriptionStatus: user.subscription.status
      })

      mockGetHeader.mockReturnValue(`Bearer ${token}`)
      mockGetUserById.mockResolvedValue(user)

      const result = await authenticateRequest(mockEvent)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Account is inactive')
      expect(result.errorCode).toBe('USER_NOT_FOUND')
    })

    it('should handle database errors gracefully', async () => {
      const user = createMockUser()
      const token = generateSessionToken({
        uid: user.uid,
        email: user.email,
        role: user.role,
        subscriptionStatus: user.subscription.status
      })

      mockGetHeader.mockReturnValue(`Bearer ${token}`)
      mockGetUserById.mockRejectedValue(new Error('Database connection failed'))

      const result = await authenticateRequest(mockEvent)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Database error during authentication')
      expect(result.errorCode).toBe('DATABASE_ERROR')
    })

    describe('Role-based authentication', () => {
      it('should succeed when user has required role', async () => {
        const adminUser = createMockUser({ role: 'admin' })
        const token = generateSessionToken({
          uid: adminUser.uid,
          email: adminUser.email,
          role: adminUser.role,
          subscriptionStatus: adminUser.subscription.status
        })

        mockGetHeader.mockReturnValue(`Bearer ${token}`)
        mockGetUserById.mockResolvedValue(adminUser)

        const result = await authenticateRequest(mockEvent, { requiredRoles: ['admin'] })

        expect(result.success).toBe(true)
        expect(result.user!.role).toBe('admin')
      })

      it('should fail when user lacks required role', async () => {
        const user = createMockUser({ role: 'user' })
        const token = generateSessionToken({
          uid: user.uid,
          email: user.email,
          role: user.role,
          subscriptionStatus: user.subscription.status
        })

        mockGetHeader.mockReturnValue(`Bearer ${token}`)
        mockGetUserById.mockResolvedValue(user)

        const result = await authenticateRequest(mockEvent, { requiredRoles: ['admin'] })

        expect(result.success).toBe(false)
        expect(result.error).toBe('Insufficient permissions')
        expect(result.errorCode).toBe('INVALID_TOKEN')
      })
    })

    describe('Subscription-based authentication', () => {
      it('should succeed with active subscription', async () => {
        const user = createMockUser({
          subscription: { status: 'active' }
        })
        const token = generateSessionToken({
          uid: user.uid,
          email: user.email,
          role: user.role,
          subscriptionStatus: user.subscription.status
        })

        mockGetHeader.mockReturnValue(`Bearer ${token}`)
        mockGetUserById.mockResolvedValue(user)

        const result = await authenticateRequest(mockEvent, { requireActiveSubscription: true })

        expect(result.success).toBe(true)
      })

      it('should succeed with valid trial when allowTrial=true', async () => {
        const user = createMockUser({
          subscription: { status: 'trial' },
          trial: {
            startDate: new Date(),
            endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            daysRemaining: 14,
            isExpired: false
          }
        })
        const token = generateSessionToken({
          uid: user.uid,
          email: user.email,
          role: user.role,
          subscriptionStatus: user.subscription.status
        })

        mockGetHeader.mockReturnValue(`Bearer ${token}`)
        mockGetUserById.mockResolvedValue(user)

        const result = await authenticateRequest(mockEvent, { 
          requireActiveSubscription: true,
          allowTrial: true 
        })

        expect(result.success).toBe(true)
      })

      it('should fail with expired trial when allowTrial=false', async () => {
        const user = createMockUser({
          subscription: { status: 'trial' },
          trial: {
            startDate: new Date(),
            endDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
            daysRemaining: 0,
            isExpired: true
          }
        })
        const token = generateSessionToken({
          uid: user.uid,
          email: user.email,
          role: user.role,
          subscriptionStatus: user.subscription.status
        })

        mockGetHeader.mockReturnValue(`Bearer ${token}`)
        mockGetUserById.mockResolvedValue(user)

        const result = await authenticateRequest(mockEvent, { 
          requireActiveSubscription: true,
          allowTrial: false 
        })

        expect(result.success).toBe(false)
        expect(result.error).toBe('Active subscription required')
        expect(result.errorCode).toBe('INVALID_TOKEN')
      })
    })
  })

  describe('requireAuth', () => {
    it('should return authenticated user for valid token', async () => {
      const user = createMockUser()
      const token = generateSessionToken({
        uid: user.uid,
        email: user.email,
        role: user.role,
        subscriptionStatus: user.subscription.status
      })

      mockGetHeader.mockReturnValue(`Bearer ${token}`)
      mockGetUserById.mockResolvedValue(user)

      const authenticatedUser = await requireAuth(mockEvent)

      expect(authenticatedUser.uid).toBe(user.uid)
      expect(authenticatedUser.email).toBe(user.email)
    })

    it('should throw error for missing token', async () => {
      mockGetHeader.mockReturnValue(undefined)
      mockCreateError.mockImplementation((options) => {
        throw new Error(`${options.statusCode}: ${options.statusMessage}`)
      })

      await expect(requireAuth(mockEvent)).rejects.toThrow('401: Authentication token required')
    })

    it('should throw error for invalid token', async () => {
      mockGetHeader.mockReturnValue('Bearer invalid.token')
      mockCreateError.mockImplementation((options) => {
        throw new Error(`${options.statusCode}: ${options.statusMessage}`)
      })

      await expect(requireAuth(mockEvent)).rejects.toThrow('401:')
    })
  })

  describe('requireAdmin', () => {
    it('should succeed for admin user', async () => {
      const adminUser = createMockUser({ role: 'admin' })
      const token = generateSessionToken({
        uid: adminUser.uid,
        email: adminUser.email,
        role: adminUser.role,
        subscriptionStatus: adminUser.subscription.status
      })

      mockGetHeader.mockReturnValue(`Bearer ${token}`)
      mockGetUserById.mockResolvedValue(adminUser)

      const authenticatedUser = await requireAdmin(mockEvent)

      expect(authenticatedUser.role).toBe('admin')
    })

    it('should throw error for non-admin user', async () => {
      const user = createMockUser({ role: 'user' })
      const token = generateSessionToken({
        uid: user.uid,
        email: user.email,
        role: user.role,
        subscriptionStatus: user.subscription.status
      })

      mockGetHeader.mockReturnValue(`Bearer ${token}`)
      mockGetUserById.mockResolvedValue(user)
      mockCreateError.mockImplementation((options) => {
        throw new Error(`${options.statusCode}: ${options.statusMessage}`)
      })

      await expect(requireAdmin(mockEvent)).rejects.toThrow('401:')
    })
  })

  describe('requireActiveSubscription', () => {
    it('should succeed for user with active subscription', async () => {
      const user = createMockUser({
        subscription: { status: 'active' }
      })
      const token = generateSessionToken({
        uid: user.uid,
        email: user.email,
        role: user.role,
        subscriptionStatus: user.subscription.status
      })

      mockGetHeader.mockReturnValue(`Bearer ${token}`)
      mockGetUserById.mockResolvedValue(user)

      const authenticatedUser = await requireActiveSubscription(mockEvent)

      expect(authenticatedUser.subscriptionStatus).toBe('active')
    })

    it('should succeed for user with valid trial when allowTrial=true', async () => {
      const user = createMockUser()
      const token = generateSessionToken({
        uid: user.uid,
        email: user.email,
        role: user.role,
        subscriptionStatus: user.subscription.status
      })

      mockGetHeader.mockReturnValue(`Bearer ${token}`)
      mockGetUserById.mockResolvedValue(user)

      const authenticatedUser = await requireActiveSubscription(mockEvent, true)

      expect(authenticatedUser.uid).toBe(user.uid)
    })
  })

  describe('optionalAuth', () => {
    it('should return user when valid token provided', async () => {
      const user = createMockUser()
      const token = generateSessionToken({
        uid: user.uid,
        email: user.email,
        role: user.role,
        subscriptionStatus: user.subscription.status
      })

      mockGetHeader.mockReturnValue(`Bearer ${token}`)
      mockGetUserById.mockResolvedValue(user)

      const result = await optionalAuth(mockEvent)

      expect(result).toBeDefined()
      expect(result!.uid).toBe(user.uid)
    })

    it('should return undefined when no token provided', async () => {
      mockGetHeader.mockReturnValue(undefined)

      const result = await optionalAuth(mockEvent)

      expect(result).toBeUndefined()
    })
  })

  describe('Context Management', () => {
    it('should set and get authenticated user in event context', () => {
      const authenticatedUser: AuthenticatedUser = {
        uid: 'test-123',
        email: 'test@example.com',
        role: 'user',
        subscriptionStatus: 'active',
        profile: createMockUser()
      }

      setAuthenticatedUser(mockEvent, authenticatedUser)
      const retrievedUser = getAuthenticatedUser(mockEvent)

      expect(retrievedUser).toEqual(authenticatedUser)
    })

    it('should handle missing context gracefully', () => {
      const eventWithoutContext = {} as H3Event
      
      const authenticatedUser: AuthenticatedUser = {
        uid: 'test-123',
        email: 'test@example.com',
        role: 'user',
        subscriptionStatus: 'active',
        profile: createMockUser()
      }

      setAuthenticatedUser(eventWithoutContext, authenticatedUser)
      expect(eventWithoutContext.context).toBeDefined()
    })
  })

  describe('Permission Checking', () => {
    const createAuthenticatedUser = (overrides: Partial<AuthenticatedUser> = {}): AuthenticatedUser => ({
      uid: 'perm-test',
      email: 'perm@example.com',
      role: 'user',
      subscriptionStatus: 'trial',
      profile: createMockUser(),
      ...overrides
    })

    describe('hasPermission', () => {
      it('should return true for admin permission when user is admin', () => {
        const adminUser = createAuthenticatedUser({ role: 'admin' })
        expect(hasPermission(adminUser, 'admin')).toBe(true)
      })

      it('should return false for admin permission when user is not admin', () => {
        const user = createAuthenticatedUser({ role: 'user' })
        expect(hasPermission(user, 'admin')).toBe(false)
      })

      it('should return true for active subscription when user has active subscription', () => {
        const user = createAuthenticatedUser({ subscriptionStatus: 'active' })
        expect(hasPermission(user, 'active_subscription')).toBe(true)
      })

      it('should return true for trial access when trial is valid', () => {
        const user = createAuthenticatedUser({
          profile: createMockUser({
            trial: {
              startDate: new Date(),
              endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
              daysRemaining: 14,
              isExpired: false
            }
          })
        })
        expect(hasPermission(user, 'trial_access')).toBe(true)
      })
    })

    describe('canAccessPremiumFeatures', () => {
      it('should return true for user with active subscription', () => {
        const user = createAuthenticatedUser({ subscriptionStatus: 'active' })
        expect(canAccessPremiumFeatures(user)).toBe(true)
      })

      it('should return true for user with valid trial', () => {
        const user = createAuthenticatedUser({
          profile: createMockUser({
            trial: {
              startDate: new Date(),
              endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
              daysRemaining: 14,
              isExpired: false
            }
          })
        })
        expect(canAccessPremiumFeatures(user)).toBe(true)
      })

      it('should return true for admin user', () => {
        const adminUser = createAuthenticatedUser({ role: 'admin' })
        expect(canAccessPremiumFeatures(adminUser)).toBe(true)
      })

      it('should return false for user with expired trial and no subscription', () => {
        const user = createAuthenticatedUser({
          subscriptionStatus: 'expired',
          profile: createMockUser({
            trial: {
              startDate: new Date(),
              endDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
              daysRemaining: 0,
              isExpired: true
            }
          })
        })
        expect(canAccessPremiumFeatures(user)).toBe(false)
      })
    })
  })

  describe('Development Authentication Fallback', () => {
    beforeEach(() => {
      // Reset runtime config mock
      vi.mocked(require('#app').useRuntimeConfig).mockReturnValue({
        jwtSecret: mockJWTSecret,
        public: { devAuthMock: true }
      })
    })

    it('should return mock user when dev auth is enabled and header present', async () => {
      const devUserData = {
        uid: 'dev-123',
        email: 'dev@example.com',
        displayName: 'Dev User'
      }
      const encodedHeader = Buffer.from(JSON.stringify(devUserData)).toString('base64')

      mockGetHeader.mockImplementation((event, headerName) => {
        if (headerName === 'x-dev-auth-user') return encodedHeader
        return undefined
      })

      const result = await devAuthFallback(mockEvent)

      expect(result).toBeDefined()
      expect(result!.uid).toBe('dev-123')
      expect(result!.email).toBe('dev@example.com')
    })

    it('should return null when dev auth is disabled', async () => {
      vi.mocked(require('#app').useRuntimeConfig).mockReturnValue({
        jwtSecret: mockJWTSecret,
        public: { devAuthMock: false }
      })

      const result = await devAuthFallback(mockEvent)

      expect(result).toBeNull()
    })

    it('should return null when dev header is missing', async () => {
      mockGetHeader.mockReturnValue(undefined)

      const result = await devAuthFallback(mockEvent)

      expect(result).toBeNull()
    })

    it('should handle invalid dev auth header gracefully', async () => {
      mockGetHeader.mockImplementation((event, headerName) => {
        if (headerName === 'x-dev-auth-user') return 'invalid-base64'
        return undefined
      })

      const result = await devAuthFallback(mockEvent)

      expect(result).toBeNull()
    })
  })

  describe('authenticateWithFallback', () => {
    it('should use dev fallback when available', async () => {
      vi.mocked(require('#app').useRuntimeConfig).mockReturnValue({
        jwtSecret: mockJWTSecret,
        public: { devAuthMock: true }
      })

      const devUserData = { uid: 'dev-123', email: 'dev@example.com' }
      const encodedHeader = Buffer.from(JSON.stringify(devUserData)).toString('base64')

      mockGetHeader.mockImplementation((event, headerName) => {
        if (headerName === 'x-dev-auth-user') return encodedHeader
        if (headerName === 'authorization') return 'Bearer invalid.token'
        return undefined
      })

      const result = await authenticateWithFallback(mockEvent)

      expect(result.success).toBe(true)
      expect(result.user!.uid).toBe('dev-123')
    })

    it('should fall back to JWT authentication when dev auth unavailable', async () => {
      vi.mocked(require('#app').useRuntimeConfig).mockReturnValue({
        jwtSecret: mockJWTSecret,
        public: { devAuthMock: false }
      })

      const user = createMockUser()
      const token = generateSessionToken({
        uid: user.uid,
        email: user.email,
        role: user.role,
        subscriptionStatus: user.subscription.status
      })

      mockGetHeader.mockImplementation((event, headerName) => {
        if (headerName === 'authorization') return `Bearer ${token}`
        return undefined
      })
      mockGetUserById.mockResolvedValue(user)

      const result = await authenticateWithFallback(mockEvent)

      expect(result.success).toBe(true)
      expect(result.user!.uid).toBe(user.uid)
    })
  })
})