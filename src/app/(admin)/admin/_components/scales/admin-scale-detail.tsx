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
  Plus,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  List,
  AlertTriangle
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/useToast";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface EcoaScale {
  id: string;
  name: string;
  nameEn?: string;
  acronym?: string;
  description?: string;
  itemsCount: number;
  dimensionsCount: number;
  validationStatus: string;
  administrationTime?: number;
  targetPopulation?: string;
  ageRange?: string;
  createdAt: string;
  updatedAt: string;
  // Copyright fields
  copyrightInfo?: string;
  copyrightHolderId?: string;
  copyrightHolderName?: string;
  licenseType?: string;
  licenseTerms?: string;
  usageRestrictions?: string;
}

interface EcoaItem {
  id: string;
  itemNumber: number;
  question: string;
  questionEn?: string;
  dimension?: string;
  responseType: string;
  responseOptions?: string[];
  scoringInfo?: string;
  isRequired: number;
  sortOrder: number;
}

interface AdminScaleDetailProps {
  scaleId: string;
}

export function AdminScaleDetail({ scaleId }: AdminScaleDetailProps) {
  const router = useRouter();
  const toast = useToast();
  const [scale, setScale] = useState<EcoaScale | null>(null);
  const [items, setItems] = useState<EcoaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createItemOpen, setCreateItemOpen] = useState(false);
  const [editItemOpen, setEditItemOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<EcoaItem | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [newItem, setNewItem] = useState({
    question: "",
    questionEn: "",
    dimension: "",
    responseType: "likert",
    responseOptions: [""],
    scoringInfo: "",
    isRequired: true
  });

  const fetchScaleDetails = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/scales/${scaleId}`);
      const data = await response.json();

      if (data.success) {
        setScale(data.scale);
      } else {
        setError(data.error || "加载量表失败");
      }
    } catch (error) {
      console.error("加载量表详情失败:", error);
      setError("网络错误，请稍后重试");
    }
  }, [scaleId]);

  const fetchScaleItems = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/scales/${scaleId}/items`);
      const data = await response.json();

      if (data.success) {
        setItems(data.items || []);
      } else {
        console.error("加载题目失败:", data.error);
      }
    } catch (error) {
      console.error("加载题目失败:", error);
    } finally {
      setLoading(false);
    }
  }, [scaleId]);

  useEffect(() => {
    fetchScaleDetails();
    fetchScaleItems();
  }, [fetchScaleDetails, fetchScaleItems]);

  const handleCreateItem = async () => {
    try {
      const response = await fetch(`/api/admin/scales/${scaleId}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newItem,
          responseOptions: newItem.responseOptions.filter(opt => opt.trim() !== "")
        })
      });

      const data = await response.json();

      if (response.ok) {
        setCreateItemOpen(false);
        resetNewItem();
        fetchScaleItems();
        fetchScaleDetails(); // 更新题目数量
        toast.success("题目创建成功！");
      } else {
        toast.error(data.error || "创建题目失败");
      }
    } catch (error) {
      console.error("创建题目错误:", error);
      toast.error("网络错误，请稍后重试");
    }
  };

  const handleEditItem = async () => {
    if (!editingItem) return;

    try {
      const response = await fetch(`/api/admin/scales/${scaleId}/items/${editingItem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newItem,
          responseOptions: newItem.responseOptions.filter(opt => opt.trim() !== "")
        })
      });

      const data = await response.json();

      if (response.ok) {
        setEditItemOpen(false);
        setEditingItem(null);
        resetNewItem();
        fetchScaleItems();
        toast.success("题目更新成功！");
      } else {
        toast.error(data.error || "更新题目失败");
      }
    } catch (error) {
      console.error("更新题目错误:", error);
      toast.error("网络错误，请稍后重试");
    }
  };

  const deleteItem = async () => {
    if (!itemToDelete) return;

    try {
      const itemId = itemToDelete;
      const response = await fetch(`/api/admin/scales/${scaleId}/items/${itemId}`, {
        method: "DELETE"
      });

      const data = await response.json();

      if (response.ok) {
        setItemToDelete(null);
        fetchScaleItems();
        fetchScaleDetails();
        toast.success("题目删除成功！");
      } else {
        toast.error(data.error || "删除题目失败");
      }
    } catch (error) {
      console.error("删除题目错误:", error);
      toast.error("网络错误，请稍后重试");
    }
  };

  const moveItem = async (itemId: string, direction: 'up' | 'down') => {
    try {
      const response = await fetch(`/api/admin/scales/${scaleId}/items/${itemId}/move`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ direction })
      });

      const data = await response.json();

      if (response.ok) {
        fetchScaleItems();
      } else {
        toast.error(data.error || "移动题目失败");
      }
    } catch (error) {
      console.error("移动题目错误:", error);
      toast.error("网络错误，请稍后重试");
    }
  };

  const openEditDialog = (item: EcoaItem) => {
    setEditingItem(item);
    setNewItem({
      question: item.question,
      questionEn: item.questionEn || "",
      dimension: item.dimension || "",
      responseType: item.responseType,
      responseOptions: item.responseOptions || [""],
      scoringInfo: item.scoringInfo || "",
      isRequired: Boolean(item.isRequired)
    });
    setEditItemOpen(true);
  };

  // 保存量表信息（包括版权信息）
  const handleSave = async () => {
    if (!scale) return;

    try {
      const response = await fetch(`/api/admin/scales/${scaleId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: scale.name,
          nameEn: scale.nameEn,
          acronym: scale.acronym,
          description: scale.description,
          administrationTime: scale.administrationTime,
          targetPopulation: scale.targetPopulation,
          ageRange: scale.ageRange,
          validationStatus: scale.validationStatus,
          copyrightInfo: scale.copyrightInfo,
          copyrightHolderId: scale.copyrightHolderId,
          licenseType: scale.licenseType,
          licenseTerms: scale.licenseTerms,
          usageRestrictions: scale.usageRestrictions,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("量表信息更新成功");
        fetchScaleDetails(); // 重新加载数据
      } else {
        toast.error(data.error || "更新量表失败");
      }
    } catch (error) {
      console.error("更新量表错误:", error);
      toast.error("更新量表失败");
    }
  };

  const resetNewItem = () => {
    setNewItem({
      question: "",
      questionEn: "",
      dimension: "",
      responseType: "likert",
      responseOptions: [""],
      scoringInfo: "",
      isRequired: true
    });
  };

  const addResponseOption = () => {
    setNewItem({
      ...newItem,
      responseOptions: [...newItem.responseOptions, ""]
    });
  };

  const removeResponseOption = (index: number) => {
    setNewItem({
      ...newItem,
      responseOptions: newItem.responseOptions.filter((_, i) => i !== index)
    });
  };

  const updateResponseOption = (index: number, value: string) => {
    const updated = [...newItem.responseOptions];
    updated[index] = value;
    setNewItem({
      ...newItem,
      responseOptions: updated
    });
  };

  const getResponseTypeLabel = (type: string) => {
    const labels = {
      likert: "李克特量表",
      boolean: "是/否",
      numeric: "数值输入",
      text: "文本输入",
      multiple_choice: "多选题",
      single_choice: "单选题"
    };
    return labels[type as keyof typeof labels] || type;
  };

  if (loading) {
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

  if (error || !scale) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="min-h-[100vh] flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-500" />
            <p className="text-lg font-medium mb-2">加载失败</p>
            <p className="text-muted-foreground mb-4">{error || "量表不存在"}</p>
            <Button onClick={() => router.push("/admin/scales")}>
              返回量表列表
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const renderItemForm = () => (
    <div className="space-y-4">
      <div>
        <Label>题目内容 (中文) *</Label>
        <Textarea
          value={newItem.question}
          onChange={(e) => setNewItem({ ...newItem, question: e.target.value })}
          placeholder="请输入题目内容..."
          rows={2}
        />
      </div>

      <div>
        <Label>题目内容 (英文)</Label>
        <Textarea
          value={newItem.questionEn}
          onChange={(e) => setNewItem({ ...newItem, questionEn: e.target.value })}
          placeholder="English question content..."
          rows={2}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>维度/领域</Label>
          <Input
            value={newItem.dimension}
            onChange={(e) => setNewItem({ ...newItem, dimension: e.target.value })}
            placeholder="例如：认知功能"
          />
        </div>
        <div>
          <Label>回答类型</Label>
          <Select value={newItem.responseType} onValueChange={(value) =>
            setNewItem({ ...newItem, responseType: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="likert">李克特量表</SelectItem>
              <SelectItem value="boolean">是/否</SelectItem>
              <SelectItem value="numeric">数值输入</SelectItem>
              <SelectItem value="text">文本输入</SelectItem>
              <SelectItem value="single_choice">单选题</SelectItem>
              <SelectItem value="multiple_choice">多选题</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 回答选项 */}
      {(newItem.responseType === "likert" || newItem.responseType === "single_choice" || newItem.responseType === "multiple_choice") && (
        <div>
          <Label>回答选项</Label>
          <div className="space-y-2">
            {newItem.responseOptions.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Input
                  value={option}
                  onChange={(e) => updateResponseOption(index, e.target.value)}
                  placeholder={`选项 ${index + 1}`}
                />
                {newItem.responseOptions.length > 1 && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => removeResponseOption(index)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              size="sm"
              variant="outline"
              onClick={addResponseOption}
            >
              <Plus className="w-3 h-3 mr-1" />
              添加选项
            </Button>
          </div>
        </div>
      )}

      <div>
        <Label>评分说明</Label>
        <Textarea
          value={newItem.scoringInfo}
          onChange={(e) => setNewItem({ ...newItem, scoringInfo: e.target.value })}
          placeholder="该题目的评分方法和权重说明..."
          rows={2}
        />
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="isRequired"
          checked={newItem.isRequired}
          onChange={(e) => setNewItem({ ...newItem, isRequired: e.target.checked })}
        />
        <Label htmlFor="isRequired">必答题目</Label>
      </div>
    </div>
  );

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.push("/admin/scales")}>
          <ChevronLeft className="w-4 h-4 mr-2" />
          返回量表列表
        </Button>
      </div>

      <Tabs defaultValue="info" className="w-full">
        <TabsList>
          <TabsTrigger value="info">量表信息</TabsTrigger>
          <TabsTrigger value="copyright">版权信息</TabsTrigger>
          <TabsTrigger value="items">题目管理</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Scale className="w-5 h-5" />
                <span>{scale.name}</span>
                {scale.acronym && (
                  <Badge variant="outline">{scale.acronym}</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div>
                    <span className="font-medium">中文名称:</span>
                    <p className="text-muted-foreground">{scale.name}</p>
                  </div>
                  {scale.nameEn && (
                    <div>
                      <span className="font-medium">英文名称:</span>
                      <p className="text-muted-foreground">{scale.nameEn}</p>
                    </div>
                  )}
                  <div>
                    <span className="font-medium">缩写:</span>
                    <p className="text-muted-foreground">{scale.acronym || "N/A"}</p>
                  </div>
                  <div>
                    <span className="font-medium">状态:</span>
                    <Badge className={
                      scale.validationStatus === 'published' ? 'bg-green-100 text-green-700' :
                      scale.validationStatus === 'validated' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }>
                      {scale.validationStatus === 'published' ? '已发布' :
                       scale.validationStatus === 'validated' ? '已验证' : '草稿'}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <span className="font-medium">题目数量:</span>
                    <p className="text-muted-foreground">{scale.itemsCount}</p>
                  </div>
                  <div>
                    <span className="font-medium">维度数量:</span>
                    <p className="text-muted-foreground">{scale.dimensionsCount}</p>
                  </div>
                  {scale.administrationTime && (
                    <div>
                      <span className="font-medium">管理时间:</span>
                      <p className="text-muted-foreground">{scale.administrationTime} 分钟</p>
                    </div>
                  )}
                  {scale.targetPopulation && (
                    <div>
                      <span className="font-medium">目标人群:</span>
                      <p className="text-muted-foreground">{scale.targetPopulation}</p>
                    </div>
                  )}
                </div>
              </div>
              
              {scale.description && (
                <div className="mt-4">
                  <span className="font-medium">描述:</span>
                  <p className="text-muted-foreground mt-1">{scale.description}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="copyright" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>版权与许可信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <CopyrightHolderSearch
                    value={scale?.copyrightHolderId}
                    onSelect={(holderId) => {
                      if (scale) {
                        setScale({ ...scale, copyrightHolderId: holderId || undefined });
                      }
                    }}
                    label="版权方"
                    placeholder="搜索并选择版权方..."
                  />
                </div>
                <div>
                  <Label>许可类型</Label>
                  <Select 
                    value={scale?.licenseType || "contact_required"} 
                    onValueChange={(value) => {
                      if (scale) {
                        setScale({ ...scale, licenseType: value });
                      }
                    }}
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
                  value={scale?.copyrightInfo || ""}
                  onChange={(e) => {
                    if (scale) {
                      setScale({ ...scale, copyrightInfo: e.target.value });
                    }
                  }}
                  placeholder="版权所有 © 2023 患者健康问卷开发团队"
                  rows={2}
                />
              </div>

              <div>
                <Label>许可条款</Label>
                <Textarea
                  value={scale?.licenseTerms || ""}
                  onChange={(e) => {
                    if (scale) {
                      setScale({ ...scale, licenseTerms: e.target.value });
                    }
                  }}
                  placeholder="详细的许可使用条款..."
                  rows={6}
                />
              </div>

              <div>
                <Label>使用限制</Label>
                <Textarea
                  value={scale?.usageRestrictions || ""}
                  onChange={(e) => {
                    if (scale) {
                      setScale({ ...scale, usageRestrictions: e.target.value });
                    }
                  }}
                  placeholder="使用的限制条件和注意事项..."
                  rows={4}
                />
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSave}>
                  保存版权信息
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="items" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center space-x-2">
              <List className="w-5 h-5" />
              <span>题目管理</span>
              <Badge variant="secondary">{items.length} 个题目</Badge>
            </h2>

            {/* 创建题目对话框 */}
            <Dialog open={createItemOpen} onOpenChange={setCreateItemOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  添加题目
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>添加新题目</DialogTitle>
                  <DialogDescription>
                    为 {scale.name} 添加一个新的题目
                  </DialogDescription>
                </DialogHeader>

                {renderItemForm()}

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setCreateItemOpen(false)}>
                    取消
                  </Button>
                  <Button
                    onClick={handleCreateItem}
                    disabled={!newItem.question}
                  >
                    添加题目
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* 编辑题目对话框 */}
            <Dialog open={editItemOpen} onOpenChange={setEditItemOpen}>
              <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>编辑题目</DialogTitle>
                  <DialogDescription>
                    修改题目内容
                  </DialogDescription>
                </DialogHeader>

                {renderItemForm()}

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setEditItemOpen(false)}>
                    取消
                  </Button>
                  <Button
                    onClick={handleEditItem}
                    disabled={!newItem.question}
                  >
                    更新题目
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">序号</TableHead>
                    <TableHead>题目内容</TableHead>
                    <TableHead>维度</TableHead>
                    <TableHead>回答类型</TableHead>
                    <TableHead>必答</TableHead>
                    <TableHead>排序</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.length > 0 ? items.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono">
                        {item.itemNumber}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium max-w-xs truncate">{item.question}</div>
                          {item.questionEn && (
                            <div className="text-sm text-muted-foreground max-w-xs truncate">{item.questionEn}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {item.dimension || "N/A"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getResponseTypeLabel(item.responseType)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {item.isRequired ? "是" : "否"}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => moveItem(item.id, 'up')}
                            disabled={index === 0}
                          >
                            <ChevronUp className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => moveItem(item.id, 'down')}
                            disabled={index === items.length - 1}
                          >
                            <ChevronDown className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditDialog(item)}
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            编辑
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setItemToDelete(item.id);
                              setDeleteConfirmOpen(true);
                            }}
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            删除
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        暂无题目，点击&ldquo;添加题目&rdquo;开始创建
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 删除确认对话框 */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="删除题目"
        description="确定要删除这个题目吗？此操作不可逆转。"
        confirmText="删除"
        cancelText="取消"
        onConfirm={deleteItem}
        variant="destructive"
      />
    </div>
  );
}