# 0001-prd-trial-expiration-enforcement.md

# Product Requirements Document: Trial Expiration Enforcement

## Introduction/Overview

The epàlwi-rèbbo dictionary app currently offers a 14-day free trial but lacks proper enforcement mechanisms when trials expire. Users can continue accessing premium features indefinitely after trial expiration, undermining the freemium business model and reducing subscription conversion rates.

This feature implements comprehensive trial expiration enforcement to ensure users with expired trials cannot access premium features without subscribing, while providing a smooth upgrade path and clear user communication.

**Goal**: Transform the current "honor system" into proper subscription enforcement that protects revenue while maintaining excellent user experience.

## Goals

1. **Increase subscription conversion rates** by 15-25% within 3 months of implementation
2. **Eliminate unauthorized access** to premium features after trial expiration
3. **Maintain user satisfaction** by providing clear communication and graceful upgrade paths
4. **Protect offline functionality** as a premium feature requiring active subscription
5. **Establish foundation** for future premium feature rollouts

## User Stories

### Primary User Stories

**As a trial user with an active trial (days 1-14):**
- I want to access all dictionary features without restrictions
- I want to see clear information about my remaining trial days
- I want to be gently reminded about subscription options as trial nears end

**As a trial user with an expired trial (day 15+):**
- I want to understand clearly why I can no longer access certain features
- I want a simple, obvious path to subscribe and regain access
- I want to retain my search history and user data when I subscribe

**As a subscribed user:**
- I want uninterrupted access to all features
- I want confidence that my subscription provides exclusive value
- I want smooth experience even if subscription verification temporarily fails

**As a user with subscription verification issues:**
- I want the app to retry verification automatically
- I want clear error messages if verification permanently fails
- I want to contact support easily if I believe there's an error

### Edge Case User Stories

**As a user who lets trial expire during offline usage:**
- I want to understand trial status when I reconnect
- I want my offline data preserved for when I subscribe

**As a user transitioning from trial to paid:**
- I want immediate access to features after successful payment
- I want seamless continuation of my previous session

## Functional Requirements

### Core Protection Requirements

1. **API Protection**: Dictionary API (`/api/dictionary`) must validate subscription status before returning data
2. **Route Protection**: Dictionary page (`/dictionary`) must check subscription status and redirect expired users to plans page
3. **Component Protection**: Dictionary search components must display paywall overlay for expired users
4. **Offline Protection**: Block offline data downloads and cached searches for expired users

### Grace Period Implementation

5. **Grace Period Logic**: Provide 1-3 day grace period after trial expiration with persistent upgrade prompts
6. **Grace Period Messaging**: During grace period, show banner: "Trial expired X days ago - Subscribe now to maintain access"
7. **Grace Period Termination**: After grace period, immediately block access to protected features

### User Communication

8. **Trial Status Display**: Show remaining trial days prominently in navigation and dictionary pages
9. **Expiration Notifications**: Display warning notifications 3 days, 1 day, and on expiration day
10. **Paywall Component**: When access blocked, show clear paywall with subscription options and benefits
11. **Email Notifications**: Send email notification 1 day before trial expiration

### Error Handling & Reliability

12. **Subscription Verification**: Implement graceful fallback if subscription verification fails (allow access with retry)
13. **Offline Handling**: Detect when user goes offline during expired state and maintain restrictions
14. **Server-Side Validation**: All subscription checks must have server-side validation to prevent client-side bypass

### User Experience Requirements

15. **Immediate Enforcement**: Apply restrictions immediately on next app usage for existing expired users
16. **Data Preservation**: Maintain user search history and preferences through trial expiration
17. **Seamless Upgrade**: Provide instant access restoration upon successful subscription payment
18. **Clear CTAs**: All paywall screens must have prominent "Subscribe Now" buttons leading to plans page

## Non-Goals (Out of Scope)

