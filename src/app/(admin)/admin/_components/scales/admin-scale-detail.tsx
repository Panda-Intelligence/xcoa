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
import { useLanguage } from "@/hooks/useLanguage";
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
  const { t } = useLanguage();
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
        setError(data.error || t('admin.scales.detail.load_failed'));
      }
    } catch (error) {
      console.error("Error loading scale details:", error);
      setError(t('admin.scales.network_error_retry'));
    }
  }, [scaleId, t]);

  const fetchScaleItems = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/scales/${scaleId}/items`);
      const data = await response.json();

      if (data.success) {
        setItems(data.items || []);
      } else {
        console.error("Error loading items:", data.error);
      }
    } catch (error) {
      console.error("Error loading items:", error);
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
        fetchScaleDetails();
        toast.success(t('admin.scales.detail.item_created_successfully'));
      } else {
        toast.error(data.error || t('admin.scales.detail.item_create_failed'));
      }
    } catch (error) {
      console.error("Error creating item:", error);
      toast.error(t('admin.scales.network_error_retry'));
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
        toast.success(t('admin.scales.detail.item_updated_successfully'));
      } else {
        toast.error(data.error || t('admin.scales.detail.item_update_failed'));
      }
    } catch (error) {
      console.error("Error updating item:", error);
      toast.error(t('admin.scales.network_error_retry'));
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
        toast.success(t('admin.scales.detail.item_deleted_successfully'));
      } else {
        toast.error(data.error || t('admin.scales.detail.item_delete_failed'));
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error(t('admin.scales.network_error_retry'));
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
        toast.error(data.error || t('admin.scales.detail.item_move_failed'));
      }
    } catch (error) {
      console.error("Error moving item:", error);
      toast.error(t('admin.scales.network_error_retry'));
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

  // Save scale information (including copyright info)
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
        toast.success(t('admin.scales.detail.updated_successfully'));
        fetchScaleDetails();
      } else {
        toast.error(data.error || t('admin.scales.detail.update_failed'));
      }
    } catch (error) {
      console.error("Error updating scale:", error);
      toast.error(t('admin.scales.detail.update_failed'));
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
      likert: t('admin.scales.detail.response_type_likert'),
      boolean: t('admin.scales.detail.response_type_boolean'),
      numeric: t('admin.scales.detail.response_type_numeric'),
      text: t('admin.scales.detail.response_type_text'),
      multiple_choice: t('admin.scales.detail.response_type_multiple_choice'),
      single_choice: t('admin.scales.detail.response_type_single_choice')
    };
    return labels[type as keyof typeof labels] || type;
  };

  if (loading) {
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

  if (error || !scale) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="min-h-[100vh] flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-500" />
            <p className="text-lg font-medium mb-2">{t('admin.scales.detail.load_error_title')}</p>
            <p className="text-muted-foreground mb-4">{error || t('admin.scales.detail.scale_not_exist')}</p>
            <Button onClick={() => router.push("/admin/scales")}>
              {t('admin.scales.detail.back_to_list')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const renderItemForm = () => (
    <div className="space-y-4">
      <div>
        <Label>{t('admin.scales.detail.label_item_question_cn')}</Label>
        <Textarea
          value={newItem.question}
          onChange={(e) => setNewItem({ ...newItem, question: e.target.value })}
          placeholder={t('admin.scales.detail.placeholder_item_question')}
          rows={2}
        />
      </div>

      <div>
        <Label>{t('admin.scales.detail.label_item_question_en')}</Label>
        <Textarea
          value={newItem.questionEn}
          onChange={(e) => setNewItem({ ...newItem, questionEn: e.target.value })}
          placeholder={t('admin.scales.detail.placeholder_item_question_en')}
          rows={2}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>{t('admin.scales.detail.label_dimension')}</Label>
          <Input
            value={newItem.dimension}
            onChange={(e) => setNewItem({ ...newItem, dimension: e.target.value })}
            placeholder={t('admin.scales.detail.placeholder_dimension')}
          />
        </div>
        <div>
          <Label>{t('admin.scales.detail.label_response_type')}</Label>
          <Select value={newItem.responseType} onValueChange={(value) =>
            setNewItem({ ...newItem, responseType: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="likert">{t('admin.scales.detail.response_type_likert')}</SelectItem>
              <SelectItem value="boolean">{t('admin.scales.detail.response_type_boolean')}</SelectItem>
              <SelectItem value="numeric">{t('admin.scales.detail.response_type_numeric')}</SelectItem>
              <SelectItem value="text">{t('admin.scales.detail.response_type_text')}</SelectItem>
              <SelectItem value="single_choice">{t('admin.scales.detail.response_type_single_choice')}</SelectItem>
              <SelectItem value="multiple_choice">{t('admin.scales.detail.response_type_multiple_choice')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Response options */}
      {(newItem.responseType === "likert" || newItem.responseType === "single_choice" || newItem.responseType === "multiple_choice") && (
        <div>
          <Label>{t('admin.scales.detail.label_response_options')}</Label>
          <div className="space-y-2">
            {newItem.responseOptions.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Input
                  value={option}
                  onChange={(e) => updateResponseOption(index, e.target.value)}
                  placeholder={t('admin.scales.detail.placeholder_option_number').replace('{number}', (index + 1).toString())}
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
              {t('admin.scales.detail.button_add_option')}
            </Button>
          </div>
        </div>
      )}

      <div>
        <Label>{t('admin.scales.detail.label_scoring_info')}</Label>
        <Textarea
          value={newItem.scoringInfo}
          onChange={(e) => setNewItem({ ...newItem, scoringInfo: e.target.value })}
          placeholder={t('admin.scales.detail.placeholder_scoring_info')}
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
        <Label htmlFor="isRequired">{t('admin.scales.detail.label_required_item')}</Label>
      </div>
    </div>
  );

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.push("/admin/scales")}>
          <ChevronLeft className="w-4 h-4 mr-2" />
          {t('admin.scales.detail.back_to_list')}
        </Button>
      </div>

      <Tabs defaultValue="info" className="w-full">
        <TabsList>
          <TabsTrigger value="info">{t('admin.scales.detail.tab_scale_info')}</TabsTrigger>
          <TabsTrigger value="copyright">{t('admin.scales.detail.tab_copyright_info')}</TabsTrigger>
          <TabsTrigger value="items">{t('admin.scales.detail.tab_items_management')}</TabsTrigger>
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
                    <span className="font-medium">{t('admin.scales.detail.label_name_cn')}:</span>
                    <p className="text-muted-foreground">{scale.name}</p>
                  </div>
                  {scale.nameEn && (
                    <div>
                      <span className="font-medium">{t('admin.scales.detail.label_name_en')}:</span>
                      <p className="text-muted-foreground">{scale.nameEn}</p>
                    </div>
                  )}
                  <div>
                    <span className="font-medium">{t('admin.scales.detail.label_acronym')}:</span>
                    <p className="text-muted-foreground">{scale.acronym || "N/A"}</p>
                  </div>
                  <div>
                    <span className="font-medium">{t('admin.scales.detail.label_status')}:</span>
                    <Badge className={
                      scale.validationStatus === 'published' ? 'bg-green-100 text-green-700' :
                      scale.validationStatus === 'validated' ? 'bg-primary/10 text-primary' :
                      'bg-gray-100 text-foreground'
                    }>
                      {scale.validationStatus === 'published' ? t('admin.scales.status_published') :
                       scale.validationStatus === 'validated' ? t('admin.scales.status_validated') : t('admin.scales.status_draft')}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <span className="font-medium">{t('admin.scales.detail.label_items_count')}:</span>
                    <p className="text-muted-foreground">{scale.itemsCount}</p>
                  </div>
                  <div>
                    <span className="font-medium">{t('admin.scales.detail.label_dimensions_count')}:</span>
                    <p className="text-muted-foreground">{scale.dimensionsCount}</p>
                  </div>
                  {scale.administrationTime && (
                    <div>
                      <span className="font-medium">{t('admin.scales.detail.label_administration_time')}:</span>
                      <p className="text-muted-foreground">{scale.administrationTime} {t('admin.scales.detail.minutes')}</p>
                    </div>
                  )}
                  {scale.targetPopulation && (
                    <div>
                      <span className="font-medium">{t('admin.scales.detail.label_target_population')}:</span>
                      <p className="text-muted-foreground">{scale.targetPopulation}</p>
                    </div>
                  )}
                </div>
              </div>

              {scale.description && (
                <div className="mt-4">
                  <span className="font-medium">{t('admin.scales.detail.label_description')}:</span>
                  <p className="text-muted-foreground mt-1">{scale.description}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="copyright" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('admin.scales.detail.copyright_license_info')}</CardTitle>
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
                    label={t('admin.scales.detail.label_copyright_holder')}
                    placeholder={t('admin.scales.detail.placeholder_copyright_holder')}
                  />
                </div>
                <div>
                  <Label>{t('admin.scales.detail.label_license_type')}</Label>
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
                  value={scale?.copyrightInfo || ""}
                  onChange={(e) => {
                    if (scale) {
                      setScale({ ...scale, copyrightInfo: e.target.value });
                    }
                  }}
                  placeholder={t('admin.scales.placeholder_copyright_info')}
                  rows={2}
                />
              </div>

              <div>
                <Label>{t('admin.scales.label_license_terms')}</Label>
                <Textarea
                  value={scale?.licenseTerms || ""}
                  onChange={(e) => {
                    if (scale) {
                      setScale({ ...scale, licenseTerms: e.target.value });
                    }
                  }}
                  placeholder={t('admin.scales.placeholder_license_terms')}
                  rows={6}
                />
              </div>

              <div>
                <Label>{t('admin.scales.label_usage_restrictions')}</Label>
                <Textarea
                  value={scale?.usageRestrictions || ""}
                  onChange={(e) => {
                    if (scale) {
                      setScale({ ...scale, usageRestrictions: e.target.value });
                    }
                  }}
                  placeholder={t('admin.scales.placeholder_usage_restrictions')}
                  rows={4}
                />
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSave}>
                  {t('admin.scales.detail.button_save_copyright')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="items" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center space-x-2">
              <List className="w-5 h-5" />
              <span>{t('admin.scales.detail.items_management')}</span>
              <Badge variant="secondary">{items.length} {t('admin.scales.detail.items_count_unit')}</Badge>
            </h2>

            {/* Create item dialog */}
            <Dialog open={createItemOpen} onOpenChange={setCreateItemOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  {t('admin.scales.detail.button_add_item')}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{t('admin.scales.detail.dialog_add_item_title')}</DialogTitle>
                  <DialogDescription>
                    {t('admin.scales.detail.dialog_add_item_description').replace('{scaleName}', scale.name)}
                  </DialogDescription>
                </DialogHeader>

                {renderItemForm()}

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setCreateItemOpen(false)}>
                    {t('admin.scales.button_cancel')}
                  </Button>
                  <Button
                    onClick={handleCreateItem}
                    disabled={!newItem.question}
                  >
                    {t('admin.scales.detail.button_add_item')}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Edit item dialog */}
            <Dialog open={editItemOpen} onOpenChange={setEditItemOpen}>
              <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{t('admin.scales.detail.dialog_edit_item_title')}</DialogTitle>
                  <DialogDescription>
                    {t('admin.scales.detail.dialog_edit_item_description')}
                  </DialogDescription>
                </DialogHeader>

                {renderItemForm()}

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setEditItemOpen(false)}>
                    {t('admin.scales.button_cancel')}
                  </Button>
                  <Button
                    onClick={handleEditItem}
                    disabled={!newItem.question}
                  >
                    {t('admin.scales.detail.button_update_item')}
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
                    <TableHead className="w-16">{t('admin.scales.detail.table_item_number')}</TableHead>
                    <TableHead>{t('admin.scales.detail.table_item_content')}</TableHead>
                    <TableHead>{t('admin.scales.detail.table_dimension')}</TableHead>
                    <TableHead>{t('admin.scales.detail.table_response_type')}</TableHead>
                    <TableHead>{t('admin.scales.detail.table_required')}</TableHead>
                    <TableHead>{t('admin.scales.detail.table_sort')}</TableHead>
                    <TableHead>{t('admin.scales.detail.table_actions')}</TableHead>
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
                        {item.isRequired ? t('admin.scales.detail.yes') : t('admin.scales.detail.no')}
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
                            {t('admin.scales.detail.button_edit')}
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
                            {t('admin.scales.detail.button_delete')}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        {t('admin.scales.detail.no_items_message')}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title={t('admin.scales.detail.delete_item_title')}
        description={t('admin.scales.detail.delete_item_description')}
        confirmText={t('admin.scales.detail.button_delete')}
        cancelText={t('admin.scales.button_cancel')}
        onConfirm={deleteItem}
        variant="destructive"
      />
    </div>
  );
}