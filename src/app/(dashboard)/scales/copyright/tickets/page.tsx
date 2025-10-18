'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  open: number;
  in_progress: number;
  waiting_response: number;
  resolved: number;
  closed: number;
}

export default function CopyrightTicketsPage() {
  const { t } = useLanguage();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [stats, setStats] = useState<TicketStats>({ total: 0, open: 0, in_progress: 0, waiting_response: 0, resolved: 0, closed: 0 });
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
      console.warn(9999874, params)
      const response = await fetch(`/api/user/tickets?${params}`);
      const data = await response.json();
      console.warn(999987, data)
      if (data.success) {
        setTickets(data.tickets || []);
        const apiStats = data.statistics || {};
        setStats({
          total: apiStats.total || 0,
          open: apiStats.open || 0,
          in_progress: apiStats.in_progress || 0,
          waiting_response: apiStats.waiting_response || 0,
          resolved: apiStats.resolved || 0,
          closed: apiStats.closed || 0,
        });
      } else {
        console.error(t('copyright.tickets.failed_to_load'), data.error);
      }
    } catch (error) {
      console.error(t('copyright.tickets.failed_to_load'), error);
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
      gray: 'bg-gray-100 text-foreground border',
      blue: 'bg-primary/10 text-primary border-blue-200',
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
            <div className="h-8 bg-muted rounded w-1/3" />
            <div className="h-4 bg-muted rounded w-2/3" />
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-24 bg-muted rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <PageHeader
        items={[
          { href: "/scales/copyright", label: t('copyright.service_title') },
          { href: "/scales/copyright/tickets", label: t('copyright.tickets.my_tickets') }
        ]}
      />

      <div className="flex-1 overflow-auto">
        <div className="flex flex-col gap-4 p-4">
          {/* 页面标题和统计 */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center space-x-2">
                <FileText className="w-6 h-6 text-primary" />
                <span>{t('copyright.tickets.authorization_tickets')}</span>
              </h1>
              <p className="text-muted-foreground">
                {t('copyright.tickets.manage_description')}
              </p>
            </div>

            <Link href="/scales/copyright/create">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                {t('copyright.tickets.apply_new_license')}
              </Button>
            </Link>
          </div>

          {/* 统计卡片 */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">{stats.total || 0}</div>
                <div className="text-sm text-muted-foreground">{t('copyright.tickets.total_tickets')}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">{stats.open || 0}</div>
                <div className="text-sm text-muted-foreground">{t('copyright.tickets.open')}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">{stats.in_progress || 0}</div>
                <div className="text-sm text-muted-foreground">{t('copyright.tickets.in_progress')}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">{stats.waiting_response || 0}</div>
                <div className="text-sm text-muted-foreground">{t('copyright.tickets.waiting_response')}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-success">{stats.resolved || 0}</div>
                <div className="text-sm text-muted-foreground">{t('copyright.tickets.resolved')}</div>
              </CardContent>
            </Card>
          </div>

          {/* 搜索和筛选 */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('copyright.tickets.search_placeholder')}
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
                  <SelectItem value="all">{t('copyright.tickets.all_status')}</SelectItem>
                  <SelectItem value="open">{t('copyright.tickets.open')}</SelectItem>
                  <SelectItem value="in_progress">{t('copyright.tickets.in_progress')}</SelectItem>
                  <SelectItem value="waiting_response">{t('copyright.tickets.waiting_response')}</SelectItem>
                  <SelectItem value="resolved">{t('copyright.tickets.resolved')}</SelectItem>
                  <SelectItem value="closed">{t('copyright.tickets.closed')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 工单列表 */}
          <div className="space-y-4">
            {filteredTickets.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">
                    {searchQuery ? t('copyright.tickets.no_matching_tickets') : t('copyright.tickets.no_tickets_yet')}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery
                      ? t('copyright.tickets.adjust_search')
                      : t('copyright.tickets.create_ticket_hint')
                    }
                  </p>
                  <Link href="/scales/search">
                    <Button>
                      <Search className="w-4 h-4 mr-2" />
                      {t('copyright.tickets.browse_scales')}
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
                        <div>
                          {ticket.daysSinceCreated === 0
                            ? t('copyright.tickets.today') || 'Today'
                            : t('copyright.tickets.days_ago', { days: ticket.daysSinceCreated.toString() })
                          }
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-4">
                      {/* 版权方信息 */}
                      <div className="bg-gray-50 rounded-lg p-3">
                        <h5 className="font-medium mb-2 text-sm">{t('copyright.tickets.copyright_contact_info')}</h5>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center space-x-2">
                            <FileText className="w-3 h-3 text-muted-foreground" />
                            <span>{ticket.copyrightOrganization}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Mail className="w-3 h-3 text-muted-foreground" />
                            <span>{ticket.copyrightEmail}</span>
                          </div>
                          {ticket.copyrightPhone && (
                            <div className="flex items-center space-x-2">
                              <Phone className="w-3 h-3 text-muted-foreground" />
                              <span>{ticket.copyrightPhone}</span>
                            </div>
                          )}
                          {ticket.copyrightWebsite && (
                            <div className="flex items-center space-x-2">
                              <Globe className="w-3 h-3 text-muted-foreground" />
                              <a href={ticket.copyrightWebsite} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                {t('copyright.tickets.official_website')}
                              </a>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 申请详情 */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-muted-foreground">{t('copyright.tickets.request_type')}:</span>
                          <span className="ml-2">{ticket.requestType.replace('_', ' ')}</span>
                        </div>
                        <div>
                          <span className="font-medium text-muted-foreground">{t('copyright.tickets.intended_use')}:</span>
                          <span className="ml-2">{ticket.intendedUse}</span>
                        </div>
                      </div>

                      {/* 项目描述 */}
                      <div>
                        <h5 className="font-medium mb-1 text-sm">{t('copyright.tickets.project_description')}</h5>
                        <p className="text-sm text-muted-foreground bg-gray-50 p-2 rounded">
                          {ticket.projectDescription}
                        </p>
                      </div>

                      {/* 状态指示器 */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm">
                          {ticket.responseReceived ? (
                            <div className="flex items-center space-x-1 text-success">
                              <CheckCircle className="w-4 h-4" />
                              <span>{t('copyright.tickets.response_received')}</span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-1 text-muted-foreground">
                              <Clock className="w-4 h-4" />
                              <span>{t('copyright.tickets.waiting_response')}</span>
                            </div>
                          )}

                          {ticket.licenseGranted ? (
                            <div className="flex items-center space-x-1 text-success">
                              <CheckCircle className="w-4 h-4" />
                              <span>{t('copyright.tickets.license_granted')}</span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-1 text-muted-foreground">
                              <XCircle className="w-4 h-4" />
                              <span>{t('copyright.tickets.pending_authorization')}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex space-x-2">
                          <Link href={`/scales/copyright/tickets/${ticket.id}`}>
                            <Button size="sm" variant="outline">
                              <Eye className="w-3 h-3 mr-1" />
                              {t('copyright.tickets.view_details')}
                            </Button>
                          </Link>
                          <Link href={`/scales/copyright/tickets/${ticket.id}?action=message`}>
                            <Button size="sm" variant="outline">
                              <MessageSquare className="w-3 h-3 mr-1" />
                              {t('copyright.tickets.send_message')}
                            </Button>
                          </Link>
                        </div>
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