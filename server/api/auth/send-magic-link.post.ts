/**
 * Send Magic Link API Endpoint
 * POST /api/auth/send-magic-link
 */

import jwt from 'jsonwebtoken'
import { MailerSend, EmailParams, Sender, Recipient } from 'mailersend'
import type { MagicLinkRequest, MagicLinkResponse, JWTPayload } from '~/types/auth'

// Rate limiting storage (in production, use Redis or database)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// Rate limiting configuration
const RATE_LIMIT = {
  maxAttempts: 3,
  windowMs: 15 * 60 * 1000, // 15 minutes
}

/**
 * Check if email is rate limited
 */
function isRateLimited(email: string): boolean {
  const now = Date.now()
  const userLimit = rateLimitStore.get(email)

  if (!userLimit) {
    // First request
    rateLimitStore.set(email, { count: 1, resetTime: now + RATE_LIMIT.windowMs })
    return false
  }

  if (now > userLimit.resetTime) {
    // Reset window
    rateLimitStore.set(email, { count: 1, resetTime: now + RATE_LIMIT.windowMs })
    return false
  }

  if (userLimit.count >= RATE_LIMIT.maxAttempts) {
    return true
  }

  // Increment count
  userLimit.count++
  return false
}

/**
 * Validate email format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Generate JWT token for magic link
 */
function generateMagicLinkToken(email: string): string {
  const config = useRuntimeConfig()
  
  if (!config.mailersendApiKey) {
    throw new Error('JWT secret not configured')
  }

  const payload: JWTPayload = {
    email,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (15 * 60), // 15 minutes
    iss: 'epalwi-rebbo',
    aud: 'epalwi-rebbo-users'
  }

  return jwt.sign(payload, config.mailersendApiKey, { algorithm: 'HS256' })
}

/**
 * Send magic link email via MailerSend
 */
async function sendMagicLinkEmail(email: string, token: string, redirectUrl: string): Promise<void> {
  const config = useRuntimeConfig()
  
  if (!config.mailersendApiKey) {
    throw new Error('MailerSend API key not configured')
  }

  const mailerSend = new MailerSend({
    apiKey: config.mailersendApiKey,
  })

  const magicLink = `${redirectUrl}?token=${token}`
  
  const sentFrom = new Sender("noreply@test-eqvygm0jevwl0p7w.mlsender.net", "epàlwi-rèbbo")
  const recipients = [new Recipient(email, email)]

  // Load email template
  const { loadEmailTemplate, getPlainTextVersion } = await import('~/server/utils/email-templates')
  const htmlTemplate = await loadEmailTemplate('magic-link', {
    MAGIC_LINK: magicLink,
    USER_EMAIL: email
  })

  const emailParams = new EmailParams()
    .setFrom(sentFrom)
    .setTo(recipients)
    .setSubject('Tu enlace de acceso - epàlwi-rèbbo')
    .setHtml(htmlTemplate)
    .setText(getPlainTextVersion(magicLink))

  try {
    await mailerSend.email.send(emailParams)
    console.log(`✅ Magic link sent to ${email}`)
  } catch (error: any) {
    console.error('❌ Failed to send magic link email:', error)
    throw new Error('Failed to send email')
  }
}

export default defineEventHandler(async (event): Promise<MagicLinkResponse> => {
  try {
    // Only allow POST requests
    assertMethod(event, 'POST')

    // Parse request body
    const body = await readBody<MagicLinkRequest>(event)
    
    if (!body || !body.email) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Email is required'
      })
    }

    const { email, redirectUrl = `${getHeader(event, 'origin') || 'http://localhost:3000'}/auth/verify` } = body

    // Validate email format
    if (!isValidEmail(email)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid email format'
      })
    }

    // Check rate limiting
    if (isRateLimited(email)) {
      throw createError({
        statusCode: 429,
        statusMessage: 'Too many requests. Please try again in 15 minutes.'
      })
    }

    // Generate magic link token
    const token = generateMagicLinkToken(email)

    // Send magic link email
    await sendMagicLinkEmail(email, token, redirectUrl)

    return {
      success: true,
      message: 'Enlace de acceso enviado. Revisa tu correo electrónico.'
    }

  } catch (error: any) {
    console.error('❌ Send magic link error:', error)

    // Handle specific error types
    if (error.statusCode) {
      throw error // Re-throw HTTP errors
    }

    // Generic error response
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to send magic link'
    })
  }
}) 