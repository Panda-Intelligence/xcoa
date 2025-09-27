'use client'

import { useState, useEffect } from 'react';
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
import { useLanguage } from "@/hooks/useLanguage"

interface DashboardStats {
  totalScales: number;
  freeScales: number;
  apiEndpoints: number;
  avgResponseTime: string;
}

interface TopScale {
  id: string;
  name: string;
  acronym: string;
  usageCount: number;
  license: string;
}

export default function Page() {
  const { t } = useLanguage();
  const [stats, setStats] = useState<DashboardStats>({ totalScales: 0, freeScales: 0, apiEndpoints: 8, avgResponseTime: '~450ms' });
  const [topScales, setTopScales] = useState<TopScale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 获取dashboard统计数据
    fetch('/api/dashboard/stats')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStats(data.stats);
          setTopScales(data.topScales);
        }
      })
      .catch(err => console.error('Failed to load dashboard stats:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <PageHeader
        items={[
          {
            href: "/scales",
            label: t("common.dashboard")
          }
        ]}
      />
      <div className="flex flex-1 flex-col gap-4 p-4">
        {/* 欢迎区域 */}
        <Card className="bg-linear-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-xl">{t("site.welcome_title")} 🎉</CardTitle>
            <CardDescription className="text-lg">
              {t("site.welcome_description")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">15+ {t("dashboard.total_scales_desc")}</Badge>
              <Badge variant="secondary">8{t("dashboard.search_algorithms")}</Badge>
              <Badge variant="secondary">{t("dashboard.ai_search_engine")}</Badge>
              <Badge variant="secondary">{t("dashboard.copyright_management")}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* 核心功能快速入口 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/scales">
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardContent className="p-6 text-center">
                <Search className="w-12 h-12 mx-auto mb-3 text-blue-600" />
                <h3 className="font-semibold mb-2">{t("scales.search_title")}</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {t("scales.search_description")}
                </p>
                <div className="flex items-center justify-center text-sm text-blue-600">
                  {t("dashboard.search_scales")} <ArrowRight className="w-3 h-3 ml-1" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/scales/copyright">
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardContent className="p-6 text-center">
                <Shield className="w-12 h-12 mx-auto mb-3 text-green-600" />
                <h3 className="font-semibold mb-2">{t("copyright.service_title")}</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {t("copyright.batch_check_description")}
                </p>
                <div className="flex items-center justify-center text-sm text-green-600">
                  {t("dashboard.check_license")} <ArrowRight className="w-3 h-3 ml-1" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/insights/interpretation">
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardContent className="p-6 text-center">
                <BookOpen className="w-12 h-12 mx-auto mb-3 text-purple-600" />
                <h3 className="font-semibold mb-2">{t("dashboard.scale_guide")}</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {t("copyright.usage_guidelines")}
                </p>
                <div className="flex items-center justify-center text-sm text-purple-600">
                  {t("dashboard.scale_guide")} <ArrowRight className="w-3 h-3 ml-1" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/teams">
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardContent className="p-6 text-center">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 text-orange-600" />
                <h3 className="font-semibold mb-2">{t("navigation.tickets")}</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {t("copyright.contact_copyright_holder")}
                </p>
                <div className="flex items-center justify-center text-sm text-orange-600">
                  {t("navigation.my_tickets")} <ArrowRight className="w-3 h-3 ml-1" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* 统计概览 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("dashboard.total_scales")}</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? '...' : stats.totalScales}</div>
              <p className="text-xs text-muted-foreground">
                {t("dashboard.total_scales_desc")}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("dashboard.free_scales")}</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? '...' : stats.freeScales}</div>
              <p className="text-xs text-muted-foreground">
                {t("dashboard.free_scales_desc")}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("dashboard.response_time")}</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgResponseTime}</div>
              <p className="text-xs text-muted-foreground">
                {t("dashboard.response_time_desc")}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 最近活动和热门量表 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("scales.hot_scales")}</CardTitle>
              <CardDescription>{t("scales.hot_scales_description")}</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="flex items-center justify-between p-2 rounded animate-pulse">
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-gray-200 rounded"></div>
                        <div>
                          <div className="w-16 h-4 bg-gray-200 rounded mb-1"></div>
                          <div className="w-24 h-3 bg-gray-200 rounded"></div>
                        </div>
                      </div>
                      <div className="w-8 h-4 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {topScales.map((scale) => (
                    <Link key={scale.id} href={`/scales/${scale.id}`}>
                      <div className="flex items-center justify-between p-2 rounded hover:bg-gray-50 cursor-pointer transition-colors">
                        <div className="flex items-center space-x-3">
                          <span className="text-lg">{scale.license}</span>
                          <div>
                            <div className="font-medium text-sm">{scale.acronym}</div>
                            <div className="text-xs text-muted-foreground">{scale.name}</div>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {scale.usageCount} {t("scales.times_used")}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("dashboard.platform_stats")}</CardTitle>
              <CardDescription>{t("dashboard.system_overview")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded">
                    <div className="text-lg font-semibold text-blue-600">8</div>
                    <div className="text-xs text-blue-600">{t("dashboard.search_algorithms")}</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded">
                    <div className="text-lg font-semibold text-green-600">95%+</div>
                    <div className="text-xs text-green-600">{t("dashboard.search_accuracy")}</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded">
                    <div className="text-lg font-semibold text-purple-600">17</div>
                    <div className="text-xs text-purple-600">{t("dashboard.api_endpoints")}</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded">
                    <div className="text-lg font-semibold text-orange-600">6</div>
                    <div className="text-xs text-orange-600">{t("dashboard.license_types")}</div>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <h4 className="font-medium text-sm mb-2">{t("dashboard.feature_coverage")}</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span>{t("dashboard.ai_search_engine")}</span>
                      <Badge variant="default" className="text-xs">{t("dashboard.complete")}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>{t("dashboard.copyright_management")}</span>
                      <Badge variant="default" className="text-xs">{t("dashboard.complete")}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>{t("dashboard.interpretation_service")}</span>
                      <Badge variant="default" className="text-xs">{t("dashboard.complete")}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>{t("dashboard.ticket_system")}</span>
                      <Badge variant="secondary" className="text-xs">{t("dashboard.in_development")}</Badge>
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
            <CardTitle>{t("dashboard.quick_actions")}</CardTitle>
            <CardDescription>{t("dashboard.overview")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Link href="/scales">
                <Button variant="outline" className="w-full justify-start">
                  <Search className="w-4 h-4 mr-2" />
                  {t("dashboard.search_scales")}
                </Button>
              </Link>

              <Link href="/scales/copyright">
                <Button variant="outline" className="w-full justify-start">
                  <Shield className="w-4 h-4 mr-2" />
                  {t("dashboard.check_license")}
                </Button>
              </Link>

              <Link href="/insights/interpretation">
                <Button variant="outline" className="w-full justify-start">
                  <BookOpen className="w-4 h-4 mr-2" />
                  {t("dashboard.scale_guide")}
                </Button>
              </Link>

              <Link href="/billing">
                <Button variant="outline" className="w-full justify-start">
                  <CreditCard className="w-4 h-4 mr-2" />
                  {t("dashboard.credit_management")}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
