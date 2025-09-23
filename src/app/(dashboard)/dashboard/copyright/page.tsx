'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Shield,
  Search,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  DollarSign,
  Plus
} from 'lucide-react';
import Link from 'next/link';

interface LicenseResult {
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
    icon: string;
    color: string;
  };
  recommendation: {
    action: string;
    priority: string;
    timeEstimate: string;
  };
}

export default function CopyrightPage() {
  const [scaleIds, setScaleIds] = useState<string[]>([]);
  const [scaleQuery, setScaleQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [licenseResults, setLicenseResults] = useState<LicenseResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<any>(null);
  const [checkParams, setCheckParams] = useState({
    intendedUse: 'research',
    organizationType: 'university',
  });

  // 搜索量表以添加到批量检查
  const searchScales = async () => {
    if (!scaleQuery.trim()) return;

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: scaleQuery, limit: 10 }),
      });

      const data = await response.json();
      setSearchResults((data as { results?: unknown[] }).results || []);
    } catch (error) {
      console.error('Scale search failed:', error);
    }
  };

  // 添加量表到检查列表
  const addScale = (scaleId: string) => {
    if (!scaleIds.includes(scaleId)) {
      setScaleIds(prev => [...prev, scaleId]);
    }
    setSearchResults([]);
    setScaleQuery('');
  };

  // 移除量表
  const removeScale = (scaleId: string) => {
    setScaleIds(prev => prev.filter(id => id !== scaleId));
  };

  // 批量检查许可
  const checkLicenses = async () => {
    if (scaleIds.length === 0) return;

    setLoading(true);
    try {
      const response = await fetch('/api/licenses/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scaleIds, ...checkParams }),
      });

      const data = await response.json();
      const typedData = data as { results?: LicenseResult[], summary?: unknown };
      setLicenseResults(typedData.results || []);
      setSummary(typedData.summary || null);
    } catch (error) {
      console.error('License check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLicenseColorClass = (color: string) => {
    const colorMap = {
      green: 'bg-green-50 text-green-700 border-green-200',
      yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      orange: 'bg-orange-50 text-orange-700 border-orange-200',
      red: 'bg-red-50 text-red-700 border-red-200',
    };
    return colorMap[color as keyof typeof colorMap] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  return (
    <>
      <PageHeader
        items={[
          { href: "/dashboard", label: "Dashboard" },
          { href: "/dashboard/copyright", label: "版权服务" }
        ]}
      />

      <div className="flex flex-1 flex-col gap-4 p-4">
        <Tabs defaultValue="batch-check" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="batch-check">批量许可检查</TabsTrigger>
            <TabsTrigger value="tickets">我的工单</TabsTrigger>
            <TabsTrigger value="guidelines">使用指南</TabsTrigger>
          </TabsList>

          <TabsContent value="batch-check" className="space-y-4">
            {/* 量表选择 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="w-5 h-5" />
                  <span>批量许可检查</span>
                </CardTitle>
                <CardDescription>
                  一次性检查多个量表的使用许可状态
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* 添加量表 */}
                <div className="flex space-x-2">
                  <Input
                    placeholder="搜索要检查的量表..."
                    value={scaleQuery}
                    onChange={(e) => setScaleQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && searchScales()}
                  />
                  <Button onClick={searchScales}>
                    <Search className="w-4 h-4 mr-2" />
                    搜索
                  </Button>
                </div>

                {/* 搜索结果 */}
                {searchResults.length > 0 && (
                  <div className="border rounded-lg p-3">
                    <div className="text-sm font-medium mb-2">搜索结果 (点击添加):</div>
                    <div className="space-y-1">
                      {searchResults.map((result) => (
                        <button
                          type="button"
                          key={result.id}
                          onClick={() => addScale(result.id)}
                          className="w-full text-left p-2 rounded hover:bg-gray-50 text-sm"
                          disabled={scaleIds.includes(result.id)}
                        >
                          <span className="font-medium">{result.name}</span>
                          <span className="text-muted-foreground ml-2">({result.acronym})</span>
                          {scaleIds.includes(result.id) && (
                            <Badge variant="secondary" className="ml-2">已添加</Badge>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 已选择的量表 */}
                {scaleIds.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium">已选择的量表 ({scaleIds.length}):</div>
                    <div className="flex flex-wrap gap-2">
                      {scaleIds.map((scaleId) => (
                        <Badge key={scaleId} variant="outline" className="pr-1">
                          {scaleId.replace('scale_', '').toUpperCase()}
                          <button
                            type="button"
                            onClick={() => removeScale(scaleId)}
                            className="ml-1 text-muted-foreground hover:text-foreground"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* 检查参数 */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="intended-use" className="text-sm font-medium">预期用途</label>
                    <select
                      id="intended-use"
                      value={checkParams.intendedUse}
                      onChange={(e) => setCheckParams(prev => ({ ...prev, intendedUse: e.target.value }))}
                      className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
                    >
                      <option value="clinical">临床使用</option>
                      <option value="research">科研用途</option>
                      <option value="education">教育培训</option>
                      <option value="commercial">商业用途</option>
                      <option value="personal">个人使用</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="organization-type" className="text-sm font-medium">机构类型</label>
                    <select
                      id="organization-type"
                      value={checkParams.organizationType}
                      onChange={(e) => setCheckParams(prev => ({ ...prev, organizationType: e.target.value }))}
                      className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
                    >
                      <option value="hospital">医院</option>
                      <option value="clinic">诊所</option>
                      <option value="university">大学</option>
                      <option value="research_institute">研究机构</option>
                      <option value="pharmaceutical">制药公司</option>
                      <option value="individual">个人</option>
                    </select>
                  </div>
                </div>

                {/* 检查按钮 */}
                <Button
                  onClick={checkLicenses}
                  disabled={scaleIds.length === 0 || loading}
                  className="w-full"
                >
                  {loading ? '检查中...' : `检查 ${scaleIds.length} 个量表的许可状态`}
                </Button>
              </CardContent>
            </Card>

            {/* 检查结果 */}
            {summary && (
              <Card>
                <CardHeader>
                  <CardTitle>许可检查结果</CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* 汇总统计 */}
                  <div className="grid grid-cols-3 gap-4">
                    <Card className="p-3">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
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
                        <DollarSign className="w-4 h-4 text-blue-600" />
                        <div>
                          <div className="font-semibold">{summary.estimatedCost?.free || 0}</div>
                          <div className="text-xs text-muted-foreground">免费使用</div>
                        </div>
                      </div>
                    </Card>
                  </div>

                  {/* 详细结果 */}
                  <div className="space-y-2">
                    {licenseResults.map((result) => (
                      <Card key={result.scale.id} className={`p-4 border ${getLicenseColorClass(result.license.color)}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <span className="text-xl">{result.license.icon}</span>
                            <div>
                              <div className="font-medium">
                                {result.scale.name} ({result.scale.acronym})
                              </div>
                              <div className="text-sm opacity-80">
                                {result.license.title} • {result.recommendation.timeEstimate}
                              </div>
                            </div>
                          </div>

                          <div className="flex space-x-2">
                            {result.license.canUseDirectly ? (
                              <Badge variant="default" className="bg-green-100 text-green-800">
                                可直接使用
                              </Badge>
                            ) : (
                              <Link href={`/scales/${result.scale.id}/copyright`}>
                                <Button size="sm" variant="outline">
                                  <Shield className="w-3 h-3 mr-1" />
                                  联系版权方
                                </Button>
                              </Link>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="tickets" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center space-x-2">
                    <MessageSquare className="w-5 h-5" />
                    <span>我的联系工单</span>
                  </span>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    创建新工单
                  </Button>
                </CardTitle>
                <CardDescription>
                  跟踪您的版权联系请求状态
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>您还没有创建任何工单</p>
                  <p className="text-sm">搜索量表并检查许可状态以开始</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="guidelines" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>版权使用指南</CardTitle>
                <CardDescription>
                  了解不同许可类型和使用要求
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="p-4 bg-green-50 border-green-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-xl">🆓</span>
                      <h4 className="font-semibold text-green-800">公共领域</h4>
                    </div>
                    <p className="text-sm text-green-700 mb-2">
                      可自由使用，无需特殊许可
                    </p>
                    <ul className="text-xs text-green-600 space-y-1">
                      <li>• 适用于所有用途</li>
                      <li>• 建议保留原始版权声明</li>
                      <li>• 示例: HAM-D, HAM-A</li>
                    </ul>
                  </Card>

                  <Card className="p-4 bg-yellow-50 border-yellow-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-xl">🎓</span>
                      <h4 className="font-semibold text-yellow-800">学术免费</h4>
                    </div>
                    <p className="text-sm text-yellow-700 mb-2">
                      学术研究免费，商业需要许可
                    </p>
                    <ul className="text-xs text-yellow-600 space-y-1">
                      <li>• 教育和研究用途免费</li>
                      <li>• 商业用途需要联系</li>
                      <li>• 示例: MoCA, EORTC QLQ-C30</li>
                    </ul>
                  </Card>

                  <Card className="p-4 bg-orange-50 border-orange-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-xl">💼</span>
                      <h4 className="font-semibold text-orange-800">商业许可</h4>
                    </div>
                    <p className="text-sm text-orange-700 mb-2">
                      需要购买许可证使用
                    </p>
                    <ul className="text-xs text-orange-600 space-y-1">
                      <li>• 所有用途均需要许可</li>
                      <li>• 通常涉及许可费用</li>
                      <li>• 示例: BDI-II, MMSE-2</li>
                    </ul>
                  </Card>

                  <Card className="p-4 bg-red-50 border-red-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-xl">📧</span>
                      <h4 className="font-semibold text-red-800">需联系版权方</h4>
                    </div>
                    <p className="text-sm text-red-700 mb-2">
                      使用前必须联系确认
                    </p>
                    <ul className="text-xs text-red-600 space-y-1">
                      <li>• 许可条件因用途而异</li>
                      <li>• 建议详细说明使用目的</li>
                      <li>• 示例: PHQ-9, GAD-7</li>
                    </ul>
                  </Card>
                </div>

                <Card className="p-4 bg-blue-50 border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-3">联系版权方的最佳实践</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
                    <div>
                      <h5 className="font-medium mb-1">邮件联系建议:</h5>
                      <ul className="space-y-1 text-xs">
                        <li>• 使用专业邮箱地址</li>
                        <li>• 详细说明使用目的</li>
                        <li>• 提供机构信息</li>
                        <li>• 询问具体许可要求</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-medium mb-1">预期响应时间:</h5>
                      <ul className="space-y-1 text-xs">
                        <li>• 学术机构: 3-5个工作日</li>
                        <li>• 商业公司: 1-2个工作日</li>
                        <li>• 政府机构: 5-10个工作日</li>
                        <li>• 个人咨询: 7-14个工作日</li>
                      </ul>
                    </div>
                  </div>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tickets">
            <Card>
              <CardHeader>
                <CardTitle>联系工单管理</CardTitle>
                <CardDescription>功能开发中，即将上线</CardDescription>
              </CardHeader>

              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>工单管理功能正在开发中</p>
                  <p className="text-sm">请暂时使用量表详情页面的版权联系功能</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="guidelines">
            <Card>
              <CardHeader>
                <CardTitle>版权合规指南</CardTitle>
                <CardDescription>详细的版权使用规范和建议</CardDescription>
              </CardHeader>

              <CardContent>
                <div className="prose max-w-none text-sm">
                  <h4>版权合规的重要性</h4>
                  <p>
                    使用未经授权的评估量表可能面临法律风险，包括版权侵权诉讼和经济损失。
                    xCOA 平台帮助您识别许可要求并联系版权方获得合法授权。
                  </p>

                  <h4>不同用途的许可要求</h4>
                  <ul>
                    <li><strong>学术研究:</strong> 通常享有优惠或免费许可</li>
                    <li><strong>临床实践:</strong> 可能需要机构许可</li>
                    <li><strong>商业用途:</strong> 通常需要付费许可</li>
                    <li><strong>药物试验:</strong> 需要严格的许可和监管合规</li>
                  </ul>

                  <h4>许可申请流程</h4>
                  <ol>
                    <li>确定量表的版权状态和许可类型</li>
                    <li>准备详细的使用说明和项目信息</li>
                    <li>联系版权方或通过 xCOA 平台发起联系</li>
                    <li>等待回复并协商许可条件</li>
                    <li>签署许可协议并支付相关费用</li>
                    <li>在许可范围内合规使用</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}