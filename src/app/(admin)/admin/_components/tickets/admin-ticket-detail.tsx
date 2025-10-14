"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Shield,
  ChevronLeft,
  User,
  Mail,
  Phone,
  Building,
  Clock,
  CheckCircle,
  AlertTriangle,
  MessageSquare,
  Send
} from "lucide-react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { useToast } from "@/hooks/useToast";
import { useLanguage } from "@/hooks/useLanguage";

interface TicketDetail {
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
  userName: string;
  userEmail: string;
  scaleName: string;
  scaleAcronym: string;
  scaleDescription?: string;
  createdAt: string;
  updatedAt: string;
}

interface TicketMessage {
  id: string;
  messageType: string;
  sender: string;
  subject: string;
  content: string;
  isRead: number;
  isPublic: number;
  createdAt: string;
}

interface AdminTicketDetailProps {
  ticketId: string;
}

export function AdminTicketDetail({ ticketId }: AdminTicketDetailProps) {
  const { t } = useLanguage();
  const router = useRouter();
  const toast = useToast();
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updateForm, setUpdateForm] = useState({
    status: "",
    adminNotes: "",
    responseMessage: ""
  });

  const fetchTicketDetail = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/copyright-tickets/${ticketId}`);
      const data = await response.json();

      if (data.success) {
        setTicket(data.ticket);
        setMessages(data.messages || []);
        setUpdateForm(prev => ({ ...prev, status: data.ticket.status }));
      } else {
        setError(data.error || t('admin.tickets.load_failed'));
      }
    } catch (error) {
      console.error("Failed to load ticket details:", error);
      setError(t('admin.tickets.network_error_retry'));
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  useEffect(() => {
    fetchTicketDetail();
  }, [fetchTicketDetail]);

  const handleUpdateTicket = async () => {
    if (!ticket) return;

    try {
      const response = await fetch(`/api/admin/copyright-tickets/${ticketId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: updateForm.status,
          adminNotes: updateForm.adminNotes,
          responseMessage: updateForm.responseMessage,
          responseReceived: updateForm.status === "waiting_response" ? 1 : 0,
          licenseGranted: updateForm.status === "resolved" ? 1 : 0
        })
      });

      const data = await response.json();

      if (response.ok) {
        fetchTicketDetail();
        setUpdateForm(prev => ({ ...prev, adminNotes: "", responseMessage: "" }));
        toast.success(t('admin.tickets.ticket_updated_successfully'));
      } else {
        toast.error(data.error || t('admin.tickets.update_failed'));
      }
    } catch (error) {
      console.error("Error updating ticket:", error);
      toast.error(t('admin.tickets.network_error_retry'));
    }
  };

  const getStatusColor = (status: string) => {
    const colorMap = {
      open: "bg-blue-100 text-blue-700",
      in_progress: "bg-yellow-100 text-yellow-700",
      waiting_response: "bg-orange-100 text-orange-700",
      resolved: "bg-green-100 text-green-700",
      closed: "bg-gray-100 text-gray-700"
    };
    return colorMap[status as keyof typeof colorMap] || colorMap.open;
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      open: t('admin.tickets.status_open'),
      in_progress: t('admin.tickets.status_in_progress'),
      waiting_response: t('admin.tickets.status_waiting_response'),
      resolved: t('admin.tickets.status_resolved'),
      closed: t('admin.tickets.status_closed')
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getPriorityColor = (priority: string) => {
    const colorMap = {
      low: "bg-gray-100 text-gray-700",
      medium: "bg-blue-100 text-blue-700",
      high: "bg-orange-100 text-orange-700",
      urgent: "bg-red-100 text-red-700"
    };
    return colorMap[priority as keyof typeof colorMap] || colorMap.medium;
  };

  if (loading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="min-h-[100vh] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">{t('admin.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="min-h-[100vh] flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-500" />
            <p className="text-lg font-medium mb-2">{t('admin.tickets.load_failed')}</p>
            <p className="text-muted-foreground mb-4">{error || t('admin.tickets.ticket_not_exist')}</p>
            <Button onClick={() => router.push("/admin/tickets")}>
              {t('admin.tickets.back_to_list')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.push("/admin/tickets")}>
          <ChevronLeft className="w-4 h-4 mr-2" />
          {t('admin.tickets.back_to_list')}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 工单详情 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 基本信息 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>{t('admin.tickets.ticket_id', { ticketNumber: ticket.ticketNumber })}</span>
                <Badge className={getStatusColor(ticket.status)}>
                  {getStatusLabel(ticket.status)}
                </Badge>
                <Badge className={getPriorityColor(ticket.priority)}>
                  {ticket.priority.toUpperCase()}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">{t('admin.tickets.ticket_subject')}</h4>
                <p className="text-sm">{ticket.subject}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">{t('admin.tickets.request_type')}</h4>
                  <p className="text-sm text-muted-foreground">{ticket.requestType.replace('_', ' ')}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">{t('admin.tickets.intended_use')}</h4>
                  <p className="text-sm text-muted-foreground">{ticket.intendedUse}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">{t('admin.tickets.project_description')}</h4>
                <p className="text-sm text-muted-foreground bg-gray-50 p-3 rounded">
                  {ticket.projectDescription}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">{t('admin.tickets.created_time')}</span>
                  <p className="text-muted-foreground">{format(new Date(ticket.createdAt), "yyyy年MM月dd日 HH:mm")}</p>
                </div>
                <div>
                  <span className="font-medium">{t('admin.tickets.last_updated')}</span>
                  <p className="text-muted-foreground">{format(new Date(ticket.updatedAt), "yyyy年MM月dd日 HH:mm")}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 消息历史 */}
          <Card>
            <CardHeader>
              <CardTitle>{t('admin.tickets.message_history')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {messages.length > 0 ? messages.map((message) => (
                  <div key={message.id} className={`p-3 rounded-lg ${message.messageType === 'admin_note' ? 'bg-blue-50 border-l-4 border-blue-500' :
                      message.messageType === 'admin_response' ? 'bg-green-50 border-l-4 border-green-500' :
                        'bg-gray-50 border-l-4 border-gray-500'
                    }`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <MessageSquare className="w-4 h-4" />
                        <span className="font-medium text-sm">{message.subject}</span>
                        <Badge variant="outline" className="text-xs">
                          {message.messageType === 'admin_note' ? t('admin.tickets.message_admin_note') :
                            message.messageType === 'admin_response' ? t('admin.tickets.message_admin_response') : t('admin.tickets.message_user_message')}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(parseInt(message.createdAt) * 1000), "MM/dd HH:mm")}
                      </span>
                    </div>
                    <p className="text-sm">{message.content}</p>
                  </div>
                )) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>{t('admin.tickets.no_messages')}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 侧边栏 - 用户和版权方信息 */}
        <div className="space-y-6">
          {/* 用户信息 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>{t('admin.tickets.applicant_user')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="font-medium">{t('admin.tickets.label_name')}</span>
                <p className="text-sm text-muted-foreground">{ticket.userName}</p>
              </div>
              <div>
                <span className="font-medium">{t('admin.tickets.label_email')}</span>
                <p className="text-sm text-muted-foreground">{ticket.userEmail}</p>
              </div>
              <Button size="sm" variant="outline" className="w-full">
                <Mail className="w-3 h-3 mr-2" />
                {t('admin.tickets.button_contact_user')}
              </Button>
            </CardContent>
          </Card>

          {/* 量表信息 */}
          <Card>
            <CardHeader>
              <CardTitle>{t('admin.tickets.related_scale')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="font-medium">{t('admin.tickets.label_scale_name')}</span>
                <p className="text-sm text-muted-foreground">{ticket.scaleName}</p>
              </div>
              <div>
                <span className="font-medium">{t('admin.tickets.label_abbreviation')}</span>
                <p className="text-sm text-muted-foreground">{ticket.scaleAcronym}</p>
              </div>
              <Button size="sm" variant="outline" className="w-full">
                {t('admin.tickets.button_view_scale_details')}
              </Button>
            </CardContent>
          </Card>

          {/* 版权方信息 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building className="w-4 h-4" />
                <span>{t('admin.tickets.copyright_holder')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="font-medium">{t('admin.tickets.label_organization')}</span>
                <p className="text-sm text-muted-foreground">{ticket.copyrightOrganization}</p>
              </div>
              <div>
                <span className="font-medium">{t('admin.tickets.label_email')}</span>
                <p className="text-sm text-muted-foreground">{ticket.copyrightEmail}</p>
              </div>
              {ticket.copyrightPhone && (
                <div>
                  <span className="font-medium">{t('admin.tickets.label_phone')}</span>
                  <p className="text-sm text-muted-foreground">{ticket.copyrightPhone}</p>
                </div>
              )}
              {ticket.copyrightWebsite && (
                <div>
                  <span className="font-medium">{t('admin.tickets.label_website')}</span>
                  <a href={ticket.copyrightWebsite} target="_blank" rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline">
                    {ticket.copyrightWebsite}
                  </a>
                </div>
              )}

              <div className="flex space-x-2">
                <Button size="sm" variant="outline" className="flex-1">
                  <Mail className="w-3 h-3 mr-1" />
                  {t('admin.tickets.button_email')}
                </Button>
                {ticket.copyrightPhone && (
                  <Button size="sm" variant="outline" className="flex-1">
                    <Phone className="w-3 h-3 mr-1" />
                    {t('admin.tickets.button_phone')}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 工单管理 */}
          <Card>
            <CardHeader>
              <CardTitle>{t('admin.tickets.ticket_management')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>{t('admin.tickets.label_status_update')}</Label>
                <Select value={updateForm.status} onValueChange={(value) =>
                  setUpdateForm({ ...updateForm, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">{t('admin.tickets.status_open')}</SelectItem>
                    <SelectItem value="in_progress">{t('admin.tickets.status_in_progress')}</SelectItem>
                    <SelectItem value="waiting_response">{t('admin.tickets.status_waiting_response')}</SelectItem>
                    <SelectItem value="resolved">{t('admin.tickets.status_resolved')}</SelectItem>
                    <SelectItem value="closed">{t('admin.tickets.status_closed')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>{t('admin.tickets.label_admin_notes')}</Label>
                <Textarea
                  value={updateForm.adminNotes}
                  onChange={(e) => setUpdateForm({ ...updateForm, adminNotes: e.target.value })}
                  placeholder={t('admin.internal_notes_placeholder')}
                  rows={3}
                />
              </div>

              <div>
                <Label>{t('admin.tickets.label_user_reply_message')}</Label>
                <Textarea
                  value={updateForm.responseMessage}
                  onChange={(e) => setUpdateForm({ ...updateForm, responseMessage: e.target.value })}
                  placeholder={t('admin.user_communication_placeholder')}
                  rows={3}
                />
              </div>

              <Button
                className="w-full"
                onClick={handleUpdateTicket}
                disabled={!updateForm.status}
              >
                <Send className="w-4 h-4 mr-2" />
                {t('admin.tickets.button_update_ticket')}
              </Button>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm">
                  {ticket.responseReceived ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <Clock className="w-4 h-4 text-gray-500" />
                  )}
                  <span>{t('admin.tickets.copyright_response')} {ticket.responseReceived ? t('admin.tickets.response_received') : t('admin.tickets.response_not_received')}</span>
                </div>

                <div className="flex items-center space-x-2 text-sm">
                  {ticket.licenseGranted ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <Clock className="w-4 h-4 text-gray-500" />
                  )}
                  <span>{t('admin.tickets.license_granted')} {ticket.licenseGranted ? t('admin.tickets.license_granted_yes') : t('admin.tickets.license_pending')}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}