- **Freemium Features**: No basic/limited features for expired users - this is a pure trial-to-paid model
- **Multiple Trial Extensions**: No additional trial periods or extensions
- **Partial Feature Access**: No feature degradation - access is either full (subscribed) or blocked (expired)
- **Social Features**: No sharing or referral features to extend trials
- **Custom Grace Periods**: Grace period is fixed at 1-3 days for all users
- **Grandfather Clauses**: No permanent free access for early users

## Design Considerations

### Paywall Component Design
- **Visual Priority**: High-contrast overlay that clearly communicates premium status
- **Brand Consistency**: Use existing design system components and colors
- **Mobile Optimization**: Ensure paywall works well on mobile devices
- **Accessibility**: Include proper ARIA labels and keyboard navigation

### Trial Banner Enhancement
- **Color Coding**: Green (7+ days) → Yellow (3-7 days) → Red (0-3 days) → Blocked (expired)
- **Positioning**: Sticky banner below navigation for visibility
- **Dismissal**: Allow dismissal but re-show daily during final 3 days

### Error State Design
- **User-Friendly Messages**: Avoid technical jargon in error messages
- **Support Contact**: Provide easy access to support for subscription issues
- **Retry Actions**: Clear buttons for retrying failed operations

## Technical Considerations

### Authentication Architecture
- **Server-Side Validation**: Use Firebase Admin SDK for secure subscription verification
- **Middleware Implementation**: Create Nuxt middleware for route-level protection
- **API Security**: Implement JWT token validation with subscription claims

### Performance Considerations
- **Caching Strategy**: Cache subscription status locally with TTL to reduce API calls
- **Loading States**: Show appropriate loading indicators during subscription verification
- **Offline Support**: Store last-known subscription status for offline scenarios

### Integration Points
- **Stripe Webhooks**: Ensure webhooks properly update subscription status in real-time
- **Firebase Integration**: Leverage existing Firebase user profiles for subscription data
- **PWA Compatibility**: Maintain offline functionality restrictions in service worker

### Development Phases
1. **Phase 1**: Authentication utilities and API protection
2. **Phase 2**: Middleware implementation and route protection  
3. **Phase 3**: Paywall components and user interface
4. **Phase 4**: Grace period logic and enhanced messaging
5. **Phase 5**: Testing, edge cases, and monitoring

## Success Metrics

### Primary Success Metrics
1. **Subscription Conversion Rate**: Increase from current baseline by 15-25%
2. **Unauthorized Access Reduction**: Achieve 0% dictionary access by expired trial users
3. **Paywall Engagement**: 60%+ of expired users click "Subscribe Now" button

### Secondary Success Metrics
4. **User Experience**: Maintain 4.5+ app store rating during rollout
5. **Support Tickets**: <5% increase in subscription-related support requests
6. **Revenue Impact**: 20%+ increase in monthly recurring revenue within 3 months

### Monitoring & Analytics
- **Conversion Funnel**: Track trial → expired → paywall view → subscription flow
- **Feature Usage**: Monitor dictionary search attempts by subscription status
- **Error Rates**: Track subscription verification failures and fallback usage
- **User Feedback**: Monitor app store reviews for subscription-related complaints

## Open Questions

1. **Regional Pricing**: Should paywall messaging adapt for different geographic regions?
2. **Student Discounts**: Future consideration for student verification and discounts?
3. **Family Plans**: Potential for shared subscriptions across family members?
4. **Refund Policy**: Clear policy for users who subscribe then immediately request refunds?
5. **Data Export**: Should expired users be able to export their search history?

## Implementation Timeline

- **Week 1**: Authentication utilities and API protection
- **Week 2**: Middleware and route protection implementation
- **Week 3**: Paywall components and UI development
- **Week 4**: Grace period logic and messaging enhancements
- **Week 5**: Testing, edge cases, and performance optimization
- **Week 6**: Deployment and monitoring setup

## Dependencies

- Existing Stripe subscription system must be fully functional
- Firebase Admin SDK access for server-side validation
- Email notification system (MailerSend) for trial expiration warnings
- Analytics tracking system for conversion metrics

---

**Document Version**: 1.0  
**Last Updated**: [Current Date]  
**Status**: Ready for Development