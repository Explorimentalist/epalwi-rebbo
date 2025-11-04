# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

### Before starting work

  - Always in plan mode to make a plan.  

  - After getting the plan, make sure you *write the plan*.  
  - Save plans to `.claude/tasks/TASK_NAME.md`.

  - The plan should be a detailed implementation plan and the reasoning behind it, as well as tasks broken down.

  - If the task requires external knowledge or a certain package, research to get the latest knowledge (use Task tool for research).

  - Don’t over-plan it, always think **MVP**.  
 
  - Once you write the plan, ask me to review it. **Do not continue until I approve the plan.**

---

### While implementing
- You should update the plan as you work.  
- After completing tasks in the plan, update and append **detailed descriptions of the changes you made**, so following tasks can be easily handed over to other engineers.

## Project Overview

**epàlwi-rèbbo** is an offline-first Progressive Web App providing Spanish↔Ndowe dictionary functionality. It's a mobile-first bilingual dictionary targeting families and young learners for language preservation.

**Core Features:**
- Offline-first dictionary with IndexedDB caching
- Magic link authentication with 14-day free trial
- Stripe subscriptions (€1/month or €8.97/year)
- Google Sheets feedback integration
- Service worker for offline PWA functionality

## Common Development Commands

```bash
# Development
npm run dev                    # Start development server (http://localhost:3000)
npm run dev:https             # Start with HTTPS for PWA testing

# Building & Preview
npm run build                 # Build for production
npm run preview               # Preview production build

# Code Quality
npm run lint                  # Run ESLint
npm run lint:fix             # Auto-fix linting issues
npm run test:types           # TypeScript type checking
npm run test:types:watch     # Watch mode for type checking

# Component Development
npm run story:dev            # Start Histoire component storybook
npm run story:build          # Build storybook
npm run story:preview        # Preview built storybook

# Testing
npm run test:components      # Access component testing at /test/components
```

## Architecture Overview

### Tech Stack
- **Frontend**: Nuxt 3 + Vue 3 Composition API + TypeScript (strict mode)
- **Styling**: Tailwind CSS with custom design system + SCSS
- **PWA**: Vite PWA plugin with Workbox service worker
- **State**: Pinia stores with SSR-safe patterns
- **Backend**: Firebase (Functions, Firestore, Auth)
- **Payments**: Stripe with webhook integration
- **Email**: MailerSend for magic link authentication
- **Search**: Fuse.js with IndexedDB caching

### Key Configuration
- **SSR**: Disabled (`ssr: false`) for PWA optimization
- **TypeScript**: Strict mode enabled, type checking disabled during build for Phase 1
- **Icons**: Nuxt Icon with Heroicons, Lucide, and MDI collections
- **PWA Manifest**: Configured for standalone mobile app experience
- **Auto-imports**: Enabled for composables, components, and utilities

### Core Stores (Pinia)

#### Auth Store (`stores/auth.ts`)
- Manages Firebase authentication state
- Handles magic link send/verify flow
- Trial system (14 days) and subscription status tracking
- SSR-safe with separate serializable state and client-only Firebase objects

#### Key Patterns:
```typescript
// SSR-safe state separation
const user = ref<UserProfile | null>(null)          // Serializable
const firebaseUser = shallowRef<FirebaseUser | null>(null)  // Client-only

// Trial calculation
const isTrialActive = computed(() => {
  if (!user.value?.trial) return false
  return !user.value.trial.isExpired && user.value.trial.daysRemaining > 0
})
```

### Authentication Flow
1. **Magic Link Send**: POST `/api/auth/send-magic-link` → MailerSend email
2. **Magic Link Verify**: POST `/api/auth/verify-magic-link` → JWT verification → Firebase custom token
3. **Firebase Auth**: Auto-triggered by custom token → Firestore user profile creation/update

### API Routes Structure
```
server/api/
├── auth/
│   ├── send-magic-link.post.ts     # MailerSend magic link
│   └── verify-magic-link.post.ts   # JWT verification + Firebase auth
├── stripe/
│   ├── create-checkout-session.post.ts  # Stripe subscription flow
│   └── webhook.post.ts             # Stripe webhook handler
├── feedback/
│   └── submit.post.ts              # Google Sheets integration
├── dictionary.get.ts               # Dictionary data endpoint
└── dictionary-test.get.ts          # Test dictionary endpoint
```

