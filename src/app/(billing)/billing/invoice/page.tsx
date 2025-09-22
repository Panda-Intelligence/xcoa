'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  FileText,
  Search,
  Filter,
  Download,
  Eye,
  Calendar,
  Building,
  Plus,
  Printer,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import Link from 'next/link';

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
  items?: Array<{
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    serviceType: string;
  }>;
}

export default function InvoicePage() {
  const { t } = useLanguage();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newInvoice, setNewInvoice] = useState({
    customerName: '',
    customerEmail: '',
    customerOrganization: '',
    customerAddress: '',
    customerVatNumber: '',
    customerCountry: '',
    description: '',
    amount: '',
    dueDate: '',
    currency: 'USD'
  });

  useEffect(() => {
    fetchInvoices();
  }, [statusFilter]);

  const fetchInvoices = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (searchQuery) params.append('search', searchQuery);

      const response = await fetch(`/api/invoices?${params}`);
      const data = await response.json();

      if (data.success) {
        setInvoices(data.invoices || []);
      } else {
        console.error('加载发票失败:', data.error);
      }
    } catch (error) {
      console.error('加载发票失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInvoice = async () => {
    try {
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamId: 'team_default', // 应该从session获取
          ...newInvoice,
          items: [{
            description: newInvoice.description,
            quantity: 1,
            unitPrice: parseFloat(newInvoice.amount),
            serviceType: 'custom'
          }]
        })
      });

      const data = await response.json();

      if (response.ok) {
        setCreateDialogOpen(false);
        setNewInvoice({
          customerName: '',
          customerEmail: '',
          customerOrganization: '',
          customerAddress: '',
          customerVatNumber: '',
          customerCountry: '',
          description: '',
          amount: '',
          dueDate: '',
          currency: 'USD'
        });
        fetchInvoices(); // 刷新列表
        alert('发票创建成功！');
      } else {
        alert(data.error || '创建发票失败');
      }
    } catch (error) {
      console.error('创建发票错误:', error);
      alert('网络错误，请稍后重试');
    }
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
      draft: '草稿',
      sent: '已发送',
      paid: '已支付',
      overdue: '逾期',
      cancelled: '已取消'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-4 h-4" />;
      case 'sent':
        return <Clock className="w-4 h-4" />;
      case 'overdue':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = !searchQuery ||
      invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.customerOrganization?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 发票详情视图
  if (selectedInvoice) {
    return (
      <div className="flex flex-col h-screen">
        <div className="flex items-center justify-between p-4 border-b bg-white">
          <Button variant="ghost" onClick={() => setSelectedInvoice(null)}>
            ← 返回发票列表
          </Button>
          <div className="flex space-x-2">
            <Button variant="outline">
              <Printer className="w-4 h-4 mr-2" />
              打印发票
            </Button>
            <Button>
              <Download className="w-4 h-4 mr-2" />
              下载PDF
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6 bg-gray-50">
          <div className="max-w-4xl mx-auto bg-white border rounded-lg p-8 shadow-sm">
            {/* 发票头部 */}
            <div className="flex justify-between items-start mb-8">
              <div>
                <h1 className="text-3xl font-bold text-blue-600 mb-2">xCOA Platform</h1>
                <p className="text-sm text-gray-600">
                  Professional eCOA Solutions<br />
                  Unit 13, Freeland Park<br />
                  Wareham Road, Poole, UK BH16 6FH<br />
                  Email: support@xcoa.pandacat.ai
                </p>
              </div>
              <div className="text-right">
                <h2 className="text-2xl font-bold mb-2">INVOICE</h2>
                <p className="text-lg font-semibold">{selectedInvoice.invoiceNumber}</p>
                <p className="text-sm text-gray-600">
                  Issue Date: {new Date(selectedInvoice.issueDate).toLocaleDateString()}<br />
                  Due Date: {new Date(selectedInvoice.dueDate).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* 客户信息 */}
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="font-semibold mb-2">Bill To:</h3>
                <div className="text-sm text-gray-700">
                  <p className="font-medium">{selectedInvoice.customerName}</p>
                  {selectedInvoice.customerOrganization && (
                    <p>{selectedInvoice.customerOrganization}</p>
                  )}
                  {selectedInvoice.customerAddress && (
                    <p className="whitespace-pre-line">{selectedInvoice.customerAddress}</p>
                  )}
                  <p>Email: {selectedInvoice.customerEmail}</p>
                  {selectedInvoice.customerVatNumber && (
                    <p>VAT Number: {selectedInvoice.customerVatNumber}</p>
                  )}
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Invoice Status:</h3>
                <div className="flex items-center space-x-2 mb-2">
                  <Badge className={getStatusColor(selectedInvoice.status)}>
                    {getStatusIcon(selectedInvoice.status)}
                    <span className="ml-1">{getStatusLabel(selectedInvoice.status)}</span>
                  </Badge>
                </div>
                {selectedInvoice.paidAt && (
                  <p className="text-sm text-gray-600">
                    Paid on: {new Date(selectedInvoice.paidAt).toLocaleDateString()}
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
                    <td className="border border-gray-300 p-3">{selectedInvoice.description}</td>
                    <td className="border border-gray-300 p-3 text-right">
                      ${selectedInvoice.subtotal.toFixed(2)}
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
                  <span>${selectedInvoice.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span>Tax (10%):</span>
                  <span>${selectedInvoice.taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2 border-t font-bold text-lg">
                  <span>Total:</span>
                  <span>${selectedInvoice.totalAmount.toFixed(2)} {selectedInvoice.currency}</span>
                </div>
              </div>
            </div>

            {/* 付款信息 */}
            <div className="border-t pt-4 text-sm text-gray-600">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold mb-2">Payment Information:</h3>
                  <p>Payment Method: {selectedInvoice.paymentMethod || 'Pending'}</p>
                  <p>Currency: {selectedInvoice.currency}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Terms & Conditions:</h3>
                  <p>Payment due within 30 days</p>
                  <p>Late payments subject to 1.5% monthly charge</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t text-center">
                <p>Thank you for your business with xCOA Platform!</p>
                <p className="text-xs mt-1">
                  Questions about this invoice? Contact us at billing@xcoa.pandacat.ai
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-auto">
        <div className="flex flex-col gap-4 p-4">
          {/* 页面标题 */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center space-x-2">
                <FileText className="w-6 h-6 text-blue-600" />
                <span>发票管理</span>
              </h1>
              <p className="text-muted-foreground">
                创建、管理和跟踪您的服务发票
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
                      disabled={!newInvoice.customerName || !newInvoice.customerEmail || !newInvoice.description || !newInvoice.amount}
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
                <div className="text-2xl font-bold text-blue-600">{invoices.length}</div>
                <div className="text-sm text-muted-foreground">总发票数</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {invoices.filter(inv => inv.status === 'paid').length}
                </div>
                <div className="text-sm text-muted-foreground">已支付</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {invoices.filter(inv => inv.status === 'sent').length}
                </div>
                <div className="text-sm text-muted-foreground">待支付</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">
                  ${invoices.reduce((sum, inv) => sum + inv.totalAmount, 0).toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground">总金额</div>
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
          </div>

          {/* 发票历史记录 */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">发票历史记录</h2>

            {filteredInvoices.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium mb-2">
                    {searchQuery || statusFilter !== 'all' ? '没有找到匹配的发票' : '还没有发票记录'}
                  </h3>
                  <p className="text-muted-foreground">
                    {searchQuery || statusFilter !== 'all'
                      ? '尝试调整搜索条件或筛选器'
                      : '点击"创建发票"开始开具您的第一张发票'
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredInvoices.map((invoice) => (
                <Card key={invoice.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge variant="outline" className="font-mono">
                            {invoice.invoiceNumber}
                          </Badge>
                          <Badge className={getStatusColor(invoice.status)}>
                            {getStatusIcon(invoice.status)}
                            <span className="ml-1">{getStatusLabel(invoice.status)}</span>
                          </Badge>
                        </div>
                        <CardTitle className="text-lg">
                          {invoice.description}
                        </CardTitle>
                        <CardDescription>
                          {invoice.customerOrganization || invoice.customerName} • {invoice.customerCountry || '未知地区'}
                        </CardDescription>
                      </div>

                      <div className="text-right">
                        <div className="text-xl font-bold text-blue-600">
                          ${invoice.totalAmount.toFixed(2)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {invoice.currency}
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>开具: {new Date(invoice.issueDate).toLocaleDateString()}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Building className="w-3 h-3" />
                          <span>{invoice.customerName}</span>
                        </span>
                        {invoice.customerVatNumber && (
                          <span className="flex items-center space-x-1">
                            <FileText className="w-3 h-3" />
                            <span>VAT: {invoice.customerVatNumber}</span>
                          </span>
                        )}
                      </div>

                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={() => setSelectedInvoice(invoice)}>
                          <Eye className="w-3 h-3 mr-1" />
                          查看详情
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="w-3 h-3 mr-1" />
                          下载
                        </Button>
                        {invoice.status === 'draft' && (
                          <Button size="sm" variant="outline">
                            <Edit className="w-3 h-3 mr-1" />
                            编辑
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}