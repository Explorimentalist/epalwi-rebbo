import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { 
  createDatabasePool, 
  getConnection, 
  query, 
  transaction, 
  testConnection,
  closePool 
} from './connection'

describe('Database Connection', () => {
  beforeAll(async () => {
    // Ensure we have a clean pool for testing
    await closePool()
  })

  afterAll(async () => {
    // Clean up after tests
    await closePool()
  })

  it('should create a database pool successfully', () => {
    const pool = createDatabasePool()
    expect(pool).toBeDefined()
    expect(pool.totalCount).toBe(0) // No connections yet
  })

  it('should test database connection', async () => {
    const isConnected = await testConnection()
    expect(isConnected).toBe(true)
  })

  it('should execute simple queries', async () => {
    const result = await query('SELECT NOW() as current_time')
    expect(result.rows).toHaveLength(1)
    expect(result.rows[0].current_time).toBeInstanceOf(Date)
  })

  it('should handle parameterized queries', async () => {
    const testValue = 'test-value-' + Date.now()
    const result = await query('SELECT $1 as test_value', [testValue])
    expect(result.rows[0].test_value).toBe(testValue)
  })

  it('should manage connections from pool', async () => {
    const client = await getConnection()
    expect(client).toBeDefined()
    
    const result = await client.query('SELECT 1 as test')
    expect(result.rows[0].test).toBe(1)
    
    client.release()
  })

  it('should handle transactions successfully', async () => {
    // Create a test table for transaction testing
    await query(`
      CREATE TABLE IF NOT EXISTS transaction_test (
        id SERIAL PRIMARY KEY,
        value TEXT
      )
    `)

    const testValue = 'transaction-test-' + Date.now()
    
    const result = await transaction(async (client) => {
      await client.query('INSERT INTO transaction_test (value) VALUES ($1)', [testValue])
      const selectResult = await client.query('SELECT value FROM transaction_test WHERE value = $1', [testValue])
      return selectResult.rows[0].value
    })

    expect(result).toBe(testValue)
    
    // Verify the data was committed
    const verifyResult = await query('SELECT value FROM transaction_test WHERE value = $1', [testValue])
    expect(verifyResult.rows).toHaveLength(1)
    expect(verifyResult.rows[0].value).toBe(testValue)

    // Clean up
    await query('DELETE FROM transaction_test WHERE value = $1', [testValue])
  })

  it('should rollback transactions on error', async () => {
    const testValue = 'rollback-test-' + Date.now()
    
    try {
      await transaction(async (client) => {
        await client.query('INSERT INTO transaction_test (value) VALUES ($1)', [testValue])
        // Force an error to trigger rollback
        throw new Error('Intentional error for rollback test')
      })
    } catch (error) {
      expect(error.message).toBe('Intentional error for rollback test')
    }

    // Verify the data was rolled back
    const verifyResult = await query('SELECT value FROM transaction_test WHERE value = $1', [testValue])
    expect(verifyResult.rows).toHaveLength(0)

    // Clean up test table
    await query('DROP TABLE IF EXISTS transaction_test')
  })

  it('should handle connection errors gracefully', async () => {
    // Test with invalid connection string
    const invalidPool = createDatabasePool({ 
      connectionString: 'postgresql://invalid:invalid@localhost:5432/invalid'
    })
    
    try {
      await invalidPool.query('SELECT 1')
      expect(false).toBe(true) // Should not reach here
    } catch (error) {
      expect(error).toBeDefined()
    } finally {
      await invalidPool.end()
    }
  })
})