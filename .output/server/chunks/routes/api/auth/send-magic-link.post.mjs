import { d as defineEventHandler, a as assertMethod, r as readBody, c as createError, g as getHeader, u as useRuntimeConfig } from '../../../nitro/nitro.mjs';
import jwt from 'jsonwebtoken';
import { MailerSend, Sender, Recipient, EmailParams } from 'mailersend';
import 'fs/promises';
import 'path';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import '@iconify/utils';
import 'consola';
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
  const sentFrom = new Sender("noreply@test-eqvygm0jevwl0p7w.mlsender.net", "ep\xE0lwi-r\xE8bbo");
  const recipients = [new Recipient(email, email)];
  const { loadEmailTemplate, getPlainTextVersion } = await import('../../../nitro/nitro.mjs').then(function (n) { return n.J; });
  const htmlTemplate = await loadEmailTemplate("magic-link", {
    MAGIC_LINK: magicLink,
    USER_EMAIL: email
  });
  const emailParams = new EmailParams().setFrom(sentFrom).setTo(recipients).setSubject("Tu enlace de acceso - ep\xE0lwi-r\xE8bbo").setHtml(htmlTemplate).setText(getPlainTextVersion(magicLink));
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
