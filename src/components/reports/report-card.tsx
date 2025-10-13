'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Download, Eye, Calendar, TrendingUp } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import Link from 'next/link';

interface ReportCardProps {
  report: {
    id: string;
    scaleId: string;
    scaleName: string;
    sessionId: string;
    reportType: string;
    status: string;
    totalScore: number;
    maxScore: number;
    completionRate: number;
    interpretation?: string;
    generatedAt: Date | string;
    reportUrl?: string;
  };
  onView?: (reportId: string) => void;
  onDownload?: (reportId: string) => void;
  className?: string;
}

const STATUS_CONFIG = {
  generating: { label: '生成中', color: 'bg-blue-500', variant: 'secondary' as const },
  completed: { label: '已完成', color: 'bg-green-500', variant: 'default' as const },
  failed: { label: '生成失败', color: 'bg-red-500', variant: 'destructive' as const },
};

const REPORT_TYPE_ICONS = {
  pdf: '📄',
  html: '🌐',
  text: '📝',
};

export function ReportCard({ report, onView, onDownload, className }: ReportCardProps) {
  const statusConfig = STATUS_CONFIG[report.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.completed;
  const percentage = report.maxScore > 0 ? (report.totalScore / report.maxScore) * 100 : 0;
  const reportIcon = REPORT_TYPE_ICONS[report.reportType as keyof typeof REPORT_TYPE_ICONS] || '📄';

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-2xl">
              {reportIcon}
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold leading-none">{report.scaleName}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {format(new Date(report.generatedAt), 'yyyy-MM-dd HH:mm', {
                  locale: zhCN,
                })}
                <span className="text-xs">
                  ({formatDistanceToNow(new Date(report.generatedAt), {
                    addSuffix: true,
                    locale: zhCN,
                  })})
                </span>
              </div>
            </div>
          </div>
          <Badge variant={statusConfig.variant} className="gap-1">
            <div className={`h-2 w-2 rounded-full ${statusConfig.color}`} />
            {statusConfig.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Score Display */}
        <div className="flex items-center justify-between rounded-lg border p-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">总分</span>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold">
              {report.totalScore.toFixed(1)} / {report.maxScore}
            </div>
            <div className="text-xs text-muted-foreground">{percentage.toFixed(1)}%</div>
          </div>
        </div>

        {/* Interpretation */}
        {report.interpretation && (
          <div className="text-sm">
            <span className="font-medium">评估结果: </span>
            <span className="text-muted-foreground">{report.interpretation}</span>
          </div>
        )}

        {/* Completion Rate */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">完成率</span>
          <span className="font-medium">{report.completionRate.toFixed(1)}%</span>
        </div>

        {/* Session ID */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Session ID</span>
          <code className="rounded bg-muted px-1 py-0.5 font-mono">
            {report.sessionId.substring(0, 12)}...
          </code>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          {report.reportUrl ? (
            <Button asChild className="flex-1" variant="default">
              <Link href={report.reportUrl}>
                <Eye className="mr-2 h-4 w-4" />
                查看报告
              </Link>
            </Button>
          ) : onView ? (
            <Button className="flex-1" variant="default" onClick={() => onView(report.id)}>
              <Eye className="mr-2 h-4 w-4" />
              查看报告
            </Button>
          ) : null}

          {onDownload && report.status === 'completed' && (
            <Button variant="outline" onClick={() => onDownload(report.id)}>
              <Download className="h-4 w-4" />
            </Button>
          )}

          <Button variant="outline" asChild>
            <Link href={`/dashboard/scales/${report.scaleId}`}>
              <FileText className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
