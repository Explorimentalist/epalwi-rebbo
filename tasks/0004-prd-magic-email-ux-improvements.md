# PRD: Magic Email UX Improvements

## Introduction/Overview

This feature improves the magic link email authentication flow by addressing common user pain points related to email delivery and visual consistency. The current implementation lacks guidance for users when emails go to spam folders and doesn't provide an easy way to resend emails. Additionally, the email template needs visual updates to match the app's branding and improve user messaging.

**Goal:** Enhance the magic link email user experience by adding spam awareness guidance, immediate resend capability, and improved email template design to reduce user friction and increase successful authentication completion rates.

## Goals

1. **Reduce Email Delivery Issues**: Help users find magic link emails when they land in spam folders
2. **Enable Self-Service Recovery**: Allow users to immediately resend magic links without support intervention
3. **Improve Brand Consistency**: Update email template to use consistent logo and typography from the main app
4. **Enhance User Messaging**: Provide clearer, more encouraging messaging throughout the email flow
5. **Increase Authentication Success Rate**: Reduce dropoff between email send and successful login

## User Stories

### Primary User Story
**As a new user attempting to log in**, I want clear guidance on where to find my magic link email and the ability to resend it immediately, so that I can complete my authentication quickly without getting stuck or needing support.

### Supporting User Stories
- **As a user waiting for my magic link email**, I want to be reminded to check my spam folder, so that I don't assume the email failed to send
- **As a user who hasn't received my email**, I want to be able to request a new one immediately, so that I don't have to wait or start the process over
- **As a user receiving the magic link email**, I want it to look professional and consistent with the app I'm trying to access, so that I trust it's legitimate
- **As a user reading the magic link email**, I want clear, encouraging messaging that makes me feel close to completing my goal, so that I'm motivated to click through

## Functional Requirements

### Magic Email Send Modal Improvements
#### Magic Email Send Modal Improvements
1. The modal MUST display a prominent reminder to check spam/junk folders immediately when shown.
2. The modal MUST include a "Resend Email" button that is available immediately (not after a delay).
3. The "Resend Email" button MUST generate a new magic link for the same email address.
4. The modal MUST show a confirmation message when an email is successfully resent.
5. The modal MUST use the existing Design System V2 styling for consistency.
6. The modal MUST track and display the number of emails sent (e.g., "Email sent (2/5)" to show limits).
7. The modal MUST not use emoji characters in any UI elements.

#### Magic Email Template Improvements
8. The email template MUST replace the current logo with the logo used in the navigation bar (`/public/logo.svg`).
9. The email template MUST use the "Perfectly Nineties" font (available in `/public/fonts/`) for headers and titles only.
10. The email template MUST replace "Tu enlace seguro de acceso está listo" with "Un último paso y estas listo para encontrar la palabra que quieres".
11. The email template MUST remove all emoji characters from the button text and other UI elements.
12. The email template MUST maintain the existing Spanish language throughout.
13. The email template MUST preserve the current responsive design for mobile devices.

#### Technical Requirements
14. The resend functionality MUST use the same API endpoint (`/api/auth/send-magic-link`) with the same email address.
15. The system MUST prevent spam by limiting resend attempts (maximum 5 per email address per hour).
16. The email template MUST continue to work with the current Resend email service integration.
17. Font loading MUST be handled appropriately for email clients (with fallbacks).

## Non-Goals (Out of Scope)

- **Email Provider Integration**: Not implementing direct integration with Gmail, Outlook, etc. to move emails out of spam
- **Email Address Validation**: Not adding real-time email validation or suggestions for typos
- **Alternative Authentication Methods**: Not adding SMS, phone, or social login options
- **Email Customization**: Not allowing users to customize email templates or frequency preferences
- **Advanced Analytics**: Not implementing detailed email open/click tracking beyond basic success metrics
- **Multi-language Support**: Keeping Spanish-only for this iteration (no i18n)

## Design Considerations

### Modal Design
- **Visual Hierarchy**: Spam reminder should be prominent but not alarming (use info styling, not warning)
- **Button Placement**: Resend button should be secondary to the main "Entendido" action
- **Progress Indication**: Show email send count to build confidence and set expectations
- **Responsive**: Must work on mobile devices where users often check email

### Email Template Design
- **Logo Integration**: Use SVG logo with appropriate sizing for email (max 200px width)
- **Typography**: Apply "Perfectly Nineties" only to headers (`h1`, `h2`) with web-safe fallbacks
- **Color Consistency**: Maintain the existing brand color palette (`#D45B41` primary)
- **Accessibility**: Ensure sufficient contrast ratios and alt text for images

## Technical Considerations

### Font Loading Strategy
- **Email Client Compatibility**: Use progressive enhancement - custom font with fallback to system fonts
- **Font Format**: Use web fonts (WOFF2/WOFF) with appropriate MIME types for email
- **Fallback Stack**: `"Perfectly Nineties", "Georgia", "Times New Roman", serif`

### Rate Limiting
- **Implementation**: Extend existing rate limiting logic in `send-magic-link.post.ts`
- **Storage**: Use the same in-memory storage pattern (Redis in production)
- **User Feedback**: Clear error messages when rate limits are exceeded

### Existing Integration Points
- **Auth Store**: Update to handle resend state and attempt counting
- **Modal Component**: Extend existing Modal.vue component for new functionality
- **Email Service**: Build on current Resend integration without changes to delivery infrastructure

## Success Metrics

### Primary Metrics
1. **Reduced Support Tickets**: 40% reduction in tickets related to "missing magic link emails"
2. **Higher Click-Through Rate**: 25% increase in magic link email clicks within 15 minutes of sending
3. **Faster Authentication**: 30% reduction in average time from email request to successful login
4. **Lower Dropout Rate**: 20% decrease in users who request magic links but never complete authentication

### Secondary Metrics
- **Resend Usage**: Track percentage of users who use the resend functionality
- **Email Client Data**: Monitor which email providers/clients have highest success rates
- **User Satisfaction**: Qualitative feedback through user testing or feedback forms

### Technical Metrics
- **API Performance**: Maintain <2s response time for resend requests
- **Email Deliverability**: Monitor bounce rates and spam folder placement
- **Rate Limit Effectiveness**: Ensure minimal false positives while preventing abuse

## Open Questions

1. **Font Licensing**: Confirm that "Perfectly Nineties" font license allows use in email templates
2. **Email Client Testing**: Which email clients should be prioritized for testing? (Gmail, Outlook, Apple Mail)
3. **Rate Limit Boundaries**: Should the 5 emails per hour limit be configurable by environment?
4. **Analytics Integration**: Do we need to integrate with existing analytics tools for email tracking?
5. **Accessibility Testing**: What level of email accessibility testing is required for this feature?
6. **Logo Variants**: Does the current logo work well at email sizes, or do we need a simplified version?

## Implementation Notes

### File Locations
- **Modal Updates**: `/components/auth/` (create new component or extend existing)
- **Email Template**: `/server/api/auth/send-magic-link.post.ts`
- **Font Assets**: `/public/fonts/perfectly-nineties-regular-webfont.woff2`
- **Logo Asset**: `/public/logo.svg`

### Testing Strategy
- **Component Testing**: Modal functionality and resend behavior
- **Integration Testing**: Email template rendering and delivery
- **Cross-browser Testing**: Email client compatibility
- **User Testing**: Usability testing with real users experiencing email delivery issues