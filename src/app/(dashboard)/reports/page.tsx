import { Suspense } from 'react';
import { getSessionFromCookie } from '@/utils/auth';
import { redirect } from 'next/navigation';
import { getDB } from '@/db';
import { scaleReportTable, ecoaScaleTable } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { ReportCard } from '@/components/reports';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Loader2 } from 'lucide-react';

export const metadata = {
  title: '我的报告 - OpeneCOA',
  description: '查看和管理您的量表评估报告',
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
    scaleName: scale?.name || '未知量表',
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
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-semibold">还没有评估报告</h3>
          <p className="mb-4 text-center text-sm text-muted-foreground">
            完成量表评估后，系统会自动生成专业的评估报告
          </p>
        </CardContent>
      </Card>
    );
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
      <PageHeader
        title="我的报告"
        description="查看和管理您的量表评估报告"
      />

      <Suspense fallback={<LoadingSkeleton />}>
        <ReportsList />
      </Suspense>
    </div>
  );
}
