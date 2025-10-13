'use client';

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ScoreGaugeProps {
  score: number;
  maxScore: number;
  title?: string;
  description?: string;
  interpretation?: string;
  severity?: string;
  className?: string;
}

const SEVERITY_COLORS = {
  normal: '#10b981', // green
  minimal: '#84cc16', // lime
  mild: '#eab308', // yellow
  moderate: '#f97316', // orange
  severe: '#ef4444', // red
};

export function ScoreGauge({
  score,
  maxScore,
  title = '总分',
  description,
  interpretation,
  severity = 'normal',
  className,
}: ScoreGaugeProps) {
  const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;

  // Get color based on severity
  const gaugeColor = SEVERITY_COLORS[severity as keyof typeof SEVERITY_COLORS] || SEVERITY_COLORS.normal;

  // Prepare data for pie chart (semi-circle gauge)
  const data = [
    { name: 'score', value: percentage },
    { name: 'remaining', value: 100 - percentage },
  ];

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Gauge Chart */}
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="100%"
                startAngle={180}
                endAngle={0}
                innerRadius={60}
                outerRadius={100}
                dataKey="value"
                stroke="none"
              >
                <Cell fill={gaugeColor} />
                <Cell fill="#e5e7eb" className="dark:fill-gray-800" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Score Display in Center */}
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-4">
            <div className="text-4xl font-bold" style={{ color: gaugeColor }}>
              {score.toFixed(1)}
            </div>
            <div className="text-sm text-muted-foreground">
              / {maxScore} ({percentage.toFixed(1)}%)
            </div>
          </div>
        </div>

        {/* Interpretation */}
        {interpretation && (
          <div className="mt-6 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">评估结果</span>
              <span
                className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                style={{ backgroundColor: `${gaugeColor}20`, color: gaugeColor }}
              >
                {interpretation}
              </span>
            </div>
          </div>
        )}

        {/* Severity Legend */}
        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          {Object.entries(SEVERITY_COLORS).map(([level, color]) => (
            <div key={level} className="flex items-center gap-1">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className="capitalize text-muted-foreground">
                {level === 'normal' && '正常'}
                {level === 'minimal' && '轻微'}
                {level === 'mild' && '轻度'}
                {level === 'moderate' && '中度'}
                {level === 'severe' && '重度'}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
