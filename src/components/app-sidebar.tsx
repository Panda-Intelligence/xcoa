"use client"

import { type ComponentType, useEffect, useState } from "react"
import type { Route } from 'next'

import {
  Building2,
  Settings2,
  SquareTerminal,
  CreditCard,
  Users,
  Search,
  FileText,
  Shield,
  MessageSquare,
  BookOpen,
  BarChart3,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
// import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import { LanguageSwitch } from "@/components/LanguageSwitch"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { useSessionStore } from "@/state/session"

export type NavItem = {
  title: string
  url: Route
  icon?: ComponentType
}

export type NavMainItem = NavItem & {
  isActive?: boolean
  items?: NavItem[]
}

type Data = {
  user: {
    name: string
    email: string
  }
  teams: {
    name: string
    logo: ComponentType
    plan: string
  }[]
  navMain: NavMainItem[]
  projects: NavItem[]
}

// TODO Add a theme switcher
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { session } = useSessionStore();
  const [formattedTeams, setFormattedTeams] = useState<Data['teams']>([]);

  // Map session teams to the format expected by TeamSwitcher
  useEffect(() => {
    if (session?.teams && session.teams.length > 0) {
      // Map teams from session to the format expected by TeamSwitcher
      const teamData = session.teams.map(team => {
        return {
          name: team.name,
          // TODO Get the actual logo when we implement team avatars
          logo: Building2,
          // Default plan - you might want to add plan data to your team structure
          plan: team.role.name || "Member"
        };
      });

      setFormattedTeams(teamData);
    }
  }, [session]);

  const data: Data = {
    user: {
      name: session?.user?.firstName || "User",
      email: session?.user?.email || "user@example.com",
    },
    teams: formattedTeams,
    navMain: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: SquareTerminal,
        isActive: true,
      },
      {
        title: "eCOA 量表",
        url: "/dashboard/scales" as Route,
        icon: Search,
        items: [
          {
            title: "量表搜索",
            url: "/dashboard/scales",
          },
          {
            title: "我的收藏",
            url: "/dashboard/scales/favorites",
          },
          {
            title: "搜索历史",
            url: "/dashboard/scales/history",
          },
          {
            title: "量表对比",
            url: "/dashboard/scales/compare",
          },
        ],
      },
      {
        title: "版权服务",
        url: "/dashboard/copyright" as Route,
        icon: Shield,
        items: [
          {
            title: "许可查询",
            url: "/dashboard/copyright",
          },
          {
            title: "联系工单",
            url: "/dashboard/copyright/tickets",
          },
          {
            title: "批量检查",
            url: "/dashboard/copyright/batch",
          },
        ],
      },
      {
        title: "量表解读",
        url: "/dashboard/interpretation" as Route,
        icon: BookOpen,
        items: [
          {
            title: "解读指南",
            url: "/dashboard/interpretation",
          },
          {
            title: "分数计算器",
            url: "/dashboard/interpretation/calculator",
          },
          {
            title: "临床案例",
            url: "/dashboard/interpretation/cases",
          },
        ],
      },
      {
        title: "团队管理",
        url: "/dashboard/teams" as Route,
        icon: Users,
        items: [
          {
            title: "团队概览",
            url: "/dashboard/teams",
          },
          {
            title: "成员管理",
            url: "/dashboard/teams/members",
          },
          {
            title: "团队设置",
            url: "/dashboard/teams/settings",
          },
        ],
      },
      {
        title: "积分管理",
        url: "/dashboard/billing",
        icon: CreditCard,
        items: [
          {
            title: "积分余额",
            url: "/dashboard/billing",
          },
          {
            title: "使用记录",
            url: "/dashboard/billing/usage",
          },
          {
            title: "购买积分",
            url: "/dashboard/billing/purchase",
          },
          {
            title: "团队定价",
            url: "/dashboard/billing/pricing",
          },
        ],
      },
      {
        title: "使用统计",
        url: "/dashboard/analytics" as Route,
        icon: BarChart3,
        items: [
          {
            title: "搜索分析",
            url: "/dashboard/analytics/search",
          },
          {
            title: "使用报告",
            url: "/dashboard/analytics/usage",
          },
          {
            title: "团队活动",
            url: "/dashboard/analytics/team",
          },
        ],
      },
      {
        title: "设置",
        url: "/settings",
        icon: Settings2,
        items: [
          {
            title: "个人资料",
            url: "/settings",
          },
          {
            title: "安全设置",
            url: "/settings/security",
          },
          {
            title: "会话管理",
            url: "/settings/sessions",
          },
          {
            title: "修改密码",
            url: "/forgot-password",
          },
        ],
      },
    ],
    projects: [
      {
        title: "快速搜索",
        url: "/dashboard/scales",
        icon: Search,
      },
      {
        title: "我的工单",
        url: "/dashboard/copyright/tickets",
        icon: MessageSquare,
      },
      {
        title: "量表解读",
        url: "/dashboard/interpretation",
        icon: FileText,
      },
    ],
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      {data?.teams?.length > 0 && (
        <SidebarHeader>
          <TeamSwitcher teams={data.teams} />
        </SidebarHeader>
      )}

      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavProjects projects={data.projects} /> */}
      </SidebarContent>
      <SidebarFooter>
        <div className="flex items-center justify-between px-2 py-1">
          <NavUser />
          <LanguageSwitch />
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
