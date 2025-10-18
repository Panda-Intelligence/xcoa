import type { EnterpriseFeature, SubscriptionPlan } from '@/constants/plans';
import { SUBSCRIPTION_PLANS } from '@/constants/plans';

// Placeholder - subscription utilities not yet implemented

export async function checkSubscriptionAccess(userId: string) {
  // Placeholder - always allow access for now
  return {
    allowed: true,
    plan: SUBSCRIPTION_PLANS.FREE as SubscriptionPlan
  };
}

export async function checkFeatureAccess(userId: string, feature: EnterpriseFeature) {
  // Placeholder - always allow access for now
  return {
    hasAccess: true,
    currentPlan: SUBSCRIPTION_PLANS.FREE as SubscriptionPlan
  };
}

export async function getSubscriptionLimits(userId: string) {
  // Placeholder - return unlimited access for now
  return {
    searches: Infinity,
    scaleViews: Infinity,
    aiInterpretations: Infinity,
  };
}
