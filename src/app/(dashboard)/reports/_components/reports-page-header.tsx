'use client';

import { PageHeader } from '@/components/page-header';
// Use the central language hook/provider
import { useLanguage } from '@/hooks/useLanguage';

export function ReportsPageHeader() {
  const { t } = useLanguage();

  return (
    <PageHeader
      items={[
        { href: '/reports', label: t('reports.title') },
      ]}
    />
  );
}
