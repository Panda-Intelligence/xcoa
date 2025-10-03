'use client';

import { useState, useEffect } from 'react';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { UpgradeModal } from './upgrade-modal';
import type { SubscriptionPlan, EnterpriseFeature } from '@/constants/plans';
import { getFeatureRequiredPlan } from '@/constants/plans';
import { useLanguage } from '@/hooks/useLanguage';

interface FeatureGateProps {
  feature: EnterpriseFeature;
  featureName: string;
  featureDescription?: string;
  children: React.ReactNode;
  currentPlan?: SubscriptionPlan | null;
  showUpgradePrompt?: boolean;
  fallback?: React.ReactNode;
}

export function FeatureGate({
  feature,
  featureName,
  featureDescription,
  children,
  currentPlan = null,
  showUpgradePrompt = true,
  fallback,
}: FeatureGateProps) {
  const { language } = useLanguage();
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  const requiredPlan = getFeatureRequiredPlan(feature);
  const isZh = language === 'zh';

  useEffect(() => {
    async function checkAccess() {
      try {
        const response = await fetch(`/api/subscription/check-feature?feature=${feature}`);
        const data = await response.json();
        setHasAccess(data.hasAccess);
      } catch (error) {
        console.error('Failed to check feature access:', error);
        setHasAccess(false);
      } finally {
        setLoading(false);
      }
    }

    checkAccess();
  }, [feature]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-pulse text-muted-foreground">
          {isZh ? '加载中...' : 'Loading...'}
        </div>
      </div>
    );
  }

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (!showUpgradePrompt) {
    return null;
  }

  return (
    <>
      <Card className="border-dashed border-2">
        <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
          <div className="rounded-full bg-muted p-3 mb-4">
            <Lock className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">
            {isZh ? '此功能需要升级' : 'Upgrade Required'}
          </h3>
          <p className="text-muted-foreground mb-4 max-w-md">
            {isZh ? (
              <>
                <span className="font-semibold">{featureName}</span>
                是我们高级计划的一部分。升级以解锁更多强大功能。
              </>
            ) : (
              <>
                <span className="font-semibold">{featureName}</span>
                is part of our premium plans. Upgrade to unlock more powerful features.
              </>
            )}
          </p>
          <Button
            size="lg"
            onClick={() => setUpgradeModalOpen(true)}
            className="bg-gradient-to-r from-purple-500 to-pink-500"
          >
            {isZh ? '查看升级选项' : 'View Upgrade Options'}
          </Button>
        </CardContent>
      </Card>

      <UpgradeModal
        open={upgradeModalOpen}
        onOpenChange={setUpgradeModalOpen}
        requiredPlan={requiredPlan}
        currentPlan={currentPlan}
        featureName={featureName}
        featureDescription={featureDescription}
      />
    </>
  );
}
