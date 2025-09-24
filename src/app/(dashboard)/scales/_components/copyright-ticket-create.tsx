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
      toast.warning("请先选择量表");
      return;
    }

    if (!ticketForm.contactName || !ticketForm.contactEmail) {
      toast.warning("请填写联系人姓名和邮箱");
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
        toast.success("版权工单创建成功！我们将尽快为您联系版权方。");
        router.push("/scales/copyright/tickets");
      } else {
        toast.error(data.error || "创建工单失败");
      }
    } catch (error) {
      console.error('提交工单失败:', error);
      toast.error("网络错误，请稍后重试");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader
        items={[
          { href: "/scales/copyright", label: "版权服务" },
          { href: "/scales/copyright/create", label: "创建工单" }
        ]}
      />

      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center space-x-2">
              <Shield className="w-6 h-6 text-blue-600" />
              <span>创建版权工单</span>
            </h1>
            <p className="text-muted-foreground">
              申请量表使用许可，我们将协助您联系版权方
            </p>
          </div>
          <Button variant="ghost" onClick={() => router.push("/scales/copyright/tickets")}>
            <ChevronLeft className="w-4 h-4 mr-2" />
            返回工单列表
          </Button>
        </div>

        <div className="max-w-3xl mx-auto space-y-6">
          {/* 量表选择 */}
          <Card>
            <CardHeader>
              <CardTitle>选择量表</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!selectedScale ? (
                <>
                  <div className="flex space-x-2">
                    <Input
                      placeholder="搜索量表名称或缩写..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && searchScales()}
                    />
                    <Button onClick={searchScales} disabled={loading}>
                      <Search className="w-4 h-4 mr-2" />
                      {loading ? "搜索中..." : "搜索"}
                    </Button>
                  </div>

                  {/* 搜索结果 */}
                  {searchResults.length > 0 && (
                    <div className="border rounded-lg p-3">
                      <div className="text-sm font-medium mb-2">搜索结果 (点击选择):</div>
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
                    重新选择
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 工单表单 */}
          {selectedScale && (
            <Card>
              <CardHeader>
                <CardTitle>工单信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>请求类型</Label>
                    <Select value={ticketForm.requestType} onValueChange={(value) =>
                      setTicketForm({ ...ticketForm, requestType: value })}>
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
                    <Select value={ticketForm.intendedUse} onValueChange={(value) =>
                      setTicketForm({ ...ticketForm, intendedUse: value })}>
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
                    <Label>机构名称</Label>
                    <Input
                      value={ticketForm.organizationName}
                      onChange={(e) => setTicketForm({ ...ticketForm, organizationName: e.target.value })}
                      placeholder="您的机构名称"
                    />
                  </div>

                  <div>
                    <Label>机构类型</Label>
                    <Select value={ticketForm.organizationType} onValueChange={(value) =>
                      setTicketForm({ ...ticketForm, organizationType: value })}>
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
                        <SelectItem value="other">其他</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>联系人姓名 *</Label>
                    <Input
                      value={ticketForm.contactName}
                      onChange={(e) => setTicketForm({ ...ticketForm, contactName: e.target.value })}
                      placeholder="您的姓名"
                    />
                  </div>

                  <div>
                    <Label>联系邮箱 *</Label>
                    <Input
                      type="email"
                      value={ticketForm.contactEmail}
                      onChange={(e) => setTicketForm({ ...ticketForm, contactEmail: e.target.value })}
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>

                <div>
                  <Label>联系电话 (可选)</Label>
                  <Input
                    value={ticketForm.contactPhone}
                    onChange={(e) => setTicketForm({ ...ticketForm, contactPhone: e.target.value })}
                    placeholder="+86 138 0000 0000"
                  />
                </div>

                <div>
                  <Label>紧急程度</Label>
                  <Select value={ticketForm.urgency} onValueChange={(value) =>
                    setTicketForm({ ...ticketForm, urgency: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">低 - 1-2周内回复</SelectItem>
                      <SelectItem value="medium">中等 - 3-5个工作日</SelectItem>
                      <SelectItem value="high">高 - 1-2个工作日</SelectItem>
                      <SelectItem value="urgent">紧急 - 24小时内</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>项目描述 *</Label>
                  <Textarea
                    value={ticketForm.projectDescription}
                    onChange={(e) => setTicketForm({ ...ticketForm, projectDescription: e.target.value })}
                    placeholder="简要描述您的项目、研究目的或使用场景..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label>详细说明</Label>
                  <Textarea
                    value={ticketForm.message}
                    onChange={(e) => setTicketForm({ ...ticketForm, message: e.target.value })}
                    placeholder="请详细说明您的使用需求、时间要求、预算情况等信息..."
                    rows={4}
                  />
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h5 className="font-medium mb-2 text-blue-900">温馨提示</h5>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• 详细的项目描述有助于版权方快速了解您的需求</li>
                    <li>• 提供准确的联系信息以便版权方及时回复</li>
                    <li>• 学术研究用途通常享有优惠许可政策</li>
                    <li>• 商业用途可能需要更详细的许可协商</li>
                  </ul>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => router.push("/scales/copyright/tickets")}
                  >
                    取消
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={!selectedScale || !ticketForm.contactName || !ticketForm.contactEmail || !ticketForm.projectDescription || submitting}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {submitting ? "提交中..." : "创建工单"}
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