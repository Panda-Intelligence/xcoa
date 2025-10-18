"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Shield,
  Search,
  Filter,
  Eye,
  Edit,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Mail,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { useLanguage } from "@/hooks/useLanguage";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { useToast } from "@/hooks/useToast";

interface CopyrightTicket {
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
  userName: string;
  userEmail: string;
  createdAt: string;
  updatedAt: string;
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

export function AdminTicketsManager() {
  const { t } = useLanguage();
  const router = useRouter();
  const toast = useToast();
  const [tickets, setTickets] = useState<CopyrightTicket[]>([]);
  const [stats, setStats] = useState<TicketStats>({ total: 0, open: 0, in_progress: 0, waiting_response: 0, resolved: 0, closed: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<CopyrightTicket | null>(null);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [updateForm, setUpdateForm] = useState({
    status: "",
    adminNotes: "",
    responseMessage: ""
  });

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (priorityFilter !== "all") params.append("priority", priorityFilter);
      if (searchQuery) params.append("search", searchQuery);
      params.append("limit", "20");
      params.append("offset", ((page - 1) * 20).toString());

      const response = await fetch(`/api/admin/copyright-tickets?${params}`);
      const data = await response.json();

      if (data.success) {
        setTickets(data.tickets || []);
        setStats(data.statistics || { total: 0, open: 0, in_progress: 0, waiting_response: 0, resolved: 0, closed: 0 });
        setHasMore(data.pagination?.hasMore || false);
      } else {
        console.error("Failed to load copyright tickets:", data.error);
      }
    } catch (error) {
      console.error("Failed to load copyright tickets:", error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, priorityFilter, page, searchQuery]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const updateTicketStatus = async (ticketId: string, status: string, adminNotes?: string) => {
    try {
      const response = await fetch(`/api/admin/copyright-tickets/${ticketId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          adminNotes: adminNotes || "",
          responseReceived: status === "waiting_response" ? 1 : 0,
          licenseGranted: status === "resolved" ? 1 : 0
        })
      });

      const data = await response.json();

      if (response.ok) {
        fetchTickets();
        setUpdateDialogOpen(false);
        setSelectedTicket(null);
        toast.success(t('admin.tickets.status_updated_successfully'));
      } else {
        toast.error(data.error || t('admin.tickets.update_failed'));
      }
    } catch (error) {
      console.error("Error updating ticket status:", error);
      toast.error(t('admin.tickets.network_error_retry'));
    }
  };

  const openUpdateDialog = (ticket: CopyrightTicket) => {
    setSelectedTicket(ticket);
    setUpdateForm({
      status: ticket.status,
      adminNotes: "",
      responseMessage: ""
    });
    setUpdateDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    const colorMap = {
      open: "bg-primary/10 text-primary",
      in_progress: "bg-yellow-100 text-yellow-700",
      waiting_response: "bg-orange-100 text-orange-700",
      resolved: "bg-green-100 text-green-700",
      closed: "bg-gray-100 text-foreground"
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
      low: "bg-gray-100 text-foreground",
      medium: "bg-primary/10 text-primary",
      high: "bg-orange-100 text-orange-700",
      urgent: "bg-red-100 text-red-700"
    };
    return colorMap[priority as keyof typeof colorMap] || colorMap.medium;
  };

  const getPriorityLabel = (priority: string) => {
    const labels = {
      low: t('admin.tickets.priority_low'),
      medium: t('admin.tickets.priority_medium'),
      high: t('admin.tickets.priority_high'),
      urgent: t('admin.tickets.priority_urgent')
    };
    return labels[priority as keyof typeof labels] || priority;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <Clock className="w-4 h-4" />;
      case "in_progress":
        return <AlertCircle className="w-4 h-4" />;
      case "waiting_response":
        return <Mail className="w-4 h-4" />;
      case "resolved":
        return <CheckCircle className="w-4 h-4" />;
      case "closed":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  if (loading && page === 1) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="min-h-[100vh] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">{t('admin.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        items={[
          {
            href: "/admin/tickets",
            label: t('admin.tickets.breadcrumb_title')
          }
        ]}
      />
      <div className="flex flex-1 flex-col gap-4 p-4">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center space-x-2">
              <Shield className="w-6 h-6 text-primary" />
              <span>{t('admin.tickets.title')}</span>
            </h1>
            <p className="text-muted-foreground">
              {t('admin.tickets.description')}
            </p>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{stats.total}</div>
              <div className="text-sm text-muted-foreground">{t('admin.tickets.stats_total_tickets')}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.open}</div>
              <div className="text-sm text-muted-foreground">{t('admin.tickets.stats_open')}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{stats.in_progress}</div>
              <div className="text-sm text-muted-foreground">{t('admin.tickets.stats_in_progress')}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.waiting_response}</div>
              <div className="text-sm text-muted-foreground">{t('admin.tickets.stats_waiting_response')}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-success">{stats.resolved}</div>
              <div className="text-sm text-muted-foreground">{t('admin.tickets.stats_resolved')}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-muted-foreground">{stats.closed}</div>
              <div className="text-sm text-muted-foreground">{t('admin.tickets.stats_closed')}</div>
            </CardContent>
          </Card>
        </div>

        {/* 搜索和筛选 */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('admin.search_tickets_placeholder')}
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
                <SelectItem value="all">{t('admin.tickets.filter_all_status')}</SelectItem>
                <SelectItem value="open">{t('admin.tickets.status_open')}</SelectItem>
                <SelectItem value="in_progress">{t('admin.tickets.status_in_progress')}</SelectItem>
                <SelectItem value="waiting_response">{t('admin.tickets.status_waiting_response')}</SelectItem>
                <SelectItem value="resolved">{t('admin.tickets.status_resolved')}</SelectItem>
                <SelectItem value="closed">{t('admin.tickets.status_closed')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('admin.tickets.filter_all_priority')}</SelectItem>
                <SelectItem value="urgent">{t('admin.tickets.priority_urgent')}</SelectItem>
                <SelectItem value="high">{t('admin.tickets.priority_high')}</SelectItem>
                <SelectItem value="medium">{t('admin.tickets.priority_medium')}</SelectItem>
                <SelectItem value="low">{t('admin.tickets.priority_low')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={fetchTickets}>{t('admin.tickets.button_search')}</Button>
        </div>

        {/* 工单列表 */}
        <Card>
          <CardHeader>
            <CardTitle>{t('admin.tickets.table_ticket_list')}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('admin.tickets.table_ticket_number')}</TableHead>
                  <TableHead>{t('admin.tickets.table_user')}</TableHead>
                  <TableHead>{t('admin.tickets.table_scale')}</TableHead>
                  <TableHead>{t('admin.tickets.table_copyright_holder')}</TableHead>
                  <TableHead>{t('admin.tickets.table_status')}</TableHead>
                  <TableHead>{t('admin.tickets.table_priority')}</TableHead>
                  <TableHead>{t('admin.tickets.table_created_at')}</TableHead>
                  <TableHead>{t('admin.tickets.table_actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets.length > 0 ? tickets.map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell className="font-mono text-sm">
                      {ticket.ticketNumber}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{ticket.userName}</div>
                        <div className="text-sm text-muted-foreground">{ticket.userEmail}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{ticket.scaleAcronym}</div>
                        <div className="text-sm text-muted-foreground max-w-xs truncate">{ticket.scaleName}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium max-w-xs truncate">{ticket.copyrightOrganization}</div>
                        <div className="text-sm text-muted-foreground">{ticket.copyrightEmail}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(ticket.status)}>
                        {getStatusIcon(ticket.status)}
                        <span className="ml-1">{getStatusLabel(ticket.status)}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getPriorityColor(ticket.priority)}>
                        {getPriorityLabel(ticket.priority)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{format(new Date(ticket.createdAt), "MM/dd/yyyy")}</div>
                        <div className="text-muted-foreground">{t('admin.tickets.days_ago', { days: ticket.daysSinceCreated })}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => router.push(`/admin/tickets/${ticket.id}`)}
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          {t('admin.tickets.button_view')}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openUpdateDialog(ticket)}
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          {t('admin.tickets.button_update')}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      {t('admin.tickets.no_tickets')}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {/* 分页 */}
            <div className="flex items-center justify-between mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                {t('admin.tickets.pagination_previous')}
              </Button>
              <span className="text-sm text-muted-foreground">
                {t('admin.tickets.pagination_page', { page })}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={!hasMore}
              >
                {t('admin.tickets.pagination_next')}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 更新工单对话框 */}
        <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{t('admin.tickets.update_dialog_title')}</DialogTitle>
              <DialogDescription>
                {t('admin.tickets.update_dialog_description', { ticketNumber: selectedTicket?.ticketNumber, subject: selectedTicket?.subject })}
              </DialogDescription>
            </DialogHeader>

            {selectedTicket && (
              <div className="space-y-4">
                {/* 工单基本信息 */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">{t('admin.tickets.label_user')}</span>
                      <p className="text-muted-foreground">{selectedTicket.userName} ({selectedTicket.userEmail})</p>
                    </div>
                    <div>
                      <span className="font-medium">{t('admin.tickets.label_scale')}</span>
                      <p className="text-muted-foreground">{selectedTicket.scaleAcronym} - {selectedTicket.scaleName}</p>
                    </div>
                    <div>
                      <span className="font-medium">{t('admin.tickets.label_copyright_holder')}</span>
                      <p className="text-muted-foreground">{selectedTicket.copyrightOrganization}</p>
                    </div>
                    <div>
                      <span className="font-medium">{t('admin.tickets.label_intended_use')}</span>
                      <p className="text-muted-foreground">{selectedTicket.intendedUse}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <Label>{t('admin.tickets.label_update_status')}</Label>
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
                    placeholder={t('admin.progress_notes_placeholder')}
                    rows={3}
                  />
                </div>

                <div>
                  <Label>{t('admin.tickets.label_response_message')}</Label>
                  <Textarea
                    value={updateForm.responseMessage}
                    onChange={(e) => setUpdateForm({ ...updateForm, responseMessage: e.target.value })}
                    placeholder={t('admin.user_message_placeholder')}
                    rows={3}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setUpdateDialogOpen(false)}>
                    {t('admin.tickets.button_cancel')}
                  </Button>
                  <Button
                    onClick={() => updateTicketStatus(selectedTicket.id, updateForm.status, updateForm.adminNotes)}
                  >
                    {t('admin.tickets.button_update_ticket')}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}