# Task List: Magic Email UX Improvements

Based on PRD: `0004-prd-magic-email-ux-improvements.md`

## Relevant Files

- `pages/auth/login.vue` - Contains the existing magic link modal that needs spam reminder and resend functionality
- `pages/auth/login.test.vue` - Unit tests for the updated login page modal functionality
- `server/api/auth/send-magic-link.post.ts` - API endpoint that needs enhanced rate limiting and email template updates
- `server/api/auth/send-magic-link.post.test.ts` - Unit tests for enhanced API functionality
- `stores/auth.ts` - Auth store that may need updates for resend state management
- `stores/auth.test.ts` - Unit tests for auth store updates
- `components/auth/MagicLinkModal.vue` - New component for improved magic link modal (if extracted from login page)
- `components/auth/MagicLinkModal.test.vue` - Unit tests for the new modal component
- `types/auth.ts` - Type definitions that may need updates for resend functionality
- `public/logo.svg` - Logo file that needs to be integrated into email template
- `public/fonts/perfectly-nineties-regular-webfont.woff2` - Font file for email template typography

### Notes

- Unit tests should be placed alongside the code files they are testing
- The email template is currently inline within the `send-magic-link.post.ts` file
- Rate limiting logic already exists and needs to be enhanced, not rebuilt from scratch
- Design System V2 classes should be used for new modal components (`ds-btn-primary`, `ds-text-body`, etc.)

## Tasks

- [x] 1.0 Enhance Magic Link API with Improved Rate Limiting and Email Template
  - [x] 1.1 Update rate limiting configuration from 3 attempts/15min to 5 attempts/60min in `RATE_LIMIT` constant
  - [x] 1.2 Enhance rate limiting function to return current attempt count for UI display
  - [x] 1.3 Add proper error handling for rate limit exceeded scenarios with user-friendly messages
  - [x] 1.4 Update email template inline HTML to use new messaging: replace "Tu enlace seguro de acceso está listo" with "Un último paso y estas listo para encontrar la palabra que quieres"
  - [x] 1.5 Remove all emoji characters from email template (✨, ⏰, 🔐, etc.)
  - [x] 1.6 Test API endpoint with enhanced rate limiting using existing request patterns

- [x] 2.0 Update Magic Link Modal UI with Spam Reminder and Resend Functionality
  - [x] 2.1 Add spam folder reminder text to existing success modal in `login.vue`
  - [x] 2.2 Add "Resend Email" secondary button to modal using Design System V2 `ds-btn-secondary` class
  - [x] 2.3 Implement resend functionality that calls the same API endpoint with current email
  - [x] 2.4 Add email send count display (e.g., "Email sent (2/5)") below main message
  - [x] 2.5 Show success confirmation when email is successfully resent
  - [x] 2.6 Handle rate limiting errors with appropriate user feedback
  - [x] 2.7 Update modal styling to accommodate new elements while maintaining responsive design

- [ ] 3.0 Integrate Logo and Custom Typography into Email Template
  - [ ] 3.1 Replace current email header logo reference with `/public/logo.svg` content
  - [ ] 3.2 Convert SVG logo to inline format for email client compatibility
  - [ ] 3.3 Set appropriate logo sizing (max 200px width) and responsive behavior
  - [ ] 3.4 Integrate "Perfectly Nineties" font for headers (h1, h2) in email template
  - [ ] 3.5 Add fallback font stack: "Perfectly Nineties", "Georgia", "Times New Roman", serif
  - [ ] 3.6 Test font loading across major email clients (Gmail, Outlook, Apple Mail)
  - [ ] 3.7 Ensure logo alt text and accessibility compliance in email template

- [ ] 4.0 Add Resend State Management to Auth Store
  - [ ] 4.1 Add `emailSendCount` reactive state to track attempts for current email
  - [ ] 4.2 Add `isResending` loading state for resend operation feedback
  - [ ] 4.3 Create `resendMagicLink` action that calls send-magic-link API endpoint
  - [ ] 4.4 Update `sendMagicLink` action to initialize/increment send count
  - [ ] 4.5 Add computed property `canResend` that checks if under rate limit (< 5 attempts)
  - [ ] 4.6 Add method to reset email send count when email address changes
  - [ ] 4.7 Integrate error handling for resend operations with user-friendly messages

- [ ] 5.0 Implement Comprehensive Testing and Quality Assurance
  - [ ] 5.1 Write unit tests for updated rate limiting logic in `send-magic-link.post.test.ts`
  - [ ] 5.2 Write component tests for modal resend functionality in `login.test.vue`
  - [ ] 5.3 Write unit tests for auth store resend actions in `auth.test.ts`
  - [ ] 5.4 Test email template rendering with new logo and typography
  - [ ] 5.5 Cross-browser testing for modal functionality on desktop and mobile
  - [ ] 5.6 Email client compatibility testing (Gmail, Outlook, Apple Mail, Yahoo)
  - [ ] 5.7 User acceptance testing for complete magic link flow with new features
  - [ ] 5.8 Performance testing to ensure API response times remain under 2 seconds