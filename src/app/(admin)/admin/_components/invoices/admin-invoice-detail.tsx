"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Download,
  Printer,
  ChevronLeft,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  Trash2
} from "lucide-react";
import { useRouter } from "next/navigation";
import { generateInvoicePDF } from "@/utils/pdf-generator";
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

interface AdminInvoiceDetailProps {
  invoiceId: string;
}

export function AdminInvoiceDetail({ invoiceId }: AdminInvoiceDetailProps) {
  const router = useRouter();
  const toast = useToast();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  useEffect(() => {
    fetchInvoiceDetail();
  }, [invoiceId]);

  const fetchInvoiceDetail = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/invoices/${invoiceId}`);
      const data = await response.json();

      if (data.success) {
        setInvoice(data.invoice);
      } else {
        setError(data.error || "加载发票失败");
      }
    } catch (error) {
      console.error("加载发票详情失败:", error);
      setError("网络错误，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  const updateInvoiceStatus = async (status: string) => {
    if (!invoice) return;

    try {
      const response = await fetch(`/api/admin/invoices/${invoiceId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });

      const data = await response.json();

      if (response.ok) {
        setInvoice({ ...invoice, status });
        toast.success("发票状态更新成功！");
      } else {
        toast.error(data.error || "更新发票状态失败");
      }
    } catch (error) {
      console.error("更新发票状态错误:", error);
      toast.error("网络错误，请稍后重试");
    }
  };

  const deleteInvoice = async () => {
    if (!invoice) return;

    try {
      const response = await fetch(`/api/admin/invoices/${invoiceId}`, {
        method: "DELETE"
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("发票删除成功！");
        router.push("/admin/invoices");
      } else {
        toast.error(data.error || "删除发票失败");
      }
    } catch (error) {
      console.error("删除发票错误:", error);
      toast.error("网络错误，请稍后重试");
    }
  };

  const handleDownloadPDF = async () => {
    if (!invoice) return;

    try {
      await generateInvoicePDF(invoice);
    } catch (error) {
      console.error("PDF生成失败:", error);
      toast.error("PDF生成失败，请稍后重试");
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

  if (error || !invoice) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="min-h-[100vh] flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
            <p className="text-lg font-medium mb-2">加载失败</p>
            <p className="text-muted-foreground mb-4">{error || "发票不存在"}</p>
            <Button onClick={() => router.push("/admin/invoices")}>
              返回发票列表
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.push("/admin/invoices")}>
          <ChevronLeft className="w-4 h-4 mr-2" />
          返回发票列表
        </Button>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleDownloadPDF}>
            <Printer className="w-4 h-4 mr-2" />
            打印发票
          </Button>
          <Button onClick={handleDownloadPDF}>
            <Download className="w-4 h-4 mr-2" />
            下载PDF
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-8">
          {/* 发票头部 */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold text-blue-600 mb-2">xCOA Platform</h1>
              <p className="text-sm text-gray-600">
                Professional eCOA Solutions<br />
                Unit 13, Freeland Park<br />
                Wareham Road, Poole, UK BH16 6FH<br />
                Email: support@xcoa.pro
              </p>
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-bold mb-2">INVOICE</h2>
              <p className="text-lg font-semibold">{invoice.invoiceNumber}</p>
              <p className="text-sm text-gray-600">
                Issue Date: {new Date(invoice.issueDate).toLocaleDateString()}<br />
                Due Date: {new Date(invoice.dueDate).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* 客户信息和状态 */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="font-semibold mb-2">Bill To:</h3>
              <div className="text-sm text-gray-700">
                <p className="font-medium">{invoice.customerName}</p>
                {invoice.customerOrganization && (
                  <p>{invoice.customerOrganization}</p>
                )}
                {invoice.customerAddress && (
                  <p className="whitespace-pre-line">{invoice.customerAddress}</p>
                )}
                <p>Email: {invoice.customerEmail}</p>
                {invoice.customerVatNumber && (
                  <p>VAT Number: {invoice.customerVatNumber}</p>
                )}
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Invoice Status:</h3>
              <div className="flex items-center space-x-2 mb-4">
                <Badge className={getStatusColor(invoice.status)}>
                  {getStatusIcon(invoice.status)}
                  <span className="ml-1">{getStatusLabel(invoice.status)}</span>
                </Badge>
              </div>

              {/* Admin状态控制 */}
              <div className="space-y-2">
                <Label>更改状态:</Label>
                <Select
                  value={invoice.status}
                  onValueChange={updateInvoiceStatus}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">草稿</SelectItem>
                    <SelectItem value="sent">已发送</SelectItem>
                    <SelectItem value="paid">已支付</SelectItem>
                    <SelectItem value="overdue">逾期</SelectItem>
                    <SelectItem value="cancelled">已取消</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {invoice.paidAt && (
                <p className="text-sm text-gray-600 mt-2">
                  Paid on: {new Date(invoice.paidAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>

          {/* 服务项目 */}
          <div className="mb-8">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 p-3 text-left">Description</th>
                  <th className="border border-gray-300 p-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 p-3">{invoice.description}</td>
                  <td className="border border-gray-300 p-3 text-right">
                    ${invoice.subtotal.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 总计 */}
          <div className="flex justify-end mb-8">
            <div className="w-64">
              <div className="flex justify-between py-2">
                <span>Subtotal:</span>
                <span>${invoice.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span>Tax (10%):</span>
                <span>${invoice.taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 border-t font-bold text-lg">
                <span>Total:</span>
                <span>${invoice.totalAmount.toFixed(2)} {invoice.currency}</span>
              </div>
            </div>
          </div>

          {/* Admin操作按钮 */}
          <div className="border-t pt-4 flex justify-end space-x-2">
            {invoice.status === "draft" && (
              <Button
                variant="destructive"
                onClick={() => setDeleteConfirmOpen(true)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                删除发票
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 删除确认对话框 */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="删除发票"
        description="确定要删除这张发票吗？此操作不可逆转。"
        confirmText="删除"
        cancelText="取消"
        onConfirm={deleteInvoice}
        variant="destructive"
      />
    </div>
  );
}