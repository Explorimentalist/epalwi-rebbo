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
epàlwi-rèbbo - Tu diccionario Español ↔ Ndowe
====================================================

¡BIENVENIDO DE VUELTA!
Tu enlace seguro de acceso está listo

🔐 ACCESO SEGURO
Este enlace mágico te permite acceder sin contraseña. Solo tú puedes 
usarlo y expira en 15 minutos por tu seguridad.

Hemos recibido una solicitud para acceder a tu cuenta en epàlwi-rèbbo.

ACCEDER A MI CUENTA:
${magicLink}

PRUEBA GRATUITA ACTIVA
Tienes acceso completo a todas las funciones durante tu período de 
prueba. ¡Explora el diccionario y descubre la riqueza del idioma Ndowe!

INFORMACIÓN IMPORTANTE:
⏰ Este enlace expira en 15 minutos por tu seguridad.
🛡️ Si no solicitaste este acceso, puedes ignorar este correo de forma 
    segura. Tu cuenta permanece protegida.

====================================================
© 2025 epàlwi-rèbbo
Preservando y digitalizando el patrimonio lingüístico Ndowe 
para las futuras generaciones
  `.trim()
} 