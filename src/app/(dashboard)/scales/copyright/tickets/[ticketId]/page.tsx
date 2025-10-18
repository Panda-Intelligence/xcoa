'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  ArrowLeft,
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
  Download,
  Send
} from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/hooks/useLanguage';
import { toast } from 'sonner';

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
  const [sending, setSending] = useState(false);

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
    
    // Check URL params for auto-open message dialog
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('action') === 'message') {
      setUpdateMessageOpen(true);
    }
  }, [ticketId]);

  const fetchTicketDetails = async () => {
    try {
      const response = await fetch(`/api/user/tickets/${ticketId}`);
      const data = await response.json();

      if (data.success) {
        setTicket(data.ticket);
      } else {
        console.error(t('copyright.tickets.failed_to_load_details'), data.error);
      }
    } catch (error) {
      console.error(t('copyright.tickets.failed_to_load_details'), error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    setSending(true);
    try {
      const response = await fetch(`/api/copyright/tickets/${ticketId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: message,
          messageType: 'user_message'
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('');
        setUpdateMessageOpen(false);
        await fetchTicketDetails();
      } else {
        toast.error(data.error || t('copyright.tickets.failed_to_send_message'));
      }
    } catch (error) {
      console.error('Send message error:', error);
      toast.error(t('copyright.tickets.failed_to_send_message'));
    } finally {
      setSending(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <Clock className="w-5 h-5 text-primary" />;
      case 'in_progress':
        return <Mail className="w-5 h-5 text-yellow-600" />;
      case 'waiting_response':
        return <MessageSquare className="w-5 h-5 text-orange-600" />;
      case 'resolved':
        return <CheckCircle className="w-5 h-5 text-success" />;
      case 'closed':
        return <XCircle className="w-5 h-5 text-muted-foreground" />;
      default:
        return <Clock className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    const colorMap = {
      open: 'bg-primary/10 text-primary border-blue-200',
      in_progress: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      waiting_response: 'bg-orange-100 text-orange-700 border-orange-200',
      resolved: 'bg-green-100 text-green-700 border-green-200',
      closed: 'bg-gray-100 text-foreground border',
    };
    return colorMap[status as keyof typeof colorMap] || colorMap.open;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-48 bg-muted rounded"></div>
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
          <h2 className="text-xl font-semibold mb-2">{t('copyright.tickets.ticket_not_found')}</h2>
          <p className="text-muted-foreground mb-4">
            {t('copyright.tickets.ticket_not_found_desc')}
          </p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('copyright.tickets.back_to_ticket_list')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        items={[
          { href: "/scales/copyright/tickets", label: t('copyright.tickets.my_tickets') },
          { href: `/scales/copyright/tickets/${ticketId}`, label: ticket.ticketNumber }
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
              {t('copyright.tickets.ticket_number')}: {ticket.ticketNumber} • {t('copyright.tickets.created_at')} {new Date(ticket.createdAt * 1000).toLocaleString()}
            </p>
          </div>

          <div className="flex space-x-2">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              {t('copyright.tickets.export_ticket')}
            </Button>
            <Dialog open={updateMessageOpen} onOpenChange={setUpdateMessageOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Send className="w-4 h-4 mr-2" />
                  {t('copyright.tickets.send_message')}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('copyright.tickets.send_message_title')}</DialogTitle>
                  <DialogDescription>
                    {t('copyright.tickets.send_message_desc')}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <Textarea
                    placeholder={t('copyright.tickets.message_placeholder')}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="min-h-[100px]"
                  />

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setUpdateMessageOpen(false)}>
                      {t('common.cancel')}
                    </Button>
                    <Button disabled={!message.trim()}>
                      {t('copyright.tickets.send_message')}
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
                <CardTitle>{t('copyright.tickets.application_details')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium text-sm">{t('copyright.tickets.request_type')}:</span>
                    <p className="text-sm text-muted-foreground">{ticket.requestType.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <span className="font-medium text-sm">{t('copyright.tickets.intended_use')}:</span>
                    <p className="text-sm text-muted-foreground">{ticket.intendedUse}</p>
                  </div>
                  <div>
                    <span className="font-medium text-sm">{t('copyright.tickets.priority')}:</span>
                    <p className="text-sm text-muted-foreground">{ticket.priority}</p>
                  </div>
                  <div>
                    <span className="font-medium text-sm">{t('copyright.tickets.budget_range')}:</span>
                    <p className="text-sm text-muted-foreground">{ticket.budgetRange || t('copyright.tickets.to_be_discussed')}</p>
                  </div>
                </div>

                <div>
                  <span className="font-medium text-sm">{t('copyright.tickets.project_description')}:</span>
                  <p className="text-sm text-muted-foreground bg-gray-50 p-3 rounded mt-1">
                    {ticket.projectDescription}
                  </p>
                </div>

                <div>
                  <span className="font-medium text-sm">{t('copyright.tickets.initial_message')}:</span>
                  <p className="text-sm text-muted-foreground bg-gray-50 p-3 rounded mt-1">
                    {ticket.initialMessage}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* 工单时间线 */}
            <Card>
              <CardHeader>
                <CardTitle>{t('copyright.tickets.ticket_timeline')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{t('copyright.tickets.ticket_created')}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(ticket.createdAt * 1000).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {ticket.status === 'sent' && (
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <Mail className="w-4 h-4 text-success" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{t('copyright.tickets.email_sent')}</p>
                        <p className="text-xs text-muted-foreground">
                          {t('copyright.tickets.sent_to')} {ticket.copyrightEmail}
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
                        <p className="font-medium text-sm">{t('copyright.tickets.response_received')}</p>
                        <p className="text-xs text-muted-foreground">
                          {t('copyright.tickets.response_received_desc')}
                        </p>
                      </div>
                    </div>
                  )}

                  {ticket.licenseGranted && (
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-success" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{t('copyright.tickets.license_granted')}</p>
                        <p className="text-xs text-muted-foreground">
                          {t('copyright.tickets.license_granted_desc')}
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
                <CardTitle className="text-lg">{t('copyright.tickets.copyright_holder_info')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Building className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{ticket.copyrightOrganization}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <a href={`mailto:${ticket.copyrightEmail}`} className="text-sm text-primary hover:underline">
                    {ticket.copyrightEmail}
                  </a>
                </div>
                {ticket.copyrightPhone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <a href={`tel:${ticket.copyrightPhone}`} className="text-sm text-primary hover:underline">
                      {ticket.copyrightPhone}
                    </a>
                  </div>
                )}
                {ticket.copyrightWebsite && (
                  <div className="flex items-center space-x-2">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    <a href={ticket.copyrightWebsite} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                      {t('copyright.tickets.official_website')}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 工单状态 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t('copyright.tickets.current_status_title')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{t('copyright.tickets.ticket_status')}</span>
                    <Badge className={getStatusColor(ticket.status)}>
                      {ticket.status}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm">{t('copyright.tickets.response_status')}</span>
                    {ticket.responseReceived ? (
                      <Badge className="bg-green-100 text-green-700">{t('copyright.tickets.responded_status')}</Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-foreground">{t('copyright.tickets.waiting_for_response')}</Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm">{t('copyright.tickets.license_status')}</span>
                    {ticket.licenseGranted ? (
                      <Badge className="bg-green-100 text-green-700">{t('copyright.tickets.authorized')}</Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-foreground">{t('copyright.tickets.pending_authorization')}</Badge>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t">
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div>{t('copyright.tickets.created_time')}: {new Date(ticket.createdAt * 1000).toLocaleString()}</div>
                    <div>{t('copyright.tickets.last_updated')}: {new Date(ticket.updatedAt * 1000).toLocaleString()}</div>
                    <div>{t('copyright.tickets.last_contact')}: {new Date(ticket.lastContactAt * 1000).toLocaleString()}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 快速操作 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t('copyright.tickets.quick_actions_title')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" size="sm">
                  <Mail className="w-4 h-4 mr-2" />
                  {t('copyright.tickets.send_email_to_holder')}
                </Button>
                <Button variant="outline" className="w-full" size="sm">
                  <Calendar className="w-4 h-4 mr-2" />
                  {t('copyright.tickets.set_follow_up_reminder')}
                </Button>
                <Button variant="outline" className="w-full" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  {t('copyright.tickets.download_ticket_pdf')}
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
    sent: 'bg-primary/10 text-primary border-blue-200',
    responded: 'bg-purple-100 text-purple-700 border-purple-200',
    resolved: 'bg-green-100 text-green-700 border-green-200',
    closed: 'bg-gray-100 text-foreground border',
    failed: 'bg-red-100 text-red-700 border-red-200',
  };
  return colorMap[status as keyof typeof colorMap] || colorMap.pending;
}