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
import { LanguageToggle, useLanguage } from "@/hooks/useLanguage"
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
  system: NavMainItem[]
}

// TODO Add a theme switcher
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { session } = useSessionStore();
  const { t } = useLanguage();
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
      name: session?.user?.firstName || "",
      email: session?.user?.email || '',
    },
    teams: formattedTeams,
    navMain: [
      {
        title: t('sidebar.dashboard'),
        url: "/dashboard",
        icon: SquareTerminal,
        isActive: true,
      },
      {
        title: t('sidebar.ecoa_scales'),
        url: "/dashboard/scales#" as Route,
        icon: Search,
        items: [
          {
            title: t('sidebar.scale_search'),
            url: "/dashboard/scales" as Route,
          },
          {
            title: t('sidebar.my_favorites'),
            url: "/dashboard/scales/favorites" as Route,
          },
          {
            title: t('sidebar.contact_tickets'),
            url: "/dashboard/copyright/tickets" as Route,
          }
        ],
      },
      {
        title: t('sidebar.scale_interpretation'),
        url: "/dashboard/interpretation#" as Route,
        icon: BookOpen,
        items: [
          {
            title: t('sidebar.interpretation_guide'),
            url: "/dashboard/interpretation" as Route,
          },
          {
            title: t('sidebar.clinical_cases'),
            url: "/dashboard/interpretation/cases" as Route,
          },
        ],
      },

    ],
    system: [
      {
        title: t('sidebar.team_management'),
        url: "/dashboard/teams" as Route,
        icon: Users,
      },
      {
        title: t('sidebar.billing'),
        url: "/dashboard/billing" as Route,
        icon: CreditCard,
      },
      {
        title: t('sidebar.settings'),
        url: "/settings" as Route,
        icon: Settings2,
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
        <NavMain title="Platform" items={data.navMain} />
        <NavMain title="System" collapsible={true} items={data.system} />
      </SidebarContent>
      <SidebarFooter>
        <div className="flex items-center justify-between px-2 py-1">
          <NavUser />
          <LanguageToggle />
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
