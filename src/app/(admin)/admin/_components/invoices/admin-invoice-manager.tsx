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
  FileText,
  Search,
  Filter,
  Download,
  Eye,
  Plus,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { useLanguage } from "@/hooks/useLanguage";
import { TeamSelector } from "./team-selector";
import { generateInvoicePDF } from "@/utils/pdf-generator";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/useToast";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface Invoice {
  id: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  status: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  description: string;
  customerName: string;
  customerEmail: string;
  customerOrganization?: string;
  customerAddress?: string;
  customerVatNumber?: string;
  customerCountry?: string;
  paymentMethod?: string;
  paidAt?: string;
  teamName?: string;
}

interface InvoiceStats {
  total: number;
  paid: number;
  sent: number;
  draft: number;
}

export function AdminInvoiceManager() {
  const { t } = useLanguage();
  const router = useRouter();
  const toast = useToast();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [stats, setStats] = useState<InvoiceStats>({ total: 0, paid: 0, sent: 0, draft: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<string | null>(null);
  const [newInvoice, setNewInvoice] = useState({
    customerName: "",
    customerEmail: "",
    customerOrganization: "",
    customerAddress: "",
    customerVatNumber: "",
    customerCountry: "",
    description: "",
    amount: "",
    dueDate: "",
    currency: "USD"
  });
  const [selectedTeam, setSelectedTeam] = useState<{ id: string; name: string; slug: string; description?: string; billingEmail?: string; legalName?: string } | null>(null);

  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (searchQuery) params.append("search", searchQuery);
      params.append("limit", "20");
      params.append("offset", ((page - 1) * 20).toString());

      const response = await fetch(`/api/admin/invoices?${params}`);
      const data = await response.json();

      if (data.success) {
        setInvoices(data.invoices || []);
        setStats(data.statistics || { total: 0, paid: 0, sent: 0, draft: 0 });
        setHasMore(data.pagination?.hasMore || false);
      } else {
        console.error("Failed to load invoices:", data.error);
      }
    } catch (error) {
      console.error("Failed to load invoices:", error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page, searchQuery]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const handleCreateInvoice = async () => {
    if (!selectedTeam) {
      toast.warning(t('admin.invoices.select_team_required'));
      return;
    }

    try {
      const response = await fetch("/api/admin/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamId: selectedTeam.id,
          ...newInvoice,
          items: [{
            description: newInvoice.description,
            quantity: 1,
            unitPrice: Number.parseFloat(newInvoice.amount),
            serviceType: "custom"
          }]
        })
      });

      const data = await response.json();

      if (response.ok) {
        setCreateDialogOpen(false);
        resetNewInvoice();
        fetchInvoices();
        toast.success(t('admin.invoices.created_successfully'));
      } else {
        toast.error(data.error || t('admin.invoices.create_failed'));
      }
    } catch (error) {
      console.error("Error creating invoice:", error);
      toast.error(t('admin.invoices.network_error_retry'));
    }
  };

  const resetNewInvoice = () => {
    setNewInvoice({
      customerName: "",
      customerEmail: "",
      customerOrganization: "",
      customerAddress: "",
      customerVatNumber: "",
      customerCountry: "",
      description: "",
      amount: "",
      dueDate: "",
      currency: "USD"
    });
    setSelectedTeam(null);
  };

  const deleteInvoice = async () => {
    if (!invoiceToDelete) return;

    try {
      const invoiceId = invoiceToDelete;
      const response = await fetch(`/api/admin/invoices/${invoiceId}`, {
        method: "DELETE"
      });

      const data = await response.json();

      if (response.ok) {
        setInvoiceToDelete(null);
        fetchInvoices();
        toast.success(t('admin.invoices.deleted_successfully'));
      } else {
        toast.error(data.error || t('admin.invoices.delete_failed'));
      }
    } catch (error) {
      console.error("Error deleting invoice:", error);
      toast.error(t('admin.invoices.network_error_retry'));
    }
  };

  const handleDownloadPDF = async (invoice: Invoice) => {
    try {
      await generateInvoicePDF(invoice);
    } catch (error) {
      console.error("PDF generation failed:", error);
      toast.error(t('admin.invoices.pdf_generation_failed'));
    }
  };

  const getStatusColor = (status: string) => {
    const colorMap = {
      draft: "bg-gray-100 text-foreground",
      sent: "bg-primary/10 text-primary",
      paid: "bg-green-100 text-green-700",
      overdue: "bg-red-100 text-red-700",
      cancelled: "bg-gray-100 text-foreground"
    };
    return colorMap[status as keyof typeof colorMap] || colorMap.draft;
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      draft: t('admin.invoices.status_draft'),
      sent: t('admin.invoices.status_sent'),
      paid: t('admin.invoices.status_paid'),
      overdue: t('admin.invoices.status_overdue'),
      cancelled: t('admin.invoices.status_cancelled')
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="w-4 h-4" />;
      case "sent":
        return <Clock className="w-4 h-4" />;
      case "overdue":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  if (loading && page === 1) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="min-h-[100vh] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">{t('admin.invoices.loading')}</p>
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
            href: "/admin/invoices",
            label: t("common.dashboard")
          }
        ]}
      />
      <div className="flex flex-1 flex-col gap-4 p-4">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center space-x-2">
              <FileText className="w-6 h-6 text-primary" />
              <span>{t('admin.invoices.title')}</span>
            </h1>
            <p className="text-muted-foreground">
              {t('admin.invoices.description')}
            </p>
          </div>

          {/* 创建发票对话框 */}
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                {t('admin.invoices.create_button')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{t('admin.invoices.create_dialog_title')}</DialogTitle>
                <DialogDescription>
                  {t('admin.invoices.create_dialog_description')}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Team Selection */}
                <TeamSelector
                  selectedTeam={selectedTeam}
                  onTeamSelect={setSelectedTeam}
                />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{t('admin.invoices.customer_name')}</Label>
                    <Input
                      value={newInvoice.customerName}
                      onChange={(e) => setNewInvoice({ ...newInvoice, customerName: e.target.value })}
                      placeholder={t('admin.invoices.customer_name_placeholder')}
                    />
                  </div>
                  <div>
                    <Label>{t('admin.invoices.customer_email')}</Label>
                    <Input
                      type="email"
                      value={newInvoice.customerEmail}
                      onChange={(e) => setNewInvoice({ ...newInvoice, customerEmail: e.target.value })}
                      placeholder="customer@example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{t('admin.invoices.organization')}</Label>
                    <Input
                      value={newInvoice.customerOrganization}
                      onChange={(e) => setNewInvoice({ ...newInvoice, customerOrganization: e.target.value })}
                      placeholder={t('admin.invoices.organization_placeholder')}
                    />
                  </div>
                  <div>
                    <Label>{t('admin.invoices.vat_number')}</Label>
                    <Input
                      value={newInvoice.customerVatNumber}
                      onChange={(e) => setNewInvoice({ ...newInvoice, customerVatNumber: e.target.value })}
                      placeholder="VAT123456789"
                    />
                  </div>
                </div>

                <div>
                  <Label>{t('admin.invoices.customer_address')}</Label>
                  <Textarea
                    value={newInvoice.customerAddress}
                    onChange={(e) => setNewInvoice({ ...newInvoice, customerAddress: e.target.value })}
                    placeholder={t('admin.invoices.customer_address_placeholder')}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{t('admin.invoices.service_description')}</Label>
                    <Input
                      value={newInvoice.description}
                      onChange={(e) => setNewInvoice({ ...newInvoice, description: e.target.value })}
                      placeholder={t('admin.invoices.service_description_placeholder')}
                    />
                  </div>
                  <div>
                    <Label>{t('admin.invoices.amount')}</Label>
                    <Input
                      type="number"
                      value={newInvoice.amount}
                      onChange={(e) => setNewInvoice({ ...newInvoice, amount: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{t('admin.invoices.due_date')}</Label>
                    <Input
                      type="date"
                      value={newInvoice.dueDate}
                      onChange={(e) => setNewInvoice({ ...newInvoice, dueDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>{t('admin.invoices.currency')}</Label>
                    <Select value={newInvoice.currency} onValueChange={(value) =>
                      setNewInvoice({ ...newInvoice, currency: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">{t('admin.invoices.currency_usd')}</SelectItem>
                        <SelectItem value="EUR">{t('admin.invoices.currency_eur')}</SelectItem>
                        <SelectItem value="CNY">{t('admin.invoices.currency_cny')}</SelectItem>
                        <SelectItem value="GBP">{t('admin.invoices.currency_gbp')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                    {t('common.cancel')}
                  </Button>
                  <Button
                    onClick={handleCreateInvoice}
                    disabled={!selectedTeam || !newInvoice.customerName || !newInvoice.customerEmail || !newInvoice.description || !newInvoice.amount}
                  >
                    {t('admin.invoices.create_button')}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{stats.total}</div>
              <div className="text-sm text-muted-foreground">{t('admin.invoices.stats_total')}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-success">{stats.paid}</div>
              <div className="text-sm text-muted-foreground">{t('admin.invoices.stats_paid')}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.sent}</div>
              <div className="text-sm text-muted-foreground">{t('admin.invoices.stats_pending')}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-muted-foreground">{stats.draft}</div>
              <div className="text-sm text-muted-foreground">{t('admin.invoices.stats_draft')}</div>
            </CardContent>
          </Card>
        </div>

        {/* 搜索和筛选 */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('admin.invoices.search_placeholder')}
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
                <SelectItem value="all">{t('admin.invoices.filter_all')}</SelectItem>
                <SelectItem value="draft">{t('admin.invoices.status_draft')}</SelectItem>
                <SelectItem value="sent">{t('admin.invoices.status_sent')}</SelectItem>
                <SelectItem value="paid">{t('admin.invoices.status_paid')}</SelectItem>
                <SelectItem value="overdue">{t('admin.invoices.status_overdue')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={fetchInvoices}>{t('admin.invoices.search_button')}</Button>
        </div>

        {/* 发票列表 */}
        <Card>
          <CardHeader>
            <CardTitle>{t('admin.invoices.list_title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('admin.invoices.table_invoice_number')}</TableHead>
                  <TableHead>{t('admin.invoices.table_customer')}</TableHead>
                  <TableHead>{t('admin.invoices.table_team')}</TableHead>
                  <TableHead>{t('admin.invoices.table_status')}</TableHead>
                  <TableHead>{t('admin.invoices.table_amount')}</TableHead>
                  <TableHead>{t('admin.invoices.table_issue_date')}</TableHead>
                  <TableHead>{t('admin.invoices.table_actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.length > 0 ? invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-mono text-sm">
                      {invoice.invoiceNumber}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{invoice.customerName}</div>
                        {invoice.customerOrganization && (
                          <div className="text-sm text-muted-foreground">{invoice.customerOrganization}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{invoice.teamName || "N/A"}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(invoice.status)}>
                        {getStatusIcon(invoice.status)}
                        <span className="ml-1">{getStatusLabel(invoice.status)}</span>
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      ${invoice.totalAmount.toFixed(2)} {invoice.currency}
                    </TableCell>
                    <TableCell>
                      {new Date(invoice.issueDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => router.push(`/admin/invoices/${invoice.id}`)}
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          {t('admin.invoices.button_view')}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownloadPDF(invoice)}
                        >
                          <Download className="w-3 h-3 mr-1" />
                          PDF
                        </Button>
                        {invoice.status === "draft" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setInvoiceToDelete(invoice.id);
                              setDeleteConfirmOpen(true);
                            }}
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            {t('admin.invoices.button_delete')}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      {t('admin.invoices.no_records')}
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
                {t('admin.invoices.previous_page')}
              </Button>
              <span className="text-sm text-muted-foreground">
                {t('admin.invoices.page_number').replace('{page}', page.toString())}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={!hasMore}
              >
                {t('admin.invoices.next_page')}
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
        title={t('admin.invoices.delete_dialog_title')}
        description={t('admin.invoices.delete_dialog_description')}
        confirmText={t('admin.invoices.button_delete')}
        cancelText={t('common.cancel')}
        onConfirm={deleteInvoice}
        variant="destructive"
      />
    </>
  );
}