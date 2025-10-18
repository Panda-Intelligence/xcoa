"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/hooks/useLanguage";
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
  const { t } = useLanguage();
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
        setError(data.error || t('billing.failed_to_load'));
      }
    } catch (error) {
      console.error("Failed to load invoice details:", error);
      setError(t('billing.network_error'));
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!invoice) return;

    try {
      await generateInvoicePDF(invoice);
    } catch (error) {
      console.error("PDF generation failed:", error);
      toast.error(t('billing.pdf_generation_failed'));
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
      draft: t('billing.draft'),
      sent: t('billing.sent'),
      paid: t('billing.paid'),
      overdue: t('billing.overdue'),
      cancelled: t('billing.cancelled')
    };
    return labels[status as keyof typeof labels] || status;
  };

  if (loading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="min-h-[100vh] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">{t('billing.loading')}</p>
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
            <p className="text-lg font-medium mb-2">{t('billing.failed_to_load')}</p>
            <p className="text-muted-foreground mb-4">{error || t('billing.invoice_not_found')}</p>
            <Button onClick={() => router.push("/billing/invoice")}>
              {t('billing.back_to_invoice_list')}
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
            ← {t('billing.back_to_invoice_list')}
          </Button>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
              <Download className="w-4 h-4 mr-2" />
              {t('billing.download_pdf')}
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
                <p><span className="font-medium">{t('billing.description')}</span> {invoice.description}</p>
                <p><span className="font-medium">{t('billing.issue_date')}</span> {format(new Date(invoice.issueDate), "yyyy年MM月dd日")}</p>
                <p><span className="font-medium">{t('billing.due_date')}</span> {format(new Date(invoice.dueDate), "yyyy年MM月dd日")}</p>
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Badge className={getStatusColor(invoice.status)}>
                  {getStatusLabel(invoice.status)}
                </Badge>
              </div>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">{t('billing.customer')}</span> {invoice.customerName}</p>
                {invoice.customerOrganization && (
                  <p><span className="font-medium">{t('billing.organization')}</span> {invoice.customerOrganization}</p>
                )}
                <p><span className="font-medium">{t('billing.email')}</span> {invoice.customerEmail}</p>
              </div>
            </div>
          </div>

          {/* 金额信息 */}
          <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-3">{t('billing.amount_details')}</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>{t('billing.subtotal')}</span>
                <span>${invoice.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>{t('billing.tax')}</span>
                <span>${invoice.taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg border-t pt-2">
                <span>{t('billing.total_amount')}</span>
                <span>${invoice.totalAmount.toFixed(2)} {invoice.currency}</span>
              </div>
            </div>
          </div>

          {/* 支付信息 */}
          {invoice.paidAt && (
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-3">{t('billing.payment_information')}</h4>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">{t('billing.payment_date')}</span> {format(new Date(invoice.paidAt), "yyyy年MM月dd日")}</p>
                {invoice.paymentMethod && (
                  <p><span className="font-medium">{t('billing.payment_method')}</span> {invoice.paymentMethod}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}