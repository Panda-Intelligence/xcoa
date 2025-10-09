# Stripe Configuration Guide

## Environment Variables

Add the following environment variables to your `.env` file:

```bash
# Stripe API Keys
STRIPE_SECRET_KEY=sk_test_... # Get from https://dashboard.stripe.com/test/apikeys
STRIPE_WEBHOOK_SECRET=whsec_... # Get from https://dashboard.stripe.com/test/webhooks

# Stripe Price IDs
NEXT_PUBLIC_STRIPE_STARTER_MONTHLY_PRICE_ID=price_... # Starter plan monthly price ID
NEXT_PUBLIC_STRIPE_STARTER_YEARLY_PRICE_ID=price_... # Starter plan yearly price ID
NEXT_PUBLIC_STRIPE_ENTERPRISE_MONTHLY_PRICE_ID=price_... # Enterprise plan monthly price ID
NEXT_PUBLIC_STRIPE_ENTERPRISE_YEARLY_PRICE_ID=price_... # Enterprise plan yearly price ID

# App URL (for redirect URLs)
NEXT_PUBLIC_APP_URL=http://localhost:3000 # For local development
# NEXT_PUBLIC_APP_URL=https://your-domain.com # For production - MUST include https://
```

**Important Notes:**
- `NEXT_PUBLIC_APP_URL` must include the protocol (http:// or https://)
- For production, ALWAYS use https://
- For local development, http://localhost:3000 is acceptable
- Do not include trailing slashes

## Setup Instructions

### 1. Create Stripe Account
1. Go to https://stripe.com and create an account
2. Complete the onboarding process

### 2. Get API Keys
1. Navigate to https://dashboard.stripe.com/test/apikeys
2. Copy the "Secret key" and set it as `STRIPE_SECRET_KEY`
3. Copy the "Publishable key" (optional, for client-side if needed)

### 3. Create Products and Prices

#### Create Starter Plan
1. Go to https://dashboard.stripe.com/test/products
2. Click "Add product"
3. Fill in:
   - Name: "Starter Plan"
   - Description: "Professional scale research plan"
4. Under Pricing:
   - **Monthly Price**: 
     - Price: $499
     - Billing period: Monthly
     - Copy the Price ID (starts with `price_`) and set as `NEXT_PUBLIC_STRIPE_STARTER_MONTHLY_PRICE_ID`
   - **Yearly Price**: 
     - Click "Add another price"
     - Price: $4,990
     - Billing period: Yearly
     - Copy the Price ID and set as `NEXT_PUBLIC_STRIPE_STARTER_YEARLY_PRICE_ID`

#### Create Enterprise Plan
1. Click "Add product" again
2. Fill in:
   - Name: "Enterprise Plan"
   - Description: "Full-featured enterprise plan"
3. Under Pricing:
   - **Monthly Price**: 
     - Price: $1,299
     - Billing period: Monthly
     - Copy the Price ID and set as `NEXT_PUBLIC_STRIPE_ENTERPRISE_MONTHLY_PRICE_ID`
   - **Yearly Price**: 
     - Click "Add another price"
     - Price: $12,990
     - Billing period: Yearly
     - Copy the Price ID and set as `NEXT_PUBLIC_STRIPE_ENTERPRISE_YEARLY_PRICE_ID`

### 4. Configure Billing Portal

**IMPORTANT**: You must configure this before users can manage their subscriptions.

1. Go to <https://dashboard.stripe.com/test/settings/billing/portal>
2. Click "Activate customer portal" or configure settings
3. Enable the following features (recommended):
   - **Subscription cancellation**: Allow customers to cancel
   - **Payment method updates**: Allow customers to update payment methods
   - **Invoice history**: Allow customers to view past invoices
4. Click "Save changes"

**For production**: Repeat this step in live mode at <https://dashboard.stripe.com/settings/billing/portal>

### 5. Set up Webhooks
1. Go to https://dashboard.stripe.com/test/webhooks
2. Click "Add endpoint"
3. Enter your webhook URL: `https://your-domain.com/api/subscription/webhook`
   - For local testing: Use ngrok or similar tunneling service
4. Select events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click "Add endpoint"
6. Reveal the signing secret and set it as `STRIPE_WEBHOOK_SECRET`

### 6. Local Testing with Webhook

For local development, use Stripe CLI:

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login to Stripe
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/subscription/webhook

# This will output a webhook signing secret
# Set it as STRIPE_WEBHOOK_SECRET in your .env file
```

### 7. Database Migration

Run the database migration to add Stripe fields:

```bash
pnpm db:push
```

This adds the following fields to the `team` table:
- `stripeCustomerId`: Stores Stripe customer ID
- `stripeSubscriptionId`: Stores Stripe subscription ID

## Testing the Integration

### Test Checkout Flow
1. Navigate to `/billing/subscription`
2. Click "Upgrade Now" or "Choose Plan"
3. Select a plan (Starter or Enterprise)
4. You'll be redirected to Stripe Checkout
5. Use test card numbers:
   - Success: `4242 4242 4242 4242`
   - Requires authentication: `4000 0025 0000 3155`
   - Declined: `4000 0000 0000 9995`
6. Complete the checkout
7. You'll be redirected back to `/billing/subscription?success=true`
8. Verify the subscription is active in your dashboard

### Test Webhook Events
1. Complete a checkout as above
2. Check your server logs for webhook events
3. Verify the team's `planId` and `planExpiresAt` are updated
4. Verify `stripeCustomerId` and `stripeSubscriptionId` are stored

### Test Customer Portal
1. With an active subscription, click "Manage Subscription"
2. You'll be redirected to Stripe's customer portal
3. Test canceling the subscription
4. Verify the webhook updates the team's plan to "free"

## Production Checklist

Before going live:

- [ ] Switch from test API keys to live API keys
- [ ] Create production products and prices in live mode
- [ ] Update environment variables with live keys
- [ ] Set up production webhook endpoint
- [ ] Configure production billing portal
- [ ] Update `NEXT_PUBLIC_APP_URL` to production domain
- [ ] Test end-to-end subscription flow
- [ ] Set up monitoring for failed payments
- [ ] Configure email notifications for subscription events

## Security Notes

1. **Never expose secret keys**: `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` should only be on the server
2. **Verify webhook signatures**: The webhook handler already verifies signatures
3. **Use HTTPS in production**: Stripe requires HTTPS for webhooks
4. **Validate all inputs**: The API routes validate request data

## Common Issues

### "No such price" Error

**Problem**: `No such price: 'price_...'`

**Cause**: The price ID doesn't exist in the current Stripe mode (test/live)

**Solution**:

1. Check which mode your `STRIPE_SECRET_KEY` is for:
   - Test keys start with `sk_test_`
   - Live keys start with `sk_live_`
2. Make sure your price IDs match the same mode:
   - Go to Stripe Dashboard and toggle the mode (test/live) in the top right
   - Navigate to Products → Your Product → Pricing
   - Copy the correct price IDs for the current mode
3. Verify the price IDs in your `.env` file
4. Restart your dev server after updating `.env`

**Quick Check**:

```bash
# Run diagnostic script
node scripts/check-stripe-config.js
```

### "No such customer" Error

**Problem**: `No such customer: 'cus_...'`

**Cause**: You switched between test and live modes, but the database still has customer IDs from the previous mode

**Solution**:

The checkout API now automatically handles this:

- It verifies if the customer exists in the current Stripe mode
- If not found, it creates a new customer automatically
- Just retry the checkout, it will work on the second attempt

**Alternative**: Clear the old customer IDs from database:

```sql
-- Local database
wrangler d1 execute xcoa --local --command="UPDATE team SET stripeCustomerId = NULL, stripeSubscriptionId = NULL"

-- Remote database (be careful!)
wrangler d1 execute xcoa --remote --command="UPDATE team SET stripeCustomerId = NULL, stripeSubscriptionId = NULL"
```

### "Portal not configured" Error

**Problem**: `No configuration provided and your test mode default configuration has not been created`

**Cause**: Stripe Customer Portal is not configured

**Solution**:

1. Go to <https://dashboard.stripe.com/test/settings/billing/portal>
2. Click "Activate customer portal"
3. Configure portal settings:
   - Enable subscription cancellation
   - Enable payment method updates
   - Enable invoice history
4. Click "Save changes"
5. For production, repeat in live mode: <https://dashboard.stripe.com/settings/billing/portal>

**Note**: The "Manage Subscription" button won't work until you configure the portal.

### Webhook not working
- Verify `STRIPE_WEBHOOK_SECRET` is correct
- Check that webhook URL is accessible (use ngrok for local testing)
- Ensure selected events match what's in the code

### Checkout not redirecting
- Verify `NEXT_PUBLIC_APP_URL` is correct
- Check success_url and cancel_url in checkout session

### Price ID not found
- Ensure price IDs are correctly set in environment variables
- Verify prices are created in the correct Stripe mode (test/live)

## Support

For Stripe-related issues:
- Stripe Documentation: https://stripe.com/docs
- Stripe Support: https://support.stripe.com
- Stripe Discord: https://discord.gg/stripe
