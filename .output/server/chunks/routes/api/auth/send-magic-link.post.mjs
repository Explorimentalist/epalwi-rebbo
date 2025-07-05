import { d as defineEventHandler, a as assertMethod, r as readBody, c as createError, g as getHeader, u as useRuntimeConfig } from '../../../nitro/nitro.mjs';
import jwt from 'jsonwebtoken';
import { MailerSend, Sender, Recipient, EmailParams } from 'mailersend';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'firebase-functions';

const rateLimitStore = /* @__PURE__ */ new Map();
const RATE_LIMIT = {
  maxAttempts: 3,
  windowMs: 15 * 60 * 1e3
  // 15 minutes
};
function isRateLimited(email) {
  const now = Date.now();
  const userLimit = rateLimitStore.get(email);
  if (!userLimit) {
    rateLimitStore.set(email, { count: 1, resetTime: now + RATE_LIMIT.windowMs });
    return false;
  }
  if (now > userLimit.resetTime) {
    rateLimitStore.set(email, { count: 1, resetTime: now + RATE_LIMIT.windowMs });
    return false;
  }
  if (userLimit.count >= RATE_LIMIT.maxAttempts) {
    return true;
  }
  userLimit.count++;
  return false;
}
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
function generateMagicLinkToken(email) {
  const config = useRuntimeConfig();
  if (!config.mailersendApiKey) {
    throw new Error("JWT secret not configured");
  }
  const payload = {
    email,
    iat: Math.floor(Date.now() / 1e3),
    exp: Math.floor(Date.now() / 1e3) + 15 * 60,
    // 15 minutes
    iss: "epalwi-rebbo",
    aud: "epalwi-rebbo-users"
  };
  return jwt.sign(payload, config.mailersendApiKey, { algorithm: "HS256" });
}
async function sendMagicLinkEmail(email, token, redirectUrl) {
  const config = useRuntimeConfig();
  if (!config.mailersendApiKey) {
    throw new Error("MailerSend API key not configured");
  }
  const mailerSend = new MailerSend({
    apiKey: config.mailersendApiKey
  });
  const magicLink = `${redirectUrl}?token=${token}`;
  const sentFrom = new Sender("noreply@epalwi-rebbo.com", "ep\xE0lwi-r\xE8bbo");
  const recipients = [new Recipient(email, email)];
  const emailParams = new EmailParams().setFrom(sentFrom).setTo(recipients).setSubject("Tu enlace de acceso - ep\xE0lwi-r\xE8bbo").setHtml(`
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
              <h1 style="color: #FFFFFF; margin: 0; font-size: 28px; font-weight: bold;">ep\xE0lwi-r\xE8bbo</h1>
              <p style="color: #FFFFFF; margin: 8px 0 0 0; opacity: 0.9;">Diccionario Espa\xF1ol \u2194 Ndowe</p>
            </div>
            <div style="padding: 32px;">
              <h2 style="color: #333333; margin: 0 0 16px 0; font-size: 24px;">\xA1Accede a tu cuenta!</h2>
              <p style="color: #666666; margin: 0 0 24px 0; line-height: 1.5;">
                Hola, hemos recibido una solicitud para acceder a tu cuenta en ep\xE0lwi-r\xE8bbo. 
                Haz clic en el bot\xF3n de abajo para acceder:
              </p>
              <div style="text-align: center; margin: 32px 0;">
                <a href="${magicLink}" style="display: inline-block; background-color: #D45B41; color: #FFFFFF; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: bold; font-size: 16px;">
                  Acceder a mi cuenta
                </a>
              </div>
              <p style="color: #999999; margin: 24px 0 0 0; font-size: 14px; line-height: 1.5;">
                Este enlace es v\xE1lido por 15 minutos. Si no solicitaste este acceso, puedes ignorar este correo.
              </p>
              <div style="border-top: 1px solid #E0E0E0; margin: 24px 0 0 0; padding: 16px 0 0 0;">
                <p style="color: #999999; margin: 0; font-size: 12px;">
                  \xA9 2024 ep\xE0lwi-r\xE8bbo - Preservando el idioma Ndowe
                </p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `).setText(`
      \xA1Accede a tu cuenta en ep\xE0lwi-r\xE8bbo!
      
      Hola, hemos recibido una solicitud para acceder a tu cuenta.
      
      Copia y pega este enlace en tu navegador para acceder:
      ${magicLink}
      
      Este enlace es v\xE1lido por 15 minutos.
      
      Si no solicitaste este acceso, puedes ignorar este correo.
      
      \xA9 2024 ep\xE0lwi-r\xE8bbo - Preservando el idioma Ndowe
    `);
  try {
    await mailerSend.email.send(emailParams);
    console.log(`\u2705 Magic link sent to ${email}`);
  } catch (error) {
    console.error("\u274C Failed to send magic link email:", error);
    throw new Error("Failed to send email");
  }
}
const sendMagicLink_post = defineEventHandler(async (event) => {
  try {
    assertMethod(event, "POST");
    const body = await readBody(event);
    if (!body || !body.email) {
      throw createError({
        statusCode: 400,
        statusMessage: "Email is required"
      });
    }
    const { email, redirectUrl = `${getHeader(event, "origin") || "http://localhost:3000"}/auth/verify` } = body;
    if (!isValidEmail(email)) {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid email format"
      });
    }
    if (isRateLimited(email)) {
      throw createError({
        statusCode: 429,
        statusMessage: "Too many requests. Please try again in 15 minutes."
      });
    }
    const token = generateMagicLinkToken(email);
    await sendMagicLinkEmail(email, token, redirectUrl);
    return {
      success: true,
      message: "Enlace de acceso enviado. Revisa tu correo electr\xF3nico."
    };
  } catch (error) {
    console.error("\u274C Send magic link error:", error);
    if (error.statusCode) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to send magic link"
    });
  }
});

export { sendMagicLink_post as default };
//# sourceMappingURL=send-magic-link.post.mjs.map
