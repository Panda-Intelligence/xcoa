'use client';

import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle2, AlertTriangle } from 'lucide-react';

interface UsageIndicatorProps {
  used: number;
  limit: number | null;
  label: string;
  showPercentage?: boolean;
  className?: string;
}

export function UsageIndicator({
  used,
  limit,
  label,
  showPercentage = true,
  className
}: UsageIndicatorProps) {
  if (limit === null) {
    return (
      <div className={cn("space-y-2", className)}>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span className="text-sm font-semibold text-green-600">无限制</span>
          </div>
        </div>
      </div>
    );
  }

  const percentage = Math.min((used / limit) * 100, 100);
  const isNearLimit = percentage >= 80;
  const isAtLimit = percentage >= 100;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <div className="flex items-center gap-2">
          {isAtLimit && <AlertCircle className="w-4 h-4 text-red-500" />}
          {!isAtLimit && isNearLimit && <AlertTriangle className="w-4 h-4 text-orange-500" />}
          <span
            className={cn(
              "text-sm font-semibold",
              isAtLimit && "text-red-600",
              !isAtLimit && isNearLimit && "text-orange-600",
              !isNearLimit && "text-gray-700"
            )}
          >
            {used} / {limit}
            {showPercentage && ` (${Math.round(percentage)}%)`}
          </span>
        </div>
      </div>

      <Progress
        value={percentage}
        className={cn(
          "h-2",
          isAtLimit && "[&>div]:bg-red-500",
          !isAtLimit && isNearLimit && "[&>div]:bg-orange-500",
          !isNearLimit && "[&>div]:bg-green-500"
        )}
      />

      {isNearLimit && !isAtLimit && (
        <p className="text-xs text-orange-600 mt-1">
          即将达到使用上限，请考虑升级计划
        </p>
      )}

      {isAtLimit && (
        <p className="text-xs text-red-600 mt-1 font-medium">
          已达到使用上限，升级以继续使用
        </p>
      )}
    </div>
  );
}