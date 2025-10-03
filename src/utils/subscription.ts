import { getDB } from '@/db';
import { teamTable, teamMembershipTable } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import type { SubscriptionPlan, EnterpriseFeature } from '@/constants/plans';
import { isFeatureAvailable, SUBSCRIPTION_PLANS } from '@/constants/plans';

export interface UserSubscription {
  planId: SubscriptionPlan | null;
  planExpiresAt: Date | null;
  isActive: boolean;
  teamId: string | null;
  teamName: string | null;
}

export async function getUserSubscription(userId: string): Promise<UserSubscription> {
  const db = getDB();
  
  const memberships = await db
    .select({
      teamId: teamMembershipTable.teamId,
      teamName: teamTable.name,
      planId: teamTable.planId,
      planExpiresAt: teamTable.planExpiresAt,
      isActive: teamMembershipTable.isActive,
    })
    .from(teamMembershipTable)
    .innerJoin(teamTable, eq(teamMembershipTable.teamId, teamTable.id))
    .where(
      and(
        eq(teamMembershipTable.userId, userId),
        eq(teamMembershipTable.isActive, 1)
      )
    )
    .limit(1);

  if (memberships.length === 0) {
    return {
      planId: null,
      planExpiresAt: null,
      isActive: false,
      teamId: null,
      teamName: null,
    };
  }

  const membership = memberships[0];
  const now = new Date();
  const isExpired = membership.planExpiresAt && new Date(membership.planExpiresAt) < now;

  return {
    planId: (membership.planId as SubscriptionPlan) || null,
    planExpiresAt: membership.planExpiresAt ? new Date(membership.planExpiresAt) : null,
    isActive: !isExpired,
    teamId: membership.teamId,
    teamName: membership.teamName,
  };
}

export async function checkFeatureAccess(userId: string, feature: EnterpriseFeature): Promise<{
  hasAccess: boolean;
  currentPlan: SubscriptionPlan | null;
  subscription: UserSubscription;
}> {
  const subscription = await getUserSubscription(userId);
  
  const currentPlan = (subscription.isActive && subscription.planId) 
    ? subscription.planId 
    : SUBSCRIPTION_PLANS.FREE;
  
  const hasAccess = isFeatureAvailable(currentPlan, feature);

  return {
    hasAccess,
    currentPlan,
    subscription,
  };
}

export function getPlanDisplayName(plan: SubscriptionPlan | null, locale: 'zh' | 'en' = 'zh'): string {
  if (!plan || plan === SUBSCRIPTION_PLANS.FREE) {
    return locale === 'zh' ? '免费版' : 'Free';
  }
  if (plan === SUBSCRIPTION_PLANS.STARTER) {
    return locale === 'zh' ? '入门版' : 'Starter';
  }
  if (plan === SUBSCRIPTION_PLANS.ENTERPRISE) {
    return locale === 'zh' ? '企业版' : 'Enterprise';
  }
  return locale === 'zh' ? '未知' : 'Unknown';
}

export function isSubscriptionActive(subscription: UserSubscription): boolean {
  if (!subscription.isActive) return false;
  if (!subscription.planExpiresAt) return true;
  return new Date(subscription.planExpiresAt) > new Date();
}
