# Stripe Quick Start Guide

This is a condensed version of the setup guide. For detailed instructions, see [STRIPE_SETUP.md](./STRIPE_SETUP.md).

## 🚀 Quick Setup (5 minutes)

### 1. Get Stripe API Keys

1. Go to <https://dashboard.stripe.com/test/apikeys>
2. Copy your **Secret key** (starts with `sk_test_`)
3. Add to `.env`:
   ```bash
   STRIPE_SECRET_KEY=sk_test_your_key_here
   ```

### 2. Create Products & Prices

#### Starter Plan ($499/month)

1. Go to <https://dashboard.stripe.com/test/products>
2. Click "Add product"
3. Name: "Starter Plan"
4. Create two prices:
   - **Monthly**: $499
   - **Yearly**: $4,990 (save 17%)
5. Copy both price IDs to `.env`:
   ```bash
   NEXT_PUBLIC_STRIPE_STARTER_MONTHLY_PRICE_ID=price_...
   NEXT_PUBLIC_STRIPE_STARTER_YEARLY_PRICE_ID=price_...
   ```

#### Enterprise Plan ($1299/month)

1. Create another product: "Enterprise Plan"
2. Create two prices:
   - **Monthly**: $1,299
   - **Yearly**: $12,990
3. Copy both price IDs to `.env`:
   ```bash
   NEXT_PUBLIC_STRIPE_ENTERPRISE_MONTHLY_PRICE_ID=price_...
   NEXT_PUBLIC_STRIPE_ENTERPRISE_YEARLY_PRICE_ID=price_...
   ```

### 3. Configure Customer Portal

⚠️ **REQUIRED** before users can manage subscriptions!

1. Go to <https://dashboard.stripe.com/test/settings/billing/portal>
2. Click "Activate customer portal"
3. Enable:
   - Subscription cancellation
   - Payment method updates
   - Invoice history
4. Click "Save"

### 4. Set App URL

Add to `.env`:

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Database Migration

```bash
pnpm db:push
```

## ✅ Verify Setup

```bash
# Check your configuration
pnpm check:stripe

# Start dev server
pnpm dev
```

## 🧪 Test Subscription

1. Visit <http://localhost:3000/billing/subscription>
2. Click "Upgrade Now"
3. Use test card: `4242 4242 4242 4242`
4. Complete checkout

## 📋 Checklist

- [ ] Created Stripe account
- [ ] Got test API key
- [ ] Created Starter product with 2 prices
- [ ] Created Enterprise product with 2 prices
- [ ] Configured customer portal
- [ ] Set all environment variables
- [ ] Ran database migration
- [ ] Tested checkout with test card

## 🐛 Common Issues

### "No such price"

- Make sure price IDs are from **test mode** (check dashboard mode toggle)
- Restart dev server after updating `.env`

### "Portal not configured"

- Configure customer portal at the link in step 3
- Click "Activate" and save settings

### Need Help?

- See [STRIPE_SETUP.md](./STRIPE_SETUP.md) for detailed guide
- Run `pnpm check:stripe` for diagnostics
- Check console logs for specific errors

## 📝 Next Steps

After testing works:

- Set up webhooks for local development (see STRIPE_SETUP.md section 5)
- Test subscription management
- Test cancellation flow
- Prepare for production (get live API keys)
