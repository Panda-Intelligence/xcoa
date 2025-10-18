'use client';

import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import type { EnterpriseFeature } from '@/constants/plans';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';

interface FeatureGateProps {
  children: ReactNode;
  feature: EnterpriseFeature;
  featureName: string;
  featureDescription: string;
}

export function FeatureGate({ children, feature, featureName, featureDescription }: FeatureGateProps) {
  const router = useRouter();

  // TODO: Implement actual subscription check
  // For now, always allow access
  const hasAccess = true;

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="flex items-center space-x-2 text-orange-600 mb-2">
              <Lock className="w-5 h-5" />
              <CardTitle>需要订阅</CardTitle>
            </div>
            <CardDescription>
              此功能需要订阅才能使用
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium mb-1">{featureName}</h3>
              <p className="text-sm text-muted-foreground">{featureDescription}</p>
            </div>
            <Button
              onClick={() => router.push('/pricing')}
              className="w-full"
            >
              查看订阅方案
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
