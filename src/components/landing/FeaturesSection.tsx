'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Database, BarChart3, Users, Shield, Zap } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

export function FeaturesSection() {
  const { t } = useLanguage();

  const features = [
    {
      icon: Search,
      title: t('landing.feature_ai_search_title'),
      description: t('landing.feature_ai_search_description'),
      color: "text-blue-600"
    },
    {
      icon: Database,
      title: t('landing.feature_rich_library_title'),
      description: t('landing.feature_rich_library_description'),
      color: "text-green-600"
    },
    {
      icon: BarChart3,
      title: t('landing.feature_data_analysis_title'),
      description: t('landing.feature_data_analysis_description'),
      color: "text-purple-600"
    },
    {
      icon: Users,
      title: t('landing.feature_collaboration_title'),
      description: t('landing.feature_collaboration_description'),
      color: "text-orange-600"
    },
    {
      icon: Shield,
      title: t('landing.feature_security_title'),
      description: t('landing.feature_security_description'),
      color: "text-red-600"
    },
    {
      icon: Zap,
      title: t('landing.feature_deployment_title'),
      description: t('landing.feature_deployment_description'),
      color: "text-yellow-600"
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <Card key={feature.title} className="border border-border hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-secondary/50 mb-4">
                  <feature.icon className={`h-6 w-6 ${feature.color}`} />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* AI Search Demo Section */}
        <div className="mt-20 rounded-2xl p-8 lg:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-foreground">
                  {t('landing.ai_demo_title')}
                </h3>
                <p className="text-muted-foreground">
                  {t('landing.ai_demo_description')}
                </p>
              </div>

              <div className="space-y-3">
                <div className="bg-white rounded-lg p-4 border border-border shadow-sm">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                    <div>
                      <p className="text-sm text-muted-foreground">{t('landing.user_input')}</p>
                      <p className="font-medium">&ldquo;{t('landing.cancer_quality_input')}&rdquo;</p>
                    </div>
                  </div>
                </div>

                <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                    <div>
                      <p className="text-sm text-muted-foreground">{t('landing.ai_recommendation')}</p>
                      <p className="font-medium">{t('landing.ai_cancer_recommendation')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-xl p-6 shadow-lg border border-border">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Search className="h-4 w-4" />
                    <span>{t('landing.search_time')}</span>
                  </div>

                  <div className="space-y-3">
                    {[
                      { name: "EORTC QLQ-C30", desc: t('landing.eortc_desc'), match: "95%" },
                      { name: "FACT-G", desc: t('landing.fact_desc'), match: "92%" },
                      { name: "SF-36", desc: t('landing.sf36_desc'), match: "88%" }
                    ].map((item) => (
                      <div key={item.name} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{item.name}</p>
                          <p className="text-xs text-muted-foreground">{item.desc}</p>
                        </div>
                        <div className="text-xs text-primary font-medium">{item.match}</div>
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