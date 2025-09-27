'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search,
  HelpCircle,
  Book,
  MessageSquare,
  Mail,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Info,
  FileText,
  Users,
  Settings,
  CreditCard
} from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import Link from 'next/link';

interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  tags: string[];
  helpful: boolean;
}

const FAQ_DATA: FAQItem[] = [
  // 基础使用
  {
    id: 'basic_001',
    category: '基础使用',
    question: '什么是xCOA平台？',
    answer: 'xCOA是一个专业的电子化临床结局评估(eCOA)量表平台，提供量表搜索、预览、版权管理、临床案例等服务。平台旨在为临床研究者、医疗专业人士和制药企业提供标准化的量表解决方案。',
    tags: ['基础', '平台介绍'],
    helpful: true
  },
  {
    id: 'basic_002',
    category: '基础使用',
    question: '如何搜索量表？',
    answer: '您可以通过多种方式搜索量表：1) 在搜索框中输入量表名称、缩写或关键词；2) 使用分类筛选功能；3) 通过高级筛选设置条件。我们支持中英文搜索，并提供智能搜索建议。',
    tags: ['搜索', '使用指南'],
    helpful: true
  },
  {
    id: 'basic_003',
    category: '基础使用',
    question: '交互式预览功能如何使用？',
    answer: '在量表详情页面点击"预览"按钮，然后选择"开始交互式体验"。您可以逐题填写量表，系统会实时计分并提供专业的结果解读。支持Desktop、Tablet、Mobile三种设备模式。',
    tags: ['预览', '交互', '设备适配'],
    helpful: true
  },

  // 收藏功能
  {
    id: 'favorites_001',
    category: '收藏功能',
    question: '如何收藏量表？',
    answer: '在任何量表页面点击红色的❤️按钮即可收藏。您可以在量表详情页、搜索结果页面、热门量表等位置找到收藏按钮。收藏后可以在"我的收藏"页面统一管理。',
    tags: ['收藏', '个人管理'],
    helpful: true
  },
  {
    id: 'favorites_002',
    category: '收藏功能',
    question: '收藏的量表在哪里查看？',
    answer: '访问侧边栏的"我的收藏"或直接访问/scales/favorites页面。您可以搜索、筛选收藏的量表，也可以添加个人笔记。',
    tags: ['收藏', '管理'],
    helpful: true
  },

  // 版权许可
  {
    id: 'copyright_001',
    category: '版权许可',
    question: '如何申请量表使用许可？',
    answer: '1) 访问量表详情页面；2) 点击"查看版权信息"；3) 填写许可申请表单；4) 提交后系统会生成专业邮件模板；5) 直接发送给版权方。我们会跟踪申请状态并提供支持。',
    tags: ['版权', '许可申请'],
    helpful: true
  },
  {
    id: 'copyright_002',
    category: '版权许可',
    question: '版权申请需要多长时间？',
    answer: '通常版权方会在1-5个工作日内回复。复杂的商业许可可能需要2-4周。您可以在"我的工单"页面跟踪申请状态。我们建议在申请中详细说明使用目的和项目背景。',
    tags: ['版权', '时间', '工单'],
    helpful: true
  },
  {
    id: 'copyright_003',
    category: '版权许可',
    question: '学术研究使用是否需要付费？',
    answer: '大多数量表对学术研究提供免费或优惠许可。但具体政策因量表而异，建议通过我们的平台联系版权方确认。我们的工单系统可以帮助您获得准确的许可信息。',
    tags: ['版权', '学术研究', '费用'],
    helpful: true
  },

  // 技术支持
  {
    id: 'tech_001',
    category: '技术支持',
    question: '忘记密码怎么办？',
    answer: '在登录页面点击"忘记密码"链接，输入您的邮箱地址，我们会发送重置链接到您的邮箱。如果没有收到邮件，请检查垃圾邮件文件夹或联系客服。',
    tags: ['账户', '密码重置'],
    helpful: true
  },
  {
    id: 'tech_002',
    category: '技术支持',
    question: '如何更改个人信息？',
    answer: '点击右上角的用户头像，选择"个人资料"进入设置页面。您可以修改姓名、邮箱、机构信息等。部分信息修改可能需要邮箱验证。',
    tags: ['个人资料', '设置'],
    helpful: true
  },
  {
    id: 'tech_003',
    category: '技术支持',
    question: '交互式预览无法显示题目怎么办？',
    answer: '这可能是因为该量表的题目数据还未完善。您可以：1) 刷新页面重试；2) 联系客服报告问题；3) 查看量表的基础预览信息。我们正在持续完善量表题目数据。',
    tags: ['预览', '技术问题'],
    helpful: true
  },

  // 账户和积分
  {
    id: 'account_001',
    category: '账户和积分',
    question: '积分有什么用？',
    answer: '积分用于：1) 申请版权许可联系服务；2) 下载量表完整版本；3) 访问高级功能和专业内容。不同类型的服务消耗不同数量的积分。',
    tags: ['积分', '付费服务'],
    helpful: true
  },
  {
    id: 'account_002',
    category: '账户和积分',
    question: '如何获得更多积分？',
    answer: '您可以通过：1) 购买积分充值包；2) 参与平台活动；3) 推荐新用户注册；4) 贡献量表信息或案例。具体积分获取方式请查看积分管理页面。',
    tags: ['积分', '充值'],
    helpful: true
  },

  // 团队协作
  {
    id: 'team_001',
    category: '团队协作',
    question: '如何邀请团队成员？',
    answer: '在团队管理页面点击"邀请成员"，输入成员邮箱地址。被邀请人会收到邮件邀请，接受后即可加入团队。您可以设置不同的权限级别。',
    tags: ['团队', '邀请'],
    helpful: true
  },
  {
    id: 'team_002',
    category: '团队协作',
    question: '团队成员可以共享收藏吗？',
    answer: '是的，团队成员可以共享收藏的量表和研究资料。在收藏管理页面可以设置分享权限，团队领导可以管理共享的收藏分类。',
    tags: ['团队', '收藏分享'],
    helpful: true
  }
];

