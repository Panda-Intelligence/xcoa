'use client';

import { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import {
  Shield,
  ArrowLeft,
  Mail,
  Phone,
  Globe,
  Building,
  CheckCircle,
  AlertCircle,
  Send,
  ExternalLink,
  FileText,
  Clock,
  DollarSign
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';

interface CopyrightPageProps {
  params: Promise<{ scaleId: string }>;
}

export default function ScaleCopyrightPage({ params }: CopyrightPageProps) {
  const [scaleId, setScaleId] = useState<string>('');
  const [copyrightInfo, setCopyrightInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [contactForm, setContactForm] = useState({
    requestType: 'license_inquiry',
    intendedUse: 'research',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    organizationName: '',
    message: '',
  });

  useEffect(() => {
    async function loadParams() {
      const resolvedParams = await params;
      setScaleId(resolvedParams.scaleId);
    }
    loadParams();
  }, [params]);

  useEffect(() => {
    if (!scaleId) return;
    
    fetch(`/api/scales/${scaleId}/copyright`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          notFound();
        } else {
          setCopyrightInfo(data);
        }
      })
      .catch(err => {
        console.error('Failed to load copyright info:', err);
        notFound();
      })
      .finally(() => setLoading(false));
  }, [scaleId]);

  const handleContactSubmit = async () => {
    try {
      const response = await fetch(`/api/scales/${scaleId}/copyright`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...contactForm,
          scaleId: scaleId
        }),
      });

      const result = await response.json();

      if (response.ok) {
        const emailTemplate = result.emailTemplate;
        const mailtoUrl = `mailto:${result.copyrightHolder.email}?subject=${encodeURIComponent(emailTemplate.subject)}&body=${encodeURIComponent(emailTemplate.body)}`;

        window.open(mailtoUrl, '_blank');
        setContactDialogOpen(false);

        alert('邮件模板已生成，请查看您的邮件客户端');
      } else {
        alert(`联系请求失败: ${result.error}`);
      }
    } catch (error) {
      console.error('Error submitting contact request:', error);
      alert('提交联系请求时发生错误');
    }
  };

  const getLicenseColorClass = (color: string) => {
    const colorMap = {
      green: 'bg-green-50 text-green-700 border-green-200',
      blue: 'bg-blue-50 text-blue-700 border-blue-200',
      yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      orange: 'bg-orange-50 text-orange-700 border-orange-200',
      red: 'bg-red-50 text-red-700 border-red-200',
      gray: 'bg-gray-50 text-gray-700 border-gray-200',
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.gray;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!copyrightInfo) {
    notFound();
  }

  const { scale, copyright, actions } = copyrightInfo;

  return (
    <div className="min-h-screen bg-background">
      {/* 头部导航 */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard/scales">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  返回搜索
                </Button>
              </Link>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4" />
                <span className="text-sm font-medium">{scale.acronym} 版权信息</span>
              </div>
            </div>

            <div className="flex space-x-2">
              <Link href={`/scales/${scale.id}`}>
                <Button variant="outline" size="sm">
                  <FileText className="w-4 h-4 mr-2" />
                  查看量表详情
                </Button>
              </Link>
              <Link href={`/scales/${scale.id}/preview`}>
                <Button variant="outline" size="sm">
                  预览量表
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* 量表基本信息 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{scale.name}</CardTitle>
              <CardDescription className="text-lg">
                {scale.nameEn} • {scale.category}
              </CardDescription>
            </CardHeader>
          </Card>

          {/* 许可类型显示 */}
          <Card className={`border-2 ${getLicenseColorClass(copyright.license.color)}`}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <span className="text-3xl">{copyright.license.icon}</span>
                <div>
                  <div className="text-xl">{copyright.license.title}</div>
                  <div className="text-sm opacity-80 font-normal">
                    {copyright.license.description}
                  </div>
                </div>
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center space-x-2">
                  {actions.canUseDirectly ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-orange-600" />
                  )}
                  <span className="text-sm">
                    {actions.canUseDirectly ? '可直接使用' : '需要许可'}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-blue-600" />
                  <span className="text-sm">
                    {copyright.license.typicalCost === 'FREE' ? '免费' :
                      copyright.license.typicalCost === 'PAID' ? '付费' : '咨询定价'}
                  </span>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2 text-blue-900">使用指导</h4>
                <p className="text-sm text-blue-800">
                  {copyright.license.usageGuidelines}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 版权声明 */}
          <Card>
            <CardHeader>
              <CardTitle>版权声明</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm bg-gray-50 p-4 rounded border-l-4 border-gray-300">
                {copyright.info}
              </p>
            </CardContent>
          </Card>

          {/* 版权方联系信息 */}
          {copyright.contact && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building className="w-5 h-5" />
                  <span>版权方联系信息</span>
                </CardTitle>
                <CardDescription>
                  {copyright.contact.organization}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {copyright.contact.email && (
                    <Button variant="outline" asChild className="justify-start">
                      <a href={`mailto:${copyright.contact.email}`}>
                        <Mail className="w-4 h-4 mr-2" />
                        邮箱联系
                      </a>
                    </Button>
                  )}

                  {copyright.contact.phone && (
                    <Button variant="outline" asChild className="justify-start">
                      <a href={`tel:${copyright.contact.phone}`}>
                        <Phone className="w-4 h-4 mr-2" />
                        电话联系
                      </a>
                    </Button>
                  )}

                  {copyright.contact.website && (
                    <Button variant="outline" asChild className="justify-start">
                      <a href={copyright.contact.website} target="_blank" rel="noopener noreferrer">
                        <Globe className="w-4 h-4 mr-2" />
                        官方网站
                        <ExternalLink className="w-3 h-3 ml-2" />
                      </a>
                    </Button>
                  )}
                </div>

                {/* 专业联系服务 */}
                {!actions.canUseDirectly && (
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">专业联系服务</h4>
                        <p className="text-sm text-muted-foreground">
                          通过 xCOA 平台发起专业的许可联系请求
                        </p>
                      </div>

                      <Dialog open={contactDialogOpen} onOpenChange={setContactDialogOpen}>
                        <DialogTrigger asChild>
                          <Button>
                            <Send className="w-4 h-4 mr-2" />
                            发起联系
                          </Button>
                        </DialogTrigger>

                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>联系版权方</DialogTitle>
                            <DialogDescription>
                              为 {scale.name} ({scale.acronym}) 申请使用许可
                            </DialogDescription>
                          </DialogHeader>

                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>请求类型</Label>
                                <Select value={contactForm.requestType} onValueChange={(value) =>
                                  setContactForm(prev => ({ ...prev, requestType: value }))}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="license_inquiry">许可咨询</SelectItem>
                                    <SelectItem value="usage_request">使用申请</SelectItem>
                                    <SelectItem value="pricing_info">价格咨询</SelectItem>
                                    <SelectItem value="support">技术支持</SelectItem>
                                    <SelectItem value="other">其他</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div>
                                <Label>预期用途</Label>
                                <Select value={contactForm.intendedUse} onValueChange={(value) =>
                                  setContactForm(prev => ({ ...prev, intendedUse: value }))}>
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
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>联系人姓名 *</Label>
                                <Input
                                  value={contactForm.contactName}
                                  onChange={(e) => setContactForm(prev => ({ ...prev, contactName: e.target.value }))}
                                  placeholder="您的姓名"
                                  required
                                />
                              </div>

                              <div>
                                <Label>联系邮箱 *</Label>
                                <Input
                                  type="email"
                                  value={contactForm.contactEmail}
                                  onChange={(e) => setContactForm(prev => ({ ...prev, contactEmail: e.target.value }))}
                                  placeholder="your.email@example.com"
                                  required
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>机构名称</Label>
                                <Input
                                  value={contactForm.organizationName}
                                  onChange={(e) => setContactForm(prev => ({ ...prev, organizationName: e.target.value }))}
                                  placeholder="您的机构名称"
                                />
                              </div>

                              <div>
                                <Label>联系电话 (可选)</Label>
                                <Input
                                  value={contactForm.contactPhone}
                                  onChange={(e) => setContactForm(prev => ({ ...prev, contactPhone: e.target.value }))}
                                  placeholder="+86 138 0000 0000"
                                />
                              </div>
                            </div>

                            <div>
                              <Label>详细说明</Label>
                              <Textarea
                                value={contactForm.message}
                                onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                                placeholder="请详细说明您的使用需求、项目背景和其他相关信息..."
                                className="min-h-[100px]"
                              />
                            </div>

                            <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                              <div className="flex items-center space-x-2 text-yellow-800">
                                <Clock className="w-4 h-4" />
                                <span className="text-sm font-medium">预期回复时间: 1-5个工作日</span>
                              </div>
                              <p className="text-xs text-yellow-700 mt-1">
                                我们会自动为您生成专业的联系邮件，您可以直接发送给版权方
                              </p>
                            </div>

                            <div className="flex justify-end space-x-2">
                              <Button variant="outline" onClick={() => setContactDialogOpen(false)}>
                                取消
                              </Button>
                              <Button
                                onClick={handleContactSubmit}
                                disabled={!contactForm.contactName || !contactForm.contactEmail}
                              >
                                <Send className="w-4 h-4 mr-2" />
                                生成联系邮件
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* 行动建议 */}
          <Card>
            <CardHeader>
              <CardTitle>下一步行动</CardTitle>
            </CardHeader>

            <CardContent>
              {actions.canUseDirectly ? (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-green-600">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">该量表可以直接使用</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    您可以在遵守版权声明的前提下直接使用该量表，无需额外许可。
                  </p>
                  <div className="flex space-x-2">
                    <Link href={`/scales/${scale.id}`}>
                      <Button>
                        <FileText className="w-4 h-4 mr-2" />
                        查看量表详情
                      </Button>
                    </Link>
                    <Link href={`/scales/${scale.id}/download`}>
                      <Button variant="outline">
                        下载量表
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-orange-600">
                    <AlertCircle className="w-5 h-5" />
                    <span className="font-medium">使用前需要获得许可</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    请联系版权方获得使用许可，我们建议您详细说明使用目的和项目背景。
                  </p>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">联系建议</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• 详细说明您的使用目的和项目背景</li>
                      <li>• 提供您的专业机构信息和联系方式</li>
                      <li>• 询问具体的许可要求和可能的费用</li>
                      <li>• 了解许可的有效期和使用范围限制</li>
                    </ul>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 常见问题 */}
          <Card>
            <CardHeader>
              <CardTitle>常见问题</CardTitle>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-1">Q: 学术研究使用是否需要付费？</h4>
                  <p className="text-sm text-muted-foreground">
                    A: 大多数量表对学术研究提供免费或优惠许可，具体需要联系版权方确认。
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-1">Q: 商业用途的许可费用大概是多少？</h4>
                  <p className="text-sm text-muted-foreground">
                    A: 费用因量表和使用范围而异，从数百到数万元不等，建议直接咨询版权方。
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-1">Q: 许可申请通常需要多长时间？</h4>
                  <p className="text-sm text-muted-foreground">
                    A: 一般1-5个工作日收到回复，复杂的商业许可可能需要2-4周。
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}