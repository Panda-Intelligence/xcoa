"use client"

import { ChevronRight } from "lucide-react"
import { usePathname } from "next/navigation"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar"
import Link from "next/link"
import type { Route } from "next"
import type { NavMainItem } from "./app-sidebar"

type Props = {
  collapsible?: boolean
  title: string
  items: NavMainItem[]
}

export function NavMain({
  collapsible,
  title,
  items,
}: Props) {
  const { setOpenMobile } = useSidebar();
  const pathname = usePathname();

  // 检查路径是否匹配
  const isActive = (url: string) => {
    // 精确匹配
    if (pathname === url) return true;

    return false;
  };

  // 检查是否有子项处于活动状态
  const hasActiveChild = (item: NavMainItem) => {
    if (!item.items?.length) return false;
    return item.items.some(subItem => isActive(subItem.url));
  };

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{title}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          // If there are no child items, render a direct link
          if (!item.items?.length) {
            const itemIsActive = isActive(item.url);

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild tooltip={item.title} isActive={itemIsActive}>
                  <Link
                    href={item.url as Route}
                    onClick={() => setOpenMobile(false)}
                  >
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          }

          if (!collapsible) {
            const itemIsActive = isActive(item.url);

            return (<SidebarMenuItem key={item.title}>
              <SidebarMenuButton tooltip={item.title} isActive={itemIsActive}>
                {item.icon && <item.icon />}
                <span>{item.title}</span>
              </SidebarMenuButton>
              <SidebarMenuSub>
                {item.items?.map((subItem) => {
                  const subItemIsActive = isActive(subItem.url);

                  return (
                    <SidebarMenuSubItem key={subItem.title}>
                      <SidebarMenuSubButton asChild isActive={subItemIsActive}>
                        {subItem.url.startsWith('/') ? (
                          <Link
                            href={subItem.url as Route}
                            onClick={() => setOpenMobile(false)}
                          >
                            <span>{subItem.title}</span>
                          </Link>
                        ) : (
                          <a
                            href={subItem.url}
                            onClick={() => setOpenMobile(false)}
                          >
                            <span>{subItem.title}</span>
                          </a>
                        )}
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  )
                })}
              </SidebarMenuSub>
            </SidebarMenuItem>)
          }
          // Otherwise render the collapsible menu
          const hasActiveSubItem = hasActiveChild(item);
          const itemIsActive = isActive(item.url);

          return (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={hasActiveSubItem}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip={item.title} isActive={itemIsActive}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items?.map((subItem) => {
                      const subItemIsActive = isActive(subItem.url);

                      return (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild isActive={subItemIsActive}>
                            {subItem.url.startsWith('/') ? (
                              <Link
                                href={subItem.url as Route}
                                onClick={() => setOpenMobile(false)}
                              >
                                <span>{subItem.title}</span>
                              </Link>
                            ) : (
                              <a
                                href={subItem.url}
                                onClick={() => setOpenMobile(false)}
                              >
                                <span>{subItem.title}</span>
                              </a>
                            )}
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      )
                    })}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
