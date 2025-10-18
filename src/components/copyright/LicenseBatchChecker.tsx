'use client';

import { useState } from 'react';
import {
  Shield,
  CheckCircle,
  AlertCircle,
  Clock,
  DollarSign,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface LicenseCheckResult {
  scale: {
    id: string;
    name: string;
    acronym: string;
    category: string;
  };
  license: {
    title: string;
    canUseDirectly: boolean;
    requiresPermission: boolean;
    typicalCost: string;
    restrictions: string[];
    icon: string;
    color: string;
  };
  recommendation: {
    action: string;
    priority: string;
    timeEstimate: string;
  };
}

interface LicenseBatchCheckerProps {
  scaleIds: string[];
  onLicenseCheck?: (results: LicenseCheckResult[]) => void;
}

export function LicenseBatchChecker({ scaleIds, onLicenseCheck }: LicenseBatchCheckerProps) {
  const [results, setResults] = useState<LicenseCheckResult[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [checkParams, setCheckParams] = useState({
    intendedUse: 'research',
    organizationType: 'university',
    country: 'CN',
  });

  const handleLicenseCheck = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/licenses/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scaleIds,
          ...checkParams,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResults(data.results);
        setSummary(data.summary);
        onLicenseCheck?.(data.results);
      } else {
        console.error('License check failed:', data.error);
      }
    } catch (error) {
      console.error('Error checking licenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLicenseIcon = (canUse: boolean, requiresPermission: boolean) => {
    if (canUse) return <CheckCircle className="w-4 h-4 text-success" />;
    if (requiresPermission) return <AlertCircle className="w-4 h-4 text-orange-600" />;
    return <Clock className="w-4 h-4 text-muted-foreground" />;
  };

  const getLicenseStatusText = (canUse: boolean, requiresPermission: boolean) => {
    if (canUse) return '可直接使用';
    if (requiresPermission) return '需要许可';
    return '状态未知';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Shield className="w-5 h-5" />
          <span>批量许可检查</span>
        </CardTitle>
        <CardDescription>
          检查 {scaleIds.length} 个量表的使用许可状态
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 检查参数设置 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">预期用途</label>
            <Select value={checkParams.intendedUse} onValueChange={(value) =>
              setCheckParams(prev => ({ ...prev, intendedUse: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="clinical">临床使用</SelectItem>
                <SelectItem value="research">科研用途</SelectItem>
                <SelectItem value="education">教育培训</SelectItem>
                <SelectItem value="commercial">商业用途</SelectItem>
                <SelectItem value="personal">个人使用</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium">机构类型</label>
            <Select value={checkParams.organizationType} onValueChange={(value) =>
              setCheckParams(prev => ({ ...prev, organizationType: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hospital">医院</SelectItem>
                <SelectItem value="clinic">诊所</SelectItem>
                <SelectItem value="university">大学</SelectItem>
                <SelectItem value="research_institute">研究机构</SelectItem>
                <SelectItem value="pharmaceutical">制药公司</SelectItem>
                <SelectItem value="individual">个人</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          onClick={handleLicenseCheck}
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              检查中...
            </>
          ) : (
            <>
              <Shield className="w-4 h-4 mr-2" />
              检查许可状态
            </>
          )}
        </Button>

        {/* 检查结果汇总 */}
        {summary && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <Card className="p-3">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  <div>
                    <div className="font-semibold">{summary.canUseDirectly}</div>
                    <div className="text-xs text-muted-foreground">可直接使用</div>
                  </div>
                </div>
              </Card>

              <Card className="p-3">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-orange-600" />
                  <div>
                    <div className="font-semibold">{summary.needsContact}</div>
                    <div className="text-xs text-muted-foreground">需要联系</div>
                  </div>
                </div>
              </Card>

              <Card className="p-3">
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-primary" />
                  <div>
                    <div className="font-semibold">{summary.estimatedCost.free}</div>
                    <div className="text-xs text-muted-foreground">免费使用</div>
                  </div>
                </div>
              </Card>
            </div>

            {/* 详细结果列表 */}
            <div className="space-y-2">
              <h5 className="font-medium">详细许可状态</h5>
              {results.map((result) => (
                <Card key={result.scale.id} className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{result.license.icon}</span>
                      <div>
                        <div className="font-medium">
                          {result.scale.name} ({result.scale.acronym})
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {result.scale.category}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {getLicenseIcon(result.license.canUseDirectly, result.license.requiresPermission)}
                      <span className="text-sm">
                        {getLicenseStatusText(result.license.canUseDirectly, result.license.requiresPermission)}
                      </span>
                      <Badge variant={result.license.color === 'green' ? 'default' : 'secondary'}>
                        {result.license.title}
                      </Badge>
                    </div>
                  </div>

                  {result.license.restrictions.length > 0 && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      限制: {result.license.restrictions.join(', ')}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}