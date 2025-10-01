"use client"

import { useEffect, useState } from "react"
import { getUserData } from "../../_actions/get-user.action"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { format } from "date-fns"
import { getInitials } from "@/utils/name-initials"
import { notFound, useRouter } from "next/navigation"
import { useLanguage } from "@/hooks/useLanguage"
import {
  Calendar,
  Mail,
  Shield,
  CreditCard,
  MapPin,
  Smartphone,
  Globe,
  Key
} from "lucide-react"
import type { InferSelectModel } from "drizzle-orm"
import type { creditTransactionTable, passKeyCredentialTable } from "@/db/schema"


type CreditTransaction = InferSelectModel<typeof creditTransactionTable>
type PasskeyCredential = InferSelectModel<typeof passKeyCredentialTable>

interface UserDetailPageProps {
  params: Promise<{ userId: string }>
}


export default function UserDetailPage({ params }: UserDetailPageProps) {
  const { t } = useLanguage()
  const router = useRouter()
  const [data, setData] = useState<Awaited<ReturnType<typeof getUserData>> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resolvedParams = await params
        const { userId } = resolvedParams
        const result = await getUserData(userId)
        if (!result) {
          setError(true)
        } else {
          setData(result)
        }
      } catch {
        setError(true)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [params])

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">{t('admin.loading')}</div>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-destructive mb-2">{t('admin.user_not_found')}</h1>
          <p className="text-muted-foreground mb-4">{t('admin.user_not_found_message')}</p>
          <button 
            onClick={() => router.push('/admin')}
            className="text-primary hover:underline"
          >
            {t('common.back')}
          </button>
        </div>
      </div>
    )
  }

  const { user, transactions, passkeys } = data

  const displayName = user?.firstName && user?.lastName
    ? `${user.firstName} ${user.lastName}`
    : user.email



  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <PageHeader
        items={[
          { href: "/admin", label: t('admin.title') },
          { href: "/admin", label: t('admin.users') },
          { href: `/admin/users/${user.id}`, label: displayName || t('admin.user_details') }
        ]}
      />

      <div className="grid gap-6 mt-6">
        {/* User Profile Card */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user.avatar || ""} alt={displayName || ""} />
                <AvatarFallback className="text-lg">
                  {getInitials(`${user.firstName || ''} ${user.lastName || ''}`.trim())}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <CardTitle className="text-2xl">{displayName}</CardTitle>
                <CardDescription className="text-base mt-1">
                  User ID: {user.id}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                  {user.role === "admin" ? t('admin.admin_role') : t('admin.user_role')}
                </Badge>
                <Badge variant={user.emailVerified ? "default" : "destructive"}>
                  {user.emailVerified ? t('admin.verified') : t('admin.unverified')}
                </Badge>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                {t('admin.contact_information')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">{t('admin.email')}</label>
                <p className="text-sm">{user.email || t('admin.no_email')}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">{t('admin.first_name')}</label>
                <p className="text-sm">{user.firstName || t('admin.not_provided')}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">{t('admin.last_name')}</label>
                <p className="text-sm">{user.lastName || t('admin.not_provided')}</p>
              </div>
              {user.signUpIpAddress && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {t('admin.sign_up_ip_address')}
                  </label>
                  <p className="text-sm font-mono">{user.signUpIpAddress}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Account Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                {t('admin.account_details')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {t('admin.created')}
                </label>
                <p className="text-sm">{format(user.createdAt, "PPpp")}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">{t('admin.last_updated')}</label>
                <p className="text-sm">{format(user.updatedAt, "PPpp")}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">{t('admin.password')}</label>
                <p className="text-sm">{user.passwordHash ? t('admin.set') : t('admin.not_set')}</p>
              </div>
              {user.googleAccountId && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <Globe className="h-3 w-3" />
                    {t('admin.google_account')}
                  </label>
                  <p className="text-sm font-mono">{user.googleAccountId}</p>
                </div>
              )}
              {user.emailVerified && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">{t('admin.email_verified')}</label>
                  <p className="text-sm">{format(user.emailVerified, "PPpp")}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Credits Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                {t('admin.credits')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">{t('admin.current_credits')}</label>
                <p className="text-lg font-semibold">{user.currentCredits}</p>
              </div>
              {user.lastCreditRefreshAt && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">{t('admin.last_credit_refresh')}</label>
                  <p className="text-sm">{format(user.lastCreditRefreshAt, "PPpp")}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Passkeys */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                {t('admin.passkeys_count', { count: passkeys.length })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {passkeys.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t('admin.no_passkeys_configured')}</p>
              ) : (
                <div className="space-y-3">
                  {passkeys.map((passkey: PasskeyCredential) => (
                    <div key={passkey.id} className="border rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{t('admin.passkey')}</span>
                        <Badge variant="secondary" className="text-xs">
                          {format(passkey.createdAt, "MMM dd, yyyy")}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                        <div>
                          <span className="font-medium">{t('admin.counter')}:</span> {passkey.counter}
                        </div>
                        {passkey.aaguid && (
                          <div>
                            <span className="font-medium">{t('admin.aaguid')}:</span> {passkey.aaguid.slice(0, 8)}...
                          </div>
                        )}
                      </div>
                      {passkey.userAgent && (
                        <div className="text-xs text-muted-foreground">
                          <span className="font-medium flex items-center gap-1">
                            <Smartphone className="h-3 w-3" />
                            {t('admin.device')}:
                          </span>
                          <p className="mt-1 truncate">{passkey.userAgent}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Credit Transactions */}
        {transactions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>{t('admin.recent_credit_transactions')}</CardTitle>
              <CardDescription>
                {t('admin.last_transactions', { count: transactions.length })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {transactions.map((transaction: CreditTransaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={transaction.type === 'PURCHASE' ? 'default' : 'secondary'}>
                          {transaction.type}
                        </Badge>
                        {transaction.paymentIntentId && (
                          <span className="text-xs text-muted-foreground font-mono">
                            {transaction.paymentIntentId}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {format(transaction.createdAt, "PPpp")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {transaction.type === 'PURCHASE' ? '+' : ''}
                        {transaction.amount} credits
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
