# 🚀 Stripe Integration Setup Guide
## Complete Setup for epàlwi-rèbbo

### **📋 What We've Created:**

✅ **StripeCheckoutTrigger Component** - Handles plan selection and Stripe redirect  
✅ **Backend API Endpoint** - Creates Stripe Checkout Sessions  
✅ **Webhook Handler** - Processes Stripe events  
✅ **Subscription Store** - Manages subscription state  
✅ **Updated PaymentConfirmation** - Handles cancellation with alternatives  

---

## **🔑 STEP 1: Get Your Stripe Price IDs**

You mentioned you have these product IDs:
- **Monthly (€1)**: `prod_SsQpmdv6O0gyqv`
- **Annual (€8.97)**: `prod_SsQtzt1eA0eyzN`

**But you need PRICE IDs, not PRODUCT IDs!**

### **How to Get Price IDs:**

1. **Go to Stripe Dashboard** → Products
2. **Click on your monthly product** → `prod_SsQpmdv6O0gyqv`
3. **Look for "Pricing" section** → You'll see a price like `price_1ABC123...`
4. **Copy that price ID** (starts with `price_`)
5. **Repeat for annual product** → `prod_SsQtzt1eA0eyzN`

**Example:**
```
Product: epàlwi-rèbbo Monthly (prod_SsQpmdv6O0gyqv)
Price: €1.00/month → price_1ABC123DEF456GHI789

Product: epàlwi-rèbbo Annual (prod_SsQtzt1eA0eyzN)  
Price: €8.97/year → price_1XYZ789ABC123DEF456
```

---

## **🔑 STEP 2: Update Environment Variables**

Add these to your `.env` file:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_live_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
NUXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_publishable_key_here

# Stripe Price IDs (from Step 1)
NUXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID=price_1ABC123DEF456GHI789
NUXT_PUBLIC_STRIPE_ANNUAL_PRICE_ID=price_1XYZ789ABC123DEF456
```

---

## **🔑 STEP 3: Set Up Stripe Webhook**

### **3.1 Create Webhook Endpoint:**

1. **Go to Stripe Dashboard** → Developers → Webhooks
2. **Click "Add endpoint"**
3. **Endpoint URL**: `https://your-domain.com/api/stripe/webhook`
4. **Events to send**: Select these events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `customer.subscription.trial_will_end`

### **3.2 Get Webhook Secret:**

1. **After creating webhook**, click on it
2. **Copy the "Signing secret"** (starts with `whsec_`)
3. **Add to your `.env` file** as `STRIPE_WEBHOOK_SECRET`

---

## **🔑 STEP 4: Configure Products in Stripe**

### **4.1 Monthly Plan:**
- **Product Name**: `epàlwi-rèbbo Monthly`
- **Price**: €1.00/month
- **Billing**: Recurring
- **Trial**: 14 days
- **Currency**: EUR

### **4.2 Annual Plan:**
- **Product Name**: `epàlwi-rèbbo Annual`
- **Price**: €8.97/year
- **Billing**: Recurring
- **Trial**: 14 days
- **Currency**: EUR
- **Popular**: Mark as "Most Popular"

---

## **🔑 STEP 5: Test the Integration**

### **5.1 Test Card Numbers:**
```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
Requires Authentication: 4000 0025 0000 3155
```

### **5.2 Test Flow:**
1. **Select a plan** → StripeCheckoutTrigger appears
2. **Click "Comenzar Prueba Gratuita"** → Redirects to Stripe
3. **Complete payment** → Redirects back to success page
4. **Check webhook logs** in Stripe Dashboard

---

## **🔑 STEP 6: Update Nuxt Config**

Add these to your `nuxt.config.ts`:

```typescript
runtimeConfig: {
  // ... existing config
  public: {
    // ... existing public config
    stripeMonthlyPriceId: process.env.NUXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID || '',
    stripeAnnualPriceId: process.env.NUXT_PUBLIC_STRIPE_ANNUAL_PRICE_ID || '',
  }
}
```

---

## **🔑 STEP 7: Initialize Plans**

In your app initialization, call:

```typescript
// In your app.vue or main layout
const subscriptionStore = useSubscriptionStore()
subscriptionStore.initializePlans()
```

---

## **🚨 Common Issues & Solutions:**

### **Issue 1: "Stripe publishable key not configured"**
**Solution**: Check `NUXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` in `.env`

### **Issue 2: "Webhook signature verification failed"**
**Solution**: Verify `STRIPE_WEBHOOK_SECRET` matches Stripe Dashboard

### **Issue 3: "Price not found"**
**Solution**: Check `NUXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID` and `NUXT_PUBLIC_STRIPE_ANNUAL_PRICE_ID`

### **Issue 4: Webhook not receiving events**
**Solution**: 
1. Check webhook endpoint URL is correct
2. Ensure events are selected in Stripe Dashboard
3. Check server logs for errors

---

## **✅ Verification Checklist:**

- [ ] Stripe Price IDs obtained (not Product IDs)
- [ ] Environment variables set in `.env`
- [ ] Webhook endpoint created in Stripe Dashboard
- [ ] Webhook secret copied to `.env`
- [ ] Products configured with 14-day trial
- [ ] Nuxt config updated with price IDs
- [ ] Plans initialized in subscription store
- [ ] Test payment flow works end-to-end
- [ ] Webhook events received in Stripe Dashboard

---

## **🎯 Next Steps After Setup:**

1. **Test complete subscription flow**
2. **Verify webhook events are processed**
3. **Test trial expiration logic**
4. **Implement customer portal integration**
5. **Add subscription management UI**

---

## **📞 Need Help?**

If you encounter issues:
1. **Check Stripe Dashboard logs**
2. **Check your server logs**
3. **Verify all environment variables**
4. **Test with Stripe test keys first**

**Remember**: You need PRICE IDs, not PRODUCT IDs! 🎯
