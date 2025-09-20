'use client'

import { PageHeader } from "@/components/page-header"
import { UsersTable } from "./_components/users/users-table"
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { useLanguage } from "@/hooks/useLanguage"

export default function AdminPage() {
  const { t } = useLanguage()

  return (
    <NuqsAdapter>
      <PageHeader items={[{ href: "/admin", label: t("user.user_management") }]} />
      <UsersTable />
    </NuqsAdapter>
  )
}
