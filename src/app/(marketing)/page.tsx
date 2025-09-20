import type { Metadata } from "next";

import { FAQ } from "@/components/landing/faq";
import { SITE_NAME, SITE_DESCRIPTION } from "@/constants";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { InsightsPreview } from "@/components/landing/InsightsPreview";
import { PricingSection } from "@/components/landing/PricingSection";
import { HeroSection } from "@/components/landing/HeroSection";

export const metadata: Metadata = {
  title: SITE_NAME,
  description: SITE_DESCRIPTION,
};

export default function Home() {
  return (
    <main>
      <HeroSection />
      <FeaturesSection />
      <InsightsPreview />
      <PricingSection />
      <FAQ />
    </main>
  );
}
