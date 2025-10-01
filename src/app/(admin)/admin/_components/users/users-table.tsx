"use client"

import { useEffect } from "react"
import { DataTable } from "@/components/data-table"
import { useColumns, type User } from "./columns"
import { getUsersAction } from "../../_actions/get-users.action"
import { useServerAction } from "zsa-react"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { PAGE_SIZE_OPTIONS } from "../../admin-constants"
import { useQueryState } from "nuqs"
import { useLanguage } from "@/hooks/useLanguage"

export function UsersTable() {
  const { t } = useLanguage()
  const columns = useColumns()
  const [page, setPage] = useQueryState("page", { defaultValue: "1" })
  const [pageSize, setPageSize] = useQueryState("pageSize", { defaultValue: PAGE_SIZE_OPTIONS[0].toString() })
  const [emailFilter, setEmailFilter] = useQueryState("email", { defaultValue: "" })

  const { execute: fetchUsers, data, error, status } = useServerAction(getUsersAction, {
    onError: () => {
      toast.error(t('admin.failed_to_fetch_users'))
    },
  })

  useEffect(() => {
    fetchUsers({ page: Number.parseInt(page), pageSize: Number.parseInt(pageSize), emailFilter })
  }, [fetchUsers, page, pageSize, emailFilter])

  // Type guard for data
  const usersData = data as { users: User[], totalPages: number, totalCount: number } | undefined

  const handlePageChange = (newPage: number) => {
    setPage((newPage + 1).toString()) // Convert from 0-based to 1-based and store as string
  }

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize.toString())
    setPage("1") // Reset to first page when changing page size
  }

  const handleEmailFilterChange = (value: string) => {
    setEmailFilter(value)
    setPage("1") // Reset to first page when filtering
  }

  const getRowHref = (user: User) => {
    return `/admin/users/${user.id}`
  }

  return (
    <div className="p-6 w-full min-w-0 flex flex-col overflow-hidden">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between shrink-0">
        <h1 className="text-3xl font-bold">{t('admin.users')}</h1>
        <Input
          placeholder={t('admin.filter_emails')}
          type="search"
          value={emailFilter}
          onChange={(event) => handleEmailFilterChange(event.target.value)}
          className="max-w-sm"
        />
      </div>
      <div className="mt-8 flex-1 min-h-0">
        <div className="space-y-4 h-full">
          {status === 'pending' || status === 'idle' ? (
            <div>{t('admin.loading')}</div>
          ) : error ? (
            <div>{t('admin.error_failed_to_fetch_users')}</div>
          ) : !usersData?.users ? (
            <div>{t('admin.no_users_found')}</div>
          ) : (
            <div className="w-full min-w-0">
              <DataTable
                columns={columns}
                data={usersData.users}
                pageCount={usersData.totalPages}
                pageIndex={Number.parseInt(page) - 1}
                pageSize={Number.parseInt(pageSize)}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                totalCount={usersData.totalCount}
                itemNameSingular="user"
                itemNamePlural="users"
                pageSizeOptions={PAGE_SIZE_OPTIONS}
                getRowHref={getRowHref}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
