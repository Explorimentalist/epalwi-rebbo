#!/usr/bin/env node

/**
 * Database Setup Script
 * Sets up PostgreSQL database with initial schema
 */

const { readFileSync } = require('fs')
const { join } = require('path')
const { Pool } = require('pg')

const DB_URL = process.env.DATABASE_URL

if (!DB_URL) {
  console.error('❌ DATABASE_URL environment variable is required')
  console.log('Please set DATABASE_URL and try again:')
  console.log('export DATABASE_URL="your_postgres_connection_string"')
  process.exit(1)
}

async function setupDatabase() {
  console.log('🚀 Setting up PostgreSQL database...')
  
  const pool = new Pool({
    connectionString: DB_URL,
    ssl: DB_URL.includes('localhost') ? false : { rejectUnauthorized: false }
  })

  try {
    // Test connection
    console.log('🔌 Testing database connection...')
    const client = await pool.connect()
    await client.query('SELECT NOW()')
    client.release()
    console.log('✅ Database connection successful')

    // Load and execute schema
    console.log('📄 Loading database schema...')
    const schemaPath = join(__dirname, '..', 'lib', 'db', 'schema-neon.sql')
    const schemaSQL = readFileSync(schemaPath, 'utf-8')

    console.log('🔧 Executing database schema...')
    await pool.query(schemaSQL)
    console.log('✅ Database schema created successfully')

    // Verify tables were created
    console.log('🔍 Verifying table creation...')
    const tableCheck = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'subscriptions', 'trials', 'user_preferences', 'search_history', 'magic_link_tokens')
      ORDER BY table_name;
    `)
    
    console.log(`✅ Created ${tableCheck.rows.length} tables:`)
    tableCheck.rows.forEach(row => console.log(`  - ${row.table_name}`))

    // Check views
    const viewCheck = await pool.query(`
      SELECT table_name 
      FROM information_schema.views 
      WHERE table_schema = 'public' 
      AND table_name IN ('active_users_with_access', 'user_profiles');
    `)
    
    console.log(`✅ Created ${viewCheck.rows.length} views:`)
    viewCheck.rows.forEach(row => console.log(`  - ${row.table_name}`))

    console.log('🎉 Database setup complete!')
    console.log('')
    console.log('Next steps:')
    console.log('1. Deploy your app: vercel --prod')
    console.log('2. Test magic link authentication')

  } catch (error) {
    console.error('❌ Database setup failed:', error.message)
    console.error('Full error:', error)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

// Run the setup
setupDatabase().catch(console.error)