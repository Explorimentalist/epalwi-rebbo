import { query, transaction, getConnection } from '~/lib/db/connection'
import type { 
  UserProfile, 
  SubscriptionInfo, 
  TrialInfo, 
  UserPreferences,
  SubscriptionStatus 
} from '~/types/auth'
import type { PoolClient } from 'pg'

// User management utilities
export async function createUser(userData: {
  email: string
  displayName?: string
  photoURL?: string
  role?: 'user' | 'admin'
}): Promise<string> {
  const result = await query(
    `INSERT INTO users (email, display_name, photo_url, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id`,
    [userData.email, userData.displayName, userData.photoURL, userData.role || 'user']
  )
  return result.rows[0].id
}

export async function getUserById(id: string): Promise<UserProfile | null> {
  const result = await query('SELECT * FROM user_profiles WHERE uid = $1', [id])
  if (result.rows.length === 0) return null
  return formatUserProfile(result.rows[0])
}

export async function getUserByEmail(email: string): Promise<UserProfile | null> {
  const result = await query('SELECT * FROM user_profiles WHERE email = $1', [email])
  if (result.rows.length === 0) return null
  return formatUserProfile(result.rows[0])
}

export async function updateUser(id: string, updates: {
  displayName?: string
  photoURL?: string
  lastLoginAt?: Date
  emailVerified?: boolean
  isActive?: boolean
}): Promise<void> {
  const fields = []
  const values = []
  let paramIndex = 1

  if (updates.displayName !== undefined) {
    fields.push(`display_name = $${paramIndex++}`)
    values.push(updates.displayName)
  }
  if (updates.photoURL !== undefined) {
    fields.push(`photo_url = $${paramIndex++}`)
    values.push(updates.photoURL)
  }
  if (updates.lastLoginAt !== undefined) {
    fields.push(`last_login_at = $${paramIndex++}`)
    values.push(updates.lastLoginAt)
  }
  if (updates.emailVerified !== undefined) {
    fields.push(`email_verified = $${paramIndex++}`)
    values.push(updates.emailVerified)
  }
  if (updates.isActive !== undefined) {
    fields.push(`is_active = $${paramIndex++}`)
    values.push(updates.isActive)
  }

  if (fields.length === 0) return

  values.push(id)
  await query(
    `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramIndex}`,
    values
  )
}

export async function deleteUser(id: string): Promise<void> {
  await query('UPDATE users SET is_active = false WHERE id = $1', [id])
}

// Subscription management utilities
export async function createOrUpdateSubscription(
  userId: string,
  subscriptionData: {
    stripeCustomerId?: string
    stripeSubscriptionId?: string
    status: SubscriptionStatus
    planId?: string
    currentPeriodStart?: Date
    currentPeriodEnd?: Date
    cancelAtPeriodEnd?: boolean
  }
): Promise<void> {
  await query(
    `INSERT INTO subscriptions 
     (user_id, stripe_customer_id, stripe_subscription_id, status, plan_id, 
      current_period_start, current_period_end, cancel_at_period_end)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     ON CONFLICT (user_id) 
     DO UPDATE SET 
       stripe_customer_id = EXCLUDED.stripe_customer_id,
       stripe_subscription_id = EXCLUDED.stripe_subscription_id,
       status = EXCLUDED.status,
       plan_id = EXCLUDED.plan_id,
       current_period_start = EXCLUDED.current_period_start,
       current_period_end = EXCLUDED.current_period_end,
       cancel_at_period_end = EXCLUDED.cancel_at_period_end,
       updated_at = CURRENT_TIMESTAMP`,
    [
      userId,
      subscriptionData.stripeCustomerId,
      subscriptionData.stripeSubscriptionId,
      subscriptionData.status,
      subscriptionData.planId,
      subscriptionData.currentPeriodStart,
      subscriptionData.currentPeriodEnd,
      subscriptionData.cancelAtPeriodEnd || false
    ]
  )
}

