# MailerSend Configuration Guide

## Current Issue
The magic link authentication is failing because MailerSend API configuration needs to be completed.

## Required Steps

### 1. Verify Your MailerSend Account
- Login to [MailerSend Dashboard](https://www.mailersend.com/dashboard)
- Check that your account is properly set up and verified

### 2. Verify Sender Domain
Current sender: `noreply@test-eqvygm0jevwl0p7w.mlsender.net`

**Steps:**
1. Go to MailerSend Dashboard → Domains
2. Verify that `test-eqvygm0jevwl0p7w.mlsender.net` is verified (green checkmark)
3. If not verified, follow the DNS verification process

### 3. Check API Key Permissions
Current API key: `mlsn.8006517871f93033db33de4a251f2d670c814b9eca68edc706bf9bfffa4ebf1a`

**Steps:**
1. Go to MailerSend Dashboard → API Tokens
2. Verify the token has "Send Email" permissions
3. Check if there are any rate limits or restrictions

### 4. Test with a Verified Email
Try using your own verified email domain instead of the test domain:

```bash
# Update .env file
MAILERSEND_API_KEY=your_actual_api_key_here
```

Then update the sender email in the code to use your verified domain.

## Alternative Solution: Development Mode

For development/testing, you can temporarily modify the email sending to log the magic link instead of sending emails.