"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Brain,
  Clock,
  Users,
  TrendingUp,
  AlertTriangle,
  Info,
  CheckCircle,
  ChevronLeft
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/hooks/useLanguage";
import { FeatureGate } from '@/components/subscription/feature-gate';
import { ENTERPRISE_FEATURES } from '@/constants/plans';

interface InterpretationData {
  scale: {
    id: string;
    name: string;
    acronym: string;
  };
  interpretation: {
    overview: {
      purpose: string;
      administrationTime: number;
      targetPopulation: string;
      clinicalUse: string[];
    };
    scoringGuide: {
      scoringMethod: string;
      cutoffScores: Record<string, any>;
      interpretationLevels: string[];
    };
    practicalConsiderations: {
      administrationTips: string[];
      commonChallenges: string[];
      culturalConsiderations: string[];
      limitationsAndCautions: string[];
    };
    clinicalGuidance: {
      useInScreening: string;
      useInDiagnosis: string;
      useInMonitoring: string;
      useInResearch: string;
    };
    clinicalExamples?: Array<{
      caseTitle: string;
      scenario: string;
      score: string;
      interpretation: string;
      followUp: string;
    }>;
  };
}

interface InterpretationDetailProps {
  scaleId: string;
}

export function InterpretationDetail({ scaleId }: InterpretationDetailProps) {
  const { t } = useLanguage();
  const router = useRouter();
  const [interpretationData, setInterpretationData] = useState<InterpretationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInterpretationData();
  }, [scaleId]);

  const fetchInterpretationData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/scales/${scaleId}/interpretation`);
      const data = await response.json();

      if (data.success) {
        setInterpretationData(data);
      } else {
        setError(data.error || t('insights.interpretation.failed_to_load'));
      }
    } catch (error) {
      console.error(t('insights.interpretation.failed_to_load'), error);
      setError(t('insights.interpretation.network_error'));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="min-h-[100vh] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">{t('insights.interpretation.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !interpretationData) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="min-h-[100vh] flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-500" />
            <p className="text-lg font-medium mb-2">{t('insights.interpretation.load_failed')}</p>
            <p className="text-muted-foreground mb-4">{error || t('insights.interpretation.guide_not_found')}</p>
            <Button onClick={() => router.push("/insights/interpretation")}>
              {t('insights.interpretation.back_to_guide_list')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <FeatureGate
      feature={ENTERPRISE_FEATURES.SCALE_INTERPRETATION}
      featureName={t('features.scale_interpretation', '量表专业解读')}
      featureDescription={t('features.interpretation_desc', '专业的量表解读和案例分析')}
    >
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.push("/insights/interpretation")}>
          <ChevronLeft className="w-4 h-4 mr-2" />
          {t('insights.interpretation.back_to_guide_list')}
        </Button>
      </div>

      <div className="space-y-4">
        {/* 量表概览 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Brain className="w-5 h-5" />
              <span>{interpretationData.scale.name} {t('insights.interpretation.interpretation_guide')}</span>
            </CardTitle>
            <CardDescription>
              {interpretationData.interpretation.overview.purpose}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span className="text-sm">
                  {t('insights.interpretation.administration_time')}: {interpretationData.interpretation.overview.administrationTime} {t('insights.interpretation.minutes')}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-green-600" />
                <span className="text-sm">
                  {t('insights.interpretation.target_population')}: {interpretationData.interpretation.overview.targetPopulation}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-purple-600" />
                <span className="text-sm">
                  {t('insights.interpretation.clinical_use')}: {t('insights.interpretation.screening_assessment')}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 评分指南 */}
        <Card>
          <CardHeader>
            <CardTitle>{t('insights.interpretation.scoring_interpretation')}</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">{t('insights.interpretation.scoring_method')}</h4>
                <p className="text-sm text-muted-foreground">
                  {interpretationData.interpretation.scoringGuide.scoringMethod}
                </p>
              </div>

              {Object.keys(interpretationData.interpretation.scoringGuide.cutoffScores).length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">{t('insights.interpretation.severity_levels')}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {Object.entries(interpretationData.interpretation.scoringGuide.cutoffScores).map(([level, info]: [string, any]) => (
                      <div key={level} className="p-3 bg-gray-50 rounded border">
                        <div className="font-medium text-sm">{level}</div>
                        <div className="text-xs text-muted-foreground">{info.range}</div>
                        <div className="text-xs">{info.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 使用指导 */}
        <Card>
          <CardHeader>
            <CardTitle>{t('insights.interpretation.implementation_guidance')}</CardTitle>
          </CardHeader>

          <CardContent>
            <Tabs defaultValue="administration" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="administration">{t('insights.interpretation.administration_tips')}</TabsTrigger>
                <TabsTrigger value="challenges">{t('insights.interpretation.common_challenges')}</TabsTrigger>
                <TabsTrigger value="cultural">{t('insights.interpretation.cultural_considerations')}</TabsTrigger>
                <TabsTrigger value="limitations">{t('insights.interpretation.limitations_cautions')}</TabsTrigger>
              </TabsList>

              <TabsContent value="administration">
                <ul className="space-y-2 text-sm">
                  {interpretationData.interpretation.practicalConsiderations.administrationTips.map((tip: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 shrink-0" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </TabsContent>

              <TabsContent value="challenges">
                <ul className="space-y-2 text-sm">
                  {interpretationData.interpretation.practicalConsiderations.commonChallenges.map((challenge: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <AlertTriangle className="w-4 h-4 text-orange-600 mr-2 mt-0.5 shrink-0" />
                      {challenge}
                    </li>
                  ))}
                </ul>
              </TabsContent>

              <TabsContent value="cultural">
                <ul className="space-y-2 text-sm">
                  {interpretationData.interpretation.practicalConsiderations.culturalConsiderations.map((consideration: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <Info className="w-4 h-4 text-blue-600 mr-2 mt-0.5 shrink-0" />
                      {consideration}
                    </li>
                  ))}
                </ul>
              </TabsContent>

              <TabsContent value="limitations">
                <ul className="space-y-2 text-sm">
                  {interpretationData.interpretation.practicalConsiderations.limitationsAndCautions.map((limitation: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <AlertTriangle className="w-4 h-4 text-red-600 mr-2 mt-0.5 shrink-0" />
                      {limitation}
                    </li>
                  ))}
                </ul>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* 临床应用指导 */}
        <Card>
          <CardHeader>
            <CardTitle>{t('insights.interpretation.clinical_application_guidance')}</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">{t('insights.interpretation.screening_use')}</h4>
                <p className="text-sm text-muted-foreground">
                  {interpretationData.interpretation.clinicalGuidance.useInScreening}
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">{t('insights.interpretation.diagnostic_support')}</h4>
                <p className="text-sm text-muted-foreground">
                  {interpretationData.interpretation.clinicalGuidance.useInDiagnosis}
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">{t('insights.interpretation.treatment_monitoring')}</h4>
                <p className="text-sm text-muted-foreground">
                  {interpretationData.interpretation.clinicalGuidance.useInMonitoring}
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">{t('insights.interpretation.research_application')}</h4>
                <p className="text-sm text-muted-foreground">
                  {interpretationData.interpretation.clinicalGuidance.useInResearch}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 临床案例 */}
        {interpretationData.interpretation.clinicalExamples && interpretationData.interpretation.clinicalExamples.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>{t('insights.interpretation.clinical_case_examples')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {interpretationData.interpretation.clinicalExamples.map((example, index) => (
                  <Card key={index} className="p-4 bg-blue-50 border-blue-200">
                    <h4 className="font-medium mb-2">{example.caseTitle}</h4>
                    <p className="text-sm mb-2"><strong>{t('insights.interpretation.case_scenario')}</strong> {example.scenario}</p>
                    <p className="text-sm mb-2"><strong>{t('insights.interpretation.case_score')}</strong> {example.score}</p>
                    <p className="text-sm mb-2"><strong>{t('insights.interpretation.case_interpretation')}</strong> {example.interpretation}</p>
                    <p className="text-sm"><strong>{t('insights.interpretation.case_followup')}</strong> {example.followUp}</p>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
    </FeatureGate>
  );
}