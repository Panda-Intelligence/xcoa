"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CopyrightHolderSearch } from "@/components/copyright-holder-search";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Scale,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { useLanguage } from "@/hooks/useLanguage";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/useToast";

interface EcoaScale {
  id: string;
  name: string;
  nameEn?: string;
  acronym?: string;
  description?: string;
  categoryName?: string;
  itemsCount: number;
  dimensionsCount: number;
  languages: string[];
  validationStatus: string;
  administrationTime?: number;
  targetPopulation?: string;
  ageRange?: string;
  usageCount: number;
  favoriteCount: number;
  isPublic: number;
  createdAt: string;
  updatedAt: string;
  // Copyright fields (from copyright_licenses table)
  copyrightHolderId?: string;
  copyrightHolder?: {
    id: string;
    name: string;
    nameEn?: string;
    organizationType: string;
    contactEmail?: string;
    website?: string;
    isVerified: number;
  };
  licenseType?: string;
  licenseTerms?: string;
  usageRestrictions?: string;
}

interface ScaleStats {
  total: number;
  published: number;
  draft: number;
  validated: number;
}

export function AdminScalesManager() {
  const { t } = useLanguage();
  const router = useRouter();
  const toast = useToast();
  const [scales, setScales] = useState<EcoaScale[]>([]);
  const [stats, setStats] = useState<ScaleStats>({ total: 0, published: 0, draft: 0, validated: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [newScale, setNewScale] = useState({
    name: "",
    nameEn: "",
    acronym: "",
    description: "",
    administrationTime: "",
    targetPopulation: "",
    ageRange: "",
    validationStatus: "draft",
    copyrightInfo: "",
    // Copyright license fields (for separate table)
    copyrightHolderId: "",
    licenseType: "contact_required",
    licenseTerms: "",
    usageRestrictions: ""
  });
  // 移除 copyrightHolders state，因为现在使用搜索组件

  useEffect(() => {
    fetchScales();
  }, [statusFilter, page]);

  const fetchScales = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (searchQuery) params.append("search", searchQuery);
      params.append("limit", "20");
      params.append("offset", ((page - 1) * 20).toString());

      const response = await fetch(`/api/admin/scales?${params}`);
      const data = await response.json();

      if (data.success) {
        setScales(data.scales || []);
        setStats(data.statistics || { total: 0, published: 0, draft: 0, validated: 0 });
        setHasMore(data.pagination?.hasMore || false);
      } else {
        console.error("加载量表失败:", data.error);
      }
    } catch (error) {
      console.error("加载量表失败:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateScale = async () => {
    try {
      const response = await fetch("/api/admin/scales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newScale,
          administrationTime: newScale.administrationTime ? Number.parseInt(newScale.administrationTime) : null,
        })
      });

      const data = await response.json();

      if (response.ok) {
        setCreateDialogOpen(false);
        resetNewScale();
        fetchScales();
        toast.success("量表创建成功！");
      } else {
        toast.error(data.error || "创建量表失败");
      }
    } catch (error) {
      console.error("创建量表错误:", error);
      toast.error("网络错误，请稍后重试");
    }
  };

  const deleteScale = async (scaleId: string) => {
    if (!confirm("确定要删除这个量表吗？此操作不可逆转，相关的临床案例也会受到影响。")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/scales/${scaleId}`, {
        method: "DELETE"
      });

      const data = await response.json();

      if (response.ok) {
        fetchScales();
        toast.success("量表删除成功！");
      } else {
        toast.error(data.error || "删除量表失败");
      }
    } catch (error) {
      console.error("删除量表错误:", error);
      toast.error("网络错误，请稍后重试");
    }
  };

  const getStatusColor = (status: string) => {
    const colorMap = {
      draft: "bg-gray-100 text-gray-700",
      validated: "bg-blue-100 text-blue-700",
      published: "bg-green-100 text-green-700"
    };
    return colorMap[status as keyof typeof colorMap] || colorMap.draft;
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      draft: "草稿",
      validated: "已验证",
      published: "已发布"
    };
    return labels[status as keyof typeof labels] || status;
  };

  if (loading && page === 1) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="min-h-[100vh] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">加载中...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        items={[
          {
            href: "/admin/scales",
            label: "量表管理"
          }
        ]}
      />
      <div className="flex flex-1 flex-col gap-4 p-4">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center space-x-2">
              <Scale className="w-6 h-6 text-blue-600" />
              <span>量表管理</span>
            </h1>
            <p className="text-muted-foreground">
              管理系统中的所有eCOA量表，创建、编辑和发布量表内容
            </p>
          </div>

          {/* 创建量表对话框 */}
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                创建量表
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>创建新量表</DialogTitle>
                <DialogDescription>
                  创建一个新的eCOA量表
                </DialogDescription>
              </DialogHeader>

              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="basic">基本信息</TabsTrigger>
                  <TabsTrigger value="copyright">版权信息</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>量表名称 (中文) *</Label>
                      <Input
                        value={newScale.name}
                        onChange={(e) => setNewScale({ ...newScale, name: e.target.value })}
                        placeholder="患者健康问卷"
                      />
                    </div>
                    <div>
                      <Label>量表名称 (英文)</Label>
                      <Input
                        value={newScale.nameEn}
                        onChange={(e) => setNewScale({ ...newScale, nameEn: e.target.value })}
                        placeholder="Patient Health Questionnaire"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>缩写 *</Label>
                      <Input
                        value={newScale.acronym}
                        onChange={(e) => setNewScale({ ...newScale, acronym: e.target.value })}
                        placeholder="PHQ-9"
                      />
                    </div>
                    <div>
                      <Label>状态</Label>
                      <Select value={newScale.validationStatus} onValueChange={(value) =>
                        setNewScale({ ...newScale, validationStatus: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">草稿</SelectItem>
                          <SelectItem value="validated">已验证</SelectItem>
                          <SelectItem value="published">已发布</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label>描述</Label>
                    <Textarea
                      value={newScale.description}
                      onChange={(e) => setNewScale({ ...newScale, description: e.target.value })}
                      placeholder="量表的详细描述..."
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>管理时间 (分钟)</Label>
                      <Input
                        type="number"
                        value={newScale.administrationTime}
                        onChange={(e) => setNewScale({ ...newScale, administrationTime: e.target.value })}
                        placeholder="10"
                      />
                    </div>
                    <div>
                      <Label>目标人群</Label>
                      <Input
                        value={newScale.targetPopulation}
                        onChange={(e) => setNewScale({ ...newScale, targetPopulation: e.target.value })}
                        placeholder="成年患者"
                      />
                    </div>
                    <div>
                      <Label>年龄范围</Label>
                      <Input
                        value={newScale.ageRange}
                        onChange={(e) => setNewScale({ ...newScale, ageRange: e.target.value })}
                        placeholder="18-65岁"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                      取消
                    </Button>
                    <Button
                      onClick={handleCreateScale}
                      disabled={!newScale.name || !newScale.acronym}
                    >
                      创建量表
                    </Button>
                  </div>
                </TabsContent>
                <TabsContent value="copyright" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <CopyrightHolderSearch
                        value={newScale.copyrightHolderId}
                        onSelect={(holderId) => setNewScale({ ...newScale, copyrightHolderId: holderId || "" })}
                        label="版权方"
                        placeholder="搜索并选择版权方..."
                      />
                    </div>
                    <div>
                      <Label>许可类型</Label>
                      <Select
                        value={newScale.licenseType}
                        onValueChange={(value) => setNewScale({ ...newScale, licenseType: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="public_domain">公共领域</SelectItem>
                          <SelectItem value="academic_free">学术免费</SelectItem>
                          <SelectItem value="commercial">商业许可</SelectItem>
                          <SelectItem value="contact_required">需要联系</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label>版权信息</Label>
                    <Textarea
                      value={newScale.copyrightInfo}
                      onChange={(e) => setNewScale({ ...newScale, copyrightInfo: e.target.value })}
                      placeholder="版权所有 © 2023 患者健康问卷开发团队"
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label>许可条款</Label>
                    <Textarea
                      value={newScale.licenseTerms}
                      onChange={(e) => setNewScale({ ...newScale, licenseTerms: e.target.value })}
                      placeholder="详细的许可使用条款..."
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label>使用限制</Label>
                    <Textarea
                      value={newScale.usageRestrictions}
                      onChange={(e) => setNewScale({ ...newScale, usageRestrictions: e.target.value })}
                      placeholder="使用的限制条件和注意事项..."
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                      取消
                    </Button>
                    <Button
                      onClick={handleCreateScale}
                      disabled={!newScale.name || !newScale.acronym}
                    >
                      创建量表
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-muted-foreground">总量表数</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.published}</div>
              <div className="text-sm text-muted-foreground">已发布</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.validated}</div>
              <div className="text-sm text-muted-foreground">已验证</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-600">{stats.draft}</div>
              <div className="text-sm text-muted-foreground">草稿</div>
            </CardContent>
          </Card>
        </div>

        {/* 搜索和筛选 */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="搜索量表名称、缩写或描述..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有状态</SelectItem>
                <SelectItem value="draft">草稿</SelectItem>
                <SelectItem value="validated">已验证</SelectItem>
                <SelectItem value="published">已发布</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={fetchScales}>搜索</Button>
        </div>

        {/* 量表列表 */}
        <Card>
          <CardHeader>
            <CardTitle>量表列表</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>量表信息</TableHead>
                  <TableHead>缩写</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>版权方</TableHead>
                  <TableHead>许可类型</TableHead>
                  <TableHead>题目数</TableHead>
                  <TableHead>使用次数</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scales.length > 0 ? scales.map((scale) => (
                  <TableRow key={scale.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{scale.name}</div>
                        {scale.nameEn && (
                          <div className="text-sm text-muted-foreground">{scale.nameEn}</div>
                        )}
                        {scale.categoryName && (
                          <Badge variant="outline" className="text-xs mt-1">
                            {scale.categoryName}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono">
                      {scale.acronym || "N/A"}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(scale.validationStatus)}>
                        {getStatusLabel(scale.validationStatus)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {scale.copyrightHolder ? (
                        <Button
                          variant="link"
                          className="p-0 h-auto text-left justify-start"
                          onClick={() => router.push(`/admin/copyright-holders/${scale.copyrightHolder?.id}`)}
                        >
                          <div>
                            <div className="font-medium text-blue-600 hover:text-blue-800">
                              {scale.copyrightHolder.name}
                            </div>
                            {scale.copyrightHolder.nameEn && (
                              <div className="text-xs text-muted-foreground">
                                {scale.copyrightHolder.nameEn}
                              </div>
                            )}
                            <div className="flex items-center space-x-1 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {scale.copyrightHolder.organizationType === 'publisher' ? '出版商' :
                                 scale.copyrightHolder.organizationType === 'research_institution' ? '研究机构' :
                                 scale.copyrightHolder.organizationType === 'individual' ? '个人' :
                                 scale.copyrightHolder.organizationType === 'foundation' ? '基金会' : 
                                 scale.copyrightHolder.organizationType}
                              </Badge>
                              {scale.copyrightHolder.isVerified === 1 && (
                                <Badge variant="outline" className="text-xs text-green-600">
                                  已验证
                                </Badge>
                              )}
                            </div>
                          </div>
                        </Button>
                      ) : (
                        <span className="text-muted-foreground">未设置</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {scale.licenseType ? (
                        <Badge variant="outline" className="text-xs">
                          {scale.licenseType === 'public_domain' ? '公共领域' :
                            scale.licenseType === 'academic_free' ? '学术免费' :
                              scale.licenseType === 'commercial' ? '商业许可' :
                                scale.licenseType === 'contact_required' ? '需联系' : scale.licenseType}
                        </Badge>
                      ) : "未设置"}
                    </TableCell>
                    <TableCell className="text-center">
                      {scale.itemsCount}
                    </TableCell>
                    <TableCell className="text-center">
                      {scale.usageCount}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => router.push(`/scales/${scale.id}`)}
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          预览
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => router.push(`/admin/scales/${scale.id}`)}
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          管理题目
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => router.push(`/admin/scales/${scale.id}`)}
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          编辑
                        </Button>
                        {scale.validationStatus === "draft" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteScale(scale.id)}
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            删除
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      暂无量表记录
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {/* 分页 */}
            <div className="flex items-center justify-between mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                上一页
              </Button>
              <span className="text-sm text-muted-foreground">
                第 {page} 页
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={!hasMore}
              >
                下一页
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}