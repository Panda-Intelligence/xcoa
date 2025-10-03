"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Mail,
  Phone,
  Globe,
  User,
  Building
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

  useEffect(() => {
    fetchTickets();
  }, [statusFilter, priorityFilter, page]);

  const fetchTickets = async () => {
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
        console.error("加载版权工单失败:", data.error);
      }
    } catch (error) {
      console.error("加载版权工单失败:", error);
    } finally {
      setLoading(false);
    }
  };

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
        toast.success("工单状态更新成功！");
      } else {
        toast.error(data.error || "更新工单状态失败");
      }
    } catch (error) {
      console.error("更新工单状态错误:", error);
      toast.error("网络错误，请稍后重试");
    }
  };

  const deleteTicket = async (ticketId: string) => {
    const confirmed = await toast.confirm("确定要删除这个版权工单吗？此操作不可逆转。");
    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/copyright-tickets/${ticketId}`, {
        method: "DELETE"
      });

      const data = await response.json();

      if (response.ok) {
        fetchTickets();
        toast.success("工单删除成功！");
      } else {
        toast.error(data.error || "删除工单失败");
      }
    } catch (error) {
      console.error("删除工单错误:", error);
      toast.error("网络错误，请稍后重试");
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
      open: "待处理",
      in_progress: "处理中",
      waiting_response: "等待回复",
      resolved: "已解决",
      closed: "已关闭"
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

  const getPriorityLabel = (priority: string) => {
    const labels = {
      low: "低",
      medium: "中等",
      high: "高",
      urgent: "紧急"
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
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">加载中...</p>
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
            label: "版权工单管理"
          }
        ]}
      />
      <div className="flex flex-1 flex-col gap-4 p-4">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center space-x-2">
              <Shield className="w-6 h-6 text-blue-600" />
              <span>版权工单管理</span>
            </h1>
            <p className="text-muted-foreground">
              管理所有用户的版权许可申请，协助处理版权方联系和授权
            </p>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-muted-foreground">总工单数</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.open}</div>
              <div className="text-sm text-muted-foreground">待处理</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.in_progress}</div>
              <div className="text-sm text-muted-foreground">处理中</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.waiting_response}</div>
              <div className="text-sm text-muted-foreground">等待回复</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
              <div className="text-sm text-muted-foreground">已解决</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-600">{stats.closed}</div>
              <div className="text-sm text-muted-foreground">已关闭</div>
            </CardContent>
          </Card>
        </div>

        {/* 搜索和筛选 */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder={t('admin.search_tickets_placeholder')}
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
                <SelectItem value="open">待处理</SelectItem>
                <SelectItem value="in_progress">处理中</SelectItem>
                <SelectItem value="waiting_response">等待回复</SelectItem>
                <SelectItem value="resolved">已解决</SelectItem>
                <SelectItem value="closed">已关闭</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有优先级</SelectItem>
                <SelectItem value="urgent">紧急</SelectItem>
                <SelectItem value="high">高</SelectItem>
                <SelectItem value="medium">中等</SelectItem>
                <SelectItem value="low">低</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={fetchTickets}>搜索</Button>
        </div>

        {/* 工单列表 */}
        <Card>
          <CardHeader>
            <CardTitle>版权工单列表</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>工单号</TableHead>
                  <TableHead>用户</TableHead>
                  <TableHead>量表</TableHead>
                  <TableHead>版权方</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>优先级</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead>操作</TableHead>
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
                        <div className="text-muted-foreground">{ticket.daysSinceCreated}天前</div>
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
                          查看
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openUpdateDialog(ticket)}
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          更新
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      暂无版权工单记录
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
                上一页
              </Button>
              <span className="text-sm text-muted-foreground">
                第 {page} 页
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={!hasMore}
              >
                下一页
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 更新工单对话框 */}
        <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>更新工单状态</DialogTitle>
              <DialogDescription>
                工单 #{selectedTicket?.ticketNumber} - {selectedTicket?.subject}
              </DialogDescription>
            </DialogHeader>

            {selectedTicket && (
              <div className="space-y-4">
                {/* 工单基本信息 */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">用户:</span>
                      <p className="text-muted-foreground">{selectedTicket.userName} ({selectedTicket.userEmail})</p>
                    </div>
                    <div>
                      <span className="font-medium">量表:</span>
                      <p className="text-muted-foreground">{selectedTicket.scaleAcronym} - {selectedTicket.scaleName}</p>
                    </div>
                    <div>
                      <span className="font-medium">版权方:</span>
                      <p className="text-muted-foreground">{selectedTicket.copyrightOrganization}</p>
                    </div>
                    <div>
                      <span className="font-medium">预期用途:</span>
                      <p className="text-muted-foreground">{selectedTicket.intendedUse}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <Label>更新状态</Label>
                  <Select value={updateForm.status} onValueChange={(value) =>
                    setUpdateForm({ ...updateForm, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">待处理</SelectItem>
                      <SelectItem value="in_progress">处理中</SelectItem>
                      <SelectItem value="waiting_response">等待回复</SelectItem>
                      <SelectItem value="resolved">已解决</SelectItem>
                      <SelectItem value="closed">已关闭</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>管理员备注</Label>
                  <Textarea
                    value={updateForm.adminNotes}
                    onChange={(e) => setUpdateForm({ ...updateForm, adminNotes: e.target.value })}
                    placeholder={t('admin.progress_notes_placeholder')}
                    rows={3}
                  />
                </div>

                <div>
                  <Label>给用户的回复消息 (可选)</Label>
                  <Textarea
                    value={updateForm.responseMessage}
                    onChange={(e) => setUpdateForm({ ...updateForm, responseMessage: e.target.value })}
                    placeholder={t('admin.user_message_placeholder')}
                    rows={3}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setUpdateDialogOpen(false)}>
                    取消
                  </Button>
                  <Button
                    onClick={() => updateTicketStatus(selectedTicket.id, updateForm.status, updateForm.adminNotes)}
                  >
                    更新工单
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