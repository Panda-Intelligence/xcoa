"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  Search,
  ChevronLeft,
  Send
} from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/useToast";

interface Scale {
  id: string;
  name: string;
  nameEn?: string;
  acronym?: string;
  categoryName?: string;
}

export function CopyrightTicketCreate() {
  const { t } = useLanguage();
  const router = useRouter();
  const toast = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Scale[]>([]);
  const [selectedScale, setSelectedScale] = useState<Scale | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [ticketForm, setTicketForm] = useState({
    requestType: "license_inquiry",
    intendedUse: "research",
    organizationName: "",
    organizationType: "university",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    projectDescription: "",
    message: "",
    urgency: "medium"
  });

  // 检查URL参数，如果有scaleId则预选
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const scaleId = urlParams.get('scaleId');

    if (scaleId) {
      fetchScaleById(scaleId);
    }
  }, []);

  // 根据ID获取量表信息
  const fetchScaleById = async (scaleId: string) => {
    try {
      const response = await fetch(`/api/scales/${scaleId}`);
      const data = await response.json();

      if (data.scale) {
        setSelectedScale({
          id: data.scale.id,
          name: data.scale.name,
          nameEn: data.scale.nameEn,
          acronym: data.scale.acronym,
          categoryName: data.scale.category?.name
        });
      }
    } catch (error) {
      console.error('Failed to fetch scale:', error);
    }
  };

  // 搜索量表
  const searchScales = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery, limit: 10 }),
      });

      const data = await response.json();
      if (data.results) {
        setSearchResults(data.results);
      }
    } catch (error) {
      console.error('Scale search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // 选择量表
  const selectScale = (scale: Scale) => {
    setSelectedScale(scale);
    setSearchResults([]);
    setSearchQuery("");
  };

  // 提交版权工单
  const handleSubmit = async () => {
    if (!selectedScale) {
      toast.warning(t('copyright_ticket_create.please_select_scale'));
      return;
    }

    if (!ticketForm.contactName || !ticketForm.contactEmail) {
      toast.warning(t('copyright_ticket_create.validation_error'));
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/copyright/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scaleId: selectedScale.id,
          requestType: ticketForm.requestType,
          intendedUse: ticketForm.intendedUse,
          projectDescription: ticketForm.projectDescription,
          initialMessage: ticketForm.message,
          priority: ticketForm.urgency
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(t('copyright_ticket_create.success_message'));
        router.push("/scales/copyright/tickets");
      } else {
        toast.error(data.error || t('copyright_ticket_create.submission_error'));
      }
    } catch (error) {
      console.error('提交工单失败:', error);
      toast.error(t('copyright_ticket_create.submission_error'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader
        items={[
          { href: "/scales/copyright", label: t('navigation.copyright') },
          { href: "/scales/copyright/create", label: t('copyright_ticket_create.form_title') }
        ]}
      />

      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center space-x-2">
              <Shield className="w-6 h-6 text-blue-600" />
              <span>{t('copyright_ticket_create.page_title')}</span>
            </h1>
            <p className="text-muted-foreground">
              {t('copyright_ticket_create.page_description')}
            </p>
          </div>
          <Button variant="ghost" onClick={() => router.push("/scales/copyright/tickets")}>
            <ChevronLeft className="w-4 h-4 mr-2" />
            {t('copyright.tickets.back_to_ticket_list')}
          </Button>
        </div>

        <div className="max-w-3xl mx-auto space-y-6">
          {/* 量表选择 */}
          <Card>
            <CardHeader>
              <CardTitle>{t('copyright_ticket_create.select_scale_title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!selectedScale ? (
                <>
                  <div className="flex space-x-2">
                    <Input
                      placeholder={t('copyright_ticket_create.search_scale_placeholder')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && searchScales()}
                    />
                    <Button onClick={searchScales} disabled={loading}>
                      <Search className="w-4 h-4 mr-2" />
                      {loading ? t('scales_page.searching') : t('common.search')}
                    </Button>
                  </div>

                  {/* 搜索结果 */}
                  {searchResults.length > 0 && (
                    <div className="border rounded-lg p-3">
                      <div className="text-sm font-medium mb-2">{t('copyright_ticket_create.search_results_instruction')}</div>
                      <div className="space-y-2">
                        {searchResults.map((scale) => (
                          <button
                            key={scale.id}
                            onClick={() => selectScale(scale)}
                            className="w-full text-left p-3 border rounded hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline">{scale.acronym}</Badge>
                              <span className="font-medium">{scale.name}</span>
                              {scale.categoryName && (
                                <Badge variant="secondary">{scale.categoryName}</Badge>
                              )}
                            </div>
                            {scale.nameEn && (
                              <div className="text-sm text-muted-foreground mt-1">{scale.nameEn}</div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-between p-3 border rounded bg-blue-50">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{selectedScale.acronym}</Badge>
                    <span className="font-medium">{selectedScale.name}</span>
                    {selectedScale.categoryName && (
                      <Badge variant="secondary">{selectedScale.categoryName}</Badge>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedScale(null)}
                  >
                    {t('copyright_ticket_create.reselect')}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 工单表单 */}
          {selectedScale && (
            <Card>
              <CardHeader>
                <CardTitle>{t('copyright_ticket_create.ticket_info')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{t('copyright_ticket_create.request_type')}</Label>
                    <Select value={ticketForm.requestType} onValueChange={(value) =>
                      setTicketForm({ ...ticketForm, requestType: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="license_inquiry">{t('forms.license_inquiry')}</SelectItem>
                        <SelectItem value="usage_request">{t('forms.usage_request')}</SelectItem>
                        <SelectItem value="pricing_info">{t('forms.pricing_info')}</SelectItem>
                        <SelectItem value="support">{t('forms.support')}</SelectItem>
                        <SelectItem value="other">{t('forms.other')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>{t('copyright_ticket_create.intended_use')}</Label>
                    <Select value={ticketForm.intendedUse} onValueChange={(value) =>
                      setTicketForm({ ...ticketForm, intendedUse: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="clinical">{t('forms.clinical')}</SelectItem>
                        <SelectItem value="research">{t('forms.research')}</SelectItem>
                        <SelectItem value="education">{t('forms.education')}</SelectItem>
                        <SelectItem value="commercial">{t('forms.commercial')}</SelectItem>
                        <SelectItem value="personal">{t('forms.personal')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{t('copyright_ticket_create.organization')}</Label>
                    <Input
                      value={ticketForm.organizationName}
                      onChange={(e) => setTicketForm({ ...ticketForm, organizationName: e.target.value })}
                      placeholder={t('copyright_ticket_create.organization_placeholder')}
                    />
                  </div>

                  <div>
                    <Label>{t('copyright_ticket_create.organization_type')}</Label>
                    <Select value={ticketForm.organizationType} onValueChange={(value) =>
                      setTicketForm({ ...ticketForm, organizationType: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hospital">{t('forms.hospital')}</SelectItem>
                        <SelectItem value="clinic">{t('forms.clinic')}</SelectItem>
                        <SelectItem value="university">{t('forms.university')}</SelectItem>
                        <SelectItem value="research_institute">{t('forms.research_institute')}</SelectItem>
                        <SelectItem value="pharmaceutical">{t('forms.pharmaceutical')}</SelectItem>
                        <SelectItem value="individual">{t('forms.individual')}</SelectItem>
                        <SelectItem value="other">{t('forms.other')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{t('forms.contact_name')} *</Label>
                    <Input
                      value={ticketForm.contactName}
                      onChange={(e) => setTicketForm({ ...ticketForm, contactName: e.target.value })}
                      placeholder={t('copyright_ticket_create.applicant_name_placeholder')}
                    />
                  </div>

                  <div>
                    <Label>{t('forms.contact_email')} *</Label>
                    <Input
                      type="email"
                      value={ticketForm.contactEmail}
                      onChange={(e) => setTicketForm({ ...ticketForm, contactEmail: e.target.value })}
                      placeholder={t('copyright_ticket_create.applicant_email_placeholder')}
                    />
                  </div>
                </div>

                <div>
                  <Label>{t('forms.contact_phone')} ({t('forms.optional')})</Label>
                  <Input
                    value={ticketForm.contactPhone}
                    onChange={(e) => setTicketForm({ ...ticketForm, contactPhone: e.target.value })}
                    placeholder={t('copyright_ticket_create.applicant_phone_placeholder')}
                  />
                </div>

                <div>
                  <Label>{t('copyright_ticket_create.urgency')}</Label>
                  <Select value={ticketForm.urgency} onValueChange={(value) =>
                    setTicketForm({ ...ticketForm, urgency: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">{t('copyright_ticket_create.urgency_low')}</SelectItem>
                      <SelectItem value="medium">{t('copyright_ticket_create.urgency_medium')}</SelectItem>
                      <SelectItem value="high">{t('copyright_ticket_create.urgency_high')}</SelectItem>
                      <SelectItem value="urgent">{t('copyright_ticket_create.urgency_urgent')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>{t('copyright_ticket_create.project_description')} *</Label>
                  <Textarea
                    value={ticketForm.projectDescription}
                    onChange={(e) => setTicketForm({ ...ticketForm, projectDescription: e.target.value })}
                    placeholder={t('copyright_ticket_create.project_description_placeholder')}
                    rows={3}
                  />
                </div>

                <div>
                  <Label>{t('copyright_ticket_create.additional_info')}</Label>
                  <Textarea
                    value={ticketForm.message}
                    onChange={(e) => setTicketForm({ ...ticketForm, message: e.target.value })}
                    placeholder={t('forms.message_placeholder')}
                    rows={4}
                  />
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h5 className="font-medium mb-2 text-blue-900">{t('copyright_ticket_create.tips_title')}</h5>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• {t('copyright_ticket_create.tip_1')}</li>
                    <li>• {t('copyright_ticket_create.tip_2')}</li>
                    <li>• {t('copyright_ticket_create.tip_3')}</li>
                    <li>• {t('copyright_ticket_create.tip_4')}</li>
                  </ul>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => router.push("/scales/copyright/tickets")}
                  >
                    {t('common.cancel')}
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={!selectedScale || !ticketForm.contactName || !ticketForm.contactEmail || !ticketForm.projectDescription || submitting}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {submitting ? t('copyright_ticket_create.submitting') : t('copyright_ticket_create.submit_application')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}