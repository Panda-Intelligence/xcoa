"use client";

import { useState, useEffect, useCallback } from "react";
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
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/useToast";
import { useLanguage } from "@/hooks/useLanguage";
import Link from "next/link";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

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
  const router = useRouter();
  const toast = useToast();
  const { t } = useLanguage();
  const [scales, setScales] = useState<EcoaScale[]>([]);
  const [stats, setStats] = useState<ScaleStats>({ total: 0, published: 0, draft: 0, validated: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [scaleToDelete, setScaleToDelete] = useState<string | null>(null);
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

  const fetchScales = useCallback(async () => {
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
        console.error("Failed to load scales:", data.error);
      }
    } catch (error) {
      console.error("Failed to load scales:", error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page, searchQuery]);

  useEffect(() => {
    fetchScales();
  }, [fetchScales]);

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
        toast.success(t('admin.scales.created_successfully'));
      } else {
        toast.error(data.error || t('admin.scales.create_failed'));
      }
    } catch (error) {
      console.error("Error creating scale:", error);
      toast.error(t('admin.scales.network_error_retry'));
    }
  };

  const deleteScale = async () => {
    if (!scaleToDelete) return;

    try {
      const scaleId = scaleToDelete;
      const response = await fetch(`/api/admin/scales/${scaleId}`, {
        method: "DELETE"
      });

      const data = await response.json();

      if (response.ok) {
        setScaleToDelete(null);
        fetchScales();
        toast.success(t('admin.scales.deleted_successfully'));
      } else {
        toast.error(data.error || t('admin.scales.delete_failed'));
      }
    } catch (error) {
      console.error("Error deleting scale:", error);
      toast.error(t('admin.scales.network_error_retry'));
    }
  };

  const getStatusColor = (status: string) => {
    const colorMap = {
      draft: "bg-gray-100 text-foreground",
      validated: "bg-primary/10 text-primary",
      published: "bg-green-100 text-green-700"
    };
    return colorMap[status as keyof typeof colorMap] || colorMap.draft;
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      draft: t('admin.scales.status_draft'),
      validated: t('admin.scales.status_validated'),
      published: t('admin.scales.status_published')
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getHolderTypeLabel = (type: string) => {
    const labels = {
      publisher: t('admin.scales.holder_type_publisher'),
      research_institution: t('admin.scales.holder_type_research'),
      individual: t('admin.scales.holder_type_individual'),
      foundation: t('admin.scales.holder_type_foundation')
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getLicenseTypeLabel = (type: string) => {
    const labels = {
      public_domain: t('admin.scales.license_public_domain'),
      academic_free: t('admin.scales.license_academic_free'),
      commercial: t('admin.scales.license_commercial'),
      contact_required: t('admin.scales.license_contact_required')
    };
    return labels[type as keyof typeof labels] || type;
  };

  const resetNewScale = () => {
    setNewScale({
      name: "",
      nameEn: "",
      acronym: "",
      description: "",
      administrationTime: "",
      targetPopulation: "",
      ageRange: "",
      validationStatus: "draft",
      copyrightInfo: "",
      copyrightHolderId: "",
      licenseType: "contact_required",
      licenseTerms: "",
      usageRestrictions: ""
    });
  };

  if (loading && page === 1) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="min-h-[100vh] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">{t('admin.scales.loading')}</p>
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
            label: t('admin.scales.breadcrumb_title')
          }
        ]}
      />
      <div className="flex flex-1 flex-col gap-4 p-4">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center space-x-2">
              <Scale className="w-6 h-6 text-primary" />
              <span>{t('admin.scales.title')}</span>
            </h1>
            <p className="text-muted-foreground">
              {t('admin.scales.description')}
            </p>
          </div>

          {/* 创建量表对话框 */}
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                {t('admin.scales.button_create_scale')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{t('admin.scales.form_create_title')}</DialogTitle>
                <DialogDescription>
                  {t('admin.scales.form_create_description')}
                </DialogDescription>
              </DialogHeader>

              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="basic">{t('admin.scales.tab_basic_info')}</TabsTrigger>
                  <TabsTrigger value="copyright">{t('admin.scales.tab_copyright_info')}</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>{t('admin.scales.label_scale_name_cn')}</Label>
                      <Input
                        value={newScale.name}
                        onChange={(e) => setNewScale({ ...newScale, name: e.target.value })}
                        placeholder={t('admin.scales.placeholder_scale_name_cn')}
                      />
                    </div>
                    <div>
                      <Label>{t('admin.scales.label_scale_name_en')}</Label>
                      <Input
                        value={newScale.nameEn}
                        onChange={(e) => setNewScale({ ...newScale, nameEn: e.target.value })}
                        placeholder={t('admin.scales.placeholder_scale_name_en')}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>{t('admin.scales.label_acronym')}</Label>
                      <Input
                        value={newScale.acronym}
                        onChange={(e) => setNewScale({ ...newScale, acronym: e.target.value })}
                        placeholder={t('admin.scales.placeholder_acronym')}
                      />
                    </div>
                    <div>
                      <Label>{t('admin.scales.label_status')}</Label>
                      <Select value={newScale.validationStatus} onValueChange={(value) =>
                        setNewScale({ ...newScale, validationStatus: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">{t('admin.scales.status_draft')}</SelectItem>
                          <SelectItem value="validated">{t('admin.scales.status_validated')}</SelectItem>
                          <SelectItem value="published">{t('admin.scales.status_published')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label>{t('admin.scales.label_description')}</Label>
                    <Textarea
                      value={newScale.description}
                      onChange={(e) => setNewScale({ ...newScale, description: e.target.value })}
                      placeholder={t('admin.scales.placeholder_description')}
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>{t('admin.scales.label_administration_time')}</Label>
                      <Input
                        type="number"
                        value={newScale.administrationTime}
                        onChange={(e) => setNewScale({ ...newScale, administrationTime: e.target.value })}
                        placeholder={t('admin.scales.placeholder_administration_time')}
                      />
                    </div>
                    <div>
                      <Label>{t('admin.scales.label_target_population')}</Label>
                      <Input
                        value={newScale.targetPopulation}
                        onChange={(e) => setNewScale({ ...newScale, targetPopulation: e.target.value })}
                        placeholder={t('admin.scales.placeholder_target_population')}
                      />
                    </div>
                    <div>
                      <Label>{t('admin.scales.label_age_range')}</Label>
                      <Input
                        value={newScale.ageRange}
                        onChange={(e) => setNewScale({ ...newScale, ageRange: e.target.value })}
                        placeholder={t('admin.scales.placeholder_age_range')}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                      {t('admin.scales.button_cancel')}
                    </Button>
                    <Button
                      onClick={handleCreateScale}
                      disabled={!newScale.name || !newScale.acronym}
                    >
                      {t('admin.scales.button_create')}
                    </Button>
                  </div>
                </TabsContent>
                <TabsContent value="copyright" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <CopyrightHolderSearch
                        value={newScale.copyrightHolderId}
                        onSelect={(holderId) => setNewScale({ ...newScale, copyrightHolderId: holderId || "" })}
                        label={t('admin.scales.label_copyright_holder')}
                        placeholder={t('admin.scales.placeholder_copyright_holder')}
                      />
                    </div>
                    <div>
                      <Label>{t('admin.scales.label_license_type')}</Label>
                      <Select
                        value={newScale.licenseType}
                        onValueChange={(value) => setNewScale({ ...newScale, licenseType: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="public_domain">{t('admin.scales.license_public_domain')}</SelectItem>
                          <SelectItem value="academic_free">{t('admin.scales.license_academic_free')}</SelectItem>
                          <SelectItem value="commercial">{t('admin.scales.license_commercial')}</SelectItem>
                          <SelectItem value="contact_required">{t('admin.scales.license_contact_required')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label>{t('admin.scales.label_copyright_info')}</Label>
                    <Textarea
                      value={newScale.copyrightInfo}
                      onChange={(e) => setNewScale({ ...newScale, copyrightInfo: e.target.value })}
                      placeholder={t('admin.scales.placeholder_copyright_info')}
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label>{t('admin.scales.label_license_terms')}</Label>
                    <Textarea
                      value={newScale.licenseTerms}
                      onChange={(e) => setNewScale({ ...newScale, licenseTerms: e.target.value })}
                      placeholder={t('admin.scales.placeholder_license_terms')}
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label>{t('admin.scales.label_usage_restrictions')}</Label>
                    <Textarea
                      value={newScale.usageRestrictions}
                      onChange={(e) => setNewScale({ ...newScale, usageRestrictions: e.target.value })}
                      placeholder={t('admin.scales.placeholder_usage_restrictions')}
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                      {t('admin.scales.button_cancel')}
                    </Button>
                    <Button
                      onClick={handleCreateScale}
                      disabled={!newScale.name || !newScale.acronym}
                    >
                      {t('admin.scales.button_create')}
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
              <div className="text-2xl font-bold text-primary">{stats.total}</div>
              <div className="text-sm text-muted-foreground">{t('admin.scales.stats_total')}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-success">{stats.published}</div>
              <div className="text-sm text-muted-foreground">{t('admin.scales.stats_published')}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{stats.validated}</div>
              <div className="text-sm text-muted-foreground">{t('admin.scales.stats_validated')}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-muted-foreground">{stats.draft}</div>
              <div className="text-sm text-muted-foreground">{t('admin.scales.stats_draft')}</div>
            </CardContent>
          </Card>
        </div>

        {/* 搜索和筛选 */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('admin.scales.search_placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('admin.scales.filter_all_status')}</SelectItem>
                <SelectItem value="draft">{t('admin.scales.status_draft')}</SelectItem>
                <SelectItem value="validated">{t('admin.scales.status_validated')}</SelectItem>
                <SelectItem value="published">{t('admin.scales.status_published')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={fetchScales}>{t('admin.scales.button_search')}</Button>
        </div>

        {/* 量表列表 */}
        <Card>
          <CardHeader>
            <CardTitle>{t('admin.scales.table_title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('admin.scales.table_scale_info')}</TableHead>
                  <TableHead>{t('admin.scales.table_acronym')}</TableHead>
                  <TableHead>{t('admin.scales.table_status')}</TableHead>
                  <TableHead>{t('admin.scales.table_copyright_holder')}</TableHead>
                  <TableHead>{t('admin.scales.table_license_type')}</TableHead>
                  <TableHead>{t('admin.scales.table_items_count')}</TableHead>
                  <TableHead>{t('admin.scales.table_actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scales.length > 0 ? scales.map((scale) => (
                  <TableRow key={scale.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          <Link href={`/scales/${scale.id}`}>{scale.name}</Link>
                        </div>
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
                            <div className="font-medium text-primary hover:text-primary">
                              {scale.copyrightHolder.name}
                            </div>
                            {scale.copyrightHolder.nameEn && (
                              <div className="text-xs text-muted-foreground">
                                {scale.copyrightHolder.nameEn}
                              </div>
                            )}
                            <div className="flex items-center space-x-1 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {getHolderTypeLabel(scale.copyrightHolder.organizationType)}
                              </Badge>
                              {scale.copyrightHolder.isVerified === 1 && (
                                <Badge variant="outline" className="text-xs text-success">
                                  {t('admin.scales.holder_verified')}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </Button>
                      ) : (
                        <span className="text-muted-foreground">{t('admin.scales.holder_not_set')}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {scale.licenseType ? (
                        <Badge variant="outline" className="text-xs">
                          {getLicenseTypeLabel(scale.licenseType)}
                        </Badge>
                      ) : t('admin.scales.license_not_set')}
                    </TableCell>
                    <TableCell className="text-center">
                      {scale.itemsCount}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => router.push(`/admin/scales/${scale.id}`)}
                        >
                          <Edit className="w-3 h-3 mr-1" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setScaleToDelete(scale.id);
                            setDeleteConfirmOpen(true);
                          }}
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      {t('admin.scales.no_scales')}
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
                {t('admin.scales.pagination_previous')}
              </Button>
              <span className="text-sm text-muted-foreground">
                {t('admin.scales.pagination_page', { page })}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={!hasMore}
              >
                {t('admin.scales.pagination_next')}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 删除确认对话框 */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title={t('admin.scales.delete_confirm_title')}
        description={t('admin.scales.delete_confirm_description')}
        confirmText={t('admin.scales.delete_confirm_button')}
        cancelText={t('admin.scales.delete_cancel_button')}
        onConfirm={deleteScale}
        variant="destructive"
      />
    </>
  );
}