'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Clock, TrendingUp, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface ReportSummaryProps {
  scaleName: string;
  totalScore: number;
  maxScore: number;
  completionRate: number;
  interpretation?: string;
  severity?: string;
  recommendations?: string[];
  generatedAt?: Date | string;
  className?: string;
}

const SEVERITY_CONFIG = {
  normal: { label: '正常范围', color: 'bg-success/100', variant: 'default' as const },
  minimal: { label: '轻微', color: 'bg-lime-500', variant: 'secondary' as const },
  mild: { label: '轻度', color: 'bg-yellow-500', variant: 'secondary' as const },
  moderate: { label: '中度', color: 'bg-orange-500', variant: 'destructive' as const },
  severe: { label: '重度', color: 'bg-destructive/100', variant: 'destructive' as const },
};

export function ReportSummary({
  scaleName,
  totalScore,
  maxScore,
  completionRate,
  interpretation,
  severity = 'normal',
  recommendations = [],
  generatedAt,
  className,
}: ReportSummaryProps) {
  const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
  const severityConfig = SEVERITY_CONFIG[severity as keyof typeof SEVERITY_CONFIG] || SEVERITY_CONFIG.normal;

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-2xl">{scaleName}</CardTitle>
            <CardDescription>评估报告</CardDescription>
          </div>
          {generatedAt && (
            <Badge variant="outline" className="gap-1">
              <Clock className="h-3 w-3" />
              {formatDistanceToNow(new Date(generatedAt), {
                addSuffix: true,
                locale: zhCN,
              })}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Score Summary */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              总分
            </div>
            <div className="text-3xl font-bold">
              {totalScore.toFixed(1)}
              <span className="text-lg font-normal text-muted-foreground"> / {maxScore}</span>
            </div>
            <div className="text-sm text-muted-foreground">{percentage.toFixed(1)}%</div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              完成率
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold">{completionRate.toFixed(1)}%</div>
              <Progress value={completionRate} className="h-2" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
              评估结果
            </div>
            <div className="flex items-center gap-2">
              <div className={`h-3 w-3 rounded-full ${severityConfig.color}`} />
              <span className="text-lg font-semibold">{interpretation || severityConfig.label}</span>
            </div>
            <Badge variant={severityConfig.variant}>{severityConfig.label}</Badge>
          </div>
        </div>

        {/* Interpretation */}
        {interpretation && (
          <div className="space-y-2 rounded-lg border p-4">
            <h4 className="font-medium">结果解读</h4>
            <p className="text-sm text-muted-foreground">{interpretation}</p>
          </div>
        )}

        {/* Recommendations */}
        {recommendations && recommendations.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">专业建议</h4>
            <ul className="space-y-2">
              {recommendations.map((rec, index) => (
                <li key={index} className="flex gap-2 text-sm">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                    {index + 1}
                  </span>
                  <span className="text-muted-foreground">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Disclaimer */}
        <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
          <p>
            ⚠️ <strong>免责声明</strong>: 本报告由系统自动生成，仅供参考。具体诊断和治疗方案请咨询专业医师。
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
