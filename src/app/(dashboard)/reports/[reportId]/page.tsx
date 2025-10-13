import { Suspense } from 'react';
import { getSessionFromCookie } from '@/utils/auth';
import { redirect, notFound } from 'next/navigation';
import { getDB } from '@/db';
import { scaleReportTable, ecoaScaleTable } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { ScoreGauge, DimensionRadar, ReportSummary, DownloadReportPDFButton } from '@/components/reports';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Share2, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface ReportDetailPageProps {
  params: Promise<{
    reportId: string;
  }>;
}

async function getReportDetail(reportId: string, userId: string) {
  const db = getDB();

  const result = await db
    .select({
      report: scaleReportTable,
      scale: ecoaScaleTable,
    })
    .from(scaleReportTable)
    .leftJoin(ecoaScaleTable, eq(scaleReportTable.scaleId, ecoaScaleTable.id))
    .where(and(
      eq(scaleReportTable.id, reportId),
      eq(scaleReportTable.userId, userId)
    ))
    .limit(1);

  if (result.length === 0) {
    return null;
  }

  const { report, scale } = result[0];

  return {
    id: report.id,
    scaleId: report.scaleId,
    scaleName: scale?.name || '未知量表',
    scaleDescription: scale?.description,
    sessionId: report.sessionId,
    reportType: report.reportType,
    status: report.status,
    totalScore: report.totalScore || 0,
    maxScore: report.maxScore || 0,
    completionRate: report.completionRate || 0,
    dimensionScores: report.dimensionScores || {},
    interpretation: report.interpretation,
    recommendations: report.recommendations || [],
    reportContent: report.reportContent,
    chartData: report.chartData || {},
    metadata: report.metadata || {},
    generatedAt: report.generatedAt || new Date(),
  };
}

async function ReportDetailContent({ reportId }: { reportId: string }) {
  const session = await getSessionFromCookie();

  if (!session?.user) {
    redirect('/auth/sign-in');
  }

  const report = await getReportDetail(reportId, session.user.id);

  if (!report) {
    notFound();
  }

  const severity = (report.metadata as any)?.severity || 'normal';

  return (
    <div className="container mx-auto space-y-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" asChild>
          <Link href="/reports">
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回报告列表
          </Link>
        </Button>

        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Share2 className="mr-2 h-4 w-4" />
            分享
          </Button>
          <DownloadReportPDFButton
            reportData={{
              id: report.id,
              scaleName: report.scaleName,
              scaleDescription: report.scaleDescription,
              totalScore: report.totalScore,
              maxScore: report.maxScore,
              completionRate: report.completionRate,
              dimensionScores: report.dimensionScores,
              interpretation: report.interpretation,
              severity: severity,
              recommendations: report.recommendations as string[],
              generatedAt: report.generatedAt,
              sessionId: report.sessionId,
              metadata: report.metadata,
            }}
            variant="default"
            size="sm"
          />
        </div>
      </div>

      {/* Report Summary */}
      <ReportSummary
        scaleName={report.scaleName}
        totalScore={report.totalScore}
        maxScore={report.maxScore}
        completionRate={report.completionRate}
        interpretation={report.interpretation}
        severity={severity}
        recommendations={report.recommendations as string[]}
        generatedAt={report.generatedAt}
      />

      {/* Visualizations */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Score Gauge */}
        <ScoreGauge
          score={report.totalScore}
          maxScore={report.maxScore}
          title="总分分析"
          description="整体评估得分"
          interpretation={report.interpretation}
          severity={severity}
        />

        {/* Dimension Radar */}
        <DimensionRadar
          dimensionScores={report.dimensionScores as any}
          title="维度分析"
          description="各维度得分分布"
        />
      </div>

      {/* Report Content */}
      {report.reportContent && (
        <Card>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none p-6">
            <div
              dangerouslySetInnerHTML={{
                __html: report.reportContent.replace(/\n/g, '<br />'),
              }}
            />
          </CardContent>
        </Card>
      )}

      {/* Meta Information */}
      <Card>
        <CardContent className="p-6">
          <h3 className="mb-4 text-lg font-semibold">报告信息</h3>
          <dl className="grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="font-medium text-muted-foreground">报告ID</dt>
              <dd className="mt-1 font-mono">{report.id}</dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">Session ID</dt>
              <dd className="mt-1 font-mono">{report.sessionId}</dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">生成时间</dt>
              <dd className="mt-1">
                {new Date(report.generatedAt).toLocaleString('zh-CN')}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">报告类型</dt>
              <dd className="mt-1 uppercase">{report.reportType}</dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">计分方法</dt>
              <dd className="mt-1">{(report.metadata as any)?.scoringMethod || 'sum'}</dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">状态</dt>
              <dd className="mt-1">
                <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20 dark:bg-green-500/10 dark:text-green-400 dark:ring-green-500/20">
                  {report.status === 'completed' && '已完成'}
                  {report.status === 'generating' && '生成中'}
                  {report.status === 'failed' && '失败'}
                </span>
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="container mx-auto space-y-6 py-8">
      <Card className="animate-pulse">
        <CardContent className="flex h-96 items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    </div>
  );
}

export default async function ReportDetailPage({ params }: ReportDetailPageProps) {
  const { reportId } = await params;

  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <ReportDetailContent reportId={reportId} />
    </Suspense>
  );
}
