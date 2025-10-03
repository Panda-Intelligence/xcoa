import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { getDB } from '@/db';
import { teamTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import Stripe from 'stripe';
import { SUBSCRIPTION_PLANS } from '@/constants/plans';

const relevantEvents = new Set([
  'checkout.session.completed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'invoice.payment_succeeded',
  'invoice.payment_failed',
]);

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('Missing STRIPE_WEBHOOK_SECRET');
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    );
  }

  const stripe = getStripe();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error: any) {
    console.error('Webhook signature verification failed:', error.message);
    return NextResponse.json(
      { error: `Webhook Error: ${error.message}` },
      { status: 400 }
    );
  }

  if (!relevantEvents.has(event.type)) {
    return NextResponse.json({ received: true });
  }

  try {
    const db = getDB();

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        if (session.mode === 'subscription') {
          const subscriptionId = session.subscription as string;
          const customerId = session.customer as string;
          const { teamId, planId } = session.metadata || {};

          if (teamId && planId && subscriptionId) {
            const subscription = await stripe.subscriptions.retrieve(subscriptionId);
            const periodEnd = new Date(subscription.current_period_end * 1000);

            await db
              .update(teamTable)
              .set({
                stripeCustomerId: customerId,
                stripeSubscriptionId: subscriptionId,
                planId: planId,
                planExpiresAt: periodEnd,
                updatedAt: new Date(),
              })
              .where(eq(teamTable.id, teamId));

            console.log(`Subscription created for team ${teamId}: ${subscriptionId}`);
          }
        }
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const teams = await db
          .select()
          .from(teamTable)
          .where(eq(teamTable.stripeCustomerId, customerId))
          .limit(1);

        if (teams.length > 0) {
          const team = teams[0];
          const periodEnd = new Date(subscription.current_period_end * 1000);
          const isActive = subscription.status === 'active' || subscription.status === 'trialing';

          let planId = team.planId;
          if (subscription.items.data.length > 0) {
            const priceId = subscription.items.data[0].price.id;
            
            if (priceId === process.env.NEXT_PUBLIC_STRIPE_STARTER_MONTHLY_PRICE_ID ||
                priceId === process.env.NEXT_PUBLIC_STRIPE_STARTER_YEARLY_PRICE_ID) {
              planId = SUBSCRIPTION_PLANS.STARTER;
            } else if (priceId === process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_MONTHLY_PRICE_ID ||
                       priceId === process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_YEARLY_PRICE_ID) {
              planId = SUBSCRIPTION_PLANS.ENTERPRISE;
            }
          }

          await db
            .update(teamTable)
            .set({
              stripeSubscriptionId: subscription.id,
              planId: isActive ? planId : SUBSCRIPTION_PLANS.FREE,
              planExpiresAt: isActive ? periodEnd : null,
              updatedAt: new Date(),
            })
            .where(eq(teamTable.id, team.id));

          console.log(`Subscription ${event.type} for team ${team.id}: ${subscription.id}, status: ${subscription.status}`);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const teams = await db
          .select()
          .from(teamTable)
          .where(eq(teamTable.stripeCustomerId, customerId))
          .limit(1);

        if (teams.length > 0) {
          const team = teams[0];

          await db
            .update(teamTable)
            .set({
              stripeSubscriptionId: null,
              planId: SUBSCRIPTION_PLANS.FREE,
              planExpiresAt: null,
              updatedAt: new Date(),
            })
            .where(eq(teamTable.id, team.id));

          console.log(`Subscription deleted for team ${team.id}`);
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;

        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const customerId = subscription.customer as string;

          const teams = await db
            .select()
            .from(teamTable)
            .where(eq(teamTable.stripeCustomerId, customerId))
            .limit(1);

          if (teams.length > 0) {
            const team = teams[0];
            const periodEnd = new Date(subscription.current_period_end * 1000);

            await db
              .update(teamTable)
              .set({
                planExpiresAt: periodEnd,
                updatedAt: new Date(),
              })
              .where(eq(teamTable.id, team.id));

            console.log(`Payment succeeded for team ${team.id}, subscription extended to ${periodEnd}`);
          }
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;

        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const customerId = subscription.customer as string;

          const teams = await db
            .select()
            .from(teamTable)
            .where(eq(teamTable.stripeCustomerId, customerId))
            .limit(1);

          if (teams.length > 0) {
            console.error(`Payment failed for team ${teams[0].id}, subscription: ${subscriptionId}`);
          }
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
