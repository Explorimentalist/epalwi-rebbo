import { Pool, PoolClient, QueryResult } from 'pg'

let pool: Pool | null = null

export interface DatabaseConfig {
  connectionString: string
  ssl?: boolean
}

export function createDatabasePool(config?: DatabaseConfig): Pool {
  if (!pool) {
    const connectionString = config?.connectionString || process.env.DATABASE_URL
    
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is required')
    }

    pool = new Pool({
      connectionString,
      ssl: config?.ssl !== false ? { rejectUnauthorized: false } : false,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    })

    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err)
      process.exit(-1)
    })
  }

  return pool
}

export async function getConnection(): Promise<PoolClient> {
  const dbPool = createDatabasePool()
  return await dbPool.connect()
}

export async function query<T = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> {
  const dbPool = createDatabasePool()
  return await dbPool.query(text, params)
}

export async function queryWithConnection<T = any>(
  client: PoolClient,
  text: string,
  params?: any[]
): Promise<QueryResult<T>> {
  return await client.query(text, params)
}

export async function transaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await getConnection()
  
  try {
    await client.query('BEGIN')
    const result = await callback(client)
    await client.query('COMMIT')
    return result
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end()
    pool = null
  }
}

export async function testConnection(): Promise<boolean> {
  try {
    const result = await query('SELECT NOW() as current_time')
    return !!result.rows[0]
  } catch (error) {
    console.error('Database connection test failed:', error)
    return false
  }
}