import { NextResponse } from 'next/server';
import { getSessionFromCookie } from '@/utils/auth';
import { getUserSubscription } from '@/utils/subscription';

export async function GET() {
  try {
    const session = await getSessionFromCookie();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const subscription = await getUserSubscription(session.user.id);

    return NextResponse.json({
      success: true,
      subscription: {
        planId: subscription.planId,
        planExpiresAt: subscription.planExpiresAt,
        isActive: subscription.isActive,
        teamId: subscription.teamId,
        teamName: subscription.teamName,
      },
    });
  } catch (error) {
    console.error('Error fetching current subscription:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
