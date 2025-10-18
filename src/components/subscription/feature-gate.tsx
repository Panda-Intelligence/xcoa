import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import type { EnterpriseFeature } from '@/constants/plans';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

interface FeatureGateProps {
  children: ReactNode;
  feature: EnterpriseFeature;
  featureName: string;
  featureDescription: string;
}

export function FeatureGate({ children, feature, featureName, featureDescription }: FeatureGateProps) {
  const router = useRouter();
  const { t } = useLanguage();

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
              <CardTitle>{t('billing.subscription')}</CardTitle>
            </div>
            <CardDescription>
              {t('billing.unlock_all_features')}
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
              {t('billing.view_all_plans')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
