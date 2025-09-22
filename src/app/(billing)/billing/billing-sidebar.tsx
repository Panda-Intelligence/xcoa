"use client"

import { User, Shield, Monitor, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"

const settingsMenuItems = [
  { icon: Shield, label: "Credits", href: "/billing/credits" },
  { icon: Monitor, label: "Transactions", href: "/billing/transactions" },
  { icon: Lock, label: "Invoice", href: "/billing/invoice" },
]

export function BillingSidebar() {
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