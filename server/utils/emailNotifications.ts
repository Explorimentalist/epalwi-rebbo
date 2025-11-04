import { loadEmailTemplate } from './email-templates'

// Lazy import to avoid hard dependency when not configured
let MailerSend: any, EmailParams: any, Sender: any, Recipient: any
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const mod = require('mailersend')
  MailerSend = mod.MailerSend
  EmailParams = mod.EmailParams
  Sender = mod.Sender
  Recipient = mod.Recipient
} catch {
  // mailersend not installed or not available in the environment
}

export interface TrialReminderContext {
  email: string
  displayName?: string
  trialEndDate: Date
}

function daysUntil(date: Date, now = new Date()): number {
  const msPerDay = 24 * 60 * 60 * 1000
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  const end = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
  return Math.ceil((end.getTime() - start.getTime()) / msPerDay)
}

export function shouldSendTrialReminder(trialEndDate: Date, now = new Date()): boolean {
  return daysUntil(trialEndDate, now) === 1
}

export async function sendTrialExpirationReminder(
  ctx: TrialReminderContext,
  now: Date = new Date()
): Promise<{ sent: boolean; skippedReason?: string }> {
  if (!shouldSendTrialReminder(ctx.trialEndDate, now)) {
    return { sent: false, skippedReason: 'not_due' }
  }

  const apiKey = process.env['MAILERSEND_API_KEY']
  const fromEmail = process.env['MAILERSEND_FROM_EMAIL'] || 'no-reply@epalwi.app'
  const fromName = process.env['MAILERSEND_FROM_NAME'] || 'epàlwi-rèbbo'
  const appUrl = process.env['NUXT_PUBLIC_APP_URL'] || 'http://localhost:4000'

  if (!apiKey || !MailerSend) {
    console.log('[email] Skipping MailerSend send (missing API key or library).')
    return { sent: false, skippedReason: 'missing_mailer' }
  }

  const plansUrl = `${appUrl}/subscription/plans?source=trial-reminder`
  const subject = 'Tu prueba expira mañana — epàlwi-rèbbo'
  const html = await buildTrialReminderHtml(ctx.email, ctx.displayName, plansUrl)
  const text = buildTrialReminderText(plansUrl)

  const mailerSend = new MailerSend({ apiKey })
  const sentFrom = new Sender(fromEmail, fromName)
  const recipients = [new Recipient(ctx.email, ctx.displayName || ctx.email)]

  const emailParams = new EmailParams()
    .setFrom(sentFrom)
    .setTo(recipients)
    .setSubject(subject)
    .setHtml(html)
    .setText(text)

  await mailerSend.email.send(emailParams)
  return { sent: true }
}

async function buildTrialReminderHtml(email: string, name: string | undefined, plansUrl: string): Promise<string> {
  try {
    // Try to load a custom template if present
    return await loadEmailTemplate('trial-expiration', {
      USER_EMAIL: email,
      USER_NAME: name || '',
      PLANS_URL: plansUrl
    })
  } catch {
    // Fallback minimal HTML
    return `
      <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif">
        <h2>Tu prueba expira mañana</h2>
        <p>Hola ${name || ''}, tu periodo de prueba de epàlwi-rèbbo finaliza mañana.</p>
        <p>
          <a href="${plansUrl}" style="display:inline-block;padding:10px 14px;border-radius:8px;background:#D45B41;color:white;text-decoration:none">
            Suscribirse ahora
          </a>
        </p>
        <p>Gracias por apoyar la preservación del idioma Ndowe.</p>
      </div>
    `
  }
}

function buildTrialReminderText(plansUrl: string): string {
  return `Tu prueba expira mañana. Suscríbete para continuar: ${plansUrl}`
}

