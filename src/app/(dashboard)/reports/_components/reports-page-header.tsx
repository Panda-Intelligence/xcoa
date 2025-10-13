'use client';

import { PageHeader } from '@/components/page-header';
import { useLanguage } from '@/providers/language-provider';

export function ReportsPageHeader() {
  const { t } = useLanguage();

  return (
    <PageHeader
      title={t('reports.title')}
      description={t('reports.description')}
    />
  );
}
