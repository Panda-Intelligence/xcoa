import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromCookie } from '@/utils/auth';
import { checkFeatureAccess } from '@/utils/subscription';
import type { EnterpriseFeature } from '@/constants/plans';

export interface ProtectedApiOptions {
  feature: EnterpriseFeature;
  errorMessage?: string;
}

export async function withFeatureAccess(
  request: NextRequest,
  options: ProtectedApiOptions,
  handler: (request: NextRequest, session: any) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    const session = await getSessionFromCookie();
    
    if (!session?.user) {
      return NextResponse.json(
        { 
          error: 'Unauthorized',
          message: '请先登录',
          code: 'UNAUTHORIZED' 
        },
        { status: 401 }
      );
    }

    const result = await checkFeatureAccess(session.user.id, options.feature);

    if (!result.hasAccess) {
      return NextResponse.json(
        {
          error: 'Subscription required',
          message: options.errorMessage || '此功能需要升级订阅',
          code: 'SUBSCRIPTION_REQUIRED',
          requiredPlan: result.currentPlan,
          feature: options.feature,
        },
        { status: 403 }
      );
    }

    return handler(request, session);
  } catch (error) {
    console.error('Feature access check error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        code: 'INTERNAL_ERROR' 
      },
      { status: 500 }
    );
  }
}

export function createFeatureProtectedHandler(
  feature: EnterpriseFeature,
  errorMessage?: string
) {
  return (
    handler: (request: NextRequest, session: any) => Promise<NextResponse>
  ) => {
    return async (request: NextRequest) => {
      return withFeatureAccess(
        request,
        { feature, errorMessage },
        handler
      );
    };
  };
}
