import { PageHeader } from "@/components/page-header"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { COMPONENTS } from "./components-catalog"
import { MarketplaceCard } from "@/components/marketplace-card"
import { getSessionFromCookie } from "@/utils/auth"
import { getUserPurchasedItems } from "@/utils/credits"
import { MarketplacePageClient } from "./marketplace-client"

export default async function MarketplacePage() {
  const session = await getSessionFromCookie();
  const purchasedItems = session ? await getUserPurchasedItems(session.userId) : new Set();

  return (
    <>
      <PageHeader
        items={[
          {
            href: "/marketplace",
            label: "Marketplace"
          }
        ]}
      />
      <MarketplacePageClient components={COMPONENTS} purchasedItems={purchasedItems} />
    </>
  )
}
