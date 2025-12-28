# 🗄️ Database Setup Guide

This guide will help you set up PostgreSQL for your epàlwi-rèbbo app to fix the magic link verification error.

## 🚀 Quick Setup (Recommended)

### Step 1: Login to Vercel and Create Database

```bash
cd /Users/ngatyebrianoko/Documents/Design\ Projects/Explorimentalist/GPT_apps/epàlwi-rèbbo

# Login to Vercel (opens browser)
vercel login

# Create Vercel Postgres database
vercel storage create postgres
```

**When prompted:**
- Choose your existing project: `epàlwi-rèbbo-b5kwu3iy1-explorimentalists-projects.vercel.app`
- Name your database: `epalwi-rebbo-db`
- Select region: Choose closest to your users

### Step 2: Get Database Connection String

After creating the database, Vercel will show you the connection details. Copy the `DATABASE_URL`.

### Step 3: Add Environment Variable

```bash
# Add DATABASE_URL to Vercel environment
vercel env add DATABASE_URL

# When prompted, paste your database connection string
# Example: postgresql://username:password@host:port/database?sslmode=require
```

### Step 4: Set Up Database Schema

```bash
# Set the DATABASE_URL locally for schema setup
export DATABASE_URL="your_database_url_from_step_2"

# Run the database setup script
node scripts/setup-database.js
```

### Step 5: Deploy with Database

```bash
# Deploy to production with the new database
vercel --prod
```

### Step 6: Test Magic Link

- Go to your app
- Try to login with magic link
- Verify that the 500 error is fixed

## 🔧 Alternative: Manual Setup

If you prefer to use a different PostgreSQL provider:

### Option A: Supabase (Free Tier)

1. Go to https://supabase.com
2. Create new project
3. Go to Settings > Database
4. Copy connection string
5. Add to Vercel: `vercel env add DATABASE_URL`

### Option B: Railway (Free Tier)

1. Go to https://railway.app
2. Create PostgreSQL database
3. Copy connection string
4. Add to Vercel: `vercel env add DATABASE_URL`

### Option C: PlanetScale/Neon

Similar process - create database, get connection string, add to Vercel.

## 🛠️ Database Schema

The schema includes:
- ✅ **users** - User profiles with email, role, etc.
- ✅ **trials** - 14-day trial tracking
- ✅ **subscriptions** - Stripe subscription data
- ✅ **user_preferences** - Language and app settings
- ✅ **search_history** - Dictionary search tracking
- ✅ **magic_link_tokens** - Temporary auth tokens

## 🔍 Troubleshooting

### Error: "DATABASE_URL environment variable is required"

**Solution:** Make sure you've added DATABASE_URL to Vercel:
```bash
vercel env add DATABASE_URL
vercel --prod  # Redeploy with new env var
```

### Error: "Connection timeout" or "ECONNREFUSED"

**Solution:** Check your database connection string and ensure the database is running.

### Error: "Table already exists"

**Solution:** This is normal if you've run the setup before. The script handles this gracefully.

### Magic link still shows 500 error

**Solution:**
1. Check Vercel function logs: `vercel logs`
2. Verify DATABASE_URL is set: `vercel env ls`
3. Test database connection locally with the setup script

## 📝 Notes

- The database schema is compatible with your existing TypeScript types
- All existing user functionality will work immediately
- Trial periods and subscriptions are automatically managed
- The app will work exactly as before, just with PostgreSQL instead of Firebase

## ✅ Success Checklist

- [ ] Vercel login successful
- [ ] PostgreSQL database created
- [ ] DATABASE_URL added to Vercel environment
- [ ] Database schema initialized successfully
- [ ] App deployed to production
- [ ] Magic link authentication working (no 500 errors)
- [ ] User can sign in and access app features

---

**Need Help?** If you encounter any issues, run these debug commands:

```bash
# Check environment variables in Vercel
vercel env ls

# Check recent deployment logs
vercel logs

# Test database connection locally
export DATABASE_URL="your_url" && node scripts/setup-database.js
```