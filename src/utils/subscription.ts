// Placeholder - subscription utilities not yet implemented

export async function checkSubscriptionAccess() {
  // Placeholder - always allow access for now
  return { allowed: true };
}

export async function checkFeatureAccess() {
  // Placeholder - always allow access for now
  return { allowed: true };
}

export async function getSubscriptionLimits() {
  // Placeholder - return unlimited access for now
  return {
    searches: Infinity,
    scaleViews: Infinity,
    aiInterpretations: Infinity,
  };
}
