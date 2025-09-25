'use client'

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Sparkles } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useRouter } from "next/navigation";
import { Badge } from "../ui/badge";

export function HeroSection() {
  const { t } = useLanguage()
  const router = useRouter()
  const onStartSearch = () => {
    router.push('/scales')
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
              {t("landing.hero_title")}
            </h1>

            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              {t("landing.hero_subtitle")}
            </p>
          </div>

          {/* Prominent Search Demo - Google style */}
          <div className="max-w-3xl mx-auto items-center">
            <div className="bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow duration-200">
              <div className="flex relative items-center">
                <Input
                  placeholder={t("landing.search_ecoa_scales")}
                  className="flex-1 px-3 h-16 py-5 text-lg rounded-full bg-transparent border-0 focus:ring-0 focus:outline-hidden"
                />
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 z-30">
                  <Button
                    size="lg"
                    onClick={onStartSearch}
                    variant="outline"
                    className="mr-1 px-8 border-0"
                  >
                    <Search className="ml-4 h-5 w-5 text-gray-400" />
                  </Button>
                </div>
              </div>

            </div>
            <div className="mt-3 flex justify-center items-center">
              <div className="flex gap-1.5 text-stone-600">
                <small className="font-sans antialiased text-sm text-current">Try example:</small>
                <Badge className="ml-2" variant="outline">
                  MMSE-2
                </Badge>
                <Badge className="ml-2" variant="outline">
                  PHQ-9
                </Badge>
                <Badge className="ml-2" variant="outline">
                  EORTC QLQ-C30
                </Badge>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}