### Design System Implementation

The project uses a dual design system approach:

#### Legacy System (existing components)
- 8px base unit spacing system
- Custom color palette with CSS variables
- Geist font family

#### Design System V2 (new components)
- OKLCH-based semantic color system with CSS variables
- Modern spacing scale with rem units
- Premium font stack (Geist, Inter fallbacks)
- Webflow-inspired typography scale

**Important**: When working on existing components, use legacy classes. For new components, prefer Design System V2 (`ds-*` prefixed classes).

### Environment Variables

Required environment variables (see `ENV_SETUP_GUIDE.md` for detailed setup):

```env
# Firebase
NUXT_PUBLIC_FIREBASE_API_KEY
NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN  
NUXT_PUBLIC_FIREBASE_PROJECT_ID

# Stripe
NUXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET

# MailerSend
MAILERSEND_API_KEY

# Google Sheets
GOOGLE_SHEETS_API_KEY
```

### Development Workflow

1. **Always use `npm run dev`** for development (not Firebase hosting/emulator)
2. **Type Safety**: Run `npm run test:types` before committing
3. **Component Testing**: Use `/test/components` page or Histoire storybook
4. **Offline Testing**: Use `npm run dev:https` and Chrome DevTools offline mode
5. **Code Quality**: Auto-fix with `npm run lint:fix`

### Important Patterns

#### SSR-Safe Pinia Stores
- Use `ref()` for serializable state, `shallowRef()` for client-only objects
- Separate Firebase objects from serializable user data
- Initialize client-side auth listeners only on client

#### PWA Considerations  
- Service worker caches dictionary data and API responses
- IndexedDB for offline dictionary storage
- Handle online/offline state transitions gracefully

#### Type Safety
- Strict TypeScript configuration
- Comprehensive type definitions in `types/` directory
- Use discriminated unions for complex states

### Subscription Model
- **Free Trial**: 14 days for all new users
- **Paid Plans**: €1/month or €8.97/year
- **Stripe Integration**: Checkout Sessions (not custom payment forms)
- **Webhook Handling**: Real-time subscription status updates

### Key Files to Understand

- `nuxt.config.ts` - Core Nuxt configuration with PWA, auth, and build settings
- `stores/auth.ts` - Authentication state management and magic link flow  
- `tailwind.config.js` - Design system implementation and utility classes
- `development-plan.md` - Comprehensive project roadmap and implementation details
- `.cursorrules` - Detailed coding standards and project guidelines

## Important Coding Standards

### TypeScript Best Practices
- Use strict TypeScript configuration
- Prefer `type` over `interface` for simple types
- Use `const` objects instead of enums
- Define return types for all functions
- Use discriminated unions for complex states

### Vue 3 Composition API
- Use `<script setup>` syntax
- Prefer `ref` for primitives, `reactive` for objects
- Create custom composables for reusable logic
- Use `defineProps` and `defineEmits` with TypeScript
- Implement proper error boundaries

### PWA Requirements
- Ensure offline functionality for core features
- Implement proper service worker caching
- Handle network state changes gracefully
- Provide offline indicators to users
- Cache dictionary data efficiently

### Security Considerations
- Validate all inputs on both client and server
- Use HTTPS for all external requests
- Implement proper CORS policies
- Secure environment variables properly
- Use Content Security Policy for PWA
- Implement proper authentication flows
- Validate subscription states server-side
- Sanitize user feedback before storing

### Error Fixing Process
1. **Identify the Problem**: Read error messages, check browser console, review Firebase logs, examine service worker cache status
2. **Analyze Dependencies**: Map all affected files/functions, check for circular dependencies, verify import/export chains
3. **Simulate and Test**: Create minimal reproduction case, test across browsers/devices, verify offline functionality
4. **Implement Fix**: Make targeted changes preserving existing functionality, add error handling and TypeScript types
5. **Validate Solution**: Run all tests, test offline scenarios, verify PWA functionality, check performance impact

### Performance Best Practices
- Implement lazy loading for components
- Use Vue 3 Suspense for async components
- Optimize images (WebP, lazy loading)
- Minimize bundle size with tree shaking
- Monitor Core Web Vitals

# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.
- When we talk about cosmetic design changes please make sure you check the design system v2 instead of making assumptions