export default function HelpPage() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // 获取所有分类
  const categories = ['all', ...Array.from(new Set(FAQ_DATA.map(item => item.category)))];

  // 筛选FAQ
  const filteredFAQ = FAQ_DATA.filter(item => {
    const matchesSearch = !searchQuery ||
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // 切换FAQ展开状态
  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  return (
    <div className="flex flex-col h-screen">
      <PageHeader
        items={[
          { href: "/help", label: "帮助中心" }
        ]}
      />

      <div className="flex-1 overflow-auto">
        <div className="flex flex-col gap-4 p-4">
          {/* 页面标题 */}
          <div className="text-center py-8">
            <h1 className="text-3xl font-bold flex items-center justify-center space-x-3 mb-4">
              <HelpCircle className="w-8 h-8 text-blue-600" />
              <span>xCOA 帮助中心</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              常见问题解答，使用指南，以及技术支持信息
            </p>
          </div>

          {/* 搜索框 */}
          <div className="max-w-2xl mx-auto w-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="搜索常见问题..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-base"
              />
            </div>
          </div>

          <Tabs defaultValue="faq" className="max-w-4xl mx-auto w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="faq">常见问题</TabsTrigger>
              <TabsTrigger value="guides">使用指南</TabsTrigger>
              <TabsTrigger value="contact">联系支持</TabsTrigger>
            </TabsList>

            <TabsContent value="faq" className="space-y-6">
              {/* 分类筛选 */}
              <div className="flex flex-wrap gap-2 justify-center">
                {categories.map(category => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category === 'all' ? '全部' : category}
                  </Button>
                ))}
              </div>

              {/* FAQ列表 */}
              <div className="space-y-4">
                {filteredFAQ.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-12">
                      <Search className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <h3 className="text-lg font-medium mb-2">没有找到相关问题</h3>
                      <p className="text-muted-foreground">
                        尝试使用不同的关键词或联系客服获取帮助
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  filteredFAQ.map((item) => (
                    <Card key={item.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="cursor-pointer" onClick={() => toggleExpanded(item.id)}>
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <Badge variant="outline" className="text-xs">
                                {item.category}
                              </Badge>
                            </div>
                            <CardTitle className="text-lg leading-tight">
                              {item.question}
                            </CardTitle>
                          </div>
                          <div className="flex items-center space-x-2">
                            {expandedItems.has(item.id) ? (
                              <ChevronDown className="w-4 h-4 text-gray-500" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-gray-500" />
                            )}
                          </div>
                        </div>
                      </CardHeader>

                      {expandedItems.has(item.id) && (
                        <CardContent>
                          <div className="space-y-3">
                            <p className="text-muted-foreground leading-relaxed">
                              {item.answer}
                            </p>

                            <div className="flex flex-wrap gap-1">
                              {item.tags.map((tag, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t">
                              <span className="text-sm text-muted-foreground">这个回答是否有帮助？</span>
                              <div className="flex space-x-2">
                                <Button size="sm" variant="outline">
                                  👍 有帮助
                                </Button>
                                <Button size="sm" variant="outline">
                                  👎 没帮助
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="guides" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Book className="w-5 h-5 text-blue-600" />
                      <span>快速入门指南</span>
                    </CardTitle>
                    <CardDescription>
                      了解xCOA平台的基本功能和使用方法
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                        <span>注册账户和完善个人信息</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                        <span>搜索和浏览量表库</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                        <span>使用交互式预览功能</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                        <span>收藏和管理常用量表</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <FileText className="w-5 h-5 text-green-600" />
                      <span>版权申请指南</span>
                    </CardTitle>
                    <CardDescription>
                      学习如何正确申请和获得量表使用许可
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start space-x-2">
                        <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5" />
                        <span>了解不同量表的许可要求</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5" />
                        <span>准备详细的项目描述</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5" />
                        <span>填写专业的许可申请表单</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5" />
                        <span>跟踪申请状态和及时跟进</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Users className="w-5 h-5 text-purple-600" />
                      <span>团队协作指南</span>
                    </CardTitle>
                    <CardDescription>
                      了解如何在团队中使用xCOA平台
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start space-x-2">
                        <Info className="w-4 h-4 text-purple-600 mt-0.5" />
                        <span>创建和管理团队</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <Info className="w-4 h-4 text-purple-600 mt-0.5" />
                        <span>邀请团队成员</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <Info className="w-4 h-4 text-purple-600 mt-0.5" />
                        <span>共享收藏和资源</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <Info className="w-4 h-4 text-purple-600 mt-0.5" />
                        <span>管理团队权限</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <CreditCard className="w-5 h-5 text-orange-600" />
                      <span>积分和付费</span>
                    </CardTitle>
                    <CardDescription>
                      了解积分系统和付费服务
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-orange-600 mt-0.5" />
                        <span>积分获取和使用方式</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-orange-600 mt-0.5" />
                        <span>付费服务说明</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-orange-600 mt-0.5" />
                        <span>发票和报销</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-orange-600 mt-0.5" />
                        <span>退费政策</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="contact" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Mail className="w-5 h-5 text-blue-600" />
                      <span>邮件支持</span>
                    </CardTitle>
                    <CardDescription>
                      发送邮件获取详细帮助
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <span className="font-medium text-sm">客服邮箱:</span>
                        <p className="text-blue-600">support@xcoa.pro</p>
                      </div>
                      <div>
                        <span className="font-medium text-sm">商务合作:</span>
                        <p className="text-blue-600">business@xcoa.pro</p>
                      </div>
                      <div>
                        <span className="font-medium text-sm">技术支持:</span>
                        <p className="text-blue-600">tech@xcoa.pro</p>
                      </div>
                      <Button className="w-full">
                        <Mail className="w-4 h-4 mr-2" />
                        发送邮件
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <MessageSquare className="w-5 h-5 text-green-600" />
                      <span>在线咨询</span>
                    </CardTitle>
                    <CardDescription>
                      实时在线客服支持
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <span className="font-medium text-sm">服务时间:</span>
                        <p className="text-muted-foreground">工作日 9:00-18:00</p>
                      </div>
                      <div>
                        <span className="font-medium text-sm">响应时间:</span>
                        <p className="text-muted-foreground">通常在1小时内回复</p>
                      </div>
                      <div>
                        <span className="font-medium text-sm">支持语言:</span>
                        <p className="text-muted-foreground">中文、英文</p>
                      </div>
                      <Button className="w-full" variant="outline">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        开始在线咨询
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* 其他资源 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <Book className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                    <h4 className="font-medium mb-1">用户手册</h4>
                    <p className="text-xs text-muted-foreground mb-3">
                      详细的平台使用说明
                    </p>
                    <Button size="sm" variant="outline" className="w-full">
                      <ExternalLink className="w-3 h-3 mr-1" />
                      下载手册
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-green-600" />
                    <h4 className="font-medium mb-1">API文档</h4>
                    <p className="text-xs text-muted-foreground mb-3">
                      开发者技术文档
                    </p>
                    <Button size="sm" variant="outline" className="w-full">
                      <ExternalLink className="w-3 h-3 mr-1" />
                      查看文档
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                    <h4 className="font-medium mb-1">社区论坛</h4>
                    <p className="text-xs text-muted-foreground mb-3">
                      用户交流和讨论
                    </p>
                    <Button size="sm" variant="outline" className="w-full">
                      <ExternalLink className="w-3 h-3 mr-1" />
                      访问论坛
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}