"use client"

import { User, Shield, Monitor, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"

const settingsMenuItems = [
  { icon: User, label: "个人资料", href: "/settings" },
  { icon: Shield, label: "安全设置", href: "/settings/security" },
  { icon: Monitor, label: "会话管理", href: "/settings/sessions" },
  { icon: Lock, label: "修改密码", href: "/forgot-password" },
]

export function SettingsSidebar() {
  return (
    <Card className="w-64">
      <CardContent className="p-4">
        <div className="space-y-2">
          {settingsMenuItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button variant="ghost" className="w-full justify-start">
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
              </Button>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}