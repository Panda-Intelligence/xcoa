import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromCookie } from '@/utils/auth';
import { checkFeatureAccess } from '@/services/subscription';

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromCookie();

    if (!session) {
      return NextResponse.json(
        {
          allowed: false,
          reason: '请先登录',
          requiresUpgrade: null
        }
      );
    }

    const { feature } = await req.json();

    if (!feature) {
      return NextResponse.json(
        { error: 'Feature parameter is required' },
        { status: 400 }
      );
    }

    const result = await checkFeatureAccess(session.userId, feature);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error checking feature access:', error);
    return NextResponse.json(
      { error: 'Failed to check feature access' },
      { status: 500 }
    );
  }
}