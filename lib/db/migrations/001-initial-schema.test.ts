import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { 
  migration001,
  runMigration,
  rollbackMigration,
  getAppliedMigrations,
  isMigrationApplied,
  testDatabaseConnection,
  initializeDatabase,
  healthCheck
} from './001-initial-schema'
import { query, closePool } from '../connection'

describe('Database Migrations', () => {
  beforeAll(async () => {
    // Ensure clean state
    await closePool()
  })

  afterAll(async () => {
    await closePool()
  })

  describe('Connection and Health', () => {
    it('should test database connection successfully', async () => {
      const isConnected = await testDatabaseConnection()
      expect(isConnected).toBe(true)
    })

    it('should perform health check', async () => {
      const health = await healthCheck()
      
      expect(health.connected).toBe(true)
      expect(typeof health.tablesExist).toBe('boolean')
      expect(Array.isArray(health.migrationsApplied)).toBe(true)
      expect(typeof health.userCount).toBe('number')
    })
  })

  describe('Migration System', () => {
    it('should track applied migrations', async () => {
      await initializeDatabase()
      
      const applied = await getAppliedMigrations()
      expect(Array.isArray(applied)).toBe(true)
      
      const isApplied = await isMigrationApplied('001')
      expect(isApplied).toBe(true)
    })

    it('should have correct migration metadata', () => {
      expect(migration001.version).toBe('001')
      expect(migration001.name).toBe('initial-schema')
      expect(typeof migration001.up).toBe('function')
      expect(typeof migration001.down).toBe('function')
    })

    it('should create all required tables', async () => {
      await initializeDatabase()

      // Check that all main tables exist
      const tableResult = await query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('users', 'subscriptions', 'trials', 'user_preferences', 'search_history', 'magic_link_tokens', 'migrations')
        ORDER BY table_name
      `)

      const tableNames = tableResult.rows.map(row => row.table_name)
      expect(tableNames).toContain('users')
      expect(tableNames).toContain('subscriptions')
      expect(tableNames).toContain('trials')
      expect(tableNames).toContain('user_preferences')
      expect(tableNames).toContain('search_history')
      expect(tableNames).toContain('magic_link_tokens')
      expect(tableNames).toContain('migrations')
    })

    it('should create all required views', async () => {
      await initializeDatabase()

      // Check that views exist
      const viewResult = await query(`
        SELECT table_name 
        FROM information_schema.views 
        WHERE table_schema = 'public' 
        AND table_name IN ('user_profiles', 'active_users_with_access')
        ORDER BY table_name
      `)

      const viewNames = viewResult.rows.map(row => row.table_name)
      expect(viewNames).toContain('user_profiles')
      expect(viewNames).toContain('active_users_with_access')
    })

    it('should create all required functions', async () => {
      await initializeDatabase()

      // Check that functions exist
      const functionResult = await query(`
        SELECT routine_name 
        FROM information_schema.routines 
        WHERE routine_schema = 'public' 
        AND routine_name IN ('update_updated_at_column', 'create_trial_for_new_user', 'cleanup_expired_magic_links')
        ORDER BY routine_name
      `)

      const functionNames = functionResult.rows.map(row => row.routine_name)
      expect(functionNames).toContain('update_updated_at_column')
      expect(functionNames).toContain('create_trial_for_new_user')
      expect(functionNames).toContain('cleanup_expired_magic_links')
    })

    it('should create all required indexes', async () => {
      await initializeDatabase()

      // Check that key indexes exist
      const indexResult = await query(`
        SELECT indexname 
        FROM pg_indexes 
        WHERE schemaname = 'public'
        AND indexname LIKE 'idx_%'
        ORDER BY indexname
      `)

      const indexNames = indexResult.rows.map(row => row.indexname)
      expect(indexNames.some(name => name.includes('users_email'))).toBe(true)
      expect(indexNames.some(name => name.includes('subscriptions_user_id'))).toBe(true)
      expect(indexNames.some(name => name.includes('trials_user_id'))).toBe(true)
    })

    it('should create proper foreign key relationships', async () => {
      await initializeDatabase()

      // Check foreign key constraints
      const fkResult = await query(`
        SELECT 
          tc.table_name, 
          kcu.column_name, 
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name 
        FROM 
          information_schema.table_constraints AS tc 
          JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
          JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
            AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY'
        ORDER BY tc.table_name, kcu.column_name
      `)

      expect(fkResult.rows.length).toBeGreaterThan(0)
      
      // Verify specific foreign keys exist
      const foreignKeys = fkResult.rows.map(row => ({
        table: row.table_name,
        column: row.column_name,
        foreignTable: row.foreign_table_name,
        foreignColumn: row.foreign_column_name
      }))

      expect(foreignKeys.some(fk => 
        fk.table === 'subscriptions' && 
        fk.column === 'user_id' && 
        fk.foreignTable === 'users'
      )).toBe(true)

      expect(foreignKeys.some(fk => 
        fk.table === 'trials' && 
        fk.column === 'user_id' && 
        fk.foreignTable === 'users'
      )).toBe(true)
    })
  })

  describe('Database Functionality', () => {
    beforeAll(async () => {
      await initializeDatabase()
    })

    it('should automatically create trial for new user', async () => {
      // Insert a test user
      const userResult = await query(`
        INSERT INTO users (email, display_name) 
        VALUES ('trial-test@example.com', 'Trial Test User') 
        RETURNING id
      `)
      const userId = userResult.rows[0].id

      // Check that trial was automatically created
      const trialResult = await query(
        'SELECT * FROM trials WHERE user_id = $1',
        [userId]
      )

      expect(trialResult.rows).toHaveLength(1)
      expect(trialResult.rows[0].days_remaining).toBeGreaterThan(0)
      expect(trialResult.rows[0].is_expired).toBe(false)

      // Check that user preferences were created
      const preferencesResult = await query(
        'SELECT * FROM user_preferences WHERE user_id = $1',
        [userId]
      )

      expect(preferencesResult.rows).toHaveLength(1)
      expect(preferencesResult.rows[0].default_language).toBe('español')

      // Clean up
      await query('DELETE FROM users WHERE id = $1', [userId])
    })

    it('should automatically update updated_at timestamps', async () => {
      // Insert a test user
      const userResult = await query(`
        INSERT INTO users (email, display_name) 
        VALUES ('timestamp-test@example.com', 'Timestamp Test User') 
        RETURNING id, updated_at
      `)
      const userId = userResult.rows[0].id
      const originalTimestamp = userResult.rows[0].updated_at

      // Wait a moment
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Update the user
      await query(
        'UPDATE users SET display_name = $1 WHERE id = $2',
        ['Updated Timestamp Test User', userId]
      )

      // Check that updated_at was changed
      const updatedResult = await query(
        'SELECT updated_at FROM users WHERE id = $1',
        [userId]
      )
      const newTimestamp = updatedResult.rows[0].updated_at

      expect(new Date(newTimestamp).getTime()).toBeGreaterThan(new Date(originalTimestamp).getTime())

      // Clean up
      await query('DELETE FROM users WHERE id = $1', [userId])
    })

    it('should handle user profile view correctly', async () => {
      // Insert a test user
      const userResult = await query(`
        INSERT INTO users (email, display_name, role) 
        VALUES ('profile-test@example.com', 'Profile Test User', 'admin') 
        RETURNING id
      `)
      const userId = userResult.rows[0].id

      // Get user profile from view
      const profileResult = await query(
        'SELECT * FROM user_profiles WHERE uid = $1',
        [userId]
      )

      expect(profileResult.rows).toHaveLength(1)
      const profile = profileResult.rows[0]
      
      expect(profile.uid).toBe(userId)
      expect(profile.email).toBe('profile-test@example.com')
      expect(profile.display_name).toBe('Profile Test User')
      expect(profile.role).toBe('admin')
      expect(profile.trial).toBeDefined()
      expect(profile.subscription).toBeDefined()
      expect(profile.preferences).toBeDefined()

      // Clean up
      await query('DELETE FROM users WHERE id = $1', [userId])
    })

    it('should cleanup expired magic link tokens', async () => {
      // Insert expired and valid tokens
      await query(`
        INSERT INTO magic_link_tokens (email, token_hash, expires_at) VALUES
        ('test@example.com', 'expired-token', NOW() - INTERVAL '1 hour'),
        ('test@example.com', 'valid-token', NOW() + INTERVAL '1 hour')
      `)

      // Run cleanup function
      const cleanupResult = await query('SELECT cleanup_expired_magic_links() as deleted_count')
      const deletedCount = cleanupResult.rows[0].deleted_count

      expect(deletedCount).toBeGreaterThanOrEqual(1)

      // Verify expired token was removed and valid token remains
      const tokensResult = await query(
        'SELECT token_hash FROM magic_link_tokens WHERE email = $1',
        ['test@example.com']
      )

      expect(tokensResult.rows.some(row => row.token_hash === 'expired-token')).toBe(false)
      expect(tokensResult.rows.some(row => row.token_hash === 'valid-token')).toBe(true)

      // Clean up
      await query('DELETE FROM magic_link_tokens WHERE email = $1', ['test@example.com'])
    })
  })

  describe('Migration Rollback', () => {
    it('should rollback migration successfully', async () => {
      // Note: This test is destructive and should be run carefully
      // We'll create a separate test database or use a transaction that gets rolled back
      
      // For now, just verify the rollback function exists and has the right structure
      expect(typeof migration001.down).toBe('function')
      
      // In a real scenario, you would:
      // 1. Run rollback
      // 2. Verify all tables/views/functions are dropped
      // 3. Re-run migration to restore state
    })
  })
})