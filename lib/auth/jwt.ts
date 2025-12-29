import jwt from 'jsonwebtoken'
import type { JWTPayload } from '~/types/auth'

export interface JWTSessionPayload {
  uid: string
  email: string
  role: 'user' | 'admin'
  subscriptionStatus: 'trial' | 'active' | 'expired' | 'cancelled'
  iat: number
  exp: number
  iss: string
  aud: string
}

export interface JWTGenerationOptions {
  expiresIn?: string | number
  issuer?: string
  audience?: string
}

/**
 * Get JWT secret from runtime config or environment
 */
function getJWTSecret(): string {
  // Try runtime config first (for Nuxt context)
  try {
    const config = useRuntimeConfig()
    const jwtSecret = config.jwtSecret || config.JWT_SECRET
    if (jwtSecret) return jwtSecret
  } catch (error) {
    // Not in Nuxt context, fallback to environment
  }
  
  // Fallback to environment variables (for testing)
  const jwtSecret = process.env.JWT_SECRET
  
  if (!jwtSecret) {
    throw new Error('JWT_SECRET environment variable is required')
  }
  
  return jwtSecret
}

/**
 * Verify JWT token (magic link verification)
 * @param token - The JWT token to verify
 * @returns Decoded JWT payload
 */
export function verifyMagicLinkToken(token: string): JWTPayload {
  const jwtSecret = getJWTSecret()
  
  try {
    const payload = jwt.verify(token, jwtSecret, {
      algorithms: ['HS256'],
      issuer: 'epalwi-rebbo',
      audience: 'epalwi-rebbo-users'
    }) as JWTPayload

    // Check if token is expired
    const now = Math.floor(Date.now() / 1000)
    if (payload.exp < now) {
      throw new Error('Token expired')
    }

    return payload
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token expired')
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token')
    } else {
      throw error
    }
  }
}

/**
 * Generate JWT session token for authenticated user
 * @param payload - User session data
 * @param options - JWT generation options
 * @returns JWT token string
 */
export function generateSessionToken(
  payload: {
    uid: string
    email: string
    role: 'user' | 'admin'
    subscriptionStatus: 'trial' | 'active' | 'expired' | 'cancelled'
  },
  options: JWTGenerationOptions = {}
): string {
  const jwtSecret = getJWTSecret()
  
  const {
    expiresIn = '7d', // 7-day session by default
    issuer = 'epalwi-rebbo',
    audience = 'epalwi-rebbo-app'
  } = options

  const sessionPayload: Omit<JWTSessionPayload, 'iat' | 'exp' | 'iss' | 'aud'> = {
    uid: payload.uid,
    email: payload.email,
    role: payload.role,
    subscriptionStatus: payload.subscriptionStatus
  }

  return jwt.sign(sessionPayload, jwtSecret, {
    algorithm: 'HS256',
    expiresIn,
    issuer,
    audience
  })
}

/**
 * Verify JWT session token
 * @param token - The JWT session token to verify
 * @returns Decoded session payload
 */
export function verifySessionToken(token: string): JWTSessionPayload {
  const jwtSecret = getJWTSecret()
  
  console.log('🔧 Debug [verifySessionToken]: Starting verification...')
  console.log('🔧 Debug [verifySessionToken]: JWT secret available:', !!jwtSecret, jwtSecret ? `${jwtSecret.substring(0, 10)}...` : 'null')
  console.log('🔧 Debug [verifySessionToken]: Token length:', token?.length)
  
  try {
    // First decode without verification to see the payload structure
    const decoded = jwt.decode(token) as any
    console.log('🔧 Debug [verifySessionToken]: Decoded token (unverified):', {
      iss: decoded?.iss,
      aud: decoded?.aud, 
      exp: decoded?.exp,
      uid: decoded?.uid?.substring(0, 8) + '...' 
    })
    
    const payload = jwt.verify(token, jwtSecret, {
      algorithms: ['HS256'],
      issuer: 'epalwi-rebbo',
      audience: 'epalwi-rebbo-app'
    }) as JWTSessionPayload

    console.log('✅ Debug [verifySessionToken]: JWT verification successful')
    
    // Check if token is expired
    const now = Math.floor(Date.now() / 1000)
    console.log('🔧 Debug [verifySessionToken]: Token exp:', payload.exp, 'Current time:', now, 'Expired:', payload.exp < now)
    
    if (payload.exp < now) {
      throw new Error('Session expired')
    }

    console.log('✅ Debug [verifySessionToken]: Session token is valid and not expired')
    return payload
  } catch (error) {
    console.error('❌ [verifySessionToken]: Verification failed:', (error as any)?.message)
    console.error('❌ [verifySessionToken]: Error type:', (error as any)?.constructor?.name)
    
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Session expired')
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid session token')
    } else {
      throw error
    }
  }
}

