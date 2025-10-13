'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, BookOpen, Stethoscope, Scale, Shield, FileText } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

export function FeaturesSection() {
  const { t } = useLanguage();

  const features = [
    {
      icon: Search,
      title: t('landing.feature_ai_search_title'),
      description: t('landing.feature_ai_search_description'),
      color: "text-blue-500 dark:text-blue-400"
    },
    {
      icon: BookOpen,
      title: t('landing.feature_interpretation_title'),
      description: t('landing.feature_interpretation_description'),
      color: "text-green-500 dark:text-green-400"
    },
    {
      icon: Stethoscope,
      title: t('landing.feature_cases_title'),
      description: t('landing.feature_cases_description'),
      color: "text-purple-500 dark:text-purple-400"
    },
    {
      icon: Scale,
      title: t('landing.feature_rich_library_title'),
      description: t('landing.feature_rich_library_description'),
      color: "text-orange-500 dark:text-orange-400"
    },
    {
      icon: Shield,
      title: t('landing.feature_copyright_title'),
      description: t('landing.feature_copyright_description'),
      color: "text-red-500 dark:text-red-400"
    },
    {
      icon: FileText,
      title: t('landing.feature_support_title'),
      description: t('landing.feature_support_description'),
      color: "text-yellow-500 dark:text-yellow-400"
    }
  ];

  return (
    <section id="features" className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
            {t('landing.features_title')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('landing.features_description')}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="border border-border hover:border-primary/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group"
            >
              <CardHeader>
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 group-hover:from-primary/20 group-hover:to-primary/10 mb-4 transition-all duration-300">
                  <feature.icon className={`h-7 w-7 ${feature.color}`} />
                </div>
                <CardTitle className="text-xl font-semibold">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Clinical Search Demo Section */}
        <div className="mt-20 rounded-3xl bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 p-8 lg:p-12 border border-primary/10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-2xl lg:text-3xl font-bold text-foreground">
                  {t('landing.ai_demo_title')}
                </h3>
                <p className="text-base lg:text-lg text-muted-foreground leading-relaxed">
                  {t('landing.ai_demo_description')}
                </p>
              </div>

              <div className="space-y-4">
                <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">{t('landing.user_input')}</p>
                      <p className="font-medium text-foreground">&ldquo;{t('landing.cancer_quality_input')}&rdquo;</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-5 border border-primary/20 shadow-sm">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-primary/80 font-medium mb-1">{t('landing.ai_recommendation')}</p>
                      <p className="font-medium text-foreground">推荐EORTC QLQ-C30和FACT-G量表，专门用于肿瘤患者生活质量评估</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-xl border border-gray-200">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Search className="h-4 w-4 text-primary" />
                    <span className="font-medium">{t('landing.search_time')}</span>
                  </div>

                  <div className="space-y-3">
                    {[
                      { name: "EORTC QLQ-C30", desc: t('landing.eortc_desc'), match: "95%" },
                      { name: "FACT-G", desc: t('landing.fact_desc'), match: "92%" },
                      { name: "SF-36", desc: t('landing.sf36_desc'), match: "88%" }
                    ].map((item) => (
                      <div
                        key={item.name}
                        className="flex items-center justify-between border-2 border-gray-200 p-4 rounded-xl hover:border-primary/50 hover:shadow-md transition-all duration-200 group cursor-pointer"
                      >
                        <div className="flex-1">
                          <p className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">{item.name}</p>
                          <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                        </div>
                        <div className="ml-4 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold group-hover:bg-primary group-hover:text-white transition-all">
                          {item.match}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}