"use client"

import type { ComponentType } from "react"
import type { Route } from 'next'
import {
  Users,
  Shield,
  SquareTerminal,
  FileText,
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
      title: "Users",
      url: "/admin",
      icon: Users,
      isActive: true,
    },
    {
      title: "Invoices",
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
                tooltip="Admin Panel"
                onClick={() => router.push('/dashboard')}
              >
                <Shield size={24} />
                <span className="text-lg font-bold">Admin Panel</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        <NavMain title="Admin" items={adminNavItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
