"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  ChevronLeft,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText
} from "lucide-react";
import { useRouter } from "next/navigation";
import { generateInvoicePDF } from "@/utils/pdf-generator";
import { format } from "date-fns";
import { useToast } from "@/hooks/useToast";

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

interface UserInvoiceDetailProps {
  invoiceId: string;
}

export function UserInvoiceDetail({ invoiceId }: UserInvoiceDetailProps) {
  const router = useRouter();
  const toast = useToast();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInvoiceDetail();
  }, [invoiceId]);

  const fetchInvoiceDetail = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/invoices/${invoiceId}`);
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
            <Button onClick={() => router.push("/billing/invoice")}>
              返回发票列表
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => router.push("/billing/invoice")}>
            ← 返回发票列表
          </Button>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
              <Download className="w-4 h-4 mr-2" />
              下载PDF
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* 发票头部信息 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-lg mb-2">{invoice.invoiceNumber}</h3>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">描述:</span> {invoice.description}</p>
                <p><span className="font-medium">开具日期:</span> {format(new Date(invoice.issueDate), "yyyy年MM月dd日")}</p>
                <p><span className="font-medium">到期日期:</span> {format(new Date(invoice.dueDate), "yyyy年MM月dd日")}</p>
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Badge className={getStatusColor(invoice.status)}>
                  {getStatusLabel(invoice.status)}
                </Badge>
              </div>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">客户:</span> {invoice.customerName}</p>
                {invoice.customerOrganization && (
                  <p><span className="font-medium">机构:</span> {invoice.customerOrganization}</p>
                )}
                <p><span className="font-medium">邮箱:</span> {invoice.customerEmail}</p>
              </div>
            </div>
          </div>

          {/* 金额信息 */}
          <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-3">金额详情</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>小计:</span>
                <span>${invoice.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>税费:</span>
                <span>${invoice.taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg border-t pt-2">
                <span>总计:</span>
                <span>${invoice.totalAmount.toFixed(2)} {invoice.currency}</span>
              </div>
            </div>
          </div>

          {/* 支付信息 */}
          {invoice.paidAt && (
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-3">支付信息</h4>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">支付日期:</span> {format(new Date(invoice.paidAt), "yyyy年MM月dd日")}</p>
                {invoice.paymentMethod && (
                  <p><span className="font-medium">支付方式:</span> {invoice.paymentMethod}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}