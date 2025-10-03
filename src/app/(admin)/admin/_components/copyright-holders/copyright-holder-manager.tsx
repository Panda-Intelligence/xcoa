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
  Eye,
  Building,
  Mail,
  Phone,
  Globe,
  User,
  Users,
  BookOpen,
} from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useToast } from "@/hooks/useToast";
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

  useEffect(() => {
    fetchHolders();
  }, [typeFilter, statusFilter]);

  const fetchHolders = async () => {
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
        toast.error("加载版权方列表失败");
      }
    } catch (error) {
      console.error("获取版权方列表错误:", error);
      toast.error("加载版权方列表失败");
    } finally {
      setLoading(false);
    }
  };

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
        toast.success("版权方创建成功");
        setCreateDialogOpen(false);
        resetNewHolder();
        fetchHolders();
      } else {
        toast.error(data.error || "创建版权方失败");
      }
    } catch (error) {
      console.error("创建版权方错误:", error);
      toast.error("创建版权方失败");
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
        toast.success("版权方更新成功");
        setEditDialogOpen(false);
        setEditingHolder(null);
        fetchHolders();
      } else {
        toast.error(data.error || "更新版权方失败");
      }
    } catch (error) {
      console.error("更新版权方错误:", error);
      toast.error("更新版权方失败");
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
        toast.success("版权方删除成功");
        setHolderToDelete(null);
        fetchHolders();
      } else {
        toast.error(data.error || "删除版权方失败");
      }
    } catch (error) {
      console.error("删除版权方错误:", error);
      toast.error("删除版权方失败");
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
      publisher: "bg-blue-100 text-blue-700",
      research_institution: "bg-green-100 text-green-700",
      individual: "bg-purple-100 text-purple-700",
      foundation: "bg-orange-100 text-orange-700",
    };
    return colorMap[type as keyof typeof colorMap] || "bg-gray-100 text-gray-700";
  };

  const getTypeLabel = (type: string) => {
    const labelMap = {
      publisher: "出版商",
      research_institution: "研究机构",
      individual: "个人",
      foundation: "基金会",
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
                <Copyright className="w-6 h-6 text-blue-600" />
                <span>版权方管理</span>
              </h1>
              <p className="text-muted-foreground">
                管理量表版权方信息和联系方式
              </p>
            </div>

            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  添加版权方
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>创建版权方</DialogTitle>
                  <DialogDescription>
                    添加新的版权方信息
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  {/* 基本信息 */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>名称 (中文) *</Label>
                      <Input
                        value={newHolder.name}
                        onChange={(e) => setNewHolder({ ...newHolder, name: e.target.value })}
                        placeholder="北京师范大学出版社"
                      />
                    </div>
                    <div>
                      <Label>名称 (英文)</Label>
                      <Input
                        value={newHolder.nameEn}
                        onChange={(e) => setNewHolder({ ...newHolder, nameEn: e.target.value })}
                        placeholder="Beijing Normal University Publishing Group"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>组织类型 *</Label>
                      <Select value={newHolder.organizationType} onValueChange={(value) =>
                        setNewHolder({ ...newHolder, organizationType: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="publisher">出版商</SelectItem>
                          <SelectItem value="research_institution">研究机构</SelectItem>
                          <SelectItem value="individual">个人</SelectItem>
                          <SelectItem value="foundation">基金会</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>官网链接</Label>
                      <Input
                        value={newHolder.website}
                        onChange={(e) => setNewHolder({ ...newHolder, website: e.target.value })}
                        placeholder="https://www.example.com"
                      />
                    </div>
                  </div>

                  {/* 联系信息 */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-sm">联系信息</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>联系邮箱</Label>
                        <Input
                          type="email"
                          value={newHolder.contactEmail}
                          onChange={(e) => setNewHolder({ ...newHolder, contactEmail: e.target.value })}
                          placeholder="copyright@example.com"
                        />
                      </div>
                      <div>
                        <Label>联系电话</Label>
                        <Input
                          value={newHolder.contactPhone}
                          onChange={(e) => setNewHolder({ ...newHolder, contactPhone: e.target.value })}
                          placeholder="+86-10-12345678"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>联系地址</Label>
                      <Input
                        value={newHolder.contactAddress}
                        onChange={(e) => setNewHolder({ ...newHolder, contactAddress: e.target.value })}
                        placeholder="北京市海淀区..."
                      />
                    </div>
                  </div>

                  {/* 描述信息 */}
                  <div className="space-y-4">
                    <div>
                      <Label>描述 (中文)</Label>
                      <Textarea
                        value={newHolder.description}
                        onChange={(e) => setNewHolder({ ...newHolder, description: e.target.value })}
                        placeholder="版权方的详细描述..."
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label>许可要求</Label>
                      <Textarea
                        value={newHolder.licenseRequirements}
                        onChange={(e) => setNewHolder({ ...newHolder, licenseRequirements: e.target.value })}
                        placeholder="使用许可的具体要求..."
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
                      <Label>启用状态</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={newHolder.isVerified}
                        onCheckedChange={(checked) => setNewHolder({ ...newHolder, isVerified: checked })}
                      />
                      <Label>已验证</Label>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                      取消
                    </Button>
                    <Button
                      onClick={handleCreateHolder}
                      disabled={!newHolder.name}
                    >
                      创建版权方
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* 搜索和筛选 */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="搜索版权方名称、邮箱..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="组织类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有类型</SelectItem>
                  <SelectItem value="publisher">出版商</SelectItem>
                  <SelectItem value="research_institution">研究机构</SelectItem>
                  <SelectItem value="individual">个人</SelectItem>
                  <SelectItem value="foundation">基金会</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有状态</SelectItem>
                  <SelectItem value="active">活跃</SelectItem>
                  <SelectItem value="verified">已验证</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleSearch} disabled={loading}>
              {loading ? "搜索中..." : "搜索"}
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
                <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                <div className="text-sm text-muted-foreground">总版权方</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{stats.active}</div>
                <div className="text-sm text-muted-foreground">活跃</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.verified}</div>
                <div className="text-sm text-muted-foreground">已验证</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">{stats.publishers}</div>
                <div className="text-sm text-muted-foreground">出版商</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-cyan-600">{stats.institutions}</div>
                <div className="text-sm text-muted-foreground">机构</div>
              </CardContent>
            </Card>
          </div>

          {/* 版权方列表 */}
          <Card>
            <CardHeader>
              <CardTitle>版权方列表</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>版权方信息</TableHead>
                    <TableHead>组织类型</TableHead>
                    <TableHead>联系方式</TableHead>
                    <TableHead>关联量表</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>操作</TableHead>
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
                            <div className="text-xs text-blue-600">
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
                          <div className="text-xs text-muted-foreground">个量表</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col space-y-1">
                          <Badge variant={holder.isActive ? "default" : "secondary"}>
                            {holder.isActive ? "活跃" : "停用"}
                          </Badge>
                          {holder.isVerified && (
                            <Badge variant="outline" className="text-green-600">
                              已验证
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
                            className="text-red-600 hover:text-red-700"
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
                          <Copyright className="w-12 h-12 text-gray-400" />
                          <p className="text-muted-foreground">暂无版权方数据</p>
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
            <DialogTitle>编辑版权方</DialogTitle>
            <DialogDescription>
              修改版权方信息
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* 基本信息 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>名称 (中文) *</Label>
                <Input
                  value={newHolder.name}
                  onChange={(e) => setNewHolder({ ...newHolder, name: e.target.value })}
                  placeholder="北京师范大学出版社"
                />
              </div>
              <div>
                <Label>名称 (英文)</Label>
                <Input
                  value={newHolder.nameEn}
                  onChange={(e) => setNewHolder({ ...newHolder, nameEn: e.target.value })}
                  placeholder="Beijing Normal University Publishing Group"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>组织类型 *</Label>
                <Select value={newHolder.organizationType} onValueChange={(value) =>
                  setNewHolder({ ...newHolder, organizationType: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="publisher">出版商</SelectItem>
                    <SelectItem value="research_institution">研究机构</SelectItem>
                    <SelectItem value="individual">个人</SelectItem>
                    <SelectItem value="foundation">基金会</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>官网链接</Label>
                <Input
                  value={newHolder.website}
                  onChange={(e) => setNewHolder({ ...newHolder, website: e.target.value })}
                  placeholder="https://www.example.com"
                />
              </div>
            </div>

            {/* 联系信息 */}
            <div className="space-y-4">
              <h3 className="font-medium text-sm">联系信息</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>联系邮箱</Label>
                  <Input
                    type="email"
                    value={newHolder.contactEmail}
                    onChange={(e) => setNewHolder({ ...newHolder, contactEmail: e.target.value })}
                    placeholder="copyright@example.com"
                  />
                </div>
                <div>
                  <Label>联系电话</Label>
                  <Input
                    value={newHolder.contactPhone}
                    onChange={(e) => setNewHolder({ ...newHolder, contactPhone: e.target.value })}
                    placeholder="+86-10-12345678"
                  />
                </div>
              </div>
              <div>
                <Label>联系地址</Label>
                <Input
                  value={newHolder.contactAddress}
                  onChange={(e) => setNewHolder({ ...newHolder, contactAddress: e.target.value })}
                  placeholder="北京市海淀区..."
                />
              </div>
            </div>

            {/* 描述信息 */}
            <div className="space-y-4">
              <div>
                <Label>描述 (中文)</Label>
                <Textarea
                  value={newHolder.description}
                  onChange={(e) => setNewHolder({ ...newHolder, description: e.target.value })}
                  placeholder="版权方的详细描述..."
                  rows={3}
                />
              </div>
              <div>
                <Label>许可要求</Label>
                <Textarea
                  value={newHolder.licenseRequirements}
                  onChange={(e) => setNewHolder({ ...newHolder, licenseRequirements: e.target.value })}
                  placeholder="使用许可的具体要求..."
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
                <Label>启用状态</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={newHolder.isVerified}
                  onCheckedChange={(checked) => setNewHolder({ ...newHolder, isVerified: checked })}
                />
                <Label>已验证</Label>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                取消
              </Button>
              <Button
                onClick={handleEditHolder}
                disabled={!newHolder.name}
              >
                更新版权方
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 删除确认对话框 */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="删除版权方"
        description="确定要删除这个版权方吗？这将影响相关的量表。此操作不可逆转。"
        confirmText="删除"
        cancelText="取消"
        onConfirm={handleDeleteHolder}
        variant="destructive"
      />
    </div>
  );
}