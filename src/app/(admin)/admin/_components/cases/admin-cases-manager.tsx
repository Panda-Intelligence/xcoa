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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Beaker,
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
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/useToast";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useLanguage } from "@/hooks/useLanguage";

interface ClinicalCase {
  id: string;
  title: string;
  scaleId: string;
  scaleName: string;
  scaleAcronym: string;
  patientBackground?: string;
  scaleScores?: Record<string, number>;
  interpretation?: string;
  clinicalDecision?: string;
  outcome?: string;
  learningPoints?: string;
  difficultyLevel?: string;
  specialty?: string;
  author?: string;
  reviewStatus: string;
  createdAt: string;
  updatedAt: string;
}

interface CaseStats {
  total: number;
  published: number;
  draft: number;
  reviewed: number;
}

export function AdminCasesManager() {
  const router = useRouter();
  const toast = useToast();
  const { t } = useLanguage();
  const [cases, setCases] = useState<ClinicalCase[]>([]);
  const [stats, setStats] = useState<CaseStats>({ total: 0, published: 0, draft: 0, reviewed: 0 });
  const [scales, setScales] = useState<Array<{ id: string; name: string; acronym: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [editingCase, setEditingCase] = useState<ClinicalCase | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [caseToDelete, setCaseToDelete] = useState<string | null>(null);
  const [newCase, setNewCase] = useState({
    scaleId: "",
    title: "",
    patientBackground: "",
    interpretation: "",
    clinicalDecision: "",
    outcome: "",
    learningPoints: "",
    difficultyLevel: "beginner",
    specialty: "",
    author: "",
    reviewStatus: "draft"
  });

  const fetchCases = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("reviewStatus", statusFilter);
      if (searchQuery) params.append("query", searchQuery);
      params.append("limit", "20");
      params.append("offset", ((page - 1) * 20).toString());

      const response = await fetch(`/api/admin/clinical-cases?${params}`);
      const data = await response.json();

      if (data.success) {
        setCases(data.cases || []);
        setStats(data.statistics || { total: 0, published: 0, draft: 0, reviewed: 0 });
        setHasMore(data.pagination?.hasMore || false);
      } else {
        console.error("Failed to load clinical cases:", data.error);
      }
    } catch (error) {
      console.error("Failed to load clinical cases:", error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchQuery, page]);

  const fetchScales = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/scales?limit=100");
      const data = await response.json();
      if (data.success) {
        setScales(data.scales?.map((s: any) => ({
          id: s.id,
          name: s.name,
          acronym: s.acronym
        })) || []);
      }
    } catch (error) {
      console.error("Failed to load scales:", error);
    }
  }, []);

  useEffect(() => {
    fetchCases();
    fetchScales();
  }, [fetchCases, fetchScales]);

  const handleCreateCase = async () => {
    try {
      const response = await fetch("/api/admin/clinical-cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCase)
      });

      const data = await response.json();

      if (response.ok) {
        setCreateDialogOpen(false);
        resetNewCase();
        fetchCases();
        toast.success(t('admin.cases.created_successfully'));
      } else {
        toast.error(data.error || t('admin.cases.create_failed'));
      }
    } catch (error) {
      console.error("Error creating case:", error);
      toast.error(t('admin.cases.network_error_retry'));
    }
  };

  const handleEditCase = async () => {
    if (!editingCase) return;

    try {
      const response = await fetch(`/api/admin/clinical-cases/${editingCase.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCase)
      });

      const data = await response.json();

      if (response.ok) {
        setEditDialogOpen(false);
        setEditingCase(null);
        resetNewCase();
        fetchCases();
        toast.success(t('admin.cases.updated_successfully'));
      } else {
        toast.error(data.error || t('admin.cases.update_failed'));
      }
    } catch (error) {
      console.error("Error updating case:", error);
      toast.error(t('admin.cases.network_error_retry'));
    }
  };

  const deleteCase = async () => {
    if (!caseToDelete) return;

    try {
      const caseId = caseToDelete;
      const response = await fetch(`/api/admin/clinical-cases/${caseId}`, {
        method: "DELETE"
      });

      const data = await response.json();

      if (response.ok) {
        setCaseToDelete(null);
        fetchCases();
        toast.success(t('admin.cases.deleted_successfully'));
      } else {
        toast.error(data.error || t('admin.cases.delete_failed'));
      }
    } catch (error) {
      console.error("Error deleting case:", error);
      toast.error(t('admin.cases.network_error_retry'));
    }
  };

  const openEditDialog = (caseItem: ClinicalCase) => {
    setEditingCase(caseItem);
    setNewCase({
      scaleId: caseItem.scaleId,
      title: caseItem.title,
      patientBackground: caseItem.patientBackground || "",
      interpretation: caseItem.interpretation || "",
      clinicalDecision: caseItem.clinicalDecision || "",
      outcome: caseItem.outcome || "",
      learningPoints: caseItem.learningPoints || "",
      difficultyLevel: caseItem.difficultyLevel || "beginner",
      specialty: caseItem.specialty || "",
      author: caseItem.author || "",
      reviewStatus: caseItem.reviewStatus
    });
    setEditDialogOpen(true);
  };

  const resetNewCase = () => {
    setNewCase({
      scaleId: "",
      title: "",
      patientBackground: "",
      interpretation: "",
      clinicalDecision: "",
      outcome: "",
      learningPoints: "",
      difficultyLevel: "beginner",
      specialty: "",
      author: "",
      reviewStatus: "draft"
    });
  };

  const getStatusColor = (status: string) => {
    const colorMap = {
      draft: "bg-gray-100 text-gray-700",
      reviewed: "bg-blue-100 text-blue-700",
      published: "bg-green-100 text-green-700"
    };
    return colorMap[status as keyof typeof colorMap] || colorMap.draft;
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      draft: t('admin.cases.status_draft'),
      reviewed: t('admin.cases.status_reviewed'),
      published: t('admin.cases.status_published')
    };
    return labels[status as keyof typeof labels] || status;
  };

  const renderCaseForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>{t('admin.cases.label_case_title')}</Label>
          <Input
            value={newCase.title}
            onChange={(e) => setNewCase({ ...newCase, title: e.target.value })}
            placeholder={t('admin.cases.placeholder_case_title')}
          />
        </div>
        <div>
          <Label>{t('admin.cases.label_related_scale')}</Label>
          <Select value={newCase.scaleId} onValueChange={(value) =>
            setNewCase({ ...newCase, scaleId: value })}>
            <SelectTrigger>
              <SelectValue placeholder={t('admin.cases.placeholder_select_scale')} />
            </SelectTrigger>
            <SelectContent>
              {scales.map(scale => (
                <SelectItem key={scale.id} value={scale.id}>
                  {scale.acronym} - {scale.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label>{t('admin.cases.label_difficulty_level')}</Label>
          <Select value={newCase.difficultyLevel} onValueChange={(value) =>
            setNewCase({ ...newCase, difficultyLevel: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">{t('admin.cases.difficulty_beginner')}</SelectItem>
              <SelectItem value="intermediate">{t('admin.cases.difficulty_intermediate')}</SelectItem>
              <SelectItem value="advanced">{t('admin.cases.difficulty_advanced')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>{t('admin.cases.label_specialty')}</Label>
          <Input
            value={newCase.specialty}
            onChange={(e) => setNewCase({ ...newCase, specialty: e.target.value })}
            placeholder={t('admin.cases.placeholder_specialty')}
          />
        </div>
        <div>
          <Label>{t('admin.cases.label_status')}</Label>
          <Select value={newCase.reviewStatus} onValueChange={(value) =>
            setNewCase({ ...newCase, reviewStatus: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">{t('admin.cases.status_draft')}</SelectItem>
              <SelectItem value="reviewed">{t('admin.cases.status_reviewed')}</SelectItem>
              <SelectItem value="published">{t('admin.cases.status_published')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label>{t('admin.cases.label_author')}</Label>
        <Input
          value={newCase.author}
          onChange={(e) => setNewCase({ ...newCase, author: e.target.value })}
          placeholder={t('admin.cases.placeholder_author')}
        />
      </div>

      <div>
        <Label>{t('admin.cases.label_patient_background')}</Label>
        <Textarea
          value={newCase.patientBackground}
          onChange={(e) => setNewCase({ ...newCase, patientBackground: e.target.value })}
          placeholder={t('admin.cases.placeholder_patient_background')}
          rows={3}
        />
      </div>

      <div>
        <Label>{t('admin.cases.label_interpretation')}</Label>
        <Textarea
          value={newCase.interpretation}
          onChange={(e) => setNewCase({ ...newCase, interpretation: e.target.value })}
          placeholder={t('admin.cases.placeholder_interpretation')}
          rows={3}
        />
      </div>

      <div>
        <Label>{t('admin.cases.label_clinical_decision')}</Label>
        <Textarea
          value={newCase.clinicalDecision}
          onChange={(e) => setNewCase({ ...newCase, clinicalDecision: e.target.value })}
          placeholder={t('admin.cases.placeholder_clinical_decision')}
          rows={2}
        />
      </div>

      <div>
        <Label>{t('admin.cases.label_outcome')}</Label>
        <Textarea
          value={newCase.outcome}
          onChange={(e) => setNewCase({ ...newCase, outcome: e.target.value })}
          placeholder={t('admin.cases.placeholder_outcome')}
          rows={2}
        />
      </div>

      <div>
        <Label>{t('admin.cases.label_learning_points')}</Label>
        <Textarea
          value={newCase.learningPoints}
          onChange={(e) => setNewCase({ ...newCase, learningPoints: e.target.value })}
          placeholder={t('admin.cases.placeholder_learning_points')}
          rows={3}
        />
      </div>
    </div>
  );

  if (loading && page === 1) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="min-h-[100vh] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">{t('admin.cases.loading')}</p>
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
            href: "/admin/cases",
            label: t('admin.cases.breadcrumb_title')
          }
        ]}
      />
      <div className="flex flex-1 flex-col gap-4 p-4">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center space-x-2">
              <Beaker className="w-6 h-6 text-blue-600" />
              <span>{t('admin.cases.title')}</span>
            </h1>
            <p className="text-muted-foreground">
              {t('admin.cases.description')}
            </p>
          </div>

          {/* 创建案例对话框 */}
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                {t('admin.cases.button_create_case')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{t('admin.cases.form_create_title')}</DialogTitle>
                <DialogDescription>
                  {t('admin.cases.form_create_description')}
                </DialogDescription>
              </DialogHeader>

              {renderCaseForm()}

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  {t('admin.cases.button_cancel')}
                </Button>
                <Button
                  onClick={handleCreateCase}
                  disabled={!newCase.scaleId || !newCase.title}
                >
                  {t('admin.cases.button_create')}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* 编辑案例对话框 */}
          <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{t('admin.cases.form_edit_title')}</DialogTitle>
                <DialogDescription>
                  {t('admin.cases.form_edit_description')}
                </DialogDescription>
              </DialogHeader>

              {renderCaseForm()}

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                  {t('admin.cases.button_cancel')}
                </Button>
                <Button
                  onClick={handleEditCase}
                  disabled={!newCase.scaleId || !newCase.title}
                >
                  {t('admin.cases.button_update')}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-muted-foreground">{t('admin.cases.stats_total')}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.published}</div>
              <div className="text-sm text-muted-foreground">{t('admin.cases.stats_published')}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.reviewed}</div>
              <div className="text-sm text-muted-foreground">{t('admin.cases.stats_reviewed')}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-600">{stats.draft}</div>
              <div className="text-sm text-muted-foreground">{t('admin.cases.stats_draft')}</div>
            </CardContent>
          </Card>
        </div>

        {/* 搜索和筛选 */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder={t('admin.cases.search_placeholder')}
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
                <SelectItem value="all">{t('admin.cases.filter_all_status')}</SelectItem>
                <SelectItem value="draft">{t('admin.cases.status_draft')}</SelectItem>
                <SelectItem value="reviewed">{t('admin.cases.status_reviewed')}</SelectItem>
                <SelectItem value="published">{t('admin.cases.status_published')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={fetchCases}>{t('admin.cases.button_search')}</Button>
        </div>

        {/* 案例列表 */}
        <Card>
          <CardHeader>
            <CardTitle>{t('admin.cases.table_title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('admin.cases.table_case_title')}</TableHead>
                  <TableHead>{t('admin.cases.table_related_scale')}</TableHead>
                  <TableHead>{t('admin.cases.table_specialty')}</TableHead>
                  <TableHead>{t('admin.cases.table_difficulty')}</TableHead>
                  <TableHead>{t('admin.cases.table_status')}</TableHead>
                  <TableHead>{t('admin.cases.table_author')}</TableHead>
                  <TableHead>{t('admin.cases.table_created_at')}</TableHead>
                  <TableHead>{t('admin.cases.table_actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cases.length > 0 ? cases.map((caseItem) => (
                  <TableRow key={caseItem.id}>
                    <TableCell>
                      <div className="font-medium">{caseItem.title}</div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{caseItem.scaleAcronym}</div>
                        <div className="text-sm text-muted-foreground">{caseItem.scaleName}</div>
                      </div>
                    </TableCell>
                    <TableCell>{caseItem.specialty || "N/A"}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {caseItem.difficultyLevel || t('admin.cases.difficulty_not_set')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(caseItem.reviewStatus)}>
                        {getStatusLabel(caseItem.reviewStatus)}
                      </Badge>
                    </TableCell>
                    <TableCell>{caseItem.author || "N/A"}</TableCell>
                    <TableCell>
                      {new Date(caseItem.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => router.push(`/insights/cases/${caseItem.id}`)}
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          {t('admin.cases.button_view')}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditDialog(caseItem)}
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          {t('admin.cases.button_edit')}
                        </Button>
                        {caseItem.reviewStatus === "draft" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setCaseToDelete(caseItem.id);
                              setDeleteConfirmOpen(true);
                            }}
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            {t('admin.cases.button_delete')}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      {t('admin.cases.no_cases')}
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
                {t('admin.cases.pagination_previous')}
              </Button>
              <span className="text-sm text-muted-foreground">
                {t('admin.cases.pagination_page').replace('{page}', page.toString())}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={!hasMore}
              >
                {t('admin.cases.pagination_next')}
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
        title={t('admin.cases.delete_confirm_title')}
        description={t('admin.cases.delete_confirm_description')}
        confirmText={t('admin.cases.delete_confirm_button')}
        cancelText={t('admin.cases.delete_cancel_button')}
        onConfirm={deleteCase}
        variant="destructive"
      />
    </>
  );
}