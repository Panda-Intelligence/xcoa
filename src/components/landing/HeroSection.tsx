'use client'

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Sparkles } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

export function HeroSection() {
  const { t } = useLanguage()

  const onStartSearch = () => {

  }
  return (
    <section className="py-20 bg-linear-to-br from-background to-secondary/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Simplified single column layout focusing on search */}
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-6">
            <div className="inline-flex items-center px-4 py-2 bg-primary/10 rounded-full">
              <Sparkles className="h-4 w-4 text-primary mr-2" />
              <span className="text-sm text-primary">{t("landing.ai_intelligent_search")}</span>
            </div>

            <h1 className="text-4xl lg:text-6xl font-bold text-foreground leading-tight">
              {t("landing.professional_ecoa_scale_ai_search_platform")}
            </h1>

            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              {t("landing.comprehensive_ecoa_scale_library_description")}
            </p>
          </div>

          {/* Prominent Search Demo - Google style */}
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow duration-200 p-2">
              <div className="flex items-center">
                <Search className="ml-4 h-5 w-5 text-gray-400" />
                <Input
                  placeholder={t("landing.search_ecoa_scales")}
                  className="flex-1 px-4 py-3 text-base bg-transparent border-0 focus:ring-0 focus:outline-hidden"
                  readOnly
                />
                <Button
                  size="lg"
                  onClick={onStartSearch}
                  className="mr-1 px-8 bg-gray-100 hover:bg-gray-200 text-gray-700 border-0"
                >
                  {t("landing.ecoa_search")}
                </Button>
              </div>
            </div>
          </div>

          {/* Stats in a more compact layout */}
          <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto">
            <div className="text-center">
              <div className="font-semibold text-2xl text-primary">500+</div>
              <div className="text-sm text-muted-foreground">{t("landing.professional_scales")}</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-2xl text-primary">50+</div>
              <div className="text-sm text-muted-foreground">{t("landing.disease_areas")}</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-2xl text-primary">AI</div>
              <div className="text-sm text-muted-foreground">{t("landing.ai_intelligent_recommendation")}</div>
            </div>
          </div>

          {/* Simplified CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={onStartSearch} className="px-8">
              {t("landing.start_free_search")}
            </Button>
            <Button variant="outline" size="lg" className="px-8">
              {t("landing.view_demo")}
            </Button>
          </div>

          {/* Quick search suggestions */}
          <div className="pt-4">
            <div className="text-sm text-muted-foreground mb-3">{t("landing.quick_search")}：</div>
            <div className="flex flex-wrap justify-center gap-2">
              {[
                "MMSE-2", "PHQ-9", "GAD-7", "EORTC QLQ-C30", "SF-36"
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={onStartSearch}
                  className="text-sm text-blue-600 hover:underline px-3 py-1 rounded-full hover:bg-blue-50"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}