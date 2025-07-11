import { readFile } from 'fs/promises'
import { resolve } from 'path'

export interface EmailTemplateData {
  MAGIC_LINK?: string
  USER_EMAIL?: string
  USER_NAME?: string
  [key: string]: string | undefined
}

/**
 * Load and process email template with variable replacement
 */
export async function loadEmailTemplate(templateName: string, data: EmailTemplateData = {}): Promise<string> {
  try {
    const templatePath = resolve(process.cwd(), 'server', 'templates', 'emails', `${templateName}.html`)
    let template = await readFile(templatePath, 'utf-8')
    
    // Replace template variables
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        template = template.replace(new RegExp(`{{${key}}}`, 'g'), value)
      }
    }
    
    return template
  } catch (error) {
    console.error('❌ Failed to load email template:', error)
    throw new Error(`Failed to load email template: ${templateName}`)
  }
}

/**
 * Generate plain text version of magic link email
 */
export function getPlainTextVersion(magicLink: string): string {
  return `
¡Accede a tu cuenta en epàlwi-rèbbo!

Hola, hemos recibido una solicitud para acceder a tu cuenta.

Copia y pega este enlace en tu navegador para acceder:
${magicLink}

Este enlace es válido por 15 minutos.

Si no solicitaste este acceso, puedes ignorar este correo.

© 2025 epàlwi-rèbbo - Preservando el idioma Ndowe
  `.trim()
} 