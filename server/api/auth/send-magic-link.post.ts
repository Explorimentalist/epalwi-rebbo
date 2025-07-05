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
  
  const sentFrom = new Sender("noreply@epalwi-rebbo.com", "epàlwi-rèbbo")
  const recipients = [new Recipient(email, email)]

  const emailParams = new EmailParams()
    .setFrom(sentFrom)
    .setTo(recipients)
    .setSubject('Tu enlace de acceso - epàlwi-rèbbo')
    .setHtml(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Tu enlace de acceso</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #F2EDEB;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <div style="background-color: #D45B41; padding: 32px; text-align: center;">
              <h1 style="color: #FFFFFF; margin: 0; font-size: 28px; font-weight: bold;">epàlwi-rèbbo</h1>
              <p style="color: #FFFFFF; margin: 8px 0 0 0; opacity: 0.9;">Diccionario Español ↔ Ndowe</p>
            </div>
            <div style="padding: 32px;">
              <h2 style="color: #333333; margin: 0 0 16px 0; font-size: 24px;">¡Accede a tu cuenta!</h2>
              <p style="color: #666666; margin: 0 0 24px 0; line-height: 1.5;">
                Hola, hemos recibido una solicitud para acceder a tu cuenta en epàlwi-rèbbo. 
                Haz clic en el botón de abajo para acceder:
              </p>
              <div style="text-align: center; margin: 32px 0;">
                <a href="${magicLink}" style="display: inline-block; background-color: #D45B41; color: #FFFFFF; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: bold; font-size: 16px;">
                  Acceder a mi cuenta
                </a>
              </div>
              <p style="color: #999999; margin: 24px 0 0 0; font-size: 14px; line-height: 1.5;">
                Este enlace es válido por 15 minutos. Si no solicitaste este acceso, puedes ignorar este correo.
              </p>
              <div style="border-top: 1px solid #E0E0E0; margin: 24px 0 0 0; padding: 16px 0 0 0;">
                <p style="color: #999999; margin: 0; font-size: 12px;">
                  © 2024 epàlwi-rèbbo - Preservando el idioma Ndowe
                </p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `)
    .setText(`
      ¡Accede a tu cuenta en epàlwi-rèbbo!
      
      Hola, hemos recibido una solicitud para acceder a tu cuenta.
      
      Copia y pega este enlace en tu navegador para acceder:
      ${magicLink}
      
      Este enlace es válido por 15 minutos.
      
      Si no solicitaste este acceso, puedes ignorar este correo.
      
      © 2024 epàlwi-rèbbo - Preservando el idioma Ndowe
    `)

  try {
    await mailerSend.email.send(emailParams)
    console.log(`✅ Magic link sent to ${email}`)
  } catch (error) {
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