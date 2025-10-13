import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromCookie } from '@/utils/auth';
import { getStripe } from '@/lib/stripe';
import { SUBSCRIPTION_PLANS, STRIPE_PRICE_IDS } from '@/constants/plans';
import { getDB } from '@/db';
import { teamTable } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromCookie();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: '请先登录' },
        { status: 401 }
      );
    }

    const body: unknown = await request.json();
    
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Invalid request body', message: '请求体格式错误' },
        { status: 400 }
      );
    }

    const { planId, billingInterval, teamId } = body as {
      planId?: string;
      billingInterval?: string;
      teamId?: string;
    };

    if (!planId || !billingInterval || !teamId) {
      return NextResponse.json(
        { error: 'Missing required fields', message: '缺少必要参数' },
        { status: 400 }
      );
    }

    if (planId === SUBSCRIPTION_PLANS.FREE) {
      return NextResponse.json(
        { error: 'Invalid plan', message: '免费版无需订阅' },
        { status: 400 }
      );
    }

    if (!STRIPE_PRICE_IDS[planId as keyof typeof STRIPE_PRICE_IDS]) {
      return NextResponse.json(
        { error: 'Invalid plan', message: '无效的订阅计划' },
        { status: 400 }
      );
    }

    if (billingInterval !== 'monthly' && billingInterval !== 'yearly') {
      return NextResponse.json(
        { error: 'Invalid billing interval', message: '无效的计费周期' },
        { status: 400 }
      );
    }

    const db = getDB();
    const teams = await db
      .select()
      .from(teamTable)
      .where(eq(teamTable.id, teamId))
      .limit(1);

    if (teams.length === 0) {
      return NextResponse.json(
        { error: 'Team not found', message: '团队不存在' },
        { status: 404 }
      );
    }

    const team = teams[0];
    const stripe = getStripe();
    
    const priceId = STRIPE_PRICE_IDS[planId as keyof typeof STRIPE_PRICE_IDS][billingInterval];

    if (!priceId) {
      return NextResponse.json(
        { error: 'Price not configured', message: '价格未配置，请联系管理员' },
        { status: 500 }
      );
    }

    // Log for debugging
    console.log('Creating checkout with:', {
      planId,
      billingInterval,
      priceId,
      stripeKeyPrefix: process.env.STRIPE_SECRET_KEY?.substring(0, 7),
    });

    // Verify price exists before creating checkout
    try {
      await stripe.prices.retrieve(priceId);
    } catch (priceError) {
      const error = priceError as { message: string };
      console.error('Price validation failed:', error.message);
      return NextResponse.json(
        { 
          error: 'Invalid price', 
          message: `价格ID无效或不存在: ${priceId}. 请检查Stripe价格ID是否正确，并确保使用的是正确的模式（测试/生产）`,
          details: error.message,
        },
        { status: 400 }
      );
    }

    let customerId = team.stripeCustomerId;

    // Verify customer exists in current Stripe mode, or create new one
    if (customerId) {
      try {
        await stripe.customers.retrieve(customerId);
        console.log('Using existing customer:', customerId);
      } catch (customerError) {
        const error = customerError as { code?: string };
        if (error.code === 'resource_missing') {
          console.log('Customer not found in current Stripe mode, creating new customer');
          customerId = null; // Will create new customer below
        } else {
          throw customerError;
        }
      }
    }

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: session.user.email || undefined,
        metadata: {
          userId: session.user.id,
          teamId: team.id,
        },
      });
      customerId = customer.id;
      console.log('Created new customer:', customerId);

      await db
        .update(teamTable)
        .set({ stripeCustomerId: customerId })
        .where(eq(teamTable.id, teamId));
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/billing/subscription?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/billing/subscription?canceled=true`,
      metadata: {
        userId: session.user.id,
        teamId: team.id,
        planId,
        billingInterval,
      },
    });

    return NextResponse.json({
      success: true,
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
    });
  } catch (error) {
    const err = error as { message: string };
    console.error('Checkout session creation failed:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        message: '创建订阅会话失败',
        details: err.message,
      },
      { status: 500 }
    );
  }
}
