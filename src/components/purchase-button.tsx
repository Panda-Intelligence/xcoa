"use client"

import { toast } from "sonner"
import ShinyButton from "@/components/ui/shiny-button"
import { useServerAction } from "zsa-react"
import { purchaseAction } from "@/app/(dashboard)/marketplace/purchase.action"
import type { PURCHASABLE_ITEM_TYPE } from "@/db/schema"
import { useRouter } from "next/navigation"
import { useLanguage } from "@/hooks/useLanguage"

interface PurchaseButtonProps {
  itemId: string
  itemType: keyof typeof PURCHASABLE_ITEM_TYPE
}

export default function PurchaseButton({ itemId, itemType }: PurchaseButtonProps) {
  const router = useRouter()
  const { t } = useLanguage()

  const { execute: handlePurchase, isPending } = useServerAction(purchaseAction, {
    onError: (error) => {
      toast.dismiss();
      toast.error(error.err?.message || t('errors.purchase_failed'))
    },
    onStart: () => {
      toast.loading(t('common.processing'))
    },
    onSuccess: () => {
      toast.dismiss()
      toast.success(t('billing.payment_successful'))
    },
  })

  return (
    <ShinyButton
      onClick={() => {
        handlePurchase({ itemId, itemType }).then(() => {
          router.refresh()
        })
      }}
      disabled={isPending}
    >
      {isPending ? t('common.processing') : t('billing.purchase_now')}
    </ShinyButton>
  )
}
