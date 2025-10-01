"use client"

import { User, Shield, Monitor, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/hooks/useLanguage"
import Link from "next/link"
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"

export function BillingSidebar() {
  const { t } = useLanguage();

  const settingsMenuItems = [
    { icon: Shield, label: t('billing.credits'), href: "/billing/credits" },
    { icon: Monitor, label: t('billing.transactions'), href: "/billing/transactions" },
    { icon: Lock, label: t('billing.invoice'), href: "/billing/invoice" },
  ];

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