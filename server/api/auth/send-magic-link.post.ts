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
  // Temporarily force development mode due to MailerSend trial quota limits
  const isDevelopment = true // process.env['NODE_ENV'] === 'development' || !config.mailersendApiKey || config.mailersendApiKey === 'your_value_here'
  
  // Temporary: Add debug logging to see what's happening
  console.log('🔧 Debug: NODE_ENV:', process.env['NODE_ENV'])
  console.log('🔧 Debug: Has MailerSend API Key:', !!config.mailersendApiKey)
  console.log('🔧 Debug: isDevelopment:', isDevelopment)
  
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
    // Inline email template (temporary fix for Vercel build issues)
    console.log('🔧 Debug: Using inline email template...')
    const htmlTemplate = `
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tu enlace de acceso - epàlwi-rèbbo</title>
    <style>
      @media only screen and (max-width: 600px) {
        .email-container { width: 100% !important; margin: 0 !important; }
        .email-content { padding: 24px !important; }
        .cta-button { padding: 14px 24px !important; font-size: 15px !important; }
      }
    </style>
  </head>
  <body style="margin: 0; padding: 20px; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: linear-gradient(135deg, #f3eeec 0%, #e8ddd9 100%); line-height: 1.6;">
    <div class="email-container" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08);">
      
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #D45B41 0%, #b94a34 100%); padding: 40px 32px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0 0 8px 0; font-size: 32px; font-weight: 600;">
          epàlwi-rèbbo
        </h1>
        <p style="color: #ffffff; margin: 0; opacity: 0.95; font-size: 16px;">
          Tu diccionario Español ↔ Ndowe
        </p>
      </div>
      
      <!-- Main content -->
      <div class="email-content" style="padding: 40px 32px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h2 style="color: #333333; margin: 0 0 12px 0; font-size: 24px; font-weight: 600;">
            ¡Bienvenido de vuelta!
          </h2>
          <p style="color: #666666; margin: 0; font-size: 16px;">
            Tu enlace seguro de acceso está listo
          </p>
        </div>
        
        <p style="color: #555555; margin: 0 0 32px 0; font-size: 16px; text-align: center;">
          Hemos recibido una solicitud para acceder a tu cuenta en epàlwi-rèbbo. 
          <br><strong>Haz clic en el botón de abajo para continuar:</strong>
        </p>
        
        <!-- CTA Button -->
        <div style="text-align: center; margin: 40px 0;">
          <a href="${magicLink}" class="cta-button"
            style="display: inline-block; 
                   background: linear-gradient(135deg, #D45B41 0%, #b94a34 100%); 
                   color: #ffffff; 
                   text-decoration: none; 
                   padding: 16px 40px; 
                   border-radius: 12px; 
                   font-weight: 600; 
                   font-size: 16px;">
            ✨ Acceder a mi cuenta
          </a>
        </div>
        
        <!-- Alternative link -->
        <div style="text-align: center; margin-top: 32px;">
          <p style="color: #888888; font-size: 14px; margin: 0 0 12px 0;">
            ¿Problemas con el botón? Copia y pega este enlace:
          </p>
          <p style="background-color: #f8f9fa; border: 1px solid #e9ecef; border-radius: 6px; padding: 12px; font-family: monospace; font-size: 12px; color: #495057; word-break: break-all; margin: 0;">
            ${magicLink}
          </p>
        </div>
        
        <!-- Security notice -->
        <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e9ecef;">
          <p style="color: #999999; margin: 0; font-size: 14px;">
            <strong>⏰ Este enlace expira en 15 minutos</strong> por tu seguridad.
            Si no solicitaste este acceso, puedes ignorar este correo.
          </p>
        </div>
      </div>
      
      <!-- Footer -->
      <div style="background: #f8f9fa; padding: 24px 32px; text-align: center; border-top: 1px solid #e9ecef;">
        <p style="color: #666666; margin: 0 0 8px 0; font-size: 13px; font-weight: 500;">
          © 2025 epàlwi-rèbbo
        </p>
        <p style="color: #888888; margin: 0; font-size: 12px;">
          Preservando el patrimonio lingüístico Ndowe
        </p>
      </div>
      
    </div>
  </body>
</html>`.trim()

    const getPlainTextVersion = (link: string) => `
epàlwi-rèbbo - Tu diccionario Español ↔ Ndowe
¡Bienvenido de vuelta!

Hemos recibido una solicitud para acceder a tu cuenta.

ACCEDER A MI CUENTA:
${link}

Este enlace expira en 15 minutos por tu seguridad.
Si no solicitaste este acceso, puedes ignorar este correo.

© 2025 epàlwi-rèbbo
Preservando el patrimonio lingüístico Ndowe
`.trim()

    console.log('✅ Inline email template ready')

    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setSubject('Tu enlace de acceso a la cuenta de Epàlwi-Rèbbo')
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

    const config = useRuntimeConfig()
    
    // Smart URL detection: try origin header, then Vercel URL, then configured URL, then localhost
    let baseUrl = getHeader(event, 'origin')
    
    if (!baseUrl) {
      // Check for Vercel deployment URL
      const vercelUrl = getHeader(event, 'x-forwarded-host')
      if (vercelUrl) {
        baseUrl = `https://${vercelUrl}`
      } else {
        // Fall back to configured URL
        baseUrl = config.public.appUrl
      }
    }
    
    const { email, redirectUrl = `${baseUrl}/auth/verify` } = body
    
    console.log('🔧 Debug: Origin header:', getHeader(event, 'origin'))
    console.log('🔧 Debug: Vercel host header:', getHeader(event, 'x-forwarded-host'))
    console.log('🔧 Debug: Configured app URL:', config.public.appUrl)
    console.log('🔧 Debug: Final base URL:', baseUrl)
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