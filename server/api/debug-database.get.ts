/**
 * Debug Database Connection Endpoint
 * Tests database connectivity and environment variables
 * GET /api/debug-database
 */

import { query } from '~/lib/db/connection'

export default defineEventHandler(async (event) => {
  try {
    console.log('🔧 Debug [debug-database]: Starting database connection test')
    
    // Check environment variables
    const config = useRuntimeConfig()
    const hasDatabaseUrl = !!(config.databaseUrl)
    const databaseUrlLength = config.databaseUrl?.length || 0
    const databaseUrlPrefix = config.databaseUrl?.substring(0, 20) + '...' || 'null'
    
    console.log('🔧 Debug [debug-database]: Database URL available:', hasDatabaseUrl)
    console.log('🔧 Debug [debug-database]: Database URL length:', databaseUrlLength)
    
    const result = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      hasDatabaseUrl,
      databaseUrlLength,
      databaseUrlPrefix,
      connectionTest: 'NOT_TESTED',
      queryTest: 'NOT_TESTED',
      error: null as string | null
    }
    
    if (!hasDatabaseUrl) {
      result.error = 'DATABASE_URL environment variable not found'
      result.connectionTest = 'SKIPPED'
      result.queryTest = 'SKIPPED'
      return { success: false, debug: result }
    }
    
    // Test basic connection
    console.log('🔧 Debug [debug-database]: Testing database connection...')
    try {
      const testResult = await query('SELECT 1 as test_value')
      result.connectionTest = 'SUCCESS'
      result.queryTest = testResult.rows[0]?.test_value === 1 ? 'SUCCESS' : 'FAILED'
      console.log('✅ Debug [debug-database]: Basic connection successful')
    } catch (connError: any) {
      result.connectionTest = 'FAILED'
      result.error = connError.message
      console.error('❌ Debug [debug-database]: Connection failed:', connError.message)
      return { success: false, debug: result }
    }
    
    // Test user table access
    console.log('🔧 Debug [debug-database]: Testing user table access...')
    try {
      const userResult = await query('SELECT COUNT(*) as user_count FROM user_profiles LIMIT 1')
      result.userTableTest = 'SUCCESS'
      result.userCount = parseInt(userResult.rows[0]?.user_count || '0')
      console.log('✅ Debug [debug-database]: User table access successful')
    } catch (userError: any) {
      result.userTableTest = 'FAILED'
      result.userTableError = userError.message
      console.error('❌ Debug [debug-database]: User table access failed:', userError.message)
    }
    
    return { success: true, debug: result }
    
  } catch (error: any) {
    console.error('❌ Debug [debug-database]: Unexpected error:', error)
    return {
      success: false,
      debug: {
        timestamp: new Date().toISOString(),
        error: error.message,
        errorType: error.constructor.name,
        stack: error.stack
      }
    }
  }
})