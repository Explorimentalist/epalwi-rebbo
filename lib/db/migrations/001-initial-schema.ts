import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { query, transaction } from '../connection.js'

export interface Migration {
  version: string
  name: string
  up: () => Promise<void>
  down: () => Promise<void>
}

// Get current directory for loading SQL files
const __dirname = dirname(fileURLToPath(import.meta.url))

export const migration001: Migration = {
  version: '001',
  name: 'initial-schema',
  
  async up() {
    console.log('Running migration 001: Creating initial database schema...')
    
    await transaction(async (client) => {
      // Load and execute the main schema file
      const schemaPath = join(__dirname, '..', 'schema.sql')
      const schemaSQL = readFileSync(schemaPath, 'utf-8')
      
      // Split the schema into individual statements and execute them
      const statements = schemaSQL
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
      
      for (const statement of statements) {
        if (statement.trim()) {
          await client.query(statement + ';')
        }
      }
      
      // Create migrations table to track applied migrations
      await client.query(`
        CREATE TABLE IF NOT EXISTS migrations (
          id SERIAL PRIMARY KEY,
          version VARCHAR(50) UNIQUE NOT NULL,
          name VARCHAR(255) NOT NULL,
          applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `)
      
      // Record this migration as applied
      await client.query(
        'INSERT INTO migrations (version, name) VALUES ($1, $2) ON CONFLICT (version) DO NOTHING',
        ['001', 'initial-schema']
      )
    })
    
    console.log('✅ Migration 001: Initial schema created successfully')
  },
  
  async down() {
    console.log('Rolling back migration 001: Dropping all tables...')
    
    await transaction(async (client) => {
      // Drop all tables in reverse dependency order
      const dropStatements = [
        'DROP VIEW IF EXISTS user_profiles',
        'DROP VIEW IF EXISTS active_users_with_access',
        'DROP FUNCTION IF EXISTS cleanup_expired_magic_links()',
        'DROP FUNCTION IF EXISTS create_trial_for_new_user()',
        'DROP FUNCTION IF EXISTS update_updated_at_column()',
        'DROP TABLE IF EXISTS search_history',
        'DROP TABLE IF EXISTS magic_link_tokens',
        'DROP TABLE IF EXISTS user_preferences',
        'DROP TABLE IF EXISTS trials',
        'DROP TABLE IF EXISTS subscriptions',
        'DROP TABLE IF EXISTS users',
        'DROP TABLE IF EXISTS migrations',
        'DROP EXTENSION IF EXISTS "uuid-ossp"'
      ]
      
      for (const statement of dropStatements) {
        await client.query(statement)
      }
    })
    
    console.log('✅ Migration 001: Schema rollback completed')
  }
}

// Migration utilities
export async function runMigration(migration: Migration): Promise<void> {
  try {
    await migration.up()
  } catch (error) {
    console.error(`❌ Migration ${migration.version} failed:`, error)
    throw error
  }
}

export async function rollbackMigration(migration: Migration): Promise<void> {
  try {
    await migration.down()
  } catch (error) {
    console.error(`❌ Rollback ${migration.version} failed:`, error)
    throw error
  }
}

export async function getMigrationsTable(): Promise<void> {
  await query(`
    CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY,
      version VARCHAR(50) UNIQUE NOT NULL,
      name VARCHAR(255) NOT NULL,
      applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `)
}

export async function getAppliedMigrations(): Promise<string[]> {
  await getMigrationsTable()
  const result = await query('SELECT version FROM migrations ORDER BY version')
  return result.rows.map(row => row.version)
}

export async function isMigrationApplied(version: string): Promise<boolean> {
  const applied = await getAppliedMigrations()
  return applied.includes(version)
}

export async function markMigrationAsApplied(version: string, name: string): Promise<void> {
  await getMigrationsTable()
  await query(
    'INSERT INTO migrations (version, name) VALUES ($1, $2) ON CONFLICT (version) DO NOTHING',
    [version, name]
  )
}

export async function removeMigrationRecord(version: string): Promise<void> {
  await query('DELETE FROM migrations WHERE version = $1', [version])
}

// Test database connection before running migrations
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    const result = await query('SELECT NOW() as current_time, version() as pg_version')
    console.log(`✅ Database connected successfully`)
    console.log(`   Time: ${result.rows[0].current_time}`)
    console.log(`   PostgreSQL version: ${result.rows[0].pg_version.split(' ')[0]}`)
    return true
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    return false
  }
}

// Initialize database (run all pending migrations)
export async function initializeDatabase(): Promise<void> {
  console.log('🚀 Initializing database...')
  
  // Test connection first
  const isConnected = await testDatabaseConnection()
  if (!isConnected) {
    throw new Error('Cannot connect to database')
  }
  
  // Check if migration 001 is already applied
  const applied = await getAppliedMigrations()
  
  if (!applied.includes('001')) {
    console.log('📦 Running initial schema migration...')
    await runMigration(migration001)
  } else {
    console.log('✅ Database already initialized')
  }
  
  console.log('🎉 Database initialization complete')
}

// Database health check
export async function healthCheck(): Promise<{
  connected: boolean
  tablesExist: boolean
  migrationsApplied: string[]
  userCount: number
}> {
  try {
    const connected = await testDatabaseConnection()
    if (!connected) {
      return {
        connected: false,
        tablesExist: false,
        migrationsApplied: [],
        userCount: 0
      }
    }
    
    // Check if core tables exist
    const tableCheck = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'subscriptions', 'trials')
    `)
    const tablesExist = tableCheck.rows.length >= 3
    
    // Get applied migrations
    const migrationsApplied = await getAppliedMigrations()
    
    // Get user count
    let userCount = 0
    if (tablesExist) {
      const userCountResult = await query('SELECT COUNT(*) as count FROM users')
      userCount = parseInt(userCountResult.rows[0].count)
    }
    
    return {
      connected: true,
      tablesExist,
      migrationsApplied,
      userCount
    }
  } catch (error) {
    console.error('Health check failed:', error)
    return {
      connected: false,
      tablesExist: false,
      migrationsApplied: [],
      userCount: 0
    }
  }
}