/**
 * Generate magic link JWT token for email verification
 * @param email - User email address
 * @param options - JWT generation options
 * @returns JWT token string
 */
export function generateMagicLinkToken(
  email: string,
  options: JWTGenerationOptions = {}
): string {
  const jwtSecret = getJWTSecret()
  
  const {
    expiresIn = '15m', // 15-minute magic link by default
    issuer = 'epalwi-rebbo',
    audience = 'epalwi-rebbo-users'
  } = options

  const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
    email,
    iss: issuer,
    aud: audience
  }

  return jwt.sign(payload, jwtSecret, {
    algorithm: 'HS256',
    expiresIn
  })
}

/**
 * Refresh session token if it's valid and not expired
 * @param token - Current session token
 * @param refreshWindowHours - Hours before expiry to allow refresh (default: 24)
 * @returns New session token or null if refresh not needed/allowed
 */
export function refreshSessionToken(
  token: string,
  refreshWindowHours: number = 24
): string | null {
  try {
    const payload = verifySessionToken(token)
    const now = Math.floor(Date.now() / 1000)
    const refreshThreshold = refreshWindowHours * 60 * 60 // Convert to seconds
    
    // Only refresh if token expires within the refresh window
    if (payload.exp - now <= refreshThreshold) {
      return generateSessionToken({
        uid: payload.uid,
        email: payload.email,
        role: payload.role,
        subscriptionStatus: payload.subscriptionStatus
      })
    }
    
    return null // No refresh needed
  } catch (error) {
    // If token is invalid or expired, return null
    return null
  }
}

/**
 * Decode JWT token without verification (for debugging/logging)
 * @param token - JWT token to decode
 * @returns Decoded payload or null if invalid
 */
export function decodeToken(token: string): any | null {
  try {
    return jwt.decode(token)
  } catch (error) {
    return null
  }
}

/**
 * Extract token from Authorization header
 * @param authHeader - Authorization header value
 * @returns Token string or null if invalid format
 */
export function extractBearerToken(authHeader: string | undefined): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  
  return authHeader.substring(7)
}

/**
 * Get token expiration time in seconds
 * @param token - JWT token
 * @returns Expiration timestamp in seconds or null if invalid
 */
export function getTokenExpiration(token: string): number | null {
  const decoded = decodeToken(token)
  return decoded?.exp || null
}

/**
 * Check if token is expired
 * @param token - JWT token
 * @returns True if expired, false if valid, null if invalid token
 */
export function isTokenExpired(token: string): boolean | null {
  const exp = getTokenExpiration(token)
  if (exp === null) return null
  
  return Math.floor(Date.now() / 1000) >= exp
}

/**
 * Get remaining token lifetime in seconds
 * @param token - JWT token
 * @returns Remaining seconds or null if invalid/expired
 */
export function getTokenLifetime(token: string): number | null {
  const exp = getTokenExpiration(token)
  if (exp === null) return null
  
  const remaining = exp - Math.floor(Date.now() / 1000)
  return remaining > 0 ? remaining : null
}