'use client';

import { FAQ } from "@/components/landing/faq";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { InsightsPreview } from "@/components/landing/InsightsPreview";
import { PricingSection } from "@/components/landing/PricingSection";
import { HeroSection } from "@/components/landing/HeroSection";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const handleViewInsights = () => {
    router.push('/scales/search');
  };

  return (
    <main>
      <HeroSection />
      <FeaturesSection />
      <InsightsPreview onViewInsights={handleViewInsights} />
      <PricingSection />
      <FAQ />
    </main>
  );
}
