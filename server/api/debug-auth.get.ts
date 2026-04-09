/**
 * Debug Auth Endpoint - Test JWT verification in production
 * GET /api/debug-auth
 */

import { verifySessionToken, extractBearerToken } from '~/lib/auth/jwt'

export default defineEventHandler(async (event) => {
  try {
    // Get JWT secret info
    const config = useRuntimeConfig()
    const hasSecret = !!(config.jwtSecret)
    const secretLength = config.jwtSecret?.length || 0
    
    // Get auth header
    const authHeader = getHeader(event, 'authorization')
    const token = extractBearerToken(authHeader)
    
    const debugInfo = {
      timestamp: new Date().toISOString(),
      nodeVersion: process.version,
      hasJwtSecret: hasSecret,
      jwtSecretLength: secretLength,
      jwtSecretPrefix: config.jwtSecret?.substring(0, 10) + '...',
      hasAuthHeader: !!authHeader,
      hasToken: !!token,
      tokenLength: token?.length || 0,
      tokenPrefix: token?.substring(0, 20) + '...' || null
    }
    
    // Try JWT verification if token provided
    if (token) {
      try {
        const payload = verifySessionToken(token)
        debugInfo.jwtVerificationResult = 'SUCCESS'
        debugInfo.tokenUid = payload.uid?.substring(0, 8) + '...'
        debugInfo.tokenEmail = payload.email
        debugInfo.tokenExp = payload.exp
        debugInfo.currentTimestamp = Math.floor(Date.now() / 1000)
        debugInfo.isExpired = payload.exp < Math.floor(Date.now() / 1000)
      } catch (err: any) {
        debugInfo.jwtVerificationResult = 'FAILED'
        debugInfo.jwtError = err.message
        debugInfo.jwtErrorType = err.constructor.name
      }
    }
    
    return {
      success: true,
      debug: debugInfo
    }
    
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      debug: {
        nodeVersion: process.version,
        timestamp: new Date().toISOString()
      }
    }
  }
})