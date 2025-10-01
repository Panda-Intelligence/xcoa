"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { MarketplaceCard } from "@/components/marketplace-card";
import { useLanguage } from "@/hooks/useLanguage";

interface Component {
  id: string;
  name: string;
  description: string;
  credits: number;
  containerClass?: string;
}

interface MarketplacePageClientProps {
  components: Component[];
  purchasedItems: Set<string>;
}

export function MarketplacePageClient({ components, purchasedItems }: MarketplacePageClientProps) {
  const { t } = useLanguage();

  return (
    <div className="container mx-auto px-5 pb-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mt-4">{t("marketplace.title", "Component Marketplace")}</h1>
        <p className="text-muted-foreground mt-2">
          {t("marketplace.description", "Purchase and use our premium components using your credits")}
        </p>
      </div>

      <Alert
        color="warning"
        title={t("marketplace.demo_feature_title", "Demo Template Feature")}
        className="mb-6"
      >
        <AlertDescription>
          {t("marketplace.demo_feature_description", "This marketplace page demonstrates how to implement a credit-based billing system in your SaaS application. Feel free to use this as a starting point and customize it for your specific needs.")}
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {components.map((component) => (
          <MarketplaceCard
            key={component.id}
            id={component.id}
            name={component.name}
            description={component.description}
            credits={component.credits}
            containerClass={component.containerClass}
            isPurchased={purchasedItems.has(`COMPONENT:${component.id}`)}
          />
        ))}
      </div>
    </div>
  );
}