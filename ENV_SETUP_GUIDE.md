# Environment Setup Guide for epàlwi-rèbbo

## Quick Setup

1. Copy the template below into a new file called `.env` in your project root
2. Replace all placeholder values with your actual keys
3. Never commit this file to version control

## Environment Variables Template

Create a `.env` file in your project root with the following content:

```env
# Firebase Configuration
# Get these from Firebase Console > Project Settings > General > Your apps > Web app
NUXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key_here
NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NUXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NUXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id

# Stripe Configuration
# Get these from Stripe Dashboard > Developers > API keys
NUXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret_here

# MailerSend Configuration
# Get this from MailerSend Dashboard > API Tokens
MAILERSEND_API_KEY=your_mailersend_api_key_here

# Google Sheets API
# Get this from Google Cloud Console > APIs & Services > Credentials
GOOGLE_SHEETS_API_KEY=your_google_sheets_api_key_here

# Application Configuration
NUXT_PUBLIC_APP_URL=http://localhost:3000

# Development Environment
NODE_ENV=development
NUXT_DEBUG=true
```

## User Preferences (Default Language + Notifications)

The app persists a small set of user preferences in Firestore and caches them locally for offline/guest use.

- Firestore document: `users/{uid}`
  - `preferences` (object)
    - `defaultLanguage`: `'español' | 'ndowe'` (default `'español'`)
    - `notifications` (object)
      - `productUpdates`: boolean (default `false`)
      - `languageTips`: boolean (default `false`)
  - `preferencesUpdatedAt`: server timestamp used for last‑write‑wins across devices.

Behavior
- When signed in: preferences are loaded from local cache first, then merged with Firestore (newer `preferencesUpdatedAt` wins) and re‑cached.
- Guests: preferences are stored in IndexedDB under a `guest` key. On sign‑in, guest prefs are merged into the user document using last‑write‑wins, then the guest cache is cleared.
- Offline: preference changes apply locally (optimistic) and are queued to update Firestore when connectivity returns.

No themes
- Dark mode or themes are out of scope. Only default language and notifications are stored as preferences.

## How to Obtain Each Key

### 1. Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing project
3. Go to **Project Settings** (gear icon)
4. Scroll down to **Your apps** section
5. Click **Add app** and choose **Web** (if not already created)
6. Copy the config values from the Firebase SDK snippet

**Services to Enable:**
- Authentication (for magic links)
- Firestore (for user data)
- Functions (for server-side logic)
- Hosting (for deployment)

### 2. Stripe Configuration

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Create account if needed
3. Go to **Developers** → **API keys**
4. Copy your **Publishable key** and **Secret key**
5. For webhook secret:
   - Go to **Developers** → **Webhooks**
   - Click **Add endpoint**
   - Add endpoint URL: `https://your-domain.com/api/stripe/webhook`
   - Select events: `customer.subscription.*`
   - Copy the **Signing secret**

**Test Mode vs Live Mode:**
- Use test keys (pk_test_* and sk_test_*) for development
- Switch to live keys for production

### 3. MailerSend Configuration

1. Go to [MailerSend](https://www.mailersend.com/)
2. Create account and verify domain
3. Go to **API Tokens** in dashboard
4. Create new token with **Full access**
5. Copy the API key

**Domain Setup:**
- Add your domain (e.g., epalwi-rebbo.com)
- Verify DNS records
- Create email templates for magic links

### 4. Google Sheets API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing
3. Enable **Google Sheets API**
4. Go to **APIs & Services** → **Credentials**
5. Create **API Key**
6. Restrict the key to Google Sheets API only

**Sheet Setup:**
- Create a Google Sheet for feedback collection
- Share with service account email
- Note the Sheet ID from the URL

### 5. Additional Firebase Functions Environment

For Firebase Functions, you'll also need to set environment variables:

```bash
# Navigate to functions directory
cd firebase/functions

# Set environment variables for functions
firebase functions:config:set \
  mailersend.api_key="your_mailersend_api_key" \
  stripe.secret_key="your_stripe_secret_key" \
  stripe.webhook_secret="your_stripe_webhook_secret" \
  google.sheets_api_key="your_google_sheets_api_key"
```

## Development Environment Setup

### Enable Firebase Auth Email Link (Production)

1. In Firebase Console → Authentication → Sign-in method, enable "Email link (passwordless)".
2. Add your authorized domains (localhost for dev, your production host).
3. In `nuxt.config.ts`, ensure `runtimeConfig.public.appUrl` points to your site base URL (e.g., `https://yourdomain.com`).
4. For development, `NUXT_PUBLIC_DEV_AUTH_MOCK=true` uses the existing mock flow. Set it to `false` in production to use Firebase Email Link.

### Verification Checklist

- Send link: `/auth/login` sends Email Link and stores `emailForSignIn` locally.
- Cross-device: Opening the link on a different device prompts for email, then signs in.
- Invalid/expired: Verify page shows error and link back to login.
- Redirect: After success, redirect honors `return=` if present; otherwise to `/dictionary`.
- Preferences: Default language initializes dictionary; changes persist across sessions.
- History: Search history merges across devices (last-write-wins) and caps at 50 items.

### ⚠️ IMPORTANT: Development vs Production Workflow

**For Development (localhost):**
```bash
# 1. Start the Nuxt development server
npm run dev

# 2. Open your browser to:
http://localhost:3000

# ✅ This serves your actual Nuxt application
# ❌ Do NOT use Firebase hosting/emulator for development
```

**For Production Deployment:**
```bash
# 1. Install dependencies and build
npm ci && npm run build

# 2. Deploy to Firebase
firebase deploy

# 3. Access your production site at:
# https://your-project-id.web.app
```

### Common Issues and Solutions

#### Issue: Seeing Firebase Welcome Page
- **Cause**: Wrong firebase.json configuration or Firebase emulator running
- **Solution**: 
  1. Use `npm run dev` for development (not Firebase hosting)
  2. Ensure firebase.json points to `.output/public` for production builds
  3. Kill any stray Firebase processes: `pkill -f firebase`

#### Issue: Port Conflicts
- **Cause**: Multiple development servers running
- **Solution**:
  ```bash
  # Kill all node processes
  pkill -f "nuxt dev"
  
  # Start fresh
  npm run dev
  ```

#### Issue: Wrong Port in Browser
- **Development**: Always use `http://localhost:4000`
- **Production**: Use your Firebase hosting URL

1. Install dependencies:
```
