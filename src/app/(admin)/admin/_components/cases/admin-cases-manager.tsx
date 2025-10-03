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
  Users,
  Clock
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { useLanguage } from "@/hooks/useLanguage";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/useToast";

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
  const { t } = useLanguage();
  const router = useRouter();
  const toast = useToast();
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

  useEffect(() => {
    fetchCases();
    fetchScales();
  }, [statusFilter, page]);

  const fetchCases = async () => {
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
        console.error("加载临床案例失败:", data.error);
      }
    } catch (error) {
      console.error("加载临床案例失败:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchScales = async () => {
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
      console.error("加载量表列表失败:", error);
    }
  };

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
        toast.success("临床案例创建成功！");
      } else {
        toast.error(data.error || "创建案例失败");
      }
    } catch (error) {
      console.error("创建案例错误:", error);
      toast.error("网络错误，请稍后重试");
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
        toast.success("案例更新成功！");
      } else {
        toast.error(data.error || "更新案例失败");
      }
    } catch (error) {
      console.error("更新案例错误:", error);
      toast.error("网络错误，请稍后重试");
    }
  };

  const deleteCase = async (caseId: string) => {
    const confirmed = await toast.confirm("确定要删除这个临床案例吗？此操作不可逆转。");
    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/clinical-cases/${caseId}`, {
        method: "DELETE"
      });

      const data = await response.json();

      if (response.ok) {
        fetchCases();
        toast.success("案例删除成功！");
      } else {
        toast.error(data.error || "删除案例失败");
      }
    } catch (error) {
      console.error("删除案例错误:", error);
      toast.error("网络错误，请稍后重试");
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
      draft: "草稿",
      reviewed: "已审核",
      published: "已发布"
    };
    return labels[status as keyof typeof labels] || status;
  };

  const renderCaseForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>案例标题 *</Label>
          <Input
            value={newCase.title}
            onChange={(e) => setNewCase({ ...newCase, title: e.target.value })}
            placeholder="案例标题"
          />
        </div>
        <div>
          <Label>关联量表 *</Label>
          <Select value={newCase.scaleId} onValueChange={(value) =>
            setNewCase({ ...newCase, scaleId: value })}>
            <SelectTrigger>
              <SelectValue placeholder="选择量表" />
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
          <Label>难度等级</Label>
          <Select value={newCase.difficultyLevel} onValueChange={(value) =>
            setNewCase({ ...newCase, difficultyLevel: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">初级</SelectItem>
              <SelectItem value="intermediate">中级</SelectItem>
              <SelectItem value="advanced">高级</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>专科领域</Label>
          <Input
            value={newCase.specialty}
            onChange={(e) => setNewCase({ ...newCase, specialty: e.target.value })}
            placeholder="psychiatry"
          />
        </div>
        <div>
          <Label>状态</Label>
          <Select value={newCase.reviewStatus} onValueChange={(value) =>
            setNewCase({ ...newCase, reviewStatus: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">草稿</SelectItem>
              <SelectItem value="reviewed">已审核</SelectItem>
              <SelectItem value="published">已发布</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label>作者</Label>
        <Input
          value={newCase.author}
          onChange={(e) => setNewCase({ ...newCase, author: e.target.value })}
          placeholder="案例作者"
        />
      </div>

      <div>
        <Label>患者背景</Label>
        <Textarea
          value={newCase.patientBackground}
          onChange={(e) => setNewCase({ ...newCase, patientBackground: e.target.value })}
          placeholder="描述患者的基本情况、症状和背景信息..."
          rows={3}
        />
      </div>

      <div>
        <Label>结果解读</Label>
        <Textarea
          value={newCase.interpretation}
          onChange={(e) => setNewCase({ ...newCase, interpretation: e.target.value })}
          placeholder="量表评分结果的专业解读..."
          rows={3}
        />
      </div>

      <div>
        <Label>临床决策</Label>
        <Textarea
          value={newCase.clinicalDecision}
          onChange={(e) => setNewCase({ ...newCase, clinicalDecision: e.target.value })}
          placeholder="基于评估结果的临床决策和治疗方案..."
          rows={2}
        />
      </div>

      <div>
        <Label>治疗结果</Label>
        <Textarea
          value={newCase.outcome}
          onChange={(e) => setNewCase({ ...newCase, outcome: e.target.value })}
          placeholder="治疗后的结果和患者改善情况..."
          rows={2}
        />
      </div>

      <div>
        <Label>学习要点</Label>
        <Textarea
          value={newCase.learningPoints}
          onChange={(e) => setNewCase({ ...newCase, learningPoints: e.target.value })}
          placeholder="从这个案例中可以学到的关键点，每行一个要点..."
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
            href: "/admin/cases",
            label: "临床案例管理"
          }
        ]}
      />
      <div className="flex flex-1 flex-col gap-4 p-4">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center space-x-2">
              <Beaker className="w-6 h-6 text-blue-600" />
              <span>临床案例管理</span>
            </h1>
            <p className="text-muted-foreground">
              管理系统中的所有临床案例，创建、编辑和发布学习案例
            </p>
          </div>

          {/* 创建案例对话框 */}
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                创建案例
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>创建新的临床案例</DialogTitle>
                <DialogDescription>
                  创建一个新的临床学习案例
                </DialogDescription>
              </DialogHeader>

              {renderCaseForm()}

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  取消
                </Button>
                <Button
                  onClick={handleCreateCase}
                  disabled={!newCase.scaleId || !newCase.title}
                >
                  创建案例
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* 编辑案例对话框 */}
          <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>编辑临床案例</DialogTitle>
                <DialogDescription>
                  修改案例信息
                </DialogDescription>
              </DialogHeader>

              {renderCaseForm()}

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                  取消
                </Button>
                <Button
                  onClick={handleEditCase}
                  disabled={!newCase.scaleId || !newCase.title}
                >
                  更新案例
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
              <div className="text-sm text-muted-foreground">总案例数</div>
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
              <div className="text-2xl font-bold text-blue-600">{stats.reviewed}</div>
              <div className="text-sm text-muted-foreground">已审核</div>
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
              placeholder="搜索案例标题、作者或量表..."
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
                <SelectItem value="reviewed">已审核</SelectItem>
                <SelectItem value="published">已发布</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={fetchCases}>搜索</Button>
        </div>

        {/* 案例列表 */}
        <Card>
          <CardHeader>
            <CardTitle>临床案例列表</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>案例标题</TableHead>
                  <TableHead>关联量表</TableHead>
                  <TableHead>专科</TableHead>
                  <TableHead>难度</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>作者</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead>操作</TableHead>
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
                        {caseItem.difficultyLevel || "未设定"}
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
                          查看
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditDialog(caseItem)}
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          编辑
                        </Button>
                        {caseItem.reviewStatus === "draft" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteCase(caseItem.id)}
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
                      暂无案例记录
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