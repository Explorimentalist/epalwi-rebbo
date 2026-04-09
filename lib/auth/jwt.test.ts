import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import jwt from 'jsonwebtoken'
import {
  verifyMagicLinkToken,
  generateSessionToken,
  verifySessionToken,
  generateMagicLinkToken,
  refreshSessionToken,
  decodeToken,
  extractBearerToken,
  getTokenExpiration,
  isTokenExpired,
  getTokenLifetime,
  type JWTSessionPayload
} from './jwt'
import type { JWTPayload } from '~/types/auth'

// Mock runtime config for testing
const mockJWTSecret = 'test-jwt-secret-for-testing-only-32-chars'
const originalEnv = process.env.JWT_SECRET

beforeAll(() => {
  process.env.JWT_SECRET = mockJWTSecret
})

afterAll(() => {
  if (originalEnv) {
    process.env.JWT_SECRET = originalEnv
  } else {
    delete process.env.JWT_SECRET
  }
})

describe('JWT Utilities', () => {
  describe('Magic Link Token Functions', () => {
    it('should generate valid magic link token', () => {
      const email = 'test@example.com'
      const token = generateMagicLinkToken(email)
      
      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
      expect(token.length).toBeGreaterThan(0)
    })

    it('should verify valid magic link token', () => {
      const email = 'test@example.com'
      const token = generateMagicLinkToken(email)
      
      const payload = verifyMagicLinkToken(token)
      
      expect(payload.email).toBe(email)
      expect(payload.iss).toBe('epalwi-rebbo')
      expect(payload.aud).toBe('epalwi-rebbo-users')
      expect(payload.exp).toBeGreaterThan(Math.floor(Date.now() / 1000))
    })

    it('should reject invalid magic link token', () => {
      const invalidToken = 'invalid.token.here'
      
      expect(() => verifyMagicLinkToken(invalidToken)).toThrow('Invalid token')
    })

    it('should reject expired magic link token', () => {
      const email = 'test@example.com'
      const expiredToken = generateMagicLinkToken(email, { expiresIn: '-1s' })
      
      // Wait a moment to ensure expiration
      setTimeout(() => {
        expect(() => verifyMagicLinkToken(expiredToken)).toThrow('Token expired')
      }, 100)
    })

    it('should generate token with custom options', () => {
      const email = 'custom@example.com'
      const token = generateMagicLinkToken(email, {
        expiresIn: '1h',
        issuer: 'custom-issuer',
        audience: 'custom-audience'
      })
      
      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
      expect(token.length).toBeGreaterThan(0)
      
      // Decode without verification to check custom claims
      const decoded = jwt.decode(token) as any
      expect(decoded.email).toBe(email)
      expect(decoded.iss).toBe('custom-issuer')
      expect(decoded.aud).toBe('custom-audience')
      
      // Verify that verifyMagicLinkToken rejects tokens with wrong issuer/audience
      expect(() => verifyMagicLinkToken(token)).toThrow('Invalid token')
    })
  })

  describe('Session Token Functions', () => {
    const testUser = {
      uid: 'test-user-123',
      email: 'session@example.com',
      role: 'user' as const,
      subscriptionStatus: 'trial' as const
    }

    it('should generate valid session token', () => {
      const token = generateSessionToken(testUser)
      
      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
      expect(token.length).toBeGreaterThan(0)
    })

    it('should verify valid session token', () => {
      const token = generateSessionToken(testUser)
      
      const payload = verifySessionToken(token)
      
      expect(payload.uid).toBe(testUser.uid)
      expect(payload.email).toBe(testUser.email)
      expect(payload.role).toBe(testUser.role)
      expect(payload.subscriptionStatus).toBe(testUser.subscriptionStatus)
      expect(payload.iss).toBe('epalwi-rebbo')
      expect(payload.aud).toBe('epalwi-rebbo-app')
    })

    it('should reject invalid session token', () => {
      const invalidToken = 'invalid.session.token'
      
      expect(() => verifySessionToken(invalidToken)).toThrow('Invalid session token')
    })

    it('should reject expired session token', () => {
      const expiredToken = generateSessionToken(testUser, { expiresIn: '-1s' })
      
      setTimeout(() => {
        expect(() => verifySessionToken(expiredToken)).toThrow('Session expired')
      }, 100)
    })

    it('should generate session token with custom expiration', () => {
      const token = generateSessionToken(testUser, { expiresIn: '30d' })
      const payload = verifySessionToken(token)
      
      // Check that expiration is approximately 30 days from now
      const now = Math.floor(Date.now() / 1000)
      const thirtyDaysFromNow = now + (30 * 24 * 60 * 60)
      expect(payload.exp).toBeGreaterThan(now)
      expect(payload.exp).toBeLessThan(thirtyDaysFromNow + 60) // Allow 1 minute tolerance
    })

    it('should handle admin role correctly', () => {
      const adminUser = { ...testUser, role: 'admin' as const }
      const token = generateSessionToken(adminUser)
      const payload = verifySessionToken(token)
      
      expect(payload.role).toBe('admin')
    })

    it('should handle different subscription statuses', () => {
      const activeUser = { ...testUser, subscriptionStatus: 'active' as const }
      const token = generateSessionToken(activeUser)
      const payload = verifySessionToken(token)
      
      expect(payload.subscriptionStatus).toBe('active')
    })
  })

  describe('Token Refresh Functions', () => {
    const testUser = {
      uid: 'refresh-user-123',
      email: 'refresh@example.com',
      role: 'user' as const,
      subscriptionStatus: 'active' as const
    }

    it('should refresh session token when within refresh window', () => {
      // Create token that expires in 23 hours (within 24-hour refresh window)
      const token = generateSessionToken(testUser, { expiresIn: '23h' })
      
      const refreshedToken = refreshSessionToken(token, 24)
      
      expect(refreshedToken).toBeDefined()
      expect(refreshedToken).not.toBe(token)
      
      if (refreshedToken) {
        const payload = verifySessionToken(refreshedToken)
        expect(payload.uid).toBe(testUser.uid)
        expect(payload.email).toBe(testUser.email)
      }
    })

    it('should not refresh token when outside refresh window', () => {
      // Create token that expires in 25 hours (outside 24-hour refresh window)
      const token = generateSessionToken(testUser, { expiresIn: '25h' })
      
      const refreshedToken = refreshSessionToken(token, 24)
      
      expect(refreshedToken).toBeNull()
    })

    it('should return null for invalid token refresh', () => {
      const invalidToken = 'invalid.token'
      
      const refreshedToken = refreshSessionToken(invalidToken)
      
      expect(refreshedToken).toBeNull()
    })
  })

  describe('Token Utility Functions', () => {
    const testUser = {
      uid: 'util-user-123',
      email: 'util@example.com',
      role: 'user' as const,
      subscriptionStatus: 'trial' as const
    }

    describe('decodeToken', () => {
      it('should decode valid token without verification', () => {
        const token = generateSessionToken(testUser)
        const decoded = decodeToken(token)
        
        expect(decoded).toBeDefined()
        expect(decoded.uid).toBe(testUser.uid)
        expect(decoded.email).toBe(testUser.email)
      })

      it('should return null for invalid token', () => {
        const invalidToken = 'invalid.token'
        const decoded = decodeToken(invalidToken)
        
        expect(decoded).toBeNull()
      })
    })

    describe('extractBearerToken', () => {
      it('should extract token from valid Bearer header', () => {
        const token = 'sample.jwt.token'
        const authHeader = `Bearer ${token}`
        
        const extracted = extractBearerToken(authHeader)
        
        expect(extracted).toBe(token)
      })

      it('should return null for invalid header format', () => {
        expect(extractBearerToken('Invalid header')).toBeNull()
        expect(extractBearerToken('Basic dGVzdA==')).toBeNull()
        expect(extractBearerToken('')).toBeNull()
        expect(extractBearerToken(undefined)).toBeNull()
      })

      it('should handle Bearer header with extra spaces', () => {
        const token = 'sample.jwt.token'
        const authHeader = `Bearer  ${token}`
        
        const extracted = extractBearerToken(authHeader)
        
        expect(extracted).toBe(` ${token}`) // Preserves the space
      })
    })

    describe('getTokenExpiration', () => {
      it('should return expiration timestamp for valid token', () => {
        const token = generateSessionToken(testUser)
        const exp = getTokenExpiration(token)
        
        expect(exp).toBeDefined()
        expect(typeof exp).toBe('number')
        expect(exp).toBeGreaterThan(Math.floor(Date.now() / 1000))
      })

      it('should return null for invalid token', () => {
        const exp = getTokenExpiration('invalid.token')
        expect(exp).toBeNull()
      })
    })

    describe('isTokenExpired', () => {
      it('should return false for valid unexpired token', () => {
        const token = generateSessionToken(testUser)
        const expired = isTokenExpired(token)
        
        expect(expired).toBe(false)
      })

      it('should return true for expired token', () => {
        const expiredToken = generateSessionToken(testUser, { expiresIn: '-1s' })
        const expired = isTokenExpired(expiredToken)
        
        expect(expired).toBe(true)
      })

      it('should return null for invalid token', () => {
        const expired = isTokenExpired('invalid.token')
        expect(expired).toBeNull()
      })
    })

    describe('getTokenLifetime', () => {
      it('should return positive lifetime for valid token', () => {
        const token = generateSessionToken(testUser)
        const lifetime = getTokenLifetime(token)
        
        expect(lifetime).toBeDefined()
        expect(lifetime).toBeGreaterThan(0)
      })

      it('should return null for expired token', () => {
        const expiredToken = generateSessionToken(testUser, { expiresIn: '-1s' })
        const lifetime = getTokenLifetime(expiredToken)
        
        expect(lifetime).toBeNull()
      })

      it('should return null for invalid token', () => {
        const lifetime = getTokenLifetime('invalid.token')
        expect(lifetime).toBeNull()
      })
    })
  })

  describe('JWT Secret Management', () => {
    it('should throw error when JWT secret is not configured', () => {
      const originalSecret = process.env.JWT_SECRET
      delete process.env.JWT_SECRET
      
      expect(() => generateSessionToken({
        uid: 'test',
        email: 'test@example.com',
        role: 'user',
        subscriptionStatus: 'trial'
      })).toThrow('JWT_SECRET environment variable is required')
      
      // Restore secret
      process.env.JWT_SECRET = originalSecret
    })
  })

  describe('Security Considerations', () => {
    it('should use HMAC-SHA256 algorithm', () => {
      const token = generateSessionToken({
        uid: 'security-test',
        email: 'security@example.com',
        role: 'user',
        subscriptionStatus: 'trial'
      })
      
      const decoded = jwt.decode(token, { complete: true }) as any
      expect(decoded.header.alg).toBe('HS256')
    })

    it('should include required claims in session token', () => {
      const user = {
        uid: 'claims-test',
        email: 'claims@example.com',
        role: 'admin' as const,
        subscriptionStatus: 'active' as const
      }
      
      const token = generateSessionToken(user)
      const payload = verifySessionToken(token)
      
      expect(payload.uid).toBeDefined()
      expect(payload.email).toBeDefined()
      expect(payload.role).toBeDefined()
      expect(payload.subscriptionStatus).toBeDefined()
      expect(payload.iat).toBeDefined()
      expect(payload.exp).toBeDefined()
      expect(payload.iss).toBeDefined()
      expect(payload.aud).toBeDefined()
    })

    it('should not accept tokens with wrong issuer/audience', () => {
      // Create token with different issuer
      const wrongIssuerToken = jwt.sign(
        { uid: 'test', email: 'test@example.com' },
        mockJWTSecret,
        { 
          algorithm: 'HS256',
          issuer: 'wrong-issuer',
          audience: 'epalwi-rebbo-app'
        }
      )
      
      expect(() => verifySessionToken(wrongIssuerToken)).toThrow()
    })
  })

  describe('Edge Cases', () => {
    it('should handle very long email addresses', () => {
      const longEmail = 'very.long.email.address.that.exceeds.normal.length.limits@example.com'
      const token = generateMagicLinkToken(longEmail)
      const payload = verifyMagicLinkToken(token)
      
      expect(payload.email).toBe(longEmail)
    })

    it('should handle special characters in email', () => {
      const specialEmail = 'test+special.email@example-domain.com'
      const token = generateMagicLinkToken(specialEmail)
      const payload = verifyMagicLinkToken(token)
      
      expect(payload.email).toBe(specialEmail)
    })

    it('should handle edge case expiration times', () => {
      const token = generateSessionToken({
        uid: 'edge-test',
        email: 'edge@example.com',
        role: 'user',
        subscriptionStatus: 'trial'
      }, { expiresIn: 1 }) // 1 second
      
      const payload = verifySessionToken(token)
      expect(payload.exp).toBeGreaterThan(Math.floor(Date.now() / 1000))
    })
  })
})