'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  CheckCircle,
  AlertCircle,
  Eye,
  Edit,
  MessageSquare,
  Clock,
  CheckSquare,
  Zap
} from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useToast } from '@/hooks/useToast';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';

interface InterpretationData {
  id: string;
  scaleId: string;
  scaleName: string;
  scaleAcronym: string;
  overview: string;
  structure: string;
  psychometricProperties: string;
  interpretation: string;
  usageGuidelines: string;
  clinicalApplications: string;
  status: string;
  generationMethod: string;
  aiModel?: string;
  aiTokensUsed?: number;
  version: number;
  needsVerification: boolean;
  createdAt: string;
  reviewNotes?: string;
}

interface ReviewStats {
  total: number;
  draft: number;
  reviewing: number;
  approved: number;
  published: number;
}

export default function InterpretationReviewPage() {
  const { language } = useLanguage();
  const toast = useToast();
  const isZh = language === 'zh';

  const [loading, setLoading] = useState(true);
  const [interpretations, setInterpretations] = useState<InterpretationData[]>([]);
  const [stats, setStats] = useState<ReviewStats>({
    total: 0,
    draft: 0,
    reviewing: 0,
    approved: 0,
    published: 0,
  });
  const [selectedInterpretation, setSelectedInterpretation] = useState<InterpretationData | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [filter, setFilter] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [batchAction, setBatchAction] = useState<string>('');
  const [generating, setGenerating] = useState(false);

  const fetchInterpretations = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/interpretations?status=${filter}`);
      const result = await response.json() as { success: boolean; interpretations: InterpretationData[]; stats: ReviewStats };
      
      if (result.success) {
        setInterpretations(result.interpretations);
        setStats(result.stats);
      }
    } catch (error) {
      console.error('Failed to fetch interpretations:', error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchInterpretations();
  }, [fetchInterpretations]);

  const handleApprove = async () => {
    if (!selectedInterpretation) return;

    try {
      const response = await fetch(`/api/admin/interpretations/${selectedInterpretation.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: reviewNotes }),
      });

      const result = await response.json() as { success: boolean; message?: string };

      if (result.success) {
        toast.success(isZh ? '审核通过' : 'Approved');
        fetchInterpretations();
        setSelectedInterpretation(null);
        setReviewNotes('');
      } else {
        toast.error(result.message || 'Failed');
      }
    } catch (error) {
      console.error('Failed to approve:', error);
      toast.error(isZh ? '操作失败' : 'Failed');
    }
  };

  const handleRequestChanges = async () => {
    if (!selectedInterpretation || !reviewNotes) {
      toast.error(isZh ? '请填写审核意见' : 'Please provide review notes');
      return;
    }

    try {
      const response = await fetch(`/api/admin/interpretations/${selectedInterpretation.id}/request-changes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: reviewNotes }),
      });

      const result = await response.json() as { success: boolean; message?: string };

      if (result.success) {
        toast.success(isZh ? '已要求修改' : 'Changes requested');
        fetchInterpretations();
        setSelectedInterpretation(null);
        setReviewNotes('');
      } else {
        toast.error(result.message || 'Failed');
      }
    } catch (error) {
      console.error('Failed to request changes:', error);
      toast.error(isZh ? '操作失败' : 'Failed');
    }
  };

  const handlePublish = async () => {
    if (!selectedInterpretation) return;

    try {
      const response = await fetch(`/api/admin/interpretations/${selectedInterpretation.id}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const result = await response.json() as { success: boolean; message?: string };

      if (result.success) {
        toast.success(isZh ? '已发布' : 'Published');
        fetchInterpretations();
        setSelectedInterpretation(null);
      } else {
        toast.error(result.message || 'Failed');
      }
    } catch (error) {
      console.error('Failed to publish:', error);
      toast.error(isZh ? '操作失败' : 'Failed');
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === interpretations.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(interpretations.map(i => i.id));
    }
  };

  const handleBatchAction = async () => {
    if (selectedIds.length === 0 || !batchAction) {
      toast.error(isZh ? '请选择项目和操作' : 'Please select items and action');
      return;
    }

    try {
      const response = await fetch('/api/admin/interpretations/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: selectedIds,
          action: batchAction,
          notes: reviewNotes,
        }),
      });

      const result = await response.json() as { success: boolean; affected?: number; message?: string };

      if (result.success) {
        toast.success(isZh ? `成功处理 ${result.affected} 项` : `Successfully processed ${result.affected} items`);
        setSelectedIds([]);
        setBatchAction('');
        setReviewNotes('');
        fetchInterpretations();
      } else {
        toast.error(result.message || 'Failed');
      }
    } catch (error) {
      console.error('Failed to perform batch action:', error);
      toast.error(isZh ? '批量操作失败' : 'Batch operation failed');
    }
  };

  const handleBatchGenerate = async () => {
    if (generating) return;

    try {
      setGenerating(true);
      const response = await fetch('/api/admin/interpretations/generate-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          limit: 5,
          offset: 0,
          force: false,
          language: 'zh',
        }),
      });

      const result = await response.json() as {
        success: boolean;
        results?: { success: number; failed: number; total: number; errors?: Array<{ scale: string; error: string }> };
        message?: string;
      };

      if (result.success && result.results) {
        const { success, failed, total } = result.results;
        toast.success(
          isZh
            ? `批量生成完成：成功 ${success}/${total}，失败 ${failed}`
            : `Batch generation completed: ${success}/${total} succeeded, ${failed} failed`
        );
        if (result.results.errors && result.results.errors.length > 0) {
          console.error('Generation errors:', result.results.errors);
        }
        fetchInterpretations();
      } else {
        toast.error(result.message || (isZh ? '批量生成失败' : 'Batch generation failed'));
      }
    } catch (error) {
      console.error('Failed to generate batch:', error);
      toast.error(isZh ? '批量生成失败' : 'Batch generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />已发布</Badge>;
      case 'approved':
        return <Badge className="bg-blue-500"><CheckCircle className="w-3 h-3 mr-1" />已审核</Badge>;
      case 'reviewing':
        return <Badge className="bg-yellow-500"><Clock className="w-3 h-3 mr-1" />审核中</Badge>;
      case 'draft':
        return <Badge variant="secondary"><Edit className="w-3 h-3 mr-1" />草稿</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">
          {isZh ? '加载中...' : 'Loading...'}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {isZh ? '量表解读审核' : 'Interpretation Review'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isZh ? '审核和管理 AI 生成的量表解读内容' : 'Review and manage AI-generated scale interpretations'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleBatchGenerate} disabled={generating} variant="outline">
            <Zap className="w-4 h-4 mr-2" />
            {generating ? (isZh ? '生成中...' : 'Generating...') : (isZh ? 'AI 批量生成' : 'AI Batch Generate')}
          </Button>
          <Link href="/admin/interpretations/create">
            <Button>
              <Edit className="w-4 h-4 mr-2" />
              新建解读
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">总数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">草稿</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats.draft}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">审核中</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.reviewing}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">已审核</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.approved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">已发布</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.published}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList>
          <TabsTrigger value="all">全部</TabsTrigger>
          <TabsTrigger value="draft">草稿</TabsTrigger>
          <TabsTrigger value="reviewing">审核中</TabsTrigger>
          <TabsTrigger value="approved">已审核</TabsTrigger>
          <TabsTrigger value="published">已发布</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Batch Operations */}
      {selectedIds.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="font-semibold">已选择 {selectedIds.length} 项</span>
                <select
                  value={batchAction}
                  onChange={(e) => setBatchAction(e.target.value)}
                  className="border rounded px-3 py-2"
                >
                  <option value="">选择操作</option>
                  <option value="approve">批量审核通过</option>
                  <option value="publish">批量发布</option>
                  <option value="request-changes">批量要求修改</option>
                  <option value="delete">批量删除</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" onClick={() => setSelectedIds([])}>
                  取消选择
                </Button>
                <Button onClick={handleBatchAction} disabled={!batchAction}>
                  执行操作
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* List */}
        <div className="lg:col-span-1 space-y-3">
          {interpretations.length > 0 && (
            <div className="flex items-center justify-between mb-2">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleSelectAll}
                className="flex items-center"
              >
                <CheckSquare className="w-4 h-4 mr-2" />
                {selectedIds.length === interpretations.length ? '取消全选' : '全选'}
              </Button>
              {selectedIds.length > 0 && (
                <span className="text-sm text-muted-foreground">
                  已选 {selectedIds.length} 项
                </span>
              )}
            </div>
          )}
          
          {interpretations.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                {isZh ? '暂无数据' : 'No data'}
              </CardContent>
            </Card>
          ) : (
            interpretations.map((item) => (
              <Card
                key={item.id}
                className={`transition-colors ${
                  selectedInterpretation?.id === item.id ? 'ring-2 ring-blue-500' : ''
                } ${selectedIds.includes(item.id) ? 'bg-blue-50' : ''}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(item.id)}
                      onChange={() => toggleSelection(item.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="mt-1"
                    />
                    <div 
                      className="flex-1 cursor-pointer"
                      onClick={() => setSelectedInterpretation(item)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold">{item.scaleName}</h3>
                          <p className="text-sm text-muted-foreground">{item.scaleAcronym}</p>
                        </div>
                        {getStatusBadge(item.status)}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="outline" className="text-xs">
                          {item.generationMethod}
                        </Badge>
                        <span>v{item.version}</span>
                        {item.needsVerification && (
                          <AlertCircle className="w-3 h-3 text-yellow-500" />
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Detail & Review */}
        <div className="lg:col-span-2">
          {selectedInterpretation ? (
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{selectedInterpretation.scaleName}</CardTitle>
                    <CardDescription>{selectedInterpretation.scaleAcronym}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {getStatusBadge(selectedInterpretation.status)}
                    {selectedInterpretation.needsVerification && (
                      <Badge variant="destructive">需要验证</Badge>
                    )}
                  </div>
                </div>
                {selectedInterpretation.aiModel && (
                  <div className="text-sm text-muted-foreground mt-2">
                    AI模型: {selectedInterpretation.aiModel} | 
                    Tokens: {selectedInterpretation.aiTokensUsed} |
                    版本: v{selectedInterpretation.version}
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Content Sections */}
                <Section title="1. 量表概述" content={selectedInterpretation.overview} />
                <Section title="2. 量表结构" content={selectedInterpretation.structure} />
                <Section title="3. 心理测量学特性" content={selectedInterpretation.psychometricProperties} />
                <Section title="4. 结果解释" content={selectedInterpretation.interpretation} />
                <Section title="5. 使用指南" content={selectedInterpretation.usageGuidelines} />
                <Section title="6. 临床应用" content={selectedInterpretation.clinicalApplications} />

                <Separator />

                {/* Review Form */}
                {selectedInterpretation.status !== 'published' && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">审核意见</label>
                      <Textarea
                        placeholder="请填写审核意见、修改建议或需要补充的内容..."
                        value={reviewNotes}
                        onChange={(e) => setReviewNotes(e.target.value)}
                        rows={4}
                        className="mt-2"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={handleApprove} className="bg-green-600">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        通过审核
                      </Button>
                      <Button onClick={handleRequestChanges} variant="outline">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        需要修改
                      </Button>
                      {selectedInterpretation.status === 'approved' && (
                        <Button onClick={handlePublish} className="bg-blue-600">
                          <Eye className="w-4 h-4 mr-2" />
                          发布
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {/* Previous Review Notes */}
                {selectedInterpretation.reviewNotes && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>之前的审核意见：</strong>
                      <p className="mt-1">{selectedInterpretation.reviewNotes}</p>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-12 text-center text-muted-foreground">
                {isZh ? '请选择一个解读进行审核' : 'Select an interpretation to review'}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ title, content }: { title: string; content: string }) {
  return (
    <div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <div className="prose prose-sm max-w-none text-sm">
        {content || <span className="text-muted-foreground">暂无内容</span>}
      </div>
    </div>
  );
}
