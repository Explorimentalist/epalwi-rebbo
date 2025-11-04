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

  
  const jwtSecret = config['jwtSecret'] as string
  
  if (!jwtSecret) {
    throw new Error('JWT secret not configured')
  }
  
  if (jwtSecret.length < 32) {
    throw new Error('JWT secret too short (minimum 32 characters)')
  }

  const payload: JWTPayload = {
    email,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (15 * 60), // 15 minutes
    iss: 'epalwi-rebbo',
    aud: 'epalwi-rebbo-users'
  }

  return jwt.sign(payload, jwtSecret, { algorithm: 'HS256' })
}

/**
 * Send magic link email via MailerSend or development mode
 */
async function sendMagicLinkEmail(email: string, token: string, redirectUrl: string): Promise<void> {
  const config = useRuntimeConfig()
  
  // Development Mode: Just log the magic link instead of sending email
  const isDevelopment = process.env.NODE_ENV === 'development' || !config.mailersendApiKey || config.mailersendApiKey === 'your_value_here'
  
  if (isDevelopment) {
    const magicLink = `${redirectUrl}?token=${token}`
    console.log('\n🔗 DEVELOPMENT MODE: Magic Link Generated')
    console.log('📧 For email:', email)
    console.log('🌐 Magic Link:', magicLink)
    console.log('⏰ Valid for: 15 minutes')
    console.log('🚀 Copy this link to browser to authenticate\n')
    return
  }
  
  console.log('🔧 Debug: Checking MailerSend API key...', !!config.mailersendApiKey)
  console.log('🔧 Debug: MailerSend API key length:', config.mailersendApiKey?.length || 0)
  console.log('🔧 Debug: MailerSend API key starts with:', config.mailersendApiKey?.substring(0, 10) || 'N/A')
  
  if (!config.mailersendApiKey) {
    console.error('❌ MailerSend API key not configured')
    throw new Error('MailerSend API key not configured')
  }
  
  if (config.mailersendApiKey.length < 20) {
    console.error('❌ MailerSend API key too short')
    throw new Error('MailerSend API key too short')
  }

  let mailerSend
  try {
    console.log('🔧 Debug: Initializing MailerSend...')
    mailerSend = new MailerSend({
      apiKey: config.mailersendApiKey,
    })
    console.log('✅ MailerSend initialized successfully')
  } catch (initError: any) {
    console.error('❌ Failed to initialize MailerSend:', initError)
    throw new Error(`Failed to initialize MailerSend: ${initError.message}`)
  }

  const magicLink = `${redirectUrl}?token=${token}`
  console.log('🔧 Debug: Magic link generated:', magicLink)
  
  // Validate sender email format - this might be the issue
  const senderEmail = "noreply@test-eqvygm0jevwl0p7w.mlsender.net"
  console.log('🔧 Debug: Sender email:', senderEmail)
  console.log('🔧 Debug: API Key starts with mlsn.:', config.mailersendApiKey.startsWith('mlsn.'))
  
  const sentFrom = new Sender(senderEmail, "epàlwi-rèbbo")
  const recipients = [new Recipient(email, email)]
  
  console.log('🔧 Debug: Recipient email:', email)

  try {
    // Load email template
    console.log('🔧 Debug: Loading email template...')
    let loadEmailTemplate, getPlainTextVersion
    
    try {
      const emailUtils = await import('~/server/utils/email-templates')
      loadEmailTemplate = emailUtils.loadEmailTemplate
      getPlainTextVersion = emailUtils.getPlainTextVersion
      console.log('✅ Email utilities imported successfully')
    } catch (importError: any) {
      console.error('❌ Failed to import email utilities:', importError)
      throw new Error(`Failed to import email utilities: ${importError.message}`)
    }
    
    let htmlTemplate
    try {
      htmlTemplate = await loadEmailTemplate('magic-link', {
        MAGIC_LINK: magicLink,
        USER_EMAIL: email
      })
      console.log('✅ Email template loaded successfully')
    } catch (templateError: any) {
      console.error('❌ Failed to load email template:', templateError)
      throw new Error(`Failed to load email template: ${templateError.message}`)
    }

    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setSubject('Tu enlace de acceso - epàlwi-rèbbo')
      .setHtml(htmlTemplate)
      .setText(getPlainTextVersion(magicLink))

    console.log('🔧 Debug: Sending email via MailerSend...')
    console.log('🔧 Debug: Email params:', {
      from: sentFrom.email,
      to: recipients.map(r => r.email),
      subject: 'Tu enlace de acceso - epàlwi-rèbbo',
      hasHtml: !!htmlTemplate,
      hasText: !!getPlainTextVersion(magicLink)
    })
    
    const response = await mailerSend.email.send(emailParams)
    console.log(`✅ Magic link sent to ${email}`, response)
  } catch (error: any) {
    console.error('❌ Failed to send magic link email:', error)
    console.error('❌ Error type:', typeof error)
    console.error('❌ Error constructor:', error.constructor.name)
    console.error('❌ Error message:', error.message)
    console.error('❌ Error stack:', error.stack)
    
    // Log the entire error object for debugging
    try {
      console.error('❌ Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2))
    } catch (jsonError) {
      console.error('❌ Error object cannot be serialized:', error)
      console.error('❌ Error keys:', Object.keys(error))
      console.error('❌ Error values:', Object.values(error))
    }
    
    // Handle different error types
    if (error.response) {
      console.error('❌ MailerSend response status:', error.response.status)
      console.error('❌ MailerSend response data:', error.response.data)
      console.error('❌ MailerSend response headers:', error.response.headers)
    }
    
    if (error.code) {
      console.error('❌ Error code:', error.code)
    }
    
    if (error.details) {
      console.error('❌ Error details:', error.details)
    }
    
    // Check for common MailerSend error patterns
    let errorMessage = 'Failed to send email'
    
    // Try to extract meaningful error information
    if (error.message && error.message !== 'undefined') {
      errorMessage += `: ${error.message}`
    } else if (error.response?.data?.message) {
      errorMessage += `: ${error.response.data.message}`
    } else if (error.response?.data?.error) {
      errorMessage += `: ${error.response.data.error}`
    } else if (error.response?.status) {
      errorMessage += ` (HTTP ${error.response.status})`
    } else if (error.code) {
      errorMessage += ` (Code: ${error.code})`
    } else if (error.status) {
      errorMessage += ` (Status: ${error.status})`
    } else if (error.name) {
      errorMessage += ` (${error.name})`
    } else {
      errorMessage += ': MailerSend API call failed - check API key and sender domain'
    }
    
    console.error('❌ Final error message:', errorMessage)
    throw new Error(errorMessage)
  }
}

export default defineEventHandler(async (event): Promise<MagicLinkResponse> => {
  console.log('🔧 Debug: Magic link request received')
  
  try {
    // Only allow POST requests
    assertMethod(event, 'POST')

    // Parse request body
    const body = await readBody<MagicLinkRequest>(event)
    console.log('🔧 Debug: Request body:', { email: body?.email, hasRedirectUrl: !!body?.redirectUrl })
    
    if (!body || !body.email) {
      console.error('❌ No email provided in request')
      throw createError({
        statusCode: 400,
        statusMessage: 'Email is required'
      })
    }

    const origin = getHeader(event, 'origin') || 'http://localhost:4000'
    const { email, redirectUrl = `${origin}/auth/verify` } = body
    
    console.log('🔧 Debug: Origin header:', getHeader(event, 'origin'))
    console.log('🔧 Debug: Redirect URL:', redirectUrl)


    // Validate email format
    if (!isValidEmail(email)) {
      console.error('❌ Invalid email format:', email)
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid email format'
      })
    }

    // Check rate limiting
    if (isRateLimited(email)) {
      console.error('❌ Rate limited:', email)
      throw createError({
        statusCode: 429,
        statusMessage: 'Too many requests. Please try again in 15 minutes.'
      })
    }

    console.log('🔧 Debug: Generating JWT token...')
    let token
    try {
      // Generate magic link token
      token = generateMagicLinkToken(email)
      console.log('✅ JWT token generated successfully')
    } catch (jwtError: any) {
      console.error('❌ Failed to generate JWT token:', jwtError)
      throw new Error(`Failed to generate JWT token: ${jwtError.message}`)
    }

    console.log('🔧 Debug: Sending email...')
    try {
      // Send magic link email
      await sendMagicLinkEmail(email, token, redirectUrl)
      console.log('✅ Email sent successfully')
    } catch (emailError: any) {
      console.error('❌ Failed to send email:', emailError)
      throw new Error(`Failed to send email: ${emailError.message}`)
    }

    console.log('✅ Magic link process completed successfully')
    return {
      success: true,
      message: 'Enlace de acceso enviado. Revisa tu correo electrónico.'
    }

  } catch (error: any) {
    console.error('❌ Send magic link error:', error)
    console.error('❌ Error stack:', error.stack)

    // Handle specific error types
    if (error.statusCode) {
      throw error // Re-throw HTTP errors
    }

    // Generic error response
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to send magic link: ' + (error.message || 'Unknown error')
    })
  }
}) 