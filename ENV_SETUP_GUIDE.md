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

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. For HTTPS (needed for PWA testing):
```bash
npm run dev:https
```

## Production Environment

Create a separate `.env.production` file with production values:
- Use live Stripe keys (pk_live_*, sk_live_*)
- Use production Firebase project
- Set proper domain URLs
- Use production MailerSend domain

## Security Notes

- Never commit `.env` files to version control
- Use different keys for development and production
- Rotate keys regularly
- Monitor usage in respective dashboards
- Set up proper CORS policies for production

## Troubleshooting

### Common Issues:

1. **Firebase Auth Domain Error**
   - Make sure auth domain matches your project ID
   - Check if Firebase Auth is enabled

2. **Stripe Webhook Not Working**
   - Verify webhook URL is accessible
   - Check webhook secret matches
   - Ensure proper event types are selected

3. **MailerSend Not Sending**
   - Verify domain is authenticated
   - Check API key permissions
   - Ensure template IDs are correct

4. **Google Sheets Access Denied**
   - Verify API key has Sheets API access
   - Check sheet sharing permissions
   - Ensure Sheet ID is correct

## Next Steps

Once all environment variables are set up:

1. Test authentication flow
2. Test Stripe integration in test mode
3. Verify MailerSend email delivery
4. Test Google Sheets feedback submission
5. Run development server and check console for errors

## Support

If you encounter issues:
1. Check the respective service dashboards for errors
2. Review Firebase Console logs
3. Check browser console for client-side errors
4. Verify all services are properly configured 