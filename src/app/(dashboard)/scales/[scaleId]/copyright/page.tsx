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
import { useLanguage } from '@/hooks/useLanguage';
import Link from 'next/link';
import { useToast } from '@/hooks/useToast';
import { FeatureGate } from '@/components/subscription/feature-gate';
import { ENTERPRISE_FEATURES } from '@/constants/plans';

interface CopyrightPageProps {
  params: Promise<{ scaleId: string }>;
}

export default function ScaleCopyrightPage({ params }: CopyrightPageProps) {
  const { t } = useLanguage();
  const toast = useToast();
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

        toast.success(t('copyright.email_template_generated'));
      } else {
        toast.error(t('copyright.contact_request_failed') + `: ${result.error}`);
      }
    } catch (error) {
      console.error('Error submitting contact request:', error);
      toast.error(t('copyright.submit_error'));
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
    <FeatureGate
      feature={ENTERPRISE_FEATURES.COPYRIGHT_VIEW}
      featureName={t('features.copyright_info', '版权信息查看')}
      featureDescription={t('features.copyright_desc', '查看量表版权详情并申请许可')}
    >
    <div className="flex flex-col h-screen bg-background">
      {/* 头部导航 - 固定 */}
      <div className="flex-shrink-0 bg-white border-b z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/scales/search">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {t("scale_copyright.back_to_details")}
                </Button>
              </Link>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4" />
                <span className="text-sm font-medium">{scale.acronym} {t("scale_copyright.title")}</span>
              </div>
            </div>

            <div className="flex space-x-2">
              <Link href={`/scales/${scale.id}`}>
                <Button variant="outline" size="sm">
                  <FileText className="w-4 h-4 mr-2" />
                  {t('copyright.view_scale_details')}
                </Button>
              </Link>
              <Link href={`/scales/${scale.id}/preview`}>
                <Button variant="outline" size="sm">
                  {t('copyright.preview_scale')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 可滚动内容区域 */}
      <div className="flex-1 overflow-auto">
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
                    {actions.canUseDirectly ? t('copyright.can_use_directly') : t('copyright.requires_permission')}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-blue-600" />
                  <span className="text-sm">
                    {copyright.license.typicalCost === 'FREE' ? t('copyright.free') :
                      copyright.license.typicalCost === 'PAID' ? t('copyright.paid') : t('copyright.consult_pricing')}
                  </span>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2 text-blue-900">{t('copyright.usage_guidelines')}</h4>
                <p className="text-sm text-blue-800">
                  {copyright.license.usageGuidelines}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 版权声明 */}
          <Card>
            <CardHeader>
              <CardTitle>{t('copyright.copyright_statement')}</CardTitle>
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
                  <span>{t('copyright.copyright_contact_info_title')}</span>
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
                        {t('copyright.email_contact')}
                      </a>
                    </Button>
                  )}

                  {copyright.contact.phone && (
                    <Button variant="outline" asChild className="justify-start">
                      <a href={`tel:${copyright.contact.phone}`}>
                        <Phone className="w-4 h-4 mr-2" />
                        {t('copyright.phone_contact')}
                      </a>
                    </Button>
                  )}

                  {copyright.contact.website && (
                    <Button variant="outline" asChild className="justify-start">
                      <a href={copyright.contact.website} target="_blank" rel="noopener noreferrer">
                        <Globe className="w-4 h-4 mr-2" />
                        {t('copyright.official_website')}
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
                        <h4 className="font-medium">{t('copyright.professional_contact_service')}</h4>
                        <p className="text-sm text-muted-foreground">
                          {t('copyright.professional_contact_desc')}
                        </p>
                      </div>

                      <Dialog open={contactDialogOpen} onOpenChange={setContactDialogOpen}>
                        <DialogTrigger asChild>
                          <Button>
                            <Send className="w-4 h-4 mr-2" />
                            {t('copyright.initiate_contact')}
                          </Button>
                        </DialogTrigger>

                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>{t('copyright.contact_copyright_holder')}</DialogTitle>
                            <DialogDescription>
                              {t('copyright.contact_copyright_for', { scaleName: scale.name, scaleAcronym: scale.acronym })}
                            </DialogDescription>
                          </DialogHeader>

                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>{t('copyright.request_type_label')}</Label>
                                <Select value={contactForm.requestType} onValueChange={(value) =>
                                  setContactForm(prev => ({ ...prev, requestType: value }))}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="license_inquiry">{t('copyright.license_inquiry')}</SelectItem>
                                    <SelectItem value="usage_request">{t('copyright.usage_request')}</SelectItem>
                                    <SelectItem value="pricing_info">{t('copyright.pricing_info')}</SelectItem>
                                    <SelectItem value="support">{t('copyright.technical_support')}</SelectItem>
                                    <SelectItem value="other">{t('copyright.other')}</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div>
                                <Label>{t('copyright.intended_use_label')}</Label>
                                <Select value={contactForm.intendedUse} onValueChange={(value) =>
                                  setContactForm(prev => ({ ...prev, intendedUse: value }))}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="clinical">{t('copyright.clinical_use')}</SelectItem>
                                    <SelectItem value="research">{t('copyright.research_use')}</SelectItem>
                                    <SelectItem value="education">{t('copyright.education_use')}</SelectItem>
                                    <SelectItem value="commercial">{t('copyright.commercial_use')}</SelectItem>
                                    <SelectItem value="personal">{t('copyright.personal_use')}</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>{t('copyright.contact_name_label')}</Label>
                                <Input
                                  value={contactForm.contactName}
                                  onChange={(e) => setContactForm(prev => ({ ...prev, contactName: e.target.value }))}
                                  placeholder={t('copyright.your_name')}
                                  required
                                />
                              </div>

                              <div>
                                <Label>{t('copyright.contact_email_label')}</Label>
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
                                <Label>{t('copyright.organization_name_label')}</Label>
                                <Input
                                  value={contactForm.organizationName}
                                  onChange={(e) => setContactForm(prev => ({ ...prev, organizationName: e.target.value }))}
                                  placeholder={t('copyright.your_organization')}
                                />
                              </div>

                              <div>
                                <Label>{t('copyright.contact_phone_label')}</Label>
                                <Input
                                  value={contactForm.contactPhone}
                                  onChange={(e) => setContactForm(prev => ({ ...prev, contactPhone: e.target.value }))}
                                  placeholder="+86 138 0000 0000"
                                />
                              </div>
                            </div>

                            <div>
                              <Label>{t('copyright.detailed_description_label')}</Label>
                              <Textarea
                                value={contactForm.message}
                                onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                                placeholder={t('copyright.detailed_description_placeholder')}
                                className="min-h-[100px]"
                              />
                            </div>

                            <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                              <div className="flex items-center space-x-2 text-yellow-800">
                                <Clock className="w-4 h-4" />
                                <span className="text-sm font-medium">{t('copyright.expected_response_time_label')}</span>
                              </div>
                              <p className="text-xs text-yellow-700 mt-1">
                                {t('copyright.email_template_notice')}
                              </p>
                            </div>

                            <div className="flex justify-end space-x-2">
                              <Button variant="outline" onClick={() => setContactDialogOpen(false)}>
                                {t('copyright.cancel')}
                              </Button>
                              <Button
                                onClick={handleContactSubmit}
                                disabled={!contactForm.contactName || !contactForm.contactEmail}
                              >
                                <Send className="w-4 h-4 mr-2" />
                                {t('copyright.generate_contact_email')}
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
              <CardTitle>{t('copyright.next_actions')}</CardTitle>
            </CardHeader>

            <CardContent>
              {actions.canUseDirectly ? (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-green-600">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">{t('copyright.can_use_directly_msg')}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t('copyright.can_use_directly_desc')}
                  </p>
                  <div className="flex space-x-2">
                    <Link href={`/scales/${scale.id}`}>
                      <Button>
                        <FileText className="w-4 h-4 mr-2" />
                        {t('copyright.view_scale_details')}
                      </Button>
                    </Link>
                    <Link href={`/scales/${scale.id}/download`}>
                      <Button variant="outline">
                        {t('copyright.download_scale')}
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-orange-600">
                    <AlertCircle className="w-5 h-5" />
                    <span className="font-medium">{t('copyright.needs_permission_msg')}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t('copyright.needs_permission_desc')}
                  </p>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">{t('copyright.contact_suggestions')}</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• {t('copyright.contact_tips_list.0')}</li>
                      <li>• {t('copyright.contact_tips_list.1')}</li>
                      <li>• {t('copyright.contact_tips_list.2')}</li>
                      <li>• {t('copyright.contact_tips_list.3')}</li>
                    </ul>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 常见问题 */}
          <Card>
            <CardHeader>
              <CardTitle>{t('copyright.faq_title')}</CardTitle>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-1">{t('copyright.faq_academic_q')}</h4>
                  <p className="text-sm text-muted-foreground">
                    {t('copyright.faq_academic_a')}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-1">{t('copyright.faq_commercial_q')}</h4>
                  <p className="text-sm text-muted-foreground">
                    {t('copyright.faq_commercial_a')}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-1">{t('copyright.faq_timeline_q')}</h4>
                  <p className="text-sm text-muted-foreground">
                    {t('copyright.faq_timeline_a')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        </div>
      </div>
    </div>
    </FeatureGate>
  );
}