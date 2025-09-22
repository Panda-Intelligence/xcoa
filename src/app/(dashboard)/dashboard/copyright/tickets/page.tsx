'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  FileText,
  Search,
  Filter,
  Clock,
  Mail,
  Phone,
  Globe,
  CheckCircle,
  AlertCircle,
  XCircle,
  Plus,
  Eye,
  MessageSquare,
  Calendar,
  DollarSign
} from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/hooks/useLanguage';

interface Ticket {
  id: string;
  ticketNumber: string;
  subject: string;
  requestType: string;
  priority: string;
  status: string;
  intendedUse: string;
  projectDescription: string;
  copyrightOrganization: string;
  copyrightEmail: string;
  copyrightPhone?: string;
  copyrightWebsite?: string;
  responseReceived: number;
  licenseGranted: number;
  scaleName: string;
  scaleAcronym: string;
  categoryName: string;
  statusLabel: string;
  statusColor: string;
  priorityLabel: string;
  priorityColor: string;
  createdAtFormatted: string;
  daysSinceCreated: number;
}

interface TicketStats {
  total: number;
  pending: number;
  sent: number;
  responded: number;
  resolved: number;
}

export default function CopyrightTicketsPage() {
  const { t } = useLanguage();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [stats, setStats] = useState<TicketStats>({ total: 0, pending: 0, sent: 0, responded: 0, resolved: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // 加载工单数据
  useEffect(() => {
    fetchTickets();
  }, [statusFilter]);

  const fetchTickets = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      const response = await fetch(`/api/user/tickets?${params}`);
      const data = await response.json();

      if (data.success) {
        setTickets(data.tickets || []);
        setStats(data.statistics || {});
      } else {
        console.error('加载工单失败:', data.error);
      }
    } catch (error) {
      console.error('加载工单失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 筛选工单
  const filteredTickets = tickets.filter(ticket => {
    if (!searchQuery) return true;

    const searchLower = searchQuery.toLowerCase();
    return (
      ticket.ticketNumber.toLowerCase().includes(searchLower) ||
      ticket.subject.toLowerCase().includes(searchLower) ||
      ticket.scaleName.toLowerCase().includes(searchLower) ||
      ticket.scaleAcronym.toLowerCase().includes(searchLower) ||
      ticket.copyrightOrganization.toLowerCase().includes(searchLower)
    );
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'sent':
        return <Mail className="w-4 h-4" />;
      case 'responded':
        return <MessageSquare className="w-4 h-4" />;
      case 'resolved':
        return <CheckCircle className="w-4 h-4" />;
      case 'closed':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusColor = (color: string) => {
    const colorMap = {
      gray: 'bg-gray-100 text-gray-700 border-gray-200',
      blue: 'bg-blue-100 text-blue-700 border-blue-200',
      yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      green: 'bg-green-100 text-green-700 border-green-200',
      red: 'bg-red-100 text-red-700 border-red-200',
      orange: 'bg-orange-100 text-orange-700 border-orange-200',
      purple: 'bg-purple-100 text-purple-700 border-purple-200',
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.gray;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        items={[
          { href: "/dashboard", label: t("common.dashboard") },
          { href: "/dashboard/copyright", label: "版权服务" },
          { href: "/dashboard/copyright/tickets", label: "我的工单" }
        ]}
      />

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        {/* 页面标题和统计 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center space-x-2">
              <FileText className="w-6 h-6 text-blue-600" />
              <span>授权工单</span>
            </h1>
            <p className="text-muted-foreground">
              管理您的量表版权许可申请和授权状态
            </p>
          </div>

          <Link href="/dashboard/scales">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              申请新的许可
            </Button>
          </Link>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-muted-foreground">总工单</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <div className="text-sm text-muted-foreground">待处理</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.sent}</div>
              <div className="text-sm text-muted-foreground">已发送</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.responded}</div>
              <div className="text-sm text-muted-foreground">已回复</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
              <div className="text-sm text-muted-foreground">已解决</div>
            </CardContent>
          </Card>
        </div>

        {/* 搜索和筛选 */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="搜索工单号、量表名称或版权方..."
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
                <SelectItem value="pending">待处理</SelectItem>
                <SelectItem value="sent">已发送</SelectItem>
                <SelectItem value="responded">已回复</SelectItem>
                <SelectItem value="resolved">已解决</SelectItem>
                <SelectItem value="closed">已关闭</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 工单列表 */}
        <div className="space-y-4">
          {filteredTickets.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium mb-2">
                  {searchQuery ? '没有找到匹配的工单' : '还没有版权授权工单'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery
                    ? '尝试调整搜索条件或筛选器'
                    : '当您需要获取量表使用许可时，可以通过我们的平台创建工单'
                  }
                </p>
                <Link href="/dashboard/scales">
                  <Button>
                    <Search className="w-4 h-4 mr-2" />
                    浏览量表库
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            filteredTickets.map((ticket) => (
              <Card key={ticket.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant="outline" className="font-mono">
                          {ticket.ticketNumber}
                        </Badge>
                        <Badge className={getStatusColor(ticket.statusColor)}>
                          {getStatusIcon(ticket.status)}
                          <span className="ml-1">{ticket.statusLabel}</span>
                        </Badge>
                        <Badge variant="outline" className={`border-${ticket.priorityColor}-300 text-${ticket.priorityColor}-700`}>
                          {ticket.priorityLabel}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg">
                        {ticket.subject}
                      </CardTitle>
                      <CardDescription>
                        {ticket.scaleName} ({ticket.scaleAcronym}) • {ticket.categoryName}
                      </CardDescription>
                    </div>

                    <div className="text-right text-sm text-muted-foreground">
                      <div>{ticket.createdAtFormatted}</div>
                      <div>{ticket.daysSinceCreated}天前</div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    {/* 版权方信息 */}
                    <div className="bg-gray-50 rounded-lg p-3">
                      <h5 className="font-medium mb-2 text-sm">版权方联系信息</h5>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center space-x-2">
                          <FileText className="w-3 h-3 text-gray-500" />
                          <span>{ticket.copyrightOrganization}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Mail className="w-3 h-3 text-gray-500" />
                          <span>{ticket.copyrightEmail}</span>
                        </div>
                        {ticket.copyrightPhone && (
                          <div className="flex items-center space-x-2">
                            <Phone className="w-3 h-3 text-gray-500" />
                            <span>{ticket.copyrightPhone}</span>
                          </div>
                        )}
                        {ticket.copyrightWebsite && (
                          <div className="flex items-center space-x-2">
                            <Globe className="w-3 h-3 text-gray-500" />
                            <a href={ticket.copyrightWebsite} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                              官方网站
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 申请详情 */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-600">申请类型:</span>
                        <span className="ml-2">{ticket.requestType.replace('_', ' ')}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">预期用途:</span>
                        <span className="ml-2">{ticket.intendedUse}</span>
                      </div>
                    </div>

                    {/* 项目描述 */}
                    <div>
                      <h5 className="font-medium mb-1 text-sm">项目描述</h5>
                      <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                        {ticket.projectDescription}
                      </p>
                    </div>

                    {/* 状态指示器 */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm">
                        {ticket.responseReceived ? (
                          <div className="flex items-center space-x-1 text-green-600">
                            <CheckCircle className="w-4 h-4" />
                            <span>已收到回复</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-1 text-gray-500">
                            <Clock className="w-4 h-4" />
                            <span>等待回复中</span>
                          </div>
                        )}

                        {ticket.licenseGranted ? (
                          <div className="flex items-center space-x-1 text-green-600">
                            <CheckCircle className="w-4 h-4" />
                            <span>许可已授予</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-1 text-gray-500">
                            <XCircle className="w-4 h-4" />
                            <span>待授权</span>
                          </div>
                        )}
                      </div>

                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="w-3 h-3 mr-1" />
                          查看详情
                        </Button>
                        <Button size="sm" variant="outline">
                          <MessageSquare className="w-3 h-3 mr-1" />
                          发消息
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* 快速操作 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Search className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <h4 className="font-medium mb-1">申请新许可</h4>
              <p className="text-xs text-muted-foreground mb-3">
                浏览量表库并申请使用许可
              </p>
              <Link href="/dashboard/scales">
                <Button size="sm" variant="outline" className="w-full">
                  浏览量表
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <FileText className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <h4 className="font-medium mb-1">许可文档</h4>
              <p className="text-xs text-muted-foreground mb-3">
                查看已获得的许可文档
              </p>
              <Button size="sm" variant="outline" className="w-full" disabled>
                即将推出
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 text-purple-600" />
              <h4 className="font-medium mb-1">联系支持</h4>
              <p className="text-xs text-muted-foreground mb-3">
                工单相关问题咨询
              </p>
              <Button size="sm" variant="outline" className="w-full">
                联系客服
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}