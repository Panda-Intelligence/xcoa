'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Usage {
  searches?: {
    used: number;
    limit: number | null;
  };
  [key: string]: {
    used: number;
    limit: number | null;
  } | undefined;
}

interface Subscription {
  plan?: string;
  status?: string;
}

export function useSubscription() {
  const router = useRouter();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [usage, setUsage] = useState<Usage | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Fetch subscription and usage data
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // TODO: Replace with actual API calls when backend is ready
        setSubscription({ plan: 'free', status: 'active' });
        setUsage({
          searches: {
            used: 0,
            limit: null, // null means unlimited
          },
        });
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const checkFeatureAccess = async (feature: string): Promise<boolean> => {
    // TODO: Implement actual feature access check
    // For now, allow all features
    return true;
  };

  const hasReachedLimit = (feature: string): boolean => {
    if (!usage || !usage[feature]) return false;
    const featureUsage = usage[feature];
    if (!featureUsage) return false;

    // If limit is null, it means unlimited
    if (featureUsage.limit === null) return false;

    return featureUsage.used >= featureUsage.limit;
  };

  const getRemainingUsage = (feature: string): number | null => {
    if (!usage || !usage[feature]) return null;
    const featureUsage = usage[feature];
    if (!featureUsage) return null;

    // If limit is null, it means unlimited
    if (featureUsage.limit === null) return null;

    return Math.max(0, featureUsage.limit - featureUsage.used);
  };

  return {
    subscription,
    usage,
    isLoading,
    error,
    checkFeatureAccess,
    hasReachedLimit,
    getRemainingUsage,
  };
}