export async function getSubscriptionByStripeId(
  stripeSubscriptionId: string
): Promise<{ userId: string; subscription: SubscriptionInfo } | null> {
  const result = await query(
    `SELECT s.*, u.id as user_id FROM subscriptions s
     JOIN users u ON s.user_id = u.id
     WHERE s.stripe_subscription_id = $1`,
    [stripeSubscriptionId]
  )
  
  if (result.rows.length === 0) return null
  
  const row = result.rows[0]
  return {
    userId: row.user_id,
    subscription: {
      status: row.status,
      planId: row.plan_id,
      currentPeriodStart: row.current_period_start,
      currentPeriodEnd: row.current_period_end,
      cancelAtPeriodEnd: row.cancel_at_period_end,
      stripeCustomerId: row.stripe_customer_id,
      stripeSubscriptionId: row.stripe_subscription_id
    }
  }
}

export async function getUserByStripeCustomerId(
  stripeCustomerId: string
): Promise<UserProfile | null> {
  const result = await query(
    'SELECT * FROM user_profiles WHERE subscription->>\'stripeCustomerId\' = $1',
    [stripeCustomerId]
  )
  if (result.rows.length === 0) return null
  return formatUserProfile(result.rows[0])
}

// User preferences utilities
export async function updateUserPreferences(
  userId: string,
  preferences: Partial<UserPreferences>
): Promise<void> {
  const fields = []
  const values = []
  let paramIndex = 1

  if (preferences.defaultLanguage !== undefined) {
    fields.push(`default_language = $${paramIndex++}`)
    values.push(preferences.defaultLanguage)
  }
  if (preferences.darkMode !== undefined) {
    fields.push(`dark_mode = $${paramIndex++}`)
    values.push(preferences.darkMode)
  }
  if (preferences.notifications?.productUpdates !== undefined) {
    fields.push(`product_updates_notifications = $${paramIndex++}`)
    values.push(preferences.notifications.productUpdates)
  }
  if (preferences.notifications?.languageTips !== undefined) {
    fields.push(`language_tips_notifications = $${paramIndex++}`)
    values.push(preferences.notifications.languageTips)
  }

  if (fields.length === 0) return

  values.push(userId)
  await query(
    `UPDATE user_preferences SET ${fields.join(', ')} WHERE user_id = $${paramIndex}`,
    values
  )
}

// Search history utilities
export async function addSearchHistory(
  userId: string,
  searchTerm: string,
  searchLanguage: 'español' | 'ndowe',
  resultCount: number
): Promise<void> {
  await query(
    `INSERT INTO search_history (user_id, search_term, search_language, result_count)
     VALUES ($1, $2, $3, $4)`,
    [userId, searchTerm, searchLanguage, resultCount]
  )
}

export async function getUserSearchHistory(
  userId: string,
  limit = 50
): Promise<Array<{
  searchTerm: string
  searchLanguage: 'español' | 'ndowe'
  resultCount: number
  searchTimestamp: Date
}>> {
  const result = await query(
    `SELECT search_term, search_language, result_count, search_timestamp
     FROM search_history
     WHERE user_id = $1
     ORDER BY search_timestamp DESC
     LIMIT $2`,
    [userId, limit]
  )
  
  return result.rows.map(row => ({
    searchTerm: row.search_term,
    searchLanguage: row.search_language,
    resultCount: row.result_count,
    searchTimestamp: row.search_timestamp
  }))
}

// Magic link token utilities
export async function createMagicLinkToken(
  email: string,
  tokenHash: string,
  expiresAt: Date
): Promise<void> {
  await query(
    `INSERT INTO magic_link_tokens (email, token_hash, expires_at)
     VALUES ($1, $2, $3)`,
    [email, tokenHash, expiresAt]
  )
}

export async function validateMagicLinkToken(
  tokenHash: string
): Promise<{ email: string; isValid: boolean }> {
  const result = await query(
    `SELECT email, expires_at, used_at, attempts
     FROM magic_link_tokens
     WHERE token_hash = $1`,
    [tokenHash]
  )
  
  if (result.rows.length === 0) {
    return { email: '', isValid: false }
  }
  
  const token = result.rows[0]
  const now = new Date()
  const isValid = !token.used_at && new Date(token.expires_at) > now
  
  // Mark as used if valid
  if (isValid) {
    await query(
      `UPDATE magic_link_tokens 
       SET used_at = CURRENT_TIMESTAMP, attempts = attempts + 1
       WHERE token_hash = $1`,
      [tokenHash]
    )
  } else {
    // Increment attempts even if invalid
    await query(
      `UPDATE magic_link_tokens 
       SET attempts = attempts + 1
       WHERE token_hash = $1`,
      [tokenHash]
    )
  }
  
  return { email: token.email, isValid }
}

