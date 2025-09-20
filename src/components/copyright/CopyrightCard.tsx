'use client';

import { useState } from 'react';
import { 
  Shield, 
  Mail, 
  Phone, 
  Globe, 
  Building, 
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  FileText,
  ExternalLink,
  Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CopyrightInfo {
  scale: {
    id: string;
    name: string;
    acronym: string;
  };
  copyright: {
    info: string;
    contact: {
      organization: string;
      email?: string;
      phone?: string;
      website?: string;
      fax?: string;
    } | null;
    license: {
      type: string;
      title: string;
      description: string;
      canUseDirectly: boolean;
      requiresContact: boolean;
      typicalCost: string;
      restrictions: string[];
      icon: string;
      color: string;
    };
  };
  actions: {
    canUseDirectly: boolean;
    requiresContact: boolean;
    availableActions: string[];
  };
}

interface CopyrightCardProps {
  scaleId: string;
  initialData?: CopyrightInfo;
}

export function CopyrightCard({ scaleId, initialData }: CopyrightCardProps) {
  const [copyrightInfo, setCopyrightInfo] = useState<CopyrightInfo | null>(initialData || null);
  const [loading, setLoading] = useState(false);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [contactForm, setContactForm] = useState({
    requestType: 'license_inquiry',
    intendedUse: 'research',
    organizationName: '',
    organizationType: 'university',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    message: '',
    urgency: 'medium',
  });

  // 获取版权信息
  const fetchCopyrightInfo = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/scales/${scaleId}/copyright`);
      const data = await response.json();
      
      if (response.ok) {
        setCopyrightInfo(data);
      } else {
        console.error('Failed to fetch copyright info:', data.error);
      }
    } catch (error) {
      console.error('Error fetching copyright info:', error);
    } finally {
      setLoading(false);
    }
  };

  // 提交联系请求
  const handleContactSubmit = async () => {
    try {
      const response = await fetch(`/api/scales/${scaleId}/copyright`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...contactForm, scaleId }),
      });
      
      const result = await response.json();
      
      if (response.ok) {
        // 可以在这里显示成功消息或打开邮件客户端
        const emailTemplate = result.contactRequest.emailTemplate;
        const mailtoUrl = `mailto:${result.contactRequest.copyrightHolder.email}?subject=${encodeURIComponent(emailTemplate.subject)}&body=${encodeURIComponent(emailTemplate.body)}`;
        
        window.open(mailtoUrl, '_blank');
        setContactDialogOpen(false);
      } else {
        alert(`联系请求失败: ${result.error}`);
      }
    } catch (error) {
      console.error('Error submitting contact request:', error);
      alert('提交联系请求时发生错误');
    }
  };

  // 获取许可类型颜色样式
  const getLicenseColorClass = (color: string) => {
    const colorMap = {
      green: 'bg-green-50 text-green-700 border-green-200',
      blue: 'bg-blue-50 text-blue-700 border-blue-200',
      yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      orange: 'bg-orange-50 text-orange-700 border-orange-200',
      red: 'bg-red-50 text-red-700 border-red-200',
      gray: 'bg-gray-50 text-gray-700 border-gray-200',
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.gray;
  };

  if (!copyrightInfo && !loading) {
    fetchCopyrightInfo();
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
            <span className="text-sm text-muted-foreground">加载版权信息...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!copyrightInfo) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <AlertCircle className="w-8 h-8 mx-auto mb-2" />
            <p>无法获取版权信息</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { copyright, actions } = copyrightInfo;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Shield className="w-5 h-5" />
          <span>版权和许可信息</span>
        </CardTitle>
        <CardDescription>
          {copyrightInfo.scale.name} ({copyrightInfo.scale.acronym}) 的使用许可详情
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* 许可类型标识 */}
        <div className={`p-3 rounded-lg border ${getLicenseColorClass(copyright.license.color)}`}>
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{copyright.license.icon}</span>
            <div>
              <h4 className="font-semibold">{copyright.license.title}</h4>
              <p className="text-sm opacity-80">{copyright.license.description}</p>
            </div>
          </div>
        </div>

        {/* 使用权限状态 */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center space-x-2">
            {actions.canUseDirectly ? (
              <CheckCircle className="w-4 h-4 text-green-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-orange-600" />
            )}
            <span className="text-sm">
              {actions.canUseDirectly ? '可直接使用' : '需要许可'}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <DollarSign className="w-4 h-4 text-blue-600" />
            <span className="text-sm">
              {copyright.license.typicalCost === 'FREE' ? '免费' : 
               copyright.license.typicalCost === 'PAID' ? '付费' : '咨询定价'}
            </span>
          </div>
        </div>

        {/* 使用限制 */}
        {copyright.license.restrictions.length > 0 && (
          <div>
            <h5 className="font-medium mb-2 flex items-center">
              <FileText className="w-4 h-4 mr-2" />
              使用限制
            </h5>
            <ul className="text-sm space-y-1 text-muted-foreground">
              {copyright.license.restrictions.map((restriction, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-orange-500 mr-2">•</span>
                  {restriction}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 版权信息 */}
        <div>
          <h5 className="font-medium mb-2">版权声明</h5>
          <p className="text-sm text-muted-foreground bg-gray-50 p-3 rounded">
            {copyright.info}
          </p>
        </div>

        {/* 联系信息 */}
        {copyright.contact && (
          <div>
            <h5 className="font-medium mb-2 flex items-center">
              <Building className="w-4 h-4 mr-2" />
              版权方联系信息
            </h5>
            <div className="space-y-2">
              <div className="text-sm">
                <span className="font-medium">{copyright.contact.organization}</span>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {copyright.contact.email && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={`mailto:${copyright.contact.email}`}>
                      <Mail className="w-3 h-3 mr-1" />
                      邮箱联系
                    </a>
                  </Button>
                )}
                
                {copyright.contact.phone && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={`tel:${copyright.contact.phone}`}>
                      <Phone className="w-3 h-3 mr-1" />
                      电话联系
                    </a>
                  </Button>
                )}
                
                {copyright.contact.website && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={copyright.contact.website} target="_blank" rel="noopener noreferrer">
                      <Globe className="w-3 h-3 mr-1" />
                      官方网站
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        <Separator />

        {/* 行动按钮 */}
        <div className="flex flex-col space-y-2">
          {actions.canUseDirectly ? (
            <Button className="w-full" variant="default">
              <CheckCircle className="w-4 h-4 mr-2" />
              可以开始使用
            </Button>
          ) : (
            <Dialog open={contactDialogOpen} onOpenChange={setContactDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full" variant="default">
                  <Send className="w-4 h-4 mr-2" />
                  联系版权方
                </Button>
              </DialogTrigger>
              
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>联系版权方</DialogTitle>
                  <DialogDescription>
                    为 {copyrightInfo.scale.name} ({copyrightInfo.scale.acronym}) 申请使用许可
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>请求类型</Label>
                      <Select value={contactForm.requestType} onValueChange={(value) => 
                        setContactForm(prev => ({ ...prev, requestType: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="license_inquiry">许可咨询</SelectItem>
                          <SelectItem value="usage_request">使用申请</SelectItem>
                          <SelectItem value="pricing_info">价格咨询</SelectItem>
                          <SelectItem value="support">技术支持</SelectItem>
                          <SelectItem value="other">其他</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>预期用途</Label>
                      <Select value={contactForm.intendedUse} onValueChange={(value) => 
                        setContactForm(prev => ({ ...prev, intendedUse: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="clinical">临床使用</SelectItem>
                          <SelectItem value="research">科研用途</SelectItem>
                          <SelectItem value="education">教育培训</SelectItem>
                          <SelectItem value="commercial">商业用途</SelectItem>
                          <SelectItem value="personal">个人使用</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>机构名称</Label>
                      <Input 
                        value={contactForm.organizationName}
                        onChange={(e) => setContactForm(prev => ({ ...prev, organizationName: e.target.value }))}
                        placeholder="您的机构名称"
                      />
                    </div>
                    
                    <div>
                      <Label>机构类型</Label>
                      <Select value={contactForm.organizationType} onValueChange={(value) => 
                        setContactForm(prev => ({ ...prev, organizationType: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hospital">医院</SelectItem>
                          <SelectItem value="clinic">诊所</SelectItem>
                          <SelectItem value="university">大学</SelectItem>
                          <SelectItem value="research_institute">研究机构</SelectItem>
                          <SelectItem value="pharmaceutical">制药公司</SelectItem>
                          <SelectItem value="individual">个人</SelectItem>
                          <SelectItem value="other">其他</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>联系人姓名 *</Label>
                      <Input 
                        value={contactForm.contactName}
                        onChange={(e) => setContactForm(prev => ({ ...prev, contactName: e.target.value }))}
                        placeholder="您的姓名"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label>联系邮箱 *</Label>
                      <Input 
                        type="email"
                        value={contactForm.contactEmail}
                        onChange={(e) => setContactForm(prev => ({ ...prev, contactEmail: e.target.value }))}
                        placeholder="your.email@example.com"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label>联系电话 (可选)</Label>
                    <Input 
                      value={contactForm.contactPhone}
                      onChange={(e) => setContactForm(prev => ({ ...prev, contactPhone: e.target.value }))}
                      placeholder="+86 138 0000 0000"
                    />
                  </div>
                  
                  <div>
                    <Label>详细说明</Label>
                    <Textarea 
                      value={contactForm.message}
                      onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="请详细说明您的使用需求、项目背景和其他相关信息..."
                      className="min-h-[100px]"
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setContactDialogOpen(false)}>
                      取消
                    </Button>
                    <Button 
                      onClick={handleContactSubmit}
                      disabled={!contactForm.contactName || !contactForm.contactEmail}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      发送联系请求
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
          
          <Button variant="outline" className="w-full">
            <FileText className="w-4 h-4 mr-2" />
            查看完整许可条款
          </Button>
        </div>

        {/* 使用指导 */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h5 className="font-medium mb-2 text-blue-900">使用指导</h5>
          <p className="text-sm text-blue-800">
            {copyright.license.usageGuidelines || copyright.license.description}
          </p>
          
          {actions.requiresContact && (
            <div className="mt-2 flex items-center text-sm text-blue-700">
              <Clock className="w-3 h-3 mr-1" />
              <span>预计回复时间: 1-5个工作日</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}