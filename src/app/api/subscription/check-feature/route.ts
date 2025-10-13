import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromCookie } from '@/utils/auth';
import { checkFeatureAccess } from '@/utils/subscription';
import { ENTERPRISE_FEATURES, type EnterpriseFeature } from '@/constants/plans';

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromCookie();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized', hasAccess: false },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const feature = searchParams.get('feature') as EnterpriseFeature;

    if (!feature || !Object.values(ENTERPRISE_FEATURES).includes(feature)) {
      return NextResponse.json(
        { error: 'Invalid feature', hasAccess: false },
        { status: 400 }
      );
    }

    const result = await checkFeatureAccess(session.user.id, feature);

    return NextResponse.json({
      hasAccess: result.hasAccess,
      currentPlan: result.currentPlan,
      subscription: {
        planId: result.subscription.planId,
        isActive: result.subscription.isActive,
        teamName: result.subscription.teamName,
      },
    });
  } catch (error) {
    console.error('Error checking feature access:', error);
    return NextResponse.json(
      { error: 'Internal server error', hasAccess: false },
      { status: 500 }
    );
  }
}
