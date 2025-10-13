'use client';

import { Card, CardContent } from '@/components/ui/card';
import { FileText } from 'lucide-react';
import { useLanguage } from '@/providers/language-provider';

export function EmptyState() {
  const { t } = useLanguage();

  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-16">
        <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
        <h3 className="mb-2 text-lg font-semibold">
          {t('reports.no_reports_title')}
        </h3>
        <p className="mb-4 text-center text-sm text-muted-foreground">
          {t('reports.no_reports_description')}
        </p>
      </CardContent>
    </Card>
  );
}
