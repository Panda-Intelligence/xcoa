'use client';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useLanguage } from "@/hooks/useLanguage"
import React from "react"

interface BreadcrumbItem {
  href: string
  label: string
}

interface PageHeaderProps {
  items: BreadcrumbItem[]
}

export function PageHeader({ items }: PageHeaderProps) {
  const { t } = useLanguage();

  return (
    <header className="sticky top-0 z-40 bg-background border-b border-border flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            {items.map((item, index) => (
              <React.Fragment key={item.href}>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href={item.href}>
                    {t(item.label)}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                {index < items.length - 1 && (
                  <BreadcrumbSeparator className="hidden md:block" />
                )}
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </header>
  )
}
