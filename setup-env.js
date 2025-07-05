#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 Setting up environment variables for epàlwi-rèbbo...\n');

const envTemplate = `# Firebase Configuration
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
`;

const envPath = path.join(__dirname, '.env');

try {
  if (fs.existsSync(envPath)) {
    console.log('⚠️  .env file already exists!');
    console.log('   Creating .env.example instead...');
    
    fs.writeFileSync(path.join(__dirname, '.env.example'), envTemplate);
    console.log('✅ .env.example file created successfully!');
    console.log('   Copy it to .env and replace the placeholder values.');
  } else {
    fs.writeFileSync(envPath, envTemplate);
    console.log('✅ .env file created successfully!');
    console.log('   Remember to replace all placeholder values with your actual keys.');
  }
  
  console.log('\n📋 Next steps:');
  console.log('1. Follow the ENV_SETUP_GUIDE.md for obtaining API keys');
  console.log('2. Replace all placeholder values in your .env file');
  console.log('3. Run "npm run dev" to start development server');
  console.log('\n🔗 Useful links:');
  console.log('- Firebase Console: https://console.firebase.google.com/');
  console.log('- Stripe Dashboard: https://dashboard.stripe.com/');
  console.log('- MailerSend: https://www.mailersend.com/');
  console.log('- Google Cloud Console: https://console.cloud.google.com/');
  
} catch (error) {
  console.error('❌ Error creating .env file:', error.message);
  process.exit(1);
} 