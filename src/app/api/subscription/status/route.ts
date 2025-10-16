import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromCookie } from '@/utils/auth';
import { getUserUsageStats } from '@/services/subscription';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromCookie();

    if (!session) {
      // 返回游客的免费订阅状态
      return NextResponse.json({
        plan: 'free',
        status: 'active',
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        usage: {
          searches: { used: 0, limit: 30 },
          scaleViews: { used: 0, limit: 5 },
          aiInterpretations: { used: 0, limit: 0 },
          apiCalls: { used: 0, limit: 0 }
        },
        features: {
          caseStudyAccess: false,
          dataExport: false,
          pdfWatermark: true,
          copyrightAssistance: false,
          teamMembers: 1,
          supportLevel: 'community'
        }
      });
    }

    const stats = await getUserUsageStats(session.userId);

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching subscription status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription status' },
      { status: 500 }
    );
  }
}