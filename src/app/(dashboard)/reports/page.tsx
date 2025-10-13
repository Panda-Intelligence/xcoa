import { Suspense } from 'react';
import { getSessionFromCookie } from '@/utils/auth';
import { redirect } from 'next/navigation';
import { getDB } from '@/db';
import { scaleReportTable, ecoaScaleTable } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { ReportCard } from '@/components/reports';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import type { Metadata } from 'next';
import { EmptyState } from './_components/empty-state';
import { ReportsPageHeader } from './_components/reports-page-header';

export const metadata: Metadata = {
  title: 'My Reports - OpeneCOA',
  description: 'View and manage your scale assessment reports',
};

async function getReports(userId: string) {
  const db = getDB();

  const reports = await db
    .select({
      report: scaleReportTable,
      scale: ecoaScaleTable,
    })
    .from(scaleReportTable)
    .leftJoin(ecoaScaleTable, eq(scaleReportTable.scaleId, ecoaScaleTable.id))
    .where(eq(scaleReportTable.userId, userId))
    .orderBy(desc(scaleReportTable.generatedAt))
    .limit(50);

  return reports.map(({ report, scale }) => ({
    id: report.id,
    scaleId: report.scaleId,
    scaleName: scale?.name || 'Unknown Scale',
    sessionId: report.sessionId,
    reportType: report.reportType,
    status: report.status,
    totalScore: report.totalScore || 0,
    maxScore: report.maxScore || 0,
    completionRate: report.completionRate || 0,
    interpretation: report.interpretation,
    generatedAt: report.generatedAt || new Date(),
    reportUrl: `/reports/${report.id}`,
  }));
}

async function ReportsList() {
  const session = await getSessionFromCookie();

  if (!session?.user) {
    redirect('/auth/sign-in');
  }

  const reports = await getReports(session.user.id);

  if (reports.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {reports.map((report) => (
        <ReportCard key={report.id} report={report} />
      ))}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        <Card key={i} className="animate-pulse">
          <CardContent className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function ReportsPage() {
  return (
    <div className="container mx-auto space-y-6 py-8">
      <ReportsPageHeader />

      <Suspense fallback={<LoadingSkeleton />}>
        <ReportsList />
      </Suspense>
    </div>
  );
}
