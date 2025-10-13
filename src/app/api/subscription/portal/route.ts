import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromCookie } from '@/utils/auth';
import { getStripe } from '@/lib/stripe';
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

    const { teamId } = body as { teamId?: string };

    if (!teamId) {
      return NextResponse.json(
        { error: 'Missing teamId', message: '缺少团队ID' },
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

    if (!team.stripeCustomerId) {
      return NextResponse.json(
        { error: 'No Stripe customer', message: '该团队没有订阅' },
        { status: 400 }
      );
    }

    const stripe = getStripe();

    try {
      const portalSession = await stripe.billingPortal.sessions.create({
        customer: team.stripeCustomerId,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/billing/subscription`,
      });

      return NextResponse.json({
        success: true,
        url: portalSession.url,
      });
    } catch (portalError) {
      const error = portalError as { message: string; code?: string };
      
      // Check if it's a configuration error
      if (error.message?.includes('No configuration provided')) {
        return NextResponse.json(
          { 
            error: 'Portal not configured',
            message: '客户管理门户未配置。请先在 Stripe Dashboard 中配置客户门户设置。',
            details: '访问 https://dashboard.stripe.com/test/settings/billing/portal 配置测试模式的客户门户',
            configUrl: 'https://dashboard.stripe.com/test/settings/billing/portal',
          },
          { status: 400 }
        );
      }
      
      throw portalError;
    }
  } catch (error) {
    const err = error as { message: string };
    console.error('Portal session creation failed:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: '创建管理门户会话失败', details: err.message },
      { status: 500 }
    );
  }
}
