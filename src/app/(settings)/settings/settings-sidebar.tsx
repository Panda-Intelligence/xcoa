"use client"

import { User, Shield, Monitor, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { useLanguage } from "@/hooks/useLanguage"

export function SettingsSidebar() {
  const { t } = useLanguage()

  const settingsMenuItems = [
    { icon: User, label: t("settings.profile"), href: "/settings" },
    { icon: Shield, label: t("settings.security_settings"), href: "/settings/security" },
    { icon: Monitor, label: t("settings.session_management"), href: "/settings/sessions" },
    { icon: Lock, label: t("settings.change_password"), href: "/forgot-password" },
  ]

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