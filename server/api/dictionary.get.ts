/**
 * Dictionary API Endpoint
 * Serves the Spanish-Ndowe dictionary data from JSON file
 * GET /api/dictionary
 */

import { readFile } from 'fs/promises'
import { join } from 'path'
import type { DictionaryData, DictionaryApiResponse } from '~/types/dictionary'
import { enforceSubscription } from '~/server/utils/validateSubscription'

// Cache the dictionary data in memory for performance
let cachedDictionary: DictionaryData | null = null
let cacheTimestamp: number = 0
const CACHE_DURATION = 10 * 60 * 1000 // 10 minutes in milliseconds

/**
 * Load dictionary from file system
 */
async function loadDictionaryFromFile(): Promise<DictionaryData> {
  try {
    const dataPath = join(process.cwd(), 'server/data/diccionario_consolidado.json')
    const fileContent = await readFile(dataPath, 'utf-8')
    const data = JSON.parse(fileContent) as DictionaryData
    
    // Validate the data structure
    if (!data.metadata || !data.entries || !Array.isArray(data.entries)) {
      throw new Error('Invalid dictionary data structure')
    }
    
    console.log(`📚 Dictionary loaded: ${data.metadata.total_entries} entries`)
    return data
  } catch (error) {
    console.error('❌ Failed to load dictionary:', error)
    throw error
  }
}

/**
 * Get dictionary data with caching
 */
async function getDictionaryData(): Promise<DictionaryData> {
  const now = Date.now()
  
  // Return cached data if still valid
  if (cachedDictionary && (now - cacheTimestamp) < CACHE_DURATION) {
    console.log('📖 Serving cached dictionary data')
    return cachedDictionary
  }
  
  // Load fresh data
  console.log('🔄 Loading fresh dictionary data')
  cachedDictionary = await loadDictionaryFromFile()
  cacheTimestamp = now
  
  return cachedDictionary
}

/**
 * Handle GET requests to /api/dictionary
 */
export default defineEventHandler(async (event): Promise<DictionaryApiResponse> => {
  try {
    console.log('🔧 Debug [dictionary.get] v2: Request received with headers:', Object.keys(getHeaders(event)))
    console.log('🔧 Debug [dictionary.get] v2: Auth header present:', !!getHeader(event, 'authorization'))
    console.log('🔧 Debug [dictionary.get] v2: Node.js version:', process.version)
    
    // Set CORS headers for development
    if (process.dev) {
      setHeader(event, 'Access-Control-Allow-Origin', '*')
      setHeader(event, 'Access-Control-Allow-Methods', 'GET, OPTIONS')
      setHeader(event, 'Access-Control-Allow-Headers', 'Content-Type')
    }
    
    // Handle preflight requests
    if (getMethod(event) === 'OPTIONS') {
      return { success: true }
    }
    
    // Only allow GET requests
    if (getMethod(event) !== 'GET') {
      throw createError({
        statusCode: 405,
        statusMessage: 'Method Not Allowed'
      })
    }

    // Enforce subscription (allow access during grace period)
    const userInfo = await enforceSubscription(event, {
      allowGrace: true,
      resource: '/api/dictionary'
    })

    // Expose minimal subscription metadata via headers (do not alter typed payload)
    setHeader(event, 'X-Subscription-Status', userInfo.subscriptionStatus)
    setHeader(event, 'X-Subscription-Can-Access', String(userInfo.canAccessFeatures))
    setHeader(event, 'X-Subscription-In-Grace', String(userInfo.isInGracePeriod))

    // Load dictionary data
    const data = await getDictionaryData()
    
    // Set appropriate headers
    setHeader(event, 'Content-Type', 'application/json')
    setHeader(event, 'Cache-Control', 'public, max-age=600') // 10 minutes browser cache
    
    // Add ETag for efficient caching
    const etag = `"${data.metadata.version}-${data.metadata.total_entries}"`
    setHeader(event, 'ETag', etag)
    
    // Check if client has cached version
    const ifNoneMatch = getHeader(event, 'if-none-match')
    if (ifNoneMatch === etag) {
      setResponseStatus(event, 304)
      return { success: true, cached: true }
    }
    
    console.log(`📤 Serving dictionary API: ${data.metadata.total_entries} entries`)
    
    return {
      success: true,
      data,
      cached: cachedDictionary === data && (Date.now() - cacheTimestamp) > 0,
      version: data.metadata.version
    }
    
  } catch (error: any) {
    console.error('❌ Dictionary API error:', error)
    // If an H3 error (e.g., from enforceSubscription) was thrown, rethrow as-is
    if (error && typeof error.statusCode === 'number') {
      throw error
    }
    // Fallback to generic 500
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      data: { success: false, error: errorMessage }
    })
  }
})