export async function cleanupExpiredMagicLinkTokens(): Promise<number> {
  const result = await query(
    `DELETE FROM magic_link_tokens 
     WHERE expires_at < CURRENT_TIMESTAMP OR used_at IS NOT NULL`
  )
  return result.rowCount || 0
}

// Analytics and reporting utilities
export async function getUserStats(): Promise<{
  totalUsers: number
  activeUsers: number
  trialUsers: number
  subscribedUsers: number
  expiredUsers: number
}> {
  const result = await query(`
    SELECT 
      COUNT(*) as total_users,
      COUNT(*) FILTER (WHERE is_active = true) as active_users,
      COUNT(*) FILTER (WHERE trial->>'isExpired' = 'false') as trial_users,
      COUNT(*) FILTER (WHERE subscription->>'status' = 'active') as subscribed_users,
      COUNT(*) FILTER (WHERE trial->>'isExpired' = 'true' AND subscription->>'status' != 'active') as expired_users
    FROM user_profiles
  `)
  
  return result.rows[0]
}

export async function getActiveUsersWithAccess(): Promise<UserProfile[]> {
  const result = await query(`
    SELECT * FROM active_users_with_access
    WHERE has_access = true
  `)
  
  return result.rows.map(formatUserProfile)
}

// Helper function to format database row to UserProfile
function formatUserProfile(row: any): UserProfile {
  return {
    uid: row.uid,
    email: row.email,
    displayName: row.display_name,
    photoURL: row.photo_url,
    role: row.role,
    emailVerified: row.email_verified,
    isActive: row.is_active,
    createdAt: new Date(row.created_at),
    lastLoginAt: new Date(row.last_login_at),
    subscription: row.subscription,
    trial: row.trial,
    preferences: row.preferences,
    preferencesUpdatedAt: row.preferences_updated_at ? new Date(row.preferences_updated_at) : undefined
  }
}

// Batch operations for data migration
export async function batchCreateUsers(
  users: Array<{
    email: string
    displayName?: string
    photoURL?: string
    role?: 'user' | 'admin'
  }>
): Promise<string[]> {
  return await transaction(async (client: PoolClient) => {
    const userIds: string[] = []
    
    for (const userData of users) {
      const result = await client.query(
        `INSERT INTO users (email, display_name, photo_url, role)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [userData.email, userData.displayName, userData.photoURL, userData.role || 'user']
      )
      userIds.push(result.rows[0].id)
    }
    
    return userIds
  })
}

// Health check for database operations
export async function healthCheckDatabase(): Promise<{
  canCreateUser: boolean
  canQueryUser: boolean
  canUpdateUser: boolean
  performance: {
    createUserMs: number
    queryUserMs: number
  }
}> {
  try {
    const testEmail = `healthcheck-${Date.now()}@test.com`
    
    // Test create user
    const createStart = Date.now()
    const userId = await createUser({
      email: testEmail,
      displayName: 'Health Check User',
      role: 'user'
    })
    const createTime = Date.now() - createStart
    
    // Test query user
    const queryStart = Date.now()
    const user = await getUserById(userId)
    const queryTime = Date.now() - queryStart
    
    // Test update user
    await updateUser(userId, { displayName: 'Updated Health Check User' })
    
    // Cleanup test user
    await deleteUser(userId)
    
    return {
      canCreateUser: true,
      canQueryUser: !!user,
      canUpdateUser: true,
      performance: {
        createUserMs: createTime,
        queryUserMs: queryTime
      }
    }
  } catch (error) {
    console.error('Database health check failed:', error)
    return {
      canCreateUser: false,
      canQueryUser: false,
      canUpdateUser: false,
      performance: {
        createUserMs: 0,
        queryUserMs: 0
      }
    }
  }
}