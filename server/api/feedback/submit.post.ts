import { defineEventHandler, readBody, getHeader } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    
    // Validate required fields
    if (!body.satisfaction || !body.feedback) {
      return {
        success: false,
        error: 'Satisfaction rating and feedback are required'
      }
    }

    // Get additional context
    const timestamp = body.timestamp || new Date().toISOString()
    const userAgent = body.userAgent || 'Unknown'
    const forwardedFor = getHeader(event, 'x-forwarded-for')
    const ip = typeof forwardedFor === 'string' ? forwardedFor.split(',')[0] : 'Unknown'

    // Prepare email content
    const satisfactionLabels: Record<string, string> = {
      '5': 'Muy satisfecho 😄',
      '4': 'Satisfecho 😊', 
      '3': 'Neutral 😐',
      '2': 'Insatisfecho 😕',
      '1': 'Muy insatisfecho 😞'
    }

    const emailContent = `
Nueva sugerencia recibida de epàlwi-rèbbo:

Satisfacción: ${satisfactionLabels[body.satisfaction as string] || body.satisfaction}
Fecha: ${new Date(timestamp).toLocaleString('es-ES')}
IP: ${ip}
User Agent: ${userAgent}

Comentarios:
${body.feedback}

---
Enviado desde el formulario de sugerencias de epàlwi-rèbbo
    `.trim()

    // TODO: Implement email sending logic here
    // This would typically use a service like Nodemailer, SendGrid, etc.
    // For now, we'll just log it and return success
    
    console.log('=== NUEVA SUGERENCIA ===')
    console.log(emailContent)
    console.log('========================')

    // In a real implementation, you would send the email here:
    // await sendEmail({
    //   to: 'your-email@example.com',
    //   subject: `Nueva sugerencia de epàlwi-rèbbo - ${satisfactionLabels[body.satisfaction]}`,
    //   text: emailContent
    // })

    return {
      success: true,
      message: 'Feedback submitted successfully'
    }

  } catch (error) {
    console.error('Error processing feedback:', error)
    
    return {
      success: false,
      error: 'Internal server error'
    }
  }
})
