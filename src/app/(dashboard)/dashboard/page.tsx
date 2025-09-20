import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Search, 
  Shield, 
  BookOpen, 
  MessageSquare, 
  TrendingUp,
  Users,
  CreditCard,
  BarChart3,
  ArrowRight
} from "lucide-react"
import Link from "next/link"

export default function Page() {
  return (
    <>
      <PageHeader
        items={[
          {
            href: "/dashboard",
            label: "Dashboard"
          }
        ]}
      />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        {/* 欢迎区域 */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-xl">欢迎使用 xCOA 版权授权平台 🎉</CardTitle>
            <CardDescription className="text-lg">
              专业的 eCOA 量表 AI 搜索和版权许可服务平台
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">15+ 专业量表</Badge>
              <Badge variant="secondary">8种搜索算法</Badge>
              <Badge variant="secondary">AI 智能解读</Badge>
              <Badge variant="secondary">版权合规保障</Badge>
            </div>
          </CardContent>
        </Card>

        {/* 核心功能快速入口 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/dashboard/scales">
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardContent className="p-6 text-center">
                <Search className="w-12 h-12 mx-auto mb-3 text-blue-600" />
                <h3 className="font-semibold mb-2">量表搜索</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  AI 智能搜索 15+ 专业 eCOA 量表
                </p>
                <div className="flex items-center justify-center text-sm text-blue-600">
                  开始搜索 <ArrowRight className="w-3 h-3 ml-1" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/copyright">
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardContent className="p-6 text-center">
                <Shield className="w-12 h-12 mx-auto mb-3 text-green-600" />
                <h3 className="font-semibold mb-2">版权服务</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  检查许可状态，联系版权方
                </p>
                <div className="flex items-center justify-center text-sm text-green-600">
                  查看许可 <ArrowRight className="w-3 h-3 ml-1" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/interpretation">
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardContent className="p-6 text-center">
                <BookOpen className="w-12 h-12 mx-auto mb-3 text-purple-600" />
                <h3 className="font-semibold mb-2">量表解读</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  专业的使用指南和结果解读
                </p>
                <div className="flex items-center justify-center text-sm text-purple-600">
                  查看指南 <ArrowRight className="w-3 h-3 ml-1" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/copyright/tickets">
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardContent className="p-6 text-center">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 text-orange-600" />
                <h3 className="font-semibold mb-2">联系工单</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  跟踪版权联系和授权进度
                </p>
                <div className="flex items-center justify-center text-sm text-orange-600">
                  我的工单 <ArrowRight className="w-3 h-3 ml-1" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* 统计概览 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">总量表数</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">15</div>
              <p className="text-xs text-muted-foreground">
                覆盖 5 个主要临床领域
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">免费量表</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2</div>
              <p className="text-xs text-muted-foreground">
                公共领域，可直接使用
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">响应时间</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">&lt;500ms</div>
              <p className="text-xs text-muted-foreground">
                平均 API 响应时间
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 最近活动和热门量表 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>热门量表</CardTitle>
              <CardDescription>最常搜索的评估工具</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { acronym: 'PHQ-9', name: '患者健康问卷-9', usage: 125, license: '📧' },
                  { acronym: 'GAD-7', name: '广泛性焦虑障碍-7', usage: 89, license: '📧' },
                  { acronym: 'HAM-D', name: '汉密尔顿抑郁量表', usage: 76, license: '🆓' },
                  { acronym: 'MoCA', name: '蒙特利尔认知评估', usage: 54, license: '🎓' },
                  { acronym: 'BDI-II', name: '贝克抑郁量表-II', usage: 43, license: '💼' },
                ].map((scale, index) => (
                  <div key={scale.acronym} className="flex items-center justify-between p-2 rounded hover:bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{scale.license}</span>
                      <div>
                        <div className="font-medium text-sm">{scale.acronym}</div>
                        <div className="text-xs text-muted-foreground">{scale.name}</div>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {scale.usage} 次使用
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>平台统计</CardTitle>
              <CardDescription>系统使用概览</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded">
                    <div className="text-lg font-semibold text-blue-600">8</div>
                    <div className="text-xs text-blue-600">搜索算法</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded">
                    <div className="text-lg font-semibold text-green-600">95%+</div>
                    <div className="text-xs text-green-600">搜索准确率</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded">
                    <div className="text-lg font-semibold text-purple-600">17</div>
                    <div className="text-xs text-purple-600">API 接口</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded">
                    <div className="text-lg font-semibold text-orange-600">6</div>
                    <div className="text-xs text-orange-600">许可类型</div>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <h4 className="font-medium text-sm mb-2">功能覆盖</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span>AI 搜索引擎</span>
                      <Badge variant="default" className="text-xs">完整</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>版权管理系统</span>
                      <Badge variant="default" className="text-xs">完整</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>量表解读服务</span>
                      <Badge variant="default" className="text-xs">完整</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>工单管理系统</span>
                      <Badge variant="secondary" className="text-xs">开发中</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 快速操作 */}
        <Card>
          <CardHeader>
            <CardTitle>快速操作</CardTitle>
            <CardDescription>常用功能快速入口</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Link href="/dashboard/scales">
                <Button variant="outline" className="w-full justify-start">
                  <Search className="w-4 h-4 mr-2" />
                  搜索量表
                </Button>
              </Link>
              
              <Link href="/dashboard/copyright">
                <Button variant="outline" className="w-full justify-start">
                  <Shield className="w-4 h-4 mr-2" />
                  检查许可
                </Button>
              </Link>
              
              <Link href="/dashboard/interpretation">
                <Button variant="outline" className="w-full justify-start">
                  <BookOpen className="w-4 h-4 mr-2" />
                  量表解读
                </Button>
              </Link>
              
              <Link href="/dashboard/billing">
                <Button variant="outline" className="w-full justify-start">
                  <CreditCard className="w-4 h-4 mr-2" />
                  积分管理
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
