import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest'
import { 
  createUser,
  getUserById,
  getUserByEmail,
  updateUser,
  deleteUser,
  createOrUpdateSubscription,
  updateUserPreferences,
  addSearchHistory,
  getUserSearchHistory,
  createMagicLinkToken,
  validateMagicLinkToken,
  cleanupExpiredMagicLinkTokens,
  getUserStats,
  healthCheckDatabase
} from './database'
import { initializeDatabase } from '~/lib/db/migrations/001-initial-schema'
import { query, closePool } from '~/lib/db/connection'
import type { SubscriptionStatus } from '~/types/auth'

describe('Database Utilities', () => {
  let testUserId: string
  let testUserEmail: string

  beforeAll(async () => {
    // Initialize database schema for testing
    await initializeDatabase()
  })

  afterAll(async () => {
    // Clean up database connections
    await closePool()
  })

  beforeEach(async () => {
    // Create a test user for each test
    testUserEmail = `test-${Date.now()}@example.com`
    testUserId = await createUser({
      email: testUserEmail,
      displayName: 'Test User',
      role: 'user'
    })
  })

  afterEach(async () => {
    // Clean up test data after each test
    if (testUserId) {
      await query('DELETE FROM users WHERE id = $1', [testUserId])
    }
  })

  describe('User Management', () => {
    it('should create a user successfully', async () => {
      const email = `create-test-${Date.now()}@example.com`
      const userId = await createUser({
        email,
        displayName: 'Create Test User',
        photoURL: 'https://example.com/photo.jpg',
        role: 'admin'
      })

      expect(userId).toBeDefined()
      expect(typeof userId).toBe('string')

      // Verify user was created
      const user = await getUserById(userId)
      expect(user).toBeDefined()
      expect(user!.email).toBe(email)
      expect(user!.displayName).toBe('Create Test User')
      expect(user!.photoURL).toBe('https://example.com/photo.jpg')
      expect(user!.role).toBe('admin')

      // Clean up
      await query('DELETE FROM users WHERE id = $1', [userId])
    })

    it('should get user by ID', async () => {
      const user = await getUserById(testUserId)
      
      expect(user).toBeDefined()
      expect(user!.uid).toBe(testUserId)
      expect(user!.email).toBe(testUserEmail)
      expect(user!.displayName).toBe('Test User')
      expect(user!.role).toBe('user')
      expect(user!.isActive).toBe(true)
      expect(user!.trial).toBeDefined()
      expect(user!.trial.daysRemaining).toBeGreaterThan(0)
    })

    it('should get user by email', async () => {
      const user = await getUserByEmail(testUserEmail)
      
      expect(user).toBeDefined()
      expect(user!.uid).toBe(testUserId)
      expect(user!.email).toBe(testUserEmail)
    })

    it('should return null for non-existent user', async () => {
      const user = await getUserById('00000000-0000-0000-0000-000000000000')
      expect(user).toBeNull()
    })

    it('should update user information', async () => {
      await updateUser(testUserId, {
        displayName: 'Updated Test User',
        photoURL: 'https://example.com/updated-photo.jpg',
        emailVerified: true
      })

      const user = await getUserById(testUserId)
      expect(user!.displayName).toBe('Updated Test User')
      expect(user!.photoURL).toBe('https://example.com/updated-photo.jpg')
      expect(user!.emailVerified).toBe(true)
    })

    it('should soft delete user', async () => {
      await deleteUser(testUserId)
      
      const user = await getUserById(testUserId)
      expect(user!.isActive).toBe(false)
    })
  })

  describe('Subscription Management', () => {
    it('should create subscription', async () => {
      const subscriptionData = {
        stripeCustomerId: 'cus_test123',
        stripeSubscriptionId: 'sub_test123',
        status: 'active' as SubscriptionStatus,
        planId: 'plan_monthly',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        cancelAtPeriodEnd: false
      }

      await createOrUpdateSubscription(testUserId, subscriptionData)

      const user = await getUserById(testUserId)
      expect(user!.subscription.status).toBe('active')
      expect(user!.subscription.stripeCustomerId).toBe('cus_test123')
      expect(user!.subscription.stripeSubscriptionId).toBe('sub_test123')
      expect(user!.subscription.planId).toBe('plan_monthly')
    })

    it('should update existing subscription', async () => {
      // Create initial subscription
      await createOrUpdateSubscription(testUserId, {
        status: 'trial' as SubscriptionStatus,
        planId: 'trial'
      })

      // Update subscription
      await createOrUpdateSubscription(testUserId, {
        stripeCustomerId: 'cus_updated123',
        status: 'active' as SubscriptionStatus,
        planId: 'plan_yearly'
      })

      const user = await getUserById(testUserId)
      expect(user!.subscription.status).toBe('active')
      expect(user!.subscription.stripeCustomerId).toBe('cus_updated123')
      expect(user!.subscription.planId).toBe('plan_yearly')
    })
  })

  describe('User Preferences', () => {
    it('should update user preferences', async () => {
      await updateUserPreferences(testUserId, {
        defaultLanguage: 'ndowe',
        darkMode: true,
        notifications: {
          productUpdates: false,
          languageTips: true
        }
      })

      const user = await getUserById(testUserId)
      expect(user!.preferences!.defaultLanguage).toBe('ndowe')
      expect(user!.preferences!.darkMode).toBe(true)
      expect(user!.preferences!.notifications!.productUpdates).toBe(false)
      expect(user!.preferences!.notifications!.languageTips).toBe(true)
    })
  })

  describe('Search History', () => {
    it('should add search history', async () => {
      await addSearchHistory(testUserId, 'hello', 'español', 5)
      await addSearchHistory(testUserId, 'hola', 'ndowe', 3)

      const history = await getUserSearchHistory(testUserId)
      
      expect(history).toHaveLength(2)
      expect(history[0].searchTerm).toBe('hola') // Most recent first
      expect(history[0].searchLanguage).toBe('ndowe')
      expect(history[0].resultCount).toBe(3)
      expect(history[1].searchTerm).toBe('hello')
    })

    it('should limit search history results', async () => {
      // Add multiple search entries
      for (let i = 0; i < 5; i++) {
        await addSearchHistory(testUserId, `term${i}`, 'español', i)
      }

      const history = await getUserSearchHistory(testUserId, 3)
      expect(history).toHaveLength(3)
    })
  })

  describe('Magic Link Tokens', () => {
    it('should create and validate magic link token', async () => {
      const tokenHash = 'test-token-hash-' + Date.now()
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

      await createMagicLinkToken(testUserEmail, tokenHash, expiresAt)

      const validation = await validateMagicLinkToken(tokenHash)
      expect(validation.isValid).toBe(true)
      expect(validation.email).toBe(testUserEmail)
    })

    it('should invalidate expired magic link token', async () => {
      const tokenHash = 'expired-token-hash-' + Date.now()
      const expiresAt = new Date(Date.now() - 1000) // 1 second ago

      await createMagicLinkToken(testUserEmail, tokenHash, expiresAt)

      const validation = await validateMagicLinkToken(tokenHash)
      expect(validation.isValid).toBe(false)
      expect(validation.email).toBe(testUserEmail)
    })

    it('should invalidate used magic link token', async () => {
      const tokenHash = 'used-token-hash-' + Date.now()
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000)

      await createMagicLinkToken(testUserEmail, tokenHash, expiresAt)

      // First use should be valid
      const firstValidation = await validateMagicLinkToken(tokenHash)
      expect(firstValidation.isValid).toBe(true)

      // Second use should be invalid (token already used)
      const secondValidation = await validateMagicLinkToken(tokenHash)
      expect(secondValidation.isValid).toBe(false)
    })

    it('should clean up expired magic link tokens', async () => {
      const expiredTokenHash = 'cleanup-expired-' + Date.now()
      const validTokenHash = 'cleanup-valid-' + Date.now()
      const usedTokenHash = 'cleanup-used-' + Date.now()

      // Create expired token
      await createMagicLinkToken(
        testUserEmail, 
        expiredTokenHash, 
        new Date(Date.now() - 1000)
      )

      // Create valid token
      await createMagicLinkToken(
        testUserEmail, 
        validTokenHash, 
        new Date(Date.now() + 15 * 60 * 1000)
      )

      // Create and use a token
      await createMagicLinkToken(
        testUserEmail, 
        usedTokenHash, 
        new Date(Date.now() + 15 * 60 * 1000)
      )
      await validateMagicLinkToken(usedTokenHash) // Mark as used

      const deletedCount = await cleanupExpiredMagicLinkTokens()
      expect(deletedCount).toBeGreaterThanOrEqual(2) // Should delete expired and used tokens

      // Valid token should still exist
      const validValidation = await validateMagicLinkToken(validTokenHash)
      expect(validValidation.isValid).toBe(true)
    })
  })

  describe('Analytics and Stats', () => {
    it('should get user statistics', async () => {
      const stats = await getUserStats()
      
      expect(stats.totalUsers).toBeGreaterThanOrEqual(1)
      expect(stats.activeUsers).toBeGreaterThanOrEqual(1)
      expect(stats.trialUsers).toBeGreaterThanOrEqual(1)
      expect(typeof stats.subscribedUsers).toBe('number')
      expect(typeof stats.expiredUsers).toBe('number')
    })

    it('should perform health check', async () => {
      const health = await healthCheckDatabase()
      
      expect(health.canCreateUser).toBe(true)
      expect(health.canQueryUser).toBe(true)
      expect(health.canUpdateUser).toBe(true)
      expect(health.performance.createUserMs).toBeGreaterThan(0)
      expect(health.performance.queryUserMs).toBeGreaterThan(0)
    })
  })

  describe('Error Handling', () => {
    it('should handle invalid user ID gracefully', async () => {
      const user = await getUserById('invalid-uuid')
      expect(user).toBeNull()
    })

    it('should handle invalid email gracefully', async () => {
      const user = await getUserByEmail('nonexistent@example.com')
      expect(user).toBeNull()
    })

    it('should handle duplicate email creation', async () => {
      try {
        await createUser({
          email: testUserEmail, // Same email as existing user
          displayName: 'Duplicate User'
        })
        expect(false).toBe(true) // Should not reach here
      } catch (error) {
        expect(error).toBeDefined()
        expect(error.code).toBe('23505') // PostgreSQL unique violation
      }
    })
  })

  describe('Database Performance', () => {
    it('should handle concurrent operations', async () => {
      const promises = []
      
      // Create 10 concurrent user operations
      for (let i = 0; i < 10; i++) {
        const email = `concurrent-${i}-${Date.now()}@example.com`
        promises.push(createUser({ email, displayName: `User ${i}` }))
      }

      const userIds = await Promise.all(promises)
      
      expect(userIds).toHaveLength(10)
      userIds.forEach(id => expect(typeof id).toBe('string'))

      // Clean up concurrent test users
      await Promise.all(userIds.map(id => 
        query('DELETE FROM users WHERE id = $1', [id])
      ))
    })

    it('should handle large data operations efficiently', async () => {
      const startTime = Date.now()
      
      // Add 100 search history entries
      const promises = []
      for (let i = 0; i < 100; i++) {
        promises.push(addSearchHistory(testUserId, `search-term-${i}`, 'español', i))
      }
      
      await Promise.all(promises)
      
      const endTime = Date.now()
      const duration = endTime - startTime
      
      // Should complete within reasonable time (adjust threshold as needed)
      expect(duration).toBeLessThan(5000) // 5 seconds
      
      // Verify data was inserted
      const history = await getUserSearchHistory(testUserId, 100)
      expect(history).toHaveLength(100)
    })
  })
})