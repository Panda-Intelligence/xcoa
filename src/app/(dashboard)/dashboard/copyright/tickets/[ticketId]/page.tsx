'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  ArrowLeft,
  FileText,
  Clock,
  Mail,
  Phone,
  Globe,
  CheckCircle,
  AlertCircle,
  XCircle,
  MessageSquare,
  Calendar,
  User,
  Building,
  Target,
  DollarSign,
  Download,
  Send
} from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/hooks/useLanguage';

interface TicketDetail {
  id: string;
  ticketNumber: string;
  subject: string;
  requestType: string;
  priority: string;
  status: string;
  intendedUse: string;
  projectDescription: string;
  expectedStartDate?: string;
  expectedDuration?: string;
  budgetRange?: string;
  initialMessage: string;
  copyrightOrganization: string;
  copyrightEmail: string;
  copyrightPhone?: string;
  copyrightWebsite?: string;
  responseReceived: number;
  licenseGranted: number;
  adminNotes?: string;
  createdAt: number;
  updatedAt: number;
  lastContactAt: number;
}

interface TicketDetailPageProps {
  params: Promise<{ ticketId: string }>;
}

export default function TicketDetailPage({ params }: TicketDetailPageProps) {
  const { t } = useLanguage();
  const router = useRouter();
  const [ticketId, setTicketId] = useState<string>('');
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [updateMessageOpen, setUpdateMessageOpen] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function loadParams() {
      const resolvedParams = await params;
      setTicketId(resolvedParams.ticketId);
    }
    loadParams();
  }, [params]);

  useEffect(() => {
    if (!ticketId) return;
    fetchTicketDetails();
  }, [ticketId]);

  const fetchTicketDetails = async () => {
    try {
      const response = await fetch(`/api/user/tickets/${ticketId}`);
      const data = await response.json();

      if (data.success) {
        setTicket(data.ticket);
      } else {
        console.error('加载工单详情失败:', data.error);
      }
    } catch (error) {
      console.error('加载工单详情失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'sent':
        return <Mail className="w-5 h-5 text-blue-600" />;
      case 'responded':
        return <MessageSquare className="w-5 h-5 text-purple-600" />;
      case 'resolved':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'closed':
        return <XCircle className="w-5 h-5 text-gray-600" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    const colorMap = {
      pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      sent: 'bg-blue-100 text-blue-700 border-blue-200',
      responded: 'bg-purple-100 text-purple-700 border-purple-200',
      resolved: 'bg-green-100 text-green-700 border-green-200',
      closed: 'bg-gray-100 text-gray-700 border-gray-200',
      failed: 'bg-red-100 text-red-700 border-red-200',
    };
    return colorMap[status as keyof typeof colorMap] || colorMap.pending;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-48 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-semibold mb-2">工单不存在</h2>
          <p className="text-muted-foreground mb-4">
            请检查工单号或联系客服获取帮助
          </p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回工单列表
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        items={[
          { href: "/dashboard", label: t("common.dashboard") },
          { href: "/dashboard/copyright/tickets", label: "我的工单" },
          { href: `/dashboard/copyright/tickets/${ticketId}`, label: ticket.ticketNumber }
        ]}
      />

      <div className="flex flex-1 flex-col gap-4 p-4">
        {/* 工单标题和状态 */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-2xl font-bold">{ticket.subject}</h1>
              <Badge className={getStatusColor(ticket.status)}>
                {getStatusIcon(ticket.status)}
                <span className="ml-2">{ticket.status}</span>
              </Badge>
            </div>
            <p className="text-muted-foreground">
              工单号: {ticket.ticketNumber} • 创建于 {new Date(ticket.createdAt * 1000).toLocaleString()}
            </p>
          </div>

          <div className="flex space-x-2">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              导出工单
            </Button>
            <Dialog open={updateMessageOpen} onOpenChange={setUpdateMessageOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Send className="w-4 h-4 mr-2" />
                  发送消息
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>发送消息</DialogTitle>
                  <DialogDescription>
                    向版权方发送补充信息或跟进消息
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <Textarea
                    placeholder="输入您要发送的消息..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="min-h-[100px]"
                  />

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setUpdateMessageOpen(false)}>
                      取消
                    </Button>
                    <Button disabled={!message.trim()}>
                      发送消息
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 主要内容 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 申请详情 */}
            <Card>
              <CardHeader>
                <CardTitle>申请详情</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium text-sm">申请类型:</span>
                    <p className="text-sm text-muted-foreground">{ticket.requestType.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <span className="font-medium text-sm">预期用途:</span>
                    <p className="text-sm text-muted-foreground">{ticket.intendedUse}</p>
                  </div>
                  <div>
                    <span className="font-medium text-sm">优先级:</span>
                    <p className="text-sm text-muted-foreground">{ticket.priority}</p>
                  </div>
                  <div>
                    <span className="font-medium text-sm">预算范围:</span>
                    <p className="text-sm text-muted-foreground">{ticket.budgetRange || '待讨论'}</p>
                  </div>
                </div>

                <div>
                  <span className="font-medium text-sm">项目描述:</span>
                  <p className="text-sm text-muted-foreground bg-gray-50 p-3 rounded mt-1">
                    {ticket.projectDescription}
                  </p>
                </div>

                <div>
                  <span className="font-medium text-sm">初始消息:</span>
                  <p className="text-sm text-muted-foreground bg-gray-50 p-3 rounded mt-1">
                    {ticket.initialMessage}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* 工单时间线 */}
            <Card>
              <CardHeader>
                <CardTitle>工单时间线</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">工单创建</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(ticket.createdAt * 1000).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {ticket.status === 'sent' && (
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <Mail className="w-4 h-4 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">邮件已发送</p>
                        <p className="text-xs text-muted-foreground">
                          已发送至 {ticket.copyrightEmail}
                        </p>
                      </div>
                    </div>
                  )}

                  {ticket.responseReceived && (
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <MessageSquare className="w-4 h-4 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">收到回复</p>
                        <p className="text-xs text-muted-foreground">
                          版权方已回复您的申请
                        </p>
                      </div>
                    </div>
                  )}

                  {ticket.licenseGranted && (
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">许可已授予</p>
                        <p className="text-xs text-muted-foreground">
                          您已获得使用许可
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 侧边栏信息 */}
          <div className="space-y-6">
            {/* 版权方信息 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">版权方信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Building className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{ticket.copyrightOrganization}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <a href={`mailto:${ticket.copyrightEmail}`} className="text-sm text-blue-600 hover:underline">
                    {ticket.copyrightEmail}
                  </a>
                </div>
                {ticket.copyrightPhone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <a href={`tel:${ticket.copyrightPhone}`} className="text-sm text-blue-600 hover:underline">
                      {ticket.copyrightPhone}
                    </a>
                  </div>
                )}
                {ticket.copyrightWebsite && (
                  <div className="flex items-center space-x-2">
                    <Globe className="w-4 h-4 text-gray-500" />
                    <a href={ticket.copyrightWebsite} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                      官方网站
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 工单状态 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">当前状态</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">工单状态</span>
                    <Badge className={getStatusColor(ticket.status)}>
                      {ticket.status}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm">回复状态</span>
                    {ticket.responseReceived ? (
                      <Badge className="bg-green-100 text-green-700">已回复</Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-700">待回复</Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm">许可状态</span>
                    {ticket.licenseGranted ? (
                      <Badge className="bg-green-100 text-green-700">已授权</Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-700">待授权</Badge>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t">
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div>创建时间: {new Date(ticket.createdAt * 1000).toLocaleString()}</div>
                    <div>最后更新: {new Date(ticket.updatedAt * 1000).toLocaleString()}</div>
                    <div>最后联系: {new Date(ticket.lastContactAt * 1000).toLocaleString()}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 快速操作 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">快速操作</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" size="sm">
                  <Mail className="w-4 h-4 mr-2" />
                  发送邮件给版权方
                </Button>
                <Button variant="outline" className="w-full" size="sm">
                  <Calendar className="w-4 h-4 mr-2" />
                  设置跟进提醒
                </Button>
                <Button variant="outline" className="w-full" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  下载工单PDF
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}

// 辅助函数
function getStatusColor(status: string) {
  const colorMap = {
    pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    sent: 'bg-blue-100 text-blue-700 border-blue-200',
    responded: 'bg-purple-100 text-purple-700 border-purple-200',
    resolved: 'bg-green-100 text-green-700 border-green-200',
    closed: 'bg-gray-100 text-gray-700 border-gray-200',
    failed: 'bg-red-100 text-red-700 border-red-200',
  };
  return colorMap[status as keyof typeof colorMap] || colorMap.pending;
}