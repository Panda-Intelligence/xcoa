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
import { useLanguage } from '@/hooks/useLanguage';

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
  const { t } = useLanguage();
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
    <div className="flex flex-col h-screen">
      <PageHeader
        items={[
          { href: "/scales", label: "Dashboard" },
          { href: "/scales/copyright", label: t('copyright.service_title') }
        ]}
      />

      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="batch-check" className="h-full flex flex-col">
          <div className="flex-shrink-0 border-b bg-background">
            <div className="p-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="batch-check">{t('copyright.batch_check')}</TabsTrigger>
                <TabsTrigger value="tickets">{t('copyright.my_contact_tickets')}</TabsTrigger>
                <TabsTrigger value="guidelines">{t('copyright.guidelines_tab')}</TabsTrigger>
              </TabsList>
            </div>
          </div>

          <div className="flex-1 overflow-auto">
            <div className="p-4">
              <TabsContent value="batch-check" className="space-y-4 m-0">
            {/* 量表选择 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="w-5 h-5" />
                  <span>{t('copyright.batch_check')}</span>
                </CardTitle>
                <CardDescription>
                  {t('copyright.batch_check_description')}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* 添加量表 */}
                <div className="flex space-x-2">
                  <Input
                    placeholder={t('copyright.search_scales_placeholder')}
                    value={scaleQuery}
                    onChange={(e) => setScaleQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && searchScales()}
                  />
                  <Button onClick={searchScales}>
                    <Search className="w-4 h-4 mr-2" />
                    {t('copyright.search')}
                  </Button>
                </div>

                {/* 搜索结果 */}
                {searchResults.length > 0 && (
                  <div className="border rounded-lg p-3">
                    <div className="text-sm font-medium mb-2">{t('copyright.search_results_click')}</div>
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
                            <Badge variant="secondary" className="ml-2">{t('copyright.added')}</Badge>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 已选择的量表 */}
                {scaleIds.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium">{t('copyright.selected_scales', { count: scaleIds.length })}</div>
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
                    <label htmlFor="intended-use" className="text-sm font-medium">{t('copyright.intended_use_label')}</label>
                    <select
                      id="intended-use"
                      value={checkParams.intendedUse}
                      onChange={(e) => setCheckParams(prev => ({ ...prev, intendedUse: e.target.value }))}
                      className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
                    >
                      <option value="clinical">{t('copyright.clinical_use')}</option>
                      <option value="research">{t('copyright.research_use')}</option>
                      <option value="education">{t('copyright.education_use')}</option>
                      <option value="commercial">{t('copyright.commercial_use')}</option>
                      <option value="personal">{t('copyright.personal_use')}</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="organization-type" className="text-sm font-medium">{t('copyright.organization_type_label')}</label>
                    <select
                      id="organization-type"
                      value={checkParams.organizationType}
                      onChange={(e) => setCheckParams(prev => ({ ...prev, organizationType: e.target.value }))}
                      className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
                    >
                      <option value="hospital">{t('copyright.hospital')}</option>
                      <option value="clinic">{t('copyright.clinic')}</option>
                      <option value="university">{t('copyright.university')}</option>
                      <option value="research_institute">{t('copyright.research_institute')}</option>
                      <option value="pharmaceutical">{t('copyright.pharmaceutical_company')}</option>
                      <option value="individual">{t('copyright.individual')}</option>
                    </select>
                  </div>
                </div>

                {/* 检查按钮 */}
                <Button
                  onClick={checkLicenses}
                  disabled={scaleIds.length === 0 || loading}
                  className="w-full"
                >
                  {loading ? t('copyright.checking') : t('copyright.check_licenses_button', { count: scaleIds.length })}
                </Button>
              </CardContent>
            </Card>

            {/* 检查结果 */}
            {summary && (
              <Card>
                <CardHeader>
                  <CardTitle>{t('copyright.license_check_results')}</CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* 汇总统计 */}
                  <div className="grid grid-cols-3 gap-4">
                    <Card className="p-3">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <div>
                          <div className="font-semibold">{summary.canUseDirectly}</div>
                          <div className="text-xs text-muted-foreground">{t('copyright.can_use_directly_count')}</div>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-3">
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="w-4 h-4 text-orange-600" />
                        <div>
                          <div className="font-semibold">{summary.needsContact}</div>
                          <div className="text-xs text-muted-foreground">{t('copyright.needs_contact_count')}</div>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-3">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="w-4 h-4 text-blue-600" />
                        <div>
                          <div className="font-semibold">{summary.estimatedCost?.free || 0}</div>
                          <div className="text-xs text-muted-foreground">{t('copyright.free_use_count')}</div>
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
                                {t('copyright.can_use_directly')}
                              </Badge>
                            ) : (
                              <Link href={`/scales/${result.scale.id}/copyright`}>
                                <Button size="sm" variant="outline">
                                  <Shield className="w-3 h-3 mr-1" />
                                  {t('copyright.contact_copyright_holder')}
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
                    <span>{t('copyright.my_contact_tickets')}</span>
                  </span>
                  <Link href="/scales/copyright/create">
                    <Button size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      {t('copyright.create_new_ticket')}
                    </Button>
                  </Link>
                </CardTitle>
                <CardDescription>
                  {t('copyright.track_requests')}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{t('copyright.no_tickets_created')}</p>
                  <p className="text-sm">{t('copyright.search_and_check')}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="guidelines" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('copyright.guidelines_title')}</CardTitle>
                <CardDescription>
                  {t('copyright.guidelines_description')}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="p-4 bg-green-50 border-green-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-xl">🆓</span>
                      <h4 className="font-semibold text-green-800">{t('copyright.public_domain_title')}</h4>
                    </div>
                    <p className="text-sm text-green-700 mb-2">
                      {t('copyright.public_domain_desc')}
                    </p>
                    <ul className="text-xs text-green-600 space-y-1">
                      <li>• {t('copyright.public_domain_item_1')}</li>
                      <li>• {t('copyright.public_domain_item_2')}</li>
                      <li>• {t('copyright.public_domain_item_3')}</li>
                    </ul>
                  </Card>

                  <Card className="p-4 bg-yellow-50 border-yellow-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-xl">🎓</span>
                      <h4 className="font-semibold text-yellow-800">{t('copyright.academic_free_title')}</h4>
                    </div>
                    <p className="text-sm text-yellow-700 mb-2">
                      {t('copyright.academic_free_desc')}
                    </p>
                    <ul className="text-xs text-yellow-600 space-y-1">
                      <li>• {t('copyright.academic_free_item_1')}</li>
                      <li>• {t('copyright.academic_free_item_2')}</li>
                      <li>• {t('copyright.academic_free_item_3')}</li>
                    </ul>
                  </Card>

                  <Card className="p-4 bg-orange-50 border-orange-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-xl">💼</span>
                      <h4 className="font-semibold text-orange-800">{t('copyright.commercial_license_title')}</h4>
                    </div>
                    <p className="text-sm text-orange-700 mb-2">
                      {t('copyright.commercial_license_desc')}
                    </p>
                    <ul className="text-xs text-orange-600 space-y-1">
                      <li>• {t('copyright.commercial_license_item_1')}</li>
                      <li>• {t('copyright.commercial_license_item_2')}</li>
                      <li>• {t('copyright.commercial_license_item_3')}</li>
                    </ul>
                  </Card>

                  <Card className="p-4 bg-red-50 border-red-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-xl">📧</span>
                      <h4 className="font-semibold text-red-800">{t('copyright.contact_required_title')}</h4>
                    </div>
                    <p className="text-sm text-red-700 mb-2">
                      {t('copyright.contact_required_desc')}
                    </p>
                    <ul className="text-xs text-red-600 space-y-1">
                      <li>• {t('copyright.contact_required_item_1')}</li>
                      <li>• {t('copyright.contact_required_item_2')}</li>
                      <li>• {t('copyright.contact_required_item_3')}</li>
                    </ul>
                  </Card>
                </div>

                <Card className="p-4 bg-blue-50 border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-3">{t('copyright.contact_best_practices')}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
                    <div>
                      <h5 className="font-medium mb-1">{t('copyright.email_contact_suggestions')}</h5>
                      <ul className="space-y-1 text-xs">
                        <li>• {t('copyright.email_tip_1')}</li>
                        <li>• {t('copyright.email_tip_2')}</li>
                        <li>• {t('copyright.email_tip_3')}</li>
                        <li>• {t('copyright.email_tip_4')}</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-medium mb-1">{t('copyright.expected_response_times')}</h5>
                      <ul className="space-y-1 text-xs">
                        <li>• {t('copyright.response_academic')}</li>
                        <li>• {t('copyright.response_commercial')}</li>
                        <li>• {t('copyright.response_government')}</li>
                        <li>• {t('copyright.response_individual')}</li>
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
                <CardTitle>{t('copyright.ticket_management')}</CardTitle>
                <CardDescription>{t('copyright.feature_coming_soon')}</CardDescription>
              </CardHeader>

              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{t('copyright.ticket_feature_dev')}</p>
                  <p className="text-sm">{t('copyright.use_detail_page')}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="guidelines">
            <Card>
              <CardHeader>
                <CardTitle>{t('copyright.compliance_guide')}</CardTitle>
                <CardDescription>{t('copyright.compliance_guide_desc')}</CardDescription>
              </CardHeader>

              <CardContent>
                <div className="prose max-w-none text-sm">
                  <h4>{t('copyright.importance_title')}</h4>
                  <p>
                    {t('copyright.importance_desc')}
                  </p>

                  <h4>{t('copyright.license_by_use_title')}</h4>
                  <ul>
                    <li><strong>{t('copyright.license_academic').split(':')[0]}:</strong> {t('copyright.license_academic').split(':')[1]}</li>
                    <li><strong>{t('copyright.license_clinical').split(':')[0]}:</strong> {t('copyright.license_clinical').split(':')[1]}</li>
                    <li><strong>{t('copyright.license_commercial').split(':')[0]}:</strong> {t('copyright.license_commercial').split(':')[1]}</li>
                    <li><strong>{t('copyright.license_trials').split(':')[0]}:</strong> {t('copyright.license_trials').split(':')[1]}</li>
                  </ul>

                  <h4>{t('copyright.application_process_title')}</h4>
                  <ol>
                    <li>{t('copyright.process_step_1')}</li>
                    <li>{t('copyright.process_step_2')}</li>
                    <li>{t('copyright.process_step_3')}</li>
                    <li>{t('copyright.process_step_4')}</li>
                    <li>{t('copyright.process_step_5')}</li>
                    <li>{t('copyright.process_step_6')}</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
            </div>
          </div>
        </Tabs>
      </div>
    </div>
  );
}