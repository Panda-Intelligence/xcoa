"use client"

import type { ComponentType } from "react"
import type { Route } from 'next'
import {
  Users,
  Shield,
  SquareTerminal,
  FileText,
  Scale,
  Beaker,
  MessageSquare,
  Copyright,
  BookOpen,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarGroup,
} from "@/components/ui/sidebar"
import { useLanguage } from "@/hooks/useLanguage"
import { useRouter } from "next/navigation"

export type NavItem = {
  title: string
  url: Route
  icon?: ComponentType
}

export type NavMainItem = NavItem & {
  isActive?: boolean
  items?: NavItem[]
}

export function AdminSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { t } = useLanguage();
  const router = useRouter();
  const adminNavItems: NavMainItem[] = [
    {
      title: t('sidebar.dashboard'),
      url: "/admin/dashboard",
      icon: SquareTerminal,
      isActive: true,
    },
    {
      title: t('admin.users'),
      url: "/admin",
      icon: Users,
      isActive: true,
    },
    {
      title: t('admin.scales'),
      url: "/admin/scales" as Route,
      icon: Scale,
      isActive: true,
    },
    {
      title: t('admin.copyright_holders_menu'),
      url: "/admin/copyright-holders" as Route,
      icon: Copyright,
      isActive: true,
    },
    {
      title: t('admin.interpretations.dashboard.title'),
      url: "/admin/interpretations" as Route,
      icon: BookOpen,
      isActive: true,
      items: [
        {
          title: t('admin.interpretations.review.title'),
          url: "/admin/interpretations" as Route,
        },
        {
          title: t('admin.interpretations.dashboard.title'),
          url: "/admin/interpretations/dashboard" as Route,
        },
      ],
    },
    {
      title: t('admin.clinical_cases'),
      url: "/admin/cases" as Route,
      icon: Beaker,
      isActive: true,
    },
    {
      title: t('admin.copyright_tickets'),
      url: "/admin/tickets" as Route,
      icon: MessageSquare,
      isActive: true,
    },
    {
      title: t('admin.invoices'),
      url: "/admin/invoices" as Route,
      icon: FileText,
      isActive: true,
    },
  ]

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                className="pointer-events-none"
                tooltip={t('admin.panel')}
                onClick={() => router.push('/dashboard')}
              >
                <Shield size={24} />
                <span className="text-lg font-bold">{t('admin.panel')}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        <NavMain title={t('admin.title')} items={adminNavItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
