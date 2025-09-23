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
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [stats, setStats] = useState<InvoiceStats>({ total: 0, paid: 0, sent: 0, draft: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
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

  useEffect(() => {
    fetchInvoices();
  }, [statusFilter, page]);

  const fetchInvoices = async () => {
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
        console.error("加载发票失败:", data.error);
      }
    } catch (error) {
      console.error("加载发票失败:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInvoice = async () => {
    if (!selectedTeam) {
      alert("请选择团队");
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
        alert("发票创建成功！");
      } else {
        alert(data.error || "创建发票失败");
      }
    } catch (error) {
      console.error("创建发票错误:", error);
      alert("网络错误，请稍后重试");
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

  const deleteInvoice = async (invoiceId: string) => {
    if (!confirm("确定要删除这张发票吗？此操作不可逆转。")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/invoices/${invoiceId}`, {
        method: "DELETE"
      });

      const data = await response.json();

      if (response.ok) {
        fetchInvoices();
        alert("发票删除成功！");
      } else {
        alert(data.error || "删除发票失败");
      }
    } catch (error) {
      console.error("删除发票错误:", error);
      alert("网络错误，请稍后重试");
    }
  };

  const handleDownloadPDF = async (invoice: Invoice) => {
    try {
      await generateInvoicePDF(invoice);
    } catch (error) {
      console.error("PDF生成失败:", error);
      alert("PDF生成失败，请稍后重试");
    }
  };

  const getStatusColor = (status: string) => {
    const colorMap = {
      draft: "bg-gray-100 text-gray-700",
      sent: "bg-blue-100 text-blue-700",
      paid: "bg-green-100 text-green-700",
      overdue: "bg-red-100 text-red-700",
      cancelled: "bg-gray-100 text-gray-700"
    };
    return colorMap[status as keyof typeof colorMap] || colorMap.draft;
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      draft: "草稿",
      sent: "已发送",
      paid: "已支付",
      overdue: "逾期",
      cancelled: "已取消"
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
              <FileText className="w-6 h-6 text-blue-600" />
              <span>发票管理</span>
            </h1>
            <p className="text-muted-foreground">
              管理所有系统发票，创建新发票并跟踪支付状态
            </p>
          </div>

          {/* 创建发票对话框 */}
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                创建发票
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>创建新发票</DialogTitle>
                <DialogDescription>
                  为客户创建专业的服务发票
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
                    <Label>客户姓名 *</Label>
                    <Input
                      value={newInvoice.customerName}
                      onChange={(e) => setNewInvoice({ ...newInvoice, customerName: e.target.value })}
                      placeholder="客户姓名"
                    />
                  </div>
                  <div>
                    <Label>客户邮箱 *</Label>
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
                    <Label>组织机构</Label>
                    <Input
                      value={newInvoice.customerOrganization}
                      onChange={(e) => setNewInvoice({ ...newInvoice, customerOrganization: e.target.value })}
                      placeholder="客户所属机构"
                    />
                  </div>
                  <div>
                    <Label>VAT号码</Label>
                    <Input
                      value={newInvoice.customerVatNumber}
                      onChange={(e) => setNewInvoice({ ...newInvoice, customerVatNumber: e.target.value })}
                      placeholder="VAT123456789"
                    />
                  </div>
                </div>

                <div>
                  <Label>客户地址</Label>
                  <Textarea
                    value={newInvoice.customerAddress}
                    onChange={(e) => setNewInvoice({ ...newInvoice, customerAddress: e.target.value })}
                    placeholder="完整的客户地址..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>服务描述 *</Label>
                    <Input
                      value={newInvoice.description}
                      onChange={(e) => setNewInvoice({ ...newInvoice, description: e.target.value })}
                      placeholder="服务或产品描述"
                    />
                  </div>
                  <div>
                    <Label>金额 *</Label>
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
                    <Label>到期日期 *</Label>
                    <Input
                      type="date"
                      value={newInvoice.dueDate}
                      onChange={(e) => setNewInvoice({ ...newInvoice, dueDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>货币</Label>
                    <Select value={newInvoice.currency} onValueChange={(value) =>
                      setNewInvoice({ ...newInvoice, currency: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD - 美元</SelectItem>
                        <SelectItem value="EUR">EUR - 欧元</SelectItem>
                        <SelectItem value="CNY">CNY - 人民币</SelectItem>
                        <SelectItem value="GBP">GBP - 英镑</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                    取消
                  </Button>
                  <Button
                    onClick={handleCreateInvoice}
                    disabled={!selectedTeam || !newInvoice.customerName || !newInvoice.customerEmail || !newInvoice.description || !newInvoice.amount}
                  >
                    创建发票
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
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-muted-foreground">总发票数</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.paid}</div>
              <div className="text-sm text-muted-foreground">已支付</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.sent}</div>
              <div className="text-sm text-muted-foreground">待支付</div>
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
              placeholder="搜索发票号、描述或客户..."
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
                <SelectItem value="sent">已发送</SelectItem>
                <SelectItem value="paid">已支付</SelectItem>
                <SelectItem value="overdue">逾期</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={fetchInvoices}>搜索</Button>
        </div>

        {/* 发票列表 */}
        <Card>
          <CardHeader>
            <CardTitle>发票列表</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>发票号</TableHead>
                  <TableHead>客户</TableHead>
                  <TableHead>团队</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>金额</TableHead>
                  <TableHead>开具日期</TableHead>
                  <TableHead>操作</TableHead>
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
                          查看
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
                            onClick={() => deleteInvoice(invoice.id)}
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
                    <TableCell colSpan={7} className="h-24 text-center">
                      暂无发票记录
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