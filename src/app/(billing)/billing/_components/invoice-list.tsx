"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, FileText, Download, Eye } from "lucide-react";
import { format } from "date-fns";
import { generateInvoicePDF } from "@/utils/pdf-generator";
import { useRouter } from "next/navigation";
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
}

interface InvoiceListData {
  invoices: Invoice[];
  statistics: {
    total: number;
    paid: number;
    sent: number;
    draft: number;
  };
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export function InvoiceList() {
  const router = useRouter();
  const toast = useToast();
  const { t } = useLanguage();
  const [data, setData] = useState<InvoiceListData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchInvoices = async () => {
      setIsLoading(true);
      try {
        const offset = (page - 1) * 20;
        const response = await fetch(`/api/invoices?limit=20&offset=${offset}`);
        const result = await response.json();

        if (result.success) {
          setData(result);
        } else {
          console.error("Failed to fetch invoices:", result.error);
        }
      } catch (error) {
        console.error("Failed to fetch invoices:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvoices();
  }, [page]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const getStatusColor = (status: string) => {
    const colorMap = {
      draft: 'bg-gray-100 text-gray-700',
      sent: 'bg-blue-100 text-blue-700',
      paid: 'bg-green-100 text-green-700',
      overdue: 'bg-red-100 text-red-700',
      cancelled: 'bg-gray-100 text-gray-700'
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

  const handleDownloadPDF = async (invoice: Invoice) => {
    try {
      await generateInvoicePDF(invoice);
    } catch (error) {
      console.error("PDF generation failed:", error);
      toast.error(t('billing.pdf_generation_failed'));
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('billing.my_invoices')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="w-5 h-5" />
          <span>{t('billing.my_invoices')}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* 统计信息 */}
        {data?.statistics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{data.statistics.total}</div>
              <div className="text-sm text-blue-700">{t('billing.total')}</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{data.statistics.paid}</div>
              <div className="text-sm text-green-700">{t('billing.paid')}</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{data.statistics.sent}</div>
              <div className="text-sm text-orange-700">{t('billing.pending')}</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">{data.statistics.draft}</div>
              <div className="text-sm text-gray-700">{t('billing.draft')}</div>
            </div>
          </div>
        )}

        {/* Desktop Table View */}
        <div className="hidden md:block">
          <div className="relative overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('billing.invoice_number')}</TableHead>
                  <TableHead>{t('billing.status')}</TableHead>
                  <TableHead>{t('billing.amount')}</TableHead>
                  <TableHead>{t('billing.date')}</TableHead>
                  <TableHead>{t('billing.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.invoices && data.invoices.length > 0 ? data.invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-mono text-sm">
                      {invoice.invoiceNumber}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(invoice.status)}>
                        {getStatusLabel(invoice.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      ${invoice.totalAmount.toFixed(2)} {invoice.currency}
                    </TableCell>
                    <TableCell>
                      {format(new Date(invoice.issueDate), "MM/dd/yyyy")}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => router.push(`/billing/invoice/${invoice.id}`)}
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          {t('billing.view')}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownloadPDF(invoice)}
                        >
                          <Download className="w-3 h-3 mr-1" />
                          PDF
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">{t('billing.no_invoice_records')}</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
          {data?.invoices && data.invoices.length > 0 ? data.invoices.map((invoice) => (
            <div
              key={invoice.id}
              className="flex flex-col space-y-3 rounded-lg border p-4"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm font-medium">{invoice.invoiceNumber}</span>
                <Badge className={getStatusColor(invoice.status)}>
                  {getStatusLabel(invoice.status)}
                </Badge>
              </div>
              <div>
                <div className="font-medium">{invoice.description}</div>
                <div className="text-sm text-muted-foreground">
                  {invoice.customerName} • {format(new Date(invoice.issueDate), "MM/dd/yyyy")}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-lg">
                  ${invoice.totalAmount.toFixed(2)} {invoice.currency}
                </span>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => router.push(`/billing/invoice/${invoice.id}`)}
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    {t('billing.view')}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDownloadPDF(invoice)}
                  >
                    <Download className="w-3 h-3 mr-1" />
                    PDF
                  </Button>
                </div>
              </div>
            </div>
          )) : (
            <div className="text-center py-8 text-muted-foreground">
              {t('billing.no_invoice_records')}
            </div>
          )}
        </div>

        {/* Pagination */}
        {data?.pagination && data.pagination.total > 20 && (
          <div className="mt-4 flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(Math.max(1, page - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground">
              {t('billing.page_of', { page, total: Math.ceil(data.pagination.total / 20) })}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page + 1)}
              disabled={!data.pagination.hasMore}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </div>
  );
}