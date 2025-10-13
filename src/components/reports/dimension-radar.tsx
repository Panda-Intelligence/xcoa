'use client';

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface DimensionScore {
  dimension: string;
  score: number;
  maxScore: number;
  percentage: number;
}

interface DimensionRadarProps {
  dimensionScores: Record<string, DimensionScore>;
  title?: string;
  description?: string;
  className?: string;
}

export function DimensionRadar({
  dimensionScores,
  title = '维度分析',
  description = '各维度得分分布',
  className,
}: DimensionRadarProps) {
  // Prepare data for radar chart
  const data = Object.values(dimensionScores).map((dim) => ({
    dimension: dim.dimension,
    得分率: dim.percentage,
    得分: dim.score,
    满分: dim.maxScore,
  }));

  // If only one dimension, show a message
  if (data.length <= 1) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
            该量表无多维度评分
          </div>
        </CardContent>
      </Card>
    );
  }

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-lg border bg-background p-3 shadow-lg">
          <p className="font-medium">{data.dimension}</p>
          <p className="text-sm text-muted-foreground">
            得分: {data.得分.toFixed(1)} / {data.满分}
          </p>
          <p className="text-sm text-muted-foreground">
            得分率: {data.得分率.toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <RadarChart data={data}>
            <PolarGrid stroke="#e5e7eb" className="dark:stroke-gray-800" />
            <PolarAngleAxis
              dataKey="dimension"
              tick={{ fill: 'currentColor', fontSize: 12 }}
              className="text-foreground"
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={{ fill: 'currentColor', fontSize: 10 }}
              className="text-muted-foreground"
            />
            <Radar
              name="得分率"
              dataKey="得分率"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.6}
              strokeWidth={2}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
          </RadarChart>
        </ResponsiveContainer>

        {/* Dimension Details */}
        <div className="mt-4 space-y-2">
          {Object.values(dimensionScores).map((dim) => (
            <div key={dim.dimension} className="flex items-center justify-between text-sm">
              <span className="font-medium">{dim.dimension}</span>
              <span className="text-muted-foreground">
                {dim.score.toFixed(1)} / {dim.maxScore} ({dim.percentage.toFixed(1)}%)
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
