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
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Copyright,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Mail,
  Phone,
  Globe,
} from "lucide-react";
import { useToast } from "@/hooks/useToast";
import { useLanguage } from "@/hooks/useLanguage";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface CopyrightHolder {
  id: string;
  name: string;
  nameEn?: string;
  organizationType: string;
  website?: string;
  description?: string;
  descriptionEn?: string;
  contactEmail?: string;
  contactPhone?: string;
  contactMobile?: string;
  contactFax?: string;
  contactAddress?: string;
  licenseTypes: string[];
  licenseRequirements?: string;
  pricingInfo?: string;
  isActive: number;
  isVerified: number;
  createdAt: string;
  updatedAt: string;
  // Statistics
  scalesCount?: number;
  requestsCount?: number;
}

interface CopyrightHolderStats {
  total: number;
  active: number;
  verified: number;
  publishers: number;
  institutions: number;
}

export function CopyrightHolderManager() {
  const { t } = useLanguage();
  const toast = useToast();
  const [holders, setHolders] = useState<CopyrightHolder[]>([]);
  const [stats, setStats] = useState<CopyrightHolderStats>({ 
    total: 0, active: 0, verified: 0, publishers: 0, institutions: 0 
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingHolder, setEditingHolder] = useState<CopyrightHolder | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [holderToDelete, setHolderToDelete] = useState<string | null>(null);
  const [newHolder, setNewHolder] = useState({
    name: "",
    nameEn: "",
    organizationType: "publisher",
    website: "",
    description: "",
    descriptionEn: "",
    contactEmail: "",
    contactPhone: "",
    contactMobile: "",
    contactFax: "",
    contactAddress: "",
    licenseRequirements: "",
    pricingInfo: "",
    isActive: true,
    isVerified: false,
  });

  const fetchHolders = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (typeFilter !== "all") params.append("type", typeFilter);
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (searchQuery) params.append("search", searchQuery);
      params.append("limit", "50");

      const response = await fetch(`/api/admin/copyright-holders?${params}`);
      const data = await response.json();

      if (data.success) {
        setHolders(data.holders || []);
        setStats(data.statistics || stats);
      } else {
        toast.error(t('admin.copyright_holders.toast_load_failed'));
      }
    } catch (error) {
      console.error(t('admin.copyright_holders.error_load'), error);
      toast.error(t('admin.copyright_holders.toast_load_failed'));
    } finally {
      setLoading(false);
    }
  }, [typeFilter, statusFilter, searchQuery, stats]);

  useEffect(() => {
    fetchHolders();
  }, [fetchHolders]);

  const handleSearch = () => {
    fetchHolders();
  };

  const handleCreateHolder = async () => {
    try {
      const response = await fetch("/api/admin/copyright-holders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newHolder),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(t('admin.copyright_holders.toast_create_success'));
        setCreateDialogOpen(false);
        resetNewHolder();
        fetchHolders();
      } else {
        toast.error(data.error || t('admin.copyright_holders.toast_create_failed'));
      }
    } catch (error) {
      console.error(t('admin.copyright_holders.error_create'), error);
      toast.error(t('admin.copyright_holders.toast_create_failed'));
    }
  };

  const handleEditHolder = async () => {
    if (!editingHolder) return;

    try {
      const response = await fetch(`/api/admin/copyright-holders/${editingHolder.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newHolder),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(t('admin.copyright_holders.toast_update_success'));
        setEditDialogOpen(false);
        setEditingHolder(null);
        fetchHolders();
      } else {
        toast.error(data.error || t('admin.copyright_holders.toast_update_failed'));
      }
    } catch (error) {
      console.error(t('admin.copyright_holders.error_update'), error);
      toast.error(t('admin.copyright_holders.toast_update_failed'));
    }
  };

  const handleDeleteHolder = async () => {
    if (!holderToDelete) return;

    try {
      const holderId = holderToDelete;
      const response = await fetch(`/api/admin/copyright-holders/${holderId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        toast.success(t('admin.copyright_holders.toast_delete_success'));
        setHolderToDelete(null);
        fetchHolders();
      } else {
        toast.error(data.error || t('admin.copyright_holders.toast_delete_failed'));
      }
    } catch (error) {
      console.error(t('admin.copyright_holders.error_delete'), error);
      toast.error(t('admin.copyright_holders.toast_delete_failed'));
    }
  };

  const startEdit = (holder: CopyrightHolder) => {
    setNewHolder({
      name: holder.name,
      nameEn: holder.nameEn || "",
      organizationType: holder.organizationType,
      website: holder.website || "",
      description: holder.description || "",
      descriptionEn: holder.descriptionEn || "",
      contactEmail: holder.contactEmail || "",
      contactPhone: holder.contactPhone || "",
      contactMobile: holder.contactMobile || "",
      contactFax: holder.contactFax || "",
      contactAddress: holder.contactAddress || "",
      licenseRequirements: holder.licenseRequirements || "",
      pricingInfo: holder.pricingInfo || "",
      isActive: Boolean(holder.isActive),
      isVerified: Boolean(holder.isVerified),
    });
    setEditingHolder(holder);
    setEditDialogOpen(true);
  };

  const resetNewHolder = () => {
    setNewHolder({
      name: "",
      nameEn: "",
      organizationType: "publisher",
      website: "",
      description: "",
      descriptionEn: "",
      contactEmail: "",
      contactPhone: "",
      contactMobile: "",
      contactFax: "",
      contactAddress: "",
      licenseRequirements: "",
      pricingInfo: "",
      isActive: true,
      isVerified: false,
    });
  };

  const getTypeColor = (type: string) => {
    const colorMap = {
      publisher: "bg-primary/10 text-primary",
      research_institution: "bg-green-100 text-green-700",
      individual: "bg-purple-100 text-purple-700",
      foundation: "bg-orange-100 text-orange-700",
    };
    return colorMap[type as keyof typeof colorMap] || "bg-gray-100 text-foreground";
  };

  const getTypeLabel = (type: string) => {
    const labelMap = {
      publisher: t('admin.copyright_holders.org_type_publisher'),
      research_institution: t('admin.copyright_holders.org_type_research'),
      individual: t('admin.copyright_holders.org_type_individual'),
      foundation: t('admin.copyright_holders.org_type_foundation'),
    };
    return labelMap[type as keyof typeof labelMap] || type;
  };

  // 过滤版权方
  const filteredHolders = holders.filter(holder => {
    const matchesSearch = !searchQuery ||
      holder.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      holder.nameEn?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      holder.contactEmail?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = typeFilter === 'all' || holder.organizationType === typeFilter;
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && holder.isActive) ||
      (statusFilter === 'verified' && holder.isVerified);

    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="flex flex-col h-screen">
      {/* 固定搜索和操作区域 */}
      <div className="flex-shrink-0 border-b bg-background">
        <div className="p-4 space-y-4">
          {/* 页面标题和操作 */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center space-x-2">
                <Copyright className="w-6 h-6 text-primary" />
                <span>{t('admin.copyright_holders.title')}</span>
              </h1>
              <p className="text-muted-foreground">
                {t('admin.copyright_holders.description')}
              </p>
            </div>

            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  {t('admin.copyright_holders.add_holder')}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{t('admin.copyright_holders.create_holder')}</DialogTitle>
                  <DialogDescription>
                    {t('admin.copyright_holders.create_holder_desc')}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  {/* 基本信息 */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>{t('admin.copyright_holders.name_cn_required')}</Label>
                      <Input
                        value={newHolder.name}
                        onChange={(e) => setNewHolder({ ...newHolder, name: e.target.value })}
                        placeholder={t('admin.copyright_holders.placeholder_name_cn')}
                      />
                    </div>
                    <div>
                      <Label>{t('admin.copyright_holders.name_en')}</Label>
                      <Input
                        value={newHolder.nameEn}
                        onChange={(e) => setNewHolder({ ...newHolder, nameEn: e.target.value })}
                        placeholder={t('admin.copyright_holders.placeholder_name_en')}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>{t('admin.copyright_holders.organization_type_required')}</Label>
                      <Select value={newHolder.organizationType} onValueChange={(value) =>
                        setNewHolder({ ...newHolder, organizationType: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="publisher">{t('admin.copyright_holders.org_type_publisher')}</SelectItem>
                          <SelectItem value="research_institution">{t('admin.copyright_holders.org_type_research')}</SelectItem>
                          <SelectItem value="individual">{t('admin.copyright_holders.org_type_individual')}</SelectItem>
                          <SelectItem value="foundation">{t('admin.copyright_holders.org_type_foundation')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>{t('admin.copyright_holders.website_link')}</Label>
                      <Input
                        value={newHolder.website}
                        onChange={(e) => setNewHolder({ ...newHolder, website: e.target.value })}
                        placeholder="https://www.example.com"
                      />
                    </div>
                  </div>

                  {/* 联系信息 */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-sm">{t('admin.copyright_holders.contact_info')}</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>{t('admin.copyright_holders.contact_email')}</Label>
                        <Input
                          type="email"
                          value={newHolder.contactEmail}
                          onChange={(e) => setNewHolder({ ...newHolder, contactEmail: e.target.value })}
                          placeholder={t('admin.copyright_holders.placeholder_email')}
                        />
                      </div>
                      <div>
                        <Label>{t('admin.copyright_holders.contact_phone')}</Label>
                        <Input
                          value={newHolder.contactPhone}
                          onChange={(e) => setNewHolder({ ...newHolder, contactPhone: e.target.value })}
                          placeholder={t('admin.copyright_holders.placeholder_phone')}
                        />
                      </div>
                    </div>
                    <div>
                      <Label>{t('admin.copyright_holders.contact_address')}</Label>
                      <Input
                        value={newHolder.contactAddress}
                        onChange={(e) => setNewHolder({ ...newHolder, contactAddress: e.target.value })}
                        placeholder={t('admin.copyright_holders.placeholder_address')}
                      />
                    </div>
                  </div>

                  {/* 描述信息 */}
                  <div className="space-y-4">
                    <div>
                      <Label>{t('admin.copyright_holders.description_cn')}</Label>
                      <Textarea
                        value={newHolder.description}
                        onChange={(e) => setNewHolder({ ...newHolder, description: e.target.value })}
                        placeholder={t('admin.copyright_holders.placeholder_description')}
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label>{t('admin.copyright_holders.license_requirements')}</Label>
                      <Textarea
                        value={newHolder.licenseRequirements}
                        onChange={(e) => setNewHolder({ ...newHolder, licenseRequirements: e.target.value })}
                        placeholder={t('admin.copyright_holders.placeholder_license')}
                        rows={2}
                      />
                    </div>
                  </div>

                  {/* 状态设置 */}
                  <div className="flex items-center justify-between space-x-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={newHolder.isActive}
                        onCheckedChange={(checked) => setNewHolder({ ...newHolder, isActive: checked })}
                      />
                      <Label>{t('admin.copyright_holders.enable_status')}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={newHolder.isVerified}
                        onCheckedChange={(checked) => setNewHolder({ ...newHolder, isVerified: checked })}
                      />
                      <Label>{t('admin.copyright_holders.verified_status')}</Label>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                      {t('admin.copyright_holders.cancel')}
                    </Button>
                    <Button
                      onClick={handleCreateHolder}
                      disabled={!newHolder.name}
                    >
                      {t('admin.copyright_holders.create_holder')}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* 搜索和筛选 */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('admin.copyright_holders.search_placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder={t('admin.copyright_holders.organization_type')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('admin.copyright_holders.all_types')}</SelectItem>
                  <SelectItem value="publisher">{t('admin.copyright_holders.org_type_publisher')}</SelectItem>
                  <SelectItem value="research_institution">{t('admin.copyright_holders.org_type_research')}</SelectItem>
                  <SelectItem value="individual">{t('admin.copyright_holders.org_type_individual')}</SelectItem>
                  <SelectItem value="foundation">{t('admin.copyright_holders.org_type_foundation')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder={t('admin.status')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('admin.copyright_holders.all_status')}</SelectItem>
                  <SelectItem value="active">{t('admin.copyright_holders.status_active')}</SelectItem>
                  <SelectItem value="verified">{t('admin.copyright_holders.status_verified')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleSearch} disabled={loading}>
              {loading ? t('admin.copyright_holders.searching') : t('admin.copyright_holders.search')}
            </Button>
          </div>
        </div>
      </div>

      {/* 可滚动的内容区域 */}
      <div className="flex-1 overflow-auto">
        <div className="p-4 space-y-6">
          {/* 统计卡片 */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">{stats.total}</div>
                <div className="text-sm text-muted-foreground">{t('admin.copyright_holders.stats_total')}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-success">{stats.active}</div>
                <div className="text-sm text-muted-foreground">{t('admin.copyright_holders.stats_active')}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.verified}</div>
                <div className="text-sm text-muted-foreground">{t('admin.copyright_holders.stats_verified')}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">{stats.publishers}</div>
                <div className="text-sm text-muted-foreground">{t('admin.copyright_holders.stats_publishers')}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-cyan-600">{stats.institutions}</div>
                <div className="text-sm text-muted-foreground">{t('admin.copyright_holders.stats_institutions')}</div>
              </CardContent>
            </Card>
          </div>

          {/* 版权方列表 */}
          <Card>
            <CardHeader>
              <CardTitle>{t('admin.copyright_holders.holder_list')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('admin.copyright_holders.holder_info')}</TableHead>
                    <TableHead>{t('admin.copyright_holders.organization_type')}</TableHead>
                    <TableHead>{t('admin.copyright_holders.contact_methods')}</TableHead>
                    <TableHead>{t('admin.copyright_holders.related_scales')}</TableHead>
                    <TableHead>{t('admin.status')}</TableHead>
                    <TableHead>{t('admin.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredHolders.length > 0 ? filteredHolders.map((holder) => (
                    <TableRow key={holder.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{holder.name}</div>
                          {holder.nameEn && (
                            <div className="text-sm text-muted-foreground">{holder.nameEn}</div>
                          )}
                          {holder.website && (
                            <div className="text-xs text-primary">
                              <Globe className="w-3 h-3 inline mr-1" />
                              {holder.website}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getTypeColor(holder.organizationType)}>
                          {getTypeLabel(holder.organizationType)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm space-y-1">
                          {holder.contactEmail && (
                            <div className="flex items-center">
                              <Mail className="w-3 h-3 mr-1" />
                              {holder.contactEmail}
                            </div>
                          )}
                          {holder.contactPhone && (
                            <div className="flex items-center">
                              <Phone className="w-3 h-3 mr-1" />
                              {holder.contactPhone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-center">
                          <div className="text-lg font-semibold">{holder.scalesCount || 0}</div>
                          <div className="text-xs text-muted-foreground">{t('admin.copyright_holders.scale_count')}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col space-y-1">
                          <Badge variant={holder.isActive ? "default" : "secondary"}>
                            {holder.isActive ? t('admin.copyright_holders.status_active') : t('admin.copyright_holders.status_inactive')}
                          </Badge>
                          {holder.isVerified && (
                            <Badge variant="outline" className="text-success">
                              {t('admin.copyright_holders.status_verified')}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => startEdit(holder)}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setHolderToDelete(holder.id);
                              setDeleteConfirmOpen(true);
                            }}
                            className="text-destructive hover:text-red-700"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="flex flex-col items-center space-y-2">
                          <Copyright className="w-12 h-12 text-muted-foreground" />
                          <p className="text-muted-foreground">{t('admin.copyright_holders.no_holders')}</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 编辑版权方对话框 */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('admin.copyright_holders.edit_holder')}</DialogTitle>
            <DialogDescription>
              {t('admin.copyright_holders.edit_holder_desc')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* 基本信息 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t('admin.copyright_holders.name_cn_required')}</Label>
                <Input
                  value={newHolder.name}
                  onChange={(e) => setNewHolder({ ...newHolder, name: e.target.value })}
                  placeholder={t('admin.copyright_holders.placeholder_name_cn')}
                />
              </div>
              <div>
                <Label>{t('admin.copyright_holders.name_en')}</Label>
                <Input
                  value={newHolder.nameEn}
                  onChange={(e) => setNewHolder({ ...newHolder, nameEn: e.target.value })}
                  placeholder={t('admin.copyright_holders.placeholder_name_en')}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t('admin.copyright_holders.organization_type_required')}</Label>
                <Select value={newHolder.organizationType} onValueChange={(value) =>
                  setNewHolder({ ...newHolder, organizationType: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="publisher">{t('admin.copyright_holders.org_type_publisher')}</SelectItem>
                    <SelectItem value="research_institution">{t('admin.copyright_holders.org_type_research')}</SelectItem>
                    <SelectItem value="individual">{t('admin.copyright_holders.org_type_individual')}</SelectItem>
                    <SelectItem value="foundation">{t('admin.copyright_holders.org_type_foundation')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t('admin.copyright_holders.website_link')}</Label>
                <Input
                  value={newHolder.website}
                  onChange={(e) => setNewHolder({ ...newHolder, website: e.target.value })}
                  placeholder="https://www.example.com"
                />
              </div>
            </div>

            {/* 联系信息 */}
            <div className="space-y-4">
              <h3 className="font-medium text-sm">{t('admin.copyright_holders.contact_info')}</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t('admin.copyright_holders.contact_email')}</Label>
                  <Input
                    type="email"
                    value={newHolder.contactEmail}
                    onChange={(e) => setNewHolder({ ...newHolder, contactEmail: e.target.value })}
                    placeholder={t('admin.copyright_holders.placeholder_email')}
                  />
                </div>
                <div>
                  <Label>{t('admin.copyright_holders.contact_phone')}</Label>
                  <Input
                    value={newHolder.contactPhone}
                    onChange={(e) => setNewHolder({ ...newHolder, contactPhone: e.target.value })}
                    placeholder={t('admin.copyright_holders.placeholder_phone')}
                  />
                </div>
              </div>
              <div>
                <Label>{t('admin.copyright_holders.contact_address')}</Label>
                <Input
                  value={newHolder.contactAddress}
                  onChange={(e) => setNewHolder({ ...newHolder, contactAddress: e.target.value })}
                  placeholder={t('admin.copyright_holders.placeholder_address')}
                />
              </div>
            </div>

            {/* 描述信息 */}
            <div className="space-y-4">
              <div>
                <Label>{t('admin.copyright_holders.description_cn')}</Label>
                <Textarea
                  value={newHolder.description}
                  onChange={(e) => setNewHolder({ ...newHolder, description: e.target.value })}
                  placeholder={t('admin.copyright_holders.placeholder_description')}
                  rows={3}
                />
              </div>
              <div>
                <Label>{t('admin.copyright_holders.license_requirements')}</Label>
                <Textarea
                  value={newHolder.licenseRequirements}
                  onChange={(e) => setNewHolder({ ...newHolder, licenseRequirements: e.target.value })}
                  placeholder={t('admin.copyright_holders.placeholder_license')}
                  rows={2}
                />
              </div>
            </div>

            {/* 状态设置 */}
            <div className="flex items-center justify-between space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={newHolder.isActive}
                  onCheckedChange={(checked) => setNewHolder({ ...newHolder, isActive: checked })}
                />
                <Label>{t('admin.copyright_holders.enable_status')}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={newHolder.isVerified}
                  onCheckedChange={(checked) => setNewHolder({ ...newHolder, isVerified: checked })}
                />
                <Label>{t('admin.copyright_holders.verified_status')}</Label>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                {t('admin.copyright_holders.cancel')}
              </Button>
              <Button
                onClick={handleEditHolder}
                disabled={!newHolder.name}
              >
                {t('admin.copyright_holders.update_holder')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 删除确认对话框 */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title={t('admin.copyright_holders.delete_holder')}
        description={t('admin.copyright_holders.delete_confirm_desc')}
        confirmText={t('admin.copyright_holders.delete_holder')}
        cancelText={t('admin.copyright_holders.cancel')}
        onConfirm={handleDeleteHolder}
        variant="destructive"
      />
    </div>
  );
}