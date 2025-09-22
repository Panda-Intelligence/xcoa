"use client"

import { User, Shield, Monitor, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"

const settingsMenuItems = [
  { icon: User, label: "个人资料", href: "/settings" },
  { icon: Shield, label: "安全设置", href: "/settings/security" },
  { icon: Monitor, label: "会话管理", href: "/settings/sessions" },
  { icon: Lock, label: "修改密码", href: "/forgot-password" },
]

export function SettingsSidebar() {
  return (
    <SidebarMenu className="space-y-2">
      {settingsMenuItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton asChild>
            <Link href={item.href}>
              <Button variant="ghost" className="w-full justify-start">
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
              </Button>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  )
}